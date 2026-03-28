import React from 'react';
import { motion } from 'motion/react';
import { Calendar, ChevronRight, Info, MessageSquare, Scan, Settings } from 'lucide-react';
import { Page } from '../../types';

export default function Profile({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white px-5 py-3 pt-6">
        <h1 className="text-lg font-bold text-gray-900 text-center">个人中心</h1>
      </header>

      <div className="p-6">
        {/* User Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-5 mb-8 p-5 rounded-2xl bg-white shadow-sm border border-gray-100"
        >
          <div className="w-20 h-20 rounded-full border-4 border-blue-50 overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200">
            <img src="https://picsum.photos/seed/avatar/200/200" alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">健康守护者</h2>
            <p className="text-gray-400 text-sm mt-1">ID: 88472910</p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-blue-600 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Scan size={16} />
              </div>
              <span className="text-xs font-bold">识别次数</span>
            </div>
            <p className="text-3xl font-black text-gray-900">12 <span className="text-sm font-normal text-gray-400">次</span></p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-emerald-600 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Calendar size={16} />
              </div>
              <span className="text-xs font-bold">记录天数</span>
            </div>
            <p className="text-3xl font-black text-gray-900">45 <span className="text-sm font-normal text-gray-400">天</span></p>
          </div>
        </motion.div>

        {/* Menu Sections */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-6"
        >
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">常用功能</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <MenuItem 
                icon={<MessageSquare size={20} />}
                iconBg="bg-blue-50"
                iconColor="text-blue-500"
                label="我的咨询"
                onClick={() => onNavigate('consultations')}
              />
              <div className="h-px bg-gray-100 mx-4" />
              <MenuItem 
                icon={<Calendar size={20} />}
                iconBg="bg-indigo-50"
                iconColor="text-indigo-500"
                label="专家预约"
                onClick={() => onNavigate('appointments')}
              />
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">系统服务</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <MenuItem 
                icon={<Settings size={20} />}
                iconBg="bg-gray-50"
                iconColor="text-gray-500"
                label="设置"
                onClick={() => onNavigate('settings')}
              />
              <div className="h-px bg-gray-100 mx-4" />
              <MenuItem 
                icon={<Info size={20} />}
                iconBg="bg-gray-50"
                iconColor="text-gray-500"
                label="关于应用"
                onClick={() => onNavigate('about')}
              />
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  onClick: () => void;
}

const MenuItem = ({ icon, iconBg, iconColor, label, onClick }: MenuItemProps) => (
  <motion.button 
    onClick={onClick}
    whileTap={{ scale: 0.99 }}
    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
  >
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center ${iconColor}`}>
        {icon}
      </div>
      <span className="font-bold text-gray-700">{label}</span>
    </div>
    <ChevronRight size={20} className="text-gray-300" />
  </motion.button>
);
