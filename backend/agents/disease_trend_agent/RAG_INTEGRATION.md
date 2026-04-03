# Unified Medical RAG 集成文档

本文档描述了疾病趋势诊断 Agent 与 Unified Medical RAG 知识库的集成情况。

## 概述

Unified Medical RAG 是一个整合了**皮肤病**和**伤口护理**两大医学领域的知识库系统，包含：
- **80+ 种皮肤病**知识（dermatology_rag_data.json）
- **35 种伤口类型**知识（complete_wound_database.json）
- 基于 LlamaIndex + ChromaDB 的向量检索系统

## 集成变更

### 1. RAG 服务层 (services/rag_service.py)

**主要变更：**
- 移除了模拟数据，接入真实的 Unified RAG 知识库
- 实现了单例模式，确保 RAG 构建器只初始化一次
- 支持按知识类型查询（皮肤病/伤口护理）
- 提供了降级处理（RAG不可用时返回提示信息）

**核心方法：**
```python
# 查询相似案例和医学知识
query_similar_cases(query: Dict) -> Dict

# 查询特定疾病知识
query_disease_knowledge(disease_name: str, knowledge_type: str) -> Dict

# 查询趋势分析相关知识
query_trend_analysis_knowledge(disease_name: str, trend_pattern: str) -> Dict
```

### 2. RAG 检索节点 (nodes/rag_retrieval.py)

**主要变更：**
- 根据疾病名称自动判断知识类型（皮肤病/伤口护理）
- 构建结构化的医学查询文本
- 支持趋势模式分析（好转/恶化/反复/稳定）
- 自动查询趋势相关的医学知识

**知识类型判断：**
```python
# 皮肤病关键词
痤疮、湿疹、皮炎、银屑病、疱疹、疣、癣...

# 伤口护理关键词
伤口、溃疡、烧伤、烫伤、压疮、糖尿病足、切割伤...
```

### 3. 护理建议生成器 (utils/care_advisor.py)

**主要变更：**
- 新增 `_generate_rag_based_advice()` 方法
- 从 RAG 结果中提取医学知识生成护理建议
- 整合医学注意事项、日常护理、饮食建议到护理方案

**RAG 护理建议类别：**
- `medical_precautions` - 医学注意事项
- `medical_care` - 专业护理建议
- `medical_diet` - 医学饮食建议
- `trend_analysis` - 趋势分析建议

### 4. 报告生成节点 (nodes/finalize_report.py)

**主要变更：**
- 将 RAG 上下文传递给护理建议生成器
- 新增 `_extract_rag_insights()` 方法提取 RAG 洞察
- 报告中包含 RAG 知识库引用信息

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

### 1. 构建 RAG 索引（首次使用）

```bash
cd e:/workspace/SkinAI/skinAI/Unified_Medical_RAG_Project
python build_unified_rag.py
```

### 2. 在疾病趋势 Agent 中使用

```python
from backend.agents.disease_trend_agent.services.rag_service import (
    query_disease_knowledge, query_similar_cases
)

# 查询疾病知识
result = query_disease_knowledge("湿疹", knowledge_type="dermatology")

# 查询相似案例
query = {
    "query_type": "case_comparison",
    "query_text": "痤疮病情恶化的处理方法",
    "disease_type": "痤疮",
    "knowledge_type": "dermatology",
    "trend_indicators": {
        "severity_timeline": [2, 2, 3, 3, 3]
    }
}
result = query_similar_cases(query)
```

## 依赖要求

### Python 包
```
llama-index>=0.10.0
llama-index-vector-stores-chroma>=0.1.0
llama-index-embeddings-huggingface>=0.1.0
chromadb>=0.4.0
```

### 数据文件
```
Unified_Medical_RAG_Project/
├── dermatology_rag_data.json      # 皮肤病数据
├── complete_wound_database.json   # 伤口护理数据
└── unified_chroma_db/             # 向量索引（构建后生成）
```

## 测试

运行集成测试：

```bash
cd e:/workspace/SkinAI/skinAI
python backend/agents/disease_trend_agent/tests/test_unified_rag_integration.py
```

## 注意事项

1. **索引构建**：首次使用需要运行 `build_unified_rag.py` 构建向量索引
2. **内存占用**：RAG 构建器会加载嵌入模型，约占用 1-2GB 内存
3. **降级处理**：RAG 不可用时，系统会返回提示信息，不会中断流程
4. **知识更新**：更新医学数据后需要重新构建索引

## 后续优化建议

1. **缓存机制**：为频繁查询的疾病添加缓存
2. **多语言支持**：支持中英文混合查询
3. **知识图谱**：结合知识图谱增强推理能力
4. **实时更新**：支持增量更新医学知识
