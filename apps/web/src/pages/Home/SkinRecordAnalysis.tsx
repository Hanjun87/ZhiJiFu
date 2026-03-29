import React from 'react';
import { motion } from 'motion/react';
import { Camera, Sparkles } from 'lucide-react';

export default function SkinRecordAnalysis({ capturedImage }: { capturedImage: string | null }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-blue-50/30 via-white to-white p-6 text-center">
      {/* Background decoration */}
      <motion.div
        className="absolute top-20 h-32 w-32 rounded-full bg-blue-400/10 blur-3xl"
        animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-40 right-10 h-24 w-24 rounded-full bg-blue-400/10 blur-2xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />

      {/* Image preview */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm aspect-square rounded-[32px] overflow-hidden mb-10 relative shadow-[0_20px_60px_rgba(59,130,246,0.12)] border-4 border-white"
      >
        {capturedImage && <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />}
        {/* Scanning overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent" />
        <motion.div 
          animate={{ top: ['0%', '100%', '0%'] }} 
          transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }} 
          className="absolute left-0 right-0 h-0.5 bg-blue-400/60 shadow-[0_0_15px_rgba(59,130,246,0.6)]" 
        />
      </motion.div>

      {/* Status */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-3 mb-4"
      >
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <Camera className="text-blue-600" size={20} />
        </div>
        <div className="text-left">
          <h2 className="text-lg font-bold text-gray-900">正在记录皮肤状态...</h2>
          <p className="text-xs text-gray-400">AI 正在分析照片质量</p>
        </div>
      </motion.div>

      {/* Progress steps */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xs mb-8"
      >
        <div className="flex items-center justify-between mb-3">
          {['照片检测', '质量评估', '生成记录'].map((step, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0.3 }}
                animate={{ 
                  scale: idx <= 1 ? 1 : 0.8, 
                  opacity: idx <= 1 ? 1 : 0.3,
                  backgroundColor: idx <= 1 ? '#3b82f6' : '#e5e7eb'
                }}
                transition={{ duration: 0.5, delay: idx * 0.8 }}
                className="w-3 h-3 rounded-full mb-2"
              />
              <span className={`text-[10px] ${idx <= 1 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                {step}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full overflow-hidden rounded-full bg-gray-100 h-2">
          <motion.div 
            initial={{ width: '0%' }} 
            animate={{ width: '100%' }} 
            transition={{ duration: 3, ease: 'easeInOut' }} 
            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-500" 
          />
        </div>
      </motion.div>

      {/* Tips card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.44, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8 w-full max-w-sm rounded-2xl border border-blue-100 bg-white p-5 text-left shadow-lg shadow-blue-100/50"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-blue-500" />
          <h4 className="font-bold text-gray-900 text-sm">记录小贴士</h4>
        </div>
        <ul className="space-y-2 text-xs text-gray-500">
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" />
            <span>建议在相同光线条件下拍摄，便于对比</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" />
            <span>记录将保存到您的皮肤日记中</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" />
            <span>定期记录有助于追踪皮肤变化趋势</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
}
