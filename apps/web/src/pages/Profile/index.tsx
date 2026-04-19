// AI辅助生成：TraeCN, 2026-3-29 - 修改个人中心布局，移除我的咨询和专家预约入口
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Grid3X3, Bookmark, Heart, MessageCircle, Camera, MapPin, Link2, ChevronRight } from 'lucide-react';
import { Page } from '../../types';

// 本地图片库
const LOCAL_IMAGES = [
  '/images/保养/图片1.png',
  '/images/保养/图片2.png',
  '/images/保养/图片3.png',
  '/images/保养/图片4.png',
  '/images/保养/图片5.png',
  '/images/保养/图片6.png',
  '/images/保养/图片7.png',
  '/images/保养/图片8.png',
  '/images/保养/图片9.png',
  '/images/保养/图片10.png',
];

// 使用 DiceBear API 生成随机卡通头像
const getRandomAvatar = (seed?: string) => {
  const randomSeed = seed || Math.random().toString(36).substring(7);
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
};

// 模拟用户发布的帖子数据 - 两列瀑布流，不同高度
const MOCK_POSTS = [
  {
    id: '1',
    image: LOCAL_IMAGES[0],
    likes: 128,
    comments: 23,
    title: '皮肤状态记录',
    isVideo: true,
    aspectRatio: 'aspect-[2/3]',
  },
  {
    id: '2',
    image: LOCAL_IMAGES[1],
    likes: 256,
    comments: 45,
    title: '护肤心得分享',
    isVideo: false,
    aspectRatio: 'aspect-[4/5]',
  },
  {
    id: '3',
    image: LOCAL_IMAGES[2],
    likes: 89,
    comments: 12,
    title: '今日皮肤状况',
    isVideo: false,
    aspectRatio: 'aspect-[4/7]',
  },
  {
    id: '4',
    image: LOCAL_IMAGES[3],
    likes: 342,
    comments: 67,
    title: '祛痘经验',
    isVideo: true,
    aspectRatio: 'aspect-[8/11]',
  },
  {
    id: '5',
    image: LOCAL_IMAGES[4],
    likes: 156,
    comments: 34,
    title: '保湿打卡',
    isVideo: false,
    aspectRatio: 'aspect-[5/6]',
  },
  {
    id: '6',
    image: LOCAL_IMAGES[5],
    likes: 78,
    comments: 9,
    title: '晒后修复',
    isVideo: false,
    aspectRatio: 'aspect-[8/13]',
  },
  {
    id: '7',
    image: LOCAL_IMAGES[6],
    likes: 234,
    comments: 56,
    title: '换季护肤',
    isVideo: false,
    aspectRatio: 'aspect-[10/13]',
  },
  {
    id: '8',
    image: LOCAL_IMAGES[7],
    likes: 445,
    comments: 89,
    title: '成分分析',
    isVideo: true,
    aspectRatio: 'aspect-[8/15]',
  },
  {
    id: '9',
    image: LOCAL_IMAGES[8],
    likes: 167,
    comments: 28,
    title: '医美体验',
    isVideo: false,
    aspectRatio: 'aspect-[20/29]',
  },
  {
    id: '10',
    image: LOCAL_IMAGES[9],
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
    image: '/images/皮肤病/图片2.png',
    likes: 567,
    comments: 89,
    title: '专家推荐',
    isVideo: false,
    aspectRatio: 'aspect-[10/17]',
  },
  {
    id: '12',
    image: '/images/皮肤病/图片3.png',
    likes: 234,
    comments: 45,
    title: '护肤知识',
    isVideo: true,
    aspectRatio: 'aspect-[20/27]',
  },
  {
    id: '13',
    image: '/images/皮肤病/图片4.png',
    likes: 890,
    comments: 123,
    title: '产品测评',
    isVideo: false,
    aspectRatio: 'aspect-[5/9]',
  },
];

interface ProfilePageProps {
  onNavigate: (page: Page) => void;
}

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const posts = activeTab === 'posts' ? MOCK_POSTS : MOCK_SAVED;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 个人信息卡片 */}
      <div className="px-4 py-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative">
          <div className="flex items-start gap-4">
            {/* 头像 */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 ring-4 ring-gray-50">
                <img
                  src={getRandomAvatar()}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg">
                <Camera size={14} />
              </button>
            </div>

            {/* 设置按钮 */}
            <button 
              onClick={() => onNavigate('settings')}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Settings size={20} className="text-gray-600" />
            </button>

            {/* 用户信息 */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">健康守护者</h2>
              <p className="text-sm text-gray-500 mt-1">ID: 88472910</p>
              
              {/* 统计 */}
              <div className="flex items-center gap-6 mt-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">128</div>
                  <div className="text-xs text-gray-500">帖子</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">3.2k</div>
                  <div className="text-xs text-gray-500">粉丝</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">156</div>
                  <div className="text-xs text-gray-500">关注</div>
                </div>
              </div>
            </div>
          </div>

          {/* 简介 */}
          <p className="text-sm text-gray-600 mt-4 leading-relaxed">
            记录皮肤变化，分享护肤心得。坚持科学护肤，追求健康肌肤。
          </p>

          {/* 位置 */}
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              上海
            </span>
            <span className="flex items-center gap-1">
              <Link2 size={14} />
              zhijifu.com
            </span>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 mt-4">
            <button 
              onClick={() => onNavigate('profile_edit')}
              className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-semibold text-gray-900 hover:bg-gray-200 transition-colors"
            >
              编辑资料
            </button>
            <button className="flex-1 py-2.5 bg-blue-500 rounded-xl text-sm font-semibold text-white hover:bg-blue-600 transition-colors">
              我的帖子
            </button>
          </div>
        </div>
      </div>

      {/* 内容标签 */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 flex">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'posts'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Grid3X3 size={18} />
              我的帖子
            </div>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'saved'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Bookmark size={18} />
              收藏
            </div>
          </button>
        </div>
      </div>

      {/* 瀑布流帖子 */}
      <div className="flex-1 px-4 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {posts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`relative rounded-2xl overflow-hidden bg-gray-100 cursor-pointer group ${post.aspectRatio}`}
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              
              {/* 视频标识 */}
              {post.isVideo && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-0.5" />
                </div>
              )}

              {/* 遮罩层 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white text-xs font-medium line-clamp-2 mb-2">
                    {post.title}
                  </p>
                  <div className="flex items-center gap-3 text-white/80 text-xs">
                    <span className="flex items-center gap-1">
                      <Heart size={12} />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={12} />
                      {post.comments}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 底部提示 */}
        <div className="text-center py-8">
          <p className="text-sm text-gray-400">已经到底啦</p>
        </div>
      </div>
    </div>
  );
}
