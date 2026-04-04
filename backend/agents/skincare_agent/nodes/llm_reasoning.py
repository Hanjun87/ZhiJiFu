"""
第二层：LLM推理节点（核心Agent）
深度推理，综合用户画像+成分知识，生成个性化护肤方案
"""

import json
from typing import Dict, Any, List

from openai import OpenAI

from ..core.state import SkincareState
from ..config.settings import settings
from ..config.prompts import LLM_REASONING_PROMPT


def llm_reasoning_node(state: SkincareState) -> Dict[str, Any]:
    """
    LLM推理节点 - 生成个性化护肤方案

    Args:
        state: 当前状态

    Returns:
        包含routine的字典
    """
    try:
        return llm_reasoning_with_llm(state)
    except Exception as e:
        print(f"[LLMReasoning] LLM调用失败，使用默认方案: {e}")
        return llm_reasoning_with_defaults(state)


def llm_reasoning_with_llm(state: SkincareState) -> Dict[str, Any]:
    """
    调用LLM生成护肤方案
    """
    api_key = settings.get_api_key()
    if not api_key:
        raise ValueError("未配置API Key")

    base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    client = OpenAI(api_key=api_key, base_url=base_url)

    context = _build_context(state)
    prompt = LLM_REASONING_PROMPT.format(
        user_profile=context["user_profile"],
        skin_metrics=context["skin_metrics"],
        ingredient_knowledge=context["ingredient_knowledge"],
        product_assessment=context["product_assessment"]
    )

    response = client.chat.completions.create(
        model=settings.BAILIAN_MODEL,
        messages=[
            {"role": "system", "content": "你是一个专业的皮肤科护肤顾问。"},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=2000
    )

    content = response.choices[0].message.content

    try:
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        routine = json.loads(content)
    except json.JSONDecodeError:
        import re
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            routine = json.loads(json_match.group())
        else:
            raise ValueError(f"无法解析护肤方案输出: {content}")

    return {"routine": routine}


def llm_reasoning_with_defaults(state: SkincareState) -> Dict[str, Any]:
    """
    使用默认方案（当LLM调用失败时）
    """
    skin_profile = state.get("skin_profile", {})
    skin_concerns = skin_profile.get("skin_concerns", [])
    routine_level = skin_profile.get("routine_level", "新手")

    default_routine = {
        "morning_routine": ["温和清洁", "保湿霜", "防晒霜"],
        "evening_routine": ["温和清洁", "保湿精华", "面霜"],
        "recommended_ingredients": [
            {"ingredient": "透明质酸", "purpose": "保湿", "priority": 1},
            {"ingredient": "烟酰胺", "purpose": "修复屏障", "priority": 2}
        ],
        "products_to_avoid": [],
        "expected_timeline": "持续使用4-8周见效",
        "lifestyle_tips": ["保持充足睡眠", "注意防晒", "均衡饮食"]
    }

    return {"routine": default_routine}


def _build_context(state: SkincareState) -> Dict[str, str]:
    """
    构建LLM输入上下文
    """
    skin_profile = state.get("skin_profile", {})
    skin_metrics = state.get("skin_metrics", [])
    rag_results = state.get("rag_results", [])
    ingredient_assessment = state.get("ingredient_assessment", {})

    user_profile = f"""
肤质：{skin_profile.get('skin_type', '未知')}
问题：{', '.join(skin_profile.get('skin_concerns', []))}
目标：{', '.join(skin_profile.get('skin_goals', []))}
年龄：{skin_profile.get('age_range', '未知')}
经验：{skin_profile.get('routine_level', '新手')}
敏感因素：{', '.join(skin_profile.get('sensitivity_factors', [])) or '无'}
"""

    skin_metrics_str = _format_skin_metrics(skin_metrics)

    ingredient_knowledge = _format_rag_results(rag_results)

    product_assessment = f"""
兼容性：{'是' if ingredient_assessment.get('is_compatible', True) else '否'}
冲突成分：{', '.join(ingredient_assessment.get('conflicts', [])) or '无'}
推荐成分：{', '.join(ingredient_assessment.get('recommendations', [])) or '根据肤质推荐'}
评估：{ingredient_assessment.get('assessment', '待评估')}
"""

    return {
        "user_profile": user_profile,
        "skin_metrics": skin_metrics_str,
        "ingredient_knowledge": ingredient_knowledge,
        "product_assessment": product_assessment
    }


def _format_skin_metrics(skin_metrics: List[Dict[str, Any]]) -> str:
    """
    格式化皮肤指标
    """
    if not skin_metrics:
        return "暂无皮肤指标数据"

    lines = []
    for metric in skin_metrics:
        label = metric.get('label', '未知指标')
        value = metric.get('value', 0)
        detail = metric.get('detail', '')

        # 根据数值判断严重程度
        if value >= 70:
            severity = "严重"
        elif value >= 40:
            severity = "中等"
        else:
            severity = "轻微"

        lines.append(f"- {label}：{value}/100（{severity}）")
        if detail:
            lines.append(f"  详情：{detail}")

    return "\n".join(lines)


def _format_rag_results(rag_results: List[Dict[str, Any]]) -> str:
    """
    格式化RAG结果
    """
    if not rag_results:
        return "暂无成分知识"

    lines = []
    for i, result in enumerate(rag_results, 1):
        name = result.get("ingredient_name", "未知成分")
        category = result.get("category", "")
        benefits = ", ".join(result.get("benefits", [])[:3]) if result.get("benefits") else ""
        precautions = ", ".join(result.get("precautions", [])[:2]) if result.get("precautions") else ""

        lines.append(f"{i}. {name}（{category}）")
        if benefits:
            lines.append(f"   功效：{benefits}")
        if precautions:
            lines.append(f"   注意：{precautions}")

    return "\n".join(lines)
