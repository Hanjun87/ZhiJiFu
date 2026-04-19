"""
使用示例 - 皮肤疾病预测API
"""

import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from predictor import SkinDiseasePredictor, predict_image
from pathlib import Path


def example_single_prediction():
    """单张图片预测示例"""
    print("=" * 60)
    print("示例1: 单张图片预测")
    print("=" * 60)
    
    # 初始化预测器
    predictor = SkinDiseasePredictor()
    
    # 预测单张图片
    image_path = r"E:\SkinModel2\PanDerm-main\Classficated\test\Acne and Rosacea Photos\Acne_Closed_Comedo\acne-closed-comedo-003.jpg"
    
    result = predictor.predict(image_path)
    
    # 输出JSON结果
    print("\n预测结果 (JSON格式):")
    print(result.to_json())
    
    # 访问具体字段
    print(f"\n疾病名称: {result.disease}")
    print(f"置信度: {result.confidence:.2%}")
    print(f"预测级别: {result.level}")
    print(f"推理时间: {result.inference_time_ms:.2f}ms")


def example_batch_prediction():
    """批量预测示例"""
    print("\n" + "=" * 60)
    print("示例2: 批量图片预测")
    print("=" * 60)
    
    predictor = SkinDiseasePredictor()
    
    # 批量图片路径
    image_paths = [
        r"E:\SkinModel2\PanDerm-main\Classficated\test\Acne and Rosacea Photos\Acne_Closed_Comedo\acne-closed-comedo-003.jpg",
        r"E:\SkinModel2\PanDerm-main\Classficated\test\Melanoma Skin Cancer Nevi and Moles\Melanoma\melanoma-1.jpg",
    ]
    
    results = predictor.predict_batch(image_paths)
    
    for i, result in enumerate(results):
        print(f"\n图片 {i+1}:")
        print(result.to_json())


def example_quick_predict():
    """快速预测函数示例"""
    print("\n" + "=" * 60)
    print("示例3: 使用快速预测函数")
    print("=" * 60)
    
    image_path = r"E:\SkinModel2\PanDerm-main\Classficated\test\Vasculitis Photos\Other\cryoglobulinemia-1.jpg"
    
    # 一行代码完成预测
    json_result = predict_image(image_path)
    print(json_result)


def example_model_info():
    """获取模型信息"""
    print("\n" + "=" * 60)
    print("示例4: 获取模型信息")
    print("=" * 60)
    
    predictor = SkinDiseasePredictor()
    info = predictor.get_model_info()
    
    import json
    print(json.dumps(info, ensure_ascii=False, indent=2))


def example_integration():
    """实际集成示例（Web API风格）"""
    print("\n" + "=" * 60)
    print("示例5: Web API集成示例")
    print("=" * 60)
    
    from flask import Flask, request, jsonify
    
    app = Flask(__name__)
    predictor = SkinDiseasePredictor()
    
    @app.route('/predict', methods=['POST'])
    def predict():
        """预测接口"""
        if 'image' not in request.files:
            return jsonify({"error": "No image provided"}), 400
        
        file = request.files['image']
        image = Image.open(file.stream).convert('RGB')
        
        result = predictor.predict(image)
        return jsonify(result.to_dict())
    
    @app.route('/health', methods=['GET'])
    def health():
        """健康检查"""
        return jsonify({"status": "healthy", "model": "SkinDiseasePredictor"})
    
    print("""
# Flask API示例代码:

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
""")


if __name__ == "__main__":
    from pathlib import Path
    
    # 运行示例
    example_model_info()
    # example_single_prediction()
    # example_batch_prediction()
    # example_quick_predict()
    # example_integration()
