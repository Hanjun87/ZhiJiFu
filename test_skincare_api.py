#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试皮肤保养Agent API
"""
import json
import requests

# 测试数据 - 晒后修复记录的皮肤指标
test_payload = {
    "userId": "user_001",
    "entryTitle": "晒后修复记录",
    "note": "最近晒太阳后皮肤有些泛红，色斑也加深了",
    "skinMetrics": [
        {"label": "色斑", "value": 45, "detail": "晒后色斑加重，需加强防晒"},
        {"label": "黑头", "value": 40, "detail": "毛孔略显粗大"},
        {"label": "眼袋", "value": 35, "detail": "眼部稍有浮肿"},
        {"label": "黑眼圈", "value": 40, "detail": "晒后色素沉淀"},
        {"label": "痘痘", "value": 20, "detail": "有轻微晒伤泛红"}
    ],
    "careItems": [],
    "entryDate": "2024年01月14日 18:15"
}

print("=" * 60)
print("测试皮肤保养Agent API")
print("=" * 60)
print(f"\n请求数据:")
print(json.dumps(test_payload, ensure_ascii=False, indent=2))

url = "http://127.0.0.1:8788/api/skincare-analysis"
headers = {"Content-Type": "application/json"}

print(f"\n发送请求到: {url}")
print("-" * 60)

try:
    response = requests.post(url, json=test_payload, headers=headers, timeout=60)
    print(f"状态码: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n✓ API调用成功!")
        print(f"\n响应结果:")
        print(json.dumps(data, ensure_ascii=False, indent=2))
        
        if data.get("success") and data.get("result"):
            result = data["result"]
            print("\n" + "=" * 60)
            print("分析结果摘要:")
            print("=" * 60)
            print(f"\n皮肤画像: {result.get('skin_profile', {})}")
            print(f"\nAI点评: {result.get('ai_verdict', 'unknown')}")
            print(f"点评原因: {result.get('ai_verdict_reason', '无')}")
            print(f"\n护理建议:")
            for idx, advice in enumerate(result.get('care_advice', []), 1):
                print(f"  {idx}. [{advice.get('category', 'general')}] {advice.get('title', '')}")
                print(f"     {advice.get('description', '')}")
    else:
        print(f"\n✗ 请求失败:")
        print(response.text)
        
except Exception as e:
    print(f"\n✗ 错误: {e}")
    import traceback
    traceback.print_exc()
