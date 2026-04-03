"""
RAG检索节点 - 接入Unified Medical RAG知识库
"""

from ..core.state import DiseaseTrackingState
from ..services.rag_service import rag_service


def rag_retrieval_node(state: DiseaseTrackingState) -> DiseaseTrackingState:
    """
    调用Unified Medical RAG服务查询医学知识和相似案例
    
    Args:
        state: 当前状态
        
    Returns:
        更新后的状态
    """
    indicators = state.get("trend_indicators", {})
    target_disease = state.get("target_disease", "")
    user_id = state.get("user_id", "")
    
    # 确定知识类型 - 根据疾病名称判断
    knowledge_type = _determine_knowledge_type(target_disease)
    
    # 构建RAG查询
    query = {
        "query_type": "case_comparison",
        "query_text": _build_query_text(state),
        "disease_type": target_disease,
        "knowledge_type": knowledge_type,
        "trend_indicators": indicators,
        "filters": {
            "disease_type": target_disease,
            "severity_range": [
                min(indicators.get("severity_timeline", [1])) if indicators.get("severity_timeline") else 1,
                max(indicators.get("severity_timeline", [3])) if indicators.get("severity_timeline") else 3
            ],
            "exclude_user": user_id
        },
        "top_k": 3
    }
    
    # 调用RAG服务
    rag_result = rag_service.query_similar_cases(query)
    
    # 如果趋势分析需要，额外查询趋势相关的医学知识
    trend_pattern = _analyze_trend_pattern(indicators.get("severity_timeline", []))
    if trend_pattern and target_disease:
        trend_knowledge = rag_service.query_trend_analysis_knowledge(target_disease, trend_pattern)
        rag_result["trend_knowledge"] = trend_knowledge
    
    state["rag_context"] = rag_result
    
    return state


def _determine_knowledge_type(disease_name: str) -> str:
    """
    根据疾病名称确定知识类型
    
    Args:
        disease_name: 疾病名称
        
    Returns:
        知识类型: "dermatology" | "wound" | ""
    """
    if not disease_name:
        return ""
    
    disease_name = disease_name.lower()
    
    # 伤口护理相关关键词
    wound_keywords = [
        "伤口", "溃疡", "烧伤", "烫伤", "压疮", "压伤", "创伤",
        "切口", "擦伤", "挫伤", "切割伤", "刺伤", "撕裂伤",
        "糖尿病足", "压力性损伤", "静脉性溃疡", "动脉性溃疡",
        "wound", "ulcer", "burn", "pressure", "injury"
    ]
    
    # 皮肤病相关关键词
    dermatology_keywords = [
        "痤疮", "痘痘", "湿疹", "皮炎", "银屑病", "牛皮癣",
        "疱疹", "疣", "癣", "白癜风", "红斑狼疮", "皮肌炎",
        "硬皮病", "天疱疮", "痤疮", "粉刺", "黑头", "白头",
        "acne", "eczema", "dermatitis", "psoriasis", "herpes",
        "wart", "tinea", "vitiligo", "lupus"
    ]
    
    # 检查关键词匹配
    for keyword in wound_keywords:
        if keyword in disease_name:
            return "wound"
    
    for keyword in dermatology_keywords:
        if keyword in disease_name:
            return "dermatology"
    
    # 默认返回皮肤病类型
    return "dermatology"


def _build_query_text(state: DiseaseTrackingState) -> str:
    """
    构建RAG查询文本
    
    Args:
        state: 当前状态
        
    Returns:
        查询文本
    """
    indicators = state.get("trend_indicators", {})
    target_disease = state.get("target_disease", "")
    
    query_parts = []
    
    if target_disease:
        query_parts.append(f"{target_disease}的治疗和护理")
    
    # 添加趋势描述
    severity_timeline = indicators.get("severity_timeline", [])
    if severity_timeline:
        trend_desc = _describe_trend(severity_timeline)
        query_parts.append(f"病情{trend_desc}")
    
    # 添加异常点描述
    anomaly_points = indicators.get("anomaly_points", [])
    if anomaly_points and anomaly_points != ["无"]:
        query_parts.append(f"出现{'、'.join(anomaly_points)}")
    
    return "，".join(query_parts) if query_parts else "皮肤病治疗和护理建议"


def _describe_trend(severity_timeline: list) -> str:
    """描述趋势"""
    if not severity_timeline or len(severity_timeline) < 2:
        return "稳定"
    
    first = severity_timeline[0]
    last = severity_timeline[-1]
    
    if last < first:
        return "好转"
    elif last > first:
        return "恶化"
    else:
        return "稳定"


def _analyze_trend_pattern(severity_timeline: list) -> str:
    """
    分析趋势模式
    
    Args:
        severity_timeline: 严重度时间线
        
    Returns:
        趋势模式描述
    """
    if not severity_timeline or len(severity_timeline) < 2:
        return ""
    
    first = severity_timeline[0]
    last = severity_timeline[-1]
    min_val = min(severity_timeline)
    max_val = max(severity_timeline)
    
    # 分析趋势模式
    if last < first:
        if max_val > first:
            return "反复"  # 先恶化后好转
        return "好转"
    elif last > first:
        if min_val < first:
            return "反复"  # 先好转后恶化
        return "恶化"
    else:
        if max_val > first:
            return "波动"  # 有波动但最终稳定
        return "稳定"
