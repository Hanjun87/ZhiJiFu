"""
Unified Medical RAG 数据加载器
直接从JSON文件加载医学知识，无需构建向量索引
提供高效的疾病知识检索功能
"""

import json
import os
from typing import Dict, Any, List, Optional
from pathlib import Path


class UnifiedRAGLoader:
    """
    统一医学知识库加载器
    直接从JSON文件加载皮肤病和伤口护理知识
    """
    
    def __init__(self):
        self.dermatology_data: List[Dict[str, Any]] = []
        self.wound_data: List[Dict[str, Any]] = []
        self.disease_map: Dict[str, Dict[str, Any]] = {}
        self.category_map: Dict[str, List[Dict[str, Any]]] = {}
        
        # RAG数据文件路径 - 使用项目内路径
        _project_root = Path(__file__).resolve().parent.parent.parent.parent.parent
        self.rag_base_path = _project_root / "Unified_Medical_RAG_Project"
        self.dermatology_file = self.rag_base_path / "dermatology_rag_data.json"
        self.wound_file = self.rag_base_path / "complete_wound_database.json"
        
        self._loaded = False
    
    def load_all(self) -> bool:
        """
        加载所有医学知识数据
        
        Returns:
            是否加载成功
        """
        if self._loaded:
            return True
            
        try:
            self._load_dermatology_data()
            self._load_wound_data()
            self._build_indices()
            self._loaded = True
            print(f"[OK] Unified RAG data loaded: {len(self.dermatology_data)} diseases + {len(self.wound_data)} wounds")
            return True
        except Exception as e:
            print(f"[FAIL] Unified RAG data load failed: {e}")
            return False
    
    def _load_dermatology_data(self):
        """加载皮肤病数据"""
        if not self.dermatology_file.exists():
            print(f"[WARN] Dermatology data file not found: {self.dermatology_file}")
            return
            
        with open(self.dermatology_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # 处理数据格式 - 可能是列表或字典
        if isinstance(data, list):
            self.dermatology_data = data
        elif isinstance(data, dict) and 'diseases' in data:
            self.dermatology_data = data['diseases']
        else:
            self.dermatology_data = []
            
        # 添加知识类型标记
        for item in self.dermatology_data:
            item['_knowledge_type'] = 'dermatology'
            
    def _load_wound_data(self):
        """加载伤口护理数据"""
        if not self.wound_file.exists():
            print(f"[WARN] Wound data file not found: {self.wound_file}")
            return
            
        with open(self.wound_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # 处理数据格式
        if isinstance(data, dict) and 'wounds' in data:
            self.wound_data = data['wounds']
        elif isinstance(data, list):
            self.wound_data = data
        else:
            self.wound_data = []
            
        # 添加知识类型标记
        for item in self.wound_data:
            item['_knowledge_type'] = 'wound'
    
    def _build_indices(self):
        """构建索引以支持快速查找"""
        # 构建疾病名称索引
        all_diseases = self.dermatology_data + self.wound_data
        
        for disease in all_diseases:
            name = disease.get('disease_name', '')
            if name:
                self.disease_map[name.lower()] = disease
                
            # 同时索引别名
            aliases = disease.get('aliases', [])
            for alias in aliases:
                if isinstance(alias, str):
                    self.disease_map[alias.lower()] = disease
            
            # 构建分类索引
            category = disease.get('category', '其他')
            if category not in self.category_map:
                self.category_map[category] = []
            self.category_map[category].append(disease)
    
    def get_disease_by_name(self, disease_name: str) -> Optional[Dict[str, Any]]:
        """
        根据疾病名称获取疾病信息
        
        Args:
            disease_name: 疾病名称
            
        Returns:
            疾病信息字典，未找到返回None
        """
        self.load_all()
        
        if not disease_name:
            return None
            
        # 精确匹配
        disease_name_lower = disease_name.lower()
        if disease_name_lower in self.disease_map:
            return self.disease_map[disease_name_lower]
        
        # 模糊匹配 - 检查是否包含关键词
        for name, disease in self.disease_map.items():
            if disease_name_lower in name or name in disease_name_lower:
                return disease
                
        return None
    
    def search_diseases(self, keyword: str, knowledge_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        根据关键词搜索疾病
        
        Args:
            keyword: 搜索关键词
            knowledge_type: 知识类型过滤 ('dermatology' 或 'wound')
            
        Returns:
            匹配的疾病列表
        """
        self.load_all()
        
        if not keyword:
            return []
            
        keyword_lower = keyword.lower()
        results = []
        
        all_diseases = self.dermatology_data + self.wound_data
        
        for disease in all_diseases:
            # 知识类型过滤
            if knowledge_type:
                if disease.get('_knowledge_type') != knowledge_type:
                    continue
            
            # 搜索名称
            name = disease.get('disease_name', '').lower()
            if keyword_lower in name:
                results.append(disease)
                continue
                
            # 搜索别名
            aliases = disease.get('aliases', [])
            for alias in aliases:
                if isinstance(alias, str) and keyword_lower in alias.lower():
                    results.append(disease)
                    break
            else:
                # 搜索症状
                symptoms = disease.get('symptoms', [])
                for symptom in symptoms:
                    if isinstance(symptom, str) and keyword_lower in symptom.lower():
                        results.append(disease)
                        break
                        
        return results
    
    def get_diseases_by_category(self, category: str) -> List[Dict[str, Any]]:
        """
        根据分类获取疾病列表
        
        Args:
            category: 分类名称
            
        Returns:
            疾病列表
        """
        self.load_all()
        return self.category_map.get(category, [])
    
    def get_all_dermatology(self) -> List[Dict[str, Any]]:
        """获取所有皮肤病数据"""
        self.load_all()
        return self.dermatology_data
    
    def get_all_wounds(self) -> List[Dict[str, Any]]:
        """获取所有伤口护理数据"""
        self.load_all()
        return self.wound_data
    
    def format_disease_for_rag(self, disease: Dict[str, Any]) -> str:
        """
        将疾病数据格式化为RAG检索结果文本
        
        Args:
            disease: 疾病数据字典
            
        Returns:
            格式化的文本
        """
        if not disease:
            return ""
            
        content_parts = []
        
        # 标题
        content_parts.append(f"## {disease.get('disease_name', '')}")
        
        # 知识类型
        knowledge_type = disease.get('_knowledge_type', '')
        if knowledge_type == 'dermatology':
            content_parts.append("**知识类型**: 皮肤病")
        elif knowledge_type == 'wound':
            content_parts.append(f"**知识类型**: 伤口护理 - {disease.get('category', '')}")
        
        # 概述
        if disease.get('overview'):
            content_parts.append(f"\n**概述**: {disease['overview']}")
        
        # 症状
        if disease.get('symptoms'):
            content_parts.append("\n**症状**:")
            for symptom in disease['symptoms']:
                content_parts.append(f"- {symptom}")
        
        # 治疗方法
        if disease.get('treatment'):
            content_parts.append("\n**治疗方法**:")
            for treatment in disease['treatment']:
                content_parts.append(f"- {treatment}")
        
        # 注意事项
        if disease.get('precautions'):
            content_parts.append("\n**注意事项**:")
            for precaution in disease['precautions']:
                content_parts.append(f"- {precaution}")
        
        # 严重程度
        if disease.get('severity'):
            content_parts.append(f"\n**严重程度**: {disease['severity']}")
        
        # 愈合时间（伤口特有）
        if disease.get('healing_time'):
            content_parts.append(f"**愈合时间**: {disease['healing_time']}")
        
        # 就诊科室
        if disease.get('department'):
            content_parts.append(f"**就诊科室**: {disease['department']}")
        
        # 权威出处（伤口特有）
        if disease.get('authority_source'):
            content_parts.append(f"**权威出处**: {disease['authority_source']}")
        
        return "\n".join(content_parts)
    
    def get_statistics(self) -> Dict[str, int]:
        """获取知识库统计信息"""
        self.load_all()
        return {
            "dermatology_count": len(self.dermatology_data),
            "wound_count": len(self.wound_data),
            "total_count": len(self.dermatology_data) + len(self.wound_data),
            "category_count": len(self.category_map)
        }


# 全局单例实例
_rag_loader = None

def get_rag_loader() -> UnifiedRAGLoader:
    """获取RAG加载器单例"""
    global _rag_loader
    if _rag_loader is None:
        _rag_loader = UnifiedRAGLoader()
        _rag_loader.load_all()
    return _rag_loader


def query_disease_knowledge(disease_name: str) -> Optional[Dict[str, Any]]:
    """
    查询疾病知识
    
    Args:
        disease_name: 疾病名称
        
    Returns:
        疾病知识字典
    """
    loader = get_rag_loader()
    return loader.get_disease_by_name(disease_name)


def search_medical_knowledge(keyword: str, knowledge_type: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    搜索医学知识
    
    Args:
        keyword: 搜索关键词
        knowledge_type: 知识类型过滤
        
    Returns:
        匹配的医学知识列表
    """
    loader = get_rag_loader()
    return loader.search_diseases(keyword, knowledge_type)
