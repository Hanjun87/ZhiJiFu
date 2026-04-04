"""
枚举类型定义
"""

from enum import Enum


class SkinType(str, Enum):
    """肤质类型"""
    DRY = "干性"
    OILY = "油性"
    COMBINATION = "混合"
    NORMAL = "中性"
    SENSITIVE = "敏感性"


class SkinConcern(str, Enum):
    """皮肤问题"""
    ACNE = "痘痘"
    SPOTS = "色斑"
    WRINKLES = "皱纹"
    SENSITIVITY = "敏感"
    PORES = "毛孔"
    REDNESS = "泛红"
    DULLNESS = "暗沉"
    DEHYDRATION = "缺水"


class SkinGoal(str, Enum):
    """护肤目标"""
    ANTI_AGING = "抗衰老"
    WHITENING = "美白"
    OIL_CONTROL = "控油"
    MOISTURIZING = "保湿"
    REPAIR = "修复"
    ACNE_TREATMENT = "祛痘"


class VerdictType(str, Enum):
    """AI点评类型"""
    BETTER = "better"
    WORSE = "worse"
    STABLE = "stable"
    INSUFFICIENT = "insufficient"


class RoutineLevel(str, Enum):
    """护肤经验等级"""
    NOVICE = "新手"
    INTERMEDIATE = "进阶"
    ADVANCED = "专业"


class CareCategory(str, Enum):
    """护理建议类别"""
    CLEANSING = "cleaning"
    MOISTURIZING = "moisturizing"
    SUNSCREEN = "sunscreen"
    TREATMENT = "treatment"
    LIFESTYLE = "lifestyle"
