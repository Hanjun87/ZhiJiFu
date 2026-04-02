#!/usr/bin/env python3
"""
简单的测试服务器，用于测试疾病趋势诊断Agent
"""

import json
import sys
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
from datetime import datetime, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from agents.disease_trend_agent.utils.data_processor import DataProcessor
from agents.disease_trend_agent.utils.recovery_calculator import calculate_recovery_progress


def generate_mock_records(days=30, trend='improving'):
    """生成模拟数据，支持任意天数"""
    records = []
    base_date = datetime.now() - timedelta(days=days)
    
    # 根据数据天数生成不同的严重度模式
    if days == 1:
        severities = [2]
    elif days == 2:
        severities = [2, 1] if trend == 'improving' else [1, 2]
    elif days == 3:
        if trend == 'improving':
            severities = [2, 2, 1]
        elif trend == 'worsening':
            severities = [1, 2, 2]
        else:
            severities = [2, 2, 2]
    elif days <= 7:
        if trend == 'improving':
            severities = [3] * (days - 2) + [2, 1]
        elif trend == 'worsening':
            severities = [1] * (days - 2) + [2, 3]
        else:
            severities = [2] * days
    else:
        # 30天完整数据
        if trend == 'improving':
            severities = [max(1, 3 - int(i / 10)) for i in range(days)]
        elif trend == 'worsening':
            severities = [min(3, 1 + int(i / 10)) for i in range(days)]
        elif trend == 'stable':
            severities = [2] * days
        else:
            severities = [2 if i < 15 else (1 if i < 20 else 3) for i in range(days)]

    for i in range(days):
        record_date = base_date + timedelta(days=i)
        severity = severities[i] if i < len(severities) else severities[-1]

        if trend == 'improving':
            lesion_count = min(50, 10 + severity * 10)
            area_percent = min(30, 5 + severity * 6)
        elif trend == 'worsening':
            lesion_count = min(50, 5 + severity * 12)
            area_percent = min(30, 3 + severity * 8)
        else:
            lesion_count = 25
            area_percent = 15

        record = {
            'date': record_date.isoformat(),
            'analysis_result': {
                'disease': 'acne',
                'severity': severity,
                'lesion_count': lesion_count,
                'affected_area_percent': area_percent,
                'confidence': 0.85
            }
        }
        records.append(record)
    return records


def get_mock_agent_decision(trend, indicators):
    """生成模拟Agent决策"""
    severity_timeline = indicators.get('severity_timeline', [])
    anomalies = indicators.get('anomaly_points', [])

    if anomalies and any('跳变' in a for a in anomalies):
        return {
            'action': 'ALERT_DOCTOR',
            'reason': f'检测到严重度跳变异常: {anomalies}',
            'confidence': 0.92,
            'suggested_verdict': 'uncertain',
            'risk_level': 'high'
        }

    if len(severity_timeline) < 7:
        return {
            'action': 'REQUEST_DATA',
            'reason': '数据不足，无法准确判断趋势',
            'confidence': 0.6,
            'suggested_verdict': None,
            'risk_level': 'medium'
        }

    if trend == 'improving':
        return {
            'action': 'FINALIZE',
            'reason': '趋势明确显示持续好转，严重度从3级降至1级',
            'confidence': 0.88,
            'suggested_verdict': 'better',
            'risk_level': 'low'
        }
    elif trend == 'worsening':
        return {
            'action': 'ALERT_DOCTOR',
            'reason': '病情持续恶化，严重度跳升，需要医生干预',
            'confidence': 0.91,
            'suggested_verdict': 'worse',
            'risk_level': 'high'
        }
    elif trend == 'stable':
        return {
            'action': 'FINALIZE',
            'reason': '病情保持稳定，无明显变化',
            'confidence': 0.85,
            'suggested_verdict': 'stable',
            'risk_level': 'low'
        }
    else:
        return {
            'action': 'RAG_LOOKUP',
            'reason': '趋势波动较大，需要查询相似案例辅助判断',
            'confidence': 0.75,
            'suggested_verdict': None,
            'risk_level': 'medium'
        }


class AgentHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/disease-trend-analysis':
            self.handle_disease_trend()
        elif parsed_path.path == '/api/health':
            self.handle_health()
        else:
            self.send_error(404, 'Not Found')

    def do_GET(self):
        parsed_path = urlparse(self.path)
        if parsed_path.path == '/api/health':
            self.handle_health()
        else:
            self.send_error(404, 'Not Found')

    def handle_health(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({'ok': True, 'service': 'agent-test-server'}).encode())

    def handle_disease_trend(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        
        try:
            payload = json.loads(body.decode('utf-8'))
        except json.JSONDecodeError:
            self.send_error(400, 'Invalid JSON')
            return

        user_id = payload.get('userId', 'test_user')
        target_disease = payload.get('targetDisease', 'acne')
        time_window_days = payload.get('timeWindowDays', 30)
        trend = payload.get('trend', 'improving')

        try:
            print(f"\n[Agent] 开始分析: userId={user_id}, disease={target_disease}, days={time_window_days}, trend={trend}")

            mock_records = generate_mock_records(time_window_days, trend)
            
            processor = DataProcessor()
            indicators = {
                'severity_timeline': processor.extract_severity_timeline(mock_records),
                'lesion_count_trend': processor.calculate_lesion_count_trend(mock_records),
                'affected_area_change': processor.calculate_area_change(mock_records),
                'api_confidence_trend': processor.analyze_confidence_trend(mock_records),
                'disease_consistency': processor.check_disease_consistency(mock_records),
                'anomaly_points': processor.detect_anomalies(mock_records)
            }

            agent_decision = get_mock_agent_decision(trend, indicators)

            final_verdict = agent_decision.get('suggested_verdict', 'insufficient')

            recovery_progress = calculate_recovery_progress(
                records=mock_records,
                time_window_days=time_window_days
            )

            needs_doctor = agent_decision['action'] == 'ALERT_DOCTOR'
            alerts = []
            if needs_doctor:
                alerts.append(f"已触发医生告警: {agent_decision['reason']}")

            print(f"[Agent] 分析完成: verdict={final_verdict}, recovery={recovery_progress['recovery_percent']}%")

            response = {
                "success": True,
                "result": {
                    "final_verdict": final_verdict,
                    "recovery_progress": recovery_progress,
                    "final_report": {
                        "report_type": "disease_trend_30d",
                        "generated_at": datetime.now().isoformat(),
                        "executive_summary": {
                            "verdict": final_verdict,
                            "confidence": agent_decision.get('confidence', 0.0),
                            "risk_level": agent_decision.get('risk_level', 'low'),
                            "next_action": "继续当前护理，7天后复查" if final_verdict == 'better' else "请遵医嘱",
                            "recovery_progress": recovery_progress
                        },
                        "trend_analysis": {
                            "duration_days": time_window_days,
                            "photos_count": len(mock_records),
                            "severity_progression": indicators['severity_timeline']
                        }
                    },
                    "needs_doctor": needs_doctor,
                    "alerts": alerts
                }
            }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode())

        except Exception as e:
            import traceback
            traceback.print_exc()
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'message': str(e)}, ensure_ascii=False).encode())

    def log_message(self, format, *args):
        print(f"[HTTP] {args[0]}")


def main():
    port = 8788
    server = HTTPServer(('127.0.0.1', port), AgentHandler)
    print(f"\n{'='*60}")
    print(f"疾病趋势诊断Agent测试服务器 (模拟模式)")
    print(f"{'='*60}")
    print(f"服务地址: http://127.0.0.1:{port}")
    print(f"API端点:")
    print(f"  - GET  /api/health")
    print(f"  - POST /api/disease-trend-analysis")
    print(f"{'='*60}\n")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止")
        server.shutdown()


if __name__ == '__main__':
    main()
