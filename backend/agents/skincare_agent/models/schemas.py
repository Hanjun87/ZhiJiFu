"""
Pydantic模型定义
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from .enums import SkinType, SkinGoal, VerdictType, RoutineLevel, CareCategory


class IngredientInfo(BaseModel):
    """成分信息"""
    ingredient: str = Field(..., description="成分名称")
    purpose: str = Field(..., description="功效")
    priority: int = Field(..., description="优先级 1-3")


class SkinProfile(BaseModel):
    """用户皮肤画像"""
    skin_type: SkinType = Field(..., description="肤质")
    skin_concerns: List[str] = Field(default_factory=list, description="皮肤问题列表")
    skin_goals: List[str] = Field(default_factory=list, description="护肤目标列表")
    age_range: str = Field("20-30", description="年龄段")
    sensitivity_factors: List[str] = Field(default_factory=list, description="敏感因素")
    routine_level: RoutineLevel = Field(RoutineLevel.NOVICE, description="护肤经验")
    confidence: float = Field(0.0, ge=0.0, le=1.0, description="解析置信度")


class CareAdviceItem(BaseModel):
    """护理建议项"""
    title: str = Field(..., description="建议标题")
    description: str = Field(..., description="详细描述")
    category: str = Field(..., description="类别: cleaning/moisturizing/sunscreen/treatment/lifestyle")


class IngredientAssessment(BaseModel):
    """成分检测结果"""
    is_compatible: bool = Field(..., description="产品是否兼容")
    conflicts: List[str] = Field(default_factory=list, description="冲突成分列表")
    recommendations: List[str] = Field(default_factory=list, description="推荐成分列表")
    assessment: str = Field("", description="评估说明")


class RoutineStep(BaseModel):
    """护肤步骤"""
    step: int = Field(..., description="步骤序号")
    product_type: str = Field(..., description="产品类型")
    ingredients: List[str] = Field(default_factory=list, description="推荐成分")
    notes: str = Field("", description="注意事项")


class Routine(BaseModel):
    """护肤方案"""
    morning_routine: List[str] = Field(default_factory=list, description="晨间步骤")
    evening_routine: List[str] = Field(default_factory=list, description="晚间步骤")
    recommended_ingredients: List[IngredientInfo] = Field(default_factory=list, description="推荐成分")
    products_to_avoid: List[str] = Field(default_factory=list, description="需避免的成分")
    expected_timeline: str = Field("", description="见效时间预期")
    lifestyle_tips: List[str] = Field(default_factory=list, description="生活习惯建议")


class SkincareResponse(BaseModel):
    """最终响应"""
    success: bool = Field(True, description="是否成功")
    skin_profile: Optional[Dict[str, Any]] = Field(None, description="用户画像")
    care_advice: List[CareAdviceItem] = Field(default_factory=list, description="护理建议")
    ai_verdict: VerdictType = Field(VerdictType.STABLE, description="AI点评")
    routine: Optional[Routine] = Field(None, description="护肤方案")
    ingredient_assessment: Optional[IngredientAssessment] = Field(None, description="成分检测结果")
    generated_at: datetime = Field(default_factory=datetime.now, description="生成时间")
