"""
响应格式化工具
"""

from typing import Dict, Any, List

from ..models.enums import VerdictType


class ResponseFormatter:
    """
    响应格式化器
    """

    VERDICT_MESSAGES = {
        VerdictType.BETTER: "根据最近的数据分析，您的皮肤状况正在好转！继续保持当前的护肤习惯，注意巩固效果。",
        VerdictType.WORSE: "近期皮肤状况有恶化趋势，建议您重点关注近期使用的护肤品或生活作息是否改变，如有不适请及时就医。",
        VerdictType.STABLE: "皮肤状态保持稳定。建议继续保持当前的日常护理，注意防晒和基础保湿。",
        VerdictType.INSUFFICIENT: "根据今天的皮肤记录，整体状态良好。继续保持当前的护肤习惯，注意补水和防晒。"
    }

    @staticmethod
    def format_care_advice_for_frontend(
        care_advice: List[Dict[str, str]]
    ) -> List[Dict[str, Any]]:
        """
        格式化护理建议以适配前端

        前端需要的格式：
        {
            "title": str,
            "description": str,
            "category": str
        }
        """
        icon_map = {
            "cleaning": "Shield",
            "moisturizing": "Droplets",
            "sunscreen": "Sun",
            "treatment": "Shield",
            "lifestyle": "Sparkles"
        }

        formatted = []
        for advice in care_advice:
            category = advice.get("category", "treatment")
            formatted.append({
                "title": advice.get("title", ""),
                "description": advice.get("description", ""),
                "category": category,
                "icon": icon_map.get(category, "Shield")
            })

        return formatted

    @staticmethod
    def format_verdict_for_frontend(verdict: str) -> Dict[str, Any]:
        """
        格式化AI点评以适配前端
        """
        verdict_enum = VerdictType(verdict) if verdict in [v.value for v in VerdictType] else VerdictType.STABLE

        return {
            "verdict": verdict,
            "message": ResponseFormatter.VERDICT_MESSAGES.get(verdict_enum, ""),
            "focus_areas": ResponseFormatter._get_focus_areas(verdict_enum)
        }

    @staticmethod
    def _get_focus_areas(verdict: VerdictType) -> List[str]:
        """
        获取建议重点领域
        """
        if verdict == VerdictType.BETTER:
            return ["防晒", "保湿"]
        elif verdict == VerdictType.WORSE:
            return ["排查原因", "简化护肤"]
        elif verdict == VerdictType.STABLE:
            return ["防晒", "保湿", "维持现状"]
        else:
            return ["防晒", "保湿", "观察"]

    @staticmethod
    def format_full_response(
        skin_profile: Dict[str, Any],
        care_advice: List[Dict[str, str]],
        ai_verdict: str,
        routine: Dict[str, Any],
        ingredient_assessment: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        格式化完整响应以适配前端DiaryDetail.tsx
        """
        formatted_verdict = ResponseFormatter.format_verdict_for_frontend(ai_verdict)
        formatted_advice = ResponseFormatter.format_care_advice_for_frontend(care_advice)

        return {
            "success": True,
            "result": {
                "skinProfile": skin_profile,
                "careAdvice": formatted_advice,
                "aiVerdict": formatted_verdict["verdict"],
                "aiMessage": formatted_verdict["message"],
                "focusAreas": formatted_verdict["focus_areas"],
                "routine": routine,
                "ingredientAssessment": ingredient_assessment
            }
        }
