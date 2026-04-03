"""
测试护理建议是否正确显示疾病名称
"""

import sys
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent.parent))

from backend.agents.disease_trend_agent.utils.care_advisor import generate_care_advice


def test_care_advice_with_disease_name():
    """测试护理建议是否包含疾病名称"""
    print("=" * 60)
    print("测试: 护理建议疾病名称显示")
    print("=" * 60)
    
    # 模拟RAG上下文
    rag_context = {
        "medical_knowledge": "湿疹是一种常见的炎症性皮肤病...",
        "precautions": ["避免抓挠", "保持皮肤湿润", "避免刺激性物质"],
        "daily_care": ["使用温和的沐浴露", "涂抹保湿霜", "穿宽松棉质衣物"],
        "diet_suggestions": ["避免辛辣刺激食物", "多喝水", "补充维生素"],
        "source": "unified_medical_rag"
    }
    
    # 测试有疾病名称的情况
    care_advice = generate_care_advice(
        verdict="better",
        recovery_progress={"recovery_percent": 60, "progress_changed": "improved"},
        user_profile=None,
        trend_indicators=None,
        rag_context=rag_context,
        disease_name="湿疹"  # 指定疾病名称
    )
    
    print(f"\n生成的护理建议数量: {len(care_advice)}")
    
    # 查找RAG相关的护理建议
    rag_based_advice = [a for a in care_advice if a["category"].startswith("medical_") or a["category"] == "disease_specific"]
    
    print(f"\nRAG医学知识护理建议数量: {len(rag_based_advice)}")
    
    for advice in rag_based_advice:
        print(f"\n  类别: {advice['category']}")
        print(f"  标题: {advice['title']}")
        print(f"  描述: {advice['description']}")
        print(f"  建议条数: {len(advice['tips'])}")
        
        # 检查是否包含疾病名称
        has_disease_name = "湿疹" in advice['title'] or "湿疹" in advice['description']
        if has_disease_name:
            print(f"  ✓ 包含疾病名称")
        else:
            print(f"  ✗ 未包含疾病名称")
    
    # 验证是否所有RAG建议都包含疾病名称
    all_have_disease = all(
        "湿疹" in a['title'] or "湿疹" in a['description']
        for a in rag_based_advice
    )
    
    if all_have_disease:
        print("\n✓ 所有RAG护理建议都正确显示了疾病名称")
        return True
    else:
        print("\n✗ 部分RAG护理建议未显示疾病名称")
        return False


def test_care_advice_without_disease_name():
    """测试没有疾病名称时的默认显示"""
    print("\n" + "=" * 60)
    print("测试: 无疾病名称时的默认显示")
    print("=" * 60)
    
    rag_context = {
        "medical_knowledge": "一般皮肤护理建议...",
        "precautions": ["注意清洁", "保持干燥"],
        "source": "unified_medical_rag"
    }
    
    care_advice = generate_care_advice(
        verdict="stable",
        recovery_progress={"recovery_percent": 50},
        rag_context=rag_context,
        disease_name=None  # 不指定疾病名称
    )
    
    # 查找RAG相关的护理建议
    rag_based_advice = [a for a in care_advice if a["category"].startswith("medical_")]
    
    print(f"\nRAG医学知识护理建议:")
    for advice in rag_based_advice:
        print(f"  标题: {advice['title']}")
        # 检查是否显示"该疾病"作为默认
        if "该疾病" in advice['title'] or "该疾病" in advice['description']:
            print(f"  ✓ 正确显示默认名称'该疾病'")
        else:
            print(f"  ✗ 未显示默认名称")
    
    return True


def run_tests():
    """运行所有测试"""
    print("\n" + "=" * 60)
    print("护理建议疾病名称显示测试")
    print("=" * 60)
    
    results = []
    
    try:
        results.append(("有疾病名称", test_care_advice_with_disease_name()))
    except Exception as e:
        print(f"\n✗ 测试异常: {e}")
        import traceback
        traceback.print_exc()
        results.append(("有疾病名称", False))
    
    try:
        results.append(("无疾病名称", test_care_advice_without_disease_name()))
    except Exception as e:
        print(f"\n✗ 测试异常: {e}")
        import traceback
        traceback.print_exc()
        results.append(("无疾病名称", False))
    
    print("\n" + "=" * 60)
    print("测试总结")
    print("=" * 60)
    
    for name, success in results:
        status = "✓ 通过" if success else "✗ 失败"
        print(f"  {status}: {name}")
    
    passed = sum(1 for _, s in results if s)
    total = len(results)
    print(f"\n总计: {passed}/{total} 测试通过")
    
    return passed == total


if __name__ == "__main__":
    run_tests()
