# 皮肤保养Agent设计文档（LangGraph版）

**版本**：v1.0
**日期**：2026-04-04
**参考架构**：扣子Coze双模型+知识库架构
**实现框架**：LangGraph（Python）
**对接知识库**：`skincare_ingredients_rag` 护肤品成分知识库
**前端对接**：`apps/web/src/pages/Records/DiaryDetail.tsx`

---

## 1. 核心流程对照

### 1.1 前端UI模块映射

| 前端组件（DiaryDetail.tsx） | 对应Agent节点 | 数据流向 |
|---------------------------|--------------|---------|
| `皮肤表现`（skinMetrics） | `user_analysis` | 后端分析 → 前端展示皮肤指标 |
| `护理建议`（careAdvice） | `llm_reasoning` | 后端生成 → 前端卡片展示 |
| `AI点评`（aiVerdict） | `llm_reasoning` | 后端生成 → 前端文字+标签 |
| `AI对话`（streamChatWithAIDoctor） | `llm_reasoning` | 实时流式对话 |
| `今日护理与用药`（careItems） | `ingredient_check` | 用户添加 → 成分检测 |
| `备注`（note） | `compile_output` | 用户输入 → 存档 |

### 1.2 节点流程对照

| 扣子节点 | 对应LangGraph节点 | 职责 | 前端对应 |
|---------|------------------|------|---------|
| 开始 | `entry_point` | 接收用户输入（肤质/问题/当前护肤品） | 页面加载时自动触发 |
| **大模型**（豆包1.5·Pro） | `user_analysis` | **用户理解**：解析用户肤质、皮肤问题、护肤目标 | `/api/skin-analysis` |
| **知识库检索** | `rag_retrieval` | 检索相关成分、产品知识 | 内部调用 |
| **大模型_1**（豆包1.8·深度思考） | `llm_reasoning` | **深度推理**：综合用户情况+成分知识，生成个性化方案 | `/api/skincare-routine` |
| 成分检测 | `ingredient_check` | 检测用户现有产品成分的兼容性 | `/api/ingredient-check` |
| 输出/结束 | `compile_output` | 生成最终护肤方案报告 | 汇总至前端展示 |

---

## 2. 关键设计：为什么需要双模型架构

| | 第一个模型（User Analysis） | 第二个模型（LLM Reasoning） |
|--|---------------------------|---------------------------|
| **输入** | 用户自述 + 当前使用产品列表 | 结构化用户画像 + RAG成分知识 |
| **核心能力** | **用户理解**：提取肤质、问题、目标 | **方案生成**：成分搭配、护肤步骤、产品推荐 |
| **模型选择** | GPT-4o / Claude 3 Sonnet / Qwen-Max | GPT-4 / Claude 3.5 Sonnet / DeepSeek |
| **输出** | 用户皮肤画像（给第二个模型用） | 个性化护肤方案 |
| **为什么分开** | 解析用户非结构化输入为结构化数据 | 专注决策推理，保证方案科学性 |

---

## 3. 状态定义（State）

### 3.1 输入层（前端传入）
| 字段 | 类型 | 说明 | 前端来源 |
|-----|------|------|---------|
| `user_id` | str | 用户唯一标识 | 固定值 `user_001` |
| `user_input` | str | 用户自述（肤质描述、皮肤问题、护肤目标） | 备注字段 `note` |
| `current_products` | List[dict] | 用户当前使用的护肤品列表 | `careItems` 用户添加的护理项目 |
| `skin_image` | bytes | 用户皮肤照片（可选） | `entry.image` |
| `skin_metrics` | List[dict] | 皮肤指标数据（色斑/黑头/眼袋等） | 前端 `skinMetrics` |
| `entry_date` | str | 日记日期 | `entry.date` |
| `entry_title` | str | 日记标题（皮肤状态描述） | `entry.title` |

### 3.2 用户画像层（User Analysis输出）
| 字段 | 说明 | 前端映射 |
|-----|------|---------|
| `skin_type` | 肤质：干性/油性/混合/中性/敏感性 | 影响 `skinMetrics` 展示 |
| `skin_concerns` | 皮肤问题列表：["痘痘", "色斑", "皱纹", "敏感"] | 映射至 `skinMetrics` 的 label |
| `skin_goals` | 护肤目标列表：["抗衰老", "美白", "控油"] | 影响 `careAdvice` 优先级 |
| `age_range` | 年龄段：20-30/30-40/40-50/50+ | 影响成分推荐 |
| `sensitivity_factors` | 敏感因素：["酒精", "香精", "某些防腐剂"] | 影响 `products_to_avoid` |
| `routine_level` | 护肤经验：新手/进阶/专业 | 影响方案复杂度 |
| `user_confidence` | 解析置信度 0.0-1.0 | 影响AI点评语气 |

### 3.3 前端展示层（直接映射）

#### 3.3.1 皮肤指标（skinMetrics）
| 字段 | 类型 | 说明 |
|-----|------|------|
| `label` | str | 指标名称：色斑/黑头/眼袋/黑眼圈/痘痘 |
| `value` | int | 严重程度 0-100 |
| `detail` | str | 详细说明和建议 |

#### 3.3.2 护理建议（careAdvice）
| 字段 | 类型 | 说明 | Icon映射 |
|-----|------|------|---------|
| `title` | str | 建议标题 | Shield/Droplets/Sun |
| `description` | str | 详细描述 | - |
| `category` | str | 类别：cleaning/moisturizing/sunscreen等 | 决定Icon类型 |

#### 3.3.3 AI点评（aiVerdict）
| 枚举值 | 说明 | 前端展示文案 |
|-------|------|------------|
| `better` | 皮肤状况好转 | "根据最近的数据分析，您的皮肤状况正在好转！继续保持当前的护肤习惯..." |
| `worse` | 皮肤状况恶化 | "近期皮肤状况有恶化趋势，建议您重点关注..." |
| `stable` | 皮肤状况稳定 | "皮肤状态保持稳定。建议继续保持当前的日常护理..." |
| `insufficient` | 数据不足 | "根据今天的皮肤记录，整体状态良好..." |

### 3.4 RAG层
| 字段 | 说明 |
|-----|------|
| `rag_queries` | 自动生成的检索Query列表 |
| `rag_results` | 检索到的相关成分知识列表 |
| `ingredient_interactions` | 成分相互作用关系 |

### 3.5 成分检测层
| 字段 | 说明 |
|-----|------|
| `conflicting_ingredients` | 不冲突的成分组合 |
| `recommended_combinations` | 推荐的成分组合 |
| `caution_ingredients` | 需谨慎搭配的成分 |
| `product_assessment` | 用户现有产品评估 |

### 3.6 方案生成层（LLM Reasoning输出）
| 字段 | 说明 |
|-----|------|
| `routine` | 每日护肤步骤 |
| `morning_routine` | 晨间护肤方案 |
| `evening_routine` | 晚间护肤方案 |
| `recommended_ingredients` | 推荐成分优先级列表 |
| `products_to_avoid` | 应避免的成分/产品 |
| `expected_timeline` | 见效时间预期 |
| `lifestyle_tips` | 生活习惯建议 |

### 3.7 输出层
| 字段 | 说明 | 前端组件 |
|-----|------|---------|
| `final_output` | 最终用户护肤方案报告 | `careAdvice` 列表 |
| `ai_verdict` | AI综合点评 | `aiVerdict` 字段 |
| `disclaimer` | 免责声明 | AI点评底部 |

---

## 4. 节点（Nodes）详细设计

### 4.1 第一层：用户分析节点

**职责**：解析用户非结构化输入，构建用户皮肤画像

**前端对接**：`useEffect` 页面加载时调用 `/api/skin-analysis`

**输入**：
- 用户文字描述（肤质、问题、目标）→ `note` 字段
- 用户当前使用产品列表（可选）→ `careItems`
- 用户皮肤照片（可选）→ `entry.image`
- 皮肤指标数据 → `skinMetrics`

**分析维度**：
1. 肤质判断：干性/油性/混合/中性/敏感性
2. 主要问题：痘痘/色斑/皱纹/敏感/毛孔/泛红
3. 护肤目标：抗衰老/美白/控油/保湿/修复
4. 年龄相关：不同年龄段重点不同
5. 敏感因素：识别需避免的成分类别
6. 护肤经验：新手建议简化方案，进阶可复杂搭配

**输出**：结构化JSON，包含用户画像、置信度、分析说明

**副作用**：自动生成RAG检索Query

---

### 4.2 RAG检索节点

**职责**：调用成分知识库，检索相关成分知识

**输入**：
- `rag_queries`：自动生成的检索Query
- `user_analysis.skin_concerns`：用于过滤相关成分
- `user_analysis.skin_goals`：用于过滤目标成分

**检索参数**：
- Top K：5-10条相关成分知识
- 过滤条件：成分类别、适用肤质、功效

**返回成分信息**：
- 成分名称和别名
- 功效和作用机制
- 适用肤质
- 使用注意事项
- 浓度范围
- 证据等级

---

### 4.3 成分检测节点

**职责**：分析用户当前产品成分，评估兼容性和有效性

**前端对接**：`/api/ingredient-check`（用户添加护理项目时触发）

**输入**：
- `user_analysis`：用户画像
- `user.current_products`：`careItems` 用户添加的护理项目
- `rag_results`：相关成分知识

**检测内容**：
1. 成分冲突检测：水杨酸+维A酸、维C+烟酰胺高等浓度等
2. 成分协同检测：维C+维E、视黄醇+透明质酸等
3. 产品评估：现有产品是否适合用户肤质和问题
4. 缺失检测：用户目标所需的关键成分是否缺失

**输出**：结构化检测报告，影响前端 `careItems` 的展示

---

### 4.4 第二层：LLM推理节点（核心Agent）

**职责**：深度推理，综合用户画像+成分知识，生成个性化护肤方案

**前端对接**：
- `/api/skincare-routine` → 生成 `careAdvice` 和 `aiVerdict`
- `/api/stream-chat` → 流式对话（对接 `streamChatWithAIDoctor`）

**模型选择**：GPT-4 / Claude 3.5 Sonnet / DeepSeek

**温度设置**：0.3（适中温度，保证创意和准确性平衡）

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

**输出**：结构化JSON，包含：
- 晨间/晚间护肤步骤
- 推荐成分优先级
- 需避免的成分
- 生活习惯建议
- 见效时间预期

---

### 4.5 输出组装节点

**职责**：组装最终输出，生成用户友好的护肤方案报告

**前端对接**：汇总至 `DiaryDetail` 组件各展示模块

**组装内容**：
- 个性化护肤方案概述 → `careAdvice` 列表
- 每日护肤步骤（晨间+晚间）→ 详情弹窗
- 推荐产品类型（不指定品牌）→ 建议卡片
- 关键成分清单 → AI点评标签
- 注意事项和禁忌 → 建议描述
- 预期效果和时间 → AI点评文案
- 免责声明 → AI点评底部固定文案

**输出格式**：
- 简洁版：适合护肤新手（默认展示）
- 详细版：包含成分机理说明（点击展开）

---

## 5. LangGraph拓扑结构

```
┌─────────────┐
│   开始输入   │
│ (描述+产品)  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  user_analysis  │  ← 第一层：用户理解模型
│  (GPT-4o等)      │     解析肤质、问题、目标
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
│ingredient_check │  ← 检测产品成分兼容性
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
│  compile_output │  ← 组装最终报告
└────────┬────────┘
         │
         ▼
    ┌─────────┐
    │  结束   │
    │ 输出报告 │
    └─────────┘
```

**流程说明**：
- 主流程为线性流程：user_analysis → rag_retrieval → ingredient_check → llm_reasoning → compile_output → END
- 支持断点续跑（通过MemorySaver实现状态持久化）

**前端交互**：
```
页面加载 → useEffect → POST /api/skin-analysis → 更新skinMetrics/careAdvice
用户添加护理项 → POST /api/ingredient-check → 更新careItems
用户点击AI医生 → streamChatWithAIDoctor → 流式对话
```

---

## 6. 成分知识库结构（已接入）

### 6.1 成分分类
| 类别 | 代表成分 |
|-----|---------|
| 抗衰老 | 视黄醇、胜肽、补骨脂酚 |
| 抗氧化/美白 | 维生素C、曲酸、熊果苷 |
| 保湿 | 透明质酸、角鲨烷、泛醇 |
| 去角质 | 果酸(AHA)、水杨酸(BHA)、杏仁酸 |
| 屏障修复 | 神经酰胺、积雪草提取物 |
| 防晒 | 氧化锌 |
| 祛痘 | 壬二酸、阿达帕林、维A酸 |
| 舒缓修复 | 绿茶提取物、尿囊素 |
| 多功能 | 烟酰胺 |

### 6.2 成分冲突关系
| 冲突组合 | 原因 | 处理建议 |
|---------|------|---------|
| 维A酸 + 果酸/水杨酸 | 双重刺激，屏障损伤 | 间隔使用，早晚分开 |
| 维C + 烟酰胺(高浓度) | 可能产生烟酸，引起刺激 | 间隔使用或选择低浓度 |
| 维A酸 + 维C | 维C可能降低维A酸稳定性 | 早晚分开使用 |
| 果酸 + 去角质产品 | 过度去角质，屏障受损 | 避免叠加 |

### 6.3 成分协同关系
| 协同组合 | 效果 |
|---------|------|
| 维C + 维E | 增强抗氧化效果 |
| 视黄醇 + 透明质酸 | 抗老+保湿，减少刺激 |
| 烟酰胺 + 透明质酸 | 修复屏障+保湿 |
| 神经酰胺 + 胆固醇 + 脂肪酸 | 最佳屏障修复比例(3:1:1:1) |
| 补骨脂酚 + 透明质酸 | 植物抗老+保湿，敏感肌友好 |

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

## 8. 护肤方案分级

### 8.1 新手方案（简化版）
- 核心三步：清洁 + 保湿 + 防晒
- 功效成分最多1-2个
- 重点建立耐受

### 8.2 进阶方案
- 完整步骤：清洁 + 精华 + 乳液/面霜 + 防晒
- 功效成分2-3个
- 注意成分搭配顺序

### 8.3 专业方案
- 完整护肤流程
- 功效成分3-5个
- 早晚分用不同功效产品
- 定期评估调整

---

## 9. 安全与合规

1. **功效宣称合规**：不夸大产品效果，注明"需要持续使用数周见效"
2. **成分安全提醒**：对孕妇/哺乳期禁用成分明确标注
3. **转诊机制**：检测到严重皮肤问题（如持续红肿、溃烂）时建议就医
4. **免责声明**："本方案仅供参考，具体产品选择请咨询专业人士"
5. **产品推荐原则**：推荐成分类型而非特定品牌，避免商业利益冲突

---

## 10. 与疾病诊断Agent的对比

| 维度 | 疾病诊断Agent | 皮肤保养Agent |
|-----|--------------|--------------|
| **核心输入** | 皮肤病照片 + 症状描述 | 肤质描述 + 护肤目标 + 现有产品 |
| **第一层模型** | Vision模型（图像理解） | User Analysis（文本解析） |
| **RAG用途** | 检索相似病例 | 检索成分知识 |
| **第二层模型** | 医学诊断推理 | 个性化方案生成 |
| **输出重点** | 诊断结论 + 治疗方案 | 成分搭配 + 护肤步骤 |
| **专业要求** | 需医学背景知识 | 需成分化学知识 |
| **前端组件** | `/api/disease-trend-analysis` | `/api/skin-analysis` + `/api/skincare-routine` |
| **展示模块** | 皮肤表现 + 护理建议 + AI点评 | 复用上述模块，增加成分检测 |

---

## 11. API接口设计（对接DiaryDetail.tsx）

### 11.1 皮肤分析接口
```
POST /api/skin-analysis
Request: {
  userId: string
  note: string           // 备注内容
  entryTitle: string     // 日记标题
  skinMetrics: [{label, value, detail}]  // 当前皮肤指标
  careItems: [{id, title, desc, checked}]  // 用户添加的护理项
}
Response: {
  success: boolean
  result: {
    skinProfile: { ... }       // 用户画像
    careAdvice: [{title, description, category}]  // 护理建议
    aiVerdict: string           // better/worse/stable/insufficient
  }
}
```

### 11.2 成分检测接口
```
POST /api/ingredient-check
Request: {
  userId: string
  newProduct: {id, title, desc}  // 新添加的护理项
  userProfile: { ... }           // 用户画像
}
Response: {
  success: boolean
  result: {
    isCompatible: boolean
    conflicts: string[]
    recommendations: string[]
    assessment: string
  }
}
```

### 11.3 流式对话接口
```
POST /api/stream-chat (stream: true)
Request: {
  userId: string
  message: string
  skinProfile: { ... }
  chatHistory: [{role, content, time}]
}
Events: data: chunk字符串
```
