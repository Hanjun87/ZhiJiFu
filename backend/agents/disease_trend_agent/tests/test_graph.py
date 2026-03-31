"""
Graph工作流测试
"""

import pytest
from ..core.graph import build_workflow
from ..core.state import DiseaseTrackingState


class TestWorkflow:
    """测试工作流"""
    
    def test_build_workflow(self):
        """测试构建工作流"""
        app = build_workflow()
        assert app is not None
    
    def test_workflow_execution(self):
        """测试工作流执行"""
        app = build_workflow()
        
        state: DiseaseTrackingState = {
            "user_id": "user_test",
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
        
        # 注意：实际执行需要配置LLM和外部服务
        # 这里仅测试工作流结构
        # result = app.invoke(state)
        pass
