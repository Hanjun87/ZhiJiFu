"""
高级恢复进度计算模块
使用多种指标和曲线拟合来计算更准确的恢复进度
"""

from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum


class TrendDirection(Enum):
    IMPROVING = "improving"
    STABLE = "stable"
    WORSTENING = "worsening"
    UNCERTAIN = "uncertain"


@dataclass
class RecoveryMetrics:
    """恢复指标数据类"""
    lesion_count_initial: int
    lesion_count_current: int
    area_percent_initial: float
    area_percent_current: float
    severity_initial: int
    severity_current: int
    days_elapsed: int
    total_expected_days: int
    lesion_count_min_possible: int = 0
    area_percent_min_possible: float = 0.0


class ReferenceCaseDB:
    """
    参考病例数据库（模拟）
    真实场景应从数据库或API获取
    """

    # 痘痘康复参考数据: (初始病灶数, 恢复周期天数)
    ACNE_REFERENCE_CASES = [
        {"lesion_count": 30, "recovery_days": 28, "skin_type": "oily"},
        {"lesion_count": 20, "recovery_days": 21, "skin_type": "oily"},
        {"lesion_count": 15, "recovery_days": 14, "skin_type": "mixed"},
        {"lesion_count": 10, "recovery_days": 10, "skin_type": "mixed"},
        {"lesion_count": 8, "recovery_days": 7, "skin_type": "dry"},
        {"lesion_count": 5, "recovery_days": 5, "skin_type": "dry"},
    ]

    @classmethod
    def get_recovery_baseline(cls, initial_lesion_count: int, skin_type: str = "mixed") -> int:
        """
        根据初始病灶数和肤质获取基准恢复周期
        使用线性插值估算
        """
        cases = sorted(cls.ACNE_REFERENCE_CASES, key=lambda x: x["lesion_count"])

        if initial_lesion_count >= cases[-1]["lesion_count"]:
            return cases[-1]["recovery_days"]
        if initial_lesion_count <= cases[0]["lesion_count"]:
            return cases[0]["recovery_days"]

        for i in range(len(cases) - 1):
            if cases[i]["lesion_count"] <= initial_lesion_count <= cases[i + 1]["lesion_count"]:
                ratio = (initial_lesion_count - cases[i]["lesion_count"]) / (
                    cases[i + 1]["lesion_count"] - cases[i]["lesion_count"]
                )
                baseline_diff = cases[i + 1]["recovery_days"] - cases[i]["recovery_days"]
                return int(cases[i]["recovery_days"] + ratio * baseline_diff)

        return 14


class AdvancedRecoveryCalculator:
    """
    高级恢复进度计算器

    使用多种指标综合计算恢复进度:
    1. 病灶数量变化
    2. 受影响面积百分比变化
    3. 严重度等级变化
    4. 曲线拟合预测
    5. 参考病例对比
    """

    def __init__(self):
        self.min_lesion_count = 0
        self.min_area_percent = 0.0

    def calculate(
        self,
        records: List[Dict[str, Any]],
        user_profile: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        计算恢复进度

        Args:
            records: 分析记录列表，每条记录包含 analysis_result
            user_profile: 用户画像（包含肤质等信息）

        Returns:
            恢复进度字典
        """
        if not records or len(records) < 2:
            return self._insufficient_data_response()

        skin_type = user_profile.get("skin_type", "mixed") if user_profile else "mixed"

        metrics = self._extract_metrics(records)
        if not metrics:
            return self._insufficient_data_response()

        lesion_recovery = self._calculate_lesion_recovery(metrics)
        area_recovery = self._calculate_area_recovery(metrics)
        severity_recovery = self._calculate_severity_recovery(metrics)

        weighted_recovery = (
            lesion_recovery["weight"] * lesion_recovery["percent"] +
            area_recovery["weight"] * area_recovery["percent"] +
            severity_recovery["weight"] * severity_recovery["percent"]
        )

        linear_fit = self._linear_fit_prediction(records)
        curve_fit_days = self._estimate_recovery_days(
            records, metrics, skin_type, linear_fit
        )

        trend = self._calculate_trend(records)

        lesion_velocity = self._calculate_velocity(
            [r.get("analysis_result", {}).get("lesion_count", 0) for r in records]
        )
        area_velocity = self._calculate_velocity(
            [r.get("analysis_result", {}).get("affected_area_percent", 0) for r in records]
        )

        return {
            "recovery_percent": round(weighted_recovery, 1),
            "estimated_days_to_full_recovery": curve_fit_days,
            "started_at": records[0].get("date", datetime.now().date().isoformat()),
            "progress_changed": trend.value,
            "confidence": self._calculate_confidence(len(records)),

            "details": {
                "lesion_recovery": {
                    "percent": lesion_recovery["percent"],
                    "change": lesion_recovery["change_str"],
                    "velocity": round(lesion_velocity, 2)
                },
                "area_recovery": {
                    "percent": area_recovery["percent"],
                    "change": area_recovery["change_str"],
                    "velocity": round(area_velocity, 2)
                },
                "severity_recovery": {
                    "percent": severity_recovery["percent"],
                    "from_level": metrics.severity_initial,
                    "to_level": metrics.severity_current
                },
                "trend_analysis": {
                    "lesion_trend": "↓" if lesion_velocity < 0 else ("↑" if lesion_velocity > 0 else "→"),
                    "area_trend": "↓" if area_velocity < 0 else ("↑" if area_velocity > 0 else "→"),
                    "is_accelerating": self._is_accelerating(records)
                },
                "reference_comparison": {
                    "baseline_days": ReferenceCaseDB.get_recovery_baseline(
                        metrics.lesion_count_initial, skin_type
                    ),
                    "similar_cases_available": len(ReferenceCaseDB.ACNE_REFERENCE_CASES)
                }
            }
        }

    def _extract_metrics(self, records: List[Dict[str, Any]]) -> Optional[RecoveryMetrics]:
        """提取关键指标"""
        try:
            first = records[0].get("analysis_result", {})
            last = records[-1].get("analysis_result", {})

            days_elapsed = len(records)

            return RecoveryMetrics(
                lesion_count_initial=first.get("lesion_count", 10),
                lesion_count_current=last.get("lesion_count", 10),
                area_percent_initial=first.get("affected_area_percent", 10.0),
                area_percent_current=last.get("affected_area_percent", 10.0),
                severity_initial=first.get("severity", 2),
                severity_current=last.get("severity", 2),
                days_elapsed=days_elapsed,
                total_expected_days=30
            )
        except (KeyError, TypeError):
            return None

    def _calculate_lesion_recovery(self, m: RecoveryMetrics) -> Dict[str, Any]:
        """计算病灶数恢复进度"""
        if m.lesion_count_initial <= self.min_lesion_count:
            return {"percent": 100, "change_str": "0%", "weight": 0.4}

        reduction = m.lesion_count_initial - m.lesion_count_current
        total_possible = m.lesion_count_initial - self.min_lesion_count

        percent = (reduction / total_possible) * 100 if total_possible > 0 else 0
        change_pct = (reduction / m.lesion_count_initial) * 100 if m.lesion_count_initial > 0 else 0

        return {
            "percent": round(percent, 1),
            "change_str": f"-{change_pct:.0f}%",
            "weight": 0.4
        }

    def _calculate_area_recovery(self, m: RecoveryMetrics) -> Dict[str, Any]:
        """计算面积恢复进度"""
        if m.area_percent_initial <= self.min_area_percent:
            return {"percent": 100, "change_str": "0%", "weight": 0.35}

        reduction = m.area_percent_initial - m.area_percent_current
        total_possible = m.area_percent_initial - self.min_area_percent

        percent = (reduction / total_possible) * 100 if total_possible > 0 else 0
        change_pct = (reduction / m.area_percent_initial) * 100 if m.area_percent_initial > 0 else 0

        return {
            "percent": round(percent, 1),
            "change_str": f"-{change_pct:.0f}%",
            "weight": 0.35
        }

    def _calculate_severity_recovery(self, m: RecoveryMetrics) -> Dict[str, Any]:
        """计算严重度恢复进度"""
        if m.severity_initial == m.severity_current:
            percent = 50 if m.severity_current > 1 else 100
        elif m.severity_current < m.severity_initial:
            total_drop = m.severity_initial - 1
            actual_drop = m.severity_initial - m.severity_current
            percent = (actual_drop / total_drop) * 100
        else:
            percent = 0

        return {
            "percent": round(percent, 1),
            "weight": 0.25
        }

    def _linear_fit_prediction(self, records: List[Dict[str, Any]]) -> Tuple[float, float]:
        """
        线性拟合病灶数变化，返回 (斜率, 截距)
        y = slope * x + intercept
        """
        n = len(records)
        if n < 2:
            return 0.0, 0.0

        x = list(range(n))
        y = [r.get("analysis_result", {}).get("lesion_count", 0) for r in records]

        x_mean = sum(x) / n
        y_mean = sum(y) / n

        numerator = sum((x[i] - x_mean) * (y[i] - y_mean) for i in range(n))
        denominator = sum((x[i] - x_mean) ** 2 for i in range(n))

        if denominator == 0:
            return 0.0, y_mean

        slope = numerator / denominator
        intercept = y_mean - slope * x_mean

        return slope, intercept

    def _estimate_recovery_days(
        self,
        records: List[Dict[str, Any]],
        m: RecoveryMetrics,
        skin_type: str,
        linear_fit: Tuple[float, float]
    ) -> Optional[int]:
        """
        估算完全恢复所需天数
        结合线性拟合和参考病例
        """
        slope, intercept = linear_fit

        if m.lesion_count_current <= self.min_lesion_count:
            return 0

        if slope >= 0:
            baseline = ReferenceCaseDB.get_recovery_baseline(m.lesion_count_initial, skin_type)
            return baseline

        remaining_lesions = m.lesion_count_current - self.min_lesion_count
        days_to_recover = remaining_lesions / abs(slope) if slope != 0 else None

        if days_to_recover is not None and days_to_recover < 200:
            return int(days_to_recover)

        baseline = ReferenceCaseDB.get_recovery_baseline(m.lesion_count_initial, skin_type)
        progress_ratio = m.days_elapsed / baseline if baseline > 0 else 0.5
        remaining_baseline = baseline * (1 - progress_ratio)

        return max(1, int(remaining_baseline))

    def _calculate_trend(self, records: List[Dict[str, Any]]) -> TrendDirection:
        """计算趋势方向"""
        if len(records) < 3:
            return TrendDirection.UNCERTAIN

        n = len(records)
        mid = n // 2

        first_half_avg = sum(
            r.get("analysis_result", {}).get("lesion_count", 0)
            for r in records[:mid]
        ) / mid
        second_half_avg = sum(
            r.get("analysis_result", {}).get("lesion_count", 0)
            for r in records[mid:]
        ) / (n - mid)

        diff = second_half_avg - first_half_avg

        if abs(diff) < 0.5:
            return TrendDirection.STABLE
        elif diff < 0:
            return TrendDirection.IMPROVING
        else:
            return TrendDirection.WORSTENING

    def _calculate_velocity(self, values: List[float]) -> float:
        """计算变化速度（每天变化量）"""
        if len(values) < 2:
            return 0.0

        total_change = values[-1] - values[0]
        days = len(values) - 1

        return total_change / days if days > 0 else 0.0

    def _is_accelerating(self, records: List[Dict[str, Any]]) -> bool:
        """判断恢复是否在加速"""
        if len(records) < 4:
            return False

        velocities = []
        for i in range(1, len(records)):
            curr = records[i].get("analysis_result", {}).get("lesion_count", 0)
            prev = records[i - 1].get("analysis_result", {}).get("lesion_count", 0)
            velocities.append(curr - prev)

        if len(velocities) < 2:
            return False

        first_half_avg = sum(velocities[:len(velocities)//2]) / (len(velocities)//2)
        second_half_avg = sum(velocities[len(velocities)//2:]) / (len(velocities) - len(velocities)//2)

        return second_half_avg < first_half_avg

    def _calculate_confidence(self, data_points: int) -> float:
        """根据数据点数量计算置信度"""
        if data_points >= 14:
            return 0.95
        elif data_points >= 7:
            return 0.85
        elif data_points >= 3:
            return 0.7
        elif data_points >= 2:
            return 0.5
        else:
            return 0.2

    def _insufficient_data_response(self) -> Dict[str, Any]:
        """数据不足时的默认响应"""
        return {
            "recovery_percent": 0,
            "estimated_days_to_full_recovery": None,
            "started_at": datetime.now().date().isoformat(),
            "progress_changed": "uncertain",
            "confidence": 0.1,
            "details": {
                "message": "数据不足，无法准确计算恢复进度"
            }
        }


# 全局实例
calculator = AdvancedRecoveryCalculator()


def calculate_recovery_progress(
    records: List[Dict[str, Any]],
    time_window_days: int = 30,
    user_profile: Optional[Dict[str, Any]] = None,
    start_date: Optional[str] = None
) -> Dict[str, Any]:
    """
    计算恢复进度的便捷函数

    Args:
        records: 分析记录列表
        time_window_days: 时间窗口天数
        user_profile: 用户画像
        start_date: 开始日期

    Returns:
        恢复进度字典
    """
    result = calculator.calculate(records, user_profile)

    if start_date:
        result["started_at"] = start_date
    elif records and len(records) > 0:
        result["started_at"] = records[0].get("date", datetime.now().date().isoformat())

    return result
