"""
条件路由逻辑
"""

from .state import DiseaseTrackingState


def route_by_agent_decision(state: DiseaseTrackingState) -> str:
    """
    Agent决策 -> Graph路由
    
    Args:
        state: 当前状态
        
    Returns:
        str: 下一个节点名称
    """
    action = state["agent_decision"]["action"]
    return action  # 直接返回，与节点名对应
