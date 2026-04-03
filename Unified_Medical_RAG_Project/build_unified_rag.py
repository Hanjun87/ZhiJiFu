#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
统一医学知识库RAG构建脚本
整合皮肤病和伤口护理两大知识领域
基于权威医学指南的检索增强生成系统
"""

import json
import os
from typing import List, Dict, Any, Optional
from llama_index.core import Document, VectorStoreIndex, StorageContext, Settings
from llama_index.core.node_parser import SentenceSplitter
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
import chromadb

# 设置嵌入模型
Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-m3")

class UnifiedRAGBuilder:
    """统一医学知识库RAG构建器"""
    
    def __init__(self, 
                 dermatology_data_path: str = "dermatology_rag_data.json",
                 wound_data_path: str = "complete_wound_database.json"):
        """
        初始化统一RAG构建器
        
        Args:
            dermatology_data_path: 皮肤病数据JSON文件路径
            wound_data_path: 伤口护理数据JSON文件路径
        """
        self.dermatology_data_path = dermatology_data_path
        self.wound_data_path = wound_data_path
        self.documents: List[Document] = []
        self.index = None
        self.knowledge_stats = {
            "dermatology_count": 0,
            "wound_count": 0,
            "total_count": 0
        }
        
    def load_all_data(self) -> Dict[str, Any]:
        """
        加载所有医学数据
        
        Returns:
            合并后的数据字典
        """
        print("=" * 60)
        print("正在加载医学数据...")
        print("=" * 60)
        
        all_data = {
            "metadata": {
                "title": "统一医学知识库（皮肤病+伤口护理）",
                "version": "3.0",
                "created_date": "2026-04-02",
                "categories": ["皮肤病", "伤口护理"]
            },
            "diseases": []
        }
        
        # 1. 加载皮肤病数据
        if os.path.exists(self.dermatology_data_path):
            print(f"\n[1/2] 加载皮肤病数据: {self.dermatology_data_path}")
            with open(self.dermatology_data_path, 'r', encoding='utf-8') as f:
                derm_data = json.load(f)
            
            for disease in derm_data.get('diseases', []):
                disease['knowledge_type'] = 'dermatology'
                all_data['diseases'].append(disease)
            
            self.knowledge_stats['dermatology_count'] = len(derm_data.get('diseases', []))
            print(f"✓ 成功加载 {self.knowledge_stats['dermatology_count']} 种皮肤病")
        else:
            print(f"⚠ 未找到皮肤病数据文件: {self.dermatology_data_path}")
        
        # 2. 加载伤口护理数据
        if os.path.exists(self.wound_data_path):
            print(f"\n[2/2] 加载伤口护理数据: {self.wound_data_path}")
            with open(self.wound_data_path, 'r', encoding='utf-8') as f:
                wound_data = json.load(f)
            
            for wound in wound_data.get('wounds', []):
                wound['knowledge_type'] = 'wound'
                all_data['diseases'].append(wound)
            
            self.knowledge_stats['wound_count'] = len(wound_data.get('wounds', []))
            print(f"✓ 成功加载 {self.knowledge_stats['wound_count']} 种伤口类型")
        else:
            print(f"⚠ 未找到伤口护理数据文件: {self.wound_data_path}")
        
        self.knowledge_stats['total_count'] = len(all_data['diseases'])
        
        print("\n" + "=" * 60)
        print("数据加载完成！")
        print(f"  - 皮肤病: {self.knowledge_stats['dermatology_count']} 种")
        print(f"  - 伤口护理: {self.knowledge_stats['wound_count']} 种")
        print(f"  - 总计: {self.knowledge_stats['total_count']} 种")
        print("=" * 60)
        
        return all_data
    
    def create_documents(self, data: Dict[str, Any]) -> List[Document]:
        """
        将医学数据转换为LlamaIndex文档
        
        Args:
            data: 医学数据字典
            
        Returns:
            文档列表
        """
        print("\n正在创建文档...")
        documents = []
        
        for item in data['diseases']:
            # 根据知识类型选择内容构建方法
            if item.get('knowledge_type') == 'dermatology':
                content = self._build_dermatology_content(item)
            else:
                content = self._build_wound_content(item)
            
            # 创建元数据
            metadata = {
                "disease_name": item.get('disease_name', ''),
                "knowledge_type": item.get('knowledge_type', ''),
                "category": item.get('category', item.get('department', '')),
                "severity": item.get('severity', ''),
                "aliases": ', '.join(item.get('aliases', []))
            }
            
            # 创建文档
            doc = Document(
                text=content,
                metadata=metadata
            )
            documents.append(doc)
            
        print(f"✓ 成功创建 {len(documents)} 个文档")
        return documents
    
    def _build_dermatology_content(self, disease: Dict[str, Any]) -> str:
        """
        构建皮肤病文档内容
        
        Args:
            disease: 皮肤病数据字典
            
        Returns:
            格式化的文档内容
        """
        content_parts = []
        
        # 标题和概述
        content_parts.append(f"# {disease['disease_name']}")
        content_parts.append(f"\n## 知识类型\n皮肤病")
        content_parts.append(f"\n## 概述\n{disease.get('overview', '')}")
        
        # 别名
        if disease.get('aliases'):
            content_parts.append(f"\n## 别名\n{', '.join(disease['aliases'])}")
        
        # 症状
        if disease.get('symptoms'):
            content_parts.append(f"\n## 症状\n" + '\n'.join([f"- {s}" for s in disease['symptoms']]))
        
        # 病因
        if disease.get('causes'):
            content_parts.append(f"\n## 病因\n" + '\n'.join([f"- {c}" for c in disease['causes']]))
        
        # 治疗方法
        if disease.get('treatment'):
            content_parts.append(f"\n## 治疗方法\n" + '\n'.join([f"- {t}" for t in disease['treatment']]))
        
        # 注意事项
        if disease.get('precautions'):
            content_parts.append(f"\n## 注意事项\n" + '\n'.join([f"- {p}" for p in disease['precautions']]))
        
        # 严重程度
        if disease.get('severity'):
            content_parts.append(f"\n## 严重程度\n{disease['severity']}")
        
        # 就诊科室
        if disease.get('department'):
            content_parts.append(f"\n## 就诊科室\n{disease['department']}")
        
        # 常见人群
        if disease.get('common_population'):
            content_parts.append(f"\n## 常见人群\n" + '\n'.join([f"- {p}" for p in disease['common_population']]))
        
        # 相关疾病
        if disease.get('related_diseases'):
            content_parts.append(f"\n## 相关疾病\n" + '\n'.join([f"- {d}" for d in disease['related_diseases']]))
        
        return '\n'.join(content_parts)
    
    def _build_wound_content(self, wound: Dict[str, Any]) -> str:
        """
        构建伤口护理文档内容
        
        Args:
            wound: 伤口数据字典
            
        Returns:
            格式化的文档内容
        """
        content_parts = []
        
        # 标题和概述
        content_parts.append(f"# {wound['disease_name']}")
        content_parts.append(f"\n## 知识类型\n伤口护理")
        
        if wound.get('category'):
            content_parts.append(f"\n## 分类\n{wound['category']}")
        
        content_parts.append(f"\n## 概述\n{wound.get('overview', '')}")
        
        # 别名
        if wound.get('aliases'):
            content_parts.append(f"\n## 别名\n{', '.join(wound['aliases'])}")
        
        # 症状
        if wound.get('symptoms'):
            content_parts.append(f"\n## 症状\n" + '\n'.join([f"- {s}" for s in wound['symptoms']]))
        
        # 病因
        if wound.get('causes'):
            content_parts.append(f"\n## 病因\n" + '\n'.join([f"- {c}" for c in wound['causes']]))
        
        # 治疗方法
        if wound.get('treatment'):
            content_parts.append(f"\n## 治疗方法\n" + '\n'.join([f"- {t}" for t in wound['treatment']]))
        
        # 注意事项
        if wound.get('precautions'):
            content_parts.append(f"\n## 注意事项\n" + '\n'.join([f"- {p}" for p in wound['precautions']]))
        
        # 严重程度
        if wound.get('severity'):
            content_parts.append(f"\n## 严重程度\n{wound['severity']}")
        
        # 愈合时间
        if wound.get('healing_time'):
            content_parts.append(f"\n## 愈合时间\n{wound['healing_time']}")
        
        # 就诊科室
        if wound.get('department'):
            content_parts.append(f"\n## 就诊科室\n{wound['department']}")
        
        # 常见人群
        if wound.get('common_population'):
            content_parts.append(f"\n## 常见人群\n" + '\n'.join([f"- {p}" for p in wound['common_population']]))
        
        # 相关疾病
        if wound.get('related_diseases'):
            content_parts.append(f"\n## 相关疾病\n" + '\n'.join([f"- {d}" for d in wound['related_diseases']]))
        
        # 权威出处
        if wound.get('authority_source'):
            content_parts.append(f"\n## 权威出处\n{wound['authority_source']}")
        
        return '\n'.join(content_parts)
    
    def build_index(self, documents: List[Document], persist_dir: str = "unified_chroma_db"):
        """
        构建向量索引
        
        Args:
            documents: 文档列表
            persist_dir: 持久化目录
        """
        print(f"\n正在构建统一向量索引...")
        
        # 创建ChromaDB客户端
        chroma_client = chromadb.PersistentClient(path=persist_dir)
        
        # 创建或获取集合
        collection_name = "unified_medical_knowledge"
        try:
            chroma_client.delete_collection(collection_name)
            print(f"  已删除旧集合: {collection_name}")
        except:
            pass
            
        chroma_collection = chroma_client.create_collection(collection_name)
        print(f"  创建新集合: {collection_name}")
        
        # 创建向量存储
        vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
        
        # 创建存储上下文
        storage_context = StorageContext.from_defaults(vector_store=vector_store)
        
        # 创建节点解析器
        node_parser = SentenceSplitter(
            chunk_size=512,
            chunk_overlap=50
        )
        
        # 构建索引
        self.index = VectorStoreIndex.from_documents(
            documents,
            storage_context=storage_context,
            node_parser=node_parser
        )
        
        print(f"✓ 统一向量索引构建完成！")
        print(f"  数据已保存到: {persist_dir}")
        
    def build(self):
        """
        构建完整的统一RAG知识库
        """
        print("\n" + "=" * 60)
        print("开始构建统一医学知识库（皮肤病+伤口护理）")
        print("=" * 60)
        
        # 1. 加载数据
        data = self.load_all_data()
        
        # 2. 创建文档
        self.documents = self.create_documents(data)
        
        # 3. 构建索引
        self.build_index(self.documents)
        
        print("\n" + "=" * 60)
        print("统一医学知识库构建完成！")
        print("=" * 60)
        print(f"\n知识库统计：")
        print(f"  • 皮肤病: {self.knowledge_stats['dermatology_count']} 种")
        print(f"  • 伤口护理: {self.knowledge_stats['wound_count']} 种")
        print(f"  • 总计: {self.knowledge_stats['total_count']} 种")
        print("=" * 60)
        
    def query(self, query_text: str, top_k: int = 3) -> str:
        """
        查询统一RAG知识库
        
        Args:
            query_text: 查询文本
            top_k: 返回结果数量
            
        Returns:
            查询结果
        """
        if self.index is None:
            # 尝试加载已有索引
            self._load_index()
        
        # 创建查询引擎
        query_engine = self.index.as_query_engine(
            similarity_top_k=top_k,
            response_mode="compact"
        )
        
        # 执行查询
        response = query_engine.query(query_text)
        
        return str(response)
    
    def query_by_type(self, query_text: str, knowledge_type: Optional[str] = None, top_k: int = 3) -> str:
        """
        按知识类型查询
        
        Args:
            query_text: 查询文本
            knowledge_type: 知识类型 ('dermatology' 或 'wound')
            top_k: 返回结果数量
            
        Returns:
            查询结果
        """
        if self.index is None:
            self._load_index()
        
        # 创建查询引擎
        query_engine = self.index.as_query_engine(
            similarity_top_k=top_k,
            response_mode="compact"
        )
        
        # 如果有指定知识类型，添加过滤器
        if knowledge_type:
            query_text = f"[{knowledge_type}] {query_text}"
        
        # 执行查询
        response = query_engine.query(query_text)
        
        return str(response)
    
    def _load_index(self):
        """加载已有索引"""
        print("正在加载已有索引...")
        
        # 创建ChromaDB客户端
        chroma_client = chromadb.PersistentClient(path="unified_chroma_db")
        chroma_collection = chroma_client.get_collection("unified_medical_knowledge")
        
        # 创建向量存储
        vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
        
        # 创建存储上下文
        storage_context = StorageContext.from_defaults(vector_store=vector_store)
        
        # 加载索引
        self.index = VectorStoreIndex.from_vector_store(
            vector_store,
            storage_context=storage_context
        )
        
        print("✓ 索引加载完成！")


def query_unified_rag(query_text: str, top_k: int = 3) -> str:
    """
    查询统一医学知识库的便捷函数
    
    Args:
        query_text: 查询文本
        top_k: 返回结果数量
        
    Returns:
        查询结果
    """
    builder = UnifiedRAGBuilder()
    return builder.query(query_text, top_k)


def query_dermatology(query_text: str, top_k: int = 3) -> str:
    """
    查询皮肤病知识的便捷函数
    
    Args:
        query_text: 查询文本
        top_k: 返回结果数量
        
    Returns:
        查询结果
    """
    builder = UnifiedRAGBuilder()
    return builder.query_by_type(query_text, 'dermatology', top_k)


def query_wound(query_text: str, top_k: int = 3) -> str:
    """
    查询伤口护理知识的便捷函数
    
    Args:
        query_text: 查询文本
        top_k: 返回结果数量
        
    Returns:
        查询结果
    """
    builder = UnifiedRAGBuilder()
    return builder.query_by_type(query_text, 'wound', top_k)


if __name__ == "__main__":
    # 构建统一RAG知识库
    builder = UnifiedRAGBuilder()
    builder.build()
    
    # 测试查询
    print("\n" + "=" * 60)
    print("测试统一知识库查询")
    print("=" * 60)
    
    test_queries = [
        ("什么是湿疹？", "皮肤病"),
        ("压力性损伤的分期", "伤口护理"),
        ("糖尿病足溃疡Wagner分级", "伤口护理"),
        ("银屑病的治疗方法", "皮肤病"),
        ("浅Ⅱ度烧伤的症状和处理", "伤口护理"),
        ("痤疮的症状有哪些？", "皮肤病"),
        ("手术切口感染怎么办？", "伤口护理"),
        ("荨麻疹是什么原因引起的？", "皮肤病")
    ]
    
    for query, qtype in test_queries:
        print(f"\n【{qtype}】查询: {query}")
        print("-" * 60)
        result = builder.query(query)
        print(result)
        print("\n")