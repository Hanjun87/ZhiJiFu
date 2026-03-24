import React from 'react';
import { ArrowLeft, Share2, Shield, Activity, MessageSquare, ThumbsUp } from 'lucide-react';
import { MOCK_POSTS } from './constants';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis } from 'recharts';
import { Page } from '../../types';

export const PostDetail = ({ onNavigate }: { onNavigate: (p: Page) => void }) => {
  // We're mocking the ID here since we don't have a real router params in this flow
  const post = MOCK_POSTS[0];

  return (
    <div className="bg-gray-50 h-full overflow-y-auto pb-20">
      <header className="sticky top-0 left-0 right-0 bg-white/80 backdrop-blur-xl z-50 px-6 py-3 flex items-center justify-between shadow-sm pt-8">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('community')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">皮肤健康社区</h1>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Share2 size={24} />
        </button>
      </header>

      <main className="pt-6 px-6 max-w-3xl mx-auto space-y-8">
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <img src={post.author.avatar} alt="" className="w-12 h-12 rounded-full" />
            <div>
              <p className="font-bold text-gray-900">{post.author.name}</p>
              <p className="text-xs text-gray-400">{post.time} · {post.author.location}</p>
            </div>
            <button className="ml-auto px-4 py-1.5 bg-blue-600 text-white rounded-full text-sm font-semibold">
              关注
            </button>
          </div>
          <h2 className="text-2xl font-bold leading-tight">{post.title}</h2>
          <p className="text-gray-600 leading-relaxed">{post.content}</p>
        </section>

        {post.report && (
          <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-blue-600 flex items-center gap-2">
                <Activity size={16} /> 当日检测报告
              </h3>
              <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-lg">状态良好</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-gray-900">{post.report.score}</span>
              <span className="text-sm text-gray-400">/100 肤色健康度</span>
            </div>
            <div className="h-24 w-full mt-4">
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
          </div>
        )}

        {post.protection && (
          <div className="bg-gray-100 p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-gray-500 flex items-center gap-2">
              <Shield size={16} /> 防护措施记录
            </h3>
            <div className="flex flex-wrap gap-2">
              {post.protection.measures.map((m, i) => (
                <div key={i} className="bg-white px-3 py-2 rounded-xl shadow-sm text-xs font-medium">
                  {m}
                </div>
              ))}
            </div>
            <img src={post.protection.image} alt="" className="w-full h-32 object-cover rounded-2xl" />
          </div>
        )}

        {post.expertReply && (
          <section className="bg-blue-50/50 rounded-[2rem] p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-blue-600 fill-blue-600" />
                <h3 className="text-lg font-bold text-blue-600">专家专业回复</h3>
              </div>
              <span className="text-xs text-blue-600 font-medium px-3 py-1 bg-white rounded-full">已认证医师</span>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <img src={post.expertReply.expert.avatar} alt="" className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-bold text-gray-900">{post.expertReply.expert.name}</p>
                  <p className="text-xs text-gray-400">{post.expertReply.expert.hospital} {post.expertReply.expert.title}</p>
                </div>
              </div>
              <div className="text-sm text-gray-700 leading-relaxed bg-blue-50/30 p-4 rounded-xl border-l-4 border-blue-600">
                {post.expertReply.content}
              </div>
              <div className="flex items-center justify-between pt-2">
                <button className="flex items-center gap-1 text-xs font-bold text-blue-600">
                  <MessageSquare size={14} /> 二次提问
                </button>
                <span className="text-[10px] text-gray-400">回复于 {post.expertReply.time}</span>
              </div>
            </div>
          </section>
        )}

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">评论交流 ({post.comments})</h3>
            <div className="flex gap-4 text-sm text-gray-400">
              <button className="text-blue-600 font-bold">最热</button>
              <button>最新</button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-2xl flex gap-3">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=user2" alt="" className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold">苏西苏西</span>
                  <button className="flex items-center gap-1 text-gray-400">
                    <ThumbsUp size={14} /> <span className="text-xs">12</span>
                  </button>
                </div>
                <p className="text-sm text-gray-600">姐妹用的哪款防晒？最近我也在打卡，感觉肤色值波动很大😭</p>
                <p className="text-[10px] text-gray-400 mt-2">45分钟前</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
