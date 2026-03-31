"""
第二层：LLM推理节点（核心Agent）
深度推理，综合视觉分析+知识库，做诊断决策

接入阿里云百炼平台
"""

import json
import random
from typing import Dict, Any, List
import sys
import os

# 添加父目录到路径以支持绝对导入
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.state import DiagnosisState


# 模拟LLM诊断结果模板（备用）
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


SYSTEM_PROMPT = """你是资深皮肤病专家。基于以下信息做诊断和治疗建议：

输入信息：
1. 【视觉分析结果】：AI对照片的分析
2. 【相似病例参考】：历史相似病例的治疗经过和预后
3. 【用户描述】：患者主观感受

诊断原则：
- 优先考虑常见诊断（奥卡姆剃刀）
- 列出鉴别诊断（2-3个可能）
- 给出置信度（低置信度时建议线下确诊）
- 治疗方案需具体（药物名称、用法、疗程）

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
    """
    LLM推理节点 - 综合视觉分析+知识库做诊断决策
    
    默认使用阿里云百炼平台，失败时回退到模拟数据
    
    Args:
        state: 当前状态，包含vision_analysis和rag_results
        
    Returns:
        包含llm_diagnosis的字典
    """
    
    try:
        # 尝试调用阿里云百炼平台
        return llm_reasoning_with_bailian(state)
    except Exception as e:
        print(f"[LLM] 百炼平台调用失败，使用模拟数据: {e}")
        return llm_reasoning_with_mock(state)


def llm_reasoning_with_bailian(state: DiagnosisState) -> Dict[str, Any]:
    """
    调用阿里云百炼平台进行诊断推理
    
    使用OpenAI兼容接口
    """
    from openai import OpenAI
    
    # 阿里云百炼平台配置
    api_key = os.getenv("BAILIAN_API_KEY", "sk-61be8ee9942249cfb284735c015d124f")
    base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    model = os.getenv("BAILIAN_MODEL", "qwen-plus")  # 默认使用qwen-plus
    
    # 初始化客户端
    client = OpenAI(
        api_key=api_key,
        base_url=base_url
    )
    
    # 构建上下文
    context = build_context(state)
    
    # 构造消息
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": context}
    ]
    
    # 调用百炼平台
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.1,  # 低温度，诊断稳定
        max_tokens=2000
    )
    
    # 解析响应
    content = response.choices[0].message.content
    
    # 提取JSON（模型可能返回markdown格式的JSON）
    try:
        # 尝试直接解析
        llm_diagnosis = json.loads(content)
    except json.JSONDecodeError:
        # 尝试从markdown代码块中提取
        import re
        json_match = re.search(r'```json\n(.*?)\n```', content, re.DOTALL)
        if json_match:
            llm_diagnosis = json.loads(json_match.group(1))
        else:
            # 尝试查找任何JSON格式的内容
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                llm_diagnosis = json.loads(json_match.group())
            else:
                raise ValueError(f"无法解析模型输出: {content}")
    
    # 验证必要字段
    required_fields = ["diagnosis", "confidence", "treatment_plan", "referral_needed"]
    for field in required_fields:
        if field not in llm_diagnosis:
            llm_diagnosis[field] = [] if field == "red_flags" else (False if field == "referral_needed" else "")
    
    print(f"[LLM] 百炼平台调用成功，模型: {model}")
    
    return {
        "llm_diagnosis": llm_diagnosis
    }


def llm_reasoning_with_mock(state: DiagnosisState) -> Dict[str, Any]:
    """
    使用模拟数据（备用方案）
    """
    
    vision_analysis = state.get("vision_analysis", {})
    rag_results = state.get("rag_results", [])
    
    # 获取疾病类型
    estimated_type = vision_analysis.get("estimated_type", "")
    
    # 根据疾病类型选择对应的模拟诊断结果
    llm_diagnosis = None
    for disease_type, diagnosis in MOCK_LLM_DIAGNOSIS.items():
        if disease_type in estimated_type or estimated_type in disease_type:
            llm_diagnosis = diagnosis.copy()
            break
    
    # 如果没有匹配到，使用默认结果
    if not llm_diagnosis:
        llm_diagnosis = MOCK_LLM_DIAGNOSIS["default"].copy()
    
    # 根据视觉分析置信度调整诊断置信度
    visual_confidence = vision_analysis.get("visual_confidence", 0.8)
    llm_diagnosis["confidence"] = round(min(visual_confidence * 1.05, 0.95), 2)
    
    # 如果有紧急建议，强制转诊
    if vision_analysis.get("suggest_urgent", False):
        llm_diagnosis["referral_needed"] = True
        llm_diagnosis["red_flags"] = llm_diagnosis.get("red_flags", []) + ["视觉模型建议紧急就医"]
    
    # 如果RAG结果为空，稍微降低置信度
    if not rag_results:
        llm_diagnosis["confidence"] = round(llm_diagnosis["confidence"] * 0.9, 2)
        llm_diagnosis["note"] = "未检索到相似病例，诊断基于视觉分析"
    
    return {
        "llm_diagnosis": llm_diagnosis
    }


def build_context(state: DiagnosisState) -> str:
    """
    构建LLM输入上下文
    
    组合视觉分析结果、RAG检索结果、用户描述
    
    Args:
        state: 当前状态
        
    Returns:
        格式化的上下文字符串
    """
    vision = state.get("vision_analysis", {})
    rag = state.get("rag_results", [])
    user_desc = state.get("user_description", "")
    
    context_parts = []
    
    # 视觉分析结果
    if vision:
        context_parts.append("【视觉分析结果】")
        context_parts.append(f"- 症状：{', '.join(vision.get('symptoms', []))}")
        context_parts.append(f"- 分布：{vision.get('distribution', '')}")
        context_parts.append(f"- 严重度：{vision.get('severity', '')}")
        context_parts.append(f"- 初步判断：{vision.get('estimated_type', '')}")
        context_parts.append(f"- 分析置信度：{vision.get('visual_confidence', 0)}")
        context_parts.append(f"- 详细推理：{vision.get('reasoning', '')}")
    
    # 相似病例参考
    if rag:
        context_parts.append(f"\n【相似病例参考】（Top {len(rag)}）")
        for i, case in enumerate(rag, 1):
            context_parts.append(f"\n病例{i}：")
            context_parts.append(f"- 诊断：{case.get('diagnosis', '')}")
            context_parts.append(f"- 治疗方案：{', '.join(case.get('treatment', []))}")
            context_parts.append(f"- 预后：{case.get('outcome', '')}")
            context_parts.append(f"- 恢复周期：{case.get('recovery_days', 0)}天")
    
    # 患者自述
    if user_desc:
        context_parts.append(f"\n【患者自述】\n{user_desc}")
    
    return "\n".join(context_parts)
