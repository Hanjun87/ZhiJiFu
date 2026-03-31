"""
第一层：Vision模型节点
多模态视觉分析：看懂皮肤病照片

注意：当前使用模拟数据，不调用真实视觉模型
"""

import json
import random
from typing import Dict, Any
import sys
import os

# 添加父目录到路径以支持绝对导入
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.state import DiagnosisState


# 模拟视觉分析结果模板
MOCK_VISION_RESULTS = [
    {
        "symptoms": ["红色丘疹", "脓疱", "面部弥漫性红斑"],
        "distribution": "面颊部、额头，对称分布",
        "lesion_count_estimate": "约20个",
        "severity": "中度",
        "estimated_type": "痤疮（炎性）",
        "visual_confidence": 0.89,
        "reasoning": "可见密集红色丘疹，部分顶端有脓点，分布于面部T区及面颊，符合中度炎症性痤疮表现",
        "suggest_urgent": False
    },
    {
        "symptoms": ["红斑", "毛细血管扩张", "丘疹"],
        "distribution": "鼻周、两颊，对称分布",
        "lesion_count_estimate": "约10个",
        "severity": "中度",
        "estimated_type": "玫瑰痤疮",
        "visual_confidence": 0.82,
        "reasoning": "面部中央区域可见持续性红斑，伴有毛细血管扩张和散在丘疹，鼻周及两颊对称分布",
        "suggest_urgent": False
    },
    {
        "symptoms": ["红斑", "鳞屑", "边界清楚"],
        "distribution": "肘部、膝部、头皮",
        "lesion_count_estimate": "约5处斑块",
        "severity": "轻度",
        "estimated_type": "银屑病",
        "visual_confidence": 0.85,
        "reasoning": "可见边界清楚的红斑，表面覆盖银白色鳞屑，分布于肘部、膝部等伸侧部位",
        "suggest_urgent": False
    },
    {
        "symptoms": ["水疱", "红斑", "糜烂"],
        "distribution": "躯干、四肢，广泛分布",
        "lesion_count_estimate": "无数",
        "severity": "重度",
        "estimated_type": "过敏性皮炎（急性）",
        "visual_confidence": 0.78,
        "reasoning": "全身广泛分布红斑、水疱，部分破溃糜烂，病情进展迅速，需警惕全身过敏反应",
        "suggest_urgent": True
    },
    {
        "symptoms": ["粉刺", "黑头", "少量丘疹"],
        "distribution": "额头、鼻部，T区为主",
        "lesion_count_estimate": "约15个",
        "severity": "轻度",
        "estimated_type": "痤疮（轻度）",
        "visual_confidence": 0.92,
        "reasoning": "面部T区可见散在黑头粉刺及少量炎性丘疹，无明显脓疱或结节",
        "suggest_urgent": False
    }
]


def vision_analysis_node(state: DiagnosisState) -> Dict[str, Any]:
    """
    Vision模型节点 - 分析皮肤病照片
    
    当前使用模拟数据，随机返回一个模拟结果
    实际部署时应调用真实的视觉模型（如GPT-4V、Claude 3、Qwen-VL等）
    
    Args:
        state: 当前状态，包含raw_image和user_description
        
    Returns:
        包含vision_analysis和rag_query的字典
    """
    
    # 检查是否有图片输入
    if state.get("input_type") == "text" or not state.get("raw_image"):
        # 仅文字输入，跳过视觉分析
        # 基于文字描述生成一个基础的vision_analysis
        user_desc = state.get("user_description", "")
        
        # 简单的关键词匹配来模拟分析
        if "痘" in user_desc or "痤疮" in user_desc:
            mock_result = MOCK_VISION_RESULTS[0]  # 痤疮
        elif "红" in user_desc and "血丝" in user_desc:
            mock_result = MOCK_VISION_RESULTS[1]  # 玫瑰痤疮
        elif "屑" in user_desc or "斑块" in user_desc:
            mock_result = MOCK_VISION_RESULTS[2]  # 银屑病
        elif "水疱" in user_desc or "过敏" in user_desc:
            mock_result = MOCK_VISION_RESULTS[3]  # 过敏性皮炎
        else:
            mock_result = MOCK_VISION_RESULTS[4]  # 轻度痤疮（默认）
    else:
        # 有图片输入，随机选择一个模拟结果
        # 实际应用中，这里应该调用视觉模型API
        mock_result = random.choice(MOCK_VISION_RESULTS)
    
    # 构建vision_analysis结果
    vision_analysis = {
        "symptoms": mock_result["symptoms"],
        "distribution": mock_result["distribution"],
        "lesion_count_estimate": mock_result["lesion_count_estimate"],
        "severity": mock_result["severity"],
        "estimated_type": mock_result["estimated_type"],
        "visual_confidence": mock_result["visual_confidence"],
        "reasoning": mock_result["reasoning"],
        "suggest_urgent": mock_result["suggest_urgent"]
    }
    
    # 自动生成RAG检索Query
    rag_query = f"{mock_result['estimated_type']} {mock_result['severity']} {' '.join(mock_result['symptoms'])}"
    
    return {
        "vision_analysis": vision_analysis,
        "rag_query": rag_query
    }


def vision_analysis_with_real_model(state: DiagnosisState) -> Dict[str, Any]:
    """
    真实视觉模型调用（预留接口）
    
    配置信息从.env读取：
    - EXTERNAL_AI_ENDPOINT
    - EXTERNAL_AI_API_KEY
    - EXTERNAL_AI_MODEL (qwen-vl-plus)
    
    注意：此函数调用真实的视觉模型，会产生费用
    """
    import os
    import requests
    import base64
    
    # 读取配置
    endpoint = os.getenv("EXTERNAL_AI_ENDPOINT")
    api_key = os.getenv("EXTERNAL_AI_API_KEY")
    model = os.getenv("EXTERNAL_AI_MODEL", "qwen-vl-plus")
    
    if not all([endpoint, api_key]):
        raise ValueError("Missing required environment variables for vision model")
    
    # 构造请求
    image_data = state.get("raw_image", "")
    user_text = state.get("user_description", "")
    
    # 这里应该调用真实的视觉模型API
    # 由于模型昂贵，当前返回模拟数据
    # 实际实现时需要根据模型API文档构造正确的请求
    
    # TODO: 实现真实的视觉模型调用
    # 参考.env中的配置使用阿里云通义千问(qwen-vl-plus)
    
    # 暂时返回模拟数据
    return vision_analysis_node(state)
