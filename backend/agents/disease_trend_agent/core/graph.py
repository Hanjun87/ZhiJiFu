"""
工作流定义
"""

from langgraph.graph import StateGraph, END
from .state import DiseaseTrackingState
from .router import route_by_agent_decision
from ..nodes.init_config import init_config_node
from ..nodes.fetch_data import fetch_data_node
from ..nodes.extract_indicators import extract_indicators_node
from ..nodes.rag_retrieval import rag_retrieval_node
from ..nodes.finalize_report import finalize_report_node
from ..nodes.alert_doctor import alert_doctor_node
from ..agents.trend_judge_agent import TrendJudgeAgent


def build_workflow() -> StateGraph:
    # 构建疾病趋势诊断工作流
    workflow = StateGraph(DiseaseTrackingState)
    
    # 添加节点
    workflow.add_node("init_config", init_config_node)
    workflow.add_node("fetch_data", fetch_data_node)
    workflow.add_node("extract_indicators", extract_indicators_node)
    workflow.add_node("trend_judge_agent", TrendJudgeAgent().invoke)
    workflow.add_node("rag_retrieval", rag_retrieval_node)
    workflow.add_node("finalize_report", finalize_report_node)
    workflow.add_node("alert_doctor", alert_doctor_node)
    
    # 添加边
    workflow.set_entry_point("init_config")
    workflow.add_edge("init_config", "fetch_data")
    workflow.add_edge("fetch_data", "extract_indicators")
    workflow.add_edge("extract_indicators", "trend_judge_agent")
    
    # 条件边
    workflow.add_conditional_edges(
        "trend_judge_agent",
        route_by_agent_decision,
        {
            "FINALIZE": "rag_retrieval",
            "RAG_LOOKUP": "rag_retrieval",
            "REQUEST_DATA": "rag_retrieval",
            "ALERT_DOCTOR": "alert_doctor"
        }
    )
    
    workflow.add_edge("rag_retrieval", "finalize_report")
    workflow.add_edge("alert_doctor", "rag_retrieval")
    workflow.add_edge("finalize_report", END)
    
    return workflow.compile()
