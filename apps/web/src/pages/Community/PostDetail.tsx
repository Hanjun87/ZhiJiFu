import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Share2, Shield, Activity, MessageSquare, ThumbsUp, Heart } from 'lucide-react';
import { MOCK_POSTS } from './constants';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis } from 'recharts';
import { Page } from '../../types';

export const PostDetail = ({ onNavigate }: { onNavigate: (p: Page) => void }) => {
  const post = MOCK_POSTS[0];

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
          <h1 className="text-lg font-bold text-gray-900">帖子详情</h1>
          <button className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
            <Share2 size={18} />
          </button>
        </div>
      </header>

      <main className="p-6">
        {/* Author */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mb-5"
        >
          <img src={post.author.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
          <div className="flex-1">
            <p className="font-bold text-gray-900">{post.author.name}</p>
            <p className="text-xs text-gray-400">{post.time} · {post.author.location}</p>
          </div>
          <button className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 transition-colors">
            关注
          </button>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-xl font-bold leading-tight text-gray-900 mb-3">{post.title}</h2>
          <p className="text-gray-600 leading-relaxed">{post.content}</p>
        </motion.div>

        {/* Report Card */}
        {post.report && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Activity size={18} />
                <span className="text-sm font-bold">当日检测报告</span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full">状态良好</span>
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-black text-gray-900">{post.report.score}</span>
              <span className="text-sm text-gray-400">/100 肤色健康度</span>
            </div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={post.report.trend}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#2563eb" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#2563eb' }} 
                  />
                  <XAxis dataKey="day" hide />
                  <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>Day 1</span>
                <span>Day 15</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Protection Card */}
        {post.protection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6"
          >
            <div className="flex items-center gap-2 text-gray-700 mb-4">
              <Shield size={18} />
              <span className="text-sm font-bold">防护措施记录</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {post.protection.measures.map((m, i) => (
                <span key={i} className="bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700">
                  {m}
                </span>
              ))}
            </div>
            <img src={post.protection.image} alt="" className="w-full h-40 object-cover rounded-xl" />
          </motion.div>
        )}

        {/* Expert Reply */}
        {post.expertReply && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="bg-blue-50 rounded-2xl p-5 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-blue-600" />
                <span className="font-bold text-blue-600">专家专业回复</span>
              </div>
              <span className="text-xs text-blue-600 font-bold px-2.5 py-1 bg-white rounded-full">已认证医师</span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <img src={post.expertReply.expert.avatar} alt="" className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-bold text-gray-900 text-sm">{post.expertReply.expert.name}</p>
                  <p className="text-xs text-gray-400">{post.expertReply.expert.hospital} {post.expertReply.expert.title}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed bg-blue-50/50 p-3 rounded-lg">
                {post.expertReply.content}
              </p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <button className="flex items-center gap-1 text-xs font-bold text-blue-600">
                  <MessageSquare size={14} /> 二次提问
                </button>
                <span className="text-[10px] text-gray-400">{post.expertReply.time}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Comments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">评论交流 ({post.comments})</h3>
            <div className="flex gap-4 text-sm">
              <button className="text-blue-600 font-bold">最热</button>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">最新</button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex gap-3">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=user2" alt="" className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-900">苏西苏西</span>
                    <button className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors">
                      <Heart size={14} /> <span className="text-xs">12</span>
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">姐妹用的哪款防晒？最近我也在打卡，感觉肤色值波动很大😭</p>
                  <p className="text-[10px] text-gray-400 mt-2">45分钟前</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
