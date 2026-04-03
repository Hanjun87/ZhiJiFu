# Unified Medical RAG 集成文档

本文档描述了疾病趋势诊断 Agent 与 Unified Medical RAG 知识库的集成情况。

## 概述

Unified Medical RAG 是一个整合了**皮肤病**和**伤口护理**两大医学领域的知识库系统，包含：
- **53 种皮肤病**知识（dermatology_rag_data.json）
- **34 种伤口类型**知识（complete_wound_database.json）
- **总计 87 种** 医学疾病/伤口知识
- 基于直接JSON数据加载的高效检索系统（无需向量索引构建）

## 集成架构

```
┌─────────────────────────────────────────────────────────────┐
│                    疾病趋势诊断 Agent                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ rag_retrieval │───▶│  RAG Service │───▶│ RAG Loader   │  │
│  │    Node      │    │              │    │              │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                              │                             │
│                              ▼                             │
│                    ┌──────────────────┐                    │
│                    │ Unified RAG Data │                    │
│                    │  - 皮肤病 (53种)  │                    │
│                    │  - 伤口护理 (34种)│                    │
│                    └──────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

## 核心组件

### 1. RAG 数据加载器 (services/unified_rag_loader.py)

**功能：**
- 直接从JSON文件加载医学知识数据
- 构建疾病名称索引和分类索引
- 支持精确匹配和模糊搜索
- 单例模式确保数据只加载一次

**核心方法：**
```python
# 获取疾病详细信息
get_disease_by_name(disease_name: str) -> Dict

# 搜索相关疾病
search_diseases(keyword: str, knowledge_type: str) -> List[Dict]

# 格式化疾病信息为文本
format_disease_for_rag(disease: Dict) -> str

# 获取知识库统计
get_statistics() -> Dict[str, int]
```

### 2. RAG 服务层 (services/rag_service.py)

**功能：**
- 提供高级查询接口
- 支持趋势分析知识查询
- 自动提取护理建议相关信息
- 格式化输出供护理建议生成器使用

**核心方法：**
```python
# 查询相似案例和医学知识
query_similar_cases(query: Dict) -> Dict

# 查询特定疾病知识
query_disease_knowledge(disease_name: str, knowledge_type: str) -> Dict

# 查询趋势分析相关知识
query_trend_analysis_knowledge(disease_name: str, trend_pattern: str) -> Dict
```

### 3. RAG 检索节点 (nodes/rag_retrieval.py)

**功能：**
- 根据疾病名称自动判断知识类型（皮肤病/伤口护理）
- 构建结构化的医学查询文本
- 支持趋势模式分析（好转/恶化/反复/稳定/波动）
- 自动查询趋势相关的医学知识

**知识类型判断：**
```python
# 皮肤病关键词
湿疹、皮炎、银屑病、疱疹、痤疮、疣、癣...

# 伤口护理关键词
伤口、溃疡、烧伤、压疮、糖尿病足、切割伤...
```

### 4. 护理建议生成器 (utils/care_advisor.py)

**功能：**
- 从 RAG 结果中提取医学知识生成护理建议
- 整合医学注意事项、日常护理、饮食建议到护理方案
- 根据疾病趋势动态调整建议优先级

**RAG 护理建议类别：**
- `medical_precautions` - 医学注意事项
- `medical_care` - 专业护理建议
- `medical_diet` - 医学饮食建议
- `trend_analysis` - 趋势分析建议

## 数据流

```
用户输入
    ↓
疾病趋势分析
    ↓
RAG检索节点 ──→ Unified Medical RAG ──→ 医学知识
    ↓
趋势判断Agent
    ↓
报告生成节点 ──→ 护理建议生成器 ←── RAG上下文
    ↓
最终报告（含医学知识引用）
```

## 使用方式

### 1. 直接使用 RAG Loader

```python
from backend.agents.disease_trend_agent.services.unified_rag_loader import get_rag_loader

# 获取加载器实例
loader = get_rag_loader()

# 查询疾病知识
disease_info = loader.get_disease_by_name("湿疹")

# 搜索相关疾病
results = loader.search_diseases("瘙痒", knowledge_type="dermatology")

# 格式化输出
formatted_text = loader.format_disease_for_rag(disease_info)
```

### 2. 使用 RAG Service

```python
from backend.agents.disease_trend_agent.services.rag_service import (
    query_disease_knowledge, query_similar_cases
)

# 查询疾病知识
result = query_disease_knowledge("湿疹", knowledge_type="dermatology")

# 查询相似案例
query = {
    "query_type": "case_comparison",
    "query_text": "湿疹病情恶化的处理方法",
    "disease_type": "湿疹",
    "knowledge_type": "dermatology",
    "trend_indicators": {
        "severity_timeline": [2, 2, 3, 3, 3]
    }
}
result = query_similar_cases(query)
```

### 3. 在 Agent 工作流中使用

```python
from backend.agents.disease_trend_agent.nodes.rag_retrieval import rag_retrieval_node

# 构建状态
state = {
    "user_id": "user_001",
    "target_disease": "湿疹",
    "trend_indicators": {
        "severity_timeline": [3, 3, 2, 2, 1],
        "anomaly_points": ["瘙痒加重"]
    }
}

# 执行RAG检索
updated_state = rag_retrieval_node(state)
rag_context = updated_state.get("rag_context", {})
```

## 知识库内容

### 皮肤病 (53种)
- 病毒感染性皮肤病：单纯疱疹、水痘、带状疱疹、寻常疣等
- 细菌感染性皮肤病：脓疱疮、毛囊炎、丹毒、蜂窝织炎等
- 真菌感染性皮肤病：体癣、股癣、足癣、手癣、甲癣等
- 寄生虫/昆虫性皮肤病：疥疮、虫咬皮炎
- 皮炎湿疹类：湿疹、特应性皮炎、接触性皮炎、脂溢性皮炎等
- 红斑鳞屑性皮肤病：银屑病、玫瑰糠疹、扁平苔藓等
- 自身免疫性皮肤病：红斑狼疮、皮肌炎、硬皮病、天疱疮等
- 皮肤肿瘤：脂溢性角化病、色素痣、基底细胞癌等

### 伤口护理 (34种)
- 压力性损伤：1-4期、深部组织损伤、不可分期、医疗器械相关
- 糖尿病足溃疡：Wagner 0-5级
- 腿部溃疡：静脉性、动脉性、混合性
- 烧伤：Ⅰ度、浅Ⅱ度、深Ⅱ度、Ⅲ度
- 特殊类型：电烧伤、化学烧伤、冻伤
- 创伤性伤口：擦伤、挫伤、切割伤、刺伤、撕裂伤、挤压伤、火器伤、咬伤
- 手术切口：甲级、乙级、丙级愈合

## 测试

运行集成测试：

```bash
cd e:/workspace/SkinAI/skinAI
python backend/agents/disease_trend_agent/tests/test_unified_rag_integration.py
```

测试内容包括：
1. RAG数据加载器测试
2. 疾病知识查询测试
3. 知识类型自动检测测试
4. 趋势模式分析测试
5. RAG服务查询测试
6. 护理建议生成测试
7. RAG检索节点集成测试
8. 伤口护理知识查询测试

## 优势

1. **无需构建索引**：直接加载JSON数据，无需构建向量索引
2. **快速响应**：内存索引，查询速度快
3. **精确匹配**：支持疾病名称精确匹配和别名匹配
4. **分类管理**：自动区分皮肤病和伤口护理知识
5. **趋势感知**：根据病情趋势提供针对性建议
6. **易于维护**：更新数据只需替换JSON文件

## 注意事项

1. **数据格式**：确保JSON文件格式正确
2. **内存占用**：加载所有数据需要一定内存（约10-20MB）
3. **数据更新**：更新医学数据后需要重启服务
4. **降级处理**：RAG不可用时，系统会返回提示信息，不会中断流程

## 后续优化建议

1. **缓存机制**：为频繁查询的疾病添加缓存
2. **模糊搜索增强**：支持更智能的模糊匹配
3. **知识关联**：建立疾病之间的关联关系
4. **多语言支持**：支持中英文混合查询
5. **增量更新**：支持热更新医学知识
