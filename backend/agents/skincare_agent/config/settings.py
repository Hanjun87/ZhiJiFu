"""
全局配置管理
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """全局配置"""

    # LLM配置
    LLM_MODEL: str = "qwen-plus"
    LLM_TEMPERATURE: float = 0.3

    # 阿里云百炼平台配置
    BAILIAN_API_KEY: Optional[str] = None
    DASHSCOPE_API_KEY: Optional[str] = None
    BAILIAN_MODEL: str = "qwen-plus"

    # 图像分析配置（可选）
    VISION_MODEL: str = "qwen-vl-plus"

    # RAG配置
    RAG_TOP_K: int = 5

    # 护肤方案分级阈值
    NOVICE_MAX_INGREDIENTS: int = 2
    INTERMEDIATE_MAX_INGREDIENTS: int = 4
    ADVANCED_MAX_INGREDIENTS: int = 6

    # 孕妇/哺乳期禁用成分
    PREGNANCY_BANNED_INGREDIENTS: list = [
        "视黄醇", "维A酸", "阿达帕林", "水杨酸", "曲酸", "壬二酸"
    ]

    def get_api_key(self) -> Optional[str]:
        """获取API Key，优先使用环境变量中的 DASHSCOPE_API_KEY"""
        return os.environ.get('DASHSCOPE_API_KEY') or os.environ.get('BAILIAN_API_KEY') or self.DASHSCOPE_API_KEY or self.BAILIAN_API_KEY

    class Config:
        env_file = ".env"
        env_prefix = "SKINCARE_"
        extra = "ignore"


settings = Settings()
