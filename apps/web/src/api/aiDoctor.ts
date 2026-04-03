import { request } from './request';

const BACKEND_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8790').replace(/\/$/, '');

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  time: string;
}

export interface ChatWithAIDoctorRequest {
  userId: string;
  message: string;
  diseaseContext?: string;
  chatHistory?: ChatMessage[];
  userRecords?: any[];
}

export interface ChatWithAIDoctorResponse {
  success: boolean;
  response: string;
  timestamp: string;
}

/**
 * 与AI智能医生对话
 * @param params 对话请求参数
 * @returns AI回复
 */
export async function chatWithAIDoctor(
  params: ChatWithAIDoctorRequest
): Promise<ChatWithAIDoctorResponse> {
  return request<ChatWithAIDoctorResponse>(`${BACKEND_URL}/api/ai-doctor-chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
}

export type StreamingChunkHandler = (chunk: string) => void;
export type StreamingErrorHandler = (error: string) => void;
export type StreamingDoneHandler = () => void;

export interface StreamChatOptions {
  onChunk: StreamingChunkHandler;
  onError?: StreamingErrorHandler;
  onDone?: StreamingDoneHandler;
}

/**
 * 与AI智能医生流式对话
 * @param params 对话请求参数
 * @param options 回调选项
 */
export async function streamChatWithAIDoctor(
  params: ChatWithAIDoctorRequest,
  options: StreamChatOptions
): Promise<void> {
  const { onChunk, onError, onDone } = options;

  try {
    const response = await fetch(`${BACKEND_URL}/api/ai-doctor-chat-stream`, {
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
