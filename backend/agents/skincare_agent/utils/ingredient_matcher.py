"""
成分匹配工具
检测成分冲突、协同组合
"""

from typing import Dict, Any, List

from ..services.skincare_rag_service import skincare_rag_service


class IngredientMatcher:
    """
    成分匹配器
    """

    def __init__(self, skin_profile: Dict[str, Any]):
        self.skin_profile = skin_profile
        self.skin_type = skin_profile.get("skin_type", "")
        self.skin_concerns = skin_profile.get("skin_concerns", [])
        self.skin_goals = skin_profile.get("skin_goals", [])
        self.sensitivity_factors = skin_profile.get("sensitivity_factors", [])

    def check_products(
        self,
        products: List[Dict[str, Any]],
        rag_results: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        检测产品成分兼容性

        Args:
            products: 产品列表
            rag_results: RAG检索结果

        Returns:
            检测结果字典
        """
        all_ingredients = self._extract_ingredients(products)

        conflicts = skincare_rag_service.check_conflicts(all_ingredients)
        synergies = skincare_rag_service.get_synergies(all_ingredients)

        is_compatible = len(conflicts) == 0

        recommendations = self._get_recommendations(rag_results)

        assessment = self._generate_assessment(is_compatible, conflicts, synergies)

        return {
            "is_compatible": is_compatible,
            "conflicts": [f"{c1} + {c2}: {reason}" for c1, c2, reason in conflicts],
            "synergies": [f"{c1} + {c2}: {effect}" for c1, c2, effect in synergies],
            "recommendations": recommendations,
            "assessment": assessment
        }

    def _extract_ingredients(self, products: List[Dict[str, Any]]) -> List[str]:
        """
        从产品中提取成分名称
        """
        ingredients = []
        for product in products:
            title = product.get("title", "")
            desc = product.get("desc", "")
            if title:
                ingredients.append(title)
            if desc and len(desc) < 50:
                ingredients.append(desc)
        return ingredients

    def _get_recommendations(self, rag_results: List[Dict[str, Any]]) -> List[str]:
        """
        获取推荐成分
        """
        recommendations = []
        for result in rag_results[:5]:
            name = result.get("ingredient_name", "")
            if name:
                recommendations.append(name)
        return recommendations

    def _generate_assessment(
        self,
        is_compatible: bool,
        conflicts: List[tuple],
        synergies: List[tuple]
    ) -> str:
        """
        生成评估说明
        """
        if is_compatible and not synergies:
            return f"您的产品在成分上没有冲突，可以放心使用。"

        if not is_compatible:
            conflict_parts = [f"{c1}和{c2}不建议同时使用({reason})" for c1, c2, reason in conflicts]
            return f"检测到成分冲突：{'；'.join(conflict_parts)}。建议错开使用或选择其中一种产品。"

        if synergies:
            synergy_parts = [f"{c1}和{c2}搭配效果更好({effect})" for c1, c2, effect in synergies]
            return f"您的产品搭配良好：{'；'.join(synergy_parts)}。"

        return "产品兼容性良好。"
