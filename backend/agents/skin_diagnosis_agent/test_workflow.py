"""
工作流测试脚本
使用模拟数据测试，不调用昂贵的视觉模型
"""

import sys
import os

# 添加当前目录到路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.graph import build_workflow
from core.state import DiagnosisState


def test_workflow_with_image():
    """测试图片输入的工作流"""
    
    print("=" * 60)
    print("测试场景：图片输入（使用模拟视觉分析）")
    print("=" * 60)
    
    # 构建工作流
    workflow = build_workflow()
    
    # 准备输入状态（模拟图片输入）
    state: DiagnosisState = {
        "user_id": "user_123",
        "input_type": "both",
        "raw_image": "base64_encoded_image_data_here",  # 模拟图片数据
        "user_description": "最近熬夜多，脸上突然长了很多红痘痘，有点疼",
        "vision_analysis": None,
        "rag_query": None,
        "rag_results": None,
        "llm_diagnosis": None,
        "final_output": None,
        "should_feedback": False
    }
    
    # 执行工作流（需要传入config包含thread_id）
    config = {"configurable": {"thread_id": "test_thread_1"}}
    result = workflow.invoke(state, config=config)
    
    # 打印结果
    print("\n【工作流执行完成】\n")
    
    # 打印视觉分析结果
    vision = result.get("vision_analysis", {})
    if vision:
        print("【视觉分析结果】")
        print(f"  初步诊断：{vision.get('estimated_type')}")
        print(f"  症状：{', '.join(vision.get('symptoms', []))}")
        print(f"  分布：{vision.get('distribution')}")
        print(f"  严重度：{vision.get('severity')}")
        print(f"  置信度：{vision.get('visual_confidence')}")
        print()
    
    # 打印RAG查询
    rag_query = result.get("rag_query")
    if rag_query:
        print(f"【RAG查询】{rag_query}")
        print()
    
    # 打印RAG结果
    rag_results = result.get("rag_results", [])
    if rag_results:
        print(f"【RAG检索结果】找到 {len(rag_results)} 个相似病例")
        for i, case in enumerate(rag_results, 1):
            print(f"  病例{i}：{case.get('diagnosis')}（相似度：{case.get('similarity_score')}%）")
        print()
    
    # 打印LLM诊断结果
    llm_diag = result.get("llm_diagnosis", {})
    if llm_diag:
        print("【LLM诊断结果】")
        print(f"  诊断：{llm_diag.get('diagnosis')}")
        print(f"  置信度：{llm_diag.get('confidence')}")
        print(f"  鉴别诊断：{', '.join(llm_diag.get('differential', []))}")
        print(f"  需要转诊：{llm_diag.get('referral_needed')}")
        print()
    
    # 打印最终报告
    final = result.get("final_output", {})
    if final:
        print("【最终报告】")
        print(f"  诊断：{final.get('diagnosis')}")
        print(f"  置信度：{final.get('confidence')}")
        print(f"  是否入库：{result.get('should_feedback')}")
        print(f"  免责声明：{final.get('disclaimer')}")
        print()
    
    return result


def test_workflow_with_text_only():
    """测试仅文字输入的工作流"""
    
    print("\n" + "=" * 60)
    print("测试场景：仅文字输入")
    print("=" * 60)
    
    workflow = build_workflow()
    
    state: DiagnosisState = {
        "user_id": "user_456",
        "input_type": "text",
        "raw_image": None,
        "user_description": "脸上有很多红色的痘痘，还有白色的脓头，主要分布在额头和鼻子周围",
        "vision_analysis": None,
        "rag_query": None,
        "rag_results": None,
        "llm_diagnosis": None,
        "final_output": None,
        "should_feedback": False
    }
    
    config = {"configurable": {"thread_id": "test_thread_2"}}
    result = workflow.invoke(state, config=config)
    
    print("\n【工作流执行完成】\n")
    
    vision = result.get("vision_analysis", {})
    if vision:
        print("【基于文字的视觉分析】")
        print(f"  初步诊断：{vision.get('estimated_type')}")
        print(f"  症状：{', '.join(vision.get('symptoms', []))}")
        print()
    
    final = result.get("final_output", {})
    if final:
        print("【最终报告】")
        print(f"  诊断：{final.get('diagnosis')}")
        print(f"  置信度：{final.get('confidence')}")
        print()
    
    return result


def test_workflow_multiple_times():
    """多次测试，验证模拟数据的多样性"""
    
    print("\n" + "=" * 60)
    print("测试场景：多次执行，验证模拟数据多样性")
    print("=" * 60)
    
    workflow = build_workflow()
    
    diagnoses = []
    for i in range(3):
        state: DiagnosisState = {
            "user_id": f"user_test_{i}",
            "input_type": "image",
            "raw_image": "mock_image_data",
            "user_description": "",
            "vision_analysis": None,
            "rag_query": None,
            "rag_results": None,
            "llm_diagnosis": None,
            "final_output": None,
            "should_feedback": False
        }
        
        config = {"configurable": {"thread_id": f"test_thread_{i+3}"}}
        result = workflow.invoke(state, config=config)
        diagnosis = result.get("final_output", {}).get("diagnosis", "")
        diagnoses.append(diagnosis)
        print(f"  第{i+1}次：{diagnosis}")
    
    print(f"\n诊断多样性：{len(set(diagnoses))} 种不同诊断")


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("皮肤病诊断Agent - 工作流测试")
    print("使用模拟数据，不调用昂贵的视觉模型")
    print("=" * 60 + "\n")
    
    try:
        # 测试图片输入
        result1 = test_workflow_with_image()
        
        # 测试文字输入
        result2 = test_workflow_with_text_only()
        
        # 测试多样性
        test_workflow_multiple_times()
        
        print("\n" + "=" * 60)
        print("所有测试通过！")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n测试失败：{e}")
        import traceback
        traceback.print_exc()
