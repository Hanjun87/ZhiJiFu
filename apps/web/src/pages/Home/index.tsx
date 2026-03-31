import React from 'react';
import { Camera, Shield, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { Page } from '../../types';

export default function Home({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50/50 to-white pb-24">
      {/* Header */}
      <header className="relative overflow-hidden px-6 pb-8 pt-12">
        <motion.div
          className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_70%)]"
          animate={{ scale: [1, 1.02, 1], opacity: [0.8, 1, 0.9] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-2"
          >
            <img src="/logo.png" alt="知己肤" className="w-5 h-5 object-contain" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500">知己肤</p>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl font-black tracking-tight text-gray-900"
          >
            您好，访客
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-2 text-sm text-gray-500"
          >
            AI 驱动的皮肤健康检测与管理
          </motion.p>
        </div>
      </header>

      <main className="flex flex-col items-center px-6">
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full mb-8 rounded-2xl bg-white p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
            <span className="text-xs font-bold text-gray-500">AI 检测引擎就绪</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            拍照后即可获得专业的皮肤分析报告，支持多种常见皮肤问题的智能识别。
          </p>
        </motion.div>

        {/* Main CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative mb-10"
        >
          {/* Glow Effect */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="absolute inset-[-20px] rounded-full bg-blue-500 blur-2xl"
          />
          
          <motion.button
            onClick={() => onNavigate('camera')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative flex h-48 w-48 flex-col items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-[0_20px_60px_rgba(37,99,235,0.4)]"
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="mb-3 rounded-2xl bg-white/20 p-4 backdrop-blur-sm"
            >
              <Camera size={48} className="text-white" />
            </motion.div>
            <span className="text-lg font-bold text-white">拍照识别</span>
            <span className="mt-1 text-xs text-blue-100">点击开始检测</span>
          </motion.button>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full grid grid-cols-2 gap-3 mb-6"
        >
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 mb-3">
              <Zap size={20} />
            </div>
            <p className="text-sm font-bold text-gray-900 mb-1">快速识别</p>
            <p className="text-xs text-gray-500">3秒获取分析结果</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 mb-3">
              <Shield size={20} />
            </div>
            <p className="text-sm font-bold text-gray-900 mb-1">专业建议</p>
            <p className="text-xs text-gray-500">AI 辅助健康指导</p>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-xs text-gray-400 text-center"
        >
          AI 技术仅供参考，如有不适请及时就医
        </motion.p>
      </main>
    </div>
  );
}
