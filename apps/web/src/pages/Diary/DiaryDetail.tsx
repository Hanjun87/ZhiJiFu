import React from 'react';
import { AlertCircle, ArrowLeft, Droplets, Moon, Smile, Sun, Activity } from 'lucide-react';

export default function DiaryDetail({
  record,
  onBack,
}: {
  record: any | null;
  onBack: () => void;
}) {
  if (!record) return null;
  return (
    <div className="flex flex-col h-full bg-gray-50 pb-24 overflow-y-auto">
      <header className="pt-12 px-6 pb-6 bg-white shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 active:scale-95">
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-blue-500 font-bold text-sm tracking-wider uppercase mb-1">Diary Detail</p>
            <h1 className="text-2xl font-bold text-gray-900">{record.date}</h1>
          </div>
        </div>
      </header>
      <div className="px-6 space-y-6 mt-6">
        <div className={`p-6 rounded-3xl border shadow-sm flex items-center gap-4 ${record.skin === '正常' ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'}`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${record.skin === '正常' ? 'bg-white text-emerald-500' : 'bg-white text-orange-500'}`}>
            {record.skin === '正常' ? <Smile size={32} /> : <AlertCircle size={32} />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">皮肤状态: {record.skin}</h3>
            <p className="text-sm text-gray-500">记录于 {record.date}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                <Sun size={20} />
              </div>
              <span className="text-xs font-bold text-gray-400">UV 强度</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-gray-900">{record.uv}</span>
              <span className="text-xs font-bold text-gray-400">指数</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                <Droplets size={20} />
              </div>
              <span className="text-xs font-bold text-gray-400">饮水量</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-gray-900">{record.water}</span>
              <span className="text-xs font-bold text-gray-400">杯</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                <Moon size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">睡眠质量</p>
                <p className="font-bold text-gray-900">{record.sleep || '良好'}</p>
              </div>
            </div>
          </div>
          <div className="h-px bg-gray-50" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">心情指数</p>
                <p className="font-bold text-gray-900">{record.mood || '平静'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
