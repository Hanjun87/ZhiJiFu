import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, CheckCircle2, Calendar, Sun, Droplets, Loader2, 
  Sparkles, Shield, Edit3, ChevronRight, Save, Plus, X
} from 'lucide-react';

interface SkinRecordResultProps {
  capturedImage: string | null;
  onSave: () => void;
  onNavigate: (page: any) => void;
  isSaving: boolean;
}

interface CareItem {
  id: string;
  title: string;
  desc: string;
  checked: boolean;
}

export default function SkinRecordResult({
  capturedImage,
  onSave,
  onNavigate,
  isSaving,
}: SkinRecordResultProps) {
  const [note, setNote] = useState('');
  
  // 可调控的肤色和UV指数
  const [skinToneValue, setSkinToneValue] = useState(30);
  const [uvIndex, setUvIndex] = useState(2);
  
  // 护理项目列表（用户可自己添加）
  const [careItems, setCareItems] = useState<CareItem[]>([
    { id: '1', title: '维A乳膏', desc: '局部涂抹 · 睡前使用', checked: true },
    { id: '2', title: '修护精华液', desc: '全脸涂抹 · 早晚各一次', checked: false },
  ]);
  const [newCareTitle, setNewCareTitle] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  // 根据滑块值计算肤色标签
  const getSkinToneLabel = (value: number) => {
    if (value < 20) return { label: '很浅', color: '#F9E4D4' };
    if (value < 40) return { label: '中等偏浅', color: '#F3D0B5' };
    if (value < 60) return { label: '中等', color: '#E1AC88' };
    if (value < 80) return { label: '中等偏深', color: '#C58351' };
    return { label: '深', color: '#8D5524' };
  };

  const skinTone = getSkinToneLabel(skinToneValue);

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

  const currentDate = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // 皮肤指标数据
  const skinMetrics = [
    { label: '色斑', value: 65 },
    { label: '黑头', value: 45 },
    { label: '眼袋', value: 30 },
    { label: '黑眼圈', value: 55 },
    { label: '痘痘', value: 25 },
  ];

  const skinAge = 20;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16 border-b border-gray-100">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('home')}
          className="hover:bg-gray-100 transition-colors p-2 rounded-full flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-blue-600" />
        </motion.button>
        <h1 className="font-bold text-lg tracking-tight text-gray-900">今日报告</h1>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          className="hover:bg-gray-100 transition-colors p-2 rounded-full flex items-center justify-center"
        >
          <Save size={20} className="text-blue-600" />
        </motion.button>
      </header>

      <main className="pt-20 pb-8 px-5 max-w-2xl mx-auto space-y-6">
        {/* 1. 皮肤表现 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-blue-600" />
              <h2 className="font-bold text-gray-900">皮肤表现</h2>
            </div>

            {/* Photo Preview */}
            {capturedImage && (
              <div className="w-full aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-4">
                <img src={capturedImage} alt="Skin record" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Key Metrics Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {skinMetrics.map((metric) => (
                <span key={metric.label} className="px-3 py-1 bg-gray-100 text-[10px] font-bold text-gray-600 rounded-full">
                  {metric.label}
                </span>
              ))}
            </div>

            {/* Radar Visualization Placeholder */}
            <div className="relative w-full max-w-[200px] aspect-square mx-auto flex items-center justify-center mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center">
                  <div className="w-3/4 h-3/4 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center">
                    <div className="w-1/2 h-1/2 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center">
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-lg border border-blue-100">
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">肌龄</span>
                <span className="block text-xl font-extrabold text-blue-600">{skinAge}<span className="text-xs font-medium ml-0.5">岁</span></span>
              </div>
            </div>

            {/* Findings Text */}
            <p className="text-gray-500 leading-relaxed text-sm text-center">
              今日皮肤屏障稳定，泛红现象已基本消失。
            </p>
          </div>
        </motion.section>

        {/* 2. 护理建议 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={18} className="text-blue-600" />
              <h2 className="font-bold text-gray-900">护理建议</h2>
            </div>

            <div className="space-y-3">
              {[
                { icon: Shield, title: '屏障修护', desc: '建议使用含神经酰胺的修护产品' },
                { icon: Droplets, title: '保湿补水', desc: '肌肤水分含量偏低，需加强保湿' },
                { icon: Sun, title: '严格防晒', desc: '紫外线指数较高，注意防晒保护' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-2xl">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <item.icon size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 3. 今日肤色 - 可调控 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">今日肤色</h3>
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">可调控</span>
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

        {/* 4. 今日太阳强度 - 可调控 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">今日太阳强度</h3>
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">可调控</span>
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
                    stroke={uvIndex <= 2 ? '#FFA500' : uvIndex <= 5 ? '#FF6B00' : '#FF0000'}
                    strokeDasharray="251.2"
                    strokeLinecap="round"
                    strokeWidth="8"
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * (uvIndex / 11)) }}
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
                    {uvIndex <= 2 ? '弱' : uvIndex <= 5 ? '中' : '强'}
                  </span>
                </div>
              </div>
              
              {/* UV指数滑块 */}
              <div className="flex-1 ml-4 space-y-3">
                <input
                  type="range"
                  min="0"
                  max="11"
                  step="1"
                  value={uvIndex}
                  onChange={(e) => setUvIndex(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>0</span>
                  <span>5</span>
                  <span>11</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                    <span className="text-xs font-medium text-gray-700">低强度 (0-2)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-xs font-medium text-gray-700">中强度 (3-5)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-xs font-medium text-gray-700">高强度 (6+)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 5. 今日护理与用药 - 用户自己添加 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-blue-600" />
                <h3 className="font-bold text-gray-900">今日护理与用药</h3>
              </div>
              <span className="text-xs text-blue-600 font-semibold">{careItems.filter(i => i.checked).length}/{careItems.length} 已完成</span>
            </div>

            {/* 护理项目列表 */}
            <div className="space-y-2 mb-3">
              {careItems.map((item) => (
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
              ))}
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

        {/* 6. 备注 */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Edit3 size={18} className="text-blue-600" />
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

        {/* 7. AI咨询入口 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <button className="w-full flex items-center justify-between p-5 bg-blue-50 border border-blue-100 rounded-2xl hover:bg-blue-100/50 transition-colors active:scale-[0.98] duration-200">
            <div className="flex items-center space-x-4 text-left">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Sparkles size={24} className="text-blue-600 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-blue-600">与医生深入沟通</h4>
                <p className="text-xs text-blue-500/70 font-medium">获取针对您当前肤况的专业建议</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-blue-400" />
          </button>
        </motion.div>

        {/* 8. 底部操作按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="pt-4 pb-8"
        >
          <div className="flex gap-3">
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('home')} 
              className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl active:scale-95 transition-transform"
            >
              取消
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={onSave} 
              disabled={isSaving}
              className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  保存中...
                </>
              ) : (
                <>
                  <Save size={18} />
                  保存至日记
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
