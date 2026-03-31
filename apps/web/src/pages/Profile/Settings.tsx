import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Globe, Bell, Moon, ChevronRight, Check, Volume2, MessageCircle, Calendar } from 'lucide-react';
import { Page } from '../../types';

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  
  // 通知设置状态
  const [notifications, setNotifications] = useState({
    push: true,
    sound: true,
    message: true,
    reminder: false,
  });

  // 深色模式
  const [darkMode, setDarkMode] = useState(false);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const languages = [
    { code: 'zh' as const, label: '简体中文', flag: '🇨🇳' },
    { code: 'en' as const, label: 'English', flag: '🇺🇸' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white px-5 py-3 pt-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack} 
            className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">设置</h1>
          <div className="w-9" />
        </div>
      </header>

      <div className="flex-1 p-5 pb-24">
        {/* 语言设置 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">通用设置</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* 语言选择 */}
            <button
              onClick={() => setShowLanguageModal(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                  <Globe size={20} />
                </div>
                <div className="text-left">
                  <span className="font-bold text-gray-700 block">语言</span>
                  <span className="text-xs text-gray-400">
                    {languages.find(l => l.code === language)?.label}
                  </span>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </button>

            <div className="h-px bg-gray-100 mx-4" />

            {/* 深色模式 */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                  <Moon size={20} />
                </div>
                <span className="font-bold text-gray-700">深色模式</span>
              </div>
              <ToggleSwitch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
            </div>
          </div>
        </motion.section>

        {/* 通知设置 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">通知设置</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* 推送通知总开关 */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                  <Bell size={20} />
                </div>
                <div>
                  <span className="font-bold text-gray-700 block">推送通知</span>
                  <span className="text-xs text-gray-400">接收应用推送消息</span>
                </div>
              </div>
              <ToggleSwitch checked={notifications.push} onChange={() => toggleNotification('push')} />
            </div>

            {notifications.push && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-100"
              >
                {/* 声音提醒 */}
                <div className="flex items-center justify-between p-4 pl-[72px]">
                  <div className="flex items-center gap-3">
                    <Volume2 size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">声音提醒</span>
                  </div>
                  <ToggleSwitch 
                    checked={notifications.sound} 
                    onChange={() => toggleNotification('sound')} 
                    size="sm"
                  />
                </div>

                <div className="h-px bg-gray-100 mx-4 ml-[72px]" />

                {/* 消息通知 */}
                <div className="flex items-center justify-between p-4 pl-[72px]">
                  <div className="flex items-center gap-3">
                    <MessageCircle size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">消息通知</span>
                  </div>
                  <ToggleSwitch 
                    checked={notifications.message} 
                    onChange={() => toggleNotification('message')} 
                    size="sm"
                  />
                </div>

                <div className="h-px bg-gray-100 mx-4 ml-[72px]" />

                {/* 日程提醒 */}
                <div className="flex items-center justify-between p-4 pl-[72px]">
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">日程提醒</span>
                  </div>
                  <ToggleSwitch 
                    checked={notifications.reminder} 
                    onChange={() => toggleNotification('reminder')} 
                    size="sm"
                  />
                </div>
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* 关于版本 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <span className="text-sm text-gray-500">版本号</span>
              <span className="text-sm text-gray-400">v1.0.0</span>
            </div>
          </div>
        </motion.section>
      </div>

      {/* 语言选择弹窗 */}
      {showLanguageModal && (
        <LanguageModal
          languages={languages}
          currentLanguage={language}
          onSelect={(code) => {
            setLanguage(code);
            setShowLanguageModal(false);
          }}
          onClose={() => setShowLanguageModal(false)}
        />
      )}
    </div>
  );
}

// 切换开关组件
interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  size?: 'sm' | 'md';
}

function ToggleSwitch({ checked, onChange, size = 'md' }: ToggleSwitchProps) {
  const isSm = size === 'sm';
  return (
    <button
      onClick={onChange}
      className={`
        relative inline-flex items-center rounded-full transition-colors duration-300
        ${checked ? 'bg-blue-500' : 'bg-gray-200'}
        ${isSm ? 'h-5 w-9' : 'h-6 w-11'}
      `}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        className={`
          inline-block bg-white rounded-full shadow-md
          ${isSm ? 'h-3.5 w-3.5' : 'h-5 w-5'}
          ${checked ? (isSm ? 'translate-x-[18px]' : 'translate-x-6') : 'translate-x-1'}
        `}
      />
    </button>
  );
}

// 语言选择弹窗
interface LanguageModalProps {
  languages: { code: 'zh' | 'en'; label: string; flag: string }[];
  currentLanguage: 'zh' | 'en';
  onSelect: (code: 'zh' | 'en') => void;
  onClose: () => void;
}

function LanguageModal({ languages, currentLanguage, onSelect, onClose }: LanguageModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      {/* 弹窗内容 */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 拖动条 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        
        {/* 标题 */}
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 text-center">选择语言</h2>
        </div>

        {/* 语言列表 */}
        <div className="p-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onSelect(lang.code)}
              className={`
                w-full flex items-center justify-between p-4 rounded-xl transition-colors
                ${currentLanguage === lang.code ? 'bg-blue-50' : 'hover:bg-gray-50'}
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <span className={`font-medium ${currentLanguage === lang.code ? 'text-blue-600' : 'text-gray-700'}`}>
                  {lang.label}
                </span>
              </div>
              {currentLanguage === lang.code && (
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* 取消按钮 */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
