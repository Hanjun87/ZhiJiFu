"""
全局配置管理
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """全局配置"""
    
    # 时间窗口配置
    TIME_WINDOW_DAYS: int = 30
    MIN_PHOTOS_FOR_ANALYSIS: int = 7
    SUFFICIENT_PHOTOS_THRESHOLD: int = 15
    
    # 阈值参数
    SEVERITY_JUMP_THRESHOLD: int = 2  # 严重度跳变阈值
    AREA_CHANGE_THRESHOLD: float = 0.5  # 面积变化阈值(50%)
    API_CONFIDENCE_THRESHOLD: float = 0.5  # API置信度阈值
    
    # LLM配置
    LLM_MODEL: str = "gpt-4"
    LLM_TEMPERATURE: float = 0.2
    
    # 阿里云API配置
    ALIYUN_API_KEY: Optional[str] = None
    ALIYUN_API_ENDPOINT: Optional[str] = None
    
    # RAG服务配置
    RAG_SERVICE_URL: Optional[str] = None
    RAG_TOP_K: int = 3
    
    # 医生通知配置
    DOCTOR_ALERT_ENABLED: bool = True
    DOCTOR_ALERT_CHANNELS: list = ["sms", "app_push"]
    
    class Config:
        env_file = ".env"
        env_prefix = "DISEASE_TREND_"


settings = Settings()
