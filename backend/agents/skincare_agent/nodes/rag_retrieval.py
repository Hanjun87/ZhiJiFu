"""
RAG检索节点
调用护肤品成分知识库，检索相关成分知识
"""

from typing import Dict, Any, List

from ..core.state import SkincareState
from ..services.skincare_rag_service import skincare_rag_service


def rag_retrieval_node(state: SkincareState) -> Dict[str, Any]:
    """
    RAG检索节点 - 查询成分知识

    Args:
        state: 当前状态

    Returns:
        包含rag_results的字典
    """
    skin_profile = state.get("skin_profile", {})
    skin_concerns = skin_profile.get("skin_concerns", [])
    skin_goals = skin_profile.get("skin_goals", [])
    skin_type = skin_profile.get("skin_type", "")

    rag_queries = _build_rag_queries(skin_concerns, skin_goals, skin_type)

    rag_results = skincare_rag_service.query_ingredients(
        concerns=skin_concerns,
        goals=skin_goals,
        skin_type=skin_type,
        top_k=5
    )

    return {
        "rag_queries": rag_queries,
        "rag_results": rag_results
    }


def _build_rag_queries(skin_concerns: List[str], skin_goals: List[str], skin_type: str) -> List[str]:
    """
    构建RAG查询列表
    """
    queries = []

    for concern in skin_concerns:
        queries.append(f"{concern} {skin_type}肤质")

    for goal in skin_goals:
        queries.append(f"{goal} 成分推荐")

    return queries if queries else ["护肤成分"]
