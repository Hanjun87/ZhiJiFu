"""
LangGraph工作流定义
基于设计文档中的拓扑结构
"""

from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from .state import DiagnosisState


def build_workflow():
    # 延迟导入节点函数，避免循环导入问题
    from nodes.vision_analysis import vision_analysis_node
    from nodes.rag_retrieval import rag_retrieval_node
    from nodes.llm_reasoning import llm_reasoning_node
    from nodes.compile_output import compile_output_node
    from nodes.knowledge_feedback import knowledge_feedback_node
    
    # 创建工作流
    workflow = StateGraph(DiagnosisState)
    
    # 添加节点
    workflow.add_node("vision_analysis", vision_analysis_node)
    workflow.add_node("rag_retrieval", rag_retrieval_node)
    workflow.add_node("llm_reasoning", llm_reasoning_node)
    workflow.add_node("compile_output", compile_output_node)
    workflow.add_node("knowledge_feedback", knowledge_feedback_node)
    
    # 设置入口点
    workflow.set_entry_point("vision_analysis")
    
    # 线性流程（无复杂分支，保持简洁）
    workflow.add_edge("vision_analysis", "rag_retrieval")
    workflow.add_edge("rag_retrieval", "llm_reasoning")
    workflow.add_edge("llm_reasoning", "compile_output")
    
    # 主流程结束
    workflow.add_edge("compile_output", END)
    
    # 副作用分支（异步，不影响主流程）
    # 从compile_output到knowledge_feedback，然后结束
    workflow.add_edge("compile_output", "knowledge_feedback")
    workflow.add_edge("knowledge_feedback", END)
    
    # 记忆（支持断点续跑）
    checkpointer = MemorySaver()
    
    return workflow.compile(checkpointer=checkpointer)


# 全局工作流实例（单例）
_workflow_instance = None


def get_workflow():
    global _workflow_instance
    if _workflow_instance is None:
        _workflow_instance = build_workflow()
    return _workflow_instance
