import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, ChevronRight } from 'lucide-react';
import { Page } from '../../types';
import { MOCK_POSTS } from './constants';
import { PostCard } from '../../components/common/PostCard';
import { Hospital } from './Hospital';

// 多级分类导航数据
const categoryData = {
  skin: {
    name: '皮肤病',
    subCategories: ['湿疹', '痤疮', '皮炎', '荨麻疹', '银屑病', '白癜风', '带状疱疹', '真菌感染']
  },
  wound: {
    name: '伤口',
    subCategories: ['擦伤', '烫伤', '割伤', '术后护理', '疤痕修复', '溃疡', '褥疮', '冻伤']
  },
  whitening: {
    name: '美白',
    subCategories: ['淡斑', '祛痘印', '均匀肤色', '防晒', '抗氧化', '提亮', '去角质', '补水亮肤']
  }
};

export const CommunityFeed = ({ onNavigate }: { onNavigate: (p: Page) => void }) => {
  const [activeTab, setActiveTab] = useState<'community' | 'hospital'>('community');
  const [activeMainCategory, setActiveMainCategory] = useState<'skin' | 'wound' | 'whitening'>('skin');
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);

  // 如果选择了医院tab，显示Hospital组件
  if (activeTab === 'hospital') {
    return <Hospital onNavigate={onNavigate} onSwitchToCommunity={() => setActiveTab('community')} />;
  }

  const currentCategory = categoryData[activeMainCategory];

  // 切换一级分类时重置二级分类选中状态
  const handleMainCategoryChange = (key: 'skin' | 'wound' | 'whitening') => {
    setActiveMainCategory(key);
    setActiveSubCategory(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Header - 只固定社区/医院标签 */}
      <header className="sticky top-0 z-10 bg-white px-5 py-3 pt-6">
        {/* Tab Switcher */}
        <div className="flex items-center justify-center">
          <div className="flex bg-gray-100 rounded-full p-1">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('community')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'community'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              社区
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('hospital')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'hospital'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              医院
            </motion.button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Search - 随页面滚动 */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative flex items-center bg-gray-100 rounded-xl px-4 py-2.5 mb-6"
        >
          <Search size={16} className="text-gray-400 mr-3" />
          <input 
            type="text" 
            placeholder="搜索皮肤问题、专家建议..." 
            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-gray-400 outline-none"
          />
        </motion.div>

        {/* Multi-level Categories */}
        <motion.section 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">分类导航</h2>
            <span className="text-blue-600 text-sm font-semibold cursor-pointer hover:text-blue-700 transition-colors">查看全部</span>
          </div>
          
          {/* First Level Navigation */}
          <div className="flex gap-2 mb-4">
            {(Object.keys(categoryData) as Array<'skin' | 'wound' | 'whitening'>).map((key) => (
              <motion.button
                key={key}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleMainCategoryChange(key)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                  activeMainCategory === key
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'bg-white text-gray-600 shadow-sm border border-gray-100 hover:bg-gray-50'
                }`}
              >
                {categoryData[key].name}
              </motion.button>
            ))}
          </div>

          {/* Second Level Navigation */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {currentCategory.subCategories.map((subCat, idx) => {
              const isActive = activeSubCategory === subCat;
              return (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveSubCategory(isActive ? null : subCat)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'bg-white text-gray-600 shadow-sm border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
                  }`}
                >
                  {subCat}
                </motion.button>
              );
            })}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('community_expert')}
              className="flex-shrink-0 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium shadow-md shadow-blue-200 flex items-center gap-1 hover:shadow-lg hover:shadow-blue-300 transition-shadow"
            >
              专家专栏
              <ChevronRight size={14} />
            </motion.button>
          </div>
        </motion.section>

        {/* Tabs */}
        <motion.nav 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6 flex gap-6 border-b border-gray-200"
        >
          <button className="pb-3 text-blue-600 border-b-2 border-blue-600 font-bold text-sm">热门</button>
          <button className="pb-3 text-gray-400 font-medium text-sm hover:text-gray-600 transition-colors">最新</button>
        </motion.nav>

        {/* Posts */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="space-y-4"
        >
          {MOCK_POSTS.map((post, idx) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 + idx * 0.05 }}
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
