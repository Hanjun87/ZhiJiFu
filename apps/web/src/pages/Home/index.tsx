import React from 'react';
import { Camera, User } from 'lucide-react';
import { motion } from 'motion/react';
import { Page } from '../../types';

export default function Home({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="flex flex-col h-full">
      <header className="pt-12 px-6 pb-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-900">您好, 访客</h1>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
            <User size={24} />
          </div>
        </div>
        <p className="text-gray-500 text-sm">关注您的皮肤健康</p>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center px-6 text-center">
        <div className="relative mb-12">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-blue-500 rounded-full opacity-20"
          />
          <button
            onClick={() => onNavigate('camera')}
            className="relative z-10 w-48 h-48 bg-blue-500 rounded-full flex flex-col items-center justify-center shadow-2xl shadow-blue-300 active:scale-95 transition-transform"
          >
            <Camera size={64} className="text-white mb-2" />
            <span className="text-white text-lg font-bold">拍照识别</span>
          </button>
        </div>
        <div className="mt-8 text-xs text-gray-400">AI 技术仅供参考，如有不适请及时就医</div>
      </main>
    </div>
  );
}
