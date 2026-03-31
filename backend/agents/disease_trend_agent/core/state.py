"""
状态定义
"""

from typing import TypedDict, List, Dict, Optional, Literal
from datetime import datetime


class DiseaseTrackingState(TypedDict):
    """疾病跟踪状态定义"""
    
    # ========== 输入层 ==========
    user_id: str
    target_disease: Optional[str]      # 指定跟踪的病种，如"acne"
    case_id: Optional[str]            # 当前案例ID（首次为None，系统分配）
    
    # ========== 配置层 ==========
    time_window_days: int             # 疾病固定30天
    
    # ========== 数据层 ==========
    raw_records: List[Dict]           # 30天拍照记录（含阿里云API结果）
    user_profile: Optional[Dict]      # 肤质、过敏史、用药史
    
    # ========== 分析层（图像算法提取）==========
    trend_indicators: Optional[Dict]   # 关键指标变化
    # {
    #   "severity_timeline": [1, 1, 2, 2, 2, 3, 3, ...],  # 1轻2中3重
    #   "lesion_count_trend": "+15%",                       # 病灶数变化
    #   "affected_area_change": "+23%",                     # 面积变化
    #   "api_confidence_trend": "declining",                # API置信度趋势
    #   "disease_consistency": False,                        # 诊断是否一致
    #   "anomaly_points": ["第12天突然加重", "第20天出现新病灶"]
    # }
    
    # ========== Agent决策层（核心）==========
    agent_decision: Optional[Dict]     # TrendJudgeAgent输出
    # {
    #   "action": "FINALIZE" | "RAG_LOOKUP" | "REQUEST_DATA" | "ALERT_DOCTOR",
    #   "reason": "趋势明确，持续好转中",
    #   "confidence": 0.85
    # }
    
    rag_context: Optional[Dict]       # RAG检索结果（如调用）
    
    # ========== 输出层 ==========
    final_verdict: Optional[Literal["better", "worse", "stable", "insufficient"]]
    final_report: Optional[Dict]
    alerts: List[str]
    needs_doctor: bool
