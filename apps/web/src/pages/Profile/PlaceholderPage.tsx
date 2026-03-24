import React from 'react';
import { ArrowLeft } from 'lucide-react';

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
    <div className="flex flex-col h-full bg-gray-50">
      <header className="p-6 flex items-center justify-between bg-white sticky top-0 z-10 border-b border-gray-100">
        <button onClick={onBack} className="text-gray-400 active:scale-90 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <div className="w-6" />
      </header>
      <div className="flex-grow flex flex-col items-center justify-center p-12 text-center">
        <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-500 mb-6">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}功能开发中</h3>
        <p className="text-gray-400 text-sm">我们正在努力为您带来更好的体验，敬请期待！</p>
      </div>
    </div>
  );
}
