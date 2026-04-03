import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Bot,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Clock,
  Target,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Heart,
  Sun,
  Droplets,
  Utensils,
  Moon,
  Shield
} from 'lucide-react';
import { DiseaseTrendPayload, DiseaseTrendResult } from '../../modules/skin/api';

interface DiseaseTrendTestProps {
  apiBaseUrl: string;
  onBack: () => void;
}

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || '';

// 护理建议类别图标映射
const categoryIcons: Record<string, React.ReactNode> = {
  cleaning: <Droplets size={18} />,
  moisturizing: <Droplets size={18} />,
  sunscreen: <Sun size={18} />,
  diet: <Utensils size={18} />,
  lifestyle: <Moon size={18} />,
  trend_specific: <TrendingUp size={18} />,
  skin_type: <Shield size={18} />,
  progress_specific: <Target size={18} />
};

// 护理建议类别名称映射
const categoryNames: Record<string, string> = {
  cleaning: '清洁护理',
  moisturizing: '保湿护理',
  sunscreen: '防晒护理',
  diet: '饮食调理',
  lifestyle: '作息规律',
  trend_specific: '趋势护理',
  skin_type: '肤质护理',
  progress_specific: '阶段护理'
};

// 优先级样式映射
const priorityStyles: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: 'bg-red-100', text: 'text-red-600', label: '高优先级' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-600', label: '中优先级' },
  low: { bg: 'bg-green-100', text: 'text-green-600', label: '低优先级' }
};

export default function DiseaseTrendTest({ apiBaseUrl, onBack }: DiseaseTrendTestProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseaseTrendResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [daysOption, setDaysOption] = useState<number>(30);
  const [trendOption, setTrendOption] = useState<'improving' | 'worsening' | 'stable'>('improving');
  const [expandedAdvice, setExpandedAdvice] = useState<string[]>([]);
  const [showRecoveryDetails, setShowRecoveryDetails] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setExpandedAdvice([]);
    setShowRecoveryDetails(false);

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

  const toggleAdvice = (category: string) => {
    setExpandedAdvice(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const verdictLabels: Record<string, { text: string; color: string; icon: React.ReactNode; bg: string }> = {
    better: {
      text: '好转',
      color: 'text-emerald-600',
      icon: <CheckCircle size={24} />,
      bg: 'bg-emerald-50'
    },
    worse: {
      text: '恶化',
      color: 'text-red-600',
      icon: <AlertTriangle size={24} />,
      bg: 'bg-red-50'
    },
    stable: {
      text: '稳定',
      color: 'text-blue-600',
      icon: <Minus size={24} />,
      bg: 'bg-blue-50'
    },
    insufficient: {
      text: '数据不足',
      color: 'text-gray-600',
      icon: <TrendingUp size={24} />,
      bg: 'bg-gray-50'
    },
  };

  // 获取趋势图标
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingDown size={16} className="text-emerald-500" />;
      case 'worsening':
        return <TrendingUp size={16} className="text-red-500" />;
      case 'stable':
        return <Minus size={16} className="text-blue-500" />;
      default:
        return <Activity size={16} className="text-gray-500" />;
    }
  };

  // 获取趋势文本
  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'improving':
        return '正在改善';
      case 'worsening':
        return '正在恶化';
      case 'stable':
        return '保持稳定';
      default:
        return '趋势不明';
    }
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
              <div className="flex gap-2 flex-wrap">
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
              <div className="flex gap-2 flex-wrap">
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
                {/* 诊断结果卡片 */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">诊断结果</h3>
                  <div className={`flex items-center gap-3 p-4 rounded-xl ${verdictLabels[result.result.final_verdict]?.bg}`}>
                    <div className={verdictLabels[result.result.final_verdict]?.color}>
                      {verdictLabels[result.result.final_verdict]?.icon}
                    </div>
                    <span className={`text-xl font-bold ${verdictLabels[result.result.final_verdict]?.color}`}>
                      {verdictLabels[result.result.final_verdict]?.text}
                    </span>
                  </div>
                </div>

                {/* 恢复进度卡片 */}
                {result.result.recovery_progress && (
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900">恢复进度</h3>
                      <button
                        onClick={() => setShowRecoveryDetails(!showRecoveryDetails)}
                        className="text-xs text-blue-500 flex items-center gap-1"
                      >
                        {showRecoveryDetails ? '收起详情' : '查看详情'}
                        {showRecoveryDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>

                    {/* 主要进度条 */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">总体恢复进度</span>
                        <span className="text-emerald-600 font-bold">
                          {result.result.recovery_progress.recovery_percent}%
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.result.recovery_progress.recovery_percent}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        {getTrendIcon(result.result.recovery_progress.progress_changed)}
                        <span>{getTrendText(result.result.recovery_progress.progress_changed)}</span>
                      </div>
                    </div>

                    {/* 预计恢复时间 */}
                    {result.result.recovery_progress.estimated_days_to_full_recovery !== null && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl mb-4">
                        <Clock size={18} className="text-blue-500" />
                        <div>
                          <p className="text-sm text-blue-700 font-medium">
                            预计还需 {result.result.recovery_progress.estimated_days_to_full_recovery} 天完全恢复
                          </p>
                          <p className="text-xs text-blue-500">
                            开始时间: {new Date(result.result.recovery_progress.started_at).toLocaleDateString('zh-CN')}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 恢复详情 */}
                    <AnimatePresence>
                      {showRecoveryDetails && result.result.final_report?.executive_summary?.recovery_progress?.details && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 overflow-hidden"
                        >
                          <div className="h-px bg-gray-100 my-3" />

                          {/* 病灶恢复 */}
                          {result.result.final_report.executive_summary.recovery_progress.details.lesion_recovery && (
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">病灶恢复</span>
                                <span className="text-sm font-medium text-emerald-600">
                                  {result.result.final_report.executive_summary.recovery_progress.details.lesion_recovery.percent}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${result.result.final_report.executive_summary.recovery_progress.details.lesion_recovery.percent}%` }}
                                  transition={{ duration: 0.8, delay: 0.5 }}
                                  className="h-full bg-emerald-400 rounded-full"
                                />
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                变化: {result.result.final_report.executive_summary.recovery_progress.details.lesion_recovery.change}
                              </p>
                            </div>
                          )}

                          {/* 面积恢复 */}
                          {result.result.final_report.executive_summary.recovery_progress.details.area_recovery && (
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">面积恢复</span>
                                <span className="text-sm font-medium text-blue-600">
                                  {result.result.final_report.executive_summary.recovery_progress.details.area_recovery.percent}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${result.result.final_report.executive_summary.recovery_progress.details.area_recovery.percent}%` }}
                                  transition={{ duration: 0.8, delay: 0.6 }}
                                  className="h-full bg-blue-400 rounded-full"
                                />
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                变化: {result.result.final_report.executive_summary.recovery_progress.details.area_recovery.change}
                              </p>
                            </div>
                          )}

                          {/* 严重度恢复 */}
                          {result.result.final_report.executive_summary.recovery_progress.details.severity_recovery && (
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">严重度恢复</span>
                                <span className="text-sm font-medium text-purple-600">
                                  {result.result.final_report.executive_summary.recovery_progress.details.severity_recovery.percent}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${result.result.final_report.executive_summary.recovery_progress.details.severity_recovery.percent}%` }}
                                  transition={{ duration: 0.8, delay: 0.7 }}
                                  className="h-full bg-purple-400 rounded-full"
                                />
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                从等级 {result.result.final_report.executive_summary.recovery_progress.details.severity_recovery.from_level} 到等级 {result.result.final_report.executive_summary.recovery_progress.details.severity_recovery.to_level}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* 护理建议卡片 */}
                {result.result.final_report?.care_advice && result.result.final_report.care_advice.length > 0 && (
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Heart size={20} className="text-rose-500" />
                      <h3 className="font-bold text-gray-900">护理建议</h3>
                    </div>

                    <div className="space-y-3">
                      {result.result.final_report.care_advice.map((advice, index) => (
                        <motion.div
                          key={advice.category}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border border-gray-100 rounded-xl overflow-hidden"
                        >
                          <button
                            onClick={() => toggleAdvice(advice.category)}
                            className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-600 shadow-sm">
                                {categoryIcons[advice.category] || <Sparkles size={16} />}
                              </div>
                              <div className="text-left">
                                <p className="font-medium text-gray-900 text-sm">{advice.title}</p>
                                <p className="text-xs text-gray-500">{categoryNames[advice.category] || advice.category}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${priorityStyles[advice.priority]?.bg} ${priorityStyles[advice.priority]?.text}`}>
                                {priorityStyles[advice.priority]?.label}
                              </span>
                              {expandedAdvice.includes(advice.category) ? (
                                <ChevronUp size={18} className="text-gray-400" />
                              ) : (
                                <ChevronDown size={18} className="text-gray-400" />
                              )}
                            </div>
                          </button>

                          <AnimatePresence>
                            {expandedAdvice.includes(advice.category) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-4 bg-white">
                                  <p className="text-sm text-gray-600 mb-3">{advice.description}</p>

                                  {advice.frequency && (
                                    <div className="flex items-center gap-2 mb-3 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                                      <Clock size={14} />
                                      <span>建议频率: {advice.frequency}</span>
                                    </div>
                                  )}

                                  <ul className="space-y-2">
                                    {advice.tips.map((tip, tipIndex) => (
                                      <li key={tipIndex} className="flex items-start gap-2 text-sm text-gray-700">
                                        <Sparkles size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                                        <span>{tip}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 医生告警 */}
                {result.result.needs_doctor && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-amber-50 border border-amber-200 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle size={18} />
                      <span className="font-medium text-sm">需要医生介入</span>
                    </div>
                  </motion.div>
                )}

                {/* 告警信息 */}
                {result.result.alerts && result.result.alerts.length > 0 && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <h4 className="font-medium text-red-700 text-sm mb-2">告警信息</h4>
                    <ul className="space-y-1">
                      {result.result.alerts.map((alert, index) => (
                        <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                          <span>{alert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 详细报告（可折叠） */}
                {result.result.final_report && (
                  <div className="bg-gray-100 rounded-2xl p-5">
                    <h3 className="font-bold text-gray-700 mb-3 text-sm">原始报告数据</h3>
                    <pre className="text-xs text-gray-600 bg-white p-3 rounded-lg overflow-auto max-h-60">
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
