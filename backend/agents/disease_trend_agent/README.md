# 皮肤病趋势诊断Agent

## 简介

基于30天周期的疾病长期跟踪诊断Agent，用于分析皮肤病患者的病情趋势。

## 核心特性

- **动态决策**: 根据数据质量决定是否需要RAG补充
- **工具调用**: 自主决定是否查询历史案例
- **异常处理**: 数据矛盾时主动寻求外部信息
- **人机协作**: 严重情况主动转医生

## 快速开始

```python
from agents.disease_trend_agent import build_workflow, DiseaseTrackingState

# 构建工作流
app = build_workflow()

# 准备输入
state = DiseaseTrackingState(
    user_id="user_123",
    target_disease="acne",
    time_window_days=30
)

# 执行
result = app.invoke(state)
```

## 决策流程

1. **ALERT_DOCTOR** (最高优先级): 严重恶化时立即转医生
2. **REQUEST_DATA**: 数据不足时建议补充
3. **RAG_LOOKUP**: 趋势矛盾时查相似案例
4. **FINALIZE** (默认): 趋势明确时直接输出结论
