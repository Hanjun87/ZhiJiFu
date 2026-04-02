import React from 'react';
import { Camera, Shield, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { Page } from '../../types';

export default function Home({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50/50 to-white pb-28">
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

      <main className="flex flex-col items-center px-5 max-w-lg mx-auto">
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full mb-6 rounded-2xl bg-gradient-to-br from-white to-blue-50/50 p-5 shadow-md border border-blue-100/50"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            </div>
            <span className="text-xs font-bold text-emerald-700">AI 检测引擎就绪</span>
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
          className="relative mb-8"
        >
          {/* Outer Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
            className="absolute inset-[-8px] rounded-full border-2 border-dashed border-blue-200/50"
          />
          
          {/* Glow Effect */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="absolute inset-[-20px] rounded-full bg-gradient-to-r from-blue-400 to-purple-400 blur-2xl"
          />
          
          <motion.button
            onClick={() => onNavigate('camera')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="relative flex h-44 w-44 flex-col items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 shadow-[0_20px_60px_rgba(37,99,235,0.4)] border-4 border-white/20"
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="mb-3 rounded-2xl bg-white/25 p-4 backdrop-blur-sm border border-white/20"
            >
              <Camera size={44} className="text-white" strokeWidth={1.5} />
            </motion.div>
            <span className="text-lg font-bold text-white tracking-wide">拍照识别</span>
            <span className="mt-1.5 text-xs text-blue-100 font-medium">点击开始检测</span>
          </motion.button>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full grid grid-cols-2 gap-4 mb-6"
        >
          <motion.div 
            whileHover={{ y: -2, scale: 1.02 }}
            className="rounded-2xl bg-white p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 mb-4 shadow-sm">
              <Zap size={24} strokeWidth={1.5} />
            </div>
            <p className="text-base font-bold text-gray-900 mb-2">快速识别</p>
            <p className="text-sm text-gray-500 leading-relaxed">3秒获取分析结果</p>
          </motion.div>
          <motion.div 
            whileHover={{ y: -2, scale: 1.02 }}
            className="rounded-2xl bg-white p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
              <Shield size={24} strokeWidth={1.5} />
            </div>
            <p className="text-base font-bold text-gray-900 mb-2">专业建议</p>
            <p className="text-sm text-gray-500 leading-relaxed">AI 辅助健康指导</p>
          </motion.div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full mb-4"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <p className="text-xs text-gray-500">AI 技术仅供参考，如有不适请及时就医</p>
        </motion.div>
      </main>
    </div>
  );
}
