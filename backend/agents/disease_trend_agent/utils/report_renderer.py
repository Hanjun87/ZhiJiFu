"""
报告渲染工具
"""

from typing import Dict, Any
from datetime import datetime


class ReportRenderer:
    """报告渲染工具类"""

    def render(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "report_type": data.get("report_type", "disease_trend_30d"),
            "generated_at": data.get("generated_at", datetime.now().isoformat()),
            "executive_summary": data.get("executive_summary", {}),
            "trend_analysis": data.get("trend_analysis", {}),
            "agent_decision_log": data.get("agent_decision_log", {}),
            "comparison_with_history": data.get("comparison_with_history", {}),
            "care_advice": data.get("care_advice", []),
            "alerts": data.get("alerts", []),
            "doctor_review_required": data.get("doctor_review_required", False)
        }

    def to_json(self, data: Dict[str, Any]) -> str:
        import json
        return json.dumps(data, ensure_ascii=False, indent=2)

    def to_markdown(self, data: Dict[str, Any]) -> str:
        summary = data.get("executive_summary", {})
        analysis = data.get("trend_analysis", {})

        md = f"""# 皮肤病趋势诊断报告

## 执行摘要

- **结论**: {summary.get('verdict', 'N/A')}
- **置信度**: {summary.get('confidence', 0):.0%}
- **风险等级**: {summary.get('risk_level', 'N/A')}
- **下一步行动**: {summary.get('next_action', 'N/A')}

## 趋势分析

- **持续天数**: {analysis.get('duration_days', 0)}天
- **照片数量**: {analysis.get('photos_count', 0)}张
- **严重度进展**: {analysis.get('severity_progression', [])}

## 告警信息

"""

        alerts = data.get("alerts", [])
        if alerts:
            for alert in alerts:
                md += f"- {alert}\n"
        else:
            md += "无告警\n"

        md += "\n## 医生审核\n"
        md += "需要医生审核" if data.get("doctor_review_required") else "无需医生审核"
        md += "\n"

        return md