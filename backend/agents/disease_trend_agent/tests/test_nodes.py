"""
节点测试
"""

import pytest
from datetime import datetime
from ..core.state import DiseaseTrackingState
from ..nodes.init_config import init_config_node
from ..nodes.extract_indicators import extract_indicators_node


class TestInitConfigNode:
    """测试初始化配置节点"""
    
    def test_assign_case_id(self):
        """测试分配case_id"""
        state: DiseaseTrackingState = {
            "user_id": "user_123",
            "target_disease": "acne",
            "case_id": None,
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
        
        result = init_config_node(state)
        
        assert result["case_id"] is not None
        assert result["case_id"].startswith("case_")
    
    def test_keep_existing_case_id(self):
        """测试保留已有case_id"""
        state: DiseaseTrackingState = {
            "user_id": "user_123",
            "target_disease": "acne",
            "case_id": "case_existing",
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
        
        result = init_config_node(state)
        
        assert result["case_id"] == "case_existing"


class TestExtractIndicatorsNode:
    """测试指标提取节点"""
    
    def test_empty_records(self):
        """测试空记录"""
        state: DiseaseTrackingState = {
            "user_id": "user_123",
            "target_disease": "acne",
            "case_id": "case_123",
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
        
        result = extract_indicators_node(state)
        
        assert result["trend_indicators"] is not None
        assert result["trend_indicators"]["severity_timeline"] == []
    
    def test_extract_severity_timeline(self):
        """测试提取严重度时间线"""
        state: DiseaseTrackingState = {
            "user_id": "user_123",
            "target_disease": "acne",
            "case_id": "case_123",
            "time_window_days": 30,
            "raw_records": [
                {"analysis_result": {"severity": 2}},
                {"analysis_result": {"severity": 2}},
                {"analysis_result": {"severity": 1}}
            ],
            "user_profile": None,
            "trend_indicators": None,
            "agent_decision": None,
            "rag_context": None,
            "final_verdict": None,
            "final_report": None,
            "alerts": [],
            "needs_doctor": False
        }
        
        result = extract_indicators_node(state)
        
        assert result["trend_indicators"]["severity_timeline"] == [2, 2, 1]
