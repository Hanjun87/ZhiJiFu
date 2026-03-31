"""
测试阿里云百炼平台调用
"""

import sys
import os

# 添加当前目录到路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from openai import OpenAI


def test_bailian_connection():
    """测试百炼平台连接"""
    
    print("=" * 60)
    print("测试阿里云百炼平台连接")
    print("=" * 60)
    
    # 读取配置
    api_key = os.getenv("BAILIAN_API_KEY", "sk-61be8ee9942249cfb284735c015d124f")
    base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    model = os.getenv("BAILIAN_MODEL", "qwen-plus")
    
    print(f"\nAPI Key: {api_key[:10]}...{api_key[-4:]}")
    print(f"Base URL: {base_url}")
    print(f"Model: {model}")
    
    try:
        # 初始化客户端
        client = OpenAI(
            api_key=api_key,
            base_url=base_url
        )
        
        # 测试调用
        print("\n正在调用百炼平台...")
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "你是皮肤病专家"},
                {"role": "user", "content": "请简单介绍一下痤疮的治疗方法"}
            ],
            temperature=0.1,
            max_tokens=500
        )
        
        print("\n✅ 调用成功！")
        print(f"模型: {response.model}")
        print(f"回复内容:\n{response.choices[0].message.content}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ 调用失败: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_diagnosis_with_bailian():
    """测试使用百炼平台进行诊断"""
    
    print("\n" + "=" * 60)
    print("测试诊断推理（使用百炼平台）")
    print("=" * 60)
    
    from core.graph import build_workflow
    from core.state import DiagnosisState
    
    # 构建工作流
    workflow = build_workflow()
    
    # 准备输入状态
    state: DiagnosisState = {
        "user_id": "user_bailian_test",
        "input_type": "both",
        "raw_image": "mock_image",
        "user_description": "脸上长了很多红色的痘痘，有白色脓头，主要在额头和鼻子",
        "vision_analysis": None,
        "rag_query": None,
        "rag_results": None,
        "llm_diagnosis": None,
        "final_output": None,
        "should_feedback": False
    }
    
    try:
        print("\n正在执行工作流（将调用百炼平台）...")
        config = {"configurable": {"thread_id": "bailian_test"}}
        result = workflow.invoke(state, config=config)
        
        print("\n【工作流执行完成】\n")
        
        # 打印视觉分析结果
        vision = result.get("vision_analysis", {})
        if vision:
            print("【视觉分析结果】（模拟）")
            print(f"  初步诊断：{vision.get('estimated_type')}")
            print()
        
        # 打印LLM诊断结果
        llm_diag = result.get("llm_diagnosis", {})
        if llm_diag:
            print("【LLM诊断结果】（百炼平台）")
            print(f"  诊断：{llm_diag.get('diagnosis')}")
            print(f"  置信度：{llm_diag.get('confidence')}")
            print(f"  鉴别诊断：{', '.join(llm_diag.get('differential', []))}")
            
            # 打印治疗方案
            treatment = llm_diag.get('treatment_plan', {})
            if treatment:
                print("  治疗方案：")
                topical = treatment.get('topical', [])
                if topical:
                    print(f"    外用：{', '.join(topical)}")
                oral = treatment.get('oral', [])
                if oral:
                    print(f"    口服：{', '.join(oral)}")
            
            print(f"  复查建议：{llm_diag.get('follow_up')}")
            print()
        
        # 打印最终报告
        final = result.get("final_output", {})
        if final:
            print("【最终报告】")
            print(f"  诊断：{final.get('diagnosis')}")
            print(f"  置信度：{final.get('confidence')}")
            print(f"  是否入库：{result.get('should_feedback')}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("阿里云百炼平台测试")
    print("=" * 60 + "\n")
    
    # 测试1：基础连接
    if test_bailian_connection():
        print("\n✅ 基础连接测试通过")
    else:
        print("\n⚠️ 基础连接测试失败，跳过诊断测试")
        sys.exit(1)
    
    # 测试2：诊断推理
    print("\n" + "-" * 60)
    user_input = input("\n是否继续测试诊断推理？这将消耗API额度 (y/n): ")
    if user_input.lower() == 'y':
        if test_diagnosis_with_bailian():
            print("\n✅ 诊断推理测试通过")
        else:
            print("\n⚠️ 诊断推理测试失败")
    else:
        print("\n已跳过诊断推理测试")
    
    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)
