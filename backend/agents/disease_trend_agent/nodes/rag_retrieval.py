"""
RAG检索节点
"""

from ..core.state import DiseaseTrackingState
from ..services.rag_service import RAGService


def rag_retrieval_node(state: DiseaseTrackingState) -> DiseaseTrackingState:
    """
    调用RAG服务查相似案例
    
    Args:
        state: 当前状态
        
    Returns:
        更新后的状态
    """
    indicators = state["trend_indicators"]
    
    # 构造RAG查询
    query = {
        "query_type": "case_comparison",
        "query_text": f"""
            患者{state['user_id']}，{state['target_disease']}，
            30天内严重度波动：{indicators['severity_timeline']}，
            异常：{indicators.get('anomaly_points', '无')}。
            需要查找：相似波动模式的历史案例及最终预后。
        """,
        "filters": {
            "disease_type": state["target_disease"],
            "severity_range": [
                min(indicators['severity_timeline']) if indicators['severity_timeline'] else 1,
                max(indicators['severity_timeline']) if indicators['severity_timeline'] else 3
            ],
            "exclude_user": state["user_id"]
        },
        "top_k": 3
    }
    
    # 调用RAG服务
    rag_service = RAGService()
    rag_result = rag_service.query_similar_cases(query)
    
    state["rag_context"] = rag_result
    
    return state
