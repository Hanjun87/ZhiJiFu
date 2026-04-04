# 🌟 美容保养成分RAG知识库

基于权威皮肤科学来源的美容保养成分数据库，包含24种常见护肤成分的详细信息。

## 📊 知识库统计

- **总成分数**: 24种
- **证据等级A级**: 18种 (多项临床研究支持)
- **证据等级B级**: 6种 (初步研究支持)
- **数据来源**: AAD, JID, PubMed, FDA, British Journal of Dermatology等

## 📁 文件结构

```
skincare_ingredients_rag/
├── data/
│   ├── skincare_ingredients.json    # 成分详细数据
│   └── index.json                    # 索引和元数据
├── skincare_rag.py                   # RAG查询系统
└── README.md                         # 使用说明
```

## 🚀 快速开始

### 1. 安装依赖

```bash
# 需要Python 3.7+
python --version
```

### 2. 运行查询系统

```bash
python skincare_rag.py
```

### 3. 使用示例

```python
from skincare_rag import SkincareRAG

# 初始化RAG
rag = SkincareRAG()

# 查询成分信息
result = rag.query("维生素C")
print(result)

# 按功效搜索
results = rag.search_by_benefit("美白")
for ing in results:
    print(f"{ing['ingredient_name']}: {ing['evidence_level']}")

# 获取推荐
recommendations = rag.get_recommendations(['抗衰老', '美白'])
print("高优先级推荐:", recommendations['high_priority'])
```

## 🔍 支持的查询方式

### 功效关键词
- **抗衰老**: 抗衰老、抗老、细纹、皱纹、松弛
- **美白**: 美白、淡斑、色斑、暗沉、提亮
- **祛痘**: 祛痘、痘痘、粉刺、黑头、闭口
- **保湿**: 保湿、补水、干燥、脱皮
- **修复**: 修复、屏障、受损
- **舒缓**: 舒缓、镇静、泛红、刺激
- **抗氧化**: 抗氧化、自由基
- **去角质**: 去角质、焕肤
- **防晒**: 防晒、紫外线

### 成分名称
支持中英文名称和别名查询，例如：
- 视黄醇、Retinol、维A醇
- 烟酰胺、Niacinamide
- 透明质酸、玻尿酸、HA

## 📋 成分列表

### A级证据成分 (18种)

| 成分 | 主要功效 | 类别 |
|------|----------|------|
| 视黄醇/维A醇 | 抗衰老、祛痘、美白 | 抗衰老 |
| 维生素C | 抗氧化、美白、抗衰老 | 抗氧化/美白 |
| 烟酰胺 | 控油、美白、抗衰老、修复屏障 | 多功能 |
| 透明质酸 | 保湿、修复、抗衰老 | 保湿 |
| 果酸(AHA) | 去角质、美白、抗衰老、祛痘 | 去角质/焕肤 |
| 水杨酸(BHA) | 祛痘、去角质、控油 | 去角质/祛痘 |
| 神经酰胺 | 修复屏障、保湿、舒缓 | 屏障修复 |
| 壬二酸 | 祛痘、美白、抗炎 | 祛痘/美白 |
| 传明酸 | 美白、淡斑、抗炎 | 美白 |
| 曲酸 | 美白、淡斑 | 美白 |
| 角鲨烷 | 保湿、修复、舒缓 | 保湿 |
| 补骨脂酚 | 抗衰老、美白、祛痘 | 抗衰老 |
| 氧化锌 | 防晒、舒缓、修复 | 防晒 |
| 口服胶原蛋白肽 | 抗衰老、保湿、修复 | 内服美容 |
| 泛醇/维生素B5 | 保湿、修复、舒缓 | 保湿/修复 |
| 尿囊素 | 舒缓、修复、保湿 | 修复/舒缓 |
| 阿达帕林 | 祛痘、抗衰老、改善纹理 | 处方祛痘/抗衰老 |
| 维A酸 | 祛痘、抗衰老、美白 | 处方祛痘/抗衰老 |

### B级证据成分 (6种)

| 成分 | 主要功效 | 类别 |
|------|----------|------|
| 胜肽 | 抗衰老、修复、舒缓 | 抗衰老 |
| 积雪草提取物 | 修复、舒缓、抗衰老、抗氧化 | 修复/舒缓 |
| 绿茶提取物(EGCG) | 抗氧化、舒缓、抗衰老、美白 | 抗氧化/舒缓 |
| 熊果苷 | 美白、淡斑 | 美白 |
| 杏仁酸 | 去角质、美白、祛痘、抗衰老 | 去角质/焕肤 |
| 多羟基酸(PHA) | 去角质、保湿、抗氧化 | 去角质/保湿 |

## 📚 数据结构

每个成分包含以下字段：

```json
{
  "ingredient_id": "唯一标识",
  "ingredient_name": "成分名称",
  "aliases": ["别名列表"],
  "category": "类别",
  "overview": "概述",
  "benefits": ["功效列表"],
  "mechanism": ["作用机制"],
  "usage_instructions": ["使用方法"],
  "precautions": ["注意事项"],
  "suitable_skin_types": ["适合肤质"],
  "contraindications": ["禁忌"],
  "concentration_range": "浓度范围",
  "usage_frequency": "使用频率",
  "source": "数据来源",
  "evidence_level": "证据等级",
  "evidence_description": "证据描述"
}
```

## 🔬 证据等级说明

- **A级**: 多项随机对照试验(RCT)或荟萃分析支持，FDA批准或皮肤科临床指南推荐
- **B级**: 初步临床研究或体外/体内实验支持，需要更多研究验证

## ⚠️ 使用声明

1. 本知识库仅供学习和参考使用
2. 处方药物(如维A酸、阿达帕林)需在医生指导下使用
3. 使用任何新成分前建议进行皮肤测试
4. 如有严重皮肤问题，请咨询专业皮肤科医生

## 📖 数据来源

- American Academy of Dermatology (AAD)
- Journal of Investigative Dermatology (JID)
- Journal of the American Academy of Dermatology (JAAD)
- PubMed数据库
- FDA批准文件
- British Journal of Dermatology
- PMC (PubMed Central)
- Journal of Cosmetic Dermatology

## 📝 更新日志

### v1.0.0 (2025-04-02)
- 初始版本发布
- 包含24种美容保养成分
- 支持功效搜索和成分查询
- 添加成分兼容性检查功能

## 🤝 贡献

欢迎提交Issue和Pull Request来完善知识库。

## 📄 许可证

MIT License

---

**注意**: 本知识库信息基于2025年4月前的科学研究，护肤领域不断发展，建议关注最新研究进展。
