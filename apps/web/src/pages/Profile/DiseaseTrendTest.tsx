import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  Shield,
  Send,
  User,
  X,
  MessageCircle,
  Trash2
} from 'lucide-react';
import { DiseaseTrendPayload, DiseaseTrendResult, streamTrendChatWithAIDoctor, TrendChatMessage } from '../../modules/skin/api';

interface DiseaseTrendTestProps {
  apiBaseUrl: string;
  onBack: () => void;
}

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || '';

// localStorage key for chat history
const getChatStorageKey = (userId: string) => `disease_trend_chat_history_${userId}`;

// 获取初始AI消息
const getInitialAIChat = (): TrendChatMessage[] => [
  {
    role: 'ai',
    content: '您好！我是您的AI趋势诊断医生。我已经分析了您的疾病趋势数据，可以为您解答关于病情变化、恢复预期和护理建议的问题。请问有什么可以帮助您的？',
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
];

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

  // AI对话相关状态
  const [showAiChat, setShowAiChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<TrendChatMessage[]>(getInitialAIChat());
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const userId = 'test_user_001'; // 当前用户ID

  // 从 localStorage 加载聊天历史
  useEffect(() => {
    const chatStorageKey = getChatStorageKey(userId);
    const cachedChat = localStorage.getItem(chatStorageKey);
    if (cachedChat) {
      try {
        const parsed = JSON.parse(cachedChat);
        if (parsed.messages && parsed.messages.length > 0) {
          setChatMessages(parsed.messages);
        }
      } catch (e) {
        console.error('Failed to parse cached chat history', e);
        setChatMessages(getInitialAIChat());
      }
    }
  }, [userId]);

  // 保存聊天历史到 localStorage
  const saveChatHistory = (messages: TrendChatMessage[]) => {
    const chatStorageKey = getChatStorageKey(userId);
    localStorage.setItem(chatStorageKey, JSON.stringify({
      messages: messages,
      timestamp: Date.now()
    }));
  };

  // 更新聊天消息并保存到 localStorage
  const updateChatMessages = (newMessages: TrendChatMessage[] | ((prev: TrendChatMessage[]) => TrendChatMessage[])) => {
    setChatMessages(prev => {
      const updated = typeof newMessages === 'function' ? newMessages(prev) : newMessages;
      // 保存到 localStorage（排除加载中的空消息）
      const messagesToSave = updated.filter(m => m.content || m.role === 'ai');
      if (messagesToSave.length > 0) {
        saveChatHistory(messagesToSave);
      }
      return updated;
    });
  };

  // 清除聊天历史
  const clearChatHistory = () => {
    const chatStorageKey = getChatStorageKey(userId);
    localStorage.removeItem(chatStorageKey);
    setChatMessages(getInitialAIChat());
  };

  // 自动滚动到最新消息
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

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

  // 发送AI消息
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isAiTyping) return;

    const userMessage = chatInput.trim();
    const currentTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    // 添加用户消息到列表
    const newUserMessage: TrendChatMessage = {
      role: 'user',
      content: userMessage,
      time: currentTime
    };

    const updatedMessagesWithUser = [...chatMessages, newUserMessage];
    updateChatMessages(updatedMessagesWithUser);
    setChatInput('');
    setIsAiTyping(true);

    // 创建AI消息占位符
    const aiPlaceholder: TrendChatMessage = {
      role: 'ai',
      content: '',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };
    const messagesWithPlaceholder = [...updatedMessagesWithUser, aiPlaceholder];
    setChatMessages(messagesWithPlaceholder);

    try {
      // 使用流式API
      await streamTrendChatWithAIDoctor(
        BACKEND_URL,
        {
          userId: 'test_user_001',
          message: userMessage,
          chatHistory: chatMessages,
          trendResult: result?.result
        },
        {
          onChunk: (chunk) => {
            // 实时更新AI消息
            setChatMessages(prev => {
              const updated = [...prev];
              const lastMsg = updated[updated.length - 1];
              if (lastMsg && lastMsg.role === 'ai') {
                updated[updated.length - 1] = {
                  ...lastMsg,
                  content: lastMsg.content + chunk
                };
              }
              return updated;
            });
          },
          onError: (error) => {
            // 更新最后一条AI消息为错误信息
            const errorMessages = [...messagesWithPlaceholder];
            const lastMsg = errorMessages[errorMessages.length - 1];
            if (lastMsg && lastMsg.role === 'ai') {
              errorMessages[errorMessages.length - 1] = {
                ...lastMsg,
                content: '抱歉，网络连接出现问题。请检查网络后重试，或联系客服寻求帮助。'
              };
            }
            updateChatMessages(errorMessages);
          },
          onDone: () => {
            // 流式传输完成，保存完整对话
            setChatMessages(prev => {
              updateChatHistory(prev);
              return prev;
            });
          }
        }
      );
    } catch (error) {
      // 更新最后一条AI消息为错误信息
      const errorMessages = [...messagesWithPlaceholder];
      const lastMsg = errorMessages[errorMessages.length - 1];
      if (lastMsg && lastMsg.role === 'ai') {
        errorMessages[errorMessages.length - 1] = {
          ...lastMsg,
          content: '抱歉，网络连接出现问题。请检查网络后重试，或联系客服寻求帮助。'
        };
      }
      updateChatMessages(errorMessages);
    } finally {
      setIsAiTyping(false);
    }
  };

  // 辅助函数：保存聊天历史（用于onDone回调）
  const updateChatHistory = (messages: TrendChatMessage[]) => {
    const messagesToSave = messages.filter(m => m.content || m.role === 'ai');
    if (messagesToSave.length > 0) {
      saveChatHistory(messagesToSave);
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

                {/* AI医生对话面板 */}
                <AnimatePresence>
                  {showAiChat && (
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                      style={{ height: '400px' }}
                    >
                      {/* AI医生标题栏 */}
                      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center">
                            <Bot size={18} className="text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm">AI 趋势诊断医生</h3>
                            <div className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                              <span className="text-[10px] text-gray-400">在线</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {/* 清除历史按钮 */}
                          {chatMessages.length > 1 && (
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={clearChatHistory}
                              title="清除对话历史"
                              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-100 transition-colors group"
                            >
                              <Trash2 size={14} className="text-gray-400 group-hover:text-red-500" />
                            </motion.button>
                          )}
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowAiChat(false)}
                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                          >
                            <X size={16} className="text-gray-400" />
                          </motion.button>
                        </div>
                      </div>

                      {/* 聊天消息区域 - 可独立滚动 */}
                      <div ref={chatContainerRef} className="overflow-y-auto px-4 py-3" style={{ height: '280px' }}>
                        <div className="space-y-3">
                          {chatMessages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                msg.role === 'user' ? 'bg-gray-200' : 'bg-purple-100'
                              }`}>
                                {msg.role === 'user' ? <User size={14} className="text-gray-600" /> : <Bot size={14} className="text-purple-600" />}
                              </div>
                              <div className={`max-w-[75%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                                <div className={`inline-block px-3 py-2 rounded-2xl text-sm ${
                                  msg.role === 'user'
                                    ? 'bg-blue-500 text-white rounded-br-md'
                                    : 'bg-gray-100 text-gray-700 rounded-bl-md'
                                }`}>
                                  {msg.role === 'user' ? (
                                    msg.content
                                  ) : (
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      components={{
                                        p: ({node, ...props}) => <p className="mb-1.5 last:mb-0 leading-relaxed" {...props} />,
                                        strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-1.5 last:mb-0 space-y-0.5" {...props} />,
                                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-1.5 last:mb-0 space-y-0.5" {...props} />,
                                        li: ({node, ...props}) => <li className="pl-0.5" {...props} />,
                                        blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-purple-300 pl-3 text-gray-600 italic my-1.5 py-0.5 bg-purple-50/50 rounded-r-lg" {...props} />
                                      }}
                                    >
                                      {msg.content}
                                    </ReactMarkdown>
                                  )}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">{msg.time}</p>
                              </div>
                            </div>
                          ))}
                          {/* AI正在输入指示器 */}
                          {isAiTyping && (
                            <div className="flex gap-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-purple-100">
                                <Bot size={14} className="text-purple-600" />
                              </div>
                              <div className="max-w-[75%]">
                                <div className="inline-block px-3 py-2 rounded-2xl text-sm bg-gray-100 text-gray-700 rounded-bl-md">
                                  <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 输入框区域 */}
                      <div className="px-4 pt-2 pb-3 bg-white border-t border-gray-100">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder={isAiTyping ? "AI正在思考..." : "输入您的问题..."}
                            disabled={isAiTyping}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400 bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSendMessage}
                            disabled={isAiTyping || !chatInput.trim()}
                            className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Send size={16} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.section>
                  )}
                </AnimatePresence>

                {/* AI医生按钮 */}
                {result.success && result.result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center"
                  >
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowAiChat(!showAiChat)}
                      className={`py-3 px-6 rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors ${
                        showAiChat
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-purple-500 text-white shadow-md shadow-purple-200'
                      }`}
                    >
                      <MessageCircle size={18} />
                      <span>{showAiChat ? '关闭AI医生' : '咨询AI趋势医生'}</span>
                    </motion.button>
                  </motion.div>
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
