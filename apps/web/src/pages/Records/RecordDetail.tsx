import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, Shield, History, Bot, Send, User, 
  Phone, FileText, X
} from 'lucide-react';
import { Record } from '../../types';
import BackButton from '../../components/common/BackButton';

interface RecordDetailProps {
  record: Record | null;
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

// 历史记录完整数据结构
interface HistoryRecord {
  id: string;
  date: string;
  type: string;
  result: string;
  status: '恢复中' | '待复查' | '已结束';
  probability: number;
  progress: number;
  careAdvice: { title: string; desc: string }[];
}

// 模拟历史记录数据
const MOCK_HISTORY: HistoryRecord[] = [
  { 
    id: '1', 
    date: '01-15', 
    type: '识别', 
    result: '特应性皮炎',
    status: '待复查',
    probability: 85,
    progress: 30,
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
    result: '症状缓解',
    status: '恢复中',
    probability: 72,
    progress: 55,
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
    result: '过敏性皮炎',
    status: '已结束',
    probability: 91,
    progress: 100,
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



export default function RecordDetail({ record, onBack, onNavigate }: RecordDetailProps) {
  const [showAiChat, setShowAiChat] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState(MOCK_AI_CHAT);
  const [currentRecord, setCurrentRecord] = useState<Record | null>(record);
  const [currentHistory, setCurrentHistory] = useState<HistoryRecord | null>(null);

  if (!record) return null;

  // 处理历史记录点击，切换到对应的历史档案
  const handleHistoryClick = (historyItem: HistoryRecord) => {
    // 创建历史记录对应的档案数据
    const historyRecord: Record = {
      id: historyItem.id,
      title: historyItem.result,
      date: `2024-${historyItem.date}`,
      status: historyItem.status,
      probability: historyItem.probability,
      image: record.image, // 复用当前档案的图片
      typicalImage: record.typicalImage, // 复用当前档案的典型图片
    };
    setCurrentRecord(historyRecord);
    setCurrentHistory(historyItem);
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

      <main className="flex-1 p-5">
        {/* 档案标题区 - 简洁文字 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
            <span className="mx-1">·</span>
            <span>2024年{displayRecord.date}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{displayRecord.title}</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-blue-600 font-bold">{displayRecord.probability}% 匹配度</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
              {displayRecord.status}
            </span>
          </div>
        </motion.div>

        {/* 历史记录 - 小按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-5"
        >
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <History size={16} />
              <span>历史记录</span>
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
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {MOCK_HISTORY.map((item) => (
                    <motion.button
                      key={item.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleHistoryClick(item)}
                      className={`flex-shrink-0 px-4 py-3 rounded-xl border text-left transition-colors ${
                        displayRecord.id === item.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400">{item.date}</span>
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{item.result}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 恢复进度 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-5"
        >
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" />
            恢复进度
          </h3>
          <div className="p-4">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>开始治疗</span>
              <span>完全恢复</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
              <motion.div 
                key={currentHistory?.id ?? 'default'}
                initial={{ width: 0 }}
                animate={{ width: `${currentHistory?.progress ?? 65}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-400 mb-4">
              {currentHistory?.progress === 100 
                ? '已完全恢复' 
                : `预计还需 ${Math.ceil((100 - (currentHistory?.progress ?? 65)) / 10)} 周完全恢复`}
            </p>

            {/* AI 诊断 - 在恢复进度卡片内 */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-3 border border-purple-100">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {currentHistory?.progress === 100 
                      ? '恭喜！您的皮肤已经完全恢复。建议继续保持良好的护肤习惯，定期进行皮肤检查，预防复发。'
                      : currentHistory?.progress && currentHistory.progress > 70
                        ? '恢复情况良好！皮肤状态明显改善，请继续按照当前治疗方案进行护理，注意防晒和保湿。'
                        : currentHistory?.progress && currentHistory.progress > 40
                          ? '恢复进度正常，皮肤正在逐步好转。建议继续坚持治疗，避免接触刺激性物质，保持良好的作息习惯。'
                          : '治疗初期，皮肤正在适应治疗方案。请耐心配合治疗，如有不适请及时咨询医生。'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 护理建议 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-5"
        >
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Shield size={16} className="text-blue-500" />
            护理建议
          </h3>
          <div className="space-y-2">
            {(currentHistory?.careAdvice ?? [
              { title: '保持清洁', desc: '每日用温水清洁患处，避免使用刺激性洗护用品' },
              { title: '按时用药', desc: '按照医嘱涂抹药膏，不要自行增减用量' },
              { title: '避免刺激', desc: '避免抓挠患处，穿着宽松透气的衣物' },
            ]).map((item, idx) => (
              <motion.div 
                key={`${currentHistory?.id ?? 'default'}-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="flex gap-3 p-3"
              >
                <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
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
