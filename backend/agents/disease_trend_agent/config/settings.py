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
    LLM_MODEL: str = "qwen-plus"
    LLM_TEMPERATURE: float = 0.2
    
    # 阿里云百炼平台配置 - 支持 DASHSCOPE_API_KEY 和 BAILIAN_API_KEY
    BAILIAN_API_KEY: Optional[str] = None
    DASHSCOPE_API_KEY: Optional[str] = None
    BAILIAN_MODEL: str = "qwen-plus"
    
    # RAG服务配置
    RAG_SERVICE_URL: Optional[str] = None
    RAG_TOP_K: int = 3
    
    # 医生通知配置
    DOCTOR_ALERT_ENABLED: bool = True
    DOCTOR_ALERT_CHANNELS: list = ["sms", "app_push"]
    
    def get_api_key(self) -> Optional[str]:
        """获取API Key，优先使用环境变量中的 DASHSCOPE_API_KEY"""
        # 直接从 os.environ 读取，确保获取最新的环境变量
        return os.environ.get('DASHSCOPE_API_KEY') or os.environ.get('BAILIAN_API_KEY') or self.DASHSCOPE_API_KEY or self.BAILIAN_API_KEY
    
    class Config:
        env_file = ".env"
        env_prefix = "DISEASE_TREND_"
        extra = "ignore"  # 忽略额外的环境变量


settings = Settings()
