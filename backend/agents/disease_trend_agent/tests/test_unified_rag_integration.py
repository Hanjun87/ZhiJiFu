"""
Unified Medical RAG 集成测试
测试疾病趋势诊断Agent与Unified RAG知识库的集成
"""

import sys
import os

# 添加项目路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))

from backend.agents.disease_trend_agent.services.unified_rag_loader import get_rag_loader
from backend.agents.disease_trend_agent.services.rag_service import rag_service, query_disease_knowledge, query_similar_cases
from backend.agents.disease_trend_agent.nodes.rag_retrieval import (
    rag_retrieval_node, 
    _determine_knowledge_type, 
    _analyze_trend_pattern,
    get_disease_knowledge_from_rag
)
from backend.agents.disease_trend_agent.utils.care_advisor import generate_care_advice


def test_rag_loader():
    """测试RAG数据加载器"""
    print("\n" + "="*60)
    print("测试1: RAG数据加载器")
    print("="*60)
    
    loader = get_rag_loader()
    stats = loader.get_statistics()
    
    print(f"✓ 数据加载成功!")
    print(f"  - 皮肤病数量: {stats['dermatology_count']}")
    print(f"  - 伤口护理数量: {stats['wound_count']}")
    print(f"  - 总计: {stats['total_count']}")
    print(f"  - 分类数: {stats['category_count']}")
    
    return True


def test_disease_query():
    """测试疾病查询"""
    print("\n" + "="*60)
    print("测试2: 疾病知识查询")
    print("="*60)
    
    # 测试皮肤病查询
    test_cases = [
        ("湿疹", "dermatology"),
        ("痤疮", "dermatology"),
        ("银屑病", "dermatology"),
        ("2期压力性损伤", "wound"),
        ("糖尿病足溃疡Wagner 1级", "wound"),
        ("浅Ⅱ度烧伤", "wound"),
    ]
    
    for disease_name, expected_type in test_cases:
        result = query_disease_knowledge(disease_name)
        
        if result.get("success"):
            knowledge_type = result.get("knowledge_type", "")
            print(f"✓ {disease_name}: 找到知识 (类型: {knowledge_type})")
            # 显示部分信息
            data = result.get("data", {})
            if data:
                overview = data.get("overview", "")[:50]
                print(f"    概述: {overview}...")
        else:
            print(f"✗ {disease_name}: 未找到")
    
    return True


def test_knowledge_type_detection():
    """测试知识类型检测"""
    print("\n" + "="*60)
    print("测试3: 知识类型自动检测")
    print("="*60)
    
    test_cases = [
        ("湿疹", "dermatology"),
        ("痤疮", "dermatology"),
        ("皮炎", "dermatology"),
        ("银屑病", "dermatology"),
        ("压力性损伤", "wound"),
        ("糖尿病足溃疡", "wound"),
        ("烧伤", "wound"),
        ("切口感染", "wound"),
        ("未知疾病", "dermatology"),  # 默认
    ]
    
    for disease_name, expected in test_cases:
        detected = _determine_knowledge_type(disease_name)
        status = "✓" if detected == expected else "✗"
        print(f"{status} {disease_name}: {detected} (期望: {expected})")
    
    return True


def test_trend_analysis():
    """测试趋势分析"""
    print("\n" + "="*60)
    print("测试4: 趋势模式分析")
    print("="*60)
    
    test_cases = [
        ([3, 3, 2, 2, 1], "好转"),  # 逐渐好转
        ([1, 2, 3, 3, 3], "恶化"),  # 逐渐恶化
        ([2, 3, 2, 1, 2], "反复"),  # 反复
        ([2, 2, 2, 2, 2], "稳定"),  # 稳定
        ([2, 3, 2, 2, 2], "波动"),  # 波动后稳定
    ]
    
    for timeline, expected in test_cases:
        pattern = _analyze_trend_pattern(timeline)
        status = "✓" if pattern == expected else "✗"
        print(f"{status} {timeline} -> {pattern} (期望: {expected})")
    
    return True


def test_rag_service():
    """测试RAG服务"""
    print("\n" + "="*60)
    print("测试5: RAG服务查询")
    print("="*60)
    
    # 测试相似案例查询
    query = {
        "query_type": "case_comparison",
        "query_text": "湿疹病情恶化的处理方法",
        "disease_type": "湿疹",
        "knowledge_type": "dermatology",
        "trend_indicators": {
            "severity_timeline": [2, 2, 3, 3, 3]
        }
    }
    
    result = query_similar_cases(query)
    
    if result.get("similar_cases"):
        print("✓ 相似案例查询成功")
        print(f"  - 案例数: {len(result.get('similar_cases', []))}")
        print(f"  - 医学知识长度: {len(result.get('medical_knowledge', ''))}")
        print(f"  - 注意事项数: {len(result.get('precautions', []))}")
    else:
        print("✗ 相似案例查询失败")
    
    # 测试趋势分析知识
    trend_result = rag_service.query_trend_analysis_knowledge("湿疹", "恶化")
    if trend_result.get("success"):
        print("✓ 趋势分析知识查询成功")
        suggestions = trend_result.get("trend_suggestions", [])
        print(f"  - 趋势建议数: {len(suggestions)}")
        for suggestion in suggestions[:3]:
            print(f"    • {suggestion}")
    else:
        print("✗ 趋势分析知识查询失败")
    
    return True


def test_care_advice_generation():
    """测试护理建议生成"""
    print("\n" + "="*60)
    print("测试6: 护理建议生成（含RAG数据）")
    print("="*60)
    
    # 模拟RAG上下文
    rag_context = {
        "medical_knowledge": "湿疹是一种慢性炎症性皮肤病...",
        "precautions": [
            "避免搔抓患处",
            "保持皮肤湿润",
            "避免接触过敏原",
            "注意饮食清淡",
            "避免过度清洁"
        ],
        "daily_care": [
            "使用温和的保湿剂",
            "穿宽松棉质衣物",
            "保持室内适宜湿度"
        ],
        "diet_suggestions": [
            "避免辛辣刺激食物",
            "减少海鲜摄入"
        ],
        "lifestyle_tips": [
            "保持规律作息",
            "避免精神紧张"
        ],
        "symptoms": ["红斑", "丘疹", "瘙痒"],
        "treatments": ["外用糖皮质激素", "保湿剂"]
    }
    
    recovery_progress = {
        "recovery_percent": 45,
        "progress_changed": "improving",
        "details": {
            "lesion_recovery": {"velocity": -0.5},
            "area_recovery": {"velocity": -0.3},
            "severity_recovery": {"velocity": -0.4}
        }
    }
    
    advice_list = generate_care_advice(
        verdict="better",
        recovery_progress=recovery_progress,
        user_profile={"skin_type": "sensitive"},
        trend_indicators={"severity_timeline": [3, 3, 2, 2, 1]},
        rag_context=rag_context,
        disease_name="湿疹"
    )
    
    print(f"✓ 生成护理建议 {len(advice_list)} 条")
    
    # 按类别分组显示
    categories = {}
    for advice in advice_list:
        cat = advice.get("category", "unknown")
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(advice)
    
    for cat, items in categories.items():
        print(f"\n  【{cat}】")
        for item in items:
            print(f"    - {item.get('title')} (优先级: {item.get('priority')})")
    
    return True


def test_rag_retrieval_node():
    """测试RAG检索节点"""
    print("\n" + "="*60)
    print("测试7: RAG检索节点集成")
    print("="*60)
    
    # 模拟状态
    state = {
        "user_id": "test_user_001",
        "target_disease": "湿疹",
        "trend_indicators": {
            "severity_timeline": [3, 3, 2, 2, 1],
            "anomaly_points": ["瘙痒加重"]
        },
        "rag_context": {}
    }
    
    # 执行RAG检索节点
    updated_state = rag_retrieval_node(state)
    
    rag_context = updated_state.get("rag_context", {})
    
    if rag_context:
        print("✓ RAG检索节点执行成功")
        print(f"  - 相似案例数: {len(rag_context.get('similar_cases', []))}")
        print(f"  - 医学知识长度: {len(rag_context.get('medical_knowledge', ''))}")
        print(f"  - 症状数: {len(rag_context.get('symptoms', []))}")
        print(f"  - 治疗方法数: {len(rag_context.get('treatments', []))}")
        
        # 检查趋势知识
        trend_knowledge = rag_context.get("trend_knowledge", {})
        if trend_knowledge:
            print(f"  - 趋势建议数: {len(trend_knowledge.get('trend_suggestions', []))}")
    else:
        print("✗ RAG检索节点执行失败")
    
    return True


def test_wound_care():
    """测试伤口护理知识"""
    print("\n" + "="*60)
    print("测试8: 伤口护理知识查询")
    print("="*60)
    
    test_cases = [
        "1期压力性损伤",
        "糖尿病足溃疡Wagner 2级",
        "浅Ⅱ度烧伤",
        "静脉性腿部溃疡",
    ]
    
    for wound_name in test_cases:
        result = get_disease_knowledge_from_rag(wound_name)
        
        if result.get("success"):
            data = result.get("data", {})
            print(f"✓ {wound_name}")
            print(f"    严重程度: {data.get('severity', 'N/A')}")
            print(f"    愈合时间: {data.get('healing_time', 'N/A')}")
            print(f"    科室: {data.get('department', 'N/A')}")
        else:
            print(f"✗ {wound_name}: 未找到")
    
    return True


def run_all_tests():
    """运行所有测试"""
    print("\n" + "="*60)
    print("Unified Medical RAG 集成测试")
    print("="*60)
    
    tests = [
        ("RAG数据加载器", test_rag_loader),
        ("疾病知识查询", test_disease_query),
        ("知识类型检测", test_knowledge_type_detection),
        ("趋势分析", test_trend_analysis),
        ("RAG服务", test_rag_service),
        ("护理建议生成", test_care_advice_generation),
        ("RAG检索节点", test_rag_retrieval_node),
        ("伤口护理知识", test_wound_care),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            success = test_func()
            results.append((name, success))
        except Exception as e:
            print(f"\n✗ {name} 测试失败: {e}")
            import traceback
            traceback.print_exc()
            results.append((name, False))
    
    # 打印测试总结
    print("\n" + "="*60)
    print("测试总结")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✓ 通过" if result else "✗ 失败"
        print(f"{status}: {name}")
    
    print(f"\n总计: {passed}/{total} 通过")
    print("="*60)
    
    return passed == total


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
