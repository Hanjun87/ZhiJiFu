"""
皮肤病趋势诊断Agent

基于30天周期的疾病长期跟踪诊断Agent
"""

from .core.graph import build_workflow
from .core.state import DiseaseTrackingState

__all__ = ["build_workflow", "DiseaseTrackingState"]
