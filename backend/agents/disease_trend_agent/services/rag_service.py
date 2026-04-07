"""
RAG服务对接 - 接入Unified Medical RAG知识库
提供皮肤病和伤口护理的专业医学知识检索
"""

import os
from typing import Dict, Any, List, Optional
from pathlib import Path

from ..config.settings import settings
from .unified_rag_loader import get_rag_loader, query_disease_knowledge, search_medical_knowledge


class RAGService:
    """RAG服务 - 基于Unified Medical RAG知识库"""
    
    _instance = None
    
    def __new__(cls):
        """单例模式确保服务只初始化一次"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
            
        self.top_k = settings.RAG_TOP_K or 3
        self.service_url = settings.RAG_SERVICE_URL
        
        # 初始化RAG加载器
        try:
            self.rag_loader = get_rag_loader()
            self.rag_available = self.rag_loader.load_all()
        except Exception as e:
            print(f"[WARN] RAG loader init failed: {e}")
            self.rag_available = False
        
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
        
        if not self.rag_available:
            return self._get_fallback_result(query_text or disease_type)
        
        # 首先尝试精确匹配疾病名称
        disease_info = None
        if disease_type:
            disease_info = self.rag_loader.get_disease_by_name(disease_type)
        
        # 如果精确匹配失败，使用关键词搜索
        search_results = []
        if not disease_info and query_text:
            search_results = self.rag_loader.search_diseases(query_text, knowledge_type)
        
        # 构建查询结果
        rag_response = self._build_response(disease_info, search_results, disease_type)
        
        # 根据查询类型格式化结果
        if query_type == "case_comparison":
            return self._format_case_comparison_result(rag_response, disease_type)
        elif query_type == "disease_knowledge":
            return self._format_disease_knowledge_result(rag_response, disease_type)
        elif query_type == "care_advice":
            return self._format_care_advice_result(rag_response, disease_type)
        else:
            return self._format_default_result(rag_response)
    
    def query_disease_knowledge(self, disease_name: str, knowledge_type: Optional[str] = None) -> Dict[str, Any]:
        """
        查询特定疾病的医学知识
        
        Args:
            disease_name: 疾病名称
            knowledge_type: 知识类型 (dermatology / wound)
            
        Returns:
            疾病知识字典
        """
        if not self.rag_available:
            return self._get_fallback_result(disease_name)
        
        disease_info = self.rag_loader.get_disease_by_name(disease_name)
        
        if disease_info:
            return {
                "success": True,
                "disease_name": disease_name,
                "knowledge_type": disease_info.get('_knowledge_type', ''),
                "data": disease_info,
                "formatted_text": self.rag_loader.format_disease_for_rag(disease_info),
                "source": "unified_medical_rag"
            }
        
        # 尝试搜索
        search_results = self.rag_loader.search_diseases(disease_name, knowledge_type)
        if search_results:
            return {
                "success": True,
                "disease_name": disease_name,
                "knowledge_type": knowledge_type or "unknown",
                "data": search_results[0],
                "search_results": search_results[:3],
                "formatted_text": self.rag_loader.format_disease_for_rag(search_results[0]),
                "source": "unified_medical_rag"
            }
        
        return self._get_fallback_result(disease_name)
    
    def query_trend_analysis_knowledge(self, disease_name: str, trend_pattern: str) -> Dict[str, Any]:
        """
        查询趋势分析相关的医学知识
        
        Args:
            disease_name: 疾病名称
            trend_pattern: 趋势模式 (如"恶化", "好转", "反复"等)
            
        Returns:
            趋势分析相关知识
        """
        if not self.rag_available:
            return self._get_fallback_result(f"{disease_name} {trend_pattern}")
        
        # 获取疾病信息
        disease_info = self.rag_loader.get_disease_by_name(disease_name)
        
        if not disease_info:
            return self._get_fallback_result(f"{disease_name} {trend_pattern}")
        
        # 构建趋势分析响应
        formatted_text = self.rag_loader.format_disease_for_rag(disease_info)
        
        # 根据趋势模式添加建议
        trend_suggestions = self._generate_trend_suggestions(disease_info, trend_pattern)
        
        return {
            "success": True,
            "disease_name": disease_name,
            "trend_pattern": trend_pattern,
            "data": disease_info,
            "formatted_text": formatted_text,
            "trend_suggestions": trend_suggestions,
            "source": "unified_medical_rag"
        }
    
    def _build_response(self, disease_info: Optional[Dict], search_results: List[Dict], disease_type: str) -> Dict[str, Any]:
        """构建RAG响应"""
        if disease_info:
            return {
                "success": True,
                "primary_result": disease_info,
                "formatted_text": self.rag_loader.format_disease_for_rag(disease_info),
                "source": "unified_medical_rag"
            }
        elif search_results:
            return {
                "success": True,
                "primary_result": search_results[0],
                "search_results": search_results[:3],
                "formatted_text": self.rag_loader.format_disease_for_rag(search_results[0]),
                "source": "unified_medical_rag"
            }
        else:
            return self._get_fallback_result(disease_type)
    
    def _generate_trend_suggestions(self, disease_info: Dict[str, Any], trend_pattern: str) -> List[str]:
        """根据趋势模式生成建议"""
        suggestions = []
        
        severity = disease_info.get('severity', '')
        precautions = disease_info.get('precautions', [])
        treatment = disease_info.get('treatment', [])
        
        if trend_pattern == "恶化":
            suggestions.append("病情出现恶化趋势，建议及时就医复查")
            if severity in ['severe', 'critical', '严重', '危重']:
                suggestions.append("该疾病严重程度较高，恶化时需高度重视")
            if precautions:
                suggestions.append(f"注意事项: {precautions[0]}")
            if treatment:
                suggestions.append(f"建议治疗: {treatment[0]}")
                
        elif trend_pattern == "好转":
            suggestions.append("病情正在好转，请继续保持当前治疗和护理")
            if precautions:
                suggestions.append(f"继续保持: {precautions[0]}")
                
        elif trend_pattern == "反复":
            suggestions.append("病情出现反复，可能存在诱发因素")
            suggestions.append("建议排查可能的诱因，如饮食、环境、用药等")
            if precautions:
                suggestions.append(f"特别注意: {precautions[0]}")
                
        elif trend_pattern == "稳定":
            suggestions.append("病情保持稳定，继续当前治疗方案")
            suggestions.append("定期复查，监测病情变化")
        
        return suggestions
    
    def _format_case_comparison_result(self, rag_results: Dict[str, Any], disease_type: str) -> Dict[str, Any]:
        """格式化案例对比结果"""
        primary = rag_results.get("primary_result", {})
        formatted_text = rag_results.get("formatted_text", "")
        
        return {
            "similar_cases": [
                {
                    "case_id": "rag_knowledge_base",
                    "similarity_score": 0.9,
                    "disease_type": primary.get('disease_name', disease_type),
                    "medical_knowledge": formatted_text,
                    "source": "unified_medical_rag"
                }
            ],
            "prognosis_insights": self._extract_prognosis_insights(primary),
            "medical_knowledge": formatted_text,
            "rag_source": "unified_medical_rag",
            "precautions": primary.get('precautions', []),
            "daily_care": self._extract_care_tips(primary),
            "diet_suggestions": self._extract_diet_suggestions(primary),
            "lifestyle_tips": self._extract_lifestyle_tips(primary),
            "symptoms": primary.get('symptoms', []),
            "treatments": primary.get('treatment', [])
        }
    
    def _format_disease_knowledge_result(self, rag_results: Dict[str, Any], disease_type: str) -> Dict[str, Any]:
        """格式化疾病知识结果"""
        primary = rag_results.get("primary_result", {})
        formatted_text = rag_results.get("formatted_text", "")
        
        return {
            "disease_knowledge": formatted_text,
            "symptoms": primary.get('symptoms', []),
            "treatments": primary.get('treatment', []),
            "precautions": primary.get('precautions', []),
            "source": "unified_medical_rag",
            "data": primary
        }
    
    def _format_care_advice_result(self, rag_results: Dict[str, Any], disease_type: str) -> Dict[str, Any]:
        """格式化护理建议结果"""
        primary = rag_results.get("primary_result", {})
        
        return {
            "care_advice": self.rag_loader.format_disease_for_rag(primary) if primary else "",
            "daily_care": self._extract_care_tips(primary),
            "diet_suggestions": self._extract_diet_suggestions(primary),
            "lifestyle_tips": self._extract_lifestyle_tips(primary),
            "precautions": primary.get('precautions', []),
            "source": "unified_medical_rag"
        }
    
    def _format_default_result(self, rag_results: Dict[str, Any]) -> Dict[str, Any]:
        """格式化默认结果"""
        return {
            "rag_response": rag_results.get("formatted_text", ""),
            "source": rag_results.get("source", "unknown"),
            "success": rag_results.get("success", False),
            "data": rag_results.get("primary_result", {})
        }
    
    def _extract_prognosis_insights(self, disease_info: Dict[str, Any]) -> List[str]:
        """从疾病信息中提取预后洞察"""
        insights = []
        
        if not disease_info:
            return ["建议结合具体病情咨询专业医生"]
        
        severity = disease_info.get('severity', '')
        healing_time = disease_info.get('healing_time', '')
        overview = disease_info.get('overview', '')
        
        if healing_time:
            insights.append(f"预计愈合/恢复时间: {healing_time}")
        
        if severity in ['mild', '轻度']:
            insights.append("该疾病程度较轻，预后良好")
        elif severity in ['moderate', '中度']:
            insights.append("该疾病为中度，需要规范治疗")
        elif severity in ['severe', 'critical', '严重', '危重']:
            insights.append("该疾病程度较重，建议密切监测并及时就医")
        
        if '慢性' in overview or 'chronic' in overview.lower():
            insights.append("此为慢性疾病，需要长期管理")
        
        if not insights:
            insights.append("建议遵循标准治疗方案")
        
        return insights
    
    def _extract_care_tips(self, disease_info: Dict[str, Any]) -> List[str]:
        """提取护理建议"""
        if not disease_info:
            return []
        
        tips = []
        
        # 从注意事项中提取
        precautions = disease_info.get('precautions', [])
        tips.extend(precautions[:3])  # 最多取3条
        
        # 从治疗方法中提取护理相关建议
        treatments = disease_info.get('treatment', [])
        for treatment in treatments:
            if any(keyword in treatment for keyword in ['护理', '保湿', '清洁', '保护', '避免', '注意']):
                tips.append(treatment)
                if len(tips) >= 5:
                    break
        
        return tips[:5]
    
    def _extract_diet_suggestions(self, disease_info: Dict[str, Any]) -> List[str]:
        """提取饮食建议"""
        # 从注意事项中提取饮食相关建议
        suggestions = []
        precautions = disease_info.get('precautions', [])
        
        for precaution in precautions:
            if any(keyword in precaution for keyword in ['饮食', '食物', '吃', '辛辣', '油腻', '清淡']):
                suggestions.append(precaution)
        
        # 添加通用饮食建议
        if not suggestions:
            disease_name = disease_info.get('disease_name', '')
            if any(keyword in disease_name for keyword in ['痤疮', '痘痘', '皮炎', '湿疹']):
                suggestions.append("饮食清淡，避免辛辣刺激食物")
                suggestions.append("减少高糖、高脂食物摄入")
            elif any(keyword in disease_name for keyword in ['糖尿病', '伤口', '溃疡']):
                suggestions.append("控制血糖，均衡饮食")
                suggestions.append("增加蛋白质摄入，促进伤口愈合")
        
        return suggestions
    
    def _extract_lifestyle_tips(self, disease_info: Dict[str, Any]) -> List[str]:
        """提取生活方式建议"""
        tips = []
        precautions = disease_info.get('precautions', [])
        
        for precaution in precautions:
            if any(keyword in precaution for keyword in ['作息', '睡眠', '运动', '锻炼', '压力', '情绪']):
                tips.append(precaution)
        
        # 添加通用建议
        if not tips:
            tips.append("保持规律作息，充足睡眠")
            tips.append("避免过度劳累和精神压力")
        
        return tips
    
    def _get_fallback_result(self, query_text: str) -> Dict[str, Any]:
        """获取降级结果（当RAG不可用时）"""
        return {
            "success": False,
            "query": query_text,
            "response": "RAG服务暂时不可用，请稍后重试或咨询专业医生",
            "source": "fallback",
            "error": "Unified RAG not available"
        }
    
    def get_statistics(self) -> Dict[str, int]:
        """获取知识库统计信息"""
        if self.rag_available:
            return self.rag_loader.get_statistics()
        return {"dermatology_count": 0, "wound_count": 0, "total_count": 0, "category_count": 0}


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
