import React from 'react';
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
    <div className="pb-20 bg-gray-50 h-full overflow-y-auto">
      <header className="sticky top-0 left-0 right-0 bg-white/80 backdrop-blur-xl z-40 px-6 py-3 shadow-sm pt-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">皮肤健康社区</h1>
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" alt="User" />
          </div>
        </div>
        <div className="relative flex items-center bg-gray-100 rounded-xl px-4 py-2.5">
          <Search size={18} className="text-gray-400 mr-3" />
          <input 
            type="text" 
            placeholder="搜索特定的皮肤问题、专家建议..." 
            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-gray-400 outline-none"
          />
        </div>
      </header>

      <main className="pt-6 px-6">
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">分类导航</h2>
            <span className="text-blue-600 text-sm font-semibold">查看全部</span>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {categories.map((cat, idx) => (
              <div 
                key={idx} 
                className={`flex-shrink-0 px-4 py-2 rounded-lg flex items-center gap-2 transition-all bg-white text-gray-600 shadow-sm hover:bg-blue-50 hover:text-blue-600 cursor-pointer`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="text-sm font-semibold">{cat.name}</span>
              </div>
            ))}
            <div 
              onClick={() => onNavigate('community_expert')}
              className="flex-shrink-0 px-4 py-2 rounded-lg flex items-center gap-2 transition-all bg-white text-gray-600 shadow-sm hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
            >
              <span className="text-lg">🎓</span>
              <span className="text-sm font-semibold">专家专栏</span>
            </div>
          </div>
        </section>

        <nav className="flex gap-8 mb-6 border-b border-transparent">
          <button className="pb-2 text-blue-600 border-b-2 border-blue-600 font-bold">热门</button>
          <button className="pb-2 text-gray-400 font-medium">最新</button>
        </nav>

        <div className="space-y-4">
          {MOCK_POSTS.map(post => (
            <div key={post.id} onClick={() => onNavigate('community_post_detail')}>
              <PostCard post={post} />
            </div>
          ))}
        </div>
      </main>

      <button 
        onClick={() => onNavigate('community_create')}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-40 active:scale-95 transition-transform"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};
