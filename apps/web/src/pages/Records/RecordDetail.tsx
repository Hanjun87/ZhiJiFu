import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, TrendingUp, Shield, History, Bot, Send, User, 
  Phone, FileText
} from 'lucide-react';
import { Record } from '../../types';

interface RecordDetailProps {
  record: Record | null;
  onBack: () => void;
}

// 模拟历史记录数据
const MOCK_HISTORY = [
  { id: '1', date: '01-15', type: '识别', result: '特应性皮炎' },
  { id: '2', date: '01-10', type: '复诊', result: '症状缓解' },
  { id: '3', date: '01-05', type: '识别', result: '过敏性皮炎' },
];

// 模拟AI对话历史
const MOCK_AI_CHAT = [
  { role: 'user', content: '我的皮炎什么时候能好？', time: '14:32' },
  { role: 'ai', content: '根据您的恢复进度，预计还需要2-3周时间。请继续按照医嘱用药。', time: '14:32' },
];



export default function RecordDetail({ record, onBack }: RecordDetailProps) {
  const [showAiChat, setShowAiChat] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState(MOCK_AI_CHAT);

  if (!record) return null;

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
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
          </motion.button>
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
            <FileText size={14} />
            <span>档案编号 #{record.id.slice(-6)}</span>
            <span className="mx-1">·</span>
            <span>{record.date}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{record.title}</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-blue-600 font-bold">{record.probability}% 匹配度</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
              {record.status}
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
                    <div
                      key={item.id}
                      className="flex-shrink-0 px-4 py-3 bg-white rounded-xl border border-gray-100"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400">{item.date}</span>
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{item.result}</p>
                    </div>
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
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>开始治疗</span>
              <span className="text-emerald-600 font-medium">65%</span>
              <span>完全恢复</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-400">预计还需 2 周完全恢复</p>
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
            {[
              { title: '保持清洁', desc: '每日用温水清洁患处，避免使用刺激性洗护用品' },
              { title: '按时用药', desc: '按照医嘱涂抹药膏，不要自行增减用量' },
              { title: '避免刺激', desc: '避免抓挠患处，穿着宽松透气的衣物' },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100">
                <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI对话区域 - 非卡片形式 */}
        <AnimatePresence>
          {showAiChat && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-5"
            >
              {/* AI医生标题 */}
              <div className="flex items-center gap-2 mb-3">
                <Bot size={18} className="text-purple-600" />
                <h3 className="text-sm font-bold text-gray-900">AI 智能医生</h3>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
              
              {/* 聊天消息 - 无边框背景 */}
              <div className="space-y-3 mb-3">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'user' ? 'bg-gray-200' : 'bg-purple-100'
                    }`}>
                      {msg.role === 'user' ? <User size={16} className="text-gray-600" /> : <Bot size={16} className="text-purple-600" />}
                    </div>
                    <div className={`max-w-[75%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block px-3 py-2 rounded-2xl text-sm ${
                        msg.role === 'user' 
                          ? 'bg-blue-500 text-white rounded-br-md' 
                          : 'bg-white text-gray-700 rounded-bl-md border border-gray-100'
                      }`}>
                        {msg.content}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 输入框 - 简洁样式 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="输入您的问题..."
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400 bg-white"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white shadow-md"
                >
                  <Send size={18} />
                </motion.button>
              </div>
            </motion.div>
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
