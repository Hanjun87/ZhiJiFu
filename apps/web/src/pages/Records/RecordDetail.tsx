import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, ArrowLeft, Droplets, Scan, FileText, Calendar, CheckCircle2 } from 'lucide-react';
import { Record } from '../../types';

export default function RecordDetail({
  record,
  onBack,
}: {
  record: Record | null;
  onBack: () => void;
}) {
  if (!record) return null;

  const statusConfig = {
    '恢复中': { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    '待复查': { color: 'bg-blue-100 text-blue-700', icon: Calendar },
    '已结束': { color: 'bg-gray-100 text-gray-600', icon: FileText },
  };

  const statusInfo = statusConfig[record.status] || statusConfig['已结束'];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white px-5 py-3 pt-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack} 
            className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">档案详情</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="p-6">
        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Scan size={28} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-gray-900 mb-1">{record.title}</h2>
              <p className="text-xs text-gray-400">ID: {record.id}008273</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-bold ${statusInfo.color}`}>
              <StatusIcon size={12} />
              {record.status}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-xs text-gray-400">{record.date}</span>
          </div>
        </motion.div>

        {/* Analysis Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-blue-500 rounded-full" />
              <h3 className="font-bold text-gray-900">诊断分析</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">置信度</p>
              <p className="text-xl font-black text-blue-500">{record.probability}%</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            根据影像特征分析，该症状与<span className="font-bold text-gray-900">{record.title}</span>的典型临床表现高度吻合，建议持续观察并按时复诊。
          </p>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-500 leading-relaxed">
              当前记录仅保存疾病名称与置信度。此次识别为 {record.title}，建议结合线下面诊结果综合判断。
            </p>
          </div>
        </motion.div>

        {/* Images Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 bg-blue-500 rounded-full" />
            <h3 className="font-bold text-gray-900">影像资料对比</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                <img src={record.image} alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900">记录照片</p>
                <p className="text-[10px] text-gray-400">Captured</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                <img src={record.typicalImage} alt="Typical" className="w-full h-full object-cover" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900">典型病例</p>
                <p className="text-[10px] text-gray-400">Reference</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Advice Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 bg-blue-500 rounded-full" />
            <h3 className="font-bold text-gray-900">健康建议</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">1</div>
              <span className="text-gray-700 text-sm font-medium leading-relaxed">持续观察 {record.title} 相关变化，避免刺激患处。</span>
            </div>
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">2</div>
              <span className="text-gray-700 text-sm font-medium leading-relaxed">若短期内出现扩散、出血或明显加重，请及时就医复查。</span>
            </div>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="p-6 bg-gray-100 rounded-2xl flex flex-col items-center text-center"
        >
          <AlertCircle size={24} className="text-gray-400 mb-3" />
          <p className="text-xs text-gray-500 leading-relaxed">
            本报告由 <span className="font-bold">知己肤</span> 智能分析系统生成，仅供健康参考。若症状持续或加重，请立即前往正规医院皮肤科就诊。
          </p>
        </motion.div>
      </main>
    </div>
  );
}
