import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Clock, Sun, Droplets, Wind, Thermometer, Camera, TrendingUp, ChevronRight } from 'lucide-react';

interface DiaryDetailProps {
  entry: {
    id: string;
    date: string;
    time: string;
    title: string;
    status: string;
    image: string;
  } | null;
  onBack: () => void;
}

export default function DiaryDetail({ entry, onBack }: DiaryDetailProps) {
  // 如果没有 entry，显示空状态或返回
  if (!entry) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl px-5 py-3 pt-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={20} />
            </motion.button>
            <h1 className="text-lg font-bold text-gray-900">日记详情</h1>
            <div className="w-10" />
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  // 模拟环境数据
  const envData = {
    weather: '晴朗',
    temperature: '22°C',
    humidity: '45%',
    uv: '中等',
  };

  // 模拟皮肤评分
  const skinScores = [
    { label: '水润度', value: 85, color: 'bg-blue-500' },
    { label: '光泽度', value: 78, color: 'bg-amber-500' },
    { label: '细腻度', value: 82, color: 'bg-emerald-500' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl px-5 py-3 pt-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <h1 className="text-lg font-bold text-gray-900">日记详情</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="p-5">
        {/* 日期卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white mb-5 shadow-lg shadow-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">记录日期</p>
              <h2 className="text-3xl font-bold">{entry.date}</h2>
              <div className="flex items-center gap-2 mt-2 text-blue-100">
                <Clock size={16} />
                <span className="text-sm">{entry.time}</span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{entry.date.split('月')[1].replace('日', '')}</span>
              <span className="text-xs">{entry.date.split('月')[0]}月</span>
            </div>
          </div>
        </motion.div>

        {/* 照片卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <Camera size={18} className="text-blue-500" />
              </div>
              <h3 className="font-bold text-gray-900">皮肤照片</h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
              {entry.status}
            </span>
          </div>
          
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
            <img src={entry.image} alt="皮肤记录" className="w-full h-full object-cover" />
          </div>
          
          <p className="text-sm text-gray-600 mt-4 leading-relaxed">
            {entry.title}，皮肤整体状态良好，无明显异常。继续保持当前护肤习惯。
          </p>
        </motion.div>

        {/* 环境信息 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <Sun size={18} className="text-amber-500" />
            </div>
            <h3 className="font-bold text-gray-900">当日环境</h3>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <Sun size={20} className="text-amber-500 mx-auto mb-1" />
              <p className="text-xs text-gray-400">天气</p>
              <p className="text-sm font-bold text-gray-900">{envData.weather}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <Thermometer size={20} className="text-red-500 mx-auto mb-1" />
              <p className="text-xs text-gray-400">温度</p>
              <p className="text-sm font-bold text-gray-900">{envData.temperature}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <Droplets size={20} className="text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-gray-400">湿度</p>
              <p className="text-sm font-bold text-gray-900">{envData.humidity}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <Wind size={20} className="text-purple-500 mx-auto mb-1" />
              <p className="text-xs text-gray-400">紫外线</p>
              <p className="text-sm font-bold text-gray-900">{envData.uv}</p>
            </div>
          </div>
        </motion.div>

        {/* 皮肤评分 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp size={18} className="text-emerald-500" />
            </div>
            <h3 className="font-bold text-gray-900">皮肤评分</h3>
          </div>

          <div className="space-y-4">
            {skinScores.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="text-sm font-bold text-gray-900">{item.value}分</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 0.8, delay: 0.4 + idx * 0.1 }}
                    className={`h-full ${item.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 护肤记录 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                <Droplets size={18} className="text-purple-500" />
              </div>
              <h3 className="font-bold text-gray-900">护肤记录</h3>
            </div>
            <button className="text-blue-600 text-xs font-medium flex items-center gap-1">
              查看全部
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {[
              { time: '08:00', product: '温和洁面乳', type: '清洁' },
              { time: '08:05', product: '保湿爽肤水', type: '补水' },
              { time: '08:10', product: '维生素C精华', type: '精华' },
              { time: '20:00', product: '修复面霜', type: '保湿' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-12 text-xs text-gray-400 font-medium">{item.time}</div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{item.product}</p>
                  <p className="text-xs text-gray-400">{item.type}</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* 备注 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="bg-amber-50 rounded-2xl p-5 border border-amber-100"
        >
          <h3 className="font-bold text-gray-900 mb-3">今日备注</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            今天皮肤状态不错，早上用了新的精华，感觉吸收很好。晚上记得早点休息，保持充足睡眠对皮肤很重要。
          </p>
        </motion.div>
      </main>
    </div>
  );
}
