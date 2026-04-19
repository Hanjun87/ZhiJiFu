"""
LLM推理节点 - 综合视觉分析和知识库做诊断
"""

import json
import random
from typing import Dict, Any, List
import sys
import os

# 添加父目录到路径以支持绝对导入
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.state import DiagnosisState


# 备用模拟数据
MOCK_LLM_DIAGNOSIS = {
    "痤疮（炎性）": {
        "diagnosis": "中度痤疮（炎症期）",
        "confidence": 0.88,
        "differential": ["玫瑰痤疮", "激素依赖性皮炎"],
        "treatment_plan": {
            "topical": ["外用阿达帕林凝胶（每晚一次）", "外用克林霉素磷酸酯凝胶（每日两次）"],
            "oral": ["口服多西环素 100mg（每日一次，疗程4-6周）"],
            "procedures": ["红蓝光治疗（每周2次，连续4周）"]
        },
        "lifestyle": ["忌辛辣刺激食物", "规律作息，避免熬夜", "注意面部清洁，避免过度去油", "不要用手挤压痘痘"],
        "follow_up": "2周后复查，如炎症控制不佳考虑调整口服药",
        "red_flags": [],
        "referral_needed": False
    },
    "玫瑰痤疮": {
        "diagnosis": "玫瑰痤疮（丘疹脓疱型）",
        "confidence": 0.82,
        "differential": ["寻常痤疮", "脂溢性皮炎"],
        "treatment_plan": {
            "topical": ["外用甲硝唑凝胶（每日两次）", "外用伊维菌素乳膏（每晚一次）"],
            "oral": ["口服多西环素 100mg（每日一次，疗程8-12周）"],
            "procedures": ["避免诱发因素（日晒、热饮、辛辣食物、情绪激动）"]
        },
        "lifestyle": ["严格防晒", "避免温度剧烈变化", "避免饮酒和辛辣食物", "使用温和护肤品"],
        "follow_up": "4周后复查，评估疗效",
        "red_flags": [],
        "referral_needed": False
    },
    "银屑病": {
        "diagnosis": "寻常型银屑病（轻度）",
        "confidence": 0.85,
        "differential": ["湿疹", "体癣"],
        "treatment_plan": {
            "topical": ["外用卡泊三醇软膏（每日两次）", "外用糠酸莫米松乳膏（每日一次，疗程2周）"],
            "oral": [],
            "procedures": ["窄谱UVB光疗（每周2-3次）"]
        },
        "lifestyle": ["避免搔抓", "保持皮肤湿润", "避免上呼吸道感染", "戒烟限酒"],
        "follow_up": "4周后复查，如效果不佳考虑系统治疗",
        "red_flags": [],
        "referral_needed": False
    },
    "过敏性皮炎（急性）": {
        "diagnosis": "急性泛发性过敏性皮炎",
        "confidence": 0.75,
        "differential": ["药疹", "急性湿疹", "中毒性表皮坏死松解症"],
        "treatment_plan": {
            "topical": ["外用炉甘石洗剂（每日多次）", "外用弱效糖皮质激素"],
            "oral": ["口服氯雷他定 10mg（每日一次）"],
            "procedures": ["寻找并避免过敏原", "必要时静脉注射糖皮质激素"]
        },
        "lifestyle": ["立即停用可疑致敏药物/护肤品", "清淡饮食", "避免热水烫洗"],
        "follow_up": "3天内必须复查，观察病情变化",
        "red_flags": ["病情进展迅速", "全身广泛受累", "需警惕过敏性休克"],
        "referral_needed": True
    },
    "default": {
        "diagnosis": "轻度痤疮",
        "confidence": 0.90,
        "differential": ["脂溢性皮炎", "毛囊炎"],
        "treatment_plan": {
            "topical": ["外用阿达帕林凝胶（每晚一次）"],
            "oral": [],
            "procedures": []
        },
        "lifestyle": ["保持面部清洁", "避免熬夜", "清淡饮食"],
        "follow_up": "4周后复查",
        "red_flags": [],
        "referral_needed": False
    }
}


SYSTEM_PROMPT = """你是皮肤科医生。根据患者信息给出诊断和治疗建议。

输入包含：
1. 视觉分析结果 - AI对照片的分析
2. 相似病例参考 - 历史相似病例
3. 患者描述 - 主观感受

要求：
- 优先常见诊断
- 列出2-3个鉴别诊断
- 给出置信度
- 治疗方案要具体（药物、用法、疗程）

输出JSON格式：
{
    "diagnosis": "主要诊断",
    "confidence": 0.0-1.0,
    "differential": ["鉴别诊断1", "鉴别诊断2"],
    "treatment_plan": {
        "topical": ["外用药物"],
        "oral": ["口服药物"],
        "procedures": ["辅助治疗"]
    },
    "lifestyle": ["生活建议"],
    "follow_up": "复查时间",
    "red_flags": ["危险信号"],
    "referral_needed": true/false
}
"""


def llm_reasoning_node(state: DiagnosisState) -> Dict[str, Any]:
    # 先尝试调用百炼平台，失败就用模拟数据
    try:
        # 尝试调用阿里云百炼平台
        return llm_reasoning_with_bailian(state)
    except Exception as e:
        print(f"[LLM] 百炼平台调用失败，使用模拟数据: {e}")
        return llm_reasoning_with_mock(state)


def llm_reasoning_with_bailian(state: DiagnosisState) -> Dict[str, Any]:
    from openai import OpenAI
    
    # 百炼平台配置
    api_key = os.getenv("BAILIAN_API_KEY", "sk-61be8ee9942249cfb284735c015d124f")
    base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    model = os.getenv("BAILIAN_MODEL", "qwen-plus")
    
    client = OpenAI(api_key=api_key, base_url=base_url)
    
    context = build_context(state)
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": context}
    ]
    
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.1,
        max_tokens=2000
    )
    
    content = response.choices[0].message.content
    
    # 解析JSON（处理markdown格式）
    try:
        llm_diagnosis = json.loads(content)
    except json.JSONDecodeError:
        import re
        json_match = re.search(r'```json\n(.*?)\n```', content, re.DOTALL)
        if json_match:
            llm_diagnosis = json.loads(json_match.group(1))
        else:
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                llm_diagnosis = json.loads(json_match.group())
            else:
                raise ValueError(f"无法解析模型输出: {content}")
    
    # 补全必要字段
    required_fields = ["diagnosis", "confidence", "treatment_plan", "referral_needed"]
    for field in required_fields:
        if field not in llm_diagnosis:
            llm_diagnosis[field] = [] if field == "red_flags" else (False if field == "referral_needed" else "")
    
    print(f"[LLM] 百炼调用成功，模型: {model}")
    
    return {
        "llm_diagnosis": llm_diagnosis
    }


def llm_reasoning_with_mock(state: DiagnosisState) -> Dict[str, Any]:
    # 备用方案：使用模拟数据
    vision_analysis = state.get("vision_analysis", {})
    rag_results = state.get("rag_results", [])
    
    estimated_type = vision_analysis.get("estimated_type", "")
    
    # 根据疾病类型匹配模拟数据
    llm_diagnosis = None
    for disease_type, diagnosis in MOCK_LLM_DIAGNOSIS.items():
        if disease_type in estimated_type or estimated_type in disease_type:
            llm_diagnosis = diagnosis.copy()
            break
    
    if not llm_diagnosis:
        llm_diagnosis = MOCK_LLM_DIAGNOSIS["default"].copy()
    
    # 根据视觉置信度调整
    visual_confidence = vision_analysis.get("visual_confidence", 0.8)
    llm_diagnosis["confidence"] = round(min(visual_confidence * 1.05, 0.95), 2)
    
    # 紧急建议时强制转诊
    if vision_analysis.get("suggest_urgent", False):
        llm_diagnosis["referral_needed"] = True
        llm_diagnosis["red_flags"] = llm_diagnosis.get("red_flags", []) + ["视觉模型建议紧急就医"]
    
    # RAG为空时降低置信度
    if not rag_results:
        llm_diagnosis["confidence"] = round(llm_diagnosis["confidence"] * 0.9, 2)
        llm_diagnosis["note"] = "未检索到相似病例，诊断基于视觉分析"
    
    return {"llm_diagnosis": llm_diagnosis}


def build_context(state: DiagnosisState) -> str:
    # 构建LLM输入上下文
    vision = state.get("vision_analysis", {})
    rag = state.get("rag_results", [])
    user_desc = state.get("user_description", "")
    
    context_parts = []
    
    if vision:
        context_parts.append("【视觉分析结果】")
        context_parts.append(f"- 症状：{', '.join(vision.get('symptoms', []))}")
        context_parts.append(f"- 分布：{vision.get('distribution', '')}")
        context_parts.append(f"- 严重度：{vision.get('severity', '')}")
        context_parts.append(f"- 初步判断：{vision.get('estimated_type', '')}")
        context_parts.append(f"- 分析置信度：{vision.get('visual_confidence', 0)}")
        context_parts.append(f"- 详细推理：{vision.get('reasoning', '')}")
    
    if rag:
        context_parts.append(f"\n【相似病例参考】（Top {len(rag)}）")
        for i, case in enumerate(rag, 1):
            context_parts.append(f"\n病例{i}：")
            context_parts.append(f"- 诊断：{case.get('diagnosis', '')}")
            context_parts.append(f"- 治疗方案：{', '.join(case.get('treatment', []))}")
            context_parts.append(f"- 预后：{case.get('outcome', '')}")
            context_parts.append(f"- 恢复周期：{case.get('recovery_days', 0)}天")
    
    if user_desc:
        context_parts.append(f"\n【患者自述】\n{user_desc}")
    
    return "\n".join(context_parts)
