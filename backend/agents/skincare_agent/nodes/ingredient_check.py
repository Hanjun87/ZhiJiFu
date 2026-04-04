"""
成分检测节点
分析用户当前产品成分，评估兼容性和有效性
"""

from typing import Dict, Any, List

from ..core.state import SkincareState
from ..utils.ingredient_matcher import IngredientMatcher


def ingredient_check_node(state: SkincareState) -> Dict[str, Any]:
    """
    成分检测节点 - 检测产品成分兼容性

    Args:
        state: 当前状态

    Returns:
        包含ingredient_assessment的字典
    """
    skin_profile = state.get("skin_profile", {})
    current_products = state.get("current_products", [])
    rag_results = state.get("rag_results", [])

    if not current_products:
        return {
            "ingredient_assessment": {
                "is_compatible": True,
                "conflicts": [],
                "recommendations": _get_recommendations_from_rag(rag_results),
                "assessment": "用户暂无在用产品，建议根据肤质选择合适产品"
            }
        }

    matcher = IngredientMatcher(skin_profile)

    assessment = matcher.check_products(current_products, rag_results)

    return {"ingredient_assessment": assessment}


def _get_recommendations_from_rag(rag_results: List[Dict[str, Any]]) -> List[str]:
    """
    从RAG结果中提取推荐成分
    """
    recommendations = []
    for result in rag_results:
        ingredient_name = result.get("ingredient_name", "")
        if ingredient_name:
            recommendations.append(ingredient_name)
    return recommendations[:5]
