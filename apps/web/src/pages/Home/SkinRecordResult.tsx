import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Calendar, Sun, Droplets, Loader2, Edit3 } from 'lucide-react';

interface SkinRecordResultProps {
  capturedImage: string | null;
  onSave: () => void;
  onNavigate: (page: any) => void;
  isSaving: boolean;
}

export default function SkinRecordResult({
  capturedImage,
  onSave,
  onNavigate,
  isSaving,
}: SkinRecordResultProps) {
  const [note, setNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const tags = [
    { id: 'morning', label: '晨间', icon: Sun },
    { id: 'evening', label: '晚间', icon: Droplets },
    { id: 'after-sun', label: '晒后', icon: Sun },
    { id: 'after-treatment', label: '护理后', icon: CheckCircle2 },
  ];

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const currentDate = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-blue-50/20 via-white to-white pb-40">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white/80 backdrop-blur-xl p-4 border-b border-gray-100">
        <button onClick={() => onNavigate('home')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-gray-900">皮肤状态记录</h2>
        <div className="w-10" />
      </header>

      <div className="p-5 space-y-5">
        {/* Photo Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl bg-white p-4 shadow-lg shadow-blue-100/50 border border-blue-50"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-blue-500 rounded-full" />
            <h3 className="font-bold text-gray-900">拍摄照片</h3>
          </div>
          <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100">
            {capturedImage && (
              <img src={capturedImage} alt="Skin record" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
            <Calendar size={14} />
            <span>{currentDate}</span>
          </div>
        </motion.div>

        {/* Quality Assessment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-3xl bg-gradient-to-r from-blue-500 to-blue-600 p-5 text-white shadow-lg shadow-blue-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 className="font-bold">照片质量良好</h3>
              <p className="text-blue-100 text-xs">光线充足，清晰度达标</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/10 rounded-xl p-2">
              <p className="text-lg font-bold">92</p>
              <p className="text-[10px] text-blue-100">清晰度</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2">
              <p className="text-lg font-bold">88</p>
              <p className="text-[10px] text-blue-100">光线</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2">
              <p className="text-lg font-bold">95</p>
              <p className="text-[10px] text-blue-100">构图</p>
            </div>
          </div>
        </motion.div>

        {/* Tags Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-3xl bg-white p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-blue-500 rounded-full" />
            <h3 className="font-bold text-gray-900">记录标签</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const Icon = tag.icon;
              const isSelected = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={14} />
                  {tag.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Note Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-3xl bg-white p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-blue-500 rounded-full" />
            <h3 className="font-bold text-gray-900">备注</h3>
          </div>
          <div className="relative">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="记录今天的皮肤状态、使用的护肤品或任何观察..."
              className="w-full h-24 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
            />
            <Edit3 size={16} className="absolute top-4 right-4 text-gray-400" />
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="rounded-2xl bg-blue-50 p-4 border border-blue-100"
        >
          <p className="text-xs text-blue-600 leading-relaxed">
            <span className="font-semibold">提示：</span>
            定期记录皮肤状态有助于追踪肌肤变化趋势。建议每周在相同条件下拍摄对比照片。
          </p>
        </motion.div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-4 left-1/2 z-20 flex w-[calc(100%-24px)] max-w-[calc(28rem-24px)] -translate-x-1/2 gap-3 rounded-[28px] border border-gray-100 bg-white p-4 shadow-[0_28px_80px_rgba(15,23,42,0.12)]">
        <button 
          onClick={() => onNavigate('home')} 
          className="px-6 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-2xl active:scale-95 transition-transform"
        >
          取消
        </button>
        <button 
          onClick={onSave} 
          disabled={isSaving}
          className="flex-1 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSaving ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              保存中...
            </>
          ) : (
            '保存到日记'
          )}
        </button>
      </div>
    </div>
  );
}
