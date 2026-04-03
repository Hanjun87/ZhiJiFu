"""
RAG服务对接 - 接入Unified Medical RAG知识库
提供皮肤病和伤口护理的专业医学知识检索
"""

import os
import sys
from typing import Dict, Any, List, Optional
from pathlib import Path

# 添加Unified Medical RAG到Python路径
UNIFIED_RAG_PATH = Path("e:/workspace/SkinAI/skinAI/Unified_Medical_RAG_Project")
if str(UNIFIED_RAG_PATH) not in sys.path:
    sys.path.insert(0, str(UNIFIED_RAG_PATH))

# 导入Unified RAG构建器
try:
    from build_unified_rag import UnifiedRAGBuilder, query_unified_rag, query_dermatology, query_wound
    UNIFIED_RAG_AVAILABLE = True
except ImportError as e:
    UNIFIED_RAG_AVAILABLE = False
    print(f"Warning: 无法导入Unified RAG模块: {e}")

from ..config.settings import settings


class RAGService:
    """RAG服务 - 基于Unified Medical RAG知识库"""
    
    _instance = None
    _rag_builder = None
    
    def __new__(cls):
        """单例模式确保RAG构建器只初始化一次"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
            
        self.top_k = settings.RAG_TOP_K or 3
        self.service_url = settings.RAG_SERVICE_URL
        
        # 初始化Unified RAG构建器
        if UNIFIED_RAG_AVAILABLE and RAGService._rag_builder is None:
            try:
                RAGService._rag_builder = UnifiedRAGBuilder()
                # 尝试加载已有索引
                if os.path.exists(UNIFIED_RAG_PATH / "unified_chroma_db"):
                    RAGService._rag_builder._load_index()
                    print("✓ Unified Medical RAG索引加载成功")
                else:
                    print("⚠ Unified RAG索引不存在，需要运行build_unified_rag.py构建")
            except Exception as e:
                print(f"⚠ RAG构建器初始化失败: {e}")
                RAGService._rag_builder = None
        
        self._initialized = True
    
    def query_similar_cases(self, query: Dict[str, Any]) -> Dict[str, Any]:
        """
        查询相似案例和医学知识
        
        Args:
            query: 查询参数，包含:
                - query_type: 查询类型 (case_comparison / disease_knowledge / care_advice)
                - query_text: 查询文本
                - disease_type: 疾病类型
                - knowledge_type: 知识类型 (dermatology / wound)
                
        Returns:
            RAG检索结果，包含相似案例和医学知识
        """
        query_type = query.get("query_type", "disease_knowledge")
        query_text = query.get("query_text", "")
        disease_type = query.get("disease_type", "")
        knowledge_type = query.get("knowledge_type", "")
        top_k = query.get("top_k", self.top_k)
        
        # 构建医学查询文本
        medical_query = self._build_medical_query(query)
        
        # 使用Unified RAG进行查询
        rag_results = self._query_unified_rag(medical_query, knowledge_type, top_k)
        
        # 根据查询类型格式化结果
        if query_type == "case_comparison":
            return self._format_case_comparison_result(rag_results, disease_type)
        elif query_type == "disease_knowledge":
            return self._format_disease_knowledge_result(rag_results, disease_type)
        elif query_type == "care_advice":
            return self._format_care_advice_result(rag_results, disease_type)
        else:
            return self._format_default_result(rag_results)
    
    def query_disease_knowledge(self, disease_name: str, knowledge_type: Optional[str] = None) -> Dict[str, Any]:
        """
        查询特定疾病的医学知识
        
        Args:
            disease_name: 疾病名称
            knowledge_type: 知识类型 (dermatology / wound)
            
        Returns:
            疾病知识字典
        """
        query_text = f"{disease_name}的症状、治疗方法和护理建议"
        return self._query_unified_rag(query_text, knowledge_type, top_k=3)
    
    def query_trend_analysis_knowledge(self, disease_name: str, trend_pattern: str) -> Dict[str, Any]:
        """
        查询趋势分析相关的医学知识
        
        Args:
            disease_name: 疾病名称
            trend_pattern: 趋势模式 (如"恶化", "好转", "反复"等)
            
        Returns:
            趋势分析相关知识
        """
        query_text = f"{disease_name}病情{trend_pattern}的可能原因和处理方法"
        return self._query_unified_rag(query_text, knowledge_type="dermatology", top_k=3)
    
    def _build_medical_query(self, query: Dict[str, Any]) -> str:
        """构建医学查询文本"""
        query_text = query.get("query_text", "")
        disease_type = query.get("disease_type", "")
        
        # 提取趋势指标
        indicators = query.get("trend_indicators", {})
        severity_timeline = indicators.get("severity_timeline", [])
        anomaly_points = indicators.get("anomaly_points", [])
        
        # 构建结构化查询
        medical_query_parts = []
        
        if disease_type:
            medical_query_parts.append(f"疾病类型: {disease_type}")
        
        if query_text:
            medical_query_parts.append(query_text)
        
        if severity_timeline:
            severity_desc = self._describe_severity_trend(severity_timeline)
            medical_query_parts.append(f"病情趋势: {severity_desc}")
        
        if anomaly_points and anomaly_points != ["无"]:
            medical_query_parts.append(f"异常情况: {', '.join(anomaly_points)}")
        
        return "; ".join(medical_query_parts)
    
    def _describe_severity_trend(self, severity_timeline: List[int]) -> str:
        """描述严重度趋势"""
        if not severity_timeline or len(severity_timeline) < 2:
            return "数据不足"
        
        first = severity_timeline[0]
        last = severity_timeline[-1]
        min_val = min(severity_timeline)
        max_val = max(severity_timeline)
        
        if last < first:
            return f"好转(从{first}级降至{last}级)"
        elif last > first:
            return f"恶化(从{first}级升至{last}级)"
        elif max_val > first:
            return f"波动(曾恶化至{max_val}级)"
        elif min_val < first:
            return f"波动(曾好转至{min_val}级)"
        else:
            return "稳定"
    
    def _query_unified_rag(self, query_text: str, knowledge_type: Optional[str] = None, top_k: int = 3) -> Dict[str, Any]:
        """
        调用Unified RAG进行查询
        
        Args:
            query_text: 查询文本
            knowledge_type: 知识类型 (dermatology / wound)
            top_k: 返回结果数量
            
        Returns:
            RAG查询结果
        """
        if not UNIFIED_RAG_AVAILABLE or RAGService._rag_builder is None:
            return self._get_fallback_result(query_text)
        
        try:
            # 根据知识类型选择查询方式
            if knowledge_type == "dermatology":
                response = query_dermatology(query_text, top_k=top_k)
            elif knowledge_type == "wound":
                response = query_wound(query_text, top_k=top_k)
            else:
                response = query_unified_rag(query_text, top_k=top_k)
            
            return {
                "success": True,
                "query": query_text,
                "knowledge_type": knowledge_type or "unified",
                "response": response,
                "source": "unified_medical_rag"
            }
            
        except Exception as e:
            print(f"RAG查询失败: {e}")
            return self._get_fallback_result(query_text)
    
    def _format_case_comparison_result(self, rag_results: Dict[str, Any], disease_type: str) -> Dict[str, Any]:
        """格式化案例对比结果"""
        response = rag_results.get("response", "")
        
        return {
            "similar_cases": [
                {
                    "case_id": "rag_knowledge_base",
                    "similarity_score": 0.85,
                    "disease_type": disease_type,
                    "medical_knowledge": response,
                    "source": "unified_medical_rag"
                }
            ],
            "prognosis_insights": self._extract_prognosis_insights(response),
            "medical_knowledge": response,
            "rag_source": "unified_medical_rag",
            # 添加护理建议相关字段
            "precautions": self._extract_precautions(response),
            "daily_care": self._extract_daily_care(response),
            "diet_suggestions": self._extract_diet_suggestions(response),
            "lifestyle_tips": self._extract_lifestyle_tips(response),
            "symptoms": self._extract_symptoms(response),
            "treatments": self._extract_treatments(response)
        }
    
    def _format_disease_knowledge_result(self, rag_results: Dict[str, Any], disease_type: str) -> Dict[str, Any]:
        """格式化疾病知识结果"""
        response = rag_results.get("response", "")
        
        return {
            "disease_knowledge": response,
            "symptoms": self._extract_symptoms(response),
            "treatments": self._extract_treatments(response),
            "precautions": self._extract_precautions(response),
            "source": "unified_medical_rag"
        }
    
    def _format_care_advice_result(self, rag_results: Dict[str, Any], disease_type: str) -> Dict[str, Any]:
        """格式化护理建议结果"""
        response = rag_results.get("response", "")
        
        return {
            "care_advice": response,
            "daily_care": self._extract_daily_care(response),
            "diet_suggestions": self._extract_diet_suggestions(response),
            "lifestyle_tips": self._extract_lifestyle_tips(response),
            "source": "unified_medical_rag"
        }
    
    def _format_default_result(self, rag_results: Dict[str, Any]) -> Dict[str, Any]:
        """格式化默认结果"""
        return {
            "rag_response": rag_results.get("response", ""),
            "source": rag_results.get("source", "unknown"),
            "success": rag_results.get("success", False)
        }
    
    def _extract_prognosis_insights(self, response: str) -> List[str]:
        """从RAG响应中提取预后洞察"""
        insights = []
        
        # 简单的文本提取逻辑
        if "愈合" in response or "恢复" in response:
            insights.append("根据医学知识库，此类病情有明确的恢复路径")
        if "治疗" in response:
            insights.append("建议遵循标准治疗方案")
        if "注意" in response or "预防" in response:
            insights.append("注意相关护理要点可降低复发风险")
        
        if not insights:
            insights.append("建议结合具体病情咨询专业医生")
        
        return insights
    
    def _extract_symptoms(self, response: str) -> List[str]:
        """提取症状信息"""
        symptoms = []
        if "症状" in response:
            # 简单提取症状部分
            lines = response.split("\n")
            in_symptoms = False
            for line in lines:
                if "症状" in line and "##" in line:
                    in_symptoms = True
                    continue
                if in_symptoms:
                    if line.startswith("##") or line.startswith("#"):
                        break
                    if line.strip().startswith("-"):
                        symptoms.append(line.strip().lstrip("- ").strip())
        return symptoms
    
    def _extract_treatments(self, response: str) -> List[str]:
        """提取治疗方法"""
        treatments = []
        if "治疗" in response:
            lines = response.split("\n")
            in_treatment = False
            for line in lines:
                if "治疗" in line and "##" in line:
                    in_treatment = True
                    continue
                if in_treatment:
                    if line.startswith("##") or line.startswith("#"):
                        break
                    if line.strip().startswith("-"):
                        treatments.append(line.strip().lstrip("- ").strip())
        return treatments
    
    def _extract_precautions(self, response: str) -> List[str]:
        """提取注意事项"""
        precautions = []
        if "注意" in response or "预防" in response:
            lines = response.split("\n")
            in_precautions = False
            for line in lines:
                if ("注意" in line or "预防" in line) and "##" in line:
                    in_precautions = True
                    continue
                if in_precautions:
                    if line.startswith("##") or line.startswith("#"):
                        break
                    if line.strip().startswith("-"):
                        precautions.append(line.strip().lstrip("- ").strip())
        return precautions
    
    def _extract_daily_care(self, response: str) -> List[str]:
        """提取日常护理建议"""
        care_tips = []
        # 提取列表项作为护理建议
        for line in response.split("\n"):
            if line.strip().startswith("-"):
                care_tips.append(line.strip().lstrip("- ").strip())
        return care_tips[:5]  # 最多返回5条
    
    def _extract_diet_suggestions(self, response: str) -> List[str]:
        """提取饮食建议"""
        diet_tips = []
        if "饮食" in response:
            lines = response.split("\n")
            in_diet = False
            for line in lines:
                if "饮食" in line:
                    in_diet = True
                if in_diet and line.strip().startswith("-"):
                    diet_tips.append(line.strip().lstrip("- ").strip())
        return diet_tips
    
    def _extract_lifestyle_tips(self, response: str) -> List[str]:
        """提取生活方式建议"""
        lifestyle_tips = []
        keywords = ["作息", "睡眠", "运动", "生活习惯"]
        for keyword in keywords:
            if keyword in response:
                lifestyle_tips.append(f"注意{keyword}规律")
        return lifestyle_tips
    
    def _get_fallback_result(self, query_text: str) -> Dict[str, Any]:
        """获取降级结果（当RAG不可用时）"""
        return {
            "success": False,
            "query": query_text,
            "response": "RAG服务暂时不可用，请稍后重试或咨询专业医生",
            "source": "fallback",
            "error": "Unified RAG not available"
        }


# 全局实例
rag_service = RAGService()


def query_similar_cases(query: Dict[str, Any]) -> Dict[str, Any]:
    """查询相似案例的便捷函数"""
    return rag_service.query_similar_cases(query)


def query_disease_knowledge(disease_name: str, knowledge_type: Optional[str] = None) -> Dict[str, Any]:
    """查询疾病知识的便捷函数"""
    return rag_service.query_disease_knowledge(disease_name, knowledge_type)


def query_trend_analysis_knowledge(disease_name: str, trend_pattern: str) -> Dict[str, Any]:
    """查询趋势分析知识的便捷函数"""
    return rag_service.query_trend_analysis_knowledge(disease_name, trend_pattern)
