"""
报告生成节点
"""

from datetime import datetime, timedelta
from typing import Dict, Any, Literal, List, Optional
from ..core.state import DiseaseTrackingState
from ..utils.report_renderer import ReportRenderer
from ..utils.recovery_calculator import calculate_recovery_progress, calculator


def finalize_report_node(state: DiseaseTrackingState) -> DiseaseTrackingState:
    """
    组装最终报告

    Args:
        state: 当前状态

    Returns:
        更新后的状态
    """
    indicators = state.get("trend_indicators", {})
    agent_decision = state.get("agent_decision", {})
    rag_context = state.get("rag_context")
    raw_records = state.get("raw_records", [])
    user_profile = state.get("user_profile")

    suggested_verdict = agent_decision.get("suggested_verdict")
    if suggested_verdict:
        final_verdict = suggested_verdict
    else:
        final_verdict = _determine_verdict(indicators)

    state["final_verdict"] = final_verdict

    recovery_progress = calculate_recovery_progress(
        records=raw_records,
        time_window_days=state.get("time_window_days", 30),
        user_profile=user_profile
    )
    state["recovery_progress"] = recovery_progress

    renderer = ReportRenderer()
    report = renderer.render({
        "report_type": "disease_trend_30d",
        "generated_at": datetime.now().isoformat(),
        "executive_summary": {
            "verdict": final_verdict,
            "confidence": agent_decision.get("confidence", 0.0) or recovery_progress.get("confidence", 0.0),
            "risk_level": agent_decision.get("risk_level", "low"),
            "next_action": _generate_next_action(final_verdict, agent_decision),
            "recovery_progress": recovery_progress
        },
        "trend_analysis": {
            "duration_days": state["time_window_days"],
            "photos_count": len(raw_records),
            "severity_progression": indicators.get("severity_timeline", []),
            "key_improvements": _extract_improvements(indicators),
            "remaining_issues": _extract_remaining_issues(indicators)
        },
        "agent_decision_log": {
            "initial_assessment": agent_decision.get("reason", ""),
            "action_taken": agent_decision.get("action", "UNKNOWN"),
            "rag_consulted": rag_context is not None
        },
        "comparison_with_history": {
            "similar_cases_found": len(rag_context.get("similar_cases", [])) if rag_context else 0,
            "recovery_speed_percentile": None
        },
        "alerts": state.get("alerts", []),
        "doctor_review_required": state.get("needs_doctor", False)
    })

    state["final_report"] = report

    return state


def _determine_verdict(indicators: Dict[str, Any]) -> str:
    """根据指标确定结论"""
    timeline = indicators.get("severity_timeline", [])
    if not timeline or len(timeline) < 2:
        return "insufficient"
    
    first_severity = timeline[0]
    last_severity = timeline[-1]
    
    if last_severity < first_severity:
        return "better"
    elif last_severity > first_severity:
        return "worse"
    else:
        return "stable"


def _generate_next_action(verdict: str, agent_decision: Dict[str, Any]) -> str:
    """生成下一步行动建议"""
    actions = {
        "better": "继续当前护理，7天后复查",
        "worse": "建议尽快就医，调整治疗方案",
        "stable": "保持当前治疗，14天后复查",
        "insufficient": "请补充更多照片记录"
    }
    return actions.get(verdict, "请遵医嘱")


def _extract_improvements(indicators: Dict[str, Any]) -> list:
    """提取改善点"""
    improvements = []
    # TODO: 根据指标提取具体改善点
    return improvements


def _extract_remaining_issues(indicators: Dict[str, Any]) -> list:
    """提取遗留问题"""
    issues = []
    # TODO: 根据指标提取遗留问题
    return issues
