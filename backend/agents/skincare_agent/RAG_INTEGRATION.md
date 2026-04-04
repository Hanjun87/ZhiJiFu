"""
RAG集成文档

本模块对接 skincare_ingredients_rag 知识库
数据源：skincare_ingredients_rag/skincare_ingredients_rag/data/skincare_ingredients.json

包含24种护肤品成分，涵盖：
- 抗衰老：视黄醇、胜肽、补骨脂酚
- 抗氧化/美白：维生素C、曲酸、熊果苷
- 保湿：透明质酸、角鲨烷、泛醇
- 去角质：果酸(AHA)、水杨酸(BHA)、杏仁酸
- 屏障修复：神经酰胺、积雪草提取物
- 防晒：氧化锌
- 祛痘：壬二酸、阿达帕林、维A酸
- 舒缓修复：绿茶提取物、尿囊素
- 多功能：烟酰胺
"""

RAG_CONFIG = {
    "data_source": "skincare_ingredients_rag/skincare_ingredients_rag/data/skincare_ingredients.json",
    "top_k": 5,
    "ingredient_count": 24
}

INGREDIENT_CATEGORIES = {
    "抗衰老": ["视黄醇", "胜肽", "补骨脂酚"],
    "抗氧化/美白": ["维生素C", "曲酸", "熊果苷"],
    "保湿": ["透明质酸", "角鲨烷", "泛醇"],
    "去角质": ["果酸(AHA)", "水杨酸(BHA)", "杏仁酸"],
    "屏障修复": ["神经酰胺", "积雪草提取物"],
    "防晒": ["氧化锌"],
    "祛痘": ["壬二酸", "阿达帕林", "维A酸"],
    "舒缓修复": ["绿茶提取物", "尿囊素"],
    "多功能": ["烟酰胺"]
}

CONFLICT_MATRIX = {
    "维A酸": ["果酸", "水杨酸", "维C"],
    "视黄醇": ["果酸", "水杨酸"],
    "维C": ["烟酰胺(高浓度)", "维A酸"],
    "果酸": ["维A酸", "水杨酸", "去角质产品"]
}

SYNERGY_MATRIX = {
    "维C": ["维E"],
    "视黄醇": ["透明质酸"],
    "烟酰胺": ["透明质酸", "神经酰胺"],
    "补骨脂酚": ["透明质酸"]
}
