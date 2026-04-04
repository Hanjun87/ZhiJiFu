"""
测试节点模块
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.state import SkincareState
from nodes.user_analysis import user_analysis_node
from nodes.rag_retrieval import rag_retrieval_node
from nodes.ingredient_check import ingredient_check_node
from nodes.llm_reasoning import llm_reasoning_node
from nodes.compile_output import compile_output_node


def test_user_analysis_node():
    """测试用户分析节点"""
    state = SkincareState(
        user_id="test_user",
        user_input="我是油性皮肤，T区出油多，有痘痘",
        current_products=[],
        skin_metrics=[
            {"label": "痘痘", "value": 45, "detail": "中度痘痘"}
        ],
        entry_date="2026-04-04",
        entry_title="油性皮肤护理"
    )

    result = user_analysis_node(state)
    print(f"User Analysis Result: {result}")

    assert "skin_profile" in result
    assert result["skin_profile"] is not None
    print("test_user_analysis_node passed!")


def test_rag_retrieval_node():
    """测试RAG检索节点"""
    state = SkincareState(
        user_id="test_user",
        user_input="",
        current_products=[],
        skin_metrics=[],
        entry_date="",
        entry_title="",
        skin_profile={
            "skin_type": "油性",
            "skin_concerns": ["痘痘"],
            "skin_goals": ["控油"]
        }
    )

    result = rag_retrieval_node(state)
    print(f"RAG Retrieval Result: {result}")

    assert "rag_results" in result
    assert result["rag_results"] is not None
    print("test_rag_retrieval_node passed!")


def test_ingredient_check_node():
    """测试成分检测节点"""
    state = SkincareState(
        user_id="test_user",
        user_input="",
        current_products=[
            {"id": "1", "title": "水杨酸精华", "desc": "控油"},
            {"id": "2", "title": "烟酰胺精华", "desc": "美白"}
        ],
        skin_metrics=[],
        entry_date="",
        entry_title="",
        skin_profile={
            "skin_type": "油性",
            "skin_concerns": ["痘痘"],
            "skin_goals": ["控油"]
        },
        rag_results=[
            {"ingredient_name": "水杨酸", "category": "去角质"},
            {"ingredient_name": "烟酰胺", "category": "多功能"}
        ]
    )

    result = ingredient_check_node(state)
    print(f"Ingredient Check Result: {result}")

    assert "ingredient_assessment" in result
    print("test_ingredient_check_node passed!")


def test_llm_reasoning_node():
    """测试LLM推理节点"""
    state = SkincareState(
        user_id="test_user",
        user_input="",
        current_products=[],
        skin_metrics=[],
        entry_date="",
        entry_title="",
        skin_profile={
            "skin_type": "油性",
            "skin_concerns": ["痘痘", "毛孔粗大"],
            "skin_goals": ["控油", "收缩毛孔"],
            "age_range": "20-30",
            "sensitivity_factors": [],
            "routine_level": "进阶"
        },
        rag_results=[
            {
                "ingredient_name": "水杨酸",
                "category": "去角质",
                "benefits": ["控油", "深入毛孔"],
                "precautions": ["可能导致干燥"]
            }
        ],
        ingredient_assessment={
            "is_compatible": True,
            "conflicts": [],
            "recommendations": ["水杨酸", "烟酰胺"]
        }
    )

    result = llm_reasoning_node(state)
    print(f"LLM Reasoning Result: {result}")

    assert "routine" in result
    print("test_llm_reasoning_node passed!")


def test_compile_output_node():
    """测试输出组装节点"""
    state = SkincareState(
        user_id="test_user",
        user_input="",
        current_products=[],
        skin_metrics=[],
        entry_date="",
        entry_title="",
        skin_profile={
            "skin_type": "油性",
            "skin_concerns": ["痘痘"],
            "skin_goals": ["控油"],
            "routine_level": "进阶"
        },
        rag_results=[],
        ingredient_assessment={
            "is_compatible": True,
            "conflicts": [],
            "recommendations": ["水杨酸"]
        },
        routine={
            "morning_routine": ["洁面", "爽肤水", "精华", "防晒"],
            "evening_routine": ["洁面", "精华", "面霜"],
            "recommended_ingredients": [
                {"ingredient": "水杨酸", "purpose": "控油", "priority": 1}
            ]
        }
    )

    result = compile_output_node(state)
    print(f"Compile Output Result: {result}")

    assert "final_output" in result
    assert "care_advice" in result
    assert "ai_verdict" in result
    print("test_compile_output_node passed!")


if __name__ == "__main__":
    print("Running node tests...")

    try:
        test_user_analysis_node()
    except Exception as e:
        print(f"test_user_analysis_node failed: {e}")

    try:
        test_rag_retrieval_node()
    except Exception as e:
        print(f"test_rag_retrieval_node failed: {e}")

    try:
        test_ingredient_check_node()
    except Exception as e:
        print(f"test_ingredient_check_node failed: {e}")

    try:
        test_llm_reasoning_node()
    except Exception as e:
        print(f"test_llm_reasoning_node failed: {e}")

    try:
        test_compile_output_node()
    except Exception as e:
        print(f"test_compile_output_node failed: {e}")

    print("\nAll tests completed!")
