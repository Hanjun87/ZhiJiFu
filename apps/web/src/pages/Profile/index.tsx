import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Grid3X3, Bookmark, Heart, MessageCircle, Camera, MapPin, Link2, ChevronRight } from 'lucide-react';
import { Page } from '../../types';

// 模拟用户发布的帖子数据 - 两列瀑布流，不同高度
const MOCK_POSTS = [
  {
    id: '1',
    image: 'https://picsum.photos/seed/post1/400/600',
    likes: 128,
    comments: 23,
    title: '皮肤状态记录',
    isVideo: true,
    aspectRatio: 'aspect-[2/3]',
  },
  {
    id: '2',
    image: 'https://picsum.photos/seed/post2/400/500',
    likes: 256,
    comments: 45,
    title: '护肤心得分享',
    isVideo: false,
    aspectRatio: 'aspect-[4/5]',
  },
  {
    id: '3',
    image: 'https://picsum.photos/seed/post3/400/700',
    likes: 89,
    comments: 12,
    title: '今日皮肤状况',
    isVideo: false,
    aspectRatio: 'aspect-[4/7]',
  },
  {
    id: '4',
    image: 'https://picsum.photos/seed/post4/400/550',
    likes: 342,
    comments: 67,
    title: '祛痘经验',
    isVideo: true,
    aspectRatio: 'aspect-[8/11]',
  },
  {
    id: '5',
    image: 'https://picsum.photos/seed/post5/400/480',
    likes: 156,
    comments: 34,
    title: '保湿打卡',
    isVideo: false,
    aspectRatio: 'aspect-[5/6]',
  },
  {
    id: '6',
    image: 'https://picsum.photos/seed/post6/400/650',
    likes: 78,
    comments: 9,
    title: '晒后修复',
    isVideo: false,
    aspectRatio: 'aspect-[8/13]',
  },
  {
    id: '7',
    image: 'https://picsum.photos/seed/post7/400/520',
    likes: 234,
    comments: 56,
    title: '换季护肤',
    isVideo: false,
    aspectRatio: 'aspect-[10/13]',
  },
  {
    id: '8',
    image: 'https://picsum.photos/seed/post8/400/750',
    likes: 445,
    comments: 89,
    title: '成分分析',
    isVideo: true,
    aspectRatio: 'aspect-[8/15]',
  },
  {
    id: '9',
    image: 'https://picsum.photos/seed/post9/400/580',
    likes: 167,
    comments: 28,
    title: '医美体验',
    isVideo: false,
    aspectRatio: 'aspect-[20/29]',
  },
  {
    id: '10',
    image: 'https://picsum.photos/seed/post10/400/620',
    likes: 198,
    comments: 42,
    title: '日常护理',
    isVideo: false,
    aspectRatio: 'aspect-[20/31]',
  },
];

// 模拟收藏的帖子
const MOCK_SAVED = [
  {
    id: '11',
    image: 'https://picsum.photos/seed/saved1/400/680',
    likes: 567,
    comments: 89,
    title: '专家推荐',
    isVideo: false,
    aspectRatio: 'aspect-[10/17]',
  },
  {
    id: '12',
    image: 'https://picsum.photos/seed/saved2/400/540',
    likes: 234,
    comments: 45,
    title: '护肤知识',
    isVideo: true,
    aspectRatio: 'aspect-[20/27]',
  },
  {
    id: '13',
    image: 'https://picsum.photos/seed/saved3/400/720',
    likes: 890,
    comments: 123,
    title: '产品测评',
    isVideo: false,
    aspectRatio: 'aspect-[5/9]',
  },
  {
    id: '14',
    image: 'https://picsum.photos/seed/saved4/400/560',
    likes: 445,
    comments: 67,
    title: '护肤教程',
    isVideo: true,
    aspectRatio: 'aspect-[5/7]',
  },
];

export default function Profile({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');

  const stats = [
    { label: '帖子', value: 128 },
    { label: '粉丝', value: '3.2k' },
    { label: '关注', value: 156 },
  ];

  const displayPosts = activeTab === 'posts' ? MOCK_POSTS : MOCK_SAVED;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {/* 顶部背景装饰 */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-blue-500/10 via-blue-500/5 to-transparent pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 px-4 py-3 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-sm font-medium text-gray-600">个人主页</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, rotate: 15 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('settings')}
          className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-600 hover:text-blue-500 hover:border-blue-200 transition-colors"
        >
          <Settings size={20} />
        </motion.button>
      </header>

      {/* 用户信息卡片 */}
      <div className="relative z-10 px-4 pb-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100"
        >
          {/* 头像和基本信息 */}
          <div className="flex items-start gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('profile_edit')}
              className="relative shrink-0"
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50 ring-4 ring-white shadow-lg">
                <img 
                  src="https://picsum.photos/seed/avatar/200/200" 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Camera size={14} className="text-white" />
              </div>
            </motion.button>
            
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-gray-900">健康守护者</h2>
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-3">ID: 88472910</p>
              
              {/* 数据统计 */}
              <div className="flex items-center gap-6">
                {stats.map((stat, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-left"
                  >
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-400">{stat.label}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* 个人简介 */}
          <div className="mt-4 pt-4 border-t border-gray-50">
            <p className="text-sm text-gray-600 leading-relaxed">
              记录皮肤变化，分享护肤心得。坚持科学护肤，追求健康肌肤。
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <MapPin size={12} />
                <span>上海</span>
              </div>
              <div className="flex items-center gap-1">
                <Link2 size={12} />
                <span>skinhealth.app</span>
              </div>
            </div>
          </div>

          {/* 编辑资料按钮 */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onNavigate('profile_edit')}
            className="w-full mt-4 py-2.5 rounded-xl bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
          >
            编辑资料
            <ChevronRight size={14} />
          </motion.button>
        </motion.div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 px-4">
        {/* 标签切换 */}
        <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-4">
          <div className="flex gap-1">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('posts')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'posts'
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Grid3X3 size={16} />
              我的帖子
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('saved')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'saved'
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Bookmark size={16} />
              收藏
            </motion.button>
          </div>
        </div>

        {/* 帖子瀑布流 - 两列小红书风格 */}
        <div className="flex gap-3 pb-4">
          {/* 左列 */}
          <div className="flex-1 flex flex-col gap-3">
            {displayPosts.filter((_, idx) => idx % 2 === 0).map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileTap={{ scale: 0.98 }}
                className="relative bg-gray-100 rounded-2xl overflow-hidden cursor-pointer group shadow-sm"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                
                {/* 底部信息遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* 悬停显示数据 */}
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-sm font-medium truncate mb-2">{post.title}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-white/90">
                      <Heart size={14} fill="currentColor" />
                      <span className="text-xs font-medium">{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/90">
                      <MessageCircle size={14} fill="currentColor" />
                      <span className="text-xs font-medium">{post.comments}</span>
                    </div>
                  </div>
                </div>

                {/* 视频标识 */}
                {post.isVideo && (
                  <div className="absolute top-3 right-3 w-7 h-7 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent ml-0.5" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          
          {/* 右列 */}
          <div className="flex-1 flex flex-col gap-3">
            {displayPosts.filter((_, idx) => idx % 2 === 1).map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 + 0.05 }}
                whileTap={{ scale: 0.98 }}
                className="relative bg-gray-100 rounded-2xl overflow-hidden cursor-pointer group shadow-sm"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                
                {/* 底部信息遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* 悬停显示数据 */}
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-sm font-medium truncate mb-2">{post.title}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-white/90">
                      <Heart size={14} fill="currentColor" />
                      <span className="text-xs font-medium">{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/90">
                      <MessageCircle size={14} fill="currentColor" />
                      <span className="text-xs font-medium">{post.comments}</span>
                    </div>
                  </div>
                </div>

                {/* 视频标识 */}
                {post.isVideo && (
                  <div className="absolute top-3 right-3 w-7 h-7 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent ml-0.5" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* 加载更多提示 */}
        <div className="text-center py-6">
          <p className="text-xs text-gray-400">已经到底啦</p>
        </div>
      </div>
    </div>
  );
}
