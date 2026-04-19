# 皮肤疾病预测模型 - 生产级组件

## 概述

基于PanDerm模型的二阶段层级分类系统，用于皮肤疾病诊断。

- **Stage 1**: 23大类粗分类
- **Stage 2**: 细分类（11个高准确率类别启用）
- **智能回退**: 低置信度时保守输出大类

## 快速开始

### 1. 安装依赖

```bash
pip install torch torchvision pillow numpy
```

### 2. 使用方法

```python
from predictor import SkinDiseasePredictor

# 初始化预测器
predictor = SkinDiseasePredictor()

# 预测单张图片
result = predictor.predict("path/to/image.jpg")

# 输出JSON
print(result.to_json())
```

### 3. 输出格式

```json
{
  "disease": "Acne_Closed_Comedo",
  "confidence": 0.9234,
  "level": "fine",
  "coarse_class": "Acne and Rosacea Photos",
  "coarse_confidence": 0.9567,
  "fine_class": "Acne_Closed_Comedo",
  "fine_confidence": 0.9234,
  "stage2_used": true,
  "inference_time_ms": 45.23
}
```

## 文件结构

```
model/
├── models/                    # 模型文件
│   ├── stage1_best.pth       # Stage 1模型（23类）
│   ├── Vasculitis_Photos.pth # Stage 2模型
│   ├── Melanoma_Skin_Cancer_Nevi_and_Moles.pth
│   └── ... (共18个Stage 2模型)
├── mappings/                  # 类别映射文件
│   ├── stage1_mapping.json
│   └── stage2_*_mapping.json
├── predictor.py              # 主预测代码
├── examples/                 # 使用示例
│   └── example_usage.py
└── README.md                 # 本文件
```

## API说明

### SkinDiseasePredictor类

#### 初始化
```python
predictor = SkinDiseasePredictor(
    models_dir="models",      # 模型文件夹路径
    mappings_dir="mappings",  # 映射文件夹路径
    device="cuda"             # 计算设备（自动检测）
)
```

#### 单张预测
```python
result = predictor.predict(image)
# image可以是：文件路径(str)、PIL Image、numpy数组
```

#### 批量预测
```python
results = predictor.predict_batch([image1, image2, ...])
```

#### 获取模型信息
```python
info = predictor.get_model_info()
```

### PredictionResult类

| 属性 | 类型 | 说明 |
|------|------|------|
| `disease` | str | 最终预测的疾病名称 |
| `confidence` | float | 置信度 (0-1) |
| `level` | str | 预测级别："coarse"或"fine" |
| `coarse_class` | str | 大类名称 |
| `coarse_confidence` | float | 大类置信度 |
| `fine_class` | str | 细类名称（可选） |
| `fine_confidence` | float | 细类置信度（可选） |
| `stage2_used` | bool | 是否使用了Stage 2 |
| `inference_time_ms` | float | 推理时间（毫秒） |

#### 方法
- `to_dict()`: 转换为字典
- `to_json()`: 转换为JSON字符串

## Stage 2启用策略

| 表现分级 | 类别数 | 置信度阈值 | 说明 |
|---------|-------|-----------|------|
| 优秀 | 2 | 0.6 | Vasculitis, Melanoma |
| 良好 | 5 | 0.7 | Acne, Warts, Tinea, Psoriasis, Seborrheic |
| 中等 | 4 | 0.8 | Herpes, Vascular, Actinic, Lupus |
| 禁用 | 7 | - | 准确率<50%，只输出大类 |

## 性能指标

- **Stage 1准确率**: 63.77%
- **Stage 2平均准确率**: 57.49%
- **Top-3准确率**: 83.31%
- **Top-5准确率**: 89.26%
- **推理时间**: ~50ms/张 (RTX 4060 Ti)

## 集成示例

### Flask Web API

```python
from flask import Flask, request, jsonify
from predictor import SkinDiseasePredictor

app = Flask(__name__)
predictor = SkinDiseasePredictor()

@app.route('/predict', methods=['POST'])
def predict():
    file = request.files['image']
    image = Image.open(file.stream)
    result = predictor.predict(image)
    return jsonify(result.to_dict())

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

### 命令行使用

```bash
python predictor.py path/to/image.jpg
```

## 注意事项

1. **输入图片**: 支持JPG、PNG格式，任意尺寸（内部resize到224x224）
2. **GPU内存**: 需要约2GB显存
3. **首次加载**: Stage 2模型延迟加载，首次预测某类别时会稍慢
4. **安全设计**: 低置信度时自动回退到大类，避免误诊

## 模型来源

- 基础模型: PanDerm (ViT-Base/16)
- 预训练权重: panderm_bb_data6_checkpoint-499.pth
- 训练数据: HAM10000 + 自定义皮肤疾病数据集
- 训练日期: 2026-04-11

## 许可证

仅供研究和学习使用。
