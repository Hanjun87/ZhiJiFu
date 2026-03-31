"""
输出组装节点
组装最终输出，判断是否需要知识库反馈
"""

from typing import Dict, Any
from datetime import datetime
import sys
import os

# 添加父目录到路径以支持绝对导入
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.state import DiagnosisState


def compile_output_node(state: DiagnosisState) -> Dict[str, Any]:
    """
    输出组装节点 - 组装最终报告
    
    Args:
        state: 当前状态，包含llm_diagnosis和vision_analysis
        
    Returns:
        包含final_output和should_feedback的字典
    """
    
    llm_diagnosis = state.get("llm_diagnosis", {})
    vision_analysis = state.get("vision_analysis", {})
    
    # 组装用户报告
    final_output = {
        "report_type": "skin_diagnosis",
        "generated_at": datetime.now().isoformat(),
        "diagnosis": llm_diagnosis.get("diagnosis", ""),
        "confidence": llm_diagnosis.get("confidence", 0),
        "differential": llm_diagnosis.get("differential", []),
        "treatment": llm_diagnosis.get("treatment_plan", {}),
        "advice": llm_diagnosis.get("lifestyle", []),
        "follow_up": llm_diagnosis.get("follow_up", ""),
        "warning": "建议线下就诊" if llm_diagnosis.get("referral_needed", False) else None,
        "red_flags": llm_diagnosis.get("red_flags", []),
        "disclaimer": "AI诊断仅供参考，请以专业医生意见为准"
    }
    
    # 判断是否为优质案例（值得入库）
    # 条件：高置信度 + 不需要转诊 + 视觉分析置信度高
    should_feedback = (
        llm_diagnosis.get("confidence", 0) > 0.85 and
        not llm_diagnosis.get("referral_needed", True) and
        vision_analysis.get("visual_confidence", 0) > 0.8
    )
    
    return {
        "final_output": final_output,
        "should_feedback": should_feedback
    }


def format_report_for_user(state: DiagnosisState) -> str:
    """
    格式化报告为用户友好的文本格式
    
    Args:
        state: 当前状态
        
    Returns:
        格式化后的报告文本
    """
    final_output = state.get("final_output", {})
    
    lines = []
    lines.append("=" * 40)
    lines.append("皮肤病诊断报告")
    lines.append("=" * 40)
    lines.append("")
    
    # 诊断结论
    lines.append(f"【诊断结论】{final_output.get('diagnosis', '')}")
    lines.append(f"【诊断置信度】{final_output.get('confidence', 0) * 100:.1f}%")
    lines.append("")
    
    # 鉴别诊断
    differential = final_output.get('differential', [])
    if differential:
        lines.append(f"【鉴别诊断】{', '.join(differential)}")
        lines.append("")
    
    # 治疗方案
    treatment = final_output.get('treatment', {})
    if treatment:
        lines.append("【治疗方案】")
        topical = treatment.get('topical', [])
        if topical:
            lines.append("  外用药物：")
            for item in topical:
                lines.append(f"    - {item}")
        oral = treatment.get('oral', [])
        if oral:
            lines.append("  口服药物：")
            for item in oral:
                lines.append(f"    - {item}")
        procedures = treatment.get('procedures', [])
        if procedures:
            lines.append("  辅助治疗：")
            for item in procedures:
                lines.append(f"    - {item}")
        lines.append("")
    
    # 生活建议
    advice = final_output.get('advice', [])
    if advice:
        lines.append("【生活建议】")
        for item in advice:
            lines.append(f"  - {item}")
        lines.append("")
    
    # 复查时间
    follow_up = final_output.get('follow_up', '')
    if follow_up:
        lines.append(f"【复查建议】{follow_up}")
        lines.append("")
    
    # 警告信息
    warning = final_output.get('warning')
    if warning:
        lines.append(f"⚠️ {warning}")
        lines.append("")
    
    # 危险信号
    red_flags = final_output.get('red_flags', [])
    if red_flags:
        lines.append("【危险信号】")
        for flag in red_flags:
            lines.append(f"  ⚠️ {flag}")
        lines.append("")
    
    # 免责声明
    disclaimer = final_output.get('disclaimer', '')
    if disclaimer:
        lines.append("-" * 40)
        lines.append(f"*{disclaimer}*")
    
    return "\n".join(lines)
