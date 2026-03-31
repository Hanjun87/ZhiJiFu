"""
疾病趋势诊断Agent模拟测试
使用模拟数据测试完整工作流程
"""

import sys
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any
from unittest.mock import Mock, patch, MagicMock

sys.path.insert(0, __file__)

from agents.disease_trend_agent import build_workflow, DiseaseTrackingState
from agents.disease_trend_agent.utils.data_processor import DataProcessor


def generate_mock_records(days: int = 30, trend: str = "improving") -> List[Dict[str, Any]]:
    """
    生成模拟30天记录数据

    Args:
        days: 天数
        trend: 趋势类型 "improving" | "worsening" | "stable" | "mixed"

    Returns:
        模拟记录列表
    """
    records = []
    base_date = datetime.now() - timedelta(days=days)

    for i in range(days):
        record_date = base_date + timedelta(days=i)

        if trend == "improving":
            severity = max(1, 3 - int(i / 10))
            lesion_count = max(5, 30 - int(i * 0.8))
            confidence = 0.7 + (i / days) * 0.25
        elif trend == "worsening":
            severity = min(3, 1 + int(i / 10))
            lesion_count = min(50, 10 + int(i * 1.2))
            confidence = 0.9 - (i / days) * 0.3
        elif trend == "stable":
            severity = 2
            lesion_count = 20 + (-2 if i % 2 == 0 else 2)
            confidence = 0.75 + (-0.05 if i % 2 == 0 else 0.05)
        else:
            severity = 2 if i < 15 else (1 if i < 20 else 3)
            lesion_count = 20 if i < 15 else (15 if i < 20 else 25)
            confidence = 0.8

        record = {
            "date": record_date.isoformat(),
            "analysis_result": {
                "disease": "acne",
                "severity": severity,
                "lesion_count": lesion_count,
                "affected_area_percent": lesion_count * 0.5,
                "confidence": min(0.99, confidence),
                "description": f"第{i+1}天分析结果"
            }
        }
        records.append(record)

    return records


def get_mock_agent_decision(trend: str, indicators: Dict[str, Any]) -> Dict[str, Any]:
    """
    根据趋势类型生成模拟Agent决策

    Args:
        trend: 趋势类型
        indicators: 趋势指标

    Returns:
        模拟决策
    """
    severity_timeline = indicators.get("severity_timeline", [])
    anomalies = indicators.get("anomaly_points", [])

    if anomalies and any("跳变" in a for a in anomalies):
        return {
            "action": "ALERT_DOCTOR",
            "reason": f"检测到严重度跳变异常: {anomalies}",
            "confidence": 0.92,
            "suggested_verdict": "uncertain",
            "risk_level": "high"
        }

    if len(severity_timeline) < 7:
        return {
            "action": "REQUEST_DATA",
            "reason": "数据不足，无法准确判断趋势",
            "confidence": 0.6,
            "suggested_verdict": None,
            "risk_level": "medium"
        }

    first_sev = severity_timeline[0] if severity_timeline else 2
    last_sev = severity_timeline[-1] if severity_timeline else 2

    if trend == "improving":
        return {
            "action": "FINALIZE",
            "reason": "趋势明确显示持续好转，严重度从3级降至1级",
            "confidence": 0.88,
            "suggested_verdict": "better",
            "risk_level": "low"
        }
    elif trend == "worsening":
        return {
            "action": "ALERT_DOCTOR",
            "reason": "病情持续恶化，严重度跳升，需要医生干预",
            "confidence": 0.91,
            "suggested_verdict": "worse",
            "risk_level": "high"
        }
    elif trend == "stable":
        return {
            "action": "FINALIZE",
            "reason": "病情保持稳定，无明显变化",
            "confidence": 0.85,
            "suggested_verdict": "stable",
            "risk_level": "low"
        }
    else:
        return {
            "action": "RAG_LOOKUP",
            "reason": "趋势波动较大，需要查询相似案例辅助判断",
            "confidence": 0.75,
            "suggested_verdict": None,
            "risk_level": "medium"
        }


class MockTrendJudgeAgent:
    """模拟TrendJudgeAgent"""

    def __init__(self):
        pass

    def invoke(self, state: DiseaseTrackingState) -> Dict[str, Any]:
        indicators = state.get("trend_indicators", {})
        severity_timeline = indicators.get("severity_timeline", [])

        if len(severity_timeline) >= 15:
            if all(s <= severity_timeline[0] for s in severity_timeline):
                trend = "improving"
            elif all(s >= severity_timeline[0] for s in severity_timeline):
                trend = "worsening"
            elif all(s == severity_timeline[0] for s in severity_timeline):
                trend = "stable"
            else:
                trend = "mixed"
        else:
            trend = "stable"

        decision = get_mock_agent_decision(trend, indicators)

        return {
            "agent_decision": decision,
            "needs_doctor": decision["action"] == "ALERT_DOCTOR"
        }


def build_mock_workflow_with_data(mock_records: List[Dict], user_profile: Dict = None):
    """构建使用模拟数据和模拟Agent的工作流"""
    from langgraph.graph import StateGraph, END
    from agents.disease_trend_agent.core.state import DiseaseTrackingState
    from agents.disease_trend_agent.core.router import route_by_agent_decision
    from agents.disease_trend_agent.nodes.init_config import init_config_node
    from agents.disease_trend_agent.nodes.extract_indicators import extract_indicators_node
    from agents.disease_trend_agent.nodes.rag_retrieval import rag_retrieval_node
    from agents.disease_trend_agent.nodes.finalize_report import finalize_report_node
    from agents.disease_trend_agent.nodes.alert_doctor import alert_doctor_node

    def mock_fetch_data_node(state: DiseaseTrackingState) -> DiseaseTrackingState:
        state["raw_records"] = mock_records
        state["user_profile"] = user_profile or {
            "skin_type": "oily",
            "allergy_history": ["none"],
            "medication_history": ["topical_retinoid"]
        }
        return state

    workflow = StateGraph(DiseaseTrackingState)

    workflow.add_node("init_config", init_config_node)
    workflow.add_node("fetch_data", mock_fetch_data_node)
    workflow.add_node("extract_indicators", extract_indicators_node)
    workflow.add_node("trend_judge_agent", MockTrendJudgeAgent().invoke)
    workflow.add_node("rag_retrieval", rag_retrieval_node)
    workflow.add_node("finalize_report", finalize_report_node)
    workflow.add_node("alert_doctor", alert_doctor_node)

    workflow.set_entry_point("init_config")
    workflow.add_edge("init_config", "fetch_data")
    workflow.add_edge("fetch_data", "extract_indicators")
    workflow.add_edge("extract_indicators", "trend_judge_agent")

    workflow.add_conditional_edges(
        "trend_judge_agent",
        route_by_agent_decision,
        {
            "FINALIZE": "finalize_report",
            "RAG_LOOKUP": "rag_retrieval",
            "REQUEST_DATA": END,
            "ALERT_DOCTOR": "alert_doctor"
        }
    )

    workflow.add_edge("rag_retrieval", "finalize_report")
    workflow.add_edge("alert_doctor", "finalize_report")
    workflow.add_edge("finalize_report", END)

    return workflow.compile()


def test_workflow_with_mock_data():
    """使用模拟数据测试完整工作流"""
    print("=" * 60)
    print("疾病趋势诊断Agent - 模拟数据测试")
    print("=" * 60)

    test_cases = [
        ("好转趋势", "improving"),
        ("恶化趋势", "worsening"),
        ("稳定趋势", "stable"),
        ("波动趋势（先好后坏）", "mixed"),
    ]

    for name, trend in test_cases:
        print(f"\n{'=' * 60}")
        print(f"测试用例: {name}")
        print("=" * 60)

        mock_records = generate_mock_records(days=30, trend=trend)

        print(f"\n生成模拟数据: {len(mock_records)}条记录")
        print(f"趋势类型: {trend}")

        print("\n--- 数据预览 (前5条和后5条) ---")
        for j, record in enumerate(mock_records[:5]):
            result = record["analysis_result"]
            print(f"  第{j+1}天: 严重度={result['severity']}, "
                  f"病灶数={result['lesion_count']}, "
                  f"置信度={result['confidence']:.2f}")
        print("  ...")
        for j, record in enumerate(mock_records[-5:]):
            result = record["analysis_result"]
            day_num = len(mock_records) - 5 + j + 1
            print(f"  第{day_num}天: 严重度={result['severity']}, "
                  f"病灶数={result['lesion_count']}, "
                  f"置信度={result['confidence']:.2f}")

        user_profile = {
            "skin_type": "oily",
            "allergy_history": ["none"],
            "medication_history": ["topical_retinoid"]
        }

        initial_state: DiseaseTrackingState = {
            "user_id": "test_user_001",
            "target_disease": "acne",
            "case_id": None,
            "time_window_days": 30,
            "raw_records": [],
            "user_profile": user_profile,
            "trend_indicators": None,
            "agent_decision": None,
            "rag_context": None,
            "final_verdict": None,
            "final_report": None,
            "alerts": [],
            "needs_doctor": False
        }

        print("\n--- 执行工作流 ---")
        try:
            app = build_mock_workflow_with_data(mock_records, user_profile)
            result = app.invoke(initial_state)

            print("\n--- 执行结果 ---")
            verdict = result.get("final_verdict", "N/A")
            decision = result.get("agent_decision", {})
            needs_doctor = result.get("needs_doctor", False)

            verdict_display = {
                "better": "✅ 好转",
                "worse": "⚠️ 恶化",
                "stable": "➡️ 稳定",
                "insufficient": "❓ 数据不足",
                "uncertain": "❓ 不确定"
            }

            print(f"最终判定: {verdict_display.get(verdict, verdict)}")
            print(f"Agent决策: {decision.get('action', 'N/A')}")
            print(f"决策理由: {decision.get('reason', 'N/A')}")
            print(f"置信度: {decision.get('confidence', 'N/A')}")
            print(f"风险等级: {decision.get('risk_level', 'N/A')}")
            print(f"需要医生: {'是 ⚠️' if needs_doctor else '否'}")

            if result.get("final_report"):
                report = result["final_report"]
                if isinstance(report, dict):
                    summary = report.get("executive_summary", {})
                    print(f"\n执行摘要:")
                    print(f"  下一步行动: {summary.get('next_action', 'N/A')}")

            if result.get("alerts"):
                print(f"\n告警信息:")
                for alert in result["alerts"]:
                    print(f"  - {alert}")

            if result.get("rag_context"):
                print(f"\nRAG检索结果:")
                similar = result["rag_context"].get("similar_cases", [])
                print(f"  找到相似案例: {len(similar)}个")

        except Exception as e:
            print(f"❌ 执行出错: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()

    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)


def test_data_processor():
    """测试数据处理器"""
    print("\n" + "=" * 60)
    print("数据处理器单元测试")
    print("=" * 60)

    processor = DataProcessor()

    test_cases = [
        ("好转数据", generate_mock_records(days=30, trend="improving")),
        ("恶化数据", generate_mock_records(days=30, trend="worsening")),
        ("稳定数据", generate_mock_records(days=30, trend="stable")),
        ("波动数据", generate_mock_records(days=30, trend="mixed")),
    ]

    for name, records in test_cases:
        print(f"\n--- {name} ---")

        severity_timeline = processor.extract_severity_timeline(records)
        lesion_trend = processor.calculate_lesion_count_trend(records)
        area_change = processor.calculate_area_change(records)
        confidence_trend = processor.analyze_confidence_trend(records)
        consistency = processor.check_disease_consistency(records)
        anomalies = processor.detect_anomalies(records)

        print(f"严重度时间线: {severity_timeline}")
        print(f"病灶数变化: {lesion_trend}")
        print(f"面积变化: {area_change}")
        print(f"置信度趋势: {confidence_trend}")
        print(f"诊断一致性: {'一致' if consistency else '不一致'}")
        print(f"异常点: {anomalies if anomalies else '无'}")


def test_mock_agent_decision():
    """测试模拟Agent决策"""
    print("\n" + "=" * 60)
    print("模拟Agent决策测试")
    print("=" * 60)

    processor = DataProcessor()

    test_cases = [
        ("好转数据", "improving"),
        ("恶化数据", "worsening"),
        ("稳定数据", "stable"),
        ("波动数据", "mixed"),
    ]

    for name, trend in test_cases:
        records = generate_mock_records(days=30, trend=trend)
        indicators = {
            "severity_timeline": processor.extract_severity_timeline(records),
            "lesion_count_trend": processor.calculate_lesion_count_trend(records),
            "affected_area_change": processor.calculate_area_change(records),
            "api_confidence_trend": processor.analyze_confidence_trend(records),
            "disease_consistency": processor.check_disease_consistency(records),
            "anomaly_points": processor.detect_anomalies(records)
        }

        state = {"trend_indicators": indicators}
        decision = get_mock_agent_decision(trend, indicators)

        print(f"\n--- {name} ---")
        print(f"趋势类型: {trend}")
        print(f"Agent决策: {decision['action']}")
        print(f"决策理由: {decision['reason']}")
        print(f"置信度: {decision['confidence']}")
        print(f"风险等级: {decision['risk_level']}")
        print(f"建议判定: {decision.get('suggested_verdict', 'N/A')}")


if __name__ == "__main__":
    test_data_processor()
    print("\n")
    test_mock_agent_decision()
    print("\n")
    test_workflow_with_mock_data()