import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Activity, AlertCircle, BarChart3, Calendar, Droplets, History, Moon, Plus, Shield, Smile, Sun, Meh, Frown, User } from 'lucide-react';
import { Page } from '../types';

export default function Diary({
  uvLevel,
  setUvLevel,
  selectedProtections,
  setSelectedProtections,
  skinTone,
  setSkinTone,
  skinFeeling,
  setSkinFeeling,
  waterIntake,
  setWaterIntake,
  sleepQuality,
  setSleepQuality,
  isSavingDiary,
  setIsSavingDiary,
  isAddingDiary,
  setIsAddingDiary,
  diaryRecords,
  setDiaryRecords,
  setSelectedDiaryRecord,
  onNavigate,
}: {
  uvLevel: number;
  setUvLevel: (v: number) => void;
  selectedProtections: string[];
  setSelectedProtections: (v: string[]) => void;
  skinTone: number;
  setSkinTone: (v: number) => void;
  skinFeeling: string;
  setSkinFeeling: (v: string) => void;
  waterIntake: number;
  setWaterIntake: (v: number) => void;
  sleepQuality: string;
  setSleepQuality: (v: string) => void;
  isSavingDiary: boolean;
  setIsSavingDiary: (v: boolean) => void;
  isAddingDiary: boolean;
  setIsAddingDiary: (v: boolean) => void;
  diaryRecords: any[];
  setDiaryRecords: (v: any[]) => void;
  setSelectedDiaryRecord: (v: any) => void;
  onNavigate: (p: Page) => void;
}) {
  const getUvText = (level: number) => {
    if (level <= 2) return '弱';
    if (level <= 5) return '中等';
    if (level <= 7) return '强';
    return '极强';
  };
  const toggleProtection = (name: string) => {
    setSelectedProtections(selectedProtections.includes(name) ? selectedProtections.filter(p => p !== name) : [...selectedProtections, name]);
  };
  const handleSaveDiary = () => {
    setIsSavingDiary(true);
    setTimeout(() => {
      const newRecord = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        uv: uvLevel,
        water: waterIntake,
        sleep: sleepQuality,
        mood: '平静',
        skin: skinFeeling,
      };
      setDiaryRecords([newRecord, ...diaryRecords]);
      setIsSavingDiary(false);
      setIsAddingDiary(false);
    }, 1500);
  };
  const getUvColor = (level: number) => {
    if (level <= 3) return '#fbbf24';
    if (level <= 6) return '#f97316';
    return '#ef4444';
  };
  const uvColorHex = getUvColor(uvLevel);
  const uvTextClass = uvLevel > 6 ? 'text-red-500' : 'text-orange-400';
  const weeklyRecords = diaryRecords.slice(0, 7);
  const averageWater = weeklyRecords.length > 0 ? (weeklyRecords.reduce((sum, record) => sum + Number(record.water || 0), 0) / weeklyRecords.length).toFixed(1) : '--';
  const averageUv = weeklyRecords.length > 0 ? (weeklyRecords.reduce((sum, record) => sum + Number(record.uv || 0), 0) / weeklyRecords.length).toFixed(1) : '--';
  const completionPercentage = [uvLevel > 0, selectedProtections.length > 0, skinFeeling !== '', skinTone > 0, waterIntake > 0, sleepQuality !== ''].filter(Boolean).length / 6 * 100;
  return (
    <AnimatePresence mode="wait">
      {!isAddingDiary ? (
        <motion.div key="diary-list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="flex flex-col h-full bg-gray-50 pb-24 overflow-y-auto">
          <header className="pt-12 px-6 pb-6 bg-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-500 font-bold text-sm tracking-wider uppercase mb-1">Skin Diary</p>
                <h1 className="text-2xl font-bold text-gray-900">皮肤健康日记</h1>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsAddingDiary(true)} className="w-12 h-12 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center">
                <Plus size={24} />
              </motion.button>
            </div>
          </header>
          <div className="px-6 space-y-8 mt-6">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={20} className="text-indigo-500" />
                <h2 className="font-bold text-gray-700">本周统计</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                      <Droplets size={20} />
                    </div>
                    <span className="text-xs font-bold text-gray-400">平均饮水</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-gray-900">{averageWater}</span>
                    <span className="text-xs font-bold text-gray-400">杯/日</span>
                  </div>
                  <div className="mt-3 text-[10px] font-bold text-gray-400">
                    <span>{weeklyRecords.length > 0 ? `基于最近 ${weeklyRecords.length} 条记录` : '暂无数据'}</span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                      <Sun size={20} />
                    </div>
                    <span className="text-xs font-bold text-gray-400">UV 暴露</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-gray-900">{averageUv}</span>
                    <span className="text-xs font-bold text-gray-400">指数</span>
                  </div>
                  <div className="mt-3 text-[10px] font-bold text-gray-400">
                    <span>{weeklyRecords.length > 0 ? `基于最近 ${weeklyRecords.length} 条记录` : '暂无数据'}</span>
                  </div>
                </div>
              </div>
            </section>
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={20} className="text-violet-500" />
                <h2 className="font-bold text-gray-700">健康周报</h2>
              </div>
              <div className="bg-white rounded-3xl p-5 border border-dashed border-violet-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-900">周报功能开发中</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-500">敬请期待</span>
                </div>
                <p className="text-xs text-gray-400">后续将在日记页查看本周趋势、异常提醒和护理建议。</p>
              </div>
            </section>
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <History size={20} className="text-gray-400" />
                  <h2 className="font-bold text-gray-700">最近记录</h2>
                </div>
                <button className="text-xs font-bold text-blue-500">查看全部</button>
              </div>
              <div className="space-y-4">
                {diaryRecords.map((record) => (
                  <div key={record.id} onClick={() => { setSelectedDiaryRecord(record); onNavigate('diary_detail'); }} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${record.skin === '正常' ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-orange-500'}`}>
                        {record.skin === '正常' ? <Smile size={24} /> : <AlertCircle size={24} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{record.date}</h3>
                        <p className="text-xs text-gray-400 font-medium">皮肤状态: {record.skin}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-gray-300 uppercase">UV</span>
                        <span className="text-sm font-black text-gray-700">{record.uv}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-gray-300 uppercase">H2O</span>
                        <span className="text-sm font-black text-gray-700">{record.water}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </motion.div>
      ) : (
        <motion.div key="diary-add" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="flex flex-col h-full bg-gray-50 pb-24 overflow-y-auto">
          <header className="pt-12 px-6 pb-6 bg-white shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <button onClick={() => setIsAddingDiary(false)} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 active:scale-95">
                ◀
              </button>
              <div>
                <p className="text-blue-500 font-bold text-sm tracking-wider uppercase mb-1">New Entry</p>
                <h1 className="text-2xl font-bold text-gray-900">记录今日状态</h1>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <span>填写进度</span>
                <span>{Math.round(completionPercentage)}%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500" initial={{ width: 0 }} animate={{ width: `${completionPercentage}%` }} transition={{ type: 'spring', stiffness: 50, damping: 20 }} />
              </div>
            </div>
          </header>
          <div className="px-6 space-y-8 mt-6">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Sun size={20} className={uvTextClass} />
                <h2 className="font-bold text-gray-700">今日阳光强度</h2>
              </div>
              <div className="bg-white rounded-3xl p-8 border border-gray-100 flex flex-col items-center shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                <div className="relative w-56 h-56 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-50" />
                    <motion.circle cx="112" cy="112" r="100" stroke="url(#uvGradient)" strokeWidth="12" strokeDasharray="628" initial={{ strokeDashoffset: 628 }} animate={{ strokeDashoffset: 628 - (628 * uvLevel / 10) }} strokeLinecap="round" fill="transparent" transition={{ type: 'spring', stiffness: 50, damping: 15 }} />
                    <defs>
                      <linearGradient id="uvGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3 }}>
                      <Sun size={48} className={uvTextClass + ' mb-1'} />
                    </motion.div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">UV Index</span>
                    <span className="text-3xl font-black text-gray-900">{getUvText(uvLevel)}</span>
                    <span className="text-[10px] font-bold text-gray-400 mt-1">{uvLevel}/10</span>
                  </div>
                </div>
                <div className="w-full mt-10 space-y-3">
                  <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden p-0.5 border border-gray-100">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600" initial={{ width: 0 }} animate={{ width: `${uvLevel * 10}%` }} transition={{ type: 'spring', stiffness: 50 }} />
                  </div>
                  <input type="range" min="0" max="10" value={uvLevel} onChange={(e) => setUvLevel(parseInt(e.target.value))} className="w-full opacity-0 absolute h-3 cursor-pointer z-10" />
                  <div className="w-full flex justify-between px-1 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                    <span className={uvLevel <= 2 ? 'text-yellow-500' : ''}>弱</span>
                    <span className={uvLevel > 2 && uvLevel <= 5 ? 'text-orange-500' : ''}>中</span>
                    <span className={uvLevel > 5 && uvLevel <= 8 ? 'text-red-500' : ''}>强</span>
                    <span className={uvLevel > 8 ? 'text-red-700' : ''}>极强</span>
                  </div>
                </div>
              </div>
            </section>
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Shield size={20} className="text-blue-500" />
                <h2 className="font-bold text-gray-700">防晒措施</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: '防晒霜', icon: Droplets },
                  { name: '遮阳伞', icon: Calendar },
                  { name: '防晒衣/帽', icon: User },
                  { name: '墨镜', icon: Activity },
                ].map((item) => {
                  const isActive = selectedProtections.includes(item.name);
                  return (
                    <button key={item.name} onClick={() => toggleProtection(item.name)} className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all duration-300 border-2 ${isActive ? 'bg-blue-50 border-blue-500 shadow-md shadow-blue-100' : 'bg-white border-gray-100 hover:border-blue-200'}`}>
                      <item.icon size={32} className={isActive ? 'text-blue-500' : 'text-gray-300'} />
                      <span className={`text-xs font-bold ${isActive ? 'text-blue-500' : 'text-gray-400'}`}>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </section>
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Activity size={20} className="text-emerald-500" />
                <h2 className="font-bold text-gray-700">皮肤感受</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {['正常', '干燥', '油腻', '瘙痒', '泛红', '紧绷'].map((feeling) => (
                  <button key={feeling} onClick={() => setSkinFeeling(feeling)} className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${skinFeeling === feeling ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-white text-gray-400 border border-gray-100'}`}>
                    {feeling}
                  </button>
                ))}
              </div>
            </section>
            <section>
              <div className="flex items-center gap-2 mb-4">
                <User size={20} className="text-amber-600" />
                <div className="flex items-center justify-between w-full">
                  <h2 className="font-bold text-gray-700">今日皮肤颜色</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-amber-600/40 uppercase tracking-tighter">Tone Index: {skinTone}</span>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                      {skinTone < 20 ? '非常白皙' : skinTone < 40 ? '白皙' : skinTone < 60 ? '自然' : skinTone < 80 ? '小麦色' : '深褐色'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <div className="h-24 w-full rounded-2xl bg-gray-50 relative overflow-hidden shadow-inner border border-gray-100">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FFDBAC] via-[#E0AC69] to-[#8D5524] opacity-20" />
                  <motion.div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#FFDBAC] via-[#E0AC69] to-[#8D5524] z-0" initial={{ width: 0 }} animate={{ width: `${skinTone}%` }} transition={{ type: 'spring', damping: 20 }} style={{ backgroundSize: '100% 100%' }} />
                  <motion.div className="absolute top-0 bottom-0 w-2 bg-white shadow-[0_0_15px_rgba(0,0,0,0.4)] z-10 pointer-events-none" animate={{ left: `${skinTone}%` }} transition={{ type: 'spring', damping: 20 }}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border-4 border-amber-600 shadow-xl flex items-center justify-center">
                      <div className="w-2 h-2 bg-amber-600 rounded-full" />
                    </div>
                  </motion.div>
                  <input type="range" min="0" max="100" value={skinTone} onChange={(e) => setSkinTone(parseInt(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30" />
                  <div className="absolute inset-0 flex justify-between px-6 items-center opacity-10 pointer-events-none z-20">
                    {[...Array(10)].map((_, i) => (<div key={i} className="w-px h-8 bg-black" />))}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#FFDBAC] border-2 border-white shadow-sm" />
                    <span>Fair</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Deep</span>
                    <div className="w-5 h-5 rounded-full bg-[#8D5524] border-2 border-white shadow-sm" />
                  </div>
                </div>
              </div>
            </section>
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Droplets size={20} className="text-blue-400" />
                <h2 className="font-bold text-gray-700">饮水量 (杯)</h2>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <button key={num} onClick={() => setWaterIntake(num)} className={`w-8 h-10 rounded-lg flex items-center justify-center transition-all ${waterIntake >= num ? 'bg-blue-500 text-white shadow-lg shadow-blue-100' : 'bg-gray-50 text-gray-300'}`}>
                        <Droplets size={16} />
                      </button>
                    ))}
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-blue-500">{waterIntake}</span>
                    <span className="text-xs font-bold text-gray-300 ml-1">/ 8</span>
                  </div>
                </div>
                <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden p-0.5 border border-gray-100">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-blue-300 via-blue-500 to-indigo-600" initial={{ width: 0 }} animate={{ width: `${(waterIntake / 8) * 100}%` }} transition={{ type: 'spring', stiffness: 50 }} />
                </div>
              </div>
            </section>
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Moon size={20} className="text-indigo-400" />
                <h2 className="font-bold text-gray-700">睡眠质量</h2>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { name: '糟糕', icon: Frown, color: 'text-red-400', bg: 'bg-red-50', value: 33 },
                    { name: '一般', icon: Meh, color: 'text-orange-400', bg: 'bg-orange-50', value: 66 },
                    { name: '良好', icon: Smile, color: 'text-emerald-400', bg: 'bg-emerald-50', value: 100 },
                  ].map((item) => (
                    <button key={item.name} onClick={() => setSleepQuality(item.name)} className={`p-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${sleepQuality === item.name ? `${item.bg} border-current ${item.color} shadow-lg` : 'bg-white border-gray-100 text-gray-300'}`}>
                      <item.icon size={32} />
                      <span className="text-xs font-bold">{item.name}</span>
                    </button>
                  ))}
                </div>
                {sleepQuality && (
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                      <motion.div className={`h-full bg-gradient-to-r ${sleepQuality === '糟糕' ? 'from-red-400 to-red-600' : sleepQuality === '一般' ? 'from-orange-400 to-orange-600' : 'from-emerald-400 to-emerald-600'}`} initial={{ width: 0 }} animate={{ width: sleepQuality === '糟糕' ? '33%' : sleepQuality === '一般' ? '66%' : '100%' }} transition={{ type: 'spring', stiffness: 50 }} />
                    </div>
                  </div>
                )}
              </div>
            </section>
            <button onClick={handleSaveDiary} disabled={isSavingDiary} className={`w-full py-4 font-bold rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${isSavingDiary ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-blue-500 text-white shadow-blue-200 active:scale-95'}`}>
              {isSavingDiary ? <>✔<span>保存成功</span></> : <span>保存今日记录</span>}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
