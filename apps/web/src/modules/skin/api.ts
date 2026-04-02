import { request } from '../../api';
import { SkinAnalyzePayload, SkinAnalyzeResult } from './types';

export async function analyzeSkinRequest(apiBaseUrl: string, payload: SkinAnalyzePayload): Promise<SkinAnalyzeResult> {
  const base = apiBaseUrl.replace(/\/$/, '');
  return request<SkinAnalyzeResult>(`${base}/api/analyze-skin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export interface DiseaseTrendPayload {
  userId: string;
  targetDisease?: string;
  timeWindowDays?: number;
  trend?: 'improving' | 'worsening' | 'stable';
  userProfile?: {
    skin_type?: string;
    allergy_history?: string[];
    medication_history?: string[];
  };
}

export interface DiseaseTrendResult {
  success: boolean;
  result?: {
    final_verdict: 'better' | 'worse' | 'stable' | 'insufficient';
    recovery_progress: {
      recovery_percent: number;
      estimated_days_to_full_recovery: number | null;
      started_at: string;
      progress_changed: 'improving' | 'stable' | 'concerning' | 'uncertain';
    };
    final_report: any;
    needs_doctor: boolean;
    alerts: string[];
  };
  message?: string;
}

export async function diseaseTrendAnalysisRequest(apiBaseUrl: string, payload: DiseaseTrendPayload): Promise<DiseaseTrendResult> {
  const base = apiBaseUrl.replace(/\/$/, '');
  return request<DiseaseTrendResult>(`${base}/api/disease-trend-analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
