import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Info, Settings, Shield, Camera } from 'lucide-react';
import { Page } from '../../types';

export default function Profile({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      <div className="p-6 pt-12">
        {/* User Info Card - 点击进入头像昵称设置 */}
        <motion.button 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => onNavigate('profile_edit')}
          className="w-full flex items-center gap-5 mb-8 p-5 rounded-2xl bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-blue-50 overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200">
              <img src="https://picsum.photos/seed/avatar/200/200" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
              <Camera size={14} className="text-white" />
            </div>
          </div>
          <div className="flex-1 text-left">
            <h2 className="text-xl font-bold text-gray-900">健康守护者</h2>
            <p className="text-gray-400 text-sm mt-1">ID: 88472910</p>
          </div>
          <ChevronRight size={20} className="text-gray-300" />
        </motion.button>

        {/* Menu Sections */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-6"
        >
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">账号设置</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <MenuItem 
                icon={<Shield size={20} />}
                iconBg="bg-green-50"
                iconColor="text-green-500"
                label="隐私安全"
                onClick={() => {}}
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
