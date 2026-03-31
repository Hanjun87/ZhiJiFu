"""
状态定义
基于设计文档中的State定义
"""

from typing import TypedDict, List, Dict, Optional, Literal
from datetime import datetime


class DiagnosisState(TypedDict):
    """皮肤病诊断状态定义"""
    
    # ========== 输入层 ==========
    user_id: str
    input_type: Literal["image", "text", "both"]  # 用户上传类型
    raw_image: Optional[str]      # 原始图片数据（base64编码）
    user_description: Optional[str]  # 用户文字描述
    
    # ========== 第一层模型输出（Vision）==========
    vision_analysis: Optional[Dict]
    # {
    #   "symptoms": ["红色丘疹", "脓疱", "面部弥漫性红斑"],
    #   "distribution": "面颊部、额头，对称分布",
    #   "lesion_count_estimate": "约20个",
    #   "severity": "中度",
    #   "estimated_type": "痤疮（炎性）",
    #   "visual_confidence": 0.89,
    #   "reasoning": "可见密集红色丘疹，部分顶端有脓点...",
    #   "suggest_urgent": false
    # }
    
    # ========== RAG层 ==========
    rag_query: Optional[str]         # 自动生成的检索Query
    rag_results: Optional[List[Dict]] # 检索到的相似病例
    
    # ========== 第二层模型输出（LLM推理）==========
    llm_diagnosis: Optional[Dict]
    # {
    #   "diagnosis": "中度痤疮（炎症期）",
    #   "confidence": 0.85,
    #   "differential": ["玫瑰痤疮", "激素依赖性皮炎"],
    #   "treatment_plan": {
    #       "topical": ["外用阿达帕林"],
    #       "oral": ["口服多西环素"],
    #       "procedures": []
    #   },
    #   "lifestyle": ["忌辛辣", "规律作息"],
    #   "follow_up": "2周后复查，如无效考虑调整方案",
    #   "red_flags": [],
    #   "referral_needed": false
    # }
    
    # ========== 输出层 ==========
    final_output: Optional[Dict]
    should_feedback: bool            # 是否优质案例，值得入库
