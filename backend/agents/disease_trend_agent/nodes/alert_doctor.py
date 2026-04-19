"""
医生告警节点
"""

from ..core.state import DiseaseTrackingState


def alert_doctor_node(state: DiseaseTrackingState) -> DiseaseTrackingState:
    # 检测到严重情况时通知医生
    user_id = state["user_id"]
    case_id = state["case_id"]
    indicators = state.get("trend_indicators") or {}
    agent_decision = state.get("agent_decision") or {}
    
    # 构建告警信息
    alert_message = {
        "type": "disease_trend_alert",
        "user_id": user_id,
        "case_id": case_id,
        "severity": "high",
        "reason": agent_decision.get("reason", "检测到严重恶化信号"),
        "indicators": {
            "severity_timeline": indicators.get("severity_timeline", []),
            "anomaly_points": indicators.get("anomaly_points", [])
        },
        "timestamp": datetime.now().isoformat()
    }
    
    # TODO: 发送到消息队列或通知服务
    # 例如：message_queue.send("doctor_alerts", alert_message)
    
    # 添加告警记录
    if not state.get("alerts"):
        state["alerts"] = []
    state["alerts"].append(f"已触发医生告警: {alert_message['reason']}")
    
    # 标记需要医生审核
    state["needs_doctor"] = True
    
    return state


from datetime import datetime
