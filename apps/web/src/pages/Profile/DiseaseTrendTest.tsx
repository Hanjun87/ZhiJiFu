import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Bot, TrendingUp, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { DiseaseTrendPayload, DiseaseTrendResult } from '../../modules/skin/api';

interface DiseaseTrendTestProps {
  apiBaseUrl: string;
  onBack: () => void;
}

const BACKEND_URL = 'http://127.0.0.1:8788';

export default function DiseaseTrendTest({ apiBaseUrl, onBack }: DiseaseTrendTestProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseaseTrendResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [daysOption, setDaysOption] = useState<number>(30);
  const [trendOption, setTrendOption] = useState<'improving' | 'worsening' | 'stable'>('improving');

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload: DiseaseTrendPayload = {
        userId: 'test_user_001',
        targetDisease: 'acne',
        timeWindowDays: daysOption,
        trend: trendOption,
        userProfile: {
          skin_type: 'oily',
          allergy_history: ['none'],
          medication_history: ['topical_retinoid']
        }
      };

      const response = await fetch(`${BACKEND_URL}/api/disease-trend-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败');
    } finally {
      setLoading(false);
    }
  };

  const verdictLabels: Record<string, { text: string; color: string; icon: React.ReactNode }> = {
    better: { text: '好转', color: 'text-emerald-600', icon: <CheckCircle size={20} /> },
    worse: { text: '恶化', color: 'text-red-600', icon: <AlertTriangle size={20} /> },
    stable: { text: '稳定', color: 'text-blue-600', icon: <Activity size={20} /> },
    insufficient: { text: '数据不足', color: 'text-gray-600', icon: <TrendingUp size={20} /> },
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl px-5 py-3 pt-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <h1 className="text-lg font-bold text-gray-900">疾病趋势Agent测试</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 p-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Bot size={24} className="text-purple-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">疾病趋势诊断Agent</h2>
                <p className="text-sm text-gray-500">基于30天数据分析病情趋势</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-2 block">数据天数</label>
              <div className="flex gap-2">
                {[2, 3, 7, 14, 30].map(d => (
                  <button
                    key={d}
                    onClick={() => setDaysOption(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      daysOption === d
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {d}天
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-2 block">趋势类型</label>
              <div className="flex gap-2">
                {(['improving', 'stable', 'worsening'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTrendOption(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      trendOption === t
                        ? t === 'improving' ? 'bg-emerald-500 text-white' :
                          t === 'worsening' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t === 'improving' ? '好转' : t === 'worsening' ? '恶化' : '稳定'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleTest}
              disabled={loading}
              className="w-full py-3 px-4 bg-purple-500 text-white rounded-xl font-semibold text-sm hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '分析中...' : '开始测试'}
            </button>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <p className="text-red-600 text-sm">错误: {error}</p>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {result.success && result.result ? (
              <>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">诊断结果</h3>
                  <div className="flex items-center gap-3 mb-4">
                    {verdictLabels[result.result.final_verdict]?.icon}
                    <span className={`text-2xl font-bold ${verdictLabels[result.result.final_verdict]?.color}`}>
                      {verdictLabels[result.result.final_verdict]?.text}
                    </span>
                  </div>

                  {result.result.recovery_progress && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">恢复进度</span>
                        <span className="text-emerald-600 font-medium">
                          {result.result.recovery_progress.recovery_percent}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.result.recovery_progress.recovery_percent}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                        />
                      </div>
                      {result.result.recovery_progress.estimated_days_to_full_recovery && (
                        <p className="text-xs text-gray-400">
                          预计还需 {result.result.recovery_progress.estimated_days_to_full_recovery} 天完全恢复
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {result.result.needs_doctor && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle size={18} />
                      <span className="font-medium text-sm">需要医生介入</span>
                    </div>
                  </div>
                )}

                {result.result.final_report && (
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-3">详细报告</h3>
                    <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg overflow-auto">
                      {JSON.stringify(result.result.final_report, null, 2)}
                    </pre>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm">请求失败: {result.message}</p>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
