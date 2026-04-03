"""
报告生成节点
"""

from datetime import datetime, timedelta
from typing import Dict, Any, Literal, List, Optional
from ..core.state import DiseaseTrackingState
from ..utils.report_renderer import ReportRenderer
from ..utils.recovery_calculator import calculate_recovery_progress, calculator
from ..utils.care_advisor import generate_care_advice


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
    target_disease = state.get("target_disease", "")  # 获取目标疾病名称

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

    # 生成护理建议 - 传入RAG上下文和疾病名称
    care_advice = generate_care_advice(
        verdict=final_verdict,
        recovery_progress=recovery_progress,
        user_profile=user_profile,
        trend_indicators=indicators,
        rag_context=rag_context,  # 传入RAG医学知识
        disease_name=target_disease  # 传入疾病名称
    )
    state["care_advice"] = care_advice

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
        "rag_insights": _extract_rag_insights(rag_context),
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
    
    # 分析严重度变化
    severity_timeline = indicators.get("severity_timeline", [])
    if severity_timeline and len(severity_timeline) >= 2:
        first = severity_timeline[0]
        last = severity_timeline[-1]
        if last < first:
            improvements.append(f"严重度从{first}级降至{last}级")
    
    # 分析病灶数变化
    lesion_trend = indicators.get("lesion_count_trend", "")
    if lesion_trend and "-" in str(lesion_trend):
        improvements.append(f"病灶数量减少{lesion_trend}")
    
    # 分析面积变化
    area_change = indicators.get("affected_area_change", "")
    if area_change and "-" in str(area_change):
        improvements.append(f"受影响面积减少{area_change}")
    
    return improvements


def _extract_remaining_issues(indicators: Dict[str, Any]) -> list:
    """提取遗留问题"""
    issues = []
    
    # 分析异常点
    anomaly_points = indicators.get("anomaly_points", [])
    if anomaly_points and anomaly_points != ["无"]:
        issues.extend(anomaly_points)
    
    # 分析诊断一致性
    if not indicators.get("disease_consistency", True):
        issues.append("诊断结果存在波动，需进一步观察")
    
    # 分析API置信度
    api_confidence = indicators.get("api_confidence_trend", "")
    if api_confidence == "declining":
        issues.append("图像识别置信度下降，建议重新拍摄")
    
    return issues


def _extract_rag_insights(rag_context: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """
    提取RAG洞察信息
    
    Args:
        rag_context: RAG检索结果
        
    Returns:
        RAG洞察字典
    """
    if not rag_context:
        return {
            "available": False,
            "message": "未使用RAG知识库"
        }
    
    insights = {
        "available": True,
        "source": rag_context.get("source", "unknown"),
        "similar_cases_count": len(rag_context.get("similar_cases", [])),
        "prognosis_insights": rag_context.get("prognosis_insights", []),
        "medical_knowledge_summary": ""
    }
    
    # 提取医学知识摘要
    medical_knowledge = rag_context.get("medical_knowledge", "")
    if medical_knowledge:
        # 截取前200字符作为摘要
        summary = medical_knowledge[:200].replace("\n", " ")
        if len(medical_knowledge) > 200:
            summary += "..."
        insights["medical_knowledge_summary"] = summary
    
    # 提取症状信息
    symptoms = rag_context.get("symptoms", [])
    if symptoms:
        insights["key_symptoms"] = symptoms[:5]
    
    # 提取治疗建议
    treatments = rag_context.get("treatments", [])
    if treatments:
        insights["treatment_suggestions"] = treatments[:5]
    
    return insights
