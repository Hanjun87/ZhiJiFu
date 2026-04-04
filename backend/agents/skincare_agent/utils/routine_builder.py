"""
护肤步骤构建工具
"""

from typing import Dict, Any, List


class RoutineBuilder:
    """
    护肤方案构建器
    """

    @staticmethod
    def build_novice_routine() -> Dict[str, List[str]]:
        """
        构建新手简化方案（核心三步）
        """
        return {
            "morning_routine": [
                "温和洁面",
                "保湿霜",
                "防晒霜"
            ],
            "evening_routine": [
                "温和洁面",
                "保湿精华",
                "面霜"
            ]
        }

    @staticmethod
    def build_intermediate_routine(
        skin_concerns: List[str],
        recommended_ingredients: List[Dict[str, Any]]
    ) -> Dict[str, List[str]]:
        """
        构建进阶方案
        """
        morning = ["温和洁面", "爽肤水"]

        if "色斑" in skin_concerns or "暗沉" in skin_concerns:
            morning.append("维生素C精华")
        elif "痘痘" in skin_concerns:
            morning.append("控油精华")

        morning.extend(["保湿乳", "防晒霜"])

        evening = ["温和洁面", "爽肤水"]

        if recommended_ingredients:
            first_ingredient = recommended_ingredients[0].get("ingredient", "")
            if first_ingredient:
                evening.append(f"{first_ingredient}精华")

        evening.extend(["保湿精华", "面霜"])

        return {
            "morning_routine": morning,
            "evening_routine": evening
        }

    @staticmethod
    def build_advanced_routine(
        skin_concerns: List[str],
        recommended_ingredients: List[Dict[str, Any]]
    ) -> Dict[str, List[str]]:
        """
        构建专业方案
        """
        morning = [
            "温和洁面",
            "爽肤水",
            "精华液（根据当日重点）",
            "眼霜",
            "乳液/面霜",
            "防晒霜"
        ]

        evening = [
            "温和洁面",
            "爽肤水",
            "功效精华（如视黄醇）",
            "特殊护理（每周2-3次去角质）",
            "眼霜",
            "面霜"
        ]

        return {
            "morning_routine": morning,
            "evening_routine": evening
        }

    @staticmethod
    def format_routine_steps(steps: List[str]) -> str:
        """
        格式化护肤步骤为可读文本
        """
        if not steps:
            return ""

        lines = []
        for i, step in enumerate(steps, 1):
            lines.append(f"{i}. {step}")

        return "\n".join(lines)
