"""
LangGraph工作流定义
基于皮肤保养Agent设计文档中的拓扑结构
"""

from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from .state import SkincareState


def build_workflow():
    """
    构建皮肤保养Agent工作流

    流程：
    entry_point → user_analysis → rag_retrieval → ingredient_check → llm_reasoning → compile_output → END

    Returns:
        编译后的工作流
    """
    from ..nodes.user_analysis import user_analysis_node
    from ..nodes.rag_retrieval import rag_retrieval_node
    from ..nodes.ingredient_check import ingredient_check_node
    from ..nodes.llm_reasoning import llm_reasoning_node
    from ..nodes.compile_output import compile_output_node

    workflow = StateGraph(SkincareState)

    workflow.add_node("user_analysis", user_analysis_node)
    workflow.add_node("rag_retrieval", rag_retrieval_node)
    workflow.add_node("ingredient_check", ingredient_check_node)
    workflow.add_node("llm_reasoning", llm_reasoning_node)
    workflow.add_node("compile_output", compile_output_node)

    workflow.set_entry_point("user_analysis")

    workflow.add_edge("user_analysis", "rag_retrieval")
    workflow.add_edge("rag_retrieval", "ingredient_check")
    workflow.add_edge("ingredient_check", "llm_reasoning")
    workflow.add_edge("llm_reasoning", "compile_output")
    workflow.add_edge("compile_output", END)

    checkpointer = MemorySaver()

    return workflow.compile(checkpointer=checkpointer)


_workflow_instance = None


def get_workflow():
    """
    获取工作流实例（单例模式）

    Returns:
        编译后的工作流实例
    """
    global _workflow_instance
    if _workflow_instance is None:
        _workflow_instance = build_workflow()
    return _workflow_instance
