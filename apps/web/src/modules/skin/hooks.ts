import { useState } from 'react';
import { analyzeSkinRequest } from './api';
import { SkinAnalyzeResult } from './types';

export function useSkinAnalyze(apiBaseUrl: string) {
  const [loading, setLoading] = useState(false);

  const analyze = async (imageBase64: string): Promise<SkinAnalyzeResult> => {
    setLoading(true);
    try {
      return await analyzeSkinRequest(apiBaseUrl, { imageBase64 });
    } finally {
      setLoading(false);
    }
  };

  return { loading, analyze };
}
