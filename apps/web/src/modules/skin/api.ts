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
