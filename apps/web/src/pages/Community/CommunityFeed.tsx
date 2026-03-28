import React from 'react';
import { motion } from 'motion/react';
import { Search, Plus } from 'lucide-react';
import { Page } from '../../types';
import { MOCK_POSTS } from './constants';
import { PostCard } from '../../components/common/PostCard';

export const CommunityFeed = ({ onNavigate }: { onNavigate: (p: Page) => void }) => {
  const categories = [
    { name: '湿疹', icon: '🏥' },
    { name: '痤疮', icon: '😊' },
    { name: '皮炎', icon: '🦠' },
    { name: '过敏', icon: '🤧' },
    { name: '日常护理', icon: '✨' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white px-5 py-3 pt-6">
        <h1 className="text-lg font-bold text-gray-900 text-center mb-3">皮肤健康社区</h1>
        <div className="relative flex items-center bg-gray-100 rounded-xl px-4 py-2.5">
          <Search size={16} className="text-gray-400 mr-3" />
          <input 
            type="text" 
            placeholder="搜索皮肤问题、专家建议..." 
            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-gray-400 outline-none"
          />
        </div>
      </header>

      <main className="p-6">
        {/* Categories */}
        <motion.section 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">分类导航</h2>
            <span className="text-blue-600 text-sm font-semibold cursor-pointer hover:text-blue-700 transition-colors">查看全部</span>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {categories.map((cat, idx) => (
              <motion.div 
                key={idx}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 px-4 py-2.5 rounded-xl flex items-center gap-2 bg-white text-gray-700 shadow-sm border border-gray-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 cursor-pointer transition-colors"
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="text-sm font-semibold">{cat.name}</span>
              </motion.div>
            ))}
            <motion.div 
              onClick={() => onNavigate('community_expert')}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 px-4 py-2.5 rounded-xl flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200 cursor-pointer hover:shadow-lg hover:shadow-blue-200 transition-shadow"
            >
              <span className="text-lg">🎓</span>
              <span className="text-sm font-semibold">专家专栏</span>
            </motion.div>
          </div>
        </motion.section>

        {/* Tabs */}
        <motion.nav 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="mb-6 flex gap-6 border-b border-gray-200"
        >
          <button className="pb-3 text-blue-600 border-b-2 border-blue-600 font-bold text-sm">热门</button>
          <button className="pb-3 text-gray-400 font-medium text-sm hover:text-gray-600 transition-colors">最新</button>
        </motion.nav>

        {/* Posts */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-4"
        >
          {MOCK_POSTS.map((post, idx) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + idx * 0.05 }}
              onClick={() => onNavigate('community_post_detail')}
            >
              <PostCard post={post} />
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* FAB - 统一风格 */}
      <motion.button 
        onClick={() => onNavigate('community_create')}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-28 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_8px_30px_rgba(37,99,235,0.4)]"
      >
        <Plus size={28} />
      </motion.button>
    </div>
  );
};
