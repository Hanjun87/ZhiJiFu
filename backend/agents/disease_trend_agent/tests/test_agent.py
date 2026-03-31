"""
Agent测试
"""

import pytest
from unittest.mock import Mock, patch
from ..agents.trend_judge_agent import TrendJudgeAgent
from ..core.state import DiseaseTrackingState


class TestTrendJudgeAgent:
    """测试趋势判断Agent"""
    
    def test_build_context(self):
        """测试构建上下文"""
        agent = TrendJudgeAgent()
        
        state: DiseaseTrackingState = {
            "user_id": "user_123",
            "target_disease": "acne",
            "case_id": "case_456",
            "time_window_days": 30,
            "raw_records": [{}, {}, {}],
            "user_profile": None,
            "trend_indicators": {
                "severity_timeline": [2, 2, 1],
                "lesion_count_trend": "-20%",
                "affected_area_change": "-15%",
                "api_confidence_trend": "stable",
                "disease_consistency": True,
                "anomaly_points": []
            },
            "agent_decision": None,
            "rag_context": None,
            "final_verdict": None,
            "final_report": None,
            "alerts": [],
            "needs_doctor": False
        }
        
        context = agent._build_context(state)
        
        assert "user_123" in context
        assert "case_456" in context
        assert "照片数量：3/30天" in context
    
    @patch.object(TrendJudgeAgent, '_build_context')
    @patch('..agents.trend_judge_agent.ChatOpenAI')
    def test_invoke_returns_decision(self, mock_llm_class, mock_build_context):
        """测试invoke返回决策"""
        mock_build_context.return_value = "test context"
        
        mock_llm = Mock()
        mock_response = Mock()
        mock_response.content = '{"action": "FINALIZE", "reason": "test", "confidence": 0.9, "risk_level": "low"}'
        mock_llm.invoke.return_value = mock_response
        mock_llm_class.return_value = mock_llm
        
        agent = TrendJudgeAgent()
        
        state: DiseaseTrackingState = {
            "user_id": "user_123",
            "target_disease": "acne",
            "case_id": "case_456",
            "time_window_days": 30,
            "raw_records": [],
            "user_profile": None,
            "trend_indicators": None,
            "agent_decision": None,
            "rag_context": None,
            "final_verdict": None,
            "final_report": None,
            "alerts": [],
            "needs_doctor": False
        }
        
        result = agent.invoke(state)
        
        assert "agent_decision" in result
        assert "needs_doctor" in result
