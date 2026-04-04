import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  CheckCircle2, Calendar, Sun, Droplets, Loader2,
  Sparkles, Shield, Edit3, ChevronRight, Plus, X,
  Thermometer, Wind, Bot, Send, User, Phone
} from 'lucide-react';
import BackButton from '../../components/common/BackButton';
import { streamChatWithAIDoctor, ChatMessage } from '../../api/aiDoctor';

interface DiaryDetailProps {
  entry: {
    id: string;
    date: string;
    time: string;
    title: string;
    status: string;
    image: string;
    skinMetrics?: Array<{
      label: string;
      value: number;
      detail: string;
    }>;
  } | null;
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

interface CareItem {
  id: string;
  title: string;
  desc: string;
  checked: boolean;
}

// 环境数据
const envData = {
  weather: '晴朗',
  temperature: '22°C',
  humidity: '45%',
  uv: '中等',
};

// AI对话历史初始消息 - 根据当前皮肤档案动态生成
const getInitialAIChat = (entryTitle?: string): ChatMessage[] => [
  { 
    role: 'ai', 
    content: entryTitle 
      ? `您好！我是您的AI护肤顾问。我已了解您的皮肤档案「${entryTitle}」，可以针对您的皮肤状况为您提供个性化的护肤建议和解答。请问有什么可以帮助您的？`
      : '您好！我是您的AI护肤顾问。我可以根据您的皮肤档案，为您提供个性化的护肤建议和解答。请问有什么可以帮助您的？',
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) 
  },
];

export default function DiaryDetail({ entry, onBack, onNavigate }: DiaryDetailProps) {
  const [note, setNote] = useState('今天皮肤状态不错，早上用了新的精华，感觉吸收很好。晚上记得早点休息。');
  
  // 肤色和UV指数
  const [skinToneValue, setSkinToneValue] = useState(30);
  const [uvIndex, setUvIndex] = useState(3);
  
  // 护理项目列表（用户可自己添加）
  const [careItems, setCareItems] = useState<CareItem[]>([]);
  const [newCareTitle, setNewCareTitle] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  // AI对话相关状态
  const [showAiChat, setShowAiChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 从 localStorage 加载聊天历史
  useEffect(() => {
    if (entry) {
      const chatStorageKey = `ai_chat_history_${entry.id}`;
      const cachedChat = localStorage.getItem(chatStorageKey);
      if (cachedChat) {
        try {
          const parsed = JSON.parse(cachedChat);
          setChatMessages(parsed.messages || getInitialAIChat(entry.title));
        } catch (e) {
          console.error('Failed to parse cached chat history', e);
          setChatMessages(getInitialAIChat(entry.title));
        }
      } else {
        setChatMessages(getInitialAIChat(entry.title));
      }
    }
  }, [entry?.id]);

  // 保存聊天历史到 localStorage
  const saveChatHistory = (messages: ChatMessage[]) => {
    if (entry) {
      const chatStorageKey = `ai_chat_history_${entry.id}`;
      localStorage.setItem(chatStorageKey, JSON.stringify({
        messages: messages,
        timestamp: Date.now()
      }));
    }
  };

  // 更新聊天消息并保存到 localStorage
  const updateChatMessages = (newMessages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
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

  // 从后端获取的护理建议和AI结论
  const [careAdvice, setCareAdvice] = useState<any[]>([]);
  const [aiVerdict, setAiVerdict] = useState<string>('stable');
  const [isFetchingAdvice, setIsFetchingAdvice] = useState(false);

  // 从 localStorage 加载缓存的分析结果
  useEffect(() => {
    if (entry) {
      const storageKey = `skincare_analysis_${entry.id}`;
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setCareAdvice(parsed.careAdvice || []);
          setAiVerdict(parsed.aiVerdict || 'stable');
        } catch (e) {
          console.error('Failed to parse cached analysis', e);
        }
      }
    }
  }, [entry]);

  // 保存分析结果到 localStorage
  const saveAnalysisToStorage = (advice: any[], verdict: string) => {
    if (entry) {
      const storageKey = `skincare_analysis_${entry.id}`;
      localStorage.setItem(storageKey, JSON.stringify({
        careAdvice: advice,
        aiVerdict: verdict,
        timestamp: Date.now()
      }));
    }
  };

  // 获取皮肤保养分析的通用函数
  const fetchSkincareAnalysis = async (forceRefresh = false) => {
    if (!entry) return;
    
    // 如果有缓存且不强制刷新，则跳过
    if (!forceRefresh) {
      const storageKey = `skincare_analysis_${entry.id}`;
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.careAdvice && parsed.careAdvice.length > 0) {
            setCareAdvice(parsed.careAdvice);
            setAiVerdict(parsed.aiVerdict || 'stable');
            return;
          }
        } catch (e) {
          console.error('Failed to parse cached analysis', e);
        }
      }
    }

    setIsFetchingAdvice(true);
    try {
      const BACKEND_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
      
      const response = await fetch(`${BACKEND_URL}/api/skincare-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user_001',
          entryTitle: entry.title,
          note: '用户日记内容',
          skinMetrics: entry.skinMetrics || [],
          careItems: [],
          entryDate: `${entry.date} ${entry.time}`,
        }),
      });
      const data = await response.json();
      if (data.success && data.result) {
        const advice = data.result.care_advice || [];
        const verdict = data.result.ai_verdict || 'stable';
        setCareAdvice(advice);
        setAiVerdict(verdict);
        // 保存到 localStorage
        saveAnalysisToStorage(advice, verdict);
      }
    } catch (e) {
      console.error('Failed to fetch skincare analysis', e);
    } finally {
      setIsFetchingAdvice(false);
    }
  };

  // 页面加载时获取分析（如果有缓存则使用缓存）
  useEffect(() => {
    if (entry) {
      fetchSkincareAnalysis(false);
    }
  }, [entry]);

  // 自动滚动到最新消息
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // 根据滑块值计算肤色标签
  const getSkinToneLabel = (value: number) => {
    if (value < 20) return { label: '很浅', color: '#F9E4D4' };
    if (value < 40) return { label: '中等偏浅', color: '#F3D0B5' };
    if (value < 60) return { label: '中等', color: '#E1AC88' };
    if (value < 80) return { label: '中等偏深', color: '#C58351' };
    return { label: '深', color: '#8D5524' };
  };

  const skinTone = getSkinToneLabel(skinToneValue);

  // 选中的皮肤指标
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // 添加新的护理项目
  const handleAddCareItem = () => {
    if (!newCareTitle.trim()) return;
    const newItem: CareItem = {
      id: Date.now().toString(),
      title: newCareTitle,
      desc: '点击编辑描述',
      checked: false,
    };
    setCareItems([...careItems, newItem]);
    setNewCareTitle('');
    setShowAddInput(false);
  };

  // 删除护理项目
  const handleDeleteCareItem = (id: string) => {
    setCareItems(careItems.filter(item => item.id !== id));
  };

  // 切换勾选状态
  const toggleCareItem = (id: string) => {
    setCareItems(careItems.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  // 发送AI消息
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isAiTyping) return;

    const userMessage = chatInput.trim();
    const currentTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    // 添加用户消息到列表
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      time: currentTime
    };

    updateChatMessages(prev => [...prev, newUserMessage]);
    setChatInput('');
    setIsAiTyping(true);

    try {
      // 构建皮肤档案上下文
      let skinContext = '';
      if (entry) {
        const skinMetricsText = (entry.skinMetrics || [])
          .map(m => `${m.label}(${m.value}/100)`)
          .join('、');
        const careAdviceText = careAdvice.length > 0 
          ? careAdvice.map(a => a.title).join('、')
          : '暂无';
        skinContext = `皮肤日记标题：${entry.title}；皮肤指标：${skinMetricsText}；当前护理建议：${careAdviceText}`;
      }

      // 使用流式API
      await streamChatWithAIDoctor({
        userId: 'user_001',
        message: userMessage,
        diseaseContext: skinContext,
        chatHistory: chatMessages
      }, {
        onChunk: (chunk) => {
          // 实时更新AI消息
          updateChatMessages(prev => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg && lastMsg.role === 'ai') {
              updated[updated.length - 1] = {
                ...lastMsg,
                content: lastMsg.content + chunk
              };
            } else {
              updated.push({
                role: 'ai',
                content: chunk,
                time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
              });
            }
            return updated;
          });
        },
        onError: (error) => {
          // 更新最后一条AI消息为错误信息
          updateChatMessages(prev => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg && lastMsg.role === 'ai') {
              updated[updated.length - 1] = {
                ...lastMsg,
                content: '抱歉，网络连接出现问题。请检查网络后重试，或联系客服寻求帮助。'
              };
            } else {
              updated.push({
                role: 'ai',
                content: '抱歉，网络连接出现问题。请检查网络后重试，或联系客服寻求帮助。',
                time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
              });
            }
            return updated;
          });
        },
        onDone: () => {
          // 流式传输完成
        }
      });
    } catch (error) {
      // 更新最后一条AI消息为错误信息
      updateChatMessages(prev => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg && lastMsg.role === 'ai') {
          updated[updated.length - 1] = {
            ...lastMsg,
            content: '抱歉，网络连接出现问题。请检查网络后重试，或联系客服寻求帮助。'
          };
        } else {
          updated.push({
            role: 'ai',
            content: '抱歉，网络连接出现问题。请检查网络后重试，或联系客服寻求帮助。',
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
          });
        }
        return updated;
      });
    } finally {
      setIsAiTyping(false);
    }
  };

  if (!entry) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="bg-white/80 backdrop-blur-xl fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16 border-b border-gray-100">
          <BackButton onClick={onBack} />
          <h1 className="font-bold text-lg tracking-tight text-gray-900">皮肤日记</h1>
          <div className="w-10" />
        </header>
        <div className="flex-1 flex items-center justify-center pt-20">
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16 border-b border-gray-100">
        <BackButton onClick={onBack} />
        <h1 className="font-bold text-lg tracking-tight text-gray-900">皮肤日记</h1>
        <div className="w-10" />
      </header>

      <main className="pt-20 pb-8 px-4 max-w-2xl mx-auto space-y-4">
        {/* 1. 皮肤表现 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <Sparkles size={18} className="text-blue-600" />
              </div>
              <h2 className="font-bold text-gray-900">皮肤表现</h2>
              <span className="ml-auto text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">2024年{entry.date} {entry.time}</span>
            </div>

            {/* Photo Preview */}
            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-4">
              <img src={entry.image} alt="皮肤记录" className="w-full h-full object-cover" />
            </div>

            {/* Key Metrics Tags */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {(entry.skinMetrics || []).map((metric) => (
                <motion.button
                  key={metric.label}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMetric(selectedMetric === metric.label ? null : metric.label)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-full transition-colors ${
                    selectedMetric === metric.label
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {metric.label}
                </motion.button>
              ))}
            </div>

            {/* Selected Metric Detail */}
            {selectedMetric && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-blue-700">{selectedMetric}</span>
                  <span className="text-xs text-blue-500">
                    {(entry.skinMetrics || []).find(m => m.label === selectedMetric)?.value}%
                  </span>
                </div>
                <p className="text-xs text-blue-600 leading-relaxed">
                  {(entry.skinMetrics || []).find(m => m.label === selectedMetric)?.detail}
                </p>
              </motion.div>
            )}

            {/* Findings Text */}
            <p className="text-gray-500 leading-relaxed text-sm text-center">
              {entry.title}，皮肤整体状态良好，继续保持当前护肤习惯。
            </p>
          </div>
        </motion.section>

        {/* 2. 护理建议 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Shield size={18} className="text-emerald-600" />
              </div>
              <h2 className="font-bold text-gray-900">护理建议</h2>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchSkincareAnalysis(true)}
                disabled={isFetchingAdvice}
                className="ml-auto px-2.5 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Sparkles size={14} className={isFetchingAdvice ? 'animate-spin' : ''} />
                <span>{isFetchingAdvice ? '分析中...' : '重新分析'}</span>
              </motion.button>
            </div>

            <div className="space-y-3">
              {isFetchingAdvice ? (
                <div className="text-center py-4 text-gray-400 text-sm">
                  正在生成个性化护理建议...
                </div>
              ) : careAdvice.length > 0 ? (
                careAdvice.map((advice, idx) => {
                  let Icon = Shield;
                  if (advice.category === 'cleaning' || advice.category === 'moisturizing') Icon = Droplets;
                  if (advice.category === 'sunscreen') Icon = Sun;
                  
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-2xl border border-gray-100">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{advice.title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{advice.description}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                [
                  { icon: Shield, title: '屏障修护', desc: '建议使用含神经酰胺的修护产品' },
                  { icon: Droplets, title: '保湿补水', desc: '肌肤水分含量偏低，需加强保湿' },
                  { icon: Sun, title: '严格防晒', desc: '紫外线指数较高，注意防晒保护' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-2xl border border-gray-100">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <item.icon size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.section>

        {/* 3. 今日肤色 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                <Sun size={18} className="text-amber-600" />
              </div>
              <h3 className="font-bold text-gray-900">今日肤色</h3>
            </div>
            
            <div className="space-y-4">
              {/* 肤色滑块 */}
              <div className="relative h-4 w-full rounded-full overflow-hidden" style={{ background: 'linear-gradient(to right, #F9E4D4, #F3D0B5, #E1AC88, #C58351, #8D5524)' }}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skinToneValue}
                  onChange={(e) => setSkinToneValue(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-blue-500 rounded-full shadow-md flex items-center justify-center pointer-events-none transition-all"
                  style={{ left: `calc(${skinToneValue}% - 12px)` }}
                >
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: skinTone.color }}></div>
                </div>
              </div>
              
              <div className="flex justify-between text-[10px] font-bold text-gray-400 px-1">
                <span>浅色</span>
                <span>深色</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 4. 当日环境 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center">
                <Sun size={18} className="text-sky-600" />
              </div>
              <h3 className="font-bold text-gray-900">当日环境</h3>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 bg-white rounded-xl border border-gray-100">
                <Sun size={20} className="text-amber-500 mx-auto mb-1" />
                <p className="text-xs text-gray-400">天气</p>
                <p className="text-sm font-bold text-gray-900">{envData.weather}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-xl border border-gray-100">
                <Thermometer size={20} className="text-red-500 mx-auto mb-1" />
                <p className="text-xs text-gray-400">温度</p>
                <p className="text-sm font-bold text-gray-900">{envData.temperature}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-xl border border-gray-100">
                <Droplets size={20} className="text-blue-500 mx-auto mb-1" />
                <p className="text-xs text-gray-400">湿度</p>
                <p className="text-sm font-bold text-gray-900">{envData.humidity}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-xl border border-gray-100">
                <Wind size={20} className="text-purple-500 mx-auto mb-1" />
                <p className="text-xs text-gray-400">紫外线</p>
                <p className="text-sm font-bold text-gray-900">{envData.uv}</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 5. 今日太阳强度 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                <Sun size={18} className="text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-900">今日太阳强度</h3>
            </div>
            
            <div className="flex items-center justify-around py-2">
              {/* UV指数圆环 */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="40" stroke="#f3f4f5" strokeWidth="8"></circle>
                  <motion.circle
                    cx="50"
                    cy="50"
                    fill="none"
                    r="40"
                    stroke={uvIndex <= 3 ? '#FFA500' : uvIndex <= 6 ? '#FF6B00' : '#FF0000'}
                    strokeDasharray="251.2"
                    strokeLinecap="round"
                    strokeWidth="8"
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * ((uvIndex - 1) / 9)) }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    className="text-xl font-bold text-gray-900"
                    key={uvIndex}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {uvIndex}
                  </motion.span>
                  <span className="text-[10px] font-bold text-orange-500">
                    {uvIndex <= 3 ? '弱' : uvIndex <= 6 ? '中' : '强'}
                  </span>
                </div>
              </div>
              
              {/* UV指数滑块 */}
              <div className="flex-1 ml-4 space-y-3">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={uvIndex}
                  onChange={(e) => setUvIndex(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                    <span className="text-xs font-medium text-gray-700">低强度 (1-3)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-xs font-medium text-gray-700">中强度 (4-6)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-xs font-medium text-gray-700">高强度 (7-10)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 6. 今日护理与用药 - 用户自己添加 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                  <CheckCircle2 size={18} className="text-violet-600" />
                </div>
                <h3 className="font-bold text-gray-900">今日护理与用药</h3>
              </div>
              {careItems.length > 0 && (
                <span className="text-xs text-blue-600 font-semibold">{careItems.filter(i => i.checked).length}/{careItems.length} 已完成</span>
              )}
            </div>

            {/* 护理项目列表 */}
            <div className="space-y-2 mb-3">
              {careItems.length === 0 ? (
                <div className="text-center py-4 text-gray-400 text-sm">
                  还没有护肤记录，点击下方添加
                </div>
              ) : (
                careItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl group">
                    <div className="flex items-center space-x-3 flex-1">
                      <input 
                        type="checkbox" 
                        checked={item.checked}
                        onChange={() => toggleCareItem(item.id)}
                        className="w-5 h-5 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer" 
                      />
                      <div className={item.checked ? 'opacity-50' : ''}>
                        <div className="font-bold text-gray-900 text-sm">{item.title}</div>
                        <div className="text-xs text-gray-400">{item.desc}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteCareItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* 添加新项目 */}
            {showAddInput ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCareTitle}
                  onChange={(e) => setNewCareTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCareItem()}
                  placeholder="输入护理项目名称..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
                  autoFocus
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddCareItem}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm"
                >
                  添加
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setShowAddInput(false); setNewCareTitle(''); }}
                  className="px-3 py-2.5 bg-gray-100 text-gray-600 rounded-xl"
                >
                  <X size={18} />
                </motion.button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAddInput(true)}
                className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                <Plus size={18} />
                <span className="text-sm font-medium">添加护理项目</span>
              </button>
            )}
          </div>
        </motion.section>

        {/* 7. 备注 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                <Edit3 size={18} className="text-gray-600" />
              </div>
              <h3 className="font-bold text-gray-900">备注</h3>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="记录今天的皮肤状态、使用的护肤品或任何观察..."
              className="w-full h-24 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
            />
          </div>
        </motion.section>

        {/* AI 点评 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                <Bot size={18} className="text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900">AI 点评</h3>
            </div>
            <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-2xl p-5 border border-purple-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                  <Bot size={24} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  {isFetchingAdvice ? (
                    <div className="flex items-center gap-2 py-2">
                      <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                      <p className="text-sm text-gray-600">AI正在分析皮肤数据并生成个性化点评...</p>
                    </div>
                  ) : (
                    <>
                      {/* AI点评内容 */}
                      <p className="text-sm text-gray-700 leading-relaxed mb-4">
                        {aiVerdict === 'better' && '根据最近的数据分析，您的皮肤状况正在好转！继续保持当前的护肤习惯，注意巩固效果。'}
                        {aiVerdict === 'worse' && '近期皮肤状况有恶化趋势，建议您重点关注近期使用的护肤品或生活作息是否改变，如有不适请及时就医。'}
                        {aiVerdict === 'stable' && '皮肤状态保持稳定。建议继续保持当前的日常护理，注意防晒和基础保湿。'}
                        {aiVerdict === 'insufficient' && '根据今天的皮肤记录，整体状态良好。继续保持当前的护肤习惯，注意补水和防晒。'}
                      </p>
                      
                      {/* 建议重点 - 竖向排列 */}
                      <div className="mt-4 pt-4 border-t border-purple-100/60">
                        <p className="text-xs font-semibold text-purple-700 mb-3 flex items-center gap-1.5">
                          <Sparkles size={12} className="text-purple-500" />
                          建议重点
                        </p>
                        <div className="space-y-2">
                          {(careAdvice.length > 0 ? careAdvice.slice(0, 3) : [
                            { title: '防晒', category: 'sunscreen' },
                            { title: '保湿', category: 'moisturizing' },
                            { title: '眼部护理', category: 'treatment' }
                          ]).map((advice, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-center gap-2 text-xs text-gray-600 bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-purple-50 hover:bg-white hover:shadow-sm transition-all"
                            >
                              <span className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-[10px] font-bold text-purple-600 shrink-0">
                                {idx + 1}
                              </span>
                              <span className="font-medium text-gray-700 truncate">{advice.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* AI对话面板 - 界面中的界面 */}
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
                    <h3 className="font-bold text-gray-900 text-sm">AI 智能医生</h3>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-[10px] text-gray-400">在线</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {chatMessages.length > 1 && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (entry) {
                          const chatStorageKey = `ai_chat_history_${entry.id}`;
                          localStorage.removeItem(chatStorageKey);
                          setChatMessages(getInitialAIChat(entry.title));
                        }
                      }}
                      className="px-2 py-1 text-[10px] text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                      title="清空对话"
                    >
                      清空
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
      </main>

      {/* 底部常驻按钮 */}
      <div className="px-5 pb-8 pt-4 bg-gray-50">
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAiChat(!showAiChat)}
            className={`flex-1 py-2.5 px-2 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors min-w-0 ${
              showAiChat 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-purple-500 text-white shadow-md shadow-purple-200'
            }`}
          >
            <Bot size={16} />
            <span className="truncate">{showAiChat ? '关闭' : 'AI医生'}</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate?.('hospital')}
            className="flex-1 py-2.5 px-2 bg-blue-600 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-200 min-w-0"
          >
            <Phone size={16} />
            <span className="truncate">联系医生</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
