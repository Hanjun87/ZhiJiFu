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

export interface CareAdviceItem {
  category: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  tips: string[];
  frequency?: string;
  products?: string[];
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
    final_report: {
      executive_summary?: {
        recovery_progress?: {
          details?: {
            lesion_recovery?: {
              percent: number;
              change: string;
            };
            area_recovery?: {
              percent: number;
              change: string;
            };
            severity_recovery?: {
              percent: number;
              from_level: number;
              to_level: number;
            };
          };
        };
      };
      care_advice?: CareAdviceItem[];
      [key: string]: any;
    };
    care_advice?: CareAdviceItem[];  // 后端直接返回的护理建议
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

// 疾病趋势AI医生流式对话
export interface TrendChatMessage {
  role: 'user' | 'ai';
  content: string;
  time: string;
}

export interface TrendChatRequest {
  userId: string;
  message: string;
  chatHistory?: TrendChatMessage[];
  trendResult?: DiseaseTrendResult['result'];
}

export type TrendStreamingChunkHandler = (chunk: string) => void;
export type TrendStreamingErrorHandler = (error: string) => void;
export type TrendStreamingDoneHandler = () => void;

export interface TrendStreamChatOptions {
  onChunk: TrendStreamingChunkHandler;
  onError?: TrendStreamingErrorHandler;
  onDone?: TrendStreamingDoneHandler;
}

/**
 * 疾病趋势AI医生流式对话
 * @param apiBaseUrl API基础URL
 * @param params 对话请求参数
 * @param options 回调选项
 */
export async function streamTrendChatWithAIDoctor(
  apiBaseUrl: string,
  params: TrendChatRequest,
  options: TrendStreamChatOptions
): Promise<void> {
  const { onChunk, onError, onDone } = options;
  const base = apiBaseUrl.replace(/\/$/, '');

  try {
    const response = await fetch(`${base}/api/disease-trend-chat-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onDone?.();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              onChunk(parsed.content);
            }
            if (parsed.done) {
              onDone?.();
              return;
            }
            if (parsed.error) {
              onError?.(parsed.error);
              return;
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  } catch (error) {
    onError?.(error instanceof Error ? error.message : '未知错误');
  }
}
