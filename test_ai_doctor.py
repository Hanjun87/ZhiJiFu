#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试 AI 医生流式 API
"""
import json
import requests

print("=" * 60)
print("测试 AI 医生流式 API")
print("=" * 60)

test_payload = {
    "userId": "user_001",
    "message": "你好",
    "diseaseContext": "皮肤日记标题：晒后修复记录",
    "chatHistory": []
}

url = "http://127.0.0.1:8788/api/ai-doctor-chat-stream"
headers = {"Content-Type": "application/json"}

print(f"\n请求 URL: {url}")
print(f"请求数据: {json.dumps(test_payload, ensure_ascii=False)}")
print("-" * 60)

try:
    response = requests.post(url, json=test_payload, headers=headers, stream=True, timeout=30)
    print(f"状态码: {response.status_code}")
    print(f"Content-Type: {response.headers.get('Content-Type', 'N/A')}")
    print("\n响应内容:")
    print("-" * 60)
    
    for line in response.iter_lines():
        if line:
            line_str = line.decode('utf-8')
            print(line_str)
            if line_str.startswith('data: '):
                try:
                    data = json.loads(line_str[6:])
                    if 'error' in data:
                        print(f"\n✗ 错误: {data['error']}")
                        break
                    if data.get('done'):
                        print("\n✓ 流式传输完成")
                        break
                except:
                    pass
                    
except Exception as e:
    print(f"\n✗ 请求失败: {e}")
    import traceback
    traceback.print_exc()
