"""
RAG检索节点
调用RAG服务，检索相似病例和治疗方案
"""

from typing import Dict, Any, List
import sys
import os

# 添加父目录到路径以支持绝对导入
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.state import DiagnosisState


# 模拟RAG检索结果
MOCK_RAG_RESULTS = {
    "痤疮（炎性）": [
        {
            "case_id": "case_001",
            "diagnosis": "中度炎症性痤疮",
            "treatment": ["外用阿达帕林凝胶", "口服多西环素", "红蓝光治疗"],
            "outcome": "显著改善",
            "recovery_days": 28,
            "similarity": 0.92
        },
        {
            "case_id": "case_002",
            "diagnosis": "中度痤疮",
            "treatment": ["外用维A酸乳膏", "口服米诺环素"],
            "outcome": "明显改善",
            "recovery_days": 35,
            "similarity": 0.88
        },
        {
            "case_id": "case_003",
            "diagnosis": "炎症性痤疮",
            "treatment": ["外用过氧化苯甲酰", "口服异维A酸"],
            "outcome": "完全治愈",
            "recovery_days": 42,
            "similarity": 0.85
        }
    ],
    "玫瑰痤疮": [
        {
            "case_id": "case_004",
            "diagnosis": "玫瑰痤疮（丘疹型）",
            "treatment": ["外用甲硝唑凝胶", "口服多西环素", "避免刺激因素"],
            "outcome": "症状控制",
            "recovery_days": 60,
            "similarity": 0.90
        },
        {
            "case_id": "case_005",
            "diagnosis": "玫瑰痤疮",
            "treatment": ["外用伊维菌素乳膏", "口服羟氯喹"],
            "outcome": "明显改善",
            "recovery_days": 45,
            "similarity": 0.82
        }
    ],
    "银屑病": [
        {
            "case_id": "case_006",
            "diagnosis": "寻常型银屑病（轻度）",
            "treatment": ["外用卡泊三醇软膏", "外用糖皮质激素", "光疗"],
            "outcome": "症状缓解",
            "recovery_days": 21,
            "similarity": 0.87
        }
    ],
    "过敏性皮炎": [
        {
            "case_id": "case_007",
            "diagnosis": "急性过敏性皮炎",
            "treatment": ["口服抗组胺药", "外用炉甘石洗剂", "静脉注射糖皮质激素"],
            "outcome": "急性期控制",
            "recovery_days": 7,
            "similarity": 0.85
        }
    ],
    "default": [
        {
            "case_id": "case_default_001",
            "diagnosis": "常见皮肤病",
            "treatment": ["保持皮肤清洁", "避免刺激", "外用温和护肤品"],
            "outcome": "一般改善",
            "recovery_days": 14,
            "similarity": 0.70
        }
    ]
}


def rag_retrieval_node(state: DiagnosisState) -> Dict[str, Any]:
    """
    RAG检索节点 - 检索相似病例
    
    当前使用模拟数据，实际应调用RAG服务
    
    Args:
        state: 当前状态，包含rag_query和vision_analysis
        
    Returns:
        包含rag_results的字典
    """
    
    query = state.get("rag_query", "")
    vision_analysis = state.get("vision_analysis", {})
    
    # 获取疾病类型用于匹配模拟数据
    estimated_type = vision_analysis.get("estimated_type", "")
    severity = vision_analysis.get("severity", "")
    
    # 根据疾病类型获取对应的模拟案例
    # 实际应用中，这里应该调用RAG服务API
    results = []
    
    # 尝试匹配疾病类型
    for disease_type, cases in MOCK_RAG_RESULTS.items():
        if disease_type in estimated_type or estimated_type in disease_type:
            results = cases
            break
    
    # 如果没有匹配到，使用默认结果
    if not results:
        results = MOCK_RAG_RESULTS["default"]
    
    # 构建rag_results
    rag_results = []
    for case in results[:5]:  # 最多返回5条
        rag_results.append({
            "case_id": case["case_id"],
            "diagnosis": case["diagnosis"],
            "treatment": case["treatment"],
            "outcome": case["outcome"],
            "recovery_days": case["recovery_days"],
            "similarity_score": case["similarity"]
        })
    
    return {
        "rag_results": rag_results
    }


def build_rag_query(state: DiagnosisState) -> str:
    """
    构建RAG查询
    
    基于视觉分析结果自动生成检索Query
    
    Args:
        state: 当前状态
        
    Returns:
        RAG查询字符串
    """
    vision = state.get("vision_analysis", {})
    
    if not vision:
        return ""
    
    # 格式：{初步诊断} {严重度} {症状列表}
    query_parts = [
        vision.get("estimated_type", ""),
        vision.get("severity", ""),
        " ".join(vision.get("symptoms", []))
    ]
    
    return " ".join(filter(None, query_parts))


def rag_retrieval_with_service(state: DiagnosisState) -> Dict[str, Any]:
    """
    调用真实RAG服务的接口（预留）
    
    实际部署时应该调用组长的RAG服务
    """
    import os
    import requests
    
    # RAG服务配置
    rag_endpoint = os.getenv("RAG_SERVICE_ENDPOINT", "http://localhost:8000/retrieve")
    
    query = state.get("rag_query", "")
    vision_analysis = state.get("vision_analysis", {})
    
    # 构造请求参数
    payload = {
        "query": query,
        "filters": {
            "disease_type": vision_analysis.get("estimated_type", ""),
            "severity": vision_analysis.get("severity", "")
        },
        "top_k": 5
    }
    
    try:
        # 实际调用RAG服务
        # response = requests.post(rag_endpoint, json=payload)
        # results = response.json()
        
        # 当前返回模拟数据
        return rag_retrieval_node(state)
        
    except Exception as e:
        # 如果RAG服务不可用，返回空结果
        # LLM可以基于视觉分析结果独立做诊断
        return {
            "rag_results": []
        }
