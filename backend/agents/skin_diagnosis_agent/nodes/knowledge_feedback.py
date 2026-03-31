"""
知识库反馈节点（可选副作用）
优质案例回写入知识库（异步，不阻塞主流程）
"""

import asyncio
from typing import Dict, Any
from datetime import datetime
import sys
import os

# 添加父目录到路径以支持绝对导入
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.state import DiagnosisState


def knowledge_feedback_node(state: DiagnosisState) -> Dict[str, Any]:
    """
    知识库反馈节点 - 优质案例回写入知识库
    
    此节点为副作用节点，不返回有效状态更新
    异步执行，不阻塞主流程
    
    Args:
        state: 当前状态
        
    Returns:
        空字典（副作用节点不修改状态）
    """
    
    # 检查是否需要入库
    if not state.get("should_feedback", False):
        return {}
    
    # 构造入库知识
    knowledge = {
        "case_type": "confirmed_diagnosis",
        "visual_analysis": state.get("vision_analysis"),
        "diagnosis": state.get("llm_diagnosis"),
        "user_id": state.get("user_id"),
        "timestamp": datetime.now().isoformat()
    }
    
    # 异步写入（不等待）
    # 实际部署时应调用RAG服务的写入接口
    try:
        # 启动异步任务写入知识库
        asyncio.create_task(async_write_to_knowledge_base(knowledge))
    except Exception as e:
        # 写入失败不影响主流程
        print(f"[Knowledge Feedback] Failed to write to knowledge base: {e}")
    
    return {}


async def async_write_to_knowledge_base(knowledge: Dict[str, Any]) -> bool:
    """
    异步写入知识库
    
    Args:
        knowledge: 要写入的知识数据
        
    Returns:
        是否写入成功
    """
    import os
    import aiohttp
    
    # 知识库服务配置
    kb_endpoint = os.getenv("KNOWLEDGE_BASE_ENDPOINT", "http://localhost:8001/feedback")
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(kb_endpoint, json=knowledge) as response:
                if response.status == 200:
                    print(f"[Knowledge Feedback] Successfully wrote case to knowledge base")
                    return True
                else:
                    print(f"[Knowledge Feedback] Failed to write case: {response.status}")
                    return False
    except Exception as e:
        print(f"[Knowledge Feedback] Error writing to knowledge base: {e}")
        return False


def sync_write_to_knowledge_base(knowledge: Dict[str, Any]) -> bool:
    """
    同步写入知识库（备用）
    
    当异步写入不可用时使用
    
    Args:
        knowledge: 要写入的知识数据
        
    Returns:
        是否写入成功
    """
    import os
    import requests
    
    # 知识库服务配置
    kb_endpoint = os.getenv("KNOWLEDGE_BASE_ENDPOINT", "http://localhost:8001/feedback")
    
    try:
        response = requests.post(kb_endpoint, json=knowledge, timeout=5)
        if response.status_code == 200:
            print(f"[Knowledge Feedback] Successfully wrote case to knowledge base")
            return True
        else:
            print(f"[Knowledge Feedback] Failed to write case: {response.status_code}")
            return False
    except Exception as e:
        print(f"[Knowledge Feedback] Error writing to knowledge base: {e}")
        return False


def mock_write_to_knowledge_base(knowledge: Dict[str, Any]) -> bool:
    """
    模拟写入知识库（用于测试）
    
    仅打印日志，不实际写入
    
    Args:
        knowledge: 要写入的知识数据
        
    Returns:
        始终返回True
    """
    print("[Knowledge Feedback] Mock write to knowledge base:")
    print(f"  - Case Type: {knowledge.get('case_type')}")
    print(f"  - User ID: {knowledge.get('user_id')}")
    print(f"  - Timestamp: {knowledge.get('timestamp')}")
    print(f"  - Visual Analysis: {knowledge.get('visual_analysis', {}).get('estimated_type')}")
    print(f"  - Diagnosis: {knowledge.get('diagnosis', {}).get('diagnosis')}")
    return True
