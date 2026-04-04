# 皮肤保养Agent目录设计

**版本**：v1.0
**日期**：2026-04-04
**适用范围**：个性化皮肤保养方案生成与成分检测
**前端对接**：`apps/web/src/pages/Records/DiaryDetail.tsx`

---

## 1. 目录结构

```
agents/
├── skincare_agent/                    # 皮肤保养Agent主目录
│   ├── __init__.py
│   ├── README.md                     # 模块说明文档
│   ├── config/                      # 配置目录
│   │   ├── __init__.py
│   │   ├── settings.py             # 全局配置
│   │   └── prompts.py              # 提示词模板
│   ├── core/                        # 核心逻辑
│   │   ├── __init__.py
│   │   ├── state.py                # 状态定义
│   │   ├── graph.py                # LangGraph工作流定义
│   │   └── router.py               # 条件路由逻辑
│   ├── nodes/                       # 工作流节点
│   │   ├── __init__.py
│   │   ├── user_analysis.py        # 用户分析节点（第一层模型）
│   │   ├── rag_retrieval.py        # RAG检索节点
│   │   ├── ingredient_check.py    # 成分检测节点
│   │   ├── llm_reasoning.py        # LLM推理节点（核心Agent）
│   │   └── compile_output.py       # 报告生成节点
│   ├── services/                    # 外部服务对接
│   │   ├── __init__.py
│   │   ├── skincare_rag_service.py # 护肤品成分RAG服务
│   │   └── streaming_service.py     # 流式对话服务
│   ├── models/                      # 数据模型
│   │   ├── __init__.py
│   │   ├── schemas.py              # Pydantic模型定义
│   │   └── enums.py                # 枚举类型
│   ├── utils/                       # 工具函数
│   │   ├── __init__.py
│   │   ├── ingredient_matcher.py   # 成分匹配工具
│   │   ├── routine_builder.py       # 护肤步骤构建工具
│   │   └── response_formatter.py    # 响应格式化工具
│   ├── knowledge/                   # 知识库相关
│   │   ├── __init__.py
│   │   ├── ingredient_db.py        # 成分数据库
│   │   └── conflicts.py            # 成分冲突关系
│   └── tests/                       # 测试目录
│       ├── __init__.py
│       ├── test_nodes.py
│       ├── test_agent.py
│       └── test_graph.py
└── 皮肤保养Agent设计文档.md          # 设计文档
```

---

## 2. 模块说明

### 2.1 config/ - 配置模块

| 文件 | 职责 | 关键配置 |
|-----|------|---------|
| `settings.py` | 全局配置管理 | 模型选择、API密钥、RAG参数、护肤方案分级阈值 |
| `prompts.py` | LLM提示词模板 | UserAnalysis系统提示、LLMReasoning系统提示、成分冲突规则 |

---

### 2.2 core/ - 核心模块

| 文件 | 职责 | 关键类/函数 |
|-----|------|------------|
| `state.py` | 状态定义 | `SkincareState` TypedDict，包含输入层、用户画像层、RAG层、成分检测层、方案生成层 |
| `graph.py` | 工作流构建 | `build_workflow()` 构建LangGraph |
| `router.py` | 条件路由 | `route_by_user_input()` 输入路由 |

---

### 2.3 nodes/ - 工作流节点

| 文件 | 类型 | 职责 | 输出 |
|-----|------|------|------|
| `user_analysis.py` | Agent节点 | 第一层模型：解析用户输入构建用户画像 | `skin_profile` |
| `rag_retrieval.py` | 工具节点 | 调用RAG服务查相关成分知识 | `rag_results` |
| `ingredient_check.py` | 普通节点 | 检测产品成分兼容性 | `ingredient_assessment` |
| `llm_reasoning.py` | Agent节点 | 核心决策：生成个性化护肤方案 | `routine`, `care_advice` |
| `compile_output.py` | 普通节点 | 组装最终输出 | `final_output`, `ai_verdict` |

---

### 2.4 services/ - 外部服务

| 文件 | 对接服务 | 方法 |
|-----|---------|------|
| `skincare_rag_service.py` | 组长护肤品成分RAG | `query_ingredients()` 成分知识检索 |
| `streaming_service.py` | 前端流式对话 | `stream_chat()` 对接 `streamChatWithAIDoctor` |

---

### 2.5 models/ - 数据模型

| 文件 | 定义内容 |
|-----|---------|
| `schemas.py` | `SkinProfile`, `CareAdvice`, `IngredientAssessment`, `Routine` 等Pydantic模型 |
| `enums.py` | `SkinType`, `SkinConcern`, `SkinGoal`, `VerdictType`, `RoutineLevel` 等枚举 |

---

### 2.6 utils/ - 工具函数

| 文件 | 功能 |
|-----|------|
| `ingredient_matcher.py` | 成分匹配、冲突检测、协同组合推荐 |
| `routine_builder.py` | 护肤步骤构建、晨间/晚间方案生成 |
| `response_formatter.py` | 响应模板渲染、前端数据结构转换 |

---

### 2.7 knowledge/ - 知识库相关

| 文件 | 功能 |
|-----|------|
| `ingredient_db.py` | 成分数据库封装，提供成分查询接口 |
| `conflicts.py` | 成分冲突关系定义（维A酸+果酸等）、协同关系定义 |

---

## 3. LangGraph拓扑结构

```
┌─────────────┐
│ entry_point │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  user_analysis  │  ← 第一层：用户理解模型
│  (GPT-4o等)     │     解析肤质、问题、目标
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  rag_retrieval  │  ← 检索成分知识
│  (成分知识库)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ingredient_check │  ← 检测产品成分兼容性
│                  │     前端触发：用户添加careItem
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  llm_reasoning  │  ← 第二层：方案生成模型
│  (GPT-4等)       │     【核心Agent】生成个性化方案
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ compile_output  │  ← 组装最终报告
└────────┬────────┘
         │
         ▼
    ┌─────────┐
    │   END   │
    └─────────┘
```

**流程说明**：
- 主流程为线性流程：user_analysis → rag_retrieval → ingredient_check → llm_reasoning → compile_output → END
- 支持断点续跑（通过MemorySaver实现状态持久化）

---

## 4. 状态定义（State）

### 4.1 输入层
| 字段 | 类型 | 说明 |
|-----|------|------|
| `user_id` | str | 用户唯一标识 |
| `user_input` | str | 用户自述（肤质描述、皮肤问题、护肤目标） |
| `current_products` | List[dict] | 用户当前使用的护肤品列表 |
| `skin_image` | bytes | 用户皮肤照片（可选） |
| `skin_metrics` | List[dict] | 皮肤指标数据（色斑/黑头/眼袋等） |
| `entry_date` | str | 日记日期 |
| `entry_title` | str | 日记标题 |

### 4.2 用户画像层
| 字段 | 说明 |
|-----|------|
| `skin_type` | 肤质：干性/油性/混合/中性/敏感性 |
| `skin_concerns` | 皮肤问题列表 |
| `skin_goals` | 护肤目标列表 |
| `age_range` | 年龄段 |
| `sensitivity_factors` | 敏感因素 |
| `routine_level` | 护肤经验：新手/进阶/专业 |
| `user_confidence` | 解析置信度 |

### 4.3 RAG层
| 字段 | 说明 |
|-----|------|
| `rag_queries` | 自动生成的检索Query列表 |
| `rag_results` | 检索到的相关成分知识列表 |
| `ingredient_interactions` | 成分相互作用关系 |

### 4.4 成分检测层
| 字段 | 说明 |
|-----|------|
| `conflicting_ingredients` | 不冲突的成分组合 |
| `recommended_combinations` | 推荐的成分组合 |
| `caution_ingredients` | 需谨慎搭配的成分 |
| `product_assessment` | 用户现有产品评估 |

### 4.5 方案生成层
| 字段 | 说明 |
|-----|------|
| `routine` | 每日护肤步骤 |
| `morning_routine` | 晨间护肤方案 |
| `evening_routine` | 晚间护肤方案 |
| `recommended_ingredients` | 推荐成分优先级列表 |
| `products_to_avoid` | 应避免的成分/产品 |
| `expected_timeline` | 见效时间预期 |
| `lifestyle_tips` | 生活习惯建议 |

### 4.6 输出层
| 字段 | 说明 |
|-----|------|
| `final_output` | 最终用户护肤方案报告 |
| `ai_verdict` | AI综合点评（better/worse/stable/insufficient） |
| `care_advice` | 护理建议列表 |

---

## 5. 核心节点设计

### 5.1 user_analysis（用户分析节点）

**职责**：解析用户非结构化输入，构建用户皮肤画像

**模型选择**：GPT-4o / Claude 3 Sonnet / Qwen-Max

**温度设置**：0.3

**输入**：
- 用户文字描述（肤质、问题、目标）→ `note` 字段
- 用户当前使用产品列表 → `careItems`
- 用户皮肤照片（可选）→ `entry.image`
- 皮肤指标数据 → `skinMetrics`

**输出结构**：
| 字段 | 说明 |
|-----|------|
| `skin_type` | 肤质判断 |
| `skin_concerns` | 皮肤问题列表 |
| `skin_goals` | 护肤目标列表 |
| `age_range` | 年龄段 |
| `sensitivity_factors` | 敏感因素 |
| `routine_level` | 护肤经验 |
| `confidence` | 解析置信度 |

---

### 5.2 rag_retrieval（RAG检索节点）

**职责**：调用成分知识库，检索相关成分知识

**输入**：
- `skin_concerns`：皮肤问题列表
- `skin_goals`：护肤目标列表

**检索参数**：
- Top K：5-10条相关成分知识
- 过滤条件：成分类别、适用肤质、功效

**输出**：相关成分详情列表

---

### 5.3 ingredient_check（成分检测节点）

**职责**：分析用户当前产品成分，评估兼容性和有效性

**触发条件**：用户添加护理项目时（对接 `/api/ingredient-check`）

**输入**：
- `user_profile`：用户画像
- `current_products`：`careItems` 用户添加的护理项目
- `rag_results`：相关成分知识

**检测内容**：
1. 成分冲突检测：水杨酸+维A酸、维C+烟酰胺高等浓度等
2. 成分协同检测：维C+维E、视黄醇+透明质酸等
3. 产品评估：现有产品是否适合用户肤质和问题
4. 缺失检测：用户目标所需的关键成分是否缺失

**输出结构**：
| 字段 | 说明 |
|-----|------|
| `is_compatible` | 产品是否兼容 |
| `conflicts` | 冲突成分列表 |
| `recommendations` | 推荐成分列表 |
| `assessment` | 评估说明 |

---

### 5.4 llm_reasoning（LLM推理节点）

**职责**：深度推理，综合用户画像+成分知识，生成个性化护肤方案

**模型选择**：GPT-4 / Claude 3.5 Sonnet / DeepSeek

**温度设置**：0.3

**输入上下文构成**：
1. 【用户画像】：肤质、问题、目标、敏感因素
2. 【成分知识】：RAG检索到的相关成分详情
3. 【产品分析】：用户当前产品评估结果
4. 【护肤原则】：成分搭配禁忌、浓度要求、使用顺序

**方案生成原则**：
- 优先解决主要问题（一次不超过2-3个）
- 考虑成分协同和冲突
- 根据用户经验水平调整方案复杂度
- 给出具体产品和成分建议
- 设置合理的见效时间预期

**输出结构**：
| 字段 | 说明 |
|-----|------|
| `morning_routine` | 晨间护肤步骤 |
| `evening_routine` | 晚间护肤步骤 |
| `recommended_ingredients` | 推荐成分优先级 |
| `products_to_avoid` | 需避免的成分 |
| `care_advice` | 护理建议列表 |
| `ai_verdict` | AI综合点评 |

---

### 5.5 compile_output（报告生成节点）

**职责**：组装最终输出，生成用户友好的护肤方案报告

**输出格式**：
- 简洁版：适合护肤新手（默认展示）
- 详细版：包含成分机理说明（点击展开）

---

## 6. 与RAG的对接

| 参数 | 说明 |
|-----|------|
| **RAG数据源** | `skincare_ingredients_rag/skincare_ingredients_rag/data/skincare_ingredients.json` |
| **调用时机** | user_analysis之后，llm_reasoning之前 |
| **Query生成** | 自动：`{skin_concerns} {skin_goals} {skin_type}` |
| **返回使用** | 注入llm_reasoning prompt，作为"成分知识参考" |
| **成分冲突规则** | 见 `knowledge/conflicts.py` |

---

## 7. 边界情况处理

| 场景 | 处理策略 |
|-----|---------|
| 仅提供皮肤照片 | 通过视觉分析推断肤质和问题 |
| 无当前产品信息 | 基于问题推荐成分，不做冲突检测 |
| 孕妇/哺乳期用户 | 自动过滤禁用成分（维A酸、水杨酸等） |
| 严重皮肤问题 | 建议先咨询皮肤科医生 |
| 用户皮肤极度敏感 | 推荐最精简方案，避免所有潜在刺激 |
| 护肤经验为新手 | 提供简化方案，优先打好基础 |

---

## 8. 安全与合规

1. **功效宣称合规**：不夸大产品效果，注明"需要持续使用数周见效"
2. **成分安全提醒**：对孕妇/哺乳期禁用成分明确标注
3. **转诊机制**：检测到严重皮肤问题时建议就医
4. **免责声明**："本方案仅供参考，具体产品选择请咨询专业人士"
5. **产品推荐原则**：推荐成分类型而非特定品牌，避免商业利益冲突

---

## 9. 与疾病趋势诊断Agent的目录对比

| 维度 | 疾病趋势诊断Agent | 皮肤保养Agent |
|-----|------------------|--------------|
| **核心节点** | trend_judge（趋势判断） | llm_reasoning（方案生成） |
| **RAG用途** | 检索相似病例 | 检索成分知识 |
| **特色节点** | alert_doctor（医生告警） | ingredient_check（成分检测） |
| **输入重点** | 30天时序数据 | 用户画像+当前产品 |
| **输出重点** | 趋势判定+护理建议 | 个性化方案+成分推荐 |
| **知识库** | 疾病案例库 | 护肤品成分库 |
