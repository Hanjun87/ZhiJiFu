"""
用户分析节点
"""

import json
import os
from typing import Dict, Any
from openai import OpenAI

from ..core.state import SkincareState
from ..config.settings import settings
from ..config.prompts import USER_ANALYSIS_PROMPT


def user_analysis_node(state: SkincareState) -> Dict[str, Any]:
    # 解析用户输入，构建皮肤画像
    try:
        return user_analysis_with_llm(state)
    except Exception as e:
        print(f"[UserAnalysis] LLM调用失败，使用默认画像: {e}")
        return user_analysis_with_defaults(state)


def user_analysis_with_llm(state: SkincareState) -> Dict[str, Any]:
    api_key = settings.get_api_key()
    if not api_key:
        raise ValueError("未配置API Key")

    client = OpenAI(api_key=api_key, base_url="https://dashscope.aliyuncs.com/compatible-mode/v1")

    user_info = _build_user_info(state)
    prompt = USER_ANALYSIS_PROMPT.format(user_info=user_info)

    response = client.chat.completions.create(
        model=settings.BAILIAN_MODEL,
        messages=[
            {"role": "system", "content": "你是皮肤科护肤顾问。"},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=1000
    )

    content = response.choices[0].message.content

    # 解析JSON响应
    try:
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        skin_profile = json.loads(content.strip())
    except json.JSONDecodeError:
        import re
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            skin_profile = json.loads(json_match.group())
        else:
            raise ValueError(f"无法解析输出: {content}")

    return {"skin_profile": skin_profile}


def user_analysis_with_defaults(state: SkincareState) -> Dict[str, Any]:
    # LLM失败时的默认画像
    default_profile = {
        "skin_type": "混合",
        "skin_concerns": ["痘痘", "毛孔粗大"],
        "skin_goals": ["控油", "祛痘"],
        "age_range": "20-30",
        "sensitivity_factors": [],
        "routine_level": "新手",
        "confidence": 0.5
    }
    return {"skin_profile": default_profile}


def _build_user_info(state: SkincareState) -> str:
    # 拼接用户信息
    parts = []

    entry_title = state.get("entry_title", "")
    if entry_title:
        parts.append(f"日记标题：{entry_title}")

    user_input = state.get("user_input", "")
    if user_input:
        parts.append(f"用户描述：{user_input}")

    skin_metrics = state.get("skin_metrics", [])
    if skin_metrics:
        metric_str = ", ".join([f"{m.get('label', '')}({m.get('value', 0)})" for m in skin_metrics])
        parts.append(f"皮肤指标：{metric_str}")

    current_products = state.get("current_products", [])
    if current_products:
        product_names = [p.get("title", "") for p in current_products]
        parts.append(f"当前使用产品：{', '.join(product_names)}")

    return "\n".join(parts) if parts else "用户未提供详细信息"
