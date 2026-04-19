"""
指标提取节点
"""

from typing import List, Dict, Any
from ..core.state import DiseaseTrackingState
from ..utils.data_processor import DataProcessor


def extract_indicators_node(state: DiseaseTrackingState) -> DiseaseTrackingState:
    # 从分析记录中提取趋势指标
    raw_records = state["raw_records"]
    
    if not raw_records:
        state["trend_indicators"] = {
            "severity_timeline": [],
            "lesion_count_trend": "0%",
            "affected_area_change": "0%",
            "api_confidence_trend": "stable",
            "disease_consistency": True,
            "anomaly_points": []
        }
        return state
    
    processor = DataProcessor()
    
    # 提取严重度时间线
    severity_timeline = processor.extract_severity_timeline(raw_records)
    
    # 计算病灶数变化趋势
    lesion_count_trend = processor.calculate_lesion_count_trend(raw_records)
    
    # 计算面积变化
    affected_area_change = processor.calculate_area_change(raw_records)
    
    # 分析API置信度趋势
    api_confidence_trend = processor.analyze_confidence_trend(raw_records)
    
    # 检查诊断一致性
    disease_consistency = processor.check_disease_consistency(raw_records)
    
    # 检测异常点
    anomaly_points = processor.detect_anomalies(raw_records)
    
    state["trend_indicators"] = {
        "severity_timeline": severity_timeline,
        "lesion_count_trend": lesion_count_trend,
        "affected_area_change": affected_area_change,
        "api_confidence_trend": api_confidence_trend,
        "disease_consistency": disease_consistency,
        "anomaly_points": anomaly_points
    }
    
    return state
