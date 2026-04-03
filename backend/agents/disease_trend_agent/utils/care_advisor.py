"""
护理建议生成模块
根据病情趋势、RAG医学知识和恢复进度生成个性化护理建议
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum


class SkinType(str, Enum):
    """肤质类型"""
    OILY = "oily"
    DRY = "dry"
    MIXED = "mixed"
    SENSITIVE = "sensitive"
    NORMAL = "normal"


class CarePriority(str, Enum):
    """护理优先级"""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


@dataclass
class CareAdvice:
    """护理建议数据类"""
    category: str  # 类别：清洁、保湿、防晒、饮食、作息等
    priority: CarePriority
    title: str
    description: str
    tips: List[str]
    frequency: Optional[str] = None  # 建议频率
    products: Optional[List[str]] = None  # 推荐产品类型


class CareAdvisor:
    """
    护理建议生成器
    根据病情趋势、RAG医学知识和用户画像生成个性化护理建议
    """

    # 基础护理建议模板
    BASE_ADVICE = {
        "cleaning": {
            "title": "温和清洁",
            "description": "选择温和的洁面产品，避免过度清洁导致皮肤屏障受损",
            "tips": [
                "早晚各清洁一次，避免频繁洗脸",
                "使用温水（32-35°C）洁面",
                "避免使用含酒精、香精的洁面产品",
                "洁面后轻拍干燥，不要用力擦拭"
            ]
        },
        "moisturizing": {
            "title": "适度保湿",
            "description": "保持皮肤水油平衡，选择适合肤质的保湿产品",
            "tips": [
                "洁面后3分钟内使用保湿产品",
                "根据肤质选择质地：油性选清爽型，干性选滋润型",
                "避免使用含致痘成分的保湿品"
            ]
        },
        "sunscreen": {
            "title": "严格防晒",
            "description": "紫外线会加重炎症和色素沉着，必须做好防晒",
            "tips": [
                "每天使用SPF30+的防晒产品",
                "户外活动每2-3小时补涂一次",
                "优先选择物理防晒或物化结合防晒",
                "配合遮阳帽、遮阳伞等物理防晒"
            ]
        },
        "diet": {
            "title": "饮食调理",
            "description": "合理的饮食有助于皮肤恢复",
            "tips": [
                "多喝水，每天保持1500-2000ml",
                "减少高糖、高油、辛辣食物摄入",
                "增加富含维生素A、C、E的食物",
                "适量补充锌元素（如坚果、海鲜）"
            ]
        },
        "lifestyle": {
            "title": "作息规律",
            "description": "良好的生活习惯是皮肤健康的基础",
            "tips": [
                "保证每天7-8小时睡眠",
                "晚上11点前入睡，避免熬夜",
                "定期更换枕巾，保持清洁",
                "避免用手触摸、挤压痘痘"
            ]
        }
    }

    # 针对趋势的特定建议
    TREND_SPECIFIC_ADVICE = {
        "better": {
            "title": "康复期护理",
            "description": "病情正在好转，继续保持当前护理方案",
            "tips": [
                "不要因好转而中断护理",
                "可逐步引入修复类产品",
                "注意预防痘印、色素沉着",
                "维持当前治疗节奏"
            ]
        },
        "worse": {
            "title": "急性期护理",
            "description": "病情恶化，需要加强护理并及时就医",
            "tips": [
                "简化护肤步骤，避免刺激",
                "暂停使用功效型产品（美白、抗衰等）",
                "冷敷可缓解红肿不适",
                "记录恶化时间和可能诱因"
            ]
        },
        "stable": {
            "title": "稳定期护理",
            "description": "病情稳定，重点维持和预防",
            "tips": [
                "坚持基础护理不松懈",
                "可尝试温和的功效产品",
                "定期拍照记录观察变化",
                "寻找可能的诱发因素并避免"
            ]
        },
        "insufficient": {
            "title": "观察期护理",
            "description": "数据不足，先做好基础护理并增加记录",
            "tips": [
                "每天拍照记录皮肤状况",
                "记录饮食、作息、护肤变化",
                "坚持基础护理方案",
                "2周后评估是否需要就医"
            ]
        }
    }

    # 肤质特定建议
    SKIN_TYPE_ADVICE = {
        SkinType.OILY: {
            "title": "油性肌肤护理",
            "tips": [
                "选择控油但不紧绷的洁面产品",
                "使用清爽型水乳，避免厚重质地",
                "可定期使用泥膜清洁（每周1-2次）",
                "避免使用含矿物油、羊毛脂的产品"
            ]
        },
        SkinType.DRY: {
            "title": "干性肌肤护理",
            "tips": [
                "选择氨基酸类温和洁面",
                "使用滋润型保湿产品，必要时加面油",
                "避免过度清洁，早上可用清水洗脸",
                "注意环境加湿，避免空调直吹"
            ]
        },
        SkinType.MIXED: {
            "title": "混合肌肤护理",
            "tips": [
                "T区和脸颊可分区护理",
                "选择平衡型产品",
                "T区可适当控油，脸颊加强保湿",
                "避免全脸使用强力控油产品"
            ]
        },
        SkinType.SENSITIVE: {
            "title": "敏感肌肤护理",
            "tips": [
                "使用专为敏感肌设计的温和产品",
                "避免使用含酒精、香精、色素的产品",
                "新产品先在小面积测试",
                "简化护肤步骤，减少刺激源"
            ]
        },
        SkinType.NORMAL: {
            "title": "中性肌肤护理",
            "tips": [
                "保持当前护理习惯",
                "根据季节调整产品质地",
                "注意预防，维持皮肤稳定"
            ]
        }
    }

    def __init__(self):
        self.advice_cache = {}

    def generate_advice(
        self,
        verdict: str,
        recovery_progress: Dict[str, Any],
        user_profile: Optional[Dict[str, Any]] = None,
        trend_indicators: Optional[Dict[str, Any]] = None,
        rag_context: Optional[Dict[str, Any]] = None,
        disease_name: Optional[str] = None
    ) -> List[CareAdvice]:
        """
        生成护理建议

        Args:
            verdict: 诊断结论 (better/worse/stable/insufficient)
            recovery_progress: 恢复进度信息
            user_profile: 用户画像
            trend_indicators: 趋势指标
            rag_context: RAG检索结果（包含医学知识）
            disease_name: 疾病名称

        Returns:
            护理建议列表
        """
        advice_list = []
        skin_type = self._parse_skin_type(user_profile)
        recovery_percent = recovery_progress.get("recovery_percent", 0)
        progress_changed = recovery_progress.get("progress_changed", "uncertain")

        # 1. 添加基础护理建议（根据恢复进度动态调整）
        advice_list.extend(self._generate_base_advice(recovery_percent, progress_changed))

        # 2. 添加趋势特定建议
        trend_advice = self._generate_trend_advice(verdict, recovery_percent)
        if trend_advice:
            advice_list.append(trend_advice)

        # 3. 添加肤质特定建议
        skin_advice = self._generate_skin_type_advice(skin_type)
        if skin_advice:
            advice_list.append(skin_advice)

        # 4. 添加恢复进度特定建议
        progress_advice = self._generate_progress_specific_advice(recovery_progress)
        if progress_advice:
            advice_list.append(progress_advice)

        # 5. 添加RAG医学知识相关的护理建议（传入疾病名称）
        if rag_context:
            rag_advice = self._generate_rag_based_advice(rag_context, verdict, disease_name)
            if rag_advice:
                advice_list.extend(rag_advice)

        return advice_list

    def _parse_skin_type(self, user_profile: Optional[Dict[str, Any]]) -> SkinType:
        """解析肤质类型"""
        if not user_profile:
            return SkinType.MIXED

        skin_type_str = user_profile.get("skin_type", "mixed").lower()
        try:
            return SkinType(skin_type_str)
        except ValueError:
            return SkinType.MIXED

    def _generate_base_advice(
        self,
        recovery_percent: float,
        progress_changed: str
    ) -> List[CareAdvice]:
        """生成基础护理建议"""
        advice_list = []

        # 根据恢复进度调整优先级
        if recovery_percent < 30:
            priority = CarePriority.HIGH
        elif recovery_percent < 70:
            priority = CarePriority.MEDIUM
        else:
            priority = CarePriority.LOW

        # 清洁建议
        advice_list.append(CareAdvice(
            category="cleaning",
            priority=priority,
            title=self.BASE_ADVICE["cleaning"]["title"],
            description=self.BASE_ADVICE["cleaning"]["description"],
            tips=self.BASE_ADVICE["cleaning"]["tips"],
            frequency="每天早晚各1次"
        ))

        # 保湿建议
        advice_list.append(CareAdvice(
            category="moisturizing",
            priority=priority,
            title=self.BASE_ADVICE["moisturizing"]["title"],
            description=self.BASE_ADVICE["moisturizing"]["description"],
            tips=self.BASE_ADVICE["moisturizing"]["tips"],
            frequency="每天2-3次"
        ))

        # 防晒建议（始终高优先级）
        advice_list.append(CareAdvice(
            category="sunscreen",
            priority=CarePriority.HIGH,
            title=self.BASE_ADVICE["sunscreen"]["title"],
            description=self.BASE_ADVICE["sunscreen"]["description"],
            tips=self.BASE_ADVICE["sunscreen"]["tips"],
            frequency="每天白天使用"
        ))

        # 饮食建议
        advice_list.append(CareAdvice(
            category="diet",
            priority=CarePriority.MEDIUM,
            title=self.BASE_ADVICE["diet"]["title"],
            description=self.BASE_ADVICE["diet"]["description"],
            tips=self.BASE_ADVICE["diet"]["tips"]
        ))

        # 作息建议
        advice_list.append(CareAdvice(
            category="lifestyle",
            priority=CarePriority.MEDIUM,
            title=self.BASE_ADVICE["lifestyle"]["title"],
            description=self.BASE_ADVICE["lifestyle"]["description"],
            tips=self.BASE_ADVICE["lifestyle"]["tips"]
        ))

        return advice_list

    def _generate_trend_advice(self, verdict: str, recovery_percent: float) -> Optional[CareAdvice]:
        """生成趋势特定建议"""
        trend_data = self.TREND_SPECIFIC_ADVICE.get(verdict)
        if not trend_data:
            return None

        # 根据趋势确定优先级
        if verdict == "worse":
            priority = CarePriority.HIGH
        elif verdict == "better":
            priority = CarePriority.MEDIUM
        else:
            priority = CarePriority.LOW

        return CareAdvice(
            category="trend_specific",
            priority=priority,
            title=trend_data["title"],
            description=trend_data["description"],
            tips=trend_data["tips"]
        )

    def _generate_skin_type_advice(self, skin_type: SkinType) -> Optional[CareAdvice]:
        """生成肤质特定建议"""
        skin_data = self.SKIN_TYPE_ADVICE.get(skin_type)
        if not skin_data:
            return None

        return CareAdvice(
            category="skin_type",
            priority=CarePriority.MEDIUM,
            title=skin_data["title"],
            description=f"针对{skin_type.value}肤质的特别护理建议",
            tips=skin_data["tips"]
        )

    def _generate_progress_specific_advice(
        self,
        recovery_progress: Dict[str, Any]
    ) -> Optional[CareAdvice]:
        """根据恢复进度生成特定建议"""
        recovery_percent = recovery_progress.get("recovery_percent", 0)
        details = recovery_progress.get("details", {})

        tips = []
        title = ""
        description = ""

        if recovery_percent < 30:
            title = "初期恢复阶段"
            description = "皮肤处于恢复初期，需要耐心和细致的护理"
            tips = [
                "重点是控制炎症，避免刺激",
                "不要急于使用功效型产品",
                "严格遵医嘱用药",
                "保持积极心态，恢复需要时间"
            ]
        elif recovery_percent < 60:
            title = "中期恢复阶段"
            description = "皮肤正在逐步恢复，继续保持护理节奏"
            tips = [
                "可逐步引入修复类产品",
                "注意观察皮肤对新产品的反应",
                "加强防晒，预防色素沉着",
                "定期记录恢复情况"
            ]
        elif recovery_percent < 90:
            title = "后期恢复阶段"
            description = "皮肤基本恢复，重点转向维持和预防"
            tips = [
                "继续使用维稳类产品",
                "可开始处理痘印问题",
                "总结有效的护理方法",
                "建立长期护肤习惯"
            ]
        else:
            title = "恢复完成"
            description = "皮肤已基本恢复健康，保持良好习惯防止复发"
            tips = [
                "继续保持基础护肤",
                "定期皮肤检查",
                "记录可能诱发因素",
                "建立健康生活方式"
            ]

        # 添加详细指标相关的建议
        lesion_recovery = details.get("lesion_recovery", {})
        area_recovery = details.get("area_recovery", {})
        severity_recovery = details.get("severity_recovery", {})

        if lesion_recovery.get("velocity", 0) > 0:
            tips.append("⚠️ 病灶数有增加趋势，建议及时就医检查")

        if area_recovery.get("velocity", 0) > 0:
            tips.append("⚠️ 受影响面积在扩大，需要调整护理方案")

        return CareAdvice(
            category="progress_specific",
            priority=CarePriority.HIGH if recovery_percent < 30 else CarePriority.MEDIUM,
            title=title,
            description=description,
            tips=tips
        )

    def _generate_rag_based_advice(
        self,
        rag_context: Dict[str, Any],
        verdict: str,
        disease_name: Optional[str] = None
    ) -> List[CareAdvice]:
        """
        基于RAG医学知识生成护理建议
        
        Args:
            rag_context: RAG检索结果
            verdict: 诊断结论
            disease_name: 疾病名称
            
        Returns:
            护理建议列表
        """
        advice_list = []
        
        # 从RAG结果中提取医学知识
        medical_knowledge = rag_context.get("medical_knowledge", "")
        
        # 获取疾病显示名称
        disease_display = disease_name or "该疾病"
        
        # 提取注意事项作为护理建议
        precautions = rag_context.get("precautions", [])
        if precautions:
            advice_list.append(CareAdvice(
                category="medical_precautions",
                priority=CarePriority.HIGH if verdict == "worse" else CarePriority.MEDIUM,
                title=f"【{disease_display}】医学注意事项",
                description=f"基于医学知识库针对{disease_display}的注意事项",
                tips=[f"针对{disease_display}：{tip}" for tip in precautions[:5]]  # 最多5条
            ))
        
        # 提取日常护理建议
        daily_care = rag_context.get("daily_care", [])
        if daily_care:
            advice_list.append(CareAdvice(
                category="medical_care",
                priority=CarePriority.MEDIUM,
                title=f"【{disease_display}】专业护理建议",
                description=f"基于医学指南针对{disease_display}的护理建议",
                tips=[f"针对{disease_display}：{tip}" for tip in daily_care[:5]]
            ))
        
        # 提取饮食建议
        diet_suggestions = rag_context.get("diet_suggestions", [])
        if diet_suggestions:
            advice_list.append(CareAdvice(
                category="medical_diet",
                priority=CarePriority.MEDIUM,
                title=f"【{disease_display}】医学饮食建议",
                description=f"基于医学知识针对{disease_display}的饮食调理建议",
                tips=[f"针对{disease_display}：{tip}" for tip in diet_suggestions[:5]]
            ))
        
        # 如果有趋势相关知识，添加趋势处理建议
        trend_knowledge = rag_context.get("trend_knowledge", {})
        if trend_knowledge and isinstance(trend_knowledge, dict):
            trend_response = trend_knowledge.get("response", "")
            if trend_response:
                advice_list.append(CareAdvice(
                    category="trend_analysis",
                    priority=CarePriority.HIGH,
                    title=f"【{disease_display}】趋势分析建议",
                    description=f"基于医学知识针对{disease_display}的趋势处理建议",
                    tips=[
                        f"针对{disease_display}的医学指南建议：",
                        trend_response[:200] + "..." if len(trend_response) > 200 else trend_response
                    ]
                ))
        
        # 如果没有提取到任何具体建议，但有医学知识文本，添加一个通用建议
        if not advice_list and medical_knowledge:
            advice_list.append(CareAdvice(
                category="disease_specific",
                priority=CarePriority.HIGH,
                title=f"【{disease_display}】疾病护理要点",
                description=f"基于医学知识库针对{disease_display}的护理要点",
                tips=[
                    f"疾病：{disease_display}",
                    "请遵循医生的治疗方案",
                    "保持良好的生活习惯",
                    "定期复查监测病情变化"
                ]
            ))
        
        return advice_list

    def to_dict_list(self, advice_list: List[CareAdvice]) -> List[Dict[str, Any]]:
        """转换为字典列表"""
        return [
            {
                "category": advice.category,
                "priority": advice.priority.value,
                "title": advice.title,
                "description": advice.description,
                "tips": advice.tips,
                "frequency": advice.frequency,
                "products": advice.products
            }
            for advice in advice_list
        ]


# 全局实例
care_advisor = CareAdvisor()


def generate_care_advice(
    verdict: str,
    recovery_progress: Dict[str, Any],
    user_profile: Optional[Dict[str, Any]] = None,
    trend_indicators: Optional[Dict[str, Any]] = None,
    rag_context: Optional[Dict[str, Any]] = None,
    disease_name: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    生成护理建议的便捷函数

    Args:
        verdict: 诊断结论
        recovery_progress: 恢复进度信息
        user_profile: 用户画像
        trend_indicators: 趋势指标
        rag_context: RAG检索结果
        disease_name: 疾病名称

    Returns:
        护理建议字典列表
    """
    advice_list = care_advisor.generate_advice(
        verdict=verdict,
        recovery_progress=recovery_progress,
        user_profile=user_profile,
        trend_indicators=trend_indicators,
        rag_context=rag_context,
        disease_name=disease_name
    )
    return care_advisor.to_dict_list(advice_list)
