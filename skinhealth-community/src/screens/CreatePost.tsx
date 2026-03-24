import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Microscope, Tag } from 'lucide-react';

export const CreatePost: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl z-50 px-6 h-16 flex items-center justify-between shadow-sm">
        <button onClick={() => navigate(-1)} className="text-gray-500 font-medium">取消</button>
        <h1 className="text-blue-600 text-lg font-bold">发布帖子</h1>
        <button className="bg-blue-600 text-white px-5 py-1.5 rounded-full font-bold text-sm">
          发布
        </button>
      </header>

      <main className="pt-20 px-6 max-w-screen-md mx-auto space-y-8">
        <section className="space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <input 
              type="text" 
              placeholder="标题" 
              className="w-full border-none focus:ring-0 text-xl font-bold placeholder:text-gray-300 p-0 bg-transparent"
            />
          </div>
          <div className="bg-white rounded-xl p-4 min-h-[200px] shadow-sm">
            <textarea 
              placeholder="分享你的皮肤状况或护理心得..." 
              className="w-full border-none focus:ring-0 text-base placeholder:text-gray-300 p-0 bg-transparent resize-none min-h-[160px]"
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <button className="aspect-square bg-gray-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200 text-gray-400 hover:bg-gray-200 transition-colors">
              <Plus size={32} />
              <span className="text-[10px] font-bold mt-1">上传图片</span>
            </button>
            <div className="aspect-square rounded-xl overflow-hidden relative">
              <img src="https://picsum.photos/seed/upload/400/400" alt="" className="w-full h-full object-cover" />
              <button className="absolute top-1 right-1 bg-black/40 text-white rounded-full p-1 backdrop-blur-md">
                <X size={14} />
              </button>
            </div>
          </div>

          <button className="w-full flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg shadow-lg shadow-blue-200">
                <Microscope size={20} />
              </div>
              <div className="text-left">
                <p className="font-bold text-blue-600 text-sm">添加识别报告</p>
                <p className="text-xs text-blue-400">关联您的 AI 皮肤分析数据</p>
              </div>
            </div>
            <Plus size={20} className="text-blue-600" />
          </button>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-blue-600" />
            <h3 className="font-bold text-sm text-gray-900">选择话题</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {['湿疹', '痤疮', '皮炎', '护肤心得'].map((tag, i) => (
              <button 
                key={i} 
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${i === 0 ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-500'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        <section className="pt-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <X size={20} />
              </div>
              <div>
                <span className="text-sm font-bold text-gray-900 block">匿名发布</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">不显示个人头像和昵称</span>
              </div>
            </div>
            <div className="relative inline-flex items-center">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
          </label>
        </section>
      </main>
    </div>
  );
};
