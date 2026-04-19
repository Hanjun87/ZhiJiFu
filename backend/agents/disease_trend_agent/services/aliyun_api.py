"""
阿里云皮肤病识别API服务
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import requests
from ..config.settings import settings


class AliyunAPIService:
    """阿里云API服务"""
    
    def __init__(self):
        # 使用 get_api_key() 方法获取API Key
        self.api_key = settings.get_api_key() if hasattr(settings, 'get_api_key') else None
        self.endpoint = None  # 不再使用旧的端点配置
    
    def get_analysis_history(
        self,
        user_id: str,
        disease_type: Optional[str],
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        # 获取用户指定时间范围内的历史分析记录
        # TODO: 实现实际的API调用，从数据库获取真实历史记录
        # 目前返回空数组，让前端使用本地计算的数据
        return []
    
    def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        # 获取用户基本信息和肤质档案
        # TODO: 实现实际的API调用
        return {
            "user_id": user_id,
            "skin_type": "oily",
            "allergy_history": [],
            "medication_history": [],
            "age": 25,
            "gender": "female"
        }
