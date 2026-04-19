// AI辅助生成：TraeCN, 2026-3-29 - 添加社区/医院顶部切换导航
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Search, PenLine, ChevronDown, ChevronUp, Users, Loader2 } from 'lucide-react';
import { Page } from '../../types';
import { PostCard } from '../../components/common/PostCard';
import { Hospital } from './Hospital';
import { getPosts, Post } from '../../api/community';

// 多级分类导航数据
const categoryData = {
  all: {
    name: '全部',
    subCategories: ['推荐', '热门', '最新']
  },
  skin: {
    name: '皮肤病',
    subCategories: ['湿疹', '痤疮', '皮炎', '荨麻疹', '银屑病', '白癜风', '带状疱疹', '真菌感染', '皮肤瘙痒', '皮肤过敏']
  },
  wound: {
    name: '伤口',
    subCategories: ['擦伤', '烫伤', '割伤', '术后护理', '疤痕修复', '溃疡', '褥疮', '冻伤', '烧伤', '咬伤']
  },
  whitening: {
    name: '美白',
    subCategories: ['淡斑', '祛痘印', '均匀肤色', '防晒', '抗氧化', '提亮', '去角质', '补水亮肤', '美白精华', '内服美白']
  }
};

interface CommunityFeedProps {
  onNavigate: (p: Page) => void;
  initialTab?: 'community' | 'hospital';
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ onNavigate, initialTab = 'community' }) => {
  const [activeTab, setActiveTab] = useState<'community' | 'hospital'>('community');
  
  // 使用 useEffect 来设置 initialTab，避免 TypeScript 类型收窄问题
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, []);
  const [activeMainCategory, setActiveMainCategory] = useState<'all' | 'skin' | 'wound' | 'whitening'>('all');
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);
  const [isSubCategoryExpanded, setIsSubCategoryExpanded] = useState(false);
  const [sortBy, setSortBy] = useState<'hot' | 'new'>('hot');
  
  // 帖子数据状态
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 加载帖子数据
  const loadPosts = useCallback(async (reset = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const currentPage = reset ? 1 : page;
      const data = await getPosts({
        tag: activeSubCategory || undefined,
        sort: sortBy,
        page: currentPage,
        pageSize: 10,
      });
      
      if (reset) {
        setPosts(data.posts);
        setPage(2);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
        setPage(prev => prev + 1);
      }
      
      setHasMore(data.posts.length === 10);
    } catch (err: any) {
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [activeSubCategory, sortBy, page, loading]);

  // 初始加载
  useEffect(() => {
    loadPosts(true);
  }, [activeSubCategory, sortBy]);

  // 切换一级分类时重置二级分类选中状态和展开状态
  const handleMainCategoryChange = (key: 'all' | 'skin' | 'wound' | 'whitening') => {
    setActiveMainCategory(key);
    setActiveSubCategory(null);
    setIsSubCategoryExpanded(false);
  };

  const currentCategory = categoryData[activeMainCategory];

  // 如果选择了医院tab，显示Hospital组件
  if (activeTab === 'hospital') {
    return <Hospital onNavigate={onNavigate} onSwitchToCommunity={() => setActiveTab('community')} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* 顶部背景装饰 */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-blue-500/10 via-blue-500/5 to-transparent pointer-events-none" />
      
      {/* Header - 整体居中布局 */}
      <header className="sticky top-0 z-10 px-5 py-3 pt-6">
        <div className="flex items-center justify-center">
          {/* 左侧占位，保持对称 */}
          <div className="flex items-center gap-2 w-[84px]">
            <div className="w-10 h-10" />
            <div className="w-10 h-10" />
          </div>
          
          {/* Tab Switcher - 胶囊按钮风格 - 居中 */}
          <div className="flex bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-sm border border-gray-100">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('community')}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'community'
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              社区
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('hospital')}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                (activeTab as string) === 'hospital'
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              医院
            </motion.button>
          </div>
          
          {/* 右侧按钮组 */}
          <div className="flex items-center gap-2 w-[100px] justify-end">
            {/* 通讯录按钮 */}
            <motion.button
              onClick={() => onNavigate('community_contacts')}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors relative shrink-0"
            >
              <Users size={20} />
              {/* 未读消息红点 */}
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                3
              </span>
            </motion.button>
            
            {/* 写帖子按钮 */}
            <motion.button
              onClick={() => onNavigate('community_create')}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0"
            >
              <PenLine size={20} />
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
          className="mb-6"
        >
          {/* First Level Navigation */}
          <div className="flex gap-2 mb-3">
            {(Object.keys(categoryData) as Array<'all' | 'skin' | 'wound' | 'whitening'>).map((key) => (
              <motion.button
                key={key}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleMainCategoryChange(key)}
                className={`flex-1 py-2.5 px-2 rounded-xl text-sm font-semibold transition-all ${
                  activeMainCategory === key
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                    : 'bg-white text-gray-600 shadow-sm border border-gray-100 hover:bg-gray-50'
                }`}
              >
                {categoryData[key].name}
              </motion.button>
            ))}
          </div>

          {/* Second Level Navigation - 可展开 */}
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
            <div 
              className={`flex flex-wrap gap-2 transition-all duration-300 ease-out ${
                isSubCategoryExpanded ? 'max-h-[500px]' : 'max-h-[38px]'
              } overflow-hidden`}
            >
              {currentCategory.subCategories.map((subCat, idx) => {
                const isActive = activeSubCategory === subCat;
                return (
                  <motion.button
                    key={idx}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveSubCategory(isActive ? null : subCat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/20'
                        : 'bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    {subCat}
                  </motion.button>
                );
              })}
            </div>
            
            {/* 展开/收起按钮 - 当标签超过4个时显示 */}
            {currentCategory.subCategories.length > 4 && (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsSubCategoryExpanded(!isSubCategoryExpanded)}
                className="w-full mt-2 pt-2 border-t border-gray-100 flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors"
              >
                <motion.span
                  initial={false}
                  animate={{ rotate: isSubCategoryExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={14} />
                </motion.span>
                <span>{isSubCategoryExpanded ? '收起' : `展开更多 (${currentCategory.subCategories.length - 4})`}</span>
              </motion.button>
            )}
          </div>
        </motion.section>

        {/* Tabs */}
        <motion.nav 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6 flex gap-6 border-b border-gray-200"
        >
          <button 
            onClick={() => setSortBy('hot')}
            className={`pb-3 font-bold text-sm transition-colors ${
              sortBy === 'hot' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            热门
          </button>
          <button 
            onClick={() => setSortBy('new')}
            className={`pb-3 font-bold text-sm transition-colors ${
              sortBy === 'new' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            最新
          </button>
        </motion.nav>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => loadPosts(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              重试
            </button>
          </motion.div>
        )}

        {/* Posts */}
        {posts.length === 0 && !loading && !error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500">暂无相关帖子</p>
            <p className="text-gray-400 text-sm mt-1">成为第一个发布的人吧！</p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="space-y-4"
          >
            {posts.map((post, idx) => (
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
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-blue-600" />
          </div>
        )}

        {/* Load More */}
        {!loading && hasMore && posts.length > 0 && (
          <div className="text-center py-6">
            <button
              onClick={() => loadPosts()}
              className="px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              加载更多
            </button>
          </div>
        )}

        {/* No More */}
        {!loading && !hasMore && posts.length > 0 && (
          <div className="text-center py-6 text-gray-400 text-sm">
            已经到底了
          </div>
        )}
      </main>
    </div>
  );
};

export default CommunityFeed;
