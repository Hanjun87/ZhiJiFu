import React from 'react';
import { Search, MessageCircle, Plus } from 'lucide-react';
import { MOCK_USERS, MOCK_ARTICLES } from './constants';
import { Page } from '../../types';
import BackButton from '../../components/common/BackButton';

export const ExpertColumn = ({ onNavigate }: { onNavigate: (p: Page) => void }) => {
  const experts = [MOCK_USERS.doctor_lin, MOCK_USERS.prof_zhang];

  return (
    <div className="pb-24 bg-gray-50 h-full">
      <header className="sticky top-0 left-0 right-0 bg-white/80 backdrop-blur-xl z-50 px-6 py-3 flex flex-col gap-4 shadow-sm pt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton onClick={() => onNavigate('community')} />
            <h1 className="text-xl font-bold text-gray-900">皮肤健康社区</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=doc" alt="User" />
          </div>
        </div>
        <nav className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-1">
          {['湿疹', '痤疮', '皮炎', '过敏', '日常护理', '专家专栏'].map((tab, i) => (
            <div 
              key={i} 
              className={`whitespace-nowrap font-medium transition-all ${tab === '专家专栏' ? 'text-blue-600 border-b-2 border-blue-600 font-bold' : 'text-gray-400'}`}
            >
              {tab}
            </div>
          ))}
        </nav>
      </header>

      <main className="pt-6 px-6 max-w-7xl mx-auto">
        <section className="mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">专家专栏</h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            汇集国内顶级皮肤科专家，为您提供最权威、最科学的皮肤健康科普，助力科学护肤，告别盲目。
          </p>
        </section>

        <section className="mb-12">
          <h3 className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-6 flex items-center gap-2">
            <span className="w-8 h-[2px] bg-blue-600"></span> 驻站专家
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {experts.map((expert, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-transparent hover:border-blue-100 transition-all">
                <div className="flex items-start gap-4 mb-6">
                  <div className="relative">
                    <img src={expert.avatar} alt="" className="w-16 h-16 rounded-xl object-cover bg-gray-100" />
                    <span className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{expert.name}</h4>
                    <p className="text-sm text-blue-600 font-medium">{expert.title} · {expert.hospital}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">从业年限</p>
                    <p className="text-sm font-bold">{expert.experience}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">回复咨询</p>
                    <p className="text-sm font-bold">{expert.consultations?.toLocaleString()}次</p>
                  </div>
                </div>
                <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${i === 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-blue-600'}`}>
                  {i === 0 ? <MessageCircle size={16} /> : null}
                  {i === 0 ? '向专家提问' : '在线咨询'}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-600 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-blue-600"></span> 精选文章
            </h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">热门</span>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">最新</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_ARTICLES.map((article, i) => (
              <article key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="h-48 overflow-hidden relative">
                  <img src={article.cover} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-blue-600 uppercase">
                    {article.category}
                  </div>
                </div>
                <div className="p-6">
                  <h5 className="text-xl font-bold mb-3 line-clamp-2">{article.title}</h5>
                  <p className="text-sm text-gray-500 mb-6 line-clamp-3 leading-relaxed">{article.summary}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={article.author.avatar} alt="" className="w-6 h-6 rounded-full bg-gray-100" />
                      <span className="text-xs font-medium text-gray-400">{article.author.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>👁️ {article.views}</span>
                      <span>❤️ {article.likes}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <button className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-40 active:scale-95 transition-transform">
        <Plus size={28} />
      </button>
    </div>
  );
};
