"""
趋势判断Agent：疾病跟踪的核心决策单元
"""

import json
from typing import Dict, Any
from langchain_community.chat_models import ChatTongyi
from ..core.state import DiseaseTrackingState
from ..config.settings import settings
from ..config.prompts import TREND_JUDGE_PROMPT


class TrendJudgeAgent:
    """
    趋势判断Agent：基于30天分析指标，自主决定下一步行动
    """
    
    def __init__(self):
        api_key = settings.get_api_key()
        if not api_key:
            raise ValueError("未配置 API Key，请设置 DASHSCOPE_API_KEY 或 BAILIAN_API_KEY 环境变量")
        self.llm = ChatTongyi(
            model=settings.BAILIAN_MODEL,
            temperature=settings.LLM_TEMPERATURE,
            dashscope_api_key=api_key
        )
    
    def invoke(self, state: DiseaseTrackingState) -> Dict[str, Any]:
        """
        基于30天分析指标，自主决定下一步行动
        
        Args:
            state: 当前状态
            
        Returns:
            包含agent_decision和needs_doctor的字典
        """
        # 构造决策上下文
        context = self._build_context(state)
        
        # 构造提示词
        prompt = TREND_JUDGE_PROMPT.format(context=context)
        
        # 调用LLM
        result = self.llm.invoke(prompt)
        
        # 解析JSON结果
        try:
            decision = json.loads(result.content)
        except json.JSONDecodeError:
            # 如果解析失败，使用默认决策
            decision = {
                "action": "FINALIZE",
                "reason": "解析失败，使用默认决策",
                "confidence": 0.5,
                "suggested_verdict": None,
                "risk_level": "medium"
            }
        
        return {
            "agent_decision": decision,
            "needs_doctor": decision["action"] == "ALERT_DOCTOR"
        }
    
    def _build_context(self, state: DiseaseTrackingState) -> str:
        """
        构建决策上下文
        
        Args:
            state: 当前状态
            
        Returns:
            格式化的上下文字符串
        """
        indicators = state.get("trend_indicators", {})
        
        return f"""
        【基础信息】
        用户ID：{state['user_id']}
        案例ID：{state.get('case_id', '新案例')}
        照片数量：{len(state.get('raw_records', []))}/30天
        
        【趋势指标】
        - 严重度变化：{indicators.get('severity_timeline', [])}
        - 病灶数变化：{indicators.get('lesion_count_trend', 'N/A')}
        - 面积变化：{indicators.get('affected_area_change', 'N/A')}
        - API置信度趋势：{indicators.get('api_confidence_trend', 'N/A')}
        - 诊断一致性：{'一致' if indicators.get('disease_consistency') else '不一致'}
        
        【异常点】
        {indicators.get('anomaly_points', '无')}
        """
