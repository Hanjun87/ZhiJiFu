import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Calendar, Clock, Camera, TrendingUp, Sparkles,
  Droplets, Sun, Thermometer, Wind, Shield, Bot, Send, User,
  ChevronRight, CheckCircle2, Plus, X, Edit3, Info
} from 'lucide-react';

interface DiaryDetailProps {
  entry: {
    id: string;
    date: string;
    time: string;
    title: string;
    status: string;
    image: string;
  } | null;
  onBack: () => void;
}

// 模拟AI对话历史
const MOCK_AI_CHAT = [
  { role: 'user', content: '今天的皮肤状态怎么样？', time: '14:32' },
  { role: 'ai', content: '根据今天的记录，您的皮肤水润度和光泽度都有提升，继续保持当前护肤习惯。', time: '14:32' },
];

// 皮肤指标数据
const skinMetrics = [
  { label: '色斑', value: 65, detail: '检测到轻度色斑，建议注意防晒并使用美白产品' },
  { label: '黑头', value: 45, detail: 'T区有少量黑头，建议定期清洁毛孔' },
  { label: '眼袋', value: 30, detail: '眼袋轻微，建议保证充足睡眠' },
  { label: '黑眼圈', value: 55, detail: '黑眼圈中度，建议改善作息并使用眼霜' },
  { label: '痘痘', value: 25, detail: '皮肤状态良好，无明显痘痘问题' },
];

// 皮肤评分
const skinScores = [
  { label: '水润度', value: 85, color: 'bg-blue-500' },
  { label: '光泽度', value: 78, color: 'bg-amber-500' },
  { label: '细腻度', value: 82, color: 'bg-emerald-500' },
];

// 环境数据
const envData = {
  weather: '晴朗',
  temperature: '22°C',
  humidity: '45%',
  uv: '中等',
  uvIndex: 3,
};

// 护理项目类型
interface CareItem {
  id: string;
  title: string;
  desc: string;
  checked: boolean;
}

export default function DiaryDetail({ entry, onBack }: DiaryDetailProps) {
  const [showAiChat, setShowAiChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState(MOCK_AI_CHAT);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [note, setNote] = useState('今天皮肤状态不错，早上用了新的精华，感觉吸收很好。晚上记得早点休息。');
  const [isEditingNote, setIsEditingNote] = useState(false);

  // 肤色滑块
  const [skinToneValue, setSkinToneValue] = useState(30);
  const getSkinToneLabel = (value: number) => {
    if (value < 20) return { label: '很浅', color: '#F9E4D4' };
    if (value < 40) return { label: '中等偏浅', color: '#F3D0B5' };
    if (value < 60) return { label: '中等', color: '#E1AC88' };
    if (value < 80) return { label: '中等偏深', color: '#C58351' };
    return { label: '深', color: '#8D5524' };
  };
  const skinTone = getSkinToneLabel(skinToneValue);

  // 护理项目（初始为空，用户自己添加）
  const [careItems, setCareItems] = useState<CareItem[]>([]);
  const [showAddCare, setShowAddCare] = useState(false);
  const [newCareTitle, setNewCareTitle] = useState('');
  const [newCareTime, setNewCareTime] = useState('');
  const [newCareType, setNewCareType] = useState('');

  // 添加护肤项目
  const handleAddCareItem = () => {
    if (!newCareTitle.trim()) return;
    const newItem: CareItem = {
      id: Date.now().toString(),
      title: newCareTitle,
      desc: `${newCareTime || '--:--'} · ${newCareType || '护肤'}`,
      checked: false,
    };
    setCareItems([...careItems, newItem]);
    setNewCareTitle('');
    setNewCareTime('');
    setNewCareType('');
    setShowAddCare(false);
  };

  // 删除护肤项目
  const handleDeleteCareItem = (id: string) => {
    setCareItems(careItems.filter(item => item.id !== id));
  };

  if (!entry) {
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
            <h1 className="text-lg font-bold text-gray-900">日记详情</h1>
            <div className="w-10" />
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

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
        content: '我已收到您的问题，根据您的皮肤日记记录，建议继续保持当前的护肤习惯。', 
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, aiReply]);
    }, 1000);
  };

  const toggleCareItem = (id: string) => {
    setCareItems(careItems.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
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
          <h1 className="text-lg font-bold text-gray-900">皮肤日记</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 p-5 pb-32">
        {/* 1. 日期与状态卡片 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-5"
        >
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-blue-100" />
                  <span className="text-blue-100 text-xs">AI 皮肤分析</span>
                </div>
                <h2 className="text-3xl font-bold">{entry.date}</h2>
                <div className="flex items-center gap-2 mt-2 text-blue-100">
                  <Clock size={16} />
                  <span className="text-sm">{entry.time}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex flex-col items-center justify-center mb-2">
                  <span className="text-2xl font-bold">{entry.date.split('月')[1].replace('日', '')}</span>
                  <span className="text-xs">{entry.date.split('月')[0]}月</span>
                </div>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                  {entry.status}
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 2. 皮肤照片 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-5"
        >
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Camera size={18} className="text-blue-500" />
                </div>
                <h3 className="font-bold text-gray-900">皮肤照片</h3>
              </div>
            </div>
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
              <img src={entry.image} alt="皮肤记录" className="w-full h-full object-cover" />
            </div>
            <p className="text-sm text-gray-600 mt-4 leading-relaxed">
              {entry.title}，皮肤整体状态良好，继续保持当前护肤习惯。
            </p>
          </div>
        </motion.section>

        {/* 3. 皮肤表现 - 可点击指标 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-5"
        >
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                <Sparkles size={18} className="text-purple-500" />
              </div>
              <h3 className="font-bold text-gray-900">皮肤表现</h3>
            </div>

            {/* 指标标签 */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {skinMetrics.map((metric) => (
                <motion.button
                  key={metric.label}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMetric(selectedMetric === metric.label ? null : metric.label)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${
                    selectedMetric === metric.label
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {metric.label} {metric.value}%
                </motion.button>
              ))}
            </div>

            {/* 选中指标详情 */}
            <AnimatePresence>
              {selectedMetric && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-purple-700">{selectedMetric}</span>
                      <span className="text-xs text-purple-500">
                        {skinMetrics.find(m => m.label === selectedMetric)?.value}%
                      </span>
                    </div>
                    <p className="text-xs text-purple-600 leading-relaxed">
                      {skinMetrics.find(m => m.label === selectedMetric)?.detail}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* 4. 皮肤评分 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-5"
        >
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                <TrendingUp size={18} className="text-emerald-500" />
              </div>
              <h3 className="font-bold text-gray-900">皮肤评分</h3>
            </div>

            <div className="space-y-4">
              {skinScores.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className="text-sm font-bold text-gray-900">{item.value}分</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + idx * 0.1 }}
                      className={`h-full ${item.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 5. 今日肤色 - 可调控 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-5"
        >
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">今日肤色</h3>
              <span className="text-sm font-medium text-gray-500">{skinTone.label}</span>
            </div>
            
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
            
            <div className="flex justify-between text-[10px] font-bold text-gray-400 px-1 mt-2">
              <span>浅色</span>
              <span>深色</span>
            </div>
          </div>
        </motion.section>

        {/* 6. 当日环境 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mb-5"
        >
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                <Sun size={18} className="text-amber-500" />
              </div>
              <h3 className="font-bold text-gray-900">当日环境</h3>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <Sun size={20} className="text-amber-500 mx-auto mb-1" />
                <p className="text-xs text-gray-400">天气</p>
                <p className="text-sm font-bold text-gray-900">{envData.weather}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <Thermometer size={20} className="text-red-500 mx-auto mb-1" />
                <p className="text-xs text-gray-400">温度</p>
                <p className="text-sm font-bold text-gray-900">{envData.temperature}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <Droplets size={20} className="text-blue-500 mx-auto mb-1" />
                <p className="text-xs text-gray-400">湿度</p>
                <p className="text-sm font-bold text-gray-900">{envData.humidity}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <Wind size={20} className="text-purple-500 mx-auto mb-1" />
                <p className="text-xs text-gray-400">紫外线</p>
                <p className="text-sm font-bold text-gray-900">{envData.uv}</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 7. 护肤记录清单 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-5"
        >
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                  <CheckCircle2 size={18} className="text-blue-500" />
                </div>
                <h3 className="font-bold text-gray-900">护肤记录</h3>
              </div>
              <div className="flex items-center gap-2">
                {careItems.length > 0 && (
                  <span className="text-xs text-blue-600 font-semibold">
                    {careItems.filter(i => i.checked).length}/{careItems.length} 已完成
                  </span>
                )}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddCare(!showAddCare)}
                  className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"
                >
                  <Plus size={16} />
                </motion.button>
              </div>
            </div>

            {/* 添加新护肤项目表单 */}
            <AnimatePresence>
              {showAddCare && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="p-4 bg-blue-50 rounded-xl space-y-3">
                    <input
                      type="text"
                      value={newCareTitle}
                      onChange={(e) => setNewCareTitle(e.target.value)}
                      placeholder="护肤产品名称"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
                    />
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={newCareTime}
                        onChange={(e) => setNewCareTime(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
                      />
                      <input
                        type="text"
                        value={newCareType}
                        onChange={(e) => setNewCareType(e.target.value)}
                        placeholder="类型（如：清洁、保湿）"
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddCareItem}
                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                      >
                        添加
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAddCare(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm"
                      >
                        取消
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 护肤项目列表 */}
            <div className="space-y-2">
              {careItems.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-sm">
                  还没有护肤记录，点击 + 添加
                </div>
              ) : (
                careItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group">
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
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteCareItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
                    >
                      <X size={16} />
                    </motion.button>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.section>

        {/* 8. 备注 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mb-5"
        >
          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-amber-600" />
                <h3 className="font-bold text-gray-900">今日备注</h3>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditingNote(!isEditingNote)}
                className="text-xs text-amber-600 font-medium"
              >
                {isEditingNote ? '保存' : '编辑'}
              </motion.button>
            </div>
            {isEditingNote ? (
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full h-20 p-3 rounded-xl bg-white border border-amber-200 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            ) : (
              <p className="text-sm text-gray-600 leading-relaxed">
                {note}
              </p>
            )}
          </div>
        </motion.section>

        {/* 9. AI对话区域 */}
        <AnimatePresence>
          {showAiChat && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-5"
            >
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Bot size={18} className="text-purple-600" />
                  <h3 className="font-bold text-gray-900">AI 智能医生</h3>
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>
                
                <div className="space-y-3 mb-4">
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
                            : 'bg-gray-50 text-gray-700 rounded-bl-md border border-gray-100'
                        }`}>
                          {msg.content}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
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
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* 底部常驻按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4">
        <div className="flex gap-3 max-w-md mx-auto">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAiChat(!showAiChat)}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
              showAiChat 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-purple-500 text-white shadow-md shadow-purple-200'
            }`}
          >
            <Bot size={18} />
            <span>{showAiChat ? '关闭对话' : 'AI医生'}</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-200"
          >
            <Edit3 size={18} />
            <span>编辑日记</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
