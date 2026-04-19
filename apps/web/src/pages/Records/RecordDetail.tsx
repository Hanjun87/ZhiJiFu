import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  TrendingUp, Shield, History, Bot, Send, User, 
  Phone, FileText, X, Clock, Target, TrendingDown, Minus,
  ChevronDown, ChevronUp, Heart, Sun, Droplets, Utensils, Moon, Sparkles,
  Play, Loader2, Camera, Stethoscope, Activity, FlaskConical
} from 'lucide-react';
import { Record as SkinRecord } from '../../types';
import BackButton from '../../components/common/BackButton';
import { DiseaseTrendPayload, DiseaseTrendResult, CareAdviceItem } from '../../modules/skin/api';
import { chatWithAIDoctor, streamChatWithAIDoctor, ChatMessage } from '../../api/aiDoctor';

interface RecordDetailProps {
  record: SkinRecord | null;
  onBack: () => void;
  onNavigate?: (page: string) => void;
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

// 历史记录完整数据结构 - 包含检测指标
interface HistoryRecord {
  id: string;
  date: string;
  type: string;
  result: string;
  status: '恢复中' | '待复查' | '已结束';
  probability: number;
  progress: number;
  // 检测指标
  severity: number; // 1-3
  severityLabel: string;
  lesionCount: number;
  affectedArea: number; // 百分比
  confidence: number;
  careAdvice: { title: string; desc: string }[];
}

// 每个疾病的独立历史记录数据
const DISEASE_HISTORIES: Record<string, HistoryRecord[]> = {
  '过敏性皮炎': [
    { 
      id: '1', 
      date: '10-24', 
      type: '复诊', 
      result: '过敏性皮炎',
      status: '恢复中',
      probability: 88,
      progress: 65,
      severity: 2,
      severityLabel: '中度',
      lesionCount: 12,
      affectedArea: 15,
      confidence: 0.90,
      careAdvice: [
        { title: '避免过敏原', desc: '远离花粉、尘螨等常见过敏原' },
        { title: '冷敷缓解', desc: '使用冷毛巾敷患处，缓解瘙痒' },
        { title: '保湿修复', desc: '使用无香料保湿霜修复皮肤屏障' },
      ]
    },
    { 
      id: '2', 
      date: '10-18', 
      type: '识别', 
      result: '过敏性皮炎',
      status: '已结束',
      probability: 92,
      progress: 100,
      severity: 1,
      severityLabel: '轻度',
      lesionCount: 5,
      affectedArea: 6,
      confidence: 0.88,
      careAdvice: [
        { title: '预防复发', desc: '记录过敏史，避免再次接触过敏原' },
        { title: '温和清洁', desc: '使用温和无刺激的清洁产品' },
      ]
    },
  ],
  '轻微擦伤': [
    { 
      id: '1', 
      date: '10-18', 
      type: '识别', 
      result: '轻微擦伤',
      status: '待复查',
      probability: 95,
      progress: 40,
      severity: 1,
      severityLabel: '轻度',
      lesionCount: 1,
      affectedArea: 2,
      confidence: 0.96,
      careAdvice: [
        { title: '清洁伤口', desc: '用生理盐水清洗伤口，保持清洁' },
        { title: '涂抹药膏', desc: '涂抹抗菌药膏预防感染' },
        { title: '避免碰水', desc: '伤口未愈合前尽量避免接触水' },
      ]
    },
  ],
  '慢性湿疹': [
    { 
      id: '1', 
      date: '09-20', 
      type: '复诊', 
      result: '慢性湿疹',
      status: '已结束',
      probability: 85,
      progress: 90,
      severity: 2,
      severityLabel: '中度',
      lesionCount: 8,
      affectedArea: 12,
      confidence: 0.84,
      careAdvice: [
        { title: '持续保湿', desc: '慢性湿疹需要长期保湿护理' },
        { title: '避免刺激', desc: '避免使用碱性强的清洁产品' },
      ]
    },
    { 
      id: '2', 
      date: '09-12', 
      type: '复诊', 
      result: '慢性湿疹',
      status: '恢复中',
      probability: 78,
      progress: 60,
      severity: 2,
      severityLabel: '中度',
      lesionCount: 14,
      affectedArea: 20,
      confidence: 0.80,
      careAdvice: [
        { title: '规范用药', desc: '按医嘱使用激素药膏，不可擅自停药' },
        { title: '控制搔抓', desc: '剪短指甲，避免搔抓加重病情' },
      ]
    },
    { 
      id: '3', 
      date: '09-05', 
      type: '识别', 
      result: '慢性湿疹',
      status: '已结束',
      probability: 88,
      progress: 100,
      severity: 3,
      severityLabel: '重度',
      lesionCount: 25,
      affectedArea: 35,
      confidence: 0.86,
      careAdvice: [
        { title: '及时就医', desc: '重度湿疹建议及时就医治疗' },
        { title: '湿敷疗法', desc: '遵医嘱进行湿敷治疗' },
      ]
    },
  ],
  // 默认历史记录（当疾病名称不匹配时使用）
  'default': [
    { 
      id: '1', 
      date: '01-15', 
      type: '复诊', 
      result: '皮肤状况',
      status: '待复查',
      probability: 85,
      progress: 30,
      severity: 2,
      severityLabel: '中度',
      lesionCount: 10,
      affectedArea: 15,
      confidence: 0.85,
      careAdvice: [
        { title: '保持清洁', desc: '每日用温水清洁患处' },
        { title: '按时用药', desc: '按照医嘱使用药物' },
      ]
    },
  ],
};

// 获取特定疾病的历史记录
const getDiseaseHistory = (diseaseName: string): HistoryRecord[] => {
  // 尝试精确匹配
  if (DISEASE_HISTORIES[diseaseName]) {
    return DISEASE_HISTORIES[diseaseName];
  }
  
  // 尝试模糊匹配（包含关键词）
  for (const key of Object.keys(DISEASE_HISTORIES)) {
    if (diseaseName.includes(key) || key.includes(diseaseName)) {
      return DISEASE_HISTORIES[key];
    }
  }
  
  // 返回默认历史记录
  return DISEASE_HISTORIES['default'];
};

// 初始AI对话历史
const getInitialAIChat = (): ChatMessage[] => [
  { role: 'ai', content: '您好！我是您的AI智能医生。我可以根据您的疾病档案历史记录，为您解答关于皮肤健康的问题。请问有什么可以帮助您的？', time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) },
];

export default function RecordDetail({ record, onBack, onNavigate }: RecordDetailProps) {
  const [showAiChat, setShowAiChat] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(getInitialAIChat());
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const [currentRecord, setCurrentRecord] = useState<SkinRecord | null>(record);
  const [currentHistory, setCurrentHistory] = useState<HistoryRecord | null>(null);

  // 从 localStorage 加载聊天历史
  useEffect(() => {
    if (record) {
      const chatStorageKey = `disease_chat_history_${record.id}`;
      const cachedChat = localStorage.getItem(chatStorageKey);
      if (cachedChat) {
        try {
          const parsed = JSON.parse(cachedChat);
          setChatMessages(parsed.messages || getInitialAIChat());
        } catch (e) {
          console.error('Failed to parse cached chat history', e);
          setChatMessages(getInitialAIChat());
        }
      } else {
        setChatMessages(getInitialAIChat());
      }
    }
  }, [record?.id]);

  // 保存聊天历史到 localStorage
  const saveChatHistory = (messages: ChatMessage[]) => {
    if (record) {
      const chatStorageKey = `disease_chat_history_${record.id}`;
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

  // 趋势诊断Agent相关状态
  const [trendResult, setTrendResult] = useState<DiseaseTrendResult | null>(null);
  const [trendLoading, setTrendLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [showRecoveryDetails, setShowRecoveryDetails] = useState(false);
  const [expandedAdvice, setExpandedAdvice] = useState<string[]>([]);
  const [showCareAdvice, setShowCareAdvice] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [recoveryProgress, setRecoveryProgress] = useState(0);

  // 新记录检测状态
  const [hasNewRecords, setHasNewRecords] = useState(false);
  const [savedAnalysisDate, setSavedAnalysisDate] = useState<string | null>(null);

  // 获取当前疾病的历史记录
  const diseaseHistory = record ? getDiseaseHistory(record.title) : [];

  if (!record) return null;

  // localStorage key - 必须在 record 存在后计算
  const STORAGE_KEY = `trend_analysis_${record.id}`;

  // 从localStorage加载保存的分析结果
  useEffect(() => {
    if (!record?.id) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setTrendResult(parsed.trendResult);
        setHasAnalyzed(true);
        setSavedAnalysisDate(parsed.date);

        // 检查是否有新记录
        if (parsed.historyIds && diseaseHistory.length > 0) {
          const latestHistoryId = diseaseHistory[0]?.id;
          const hasNew = !parsed.historyIds.includes(latestHistoryId);
          setHasNewRecords(hasNew);
        }
      }
    } catch (e) {
      console.error('加载保存的分析结果失败:', e);
    }
  }, [record?.id, STORAGE_KEY]);

  // 从历史记录数据计算趋势
  const calculateTrendFromHistory = () => {
    if (diseaseHistory.length < 2) return 'stable';

    // 按日期排序（最早的在前，时间正序）
    const sortedHistory = [...diseaseHistory].sort((a, b) => {
      const dateA = new Date(`2024-${a.date}`);
      const dateB = new Date(`2024-${b.date}`);
      return dateA.getTime() - dateB.getTime();
    });

    // 获取最早和最新的记录来判断整体趋势
    const earliest = sortedHistory[0];
    const latest = sortedHistory[sortedHistory.length - 1];

    // 根据病灶数和面积变化判断趋势
    // 如果最新比最早少，说明在好转(improving)
    const lesionChange = earliest.lesionCount - latest.lesionCount;
    const areaChange = earliest.affectedArea - latest.affectedArea;

    if (lesionChange > 0 || areaChange > 0) return 'improving';
    if (lesionChange < 0 || areaChange < 0) return 'worsening';
    return 'stable';
  };

  // 从历史记录计算恢复进度
  const calculateRecoveryProgressFromHistory = () => {
    if (diseaseHistory.length < 2) return null;

    // 按日期排序（最早的在前，时间正序）
    const sortedHistory = [...diseaseHistory].sort((a, b) => {
      const dateA = new Date(`2024-${a.date}`);
      const dateB = new Date(`2024-${b.date}`);
      return dateA.getTime() - dateB.getTime();
    });

    const earliest = sortedHistory[0];
    const latest = sortedHistory[sortedHistory.length - 1];

    // 计算病灶恢复进度
    const lesionReduction = earliest.lesionCount - latest.lesionCount;
    const lesionRecoveryPercent = lesionReduction > 0
      ? (lesionReduction / earliest.lesionCount) * 100
      : 0;

    // 计算面积恢复进度
    const areaReduction = earliest.affectedArea - latest.affectedArea;
    const areaRecoveryPercent = areaReduction > 0
      ? (areaReduction / earliest.affectedArea) * 100
      : 0;

    // 计算严重度恢复进度
    let severityRecoveryPercent = 0;
    if (latest.severity < earliest.severity) {
      const totalDrop = earliest.severity - 1;
      const actualDrop = earliest.severity - latest.severity;
      severityRecoveryPercent = totalDrop > 0 ? (actualDrop / totalDrop) * 100 : 100;
    } else if (latest.severity === earliest.severity) {
      severityRecoveryPercent = earliest.severity === 1 ? 100 : 50;
    }

    // 加权平均恢复进度
    const weightedRecovery = (
      lesionRecoveryPercent * 0.4 +
      areaRecoveryPercent * 0.35 +
      severityRecoveryPercent * 0.25
    );

    // 计算预计恢复天数
    const trend = calculateTrendFromHistory();
    let estimatedDays = null;
    if (trend === 'improving') {
      const lesionVelocity = lesionReduction / (sortedHistory.length - 1);
      if (lesionVelocity > 0) {
        const remainingLesions = latest.lesionCount;
        estimatedDays = Math.ceil(remainingLesions / lesionVelocity);
      }
    }

    return {
      recovery_percent: Math.round(weightedRecovery * 10) / 10,
      estimated_days_to_full_recovery: estimatedDays,
      started_at: `2024-${earliest.date}`,
      progress_changed: trend,
      confidence: 0.85,
      details: {
        lesion_recovery: {
          percent: Math.round(lesionRecoveryPercent * 10) / 10,
          change: lesionReduction >= 0 ? `-${Math.round(lesionRecoveryPercent)}%` : `+${Math.round(Math.abs(lesionRecoveryPercent))}% (恶化)`,
        },
        area_recovery: {
          percent: Math.round(areaRecoveryPercent * 10) / 10,
          change: areaReduction >= 0 ? `-${Math.round(areaRecoveryPercent)}%` : `+${Math.round(Math.abs(areaRecoveryPercent))}% (恶化)`,
        },
        severity_recovery: {
          percent: Math.round(severityRecoveryPercent * 10) / 10,
          from_level: earliest.severity,
          to_level: latest.severity,
        },
      },
    };
  };

  // 调用趋势诊断Agent API - 使用历史记录数据
  const fetchTrendAnalysis = async () => {
    setTrendLoading(true);
    setHasAnalyzed(true);
    try {
      // 从历史记录计算趋势
      const trend = calculateTrendFromHistory();
      
      // 获取最新的历史记录
      const latestHistory = diseaseHistory[0];
      
      const payload: DiseaseTrendPayload = {
        userId: record?.id || 'test_user_001',
        targetDisease: displayRecord.title || 'atopic_dermatitis',
        timeWindowDays: 14,
        trend: trend,
        userProfile: {
          skin_type: 'sensitive',
          allergy_history: ['atopic_dermatitis'],
          medication_history: ['topical_corticosteroid']
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
      setTrendResult(data);

      // 保存到localStorage
      try {
        const historyIds = diseaseHistory.map(h => h.id);
        const saveData = {
          trendResult: data,
          date: new Date().toISOString(),
          historyIds: historyIds
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
        setSavedAnalysisDate(saveData.date);
        setHasNewRecords(false);
      } catch (e) {
        console.error('保存分析结果失败:', e);
      }
    } catch (err) {
      console.error('趋势诊断Agent调用失败:', err);
    } finally {
      setTrendLoading(false);
    }
  };

  // 切换护理建议展开/收起
  const toggleAdvice = (category: string) => {
    setExpandedAdvice(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // 获取趋势图标
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingDown size={16} className="text-emerald-500" />;
      case 'worsening':
      case 'concerning':
        return <TrendingUp size={16} className="text-red-500" />;
      case 'stable':
        return <Minus size={16} className="text-blue-500" />;
      default:
        return <TrendingUp size={16} className="text-gray-500" />;
    }
  };

  // 获取趋势文本
  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'improving':
        return '正在改善';
      case 'worsening':
      case 'concerning':
        return '正在恶化';
      case 'stable':
        return '保持稳定';
      default:
        return '趋势不明';
    }
  };

  // 处理历史记录点击，切换到对应的历史档案
  const handleHistoryClick = (historyItem: HistoryRecord) => {
    const historyRecord: SkinRecord = {
      id: historyItem.id,
      title: historyItem.result,
      date: `2024-${historyItem.date}`,
      status: historyItem.status,
      probability: historyItem.probability,
      image: record?.image || '',
      typicalImage: record?.typicalImage,
    };
    setCurrentRecord(historyRecord);
    setCurrentHistory(historyItem);
    // 切换历史记录时重置分析状态
    setTrendResult(null);
    setHasAnalyzed(false);
  };

  // 使用当前显示的档案（可能是原始档案或历史档案）
  const displayRecord = currentRecord || record;

  // 自动滚动到最新消息
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isAiTyping) return;
    
    const userMessage = chatInput.trim();
    const currentTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

    const newUserMessage: ChatMessage = { 
      role: 'user', 
      content: userMessage, 
      time: currentTime
    };
    
    updateChatMessages(prev => [...prev, newUserMessage]);
    setChatInput('');
    setIsAiTyping(true);
    
    try {
      const diseaseContext = displayRecord?.title || '';
      
      await streamChatWithAIDoctor({
        userId: 'user_001',
        message: userMessage,
        diseaseContext: diseaseContext,
        chatHistory: chatMessages,
        userRecords: diseaseHistory
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

  // 计算当前趋势和恢复进度（基于历史记录）
  const currentTrend = calculateTrendFromHistory();
  const calculatedRecoveryProgress = calculateRecoveryProgressFromHistory();

  // 获取Agent的恢复进度数据（始终优先使用本地计算的数据）
  const agentRecoveryProgress = calculatedRecoveryProgress;

  // 优先使用后端直接返回的 care_advice，如果没有则从 final_report 中获取
  const agentCareAdvice = trendResult?.success && trendResult.result
    ? ((trendResult.result as any).care_advice || (trendResult.result.final_report as any)?.care_advice || (trendResult.result.final_report?.executive_summary as any)?.care_advice)
    : null;

  // 按优先级排序（high > medium > low）
  const sortedCareAdvice = agentCareAdvice
    ? [...agentCareAdvice].sort((a, b) => {
        const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
        return (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
      })
    : null;

  const agentVerdict = trendResult?.success ? trendResult.result?.final_verdict : null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl px-5 py-3 pt-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <BackButton onClick={onBack} />
          <h1 className="text-lg font-bold text-gray-900">档案详情</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate?.('disease_trend_test')}
            className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 hover:bg-purple-200 transition-colors"
            title="疾病趋势Agent测试"
          >
            <FlaskConical size={20} />
          </motion.button>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-2xl mx-auto">
        {/* 档案标题区 - 简洁文字 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-5 bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-3">
            <span className="bg-gray-50 px-2 py-1 rounded-full">2024年{displayRecord.date}</span>
            {agentVerdict && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                agentVerdict === 'better' ? 'bg-emerald-100 text-emerald-700' :
                agentVerdict === 'worse' ? 'bg-red-100 text-red-700' :
                agentVerdict === 'stable' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {agentVerdict === 'better' ? '趋势: 好转' :
                 agentVerdict === 'worse' ? '趋势: 恶化' :
                 agentVerdict === 'stable' ? '趋势: 稳定' : '趋势: 未知'}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{displayRecord.title}</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full text-sm">{displayRecord.probability}% 匹配度</span>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
              {displayRecord.status}
            </span>
          </div>
        </motion.div>

        {/* 历史记录 - 小按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-5 bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <History size={18} className="text-amber-600" />
            </div>
            <h3 className="font-bold text-gray-900">历史记录</h3>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowHistory(!showHistory)}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span>查看全部</span>
              <span className="text-gray-400">({diseaseHistory.length})</span>
            </motion.button>
          </div>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-3 overflow-hidden"
              >
                <div className="flex flex-col gap-2">
                  {diseaseHistory.map((item) => (
                    <motion.button
                      key={item.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleHistoryClick(item)}
                      className={`px-4 py-3 rounded-xl border text-left transition-colors ${
                        displayRecord.id === item.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* 左侧：日期和类型 */}
                        <div className="flex-shrink-0 w-16">
                          <span className="text-xs text-gray-400 block">{item.date}</span>
                          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded inline-block mt-1">
                            {item.type}
                          </span>
                        </div>
                        
                        {/* 中间：疾病名称和指标 */}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 mb-1.5">{item.result}</p>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-gray-400">病灶数</span>
                              <span className="text-xs font-semibold text-gray-700">{item.lesionCount}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-gray-400">面积</span>
                              <span className="text-xs font-semibold text-gray-700">{item.affectedArea}%</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* 右侧：严重度和置信度 */}
                        <div className="flex-shrink-0 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium block mb-1 ${
                            item.severity === 1 ? 'bg-green-100 text-green-700' :
                            item.severity === 2 ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {item.severityLabel}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            置信度 {Math.round(item.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 拍照识别记录 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-5 bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Camera size={18} className="text-indigo-600" />
            </div>
            <h3 className="font-bold text-gray-900">拍照识别记录</h3>
          </div>

          {/* 识别的照片 */}
          <div className="mb-4">
            <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-video">
              <img 
                src={displayRecord.image || '/images/皮肤病/图片4.png'} 
                alt="识别照片" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs">
                识别时间: {displayRecord.date}
              </div>
            </div>
          </div>

          {/* 识别结果详情 */}
          <div className="space-y-3">
            {/* 疾病名称和置信度 */}
            <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500 mb-1">识别结果</p>
                <p className="font-bold text-gray-900">{displayRecord.title}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">匹配度</p>
                <span className="text-xl font-bold text-indigo-600">{displayRecord.probability}%</span>
              </div>
            </div>

            {/* 识别指标 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl text-center">
                <p className="text-[10px] text-gray-400 mb-1">病灶数</p>
                <p className="font-bold text-gray-900">{currentHistory?.lesionCount || 12}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl text-center">
                <p className="text-[10px] text-gray-400 mb-1">受累面积</p>
                <p className="font-bold text-gray-900">{currentHistory?.affectedArea || 15}%</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl text-center">
                <p className="text-[10px] text-gray-400 mb-1">严重度</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  (currentHistory?.severity || 2) === 1 ? 'bg-green-100 text-green-700' :
                  (currentHistory?.severity || 2) === 2 ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {currentHistory?.severityLabel || '中度'}
                </span>
              </div>
            </div>

            {/* 护理建议摘要 */}
            {(currentHistory?.careAdvice || displayRecord.careAdvice) && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs text-amber-700 font-medium mb-2 flex items-center gap-1">
                  <Shield size={12} />
                  识别时建议
                </p>
                <ul className="space-y-1.5">
                  {(currentHistory?.careAdvice || displayRecord.careAdvice || []).slice(0, 3).map((advice: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 flex-shrink-0" />
                      <span>{typeof advice === 'string' ? advice : advice.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>

        {/* AI趋势分析 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-5 bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                <TrendingUp size={18} className="text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900">AI趋势分析</h3>
            </div>
            {hasNewRecords && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium animate-pulse">
                有新记录
              </span>
            )}
          </div>

          {/* 分析按钮或加载状态 */}
          {!hasAnalyzed ? (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setAnalysisProgress(0);
                const interval = setInterval(() => {
                  setAnalysisProgress(prev => {
                    if (prev >= 100) {
                      clearInterval(interval);
                      return 100;
                    }
                    return prev + 10;
                  });
                }, 200);
                fetchTrendAnalysis();
              }}
              className="w-full py-3 px-4 bg-purple-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-purple-600 transition-colors"
            >
              <Play size={18} />
              开始AI分析
            </motion.button>
          ) : trendLoading ? (
            <div className="text-center py-6">
              <Loader2 size={32} className="animate-spin mx-auto text-purple-500 mb-3" />
              <p className="text-sm text-gray-600">AI正在分析您的皮肤趋势...</p>
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden max-w-xs mx-auto">
                <div 
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">{analysisProgress}%</p>
            </div>
          ) : trendResult?.success ? (
            <div className="space-y-4">
              {/* 恢复进度 */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">恢复进度</span>
                  <span className="text-lg font-bold text-purple-600">{agentRecoveryProgress}%</span>
                </div>
                <div className="h-2.5 bg-white rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${agentRecoveryProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  />
                </div>
                {agentVerdict && (
                  <div className="flex items-center gap-2 mt-2">
                    {getTrendIcon(agentVerdict)}
                    <span className="text-xs text-gray-600">{getTrendText(agentVerdict)}</span>
                  </div>
                )}
              </div>

              {/* 护理建议 */}
              {sortedCareAdvice && sortedCareAdvice.length > 0 && (
                <div>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCareAdvice(!showCareAdvice)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Shield size={18} className="text-purple-600" />
                      <span className="font-medium text-gray-900">护理建议</span>
                      <span className="text-xs text-gray-400">({sortedCareAdvice.length}条)</span>
                    </div>
                    {showCareAdvice ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                  </motion.button>
                  
                  <AnimatePresence>
                    {showCareAdvice && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 space-y-2">
                          {sortedCareAdvice.map((advice: any, idx: number) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="p-3 bg-amber-50 rounded-xl border border-amber-100"
                            >
                              <div className="flex items-start gap-2">
                                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                  advice.priority === 'high' ? 'bg-red-400' :
                                  advice.priority === 'medium' ? 'bg-amber-400' : 'bg-green-400'
                                }`} />
                                <div className="flex-1">
                                  <p className="font-medium text-sm text-gray-900">{advice.title}</p>
                                  <p className="text-xs text-gray-600 mt-1">{advice.description}</p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* 重新分析按钮 */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setTrendResult(null);
                  setHasAnalyzed(false);
                  setShowCareAdvice(false);
                }}
                className="w-full py-2.5 px-4 border border-purple-200 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-colors"
              >
                重新分析
              </motion.button>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-3">分析失败，请重试</p>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setHasAnalyzed(false);
                  setTrendResult(null);
                }}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm"
              >
                重试
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* AI对话区域 */}
        <AnimatePresence>
          {showAiChat && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-5"
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
                        if (record) {
                          const chatStorageKey = `disease_chat_history_${record.id}`;
                          localStorage.removeItem(chatStorageKey);
                          setChatMessages(getInitialAIChat());
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

      {/* 底部常驻按钮 - 固定在内容底部 */}
      <div className="px-5 pb-8">
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
