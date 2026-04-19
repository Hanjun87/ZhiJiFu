"""
输出组装节点
组装最终输出，生成用户友好的护肤方案报告
"""

from typing import Dict, Any, List

from ..core.state import SkincareState


def compile_output_node(state: SkincareState) -> Dict[str, Any]:
    # 汇总所有结果，生成最终输出
    skin_profile = state.get("skin_profile", {})
    skin_metrics = state.get("skin_metrics", [])
    routine = state.get("routine", {})
    ingredient_assessment = state.get("ingredient_assessment", {})

    # 优先使用LLM生成的care_advice和ai_verdict
    care_advice = routine.get("care_advice", []) if routine else []
    if not care_advice:
        care_advice = _build_care_advice(skin_profile, routine, ingredient_assessment)

    ai_verdict = routine.get("ai_verdict", "stable") if routine else "stable"
    ai_verdict_reason = routine.get("ai_verdict_reason", "") if routine else ""

    final_output = {
        "skin_profile": skin_profile,
        "skin_metrics": skin_metrics,
        "routine": routine,
        "care_advice": care_advice,
        "ai_verdict": ai_verdict,
        "ai_verdict_reason": ai_verdict_reason,
        "ingredient_assessment": ingredient_assessment
    }

    return {
        "final_output": final_output,
        "care_advice": care_advice,
        "ai_verdict": ai_verdict,
        "ai_verdict_reason": ai_verdict_reason
    }


def _build_care_advice(
    skin_profile: Dict[str, Any],
    routine: Dict[str, Any],
    ingredient_assessment: Dict[str, Any]
) -> List[Dict[str, str]]:
    advice_list = []
    skin_concerns = skin_profile.get("skin_concerns", [])
    recommended = routine.get("recommended_ingredients", []) if routine else []

    if "痘痘" in skin_concerns or "痤疮" in skin_concerns:
        advice_list.append({
            "title": "控油清洁",
            "description": "使用温和的氨基酸洁面产品，避免过度清洁",
            "category": "cleaning"
        })

    if "色斑" in skin_concerns or "暗沉" in skin_concerns:
        advice_list.append({
            "title": "美白淡斑",
            "description": "建议使用维生素C、烟酰胺等美白成分",
            "category": "treatment"
        })

    if "皱纹" in skin_concerns or "衰老" in skin_concerns:
        advice_list.append({
            "title": "抗衰老",
            "description": "建议使用视黄醇、胜肽等抗老成分",
            "category": "treatment"
        })

    advice_list.append({
        "title": "保湿防晒",
        "description": "日常保湿不可忽视，防晒是护肤的基础",
        "category": "moisturizing"
    })

    advice_list.append({
        "title": "生活习惯",
        "description": "保持充足睡眠，注意饮食均衡，多喝水",
        "category": "lifestyle"
    })

    conflicts = ingredient_assessment.get("conflicts", []) if ingredient_assessment else []
    if conflicts:
        advice_list.append({
            "title": "成分注意",
            "description": f"需注意：{', '.join(conflicts)}",
            "category": "treatment"
        })

    return advice_list


def _determine_verdict(skin_profile: Dict[str, Any], routine: Dict[str, Any]) -> str:
    if not skin_profile:
        return "insufficient"

    skin_concerns = skin_profile.get("skin_concerns", [])
    routine_level = skin_profile.get("routine_level", "新手")

    if not skin_concerns or routine_level == "新手":
        return "stable"

    if "痘痘" in skin_concerns and routine:
        return "stable"

    return "stable"
