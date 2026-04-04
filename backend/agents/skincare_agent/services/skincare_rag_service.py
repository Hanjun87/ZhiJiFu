"""
护肤品成分RAG服务
对接skincare_ingredients_rag知识库
"""

import json
import os
from typing import List, Dict, Any, Optional


class SkincareRAGService:
    """
    护肤品成分RAG服务
    """

    def __init__(self):
        self.data_path = self._find_data_path()
        self.ingredients = self._load_ingredients()

    def _find_data_path(self) -> str:
        """
        查找成分数据文件路径
        """
        possible_paths = [
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                        "skincare_ingredients_rag", "skincare_ingredients_rag", "data", "skincare_ingredients.json"),
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                        "skincare_ingredients_rag", "data", "skincare_ingredients.json"),
            "e:/workspace/SkinAI/skinAI/skincare_ingredients_rag/skincare_ingredients_rag/data/skincare_ingredients.json"
        ]

        for path in possible_paths:
            if os.path.exists(path):
                return path

        raise FileNotFoundError(f"无法找到skincare_ingredients.json，尝试过的路径: {possible_paths}")

    def _load_ingredients(self) -> List[Dict[str, Any]]:
        """
        加载成分数据
        """
        try:
            with open(self.data_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"[SkincareRAG] 加载成分数据失败: {e}")
            return []

    def query_ingredients(
        self,
        concerns: List[str],
        goals: List[str],
        skin_type: str = "",
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        查询相关成分

        Args:
            concerns: 皮肤问题列表
            goals: 护肤目标列表
            skin_type: 肤质
            top_k: 返回数量

        Returns:
            相关成分列表
        """
        if not self.ingredients:
            return []

        scored_ingredients = []

        for ingredient in self.ingredients:
            score = self._calculate_relevance(ingredient, concerns, goals, skin_type)
            if score > 0:
                scored_ingredients.append((score, ingredient))

        scored_ingredients.sort(key=lambda x: x[0], reverse=True)

        return [ing for _, ing in scored_ingredients[:top_k]]

    def _calculate_relevance(
        self,
        ingredient: Dict[str, Any],
        concerns: List[str],
        goals: List[str],
        skin_type: str
    ) -> float:
        """
        计算成分相关性分数
        """
        score = 0.0

        ingredient_name = ingredient.get("ingredient_name", "")
        category = ingredient.get("category", "")
        benefits = ingredient.get("benefits", [])
        suitable_skin = ingredient.get("suitable_skin_types", [])
        contraindications = ingredient.get("contraindications", [])

        for concern in concerns:
            concern_lower = concern.lower()
            if concern_lower in ingredient_name.lower():
                score += 3.0
            if concern_lower in category.lower():
                score += 2.0
            for benefit in benefits:
                if concern_lower in benefit.lower():
                    score += 1.0

        for goal in goals:
            goal_lower = goal.lower()
            if goal_lower in ingredient_name.lower():
                score += 2.5
            if goal_lower in category.lower():
                score += 2.0
            for benefit in benefits:
                if goal_lower in benefit.lower():
                    score += 1.0

        if skin_type:
            skin_type_lower = skin_type.lower()
            for suitable in suitable_skin:
                if skin_type_lower in suitable.lower():
                    score += 1.0
            for contra in contraindications:
                if skin_type_lower in contra.lower():
                    score -= 2.0

        return max(0.0, score)

    def get_ingredient_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        """
        根据名称获取成分详情
        """
        name_lower = name.lower()
        for ingredient in self.ingredients:
            ingredient_name = ingredient.get("ingredient_name", "").lower()
            aliases = [a.lower() for a in ingredient.get("aliases", [])]
            if name_lower == ingredient_name or name_lower in aliases:
                return ingredient
        return None

    def check_conflicts(self, ingredient_names: List[str]) -> List[tuple]:
        """
        检查成分冲突

        Returns:
            冲突对列表 [(成分1, 成分2, 原因)]
        """
        conflicts = []

        conflict_rules = {
            ("维A酸", "果酸"): "双重刺激，屏障损伤",
            ("维A酸", "水杨酸"): "双重刺激，屏障损伤",
            ("视黄醇", "果酸"): "双重刺激，屏障损伤",
            ("视黄醇", "水杨酸"): "双重刺激，屏障损伤",
            ("维C", "烟酰胺"): "可能产生烟酸，引起刺激",
            ("维A酸", "维C"): "维C可能降低维A酸稳定性",
        }

        for i, name1 in enumerate(ingredient_names):
            for name2 in ingredient_names[i+1:]:
                for (c1, c2), reason in conflict_rules.items():
                    if c1 in name1 and c2 in name2:
                        conflicts.append((name1, name2, reason))
                    if c1 in name2 and c2 in name1:
                        conflicts.append((name2, name1, reason))

        return conflicts

    def get_synergies(self, ingredient_names: List[str]) -> List[tuple]:
        """
        获取协同成分组合

        Returns:
            协同对列表 [(成分1, 成分2, 效果)]
        """
        synergies = []

        synergy_rules = {
            ("维C", "维E"): "增强抗氧化效果",
            ("视黄醇", "透明质酸"): "抗老+保湿，减少刺激",
            ("烟酰胺", "透明质酸"): "修复屏障+保湿",
            ("补骨脂酚", "透明质酸"): "植物抗老+保湿",
        }

        for i, name1 in enumerate(ingredient_names):
            for name2 in ingredient_names[i+1:]:
                for (s1, s2), effect in synergy_rules.items():
                    if s1 in name1 and s2 in name2:
                        synergies.append((name1, name2, effect))
                    if s1 in name2 and s2 in name1:
                        synergies.append((name2, name1, effect))

        return synergies


skincare_rag_service = SkincareRAGService()
