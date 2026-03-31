# 疾病趋势诊断Agent目录设计

**版本**：v1.0  
**日期**：2026-03-30  
**适用范围**：疾病长期跟踪（30天周期）

---

## 1. 目录结构

```
agents/
├── disease_trend_agent/           # 疾病趋势诊断Agent主目录
│   ├── __init__.py
│   ├── README.md                  # 模块说明文档
│   ├── config/                    # 配置目录
│   │   ├── __init__.py
│   │   ├── settings.py            # 全局配置
│   │   └── prompts.py             # 提示词模板
│   ├── core/                      # 核心逻辑
│   │   ├── __init__.py
│   │   ├── state.py               # 状态定义
│   │   ├── graph.py               # LangGraph工作流定义
│   │   └── router.py              # 条件路由逻辑
│   ├── nodes/                     # 工作流节点
│   │   ├── __init__.py
│   │   ├── init_config.py         # 初始化配置节点
│   │   ├── fetch_data.py          # 数据获取节点
│   │   ├── extract_indicators.py  # 指标提取节点
│   │   ├── trend_judge.py         # 趋势判断节点（核心Agent）
│   │   ├── rag_retrieval.py       # RAG检索节点
│   │   ├── finalize_report.py     # 报告生成节点
│   │   └── alert_doctor.py        # 医生告警节点
│   ├── services/                  # 外部服务对接
│   │   ├── __init__.py
│   │   ├── aliyun_api.py          # 阿里云API服务
│   │   └── rag_service.py         # RAG服务对接
│   ├── models/                    # 数据模型
│   │   ├── __init__.py
│   │   ├── schemas.py             # Pydantic模型定义
│   │   └── enums.py               # 枚举类型
│   ├── utils/                     # 工具函数
│   │   ├── __init__.py
│   │   ├── data_processor.py      # 数据处理工具
│   │   └── report_renderer.py     # 报告渲染工具
│   └── tests/                     # 测试目录
│       ├── __init__.py
│       ├── test_nodes.py
│       ├── test_agent.py
│       └── test_graph.py
└── 疾病趋势诊断agent设计文档.md    # 设计文档
```

---

## 2. 模块说明

### 2.1 config/ - 配置模块

| 文件 | 职责 | 关键配置 |
|-----|------|---------|
| `settings.py` | 全局配置管理 | 时间窗口(30天)、API密钥、阈值参数 |
| `prompts.py` | LLM提示词模板 | TrendJudgeAgent系统提示词、决策规则 |

---

### 2.2 core/ - 核心模块

| 文件 | 职责 | 关键类/函数 |
|-----|------|------------|
| `state.py` | 状态定义 | `DiseaseTrendState` TypedDict |
| `graph.py` | 工作流构建 | `build_workflow()` 构建LangGraph |
| `router.py` | 条件路由 | `route_by_decision()` 决策路由 |

---

### 2.3 nodes/ - 工作流节点

| 文件 | 类型 | 职责 | 输出 |
|-----|------|------|------|
| `init_config.py` | 普通节点 | 初始化30天窗口，分配case_id | `case_id`, `time_window` |
| `fetch_data.py` | 普通节点 | 拉取30天照片+API历史结果 | `raw_records`, `user_profile` |
| `extract_indicators.py` | 普通节点 | 提取时序指标 | `trend_indicators` |
| `trend_judge.py` | Agent节点 | 核心决策：判断趋势并决定下一步 | `agent_decision` |
| `rag_retrieval.py` | 工具节点 | 调用RAG服务查相似案例 | `rag_context` |
| `finalize_report.py` | 普通节点 | 组装最终报告 | `final_report`, `final_verdict` |
| `alert_doctor.py` | 副作用节点 | 发送医生通知 | `alerts`, `needs_doctor` |

---

### 2.4 services/ - 外部服务

| 文件 | 对接服务 | 方法 |
|-----|---------|------|
| `aliyun_api.py` | 阿里云皮肤病识别API | `get_analysis_history()` |
| `rag_service.py` | 组长RAG服务 | `query_similar_cases()` |

---

### 2.5 models/ - 数据模型

| 文件 | 定义内容 |
|-----|---------|
| `schemas.py` | `AgentDecision`, `TrendIndicators`, `FinalReport` 等Pydantic模型 |
| `enums.py` | `ActionType`, `VerdictType`, `RiskLevel` 等枚举 |

---

### 2.6 utils/ - 工具函数

| 文件 | 功能 |
|-----|------|
| `data_processor.py` | 指标计算、趋势分析、异常检测 |
| `report_renderer.py` | 报告模板渲染、JSON格式化 |

---

## 3. LangGraph拓扑结构

```
┌─────────────┐
│  init_config│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  fetch_data │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ extract_indicators│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  trend_judge    │ ← 核心决策点（趋势判断Agent）
└────────┬────────┘
         │
    ┌────┼────┬────────────┐
    │    │    │            │
    ▼    ▼    ▼            ▼
┌──────┐ ┌──────┐ ┌──────────┐ ┌──────────┐
│FINALIZE│ │RAG_  │ │REQUEST_  │ │ALERT_    │
│        │ │LOOKUP│ │DATA      │ │DOCTOR    │
└───┬───┘ └───┬──┘ └────┬─────┘ └────┬─────┘
    │         │         │            │
    │         ▼         │            │
    │    ┌──────────┐   │            │
    │    │rag_      │   │            │
    │    │retrieval │   │            │
    │    └────┬─────┘   │            │
    │         │         │            │
    └─────────┴─────────┴────────────┘
              │
              ▼
       ┌─────────────┐
       │finalize_report│
       └─────────────┘
```

**流程说明**：
- 主流程：init_config → fetch_data → extract_indicators → trend_judge → [分支] → finalize_report → END
- trend_judge为条件路由节点，根据决策结果分发到不同分支
- ALERT_DOCTOR分支为副作用，通知医生后仍汇聚到finalize_report
- REQUEST_DATA分支直接结束，返回数据不足提示

---

## 4. 状态定义（State）

### 4.1 输入层
| 字段 | 类型 | 说明 |
|-----|------|------|
| `user_id` | str | 用户唯一标识 |
| `target_disease` | str | 目标疾病类型（如 acne） |
| `case_id` | str | 案例ID（初始化后分配） |
| `time_window_days` | int | 时间窗口，默认30天 |

### 4.2 数据层
| 字段 | 说明 |
|-----|------|
| `raw_records` | 原始记录列表（照片+API历史结果） |
| `user_profile` | 用户画像信息 |

### 4.3 分析层
| 字段 | 说明 |
|-----|------|
| `trend_indicators` | 趋势指标（时序分析结果） |
| `agent_decision` | Agent决策结果（含action/reason/confidence等） |
| `rag_context` | RAG检索上下文 |

### 4.4 输出层
| 字段 | 说明 |
|-----|------|
| `final_verdict` | 最终判定（better/worse/stable/uncertain） |
| `final_report` | 最终报告内容 |
| `alerts` | 告警信息列表 |
| `needs_doctor` | 是否需要医生介入 |

---

## 5. 核心节点设计

### 5.1 trend_judge（趋势判断节点）

**职责**：基于30天分析指标，自主决定下一步行动

**模型选择**：GPT-4 / Claude 3.5 Sonnet / DeepSeek

**温度设置**：0.2（平衡创造性和稳定性）

**输入**：
- 时序趋势指标（severity_progression）
- 照片数量和质量统计
- 用户画像信息
- 历史API分析结果

**决策逻辑**：
1. **FINALIZE** - 趋势明确（持续好转/持续恶化/稳定），直接输出结论
2. **RAG_LOOKUP** - 趋势矛盾（如先好后坏），查相似案例辅助决策
3. **REQUEST_DATA** - 数据不足（照片<5张或间隔>7天），建议补充
4. **ALERT_DOCTOR** - 严重恶化或异常模式，转医生处理

**输出结构**：
| 字段 | 说明 |
|-----|------|
| `action` | 决策动作（FINALIZE/RAG_LOOKUP/REQUEST_DATA/ALERT_DOCTOR） |
| `reason` | 决策理由说明 |
| `confidence` | 决策置信度，0.0-1.0 |
| `suggested_verdict` | 建议判定（仅FINALIZE时有效） |
| `risk_level` | 风险等级（low/medium/high） |

---

### 5.2 RAG检索节点

**职责**：调用RAG服务，检索相似病例

**触发条件**：trend_judge决策为 RAG_LOOKUP

**输入**：
- `trend_indicators`：趋势指标
- `target_disease`：疾病类型过滤
- `severity_range`：严重度范围

**检索参数**：
- Top K：5条相似病例
- 过滤条件：疾病类型、时间窗口、排除当前用户

**输出**：相似病例上下文，用于辅助finalize_report生成报告

---

### 5.3 finalize_report（报告生成节点）

**职责**：组装最终报告

**输入**：
- `agent_decision`：Agent决策结果
- `trend_indicators`：趋势指标
- `rag_context`：RAG检索结果（如有）

**输出报告结构**：
| 字段 | 说明 |
|-----|------|
| `report_type` | 报告类型：disease_trend_30d |
| `generated_at` | 生成时间 |
| `executive_summary` | 执行摘要（verdict/confidence/risk_level/next_action） |
| `trend_analysis` | 趋势分析（duration_days/photos_count/severity_progression等） |
| `agent_decision_log` | Agent决策日志 |
| `alerts` | 告警信息列表 |
| `doctor_review_required` | 是否需要医生审核 |

**判定类型（Verdict）**：
- `better` - 好转
- `worse` - 恶化
- `stable` - 稳定
- `uncertain` - 不确定

---

### 5.4 alert_doctor（医生告警节点）

**职责**：发送医生通知（副作用节点）

**触发条件**：
- trend_judge决策为 ALERT_DOCTOR
- 或 risk_level 为 high

**执行方式**：异步发送，不阻塞主流程

**通知内容**：
- 用户ID
- 风险等级
- 趋势摘要
- 建议处理优先级

---

## 6. 与RAG的对接

| 参数 | 说明 |
|-----|------|
| **调用时机** | trend_judge决策为RAG_LOOKUP时 |
| **Query生成** | 基于趋势指标：`{疾病类型} {趋势描述} {严重度变化}` |
| **返回使用** | 注入报告生成prompt，作为"相似案例参考" |
| **过滤条件** | 疾病类型、时间窗口、排除当前用户 |

---

## 7. 边界情况处理

| 场景 | 处理策略 |
|-----|---------|
| 30天内无照片 | REQUEST_DATA，提示用户上传照片 |
| API历史结果缺失 | 基于现有照片独立分析 |
| 趋势矛盾（先好后坏） | RAG_LOOKUP，查相似案例 |
| 严重恶化（severity跳升>2级） | ALERT_DOCTOR，立即通知医生 |
| 数据点过少（<5张） | REQUEST_DATA，建议补充数据 |
| 照片间隔过长（>10天无数据） | REQUEST_DATA，建议持续跟踪 |

---

## 8. 安全与合规

1. **医疗免责声明**：所有输出必须包含"AI分析仅供参考，请以专业医生意见为准"
2. **敏感图片处理**：用户上传图片仅用于分析，不做持久化存储
3. **转诊机制**：风险等级high或严重恶化时，必须建议线下就医
4. **隐私保护**：用户ID脱敏处理，案例入库时去除可识别个人信息
