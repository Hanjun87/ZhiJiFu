import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, Shield, History, Bot, Send, User, 
  Phone, FileText, X, Clock, Target, TrendingDown, Minus,
  ChevronDown, ChevronUp, Heart, Sun, Droplets, Utensils, Moon, Sparkles,
  Play, Loader2, Camera, Stethoscope, Activity
} from 'lucide-react';
import { Record } from '../../types';
import BackButton from '../../components/common/BackButton';
import { DiseaseTrendPayload, DiseaseTrendResult, CareAdviceItem } from '../../modules/skin/api';

interface RecordDetailProps {
  record: Record | null;
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

// 模拟历史记录数据 - 同一疾病（特应性皮炎）的不同阶段，包含检测指标
const MOCK_HISTORY: HistoryRecord[] = [
  { 
    id: '1', 
    date: '01-15', 
    type: '复诊', 
    result: '特应性皮炎',
    status: '待复查',
    probability: 85,
    progress: 30,
    severity: 3,
    severityLabel: '重度',
    lesionCount: 22,
    affectedArea: 28,
    confidence: 0.88,
    careAdvice: [
      { title: '保持清洁', desc: '每日用温水清洁患处，避免使用刺激性洗护用品' },
      { title: '按时用药', desc: '按照医嘱涂抹药膏，不要自行增减用量' },
      { title: '避免刺激', desc: '避免抓挠患处，穿着宽松透气的衣物' },
    ]
  },
  { 
    id: '2', 
    date: '01-10', 
    type: '复诊', 
    result: '特应性皮炎',
    status: '恢复中',
    probability: 72,
    progress: 55,
    severity: 2,
    severityLabel: '中度',
    lesionCount: 15,
    affectedArea: 18,
    confidence: 0.82,
    careAdvice: [
      { title: '继续用药', desc: '症状有所缓解，继续按医嘱用药巩固疗效' },
      { title: '保湿护理', desc: '加强皮肤保湿，使用温和的保湿产品' },
      { title: '饮食注意', desc: '避免辛辣刺激食物，多吃富含维生素的蔬果' },
    ]
  },
  { 
    id: '3', 
    date: '01-05', 
    type: '识别', 
    result: '特应性皮炎',
    status: '已结束',
    probability: 91,
    progress: 100,
    severity: 1,
    severityLabel: '轻度',
    lesionCount: 8,
    affectedArea: 8,
    confidence: 0.85,
    careAdvice: [
      { title: '预防复发', desc: '注意避免接触过敏原，保持环境清洁' },
      { title: '定期复查', desc: '建议每月复查一次，监测皮肤状况' },
      { title: '健康习惯', desc: '保持规律作息，增强身体免疫力' },
    ]
  },
];

// 模拟AI对话历史
const MOCK_AI_CHAT = [
  { role: 'user', content: '我的皮炎什么时候能好？', time: '14:32' },
  { role: 'ai', content: '根据您的恢复进度，预计还需要2-3周时间。请继续按照医嘱用药。', time: '14:32' },
];

// 模拟皮肤检测记录数据 - 与MOCK_HISTORY日期一致
const MOCK_DETECTION_RECORDS: SkinDetectionRecord[] = [
  {
    id: 'd1',
    date: '01-15',
    time: '09:30',
    severity: 3,
    severityLabel: '重度',
    lesionCount: 22,
    affectedArea: 28,
    confidence: 0.88,
    notes: '初次诊断，特应性皮炎症状明显'
  },
  {
    id: 'd2',
    date: '01-10',
    time: '14:20',
    severity: 2,
    severityLabel: '中度',
    lesionCount: 15,
    affectedArea: 18,
    confidence: 0.82,
    notes: '症状持续，开始使用药物治疗'
  },
  {
    id: 'd3',
    date: '01-05',
    time: '10:15',
    severity: 1,
    severityLabel: '轻度',
    lesionCount: 8,
    affectedArea: 8,
    confidence: 0.85,
    notes: '症状明显缓解，继续用药巩固'
  },
];

export default function RecordDetail({ record, onBack, onNavigate }: RecordDetailProps) {
  const [showAiChat, setShowAiChat] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState(MOCK_AI_CHAT);
  const [currentRecord, setCurrentRecord] = useState<Record | null>(record);
  const [currentHistory, setCurrentHistory] = useState<HistoryRecord | null>(null);

  // 趋势诊断Agent相关状态
  const [trendResult, setTrendResult] = useState<DiseaseTrendResult | null>(null);
  const [trendLoading, setTrendLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [showRecoveryDetails, setShowRecoveryDetails] = useState(false);
  const [expandedAdvice, setExpandedAdvice] = useState<string[]>([]);

  // 新记录检测状态
  const [hasNewRecords, setHasNewRecords] = useState(false);
  const [savedAnalysisDate, setSavedAnalysisDate] = useState<string | null>(null);

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
        if (parsed.historyIds && MOCK_HISTORY.length > 0) {
          const latestHistoryId = MOCK_HISTORY[0]?.id;
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
    if (MOCK_HISTORY.length < 2) return 'stable';

    // 按日期排序（最早的在前，时间正序）
    const sortedHistory = [...MOCK_HISTORY].sort((a, b) => {
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
    if (MOCK_HISTORY.length < 2) return null;

    // 按日期排序（最早的在前，时间正序）
    const sortedHistory = [...MOCK_HISTORY].sort((a, b) => {
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
      const latestHistory = MOCK_HISTORY[0];
      
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
        const historyIds = MOCK_HISTORY.map(h => h.id);
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
    const historyRecord: Record = {
      id: historyItem.id,
      title: historyItem.result,
      date: `2024-${historyItem.date}`,
      status: historyItem.status,
      probability: historyItem.probability,
      image: record.image,
      typicalImage: record.typicalImage,
    };
    setCurrentRecord(historyRecord);
    setCurrentHistory(historyItem);
    // 切换历史记录时重置分析状态
    setTrendResult(null);
    setHasAnalyzed(false);
  };

  // 使用当前显示的档案（可能是原始档案或历史档案）
  const displayRecord = currentRecord || record;

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    const newMessage = { 
      role: 'user', 
      content: chatInput, 
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
    
    setTimeout(() => {
      const aiReply = { 
        role: 'ai', 
        content: '我已收到您的问题，建议继续观察症状变化，如有异常请及时就医。', 
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, aiReply]);
    }, 1000);
  };

  // 计算当前趋势和恢复进度（基于历史记录）
  const currentTrend = calculateTrendFromHistory();
  const calculatedRecoveryProgress = calculateRecoveryProgressFromHistory();

  // 获取Agent的恢复进度数据（始终优先使用本地计算的数据）
  const agentRecoveryProgress = calculatedRecoveryProgress;

  // 优先使用后端直接返回的 care_advice，如果没有则从 final_report 中获取
  const agentCareAdvice = trendResult?.success
    ? (trendResult.result?.care_advice || trendResult.result?.final_report?.care_advice || trendResult.result?.final_report?.executive_summary?.care_advice)
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
          <div className="w-10" />
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
              <span className="text-gray-400">({MOCK_HISTORY.length})</span>
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
                  {MOCK_HISTORY.map((item) => (
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

        {/* AI趋势分析区域 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-5"
        >
          {!hasAnalyzed ? (
            // 未分析状态 - 显示开始分析按钮
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 shadow-sm border border-purple-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Bot size={24} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">AI趋势分析</h3>
                  <p className="text-sm text-gray-500">基于您的历史数据生成个性化分析</p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={fetchTrendAnalysis}
                className="w-full py-3 px-4 bg-purple-500 text-white rounded-xl font-semibold text-sm hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 shadow-md shadow-purple-200"
              >
                <Play size={18} />
                开始AI分析
              </motion.button>
            </div>
          ) : trendLoading ? (
            // 分析中状态
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                  <Loader2 size={32} className="text-purple-500 animate-spin" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">AI正在分析中...</h3>
                <p className="text-sm text-gray-500 text-center">
                  正在根据您的皮肤数据生成恢复进度和护理建议
                </p>
                <div className="flex gap-2 mt-4">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          ) : (
            // 分析完成 - 显示结果
            <>
              {/* 新记录提示 */}
              {hasNewRecords && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <Sparkles size={20} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">检测到新记录</p>
                      <p className="text-xs text-gray-500">有新的历史记录可用于分析</p>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchTrendAnalysis}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
                  >
                    重新分析
                  </motion.button>
                </motion.div>
              )}

              {/* 分析信息 */}
              {savedAnalysisDate && !hasNewRecords && (
                <div className="mb-4 flex items-center gap-2 text-xs text-gray-400">
                  <Clock size={14} />
                  <span>上次分析: {new Date(savedAnalysisDate).toLocaleString('zh-CN')}</span>
                </div>
              )}

              {/* 恢复进度 */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      currentTrend === 'improving' ? 'bg-emerald-50' :
                      currentTrend === 'worsening' ? 'bg-red-50' :
                      'bg-blue-50'
                    }`}>
                      {currentTrend === 'improving' ? <TrendingDown size={18} className="text-emerald-600" /> :
                       currentTrend === 'worsening' ? <TrendingUp size={18} className="text-red-600" /> :
                       <Minus size={18} className="text-blue-600" />}
                    </div>
                    {currentTrend === 'improving' ? '恢复良好' :
                     currentTrend === 'worsening' ? '需要关注' :
                     '恢复进度'}
                  </h3>
                  {agentRecoveryProgress && (
                    <button
                      onClick={() => setShowRecoveryDetails(!showRecoveryDetails)}
                      className="text-xs text-blue-500 flex items-center gap-1"
                    >
                      {showRecoveryDetails ? '收起详情' : '查看详情'}
                      {showRecoveryDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  )}
                </div>
                
                <div className="p-4 bg-gray-50 rounded-xl">
                  {agentRecoveryProgress ? (
                    <>
                      {/* 主要进度条 */}
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">总体恢复进度</span>
                          <span className={`font-bold ${
                            currentTrend === 'improving' ? 'text-emerald-600' :
                            currentTrend === 'worsening' ? 'text-red-600' :
                            'text-blue-600'
                          }`}>
                            {agentRecoveryProgress.recovery_percent}%
                          </span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${agentRecoveryProgress.recovery_percent}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className={`h-full rounded-full ${
                              currentTrend === 'improving' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                              currentTrend === 'worsening' ? 'bg-gradient-to-r from-red-400 to-red-500' :
                              'bg-gradient-to-r from-blue-400 to-blue-500'
                            }`}
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          {getTrendIcon(currentTrend)}
                          <span>{getTrendText(currentTrend)}</span>
                        </div>
                      </div>

                      {/* 预计恢复时间 */}
                      {agentRecoveryProgress.estimated_days_to_full_recovery !== null && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl mb-4">
                          <Clock size={18} className="text-blue-500" />
                          <div>
                            <p className="text-sm text-blue-700 font-medium">
                              预计还需 {agentRecoveryProgress.estimated_days_to_full_recovery} 天完全恢复
                            </p>
                            <p className="text-xs text-blue-500">
                              开始时间: {new Date(agentRecoveryProgress.started_at).toLocaleDateString('zh-CN')}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 恢复详情 */}
                      <AnimatePresence>
                        {showRecoveryDetails && agentRecoveryProgress?.details && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3 overflow-hidden"
                          >
                            <div className="h-px bg-gray-100 my-3" />

                            {/* 病灶恢复 */}
                            <div className="p-3 bg-white rounded-xl">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">病灶恢复</span>
                                <span className={`text-sm font-medium ${
                                  agentRecoveryProgress.details.lesion_recovery.percent > 0 ? 'text-emerald-600' : 'text-red-600'
                                }`}>
                                  {agentRecoveryProgress.details.lesion_recovery.percent}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(agentRecoveryProgress.details.lesion_recovery.percent, 100)}%` }}
                                  transition={{ duration: 0.8, delay: 0.5 }}
                                  className={`h-full rounded-full ${
                                    agentRecoveryProgress.details.lesion_recovery.percent > 0 ? 'bg-emerald-400' : 'bg-red-400'
                                  }`}
                                />
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                变化: {agentRecoveryProgress.details.lesion_recovery.change}
                              </p>
                            </div>

                            {/* 面积恢复 */}
                            <div className="p-3 bg-white rounded-xl">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">面积恢复</span>
                                <span className={`text-sm font-medium ${
                                  agentRecoveryProgress.details.area_recovery.percent > 0 ? 'text-blue-600' : 'text-red-600'
                                }`}>
                                  {agentRecoveryProgress.details.area_recovery.percent}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(agentRecoveryProgress.details.area_recovery.percent, 100)}%` }}
                                  transition={{ duration: 0.8, delay: 0.6 }}
                                  className={`h-full rounded-full ${
                                    agentRecoveryProgress.details.area_recovery.percent > 0 ? 'bg-blue-400' : 'bg-red-400'
                                  }`}
                                />
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                变化: {agentRecoveryProgress.details.area_recovery.change}
                              </p>
                            </div>

                            {/* 严重度恢复 */}
                            <div className="p-3 bg-white rounded-xl">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">严重度恢复</span>
                                <span className={`text-sm font-medium ${
                                  agentRecoveryProgress.details.severity_recovery.percent > 0 ? 'text-purple-600' : 'text-red-600'
                                }`}>
                                  {agentRecoveryProgress.details.severity_recovery.percent}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(agentRecoveryProgress.details.severity_recovery.percent, 100)}%` }}
                                  transition={{ duration: 0.8, delay: 0.7 }}
                                  className={`h-full rounded-full ${
                                    agentRecoveryProgress.details.severity_recovery.percent > 0 ? 'bg-purple-400' : 'bg-red-400'
                                  }`}
                                />
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                从等级 {agentRecoveryProgress.details.severity_recovery.from_level} 到等级 {agentRecoveryProgress.details.severity_recovery.to_level}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    // 分析失败或无数据
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">暂无恢复进度数据</p>
                      <button
                        onClick={fetchTrendAnalysis}
                        className="mt-2 text-xs text-blue-500 hover:text-blue-600"
                      >
                        重新分析
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* AI护理建议 - 采用简洁列表样式，可展开查看详情，按优先级排序 */}
              {sortedCareAdvice && sortedCareAdvice.length > 0 && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Shield size={18} className="text-blue-600" />
                    </div>
                    AI护理建议
                    <span className="ml-auto text-xs text-green-600 font-medium">AI生成</span>
                  </h3>

                  <div className="space-y-3">
                    {sortedCareAdvice.map((advice: CareAdviceItem, index: number) => (
                      <motion.div
                        key={advice.category}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="border border-gray-100 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggleAdvice(advice.category)}
                          className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 text-left">
                            <h4 className="font-bold text-gray-900 text-sm">{advice.title}</h4>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{advice.description}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs px-2 py-1 rounded-full ${priorityStyles[advice.priority]?.bg} ${priorityStyles[advice.priority]?.text}`}>
                              {priorityStyles[advice.priority]?.label}
                            </span>
                            {expandedAdvice.includes(advice.category) ? (
                              <ChevronUp size={16} className="text-gray-400" />
                            ) : (
                              <ChevronDown size={16} className="text-gray-400" />
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
                              <div className="p-3 bg-white border-t border-gray-100">
                                <p className="text-sm text-gray-600 mb-3">{advice.description}</p>

                                {advice.frequency && (
                                  <div className="flex items-center gap-2 mb-3 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                                    <Clock size={14} />
                                    <span>建议频率: {advice.frequency}</span>
                                  </div>
                                )}

                                <ul className="space-y-2">
                                  {advice.tips.map((tip: string, tipIndex: number) => (
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
            </>
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
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAiChat(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X size={16} className="text-gray-400" />
                </motion.button>
              </div>

              {/* 聊天消息区域 - 可独立滚动 */}
              <div className="overflow-y-auto px-4 py-3" style={{ height: '280px' }}>
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
                          {msg.content}
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
                    placeholder="输入您的问题..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400 bg-gray-50"
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white shadow-md"
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
