import React from 'react';
import { motion } from 'motion/react';
import { Plus, X, Microscope, Tag, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Page } from '../../types';

export const CreatePost = ({ onNavigate }: { onNavigate: (p: Page) => void }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white px-5 py-3 pt-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => onNavigate('community')} 
            className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">发布帖子</h1>
          <button className="px-4 py-1.5 bg-blue-600 text-white rounded-full font-bold text-sm hover:bg-blue-700 transition-colors">
            发布
          </button>
        </div>
      </header>

      <main className="p-6">
        {/* Title Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4"
        >
          <input 
            type="text" 
            placeholder="添加标题..." 
            className="w-full border-none focus:ring-0 text-lg font-bold placeholder:text-gray-300 p-0 bg-transparent outline-none"
          />
        </motion.div>

        {/* Content Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6"
        >
          <textarea 
            placeholder="分享你的皮肤状况或护理心得..." 
            className="w-full border-none focus:ring-0 text-base placeholder:text-gray-400 p-0 bg-transparent resize-none outline-none min-h-[150px]"
          />
        </motion.div>

        {/* Image Upload */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">添加图片</h3>
          <div className="grid grid-cols-3 gap-3">
            <button className="aspect-square bg-gray-100 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200 text-gray-400 hover:bg-gray-200 hover:border-gray-300 transition-colors">
              <ImageIcon size={28} />
              <span className="text-[10px] font-bold mt-2">上传图片</span>
            </button>
            <div className="aspect-square rounded-2xl overflow-hidden relative shadow-sm">
              <img src="https://picsum.photos/seed/upload/400/400" alt="" className="w-full h-full object-cover" />
              <button className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 backdrop-blur-sm hover:bg-black/70 transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.section>

        {/* Add Report */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-6"
        >
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">关联数据</h3>
          <button className="w-full flex items-center justify-between bg-blue-50 p-4 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Microscope size={20} />
              </div>
              <div className="text-left">
                <p className="font-bold text-blue-600 text-sm">添加识别报告</p>
                <p className="text-xs text-blue-400">关联您的 AI 皮肤分析数据</p>
              </div>
            </div>
            <Plus size={20} className="text-blue-600" />
          </button>
        </motion.section>

        {/* Tags */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Tag size={14} className="text-blue-600" />
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">选择话题</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {['湿疹', '痤疮', '皮炎', '护肤心得', '防晒'].map((tag, i) => (
              <button 
                key={i} 
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  i === 0 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Anonymous Toggle */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
        >
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a4 4 0 0 0-4 4c0 2.5 2 4 4 6 2-2 4-3.5 4-6a4 4 0 0 0-4-4Z"/>
                  <path d="M12 13v8"/>
                  <path d="M9 16h6"/>
                </svg>
              </div>
              <div>
                <span className="text-sm font-bold text-gray-900 block">匿名发布</span>
                <span className="text-[10px] text-gray-400">不显示个人头像和昵称</span>
              </div>
            </div>
            <div className="relative inline-flex items-center">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
          </label>
        </motion.section>
      </main>
    </div>
  );
};
