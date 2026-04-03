import requests
import json

url = 'http://localhost:8790/api/disease-trend-analysis'
data = {
    'userId': 'test_user',
    'targetDisease': '湿疹',
    'timeWindowDays': 30,
    'trend': 'improving'
}

try:
    response = requests.post(url, json=data, timeout=30)
    print(f'Status: {response.status_code}')
    if response.status_code == 200:
        result = response.json()
        print(f'Success: {result.get("success")}')
        print(f'Verdict: {result.get("result", {}).get("final_verdict")}')
        print(f'Care advice count: {len(result.get("result", {}).get("care_advice", []))}')
    else:
        print(f'Error: {response.text[:500]}')
except Exception as e:
    print(f'Error: {e}')
