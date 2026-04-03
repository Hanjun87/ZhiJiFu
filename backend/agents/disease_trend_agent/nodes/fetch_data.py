"""
数据获取节点
"""

from datetime import datetime, timedelta
from ..core.state import DiseaseTrackingState
from ..services.aliyun_api import AliyunAPIService


def fetch_data_node(state: DiseaseTrackingState) -> DiseaseTrackingState:
    """
    拉取30天照片+阿里云API历史结果
    
    Args:
        state: 当前状态
        
    Returns:
        更新后的状态
    """
    user_id = state["user_id"]
    target_disease = state.get("target_disease")
    days = state["time_window_days"]
    
    # 如果已经有数据，则跳过获取
    if state.get("raw_records"):
        return state
        
    # 计算时间范围
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    # 调用阿里云API服务获取历史记录
    api_service = AliyunAPIService()
    records = api_service.get_analysis_history(
        user_id=user_id,
        disease_type=target_disease,
        start_date=start_date,
        end_date=end_date
    )
    
    state["raw_records"] = records
    
    # 获取用户画像（肤质、过敏史、用药史）
    user_profile = api_service.get_user_profile(user_id)
    state["user_profile"] = user_profile
    
    return state
