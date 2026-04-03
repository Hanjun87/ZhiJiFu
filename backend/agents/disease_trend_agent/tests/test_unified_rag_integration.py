"""
Unified Medical RAG集成测试
测试疾病趋势Agent与Unified RAG的集成
"""

import sys
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent.parent))  # 到skinAI根目录
sys.path.insert(0, "e:/workspace/SkinAI/skinAI/Unified_Medical_RAG_Project")

# 现在可以导入
try:
    from backend.agents.disease_trend_agent.services.rag_service import (
        RAGService, query_similar_cases, query_disease_knowledge
    )
    IMPORT_SUCCESS = True
except ImportError as e:
    print(f"导入失败: {e}")
    IMPORT_SUCCESS = False


def test_rag_service_initialization():
    """测试RAG服务初始化"""
    print("=" * 60)
    print("测试1: RAG服务初始化")
    print("=" * 60)
    
    try:
        service = RAGService()
        print(f"✓ RAG服务初始化成功")
        print(f"  - top_k: {service.top_k}")
        print(f"  - RAG构建器可用: {service._rag_builder is not None}")
        return True
    except Exception as e:
        print(f"✗ RAG服务初始化失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_disease_knowledge_query():
    """测试疾病知识查询"""
    print("\n" + "=" * 60)
    print("测试2: 疾病知识查询")
    print("=" * 60)
    
    try:
        # 查询湿疹知识
        result = query_disease_knowledge("湿疹", knowledge_type="dermatology")
        print(f"✓ 疾病知识查询成功")
        print(f"  - 来源: {result.get('source', 'unknown')}")
        print(f"  - 成功: {result.get('success', False)}")
        
        if result.get('success'):
            response = result.get('response', '')
            print(f"  - 响应长度: {len(response)} 字符")
            print(f"  - 响应预览: {response[:200]}...")
        
        return True
    except Exception as e:
        print(f"✗ 疾病知识查询失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_similar_cases_query():
    """测试相似案例查询"""
    print("\n" + "=" * 60)
    print("测试3: 相似案例查询")
    print("=" * 60)
    
    try:
        query = {
            "query_type": "case_comparison",
            "query_text": "痤疮病情恶化的处理方法",
            "disease_type": "痤疮",
            "knowledge_type": "dermatology",
            "trend_indicators": {
                "severity_timeline": [2, 2, 3, 3, 3],
                "anomaly_points": ["第3天病情加重"]
            },
            "top_k": 3
        }
        
        result = query_similar_cases(query)
        print(f"✓ 相似案例查询成功")
        print(f"  - 来源: {result.get('rag_source', 'unknown')}")
        print(f"  - 相似案例数: {len(result.get('similar_cases', []))}")
        print(f"  - 预后洞察: {result.get('prognosis_insights', [])}")
        
        if result.get('medical_knowledge'):
            print(f"  - 医学知识长度: {len(result['medical_knowledge'])} 字符")
        
        return True
    except Exception as e:
        print(f"✗ 相似案例查询失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_wound_knowledge_query():
    """测试伤口护理知识查询"""
    print("\n" + "=" * 60)
    print("测试4: 伤口护理知识查询")
    print("=" * 60)
    
    try:
        result = query_disease_knowledge("压力性损伤", knowledge_type="wound")
        print(f"✓ 伤口护理知识查询成功")
        print(f"  - 来源: {result.get('source', 'unknown')}")
        print(f"  - 成功: {result.get('success', False)}")
        
        if result.get('success'):
            response = result.get('response', '')
            print(f"  - 响应长度: {len(response)} 字符")
            print(f"  - 响应预览: {response[:200]}...")
        
        return True
    except Exception as e:
        print(f"✗ 伤口护理知识查询失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_rag_node_integration():
    """测试RAG节点集成"""
    print("\n" + "=" * 60)
    print("测试5: RAG节点集成")
    print("=" * 60)
    
    try:
        from backend.agents.disease_trend_agent.nodes.rag_retrieval import (
            _determine_knowledge_type
        )
        
        # 测试知识类型判断
        test_cases = [
            ("痤疮", "dermatology"),
            ("湿疹", "dermatology"),
            ("压力性损伤", "wound"),
            ("糖尿病足溃疡", "wound"),
            ("烧伤", "wound"),
            ("unknown", "dermatology"),  # 默认
        ]
        
        print("知识类型判断测试:")
        all_passed = True
        for disease, expected in test_cases:
            result = _determine_knowledge_type(disease)
            status = "✓" if result == expected else "✗"
            if result != expected:
                all_passed = False
            print(f"  {status} {disease} -> {result} (期望: {expected})")
        
        return all_passed
    except Exception as e:
        print(f"✗ RAG节点集成测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def run_all_tests():
    """运行所有测试"""
    print("\n" + "=" * 60)
    print("Unified Medical RAG 集成测试")
    print("=" * 60)
    
    if not IMPORT_SUCCESS:
        print("\n✗ 模块导入失败，无法运行测试")
        return False
    
    tests = [
        ("RAG服务初始化", test_rag_service_initialization),
        ("疾病知识查询", test_disease_knowledge_query),
        ("相似案例查询", test_similar_cases_query),
        ("伤口护理知识查询", test_wound_knowledge_query),
        ("RAG节点集成", test_rag_node_integration),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            success = test_func()
            results.append((name, success))
        except Exception as e:
            print(f"\n✗ 测试 '{name}' 异常: {e}")
            import traceback
            traceback.print_exc()
            results.append((name, False))
    
    # 打印测试总结
    print("\n" + "=" * 60)
    print("测试总结")
    print("=" * 60)
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for name, success in results:
        status = "✓ 通过" if success else "✗ 失败"
        print(f"  {status}: {name}")
    
    print(f"\n总计: {passed}/{total} 测试通过")
    
    if passed == total:
        print("\n🎉 所有测试通过！Unified RAG集成成功！")
    else:
        print(f"\n⚠️ {total - passed} 个测试失败，请检查配置")
    
    return passed == total


if __name__ == "__main__":
    run_all_tests()
