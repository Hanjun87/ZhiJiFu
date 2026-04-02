import React from 'react';
import { motion } from 'motion/react';
import BackButton from '../../components/common/BackButton';

export default function PlaceholderPage({
  title,
  icon,
  onBack,
}: {
  title: string;
  icon: React.ReactNode;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white px-5 py-3 pt-6">
        <div className="flex items-center justify-between">
          <BackButton onClick={onBack} />
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          <div className="w-10" />
        </div>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col items-center justify-center p-12 text-center"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl flex items-center justify-center text-blue-500 mb-6 shadow-sm">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}功能开发中</h3>
        <p className="text-gray-400 text-sm max-w-xs">我们正在努力为您带来更好的体验，敬请期待！</p>
      </motion.div>
    </div>
  );
}
