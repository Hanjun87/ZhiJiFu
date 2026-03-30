import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, TrendingUp, Calendar, Clock, Shield, FileText, Activity, ChevronRight } from 'lucide-react';
import { Record } from '../../types';

export default function RecordDetail({
  record,
  onBack,
}: {
  record: Record | null;
  onBack: () => void;
}) {
  if (!record) return null;

  // 模拟历史记录数据
  const historyData = [
    { date: '01-15', value: 75 },
    { date: '01-10', value: 68 },
    { date: '01-05', value: 62 },
    { date: '12-28', value: 55 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Header - 简洁风格 */}
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

      <main className="p-5">
        {/* 顶部信息卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white mb-5 shadow-lg shadow-blue-200"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-blue-100 text-xs font-medium mb-1">诊断结果</p>
              <h2 className="text-2xl font-bold">{record.title}</h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Activity size={24} />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-white/10 rounded-2xl p-3">
              <p className="text-blue-100 text-xs mb-1">AI 置信度</p>
              <p className="text-2xl font-bold">{record.probability}%</p>
            </div>
            <div className="flex-1 bg-white/10 rounded-2xl p-3">
              <p className="text-blue-100 text-xs mb-1">记录时间</p>
              <p className="text-sm font-medium">{record.date}</p>
            </div>
          </div>
        </motion.div>

        {/* 恢复进度 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                <TrendingUp size={18} className="text-emerald-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">恢复进度</h3>
                <p className="text-xs text-gray-400">持续跟踪中</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
              恢复中
            </span>
          </div>

          {/* 进度条 */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>开始治疗</span>
              <span>完全恢复</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">预计还需 2 周完全恢复</p>
          </div>

          {/* 历史趋势 */}
          <div className="flex items-end gap-2 h-16 pt-2">
            {historyData.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${item.value}%` }}
                  transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
                  className="w-full max-w-[32px] bg-blue-100 rounded-t-lg relative"
                >
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-lg"
                    style={{ height: `${(item.value / 100) * 100}%` }}
                  />
                </motion.div>
                <span className="text-[10px] text-gray-400">{item.date}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 照片对比 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">影像记录</h3>
            <button className="text-blue-600 text-xs font-medium flex items-center gap-1">
              查看全部
              <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img src={record.image} alt="记录照片" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="text-gray-400" />
                <span className="text-xs text-gray-500">{record.date}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img src={record.typicalImage} alt="参考病例" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-1.5">
                <FileText size={12} className="text-gray-400" />
                <span className="text-xs text-gray-500">参考病例</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 治疗建议 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <Shield size={18} className="text-blue-500" />
            </div>
            <h3 className="font-bold text-gray-900">护理建议</h3>
          </div>

          <div className="space-y-3">
            {[
              { title: '保持清洁', desc: '每日用温水清洁患处，避免使用刺激性洗护用品', time: '每日 2 次' },
              { title: '按时用药', desc: '按照医嘱涂抹药膏，不要自行增减用量', time: '早晚各 1 次' },
              { title: '避免刺激', desc: '避免抓挠患处，穿着宽松透气的衣物', time: '持续注意' },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 下次复诊提醒 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-amber-50 rounded-2xl p-5 border border-amber-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">下次复诊提醒</h3>
              <p className="text-sm text-gray-500">建议 7 天后复查恢复情况</p>
            </div>
            <button className="px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-full">
              设置提醒
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
