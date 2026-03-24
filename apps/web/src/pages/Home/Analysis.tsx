import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';

export default function Analysis({ capturedImage }: { capturedImage: string | null }) {
  return (
    <div className="flex flex-col h-full bg-white p-6 justify-center items-center text-center">
      <div className="w-full max-w-sm aspect-square rounded-3xl overflow-hidden mb-12 relative shadow-2xl">
        {capturedImage && <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 border-4 border-blue-500/30 rounded-3xl" />
        <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-blue-500" />
        <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-blue-500" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-blue-500" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-blue-500" />
        <motion.div animate={{ top: ['0%', '100%', '0%'] }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }} className="absolute left-0 right-0 h-1 bg-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.8)]" />
      </div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <h2 className="text-xl font-bold text-gray-900">AI 正在深度分析中...</h2>
      </div>
      <p className="text-gray-400 text-sm mb-8">正在识别皮损特征、颜色分布及边缘轮廓，请稍候</p>
      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        <motion.div initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 5 }} className="h-full bg-blue-500" />
      </div>
      <div className="mt-24 p-4 bg-blue-50 rounded-2xl flex items-start gap-4 text-left">
        <AlertCircle size={20} className="text-blue-500 shrink-0" />
        <div>
          <h4 className="font-bold text-blue-900 text-sm mb-1">医疗免责声明</h4>
          <p className="text-blue-700 text-[10px] leading-relaxed">AI分析结果仅供参考，不作为最终医疗诊断。如果症状严重或持续，请咨询专业皮肤科医生。</p>
        </div>
      </div>
    </div>
  );
}
