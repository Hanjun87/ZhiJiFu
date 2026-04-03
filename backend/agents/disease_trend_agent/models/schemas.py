"""
Pydantic模型定义
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from .enums import ActionType, VerdictType, RiskLevel


class AgentDecision(BaseModel):
    """Agent决策输出"""
    action: ActionType = Field(..., description="决策动作")
    reason: str = Field(..., description="决策理由")
    confidence: float = Field(..., ge=0.0, le=1.0, description="置信度")
    suggested_verdict: Optional[VerdictType] = Field(None, description="建议结论")
    risk_level: RiskLevel = Field(RiskLevel.LOW, description="风险等级")


class TrendIndicators(BaseModel):
    """趋势指标"""
    severity_timeline: List[int] = Field(default_factory=list, description="严重度时间线")
    lesion_count_trend: str = Field("0%", description="病灶数变化趋势")
    affected_area_change: str = Field("0%", description="面积变化")
    api_confidence_trend: str = Field("stable", description="API置信度趋势")
    disease_consistency: bool = Field(True, description="诊断一致性")
    anomaly_points: List[str] = Field(default_factory=list, description="异常点")


class ExecutiveSummary(BaseModel):
    """执行摘要"""
    verdict: VerdictType = Field(..., description="结论")
    confidence: float = Field(..., ge=0.0, le=1.0, description="置信度")
    risk_level: RiskLevel = Field(..., description="风险等级")
    next_action: str = Field(..., description="下一步行动")


class TrendAnalysis(BaseModel):
    """趋势分析"""
    duration_days: int = Field(..., description="持续天数")
    photos_count: int = Field(..., description="照片数量")
    severity_progression: List[int] = Field(default_factory=list, description="严重度进展")
    key_improvements: List[str] = Field(default_factory=list, description="关键改善")
    remaining_issues: List[str] = Field(default_factory=list, description="遗留问题")


class AgentDecisionLog(BaseModel):
    """Agent决策日志"""
    initial_assessment: str = Field("", description="初始评估")
    action_taken: str = Field("", description="执行的动作")
    rag_consulted: bool = Field(False, description="是否咨询RAG")


class ComparisonWithHistory(BaseModel):
    """与历史案例对比"""
    similar_cases_found: int = Field(0, description="找到的相似案例数")
    recovery_speed_percentile: Optional[float] = Field(None, description="恢复速度百分位")


class CareAdviceItem(BaseModel):
    """护理建议项"""
    category: str = Field(..., description="建议类别")
    priority: str = Field(..., description="优先级: high/medium/low")
    title: str = Field(..., description="建议标题")
    description: str = Field(..., description="建议描述")
    tips: List[str] = Field(default_factory=list, description="具体建议列表")
    frequency: Optional[str] = Field(None, description="建议频率")
    products: Optional[List[str]] = Field(None, description="推荐产品类型")


class FinalReport(BaseModel):
    """最终报告"""
    report_type: str = Field("disease_trend_30d", description="报告类型")
    generated_at: datetime = Field(default_factory=datetime.now, description="生成时间")
    executive_summary: ExecutiveSummary = Field(..., description="执行摘要")
    trend_analysis: TrendAnalysis = Field(..., description="趋势分析")
    agent_decision_log: AgentDecisionLog = Field(default_factory=AgentDecisionLog, description="决策日志")
    comparison_with_history: ComparisonWithHistory = Field(default_factory=ComparisonWithHistory, description="历史对比")
    care_advice: List[CareAdviceItem] = Field(default_factory=list, description="护理建议")
    alerts: List[str] = Field(default_factory=list, description="告警信息")
    doctor_review_required: bool = Field(False, description="是否需要医生审核")


class SimilarCase(BaseModel):
    """相似案例"""
    case_id: str = Field(..., description="案例ID")
    similarity_score: float = Field(..., ge=0.0, le=1.0, description="相似度分数")
    patient_profile: Dict[str, Any] = Field(default_factory=dict, description="患者画像")
    timeline_pattern: str = Field("", description="时间线模式")
    final_outcome: str = Field("", description="最终结果")
    recovery_days: int = Field(0, description="恢复天数")
    key_intervention: str = Field("", description="关键干预")


class RAGQueryResult(BaseModel):
    """RAG查询结果"""
    similar_cases: List[SimilarCase] = Field(default_factory=list, description="相似案例")
    prognosis_insights: List[str] = Field(default_factory=list, description="预后洞察")
