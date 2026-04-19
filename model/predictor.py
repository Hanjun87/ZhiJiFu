"""
皮肤疾病预测API
"""

import os
import sys
import json
import time
from pathlib import Path

import torch
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image
import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from models_lib.modeling_finetune import panderm_base_patch16_224


class PredictionResult:
    def __init__(self, disease, confidence, level, coarse_class, coarse_confidence,
                 fine_class=None, fine_confidence=None, stage2_used=False, inference_time_ms=0.0):
        self.disease = disease
        self.confidence = confidence
        self.level = level
        self.coarse_class = coarse_class
        self.coarse_confidence = coarse_confidence
        self.fine_class = fine_class
        self.fine_confidence = fine_confidence
        self.stage2_used = stage2_used
        self.inference_time_ms = inference_time_ms

    def to_dict(self):
        result = {
            "disease": self.disease,
            "confidence": round(self.confidence, 4),
            "level": self.level,
            "coarse_class": self.coarse_class,
            "coarse_confidence": round(self.coarse_confidence, 4),
            "stage2_used": self.stage2_used,
            "inference_time_ms": round(self.inference_time_ms, 2)
        }
        if self.fine_class:
            result["fine_class"] = self.fine_class
            result["fine_confidence"] = round(self.fine_confidence, 4)
        return result

    def to_json(self):
        return json.dumps(self.to_dict(), ensure_ascii=False, indent=2)


class SkinDiseasePredictor:
    def __init__(self, models_dir=None, mappings_dir=None, device=None):
        # 自动选择设备
        if device:
            self.device = torch.device(device)
        else:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

        base_dir = Path(__file__).parent
        if models_dir:
            self.models_dir = Path(models_dir)
        else:
            self.models_dir = base_dir / 'models'

        if mappings_dir:
            self.mappings_dir = Path(mappings_dir)
        else:
            self.mappings_dir = base_dir / 'mappings'

        # stage2配置 - 哪些大类启用细分类
        self.stage2_config = {
            'Vasculitis Photos': (True, 0.6),
            'Melanoma Skin Cancer Nevi and Moles': (True, 0.6),
            'Acne and Rosacea Photos': (True, 0.7),
            'Warts Molluscum and other Viral Infections': (True, 0.7),
            'Tinea Ringworm Candidiasis and other Fungal Infections': (True, 0.7),
            'Psoriasis pictures Lichen Planus and related diseases': (True, 0.7),
            'Seborrheic Keratoses and other Benign Tumors': (True, 0.7),
            'Herpes HPV and other STDs Photos': (True, 0.8),
            'Vascular Tumors': (True, 0.8),
            'Actinic Keratosis Basal Cell Carcinoma and other Malignant Lesions': (True, 0.8),
            'Lupus and other Connective Tissue diseases': (True, 0.8),
            # 以下类别禁用（准确率不行）
            'Systemic Disease': (False, 1.0),
            'Light Diseases and Disorders of Pigmentation': (False, 1.0),
            'Exanthems and Drug Eruptions': (False, 1.0),
            'Eczema Photos': (False, 1.0),
            'Scabies Lyme Disease and other Infestations and Bites': (False, 1.0),
            'Bullous Disease Photos': (False, 1.0),
            'Nail Fungus and other Nail Disease': (False, 1.0),
        }

        # 图像预处理
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                               std=[0.229, 0.224, 0.225])
        ])

        self._load_models()

    def _load_models(self):
        # 加载stage1模型
        stage1_path = self.models_dir / 'stage1_best.pth'
        if not stage1_path.exists():
            raise FileNotFoundError(f"找不到stage1模型: {stage1_path}")

        checkpoint = torch.load(stage1_path, map_location=self.device, weights_only=True)
        self.stage1_model = panderm_base_patch16_224(num_classes=23, drop_path_rate=0.1)
        self.stage1_model.load_state_dict(checkpoint['model_state_dict'])
        self.stage1_model.eval().to(self.device)

        # 加载大类映射
        with open(self.mappings_dir / 'stage1_mapping.json', 'r', encoding='utf-8') as f:
            coarse_mapping = json.load(f)
        self.idx_to_coarse = {v: k for k, v in coarse_mapping.items()}

        # stage2模型缓存
        self.stage2_models = {}
        self.stage2_mappings = {}

        enabled = sum(1 for v in self.stage2_config.values() if v[0])
        print(f"[Predictor] Stage1模型加载完成，Stage2启用{enabled}/18个类别")

    def _load_stage2(self, coarse_class):
        # 已经加载过就直接返回
        if coarse_class in self.stage2_models:
            return self.stage2_models[coarse_class], self.stage2_mappings[coarse_class]

        config = self.stage2_config.get(coarse_class, (False, 1.0))
        if not config[0]:  # 没启用
            return None, None

        # 处理文件名
        coarse_safe = coarse_class.replace(' ', '_').replace('/', '_')
        model_path = self.models_dir / f'{coarse_safe}.pth'

        if not model_path.exists():
            return None, None

        # 加载模型
        checkpoint = torch.load(model_path, map_location=self.device, weights_only=True)
        num_classes = checkpoint['num_classes']

        model = panderm_base_patch16_224(num_classes=num_classes, drop_path_rate=0.1)
        model.load_state_dict(checkpoint['model_state_dict'])
        model.eval().to(self.device)

        # 加载映射文件
        mapping_file = self.mappings_dir / f'stage2_{coarse_safe}_mapping.json'
        with open(mapping_file, 'r', encoding='utf-8') as f:
            fine_mapping = json.load(f)
        idx_to_fine = {v: k for k, v in fine_mapping.items()}

        self.stage2_models[coarse_class] = model
        self.stage2_mappings[coarse_class] = idx_to_fine

        return model, idx_to_fine

    @torch.no_grad()
    def predict(self, image):
        start_time = time.time()

        # 处理不同类型的输入
        if isinstance(image, str):
            image = Image.open(image).convert('RGB')
        elif isinstance(image, np.ndarray):
            image = Image.fromarray(image).convert('RGB')

        tensor = self.transform(image).unsqueeze(0).to(self.device)

        # stage1推理
        device_type = 'cuda' if self.device.type == 'cuda' else 'cpu'
        with torch.amp.autocast(device_type):
            outputs = self.stage1_model(tensor)
            probs = F.softmax(outputs, dim=1)

        coarse_conf, coarse_pred = torch.max(probs, dim=1)
        coarse_idx = coarse_pred.item()
        coarse_conf = coarse_conf.item()
        coarse_class = self.idx_to_coarse[coarse_idx]

        # 默认结果
        result = PredictionResult(
            disease=coarse_class,
            confidence=coarse_conf,
            level='coarse',
            coarse_class=coarse_class,
            coarse_confidence=coarse_conf,
            stage2_used=False
        )

        # 检查是否需要stage2
        stage2_model, idx_to_fine = self._load_stage2(coarse_class)
        threshold = self.stage2_config[coarse_class][1]

        if stage2_model and coarse_conf >= threshold:
            # stage2推理
            with torch.amp.autocast(device_type):
                outputs = stage2_model(tensor)
                probs = F.softmax(outputs, dim=1)

            fine_conf, fine_pred = torch.max(probs, dim=1)
            fine_conf = fine_conf.item()
            fine_idx = fine_pred.item()
            fine_class = idx_to_fine[fine_idx]

            # 更新结果
            result.disease = fine_class
            result.confidence = fine_conf
            result.level = 'fine'
            result.fine_class = fine_class
            result.fine_confidence = fine_conf
            result.stage2_used = True

        result.inference_time_ms = (time.time() - start_time) * 1000
        return result

    @torch.no_grad()
    def predict_batch(self, images):
        """批量预测"""
        results = []
        for img in images:
            results.append(self.predict(img))
        return results

    def get_model_info(self):
        """获取模型信息"""
        enabled = sum(1 for v in self.stage2_config.values() if v[0])
        return {
            "stage1_classes": 23,
            "stage2_enabled": enabled,
            "stage2_total": len(self.stage2_config),
            "device": str(self.device),
        }


# 快捷函数
def predict_image(image_path):
    """快速预测一张图片"""
    predictor = SkinDiseasePredictor()
    result = predictor.predict(image_path)
    return result.to_json()


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        print(predict_image(image_path))
    else:
        # 显示模型信息
        predictor = SkinDiseasePredictor()
        info = predictor.get_model_info()
        print(json.dumps(info, ensure_ascii=False, indent=2))
