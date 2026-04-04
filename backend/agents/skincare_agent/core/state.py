"""
状态定义
基于皮肤保养Agent设计文档中的State定义
"""

from typing import TypedDict, List, Dict, Optional, Literal, Any


class SkincareState(TypedDict):
    """皮肤保养状态定义"""

    # ========== 输入层 ==========
    user_id: str
    user_input: str
    current_products: List[Dict[str, Any]]
    skin_image: Optional[str]
    skin_metrics: List[Dict[str, Any]]
    entry_date: str
    entry_title: str

    # ========== 用户画像层（User Analysis输出）==========
    skin_profile: Optional[Dict[str, Any]]
    # {
    #   "skin_type": "油性",
    #   "skin_concerns": ["痘痘", "色斑"],
    #   "skin_goals": ["抗衰老", "美白"],
    #   "age_range": "20-30",
    #   "sensitivity_factors": ["酒精"],
    #   "routine_level": "进阶",
    #   "confidence": 0.85
    # }

    # ========== RAG层 ==========
    rag_queries: Optional[List[str]]
    rag_results: Optional[List[Dict[str, Any]]]

    # ========== 成分检测层 ==========
    ingredient_assessment: Optional[Dict[str, Any]]
    # {
    #   "is_compatible": true,
    #   "conflicts": [],
    #   "recommendations": ["推荐成分"],
    #   "assessment": "评估说明"
    # }

    # ========== 方案生成层（LLM Reasoning输出）==========
    routine: Optional[Dict[str, Any]]
    # {
    #   "morning_routine": ["清洁", "保湿", "防晒"],
    #   "evening_routine": ["清洁", "精华", "面霜"],
    #   "recommended_ingredients": [...],
    #   "products_to_avoid": [...],
    #   "expected_timeline": "4-8周见效",
    #   "lifestyle_tips": [...]
    # }

    # ========== 输出层 ==========
    care_advice: Optional[List[Dict[str, Any]]]
    ai_verdict: Optional[str]
    final_output: Optional[Dict[str, Any]]
