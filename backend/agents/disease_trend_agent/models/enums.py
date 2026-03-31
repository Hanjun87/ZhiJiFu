"""
枚举类型定义
"""

from enum import Enum


class ActionType(str, Enum):
    """Agent决策动作类型"""
    FINALIZE = "FINALIZE"
    RAG_LOOKUP = "RAG_LOOKUP"
    REQUEST_DATA = "REQUEST_DATA"
    ALERT_DOCTOR = "ALERT_DOCTOR"


class VerdictType(str, Enum):
    """最终结论类型"""
    BETTER = "better"
    WORSE = "worse"
    STABLE = "stable"
    INSUFFICIENT = "insufficient"


class RiskLevel(str, Enum):
    """风险等级"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class ConfidenceTrend(str, Enum):
    """置信度趋势"""
    INCREASING = "increasing"
    DECLINING = "declining"
    STABLE = "stable"


class SeverityLevel(int, Enum):
    """严重度等级"""
    MILD = 1
    MODERATE = 2
    SEVERE = 3
