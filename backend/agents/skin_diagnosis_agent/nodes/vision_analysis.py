"""
第一层：Vision模型节点
多模态视觉分析：使用 model 进行皮肤疾病预测

基于PanDerm模型的二阶段层级分类系统
- Stage 1: 23大类粗分类
- Stage 2: 细分类（11个高准确率类别启用）
"""

import json
import os
import sys
import base64
import io
from typing import Dict, Any
from pathlib import Path

import numpy as np
from PIL import Image

# 添加父目录到路径以支持绝对导入
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.state import DiagnosisState

# 添加 model 到路径
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent.parent  # 回到 skinAI 根目录
MODEL_PATH = PROJECT_ROOT / "model"
sys.path.insert(0, str(MODEL_PATH))

# 导入生产级预测器
try:
    from predictor import SkinDiseasePredictor, PredictionResult
    PREDICTOR_AVAILABLE = True
    print("[Vision Analysis] Using model predictor")
except ImportError as e:
    print(f"[Vision Analysis] Warning: SkinDiseasePredictor not available: {e}")
    PREDICTOR_AVAILABLE = False

# 全局预测器实例（单例模式）
_predictor_instance = None


def get_predictor():
    """获取预测器实例（单例模式）"""
    global _predictor_instance
    if _predictor_instance is None and PREDICTOR_AVAILABLE:
        try:
            models_dir = MODEL_PATH / "models"
            mappings_dir = MODEL_PATH / "mappings"
            _predictor_instance = SkinDiseasePredictor(
                models_dir=str(models_dir),
                mappings_dir=str(mappings_dir)
            )
            print(f"[Vision Analysis] Predictor initialized with models from {models_dir}")
        except Exception as e:
            print(f"[Vision Analysis] Error initializing predictor: {e}")
            PREDICTOR_AVAILABLE = False
    return _predictor_instance


# 测试时使用的模拟疾病数据
MOCK_DISEASES = [
    {
        "disease": "湿疹 (Eczema)",
        "confidence": 92.5,
        "description": "皮肤出现红斑、丘疹，伴有瘙痒",
        "severity": "中等",
        "recommendations": ["保持皮肤湿润", "避免接触过敏原", "使用温和的护肤品"]
    },
    {
        "disease": "接触性皮炎 (Contact Dermatitis)",
        "confidence": 78.3,
        "description": "局部皮肤红肿，可能由外界刺激物引起",
        "severity": "轻度",
        "recommendations": ["远离刺激源", "冷敷缓解", "必要时使用抗过敏药物"]
    },
    {
        "disease": "银屑病 (Psoriasis)",
        "confidence": 45.2,
        "description": "皮肤出现鳞屑状斑块",
        "severity": "轻度",
        "recommendations": ["保湿护理", "避免抓挠", "建议专科就诊"]
    }
]


def decode_image(image_data: str) -> Image.Image:
    # 解码Base64图片数据
    # 移除可能的data URL前缀
    if ',' in image_data:
        image_data = image_data.split(',')[1]
    
    image_bytes = base64.b64decode(image_data)
    image = Image.open(io.BytesIO(image_bytes))
    
    # 转换为RGB（处理RGBA或其他模式）
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    return image


def vision_analysis_node(state: DiagnosisState) -> Dict[str, Any]:
    # 使用PanDerm模型分析皮肤病照片
    print("\n" + "="*50)
    print("Vision Analysis Node")
    print("="*50)
    
    # 获取图片输入
    raw_image = state.get("image_data")
    user_question = state.get("user_question", "")
    
    # 检查是否有图片
    if not raw_image:
        print("Warning: No image provided, skipping vision analysis")
        return {
            **state,
            "vision_result": None,
            "messages": state.get("messages", []) + [{
                "role": "system",
                "content": "未提供图片，跳过视觉分析。"
            }]
        }
    
    # 有图片输入，使用 model 进行预测
    predictor = get_predictor()
    
    if not PREDICTOR_AVAILABLE or predictor is None:
        print("Warning: Predictor not available, using mock data for testing")
        # 测试模式：使用模拟数据
        return _handle_mock_analysis(state, raw_image, user_question)
    
    try:
        # 解码图片
        print("Decoding image...")
        image = decode_image(raw_image)
        
        # 使用 model 进行预测
        result = predictor.predict(image)
        
        if result is None:
            raise ValueError("Prediction returned None")
        
        # 构建分析结果
        vision_result = {
            "predicted_disease": result.predicted_disease,
            "confidence": result.confidence,
            "stage1_prediction": result.stage1_prediction,
            "stage2_prediction": result.stage2_prediction,
            "description": _get_disease_description(result.predicted_disease),
            "severity": _assess_severity(result.confidence),
            "recommendations": _get_recommendations(result.predicted_disease)
        }
        
        print(f"Vision Analysis Complete:")
        print(f"   Disease: {result.predicted_disease}")
        print(f"   Confidence: {result.confidence:.1f}%")
        
        # 更新状态
        return {
            **state,
            "vision_result": vision_result,
            "messages": state.get("messages", []) + [{
                "role": "system",
                "content": f"视觉分析完成：识别到{result.predicted_disease}（置信度{result.confidence:.1f}%）"
            }]
        }
        
    except Exception as e:
        print(f"Error during vision analysis: {e}")
        # 出错时使用模拟数据
        return _handle_mock_analysis(state, raw_image, user_question)


def _handle_mock_analysis(state: DiagnosisState, raw_image: str, user_question: str) -> Dict[str, Any]:
    import random
    
    print("Using mock analysis data")
    
    # 随机选择一种疾病（实际应用中使用真实模型）
    selected_disease = random.choice(MOCK_DISEASES)
    
    vision_result = {
        "predicted_disease": selected_disease["disease"],
        "confidence": selected_disease["confidence"],
        "stage1_prediction": {
            "class": selected_disease["disease"].split()[0],
            "confidence": selected_disease["confidence"]
        },
        "stage2_prediction": {
            "class": selected_disease["disease"],
            "confidence": selected_disease["confidence"]
        },
        "description": selected_disease["description"],
        "severity": selected_disease["severity"],
        "recommendations": selected_disease["recommendations"],
        "is_mock": True  # 标记为模拟数据
    }
    
    return {
        **state,
        "vision_result": vision_result,
        "messages": state.get("messages", []) + [{
            "role": "system",
            "content": f"【测试模式】视觉分析完成：{selected_disease['disease']}（置信度{selected_disease['confidence']:.1f}%）"
        }]
    }


def _get_disease_description(disease_name: str) -> str:
    descriptions = {
        "湿疹": "皮肤出现红斑、丘疹，伴有瘙痒，常见于面部、手部和四肢",
        "皮炎": "皮肤炎症反应，表现为红肿、瘙痒或脱屑",
        "痤疮": "毛囊皮脂腺慢性炎症，表现为粉刺、丘疹、脓疱",
        "银屑病": "慢性复发性炎症性皮肤病，特征为鳞屑性红斑",
        "荨麻疹": "过敏性皮肤病，表现为风团和瘙痒",
    }
    
    for key, desc in descriptions.items():
        if key in disease_name:
            return desc
    
    return f"检测到{disease_name}相关症状，建议进一步检查"


def _assess_severity(confidence: float) -> str:
    if confidence >= 80:
        return "高置信度"
    elif confidence >= 60:
        return "中等置信度"
    else:
        return "建议进一步检查"


def _get_recommendations(disease_name: str) -> list:
    recommendations = {
        "湿疹": ["保持皮肤湿润", "避免接触过敏原", "使用温和的护肤品", "必要时就医"],
        "皮炎": ["远离刺激源", "冷敷缓解症状", "使用抗过敏药物", "保持皮肤清洁"],
        "痤疮": ["保持面部清洁", "避免挤压痘痘", "使用控油产品", "饮食清淡"],
        "银屑病": ["保湿护理", "避免抓挠", "减少压力", "建议专科就诊"],
        "荨麻疹": ["避免过敏原", "冷敷止痒", "服用抗组胺药", "严重时就医"],
    }
    
    for key, recs in recommendations.items():
        if key in disease_name:
            return recs
    
    return ["保持皮肤清洁", "避免刺激", "必要时就医"]


def vision_analysis_with_real_model(state: DiagnosisState) -> Dict[str, Any]:
    # 真实视觉模型调用（现在使用PanDerm模型）
    return vision_analysis_node(state)
