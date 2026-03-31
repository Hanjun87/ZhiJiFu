"""
数据处理工具
"""

from typing import List, Dict, Any


class DataProcessor:
    """数据处理工具类"""
    
    def extract_severity_timeline(self, records: List[Dict[str, Any]]) -> List[int]:
        """
        提取严重度时间线
        
        Args:
            records: 原始记录列表
            
        Returns:
            严重度时间线（1-3）
        """
        timeline = []
        for record in records:
            result = record.get("analysis_result", {})
            severity = result.get("severity", 1)
            timeline.append(severity)
        return timeline
    
    def calculate_lesion_count_trend(self, records: List[Dict[str, Any]]) -> str:
        """
        计算病灶数变化趋势
        
        Args:
            records: 原始记录列表
            
        Returns:
            变化百分比字符串，如"+15%"或"-20%"
        """
        if len(records) < 2:
            return "0%"
        
        first_count = records[0].get("analysis_result", {}).get("lesion_count", 0)
        last_count = records[-1].get("analysis_result", {}).get("lesion_count", 0)
        
        if first_count == 0:
            return "0%"
        
        change = ((last_count - first_count) / first_count) * 100
        sign = "+" if change >= 0 else ""
        return f"{sign}{change:.0f}%"
    
    def calculate_area_change(self, records: List[Dict[str, Any]]) -> str:
        """
        计算面积变化
        
        Args:
            records: 原始记录列表
            
        Returns:
            变化百分比字符串
        """
        if len(records) < 2:
            return "0%"
        
        first_area = records[0].get("analysis_result", {}).get("affected_area_percent", 0)
        last_area = records[-1].get("analysis_result", {}).get("affected_area_percent", 0)
        
        if first_area == 0:
            return "0%"
        
        change = ((last_area - first_area) / first_area) * 100
        sign = "+" if change >= 0 else ""
        return f"{sign}{change:.0f}%"
    
    def analyze_confidence_trend(self, records: List[Dict[str, Any]]) -> str:
        """
        分析API置信度趋势
        
        Args:
            records: 原始记录列表
            
        Returns:
            趋势描述：increasing, declining, stable
        """
        if len(records) < 2:
            return "stable"
        
        confidences = [r.get("analysis_result", {}).get("confidence", 0.5) for r in records]
        
        # 简单线性趋势判断
        first_half = sum(confidences[:len(confidences)//2]) / (len(confidences)//2 or 1)
        second_half = sum(confidences[len(confidences)//2:]) / (len(confidences) - len(confidences)//2 or 1)
        
        diff = second_half - first_half
        if diff > 0.05:
            return "increasing"
        elif diff < -0.05:
            return "declining"
        else:
            return "stable"
    
    def check_disease_consistency(self, records: List[Dict[str, Any]]) -> bool:
        """
        检查诊断一致性
        
        Args:
            records: 原始记录列表
            
        Returns:
            是否一致
        """
        if len(records) < 2:
            return True
        
        diseases = [r.get("analysis_result", {}).get("disease") for r in records]
        diseases = [d for d in diseases if d]  # 过滤None
        
        if not diseases:
            return True
        
        return len(set(diseases)) == 1
    
    def detect_anomalies(self, records: List[Dict[str, Any]]) -> List[str]:
        """
        检测异常点
        
        Args:
            records: 原始记录列表
            
        Returns:
            异常点描述列表
        """
        anomalies = []
        
        if len(records) < 2:
            return anomalies
        
        timeline = self.extract_severity_timeline(records)
        
        # 检测严重度跳变
        for i in range(1, len(timeline)):
            diff = abs(timeline[i] - timeline[i-1])
            if diff >= 2:  # 跳变2级以上
                anomalies.append(f"第{i+1}天严重度跳变{diff}级")
        
        # 检测病灶数突变
        for i in range(1, len(records)):
            prev_count = records[i-1].get("analysis_result", {}).get("lesion_count", 0)
            curr_count = records[i].get("analysis_result", {}).get("lesion_count", 0)
            
            if prev_count > 0:
                change = abs(curr_count - prev_count) / prev_count
                if change > 0.5:  # 变化超过50%
                    direction = "增加" if curr_count > prev_count else "减少"
                    anomalies.append(f"第{i+1}天病灶数{direction}{change*100:.0f}%")
        
        return anomalies
