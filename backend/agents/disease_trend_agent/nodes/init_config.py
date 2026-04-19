"""
初始化配置节点
"""

import uuid
from datetime import datetime, timedelta
from ..core.state import DiseaseTrackingState
from ..config.settings import settings


def init_config_node(state: DiseaseTrackingState) -> DiseaseTrackingState:
    # 初始化配置，分配case_id
    # 分配case_id（如果是新案例）
    if not state.get("case_id"):
        state["case_id"] = f"case_{uuid.uuid4().hex[:8]}"
    
    # 设置时间窗口
    state["time_window_days"] = settings.TIME_WINDOW_DAYS
    
    # 初始化列表
    if not state.get("raw_records"):
        state["raw_records"] = []
    if not state.get("alerts"):
        state["alerts"] = []
    
    return state
