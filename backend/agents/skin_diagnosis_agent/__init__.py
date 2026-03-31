"""
皮肤病诊断Agent - 单次诊断版本
基于LangGraph实现，参考扣子Coze双模型+知识库架构
"""

from .core.graph import build_workflow
from .core.state import DiagnosisState

__all__ = ["build_workflow", "DiagnosisState"]
