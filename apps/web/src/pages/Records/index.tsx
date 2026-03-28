import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Eye, Plus, Camera, Sun } from 'lucide-react';
import { Record as SkinRecord } from '../../types';
import { cn } from '../../lib/utils';

interface RecordsProps {
  records: SkinRecord[];
  onSelect: (record: SkinRecord) => void;
  onNavigate: (page: string) => void;
  activeTab?: 'records' | 'diary';
}

const SAMPLE_RECORDS = [
  {
    id: '1',
    title: "过敏性皮炎",
    date: "2023年10月24日 · 下午 2:30",
    status: "恢复中" as const,
    statusColor: "bg-emerald-100 text-emerald-700",
    image: "https://picsum.photos/seed/skin1/200/200",
  },
  {
    id: '2',
    title: "轻微擦伤",
    date: "2023年10月18日 · 上午 10:15",
    status: "待复查" as const,
    statusColor: "bg-blue-100 text-blue-700",
    image: "https://picsum.photos/seed/skin2/200/200",
  },
];

const OLDER_RECORDS = [
  {
    id: '3',
    title: "慢性湿疹",
    date: "2023年09月05日 · 下午 4:50",
    status: "已结束" as const,
    statusColor: "bg-gray-100 text-gray-600",
    image: "https://picsum.photos/seed/skin3/200/200",
  },
];

const SAMPLE_DIARY_ENTRIES = [
  {
    id: '1',
    title: "今日皮肤状况",
    date: "2024年01月15日 · 上午 9:30",
    status: "良好" as const,
    image: "https://picsum.photos/seed/diary1/200/200",
  },
  {
    id: '2',
    title: "晒后修复记录",
    date: "2024年01月14日 · 下午 6:15",
    status: "恢复中" as const,
    image: "https://picsum.photos/seed/diary2/200/200",
  },
];

const OLDER_DIARY_ENTRIES = [
  {
    id: '3',
    title: "冬季保湿打卡",
    date: "2024年01月10日 · 晚上 8:00",
    status: "已结束" as const,
    image: "https://picsum.photos/seed/diary3/200/200",
  },
];

export default function Records({
  records,
  onSelect,
  onNavigate,
  activeTab = 'records',
}: RecordsProps) {
  const [currentTab, setCurrentTab] = useState<'records' | 'diary'>(activeTab);

  const allRecords = records.length > 0 ? records : SAMPLE_RECORDS.map(r => ({
    ...r,
    probability: 0.85,
    typicalImage: r.image,
  }));

  const statusColorMap: Record<string, string> = {
    '恢复中': 'bg-emerald-100 text-emerald-700',
    '待复查': 'bg-blue-100 text-blue-700',
    '已结束': 'bg-gray-100 text-gray-600',
    '良好': 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white px-5 py-3 pt-6">
        <h1 className="text-lg font-bold text-gray-900 text-center">健康档案</h1>
      </header>

      <div className="p-6">
        {/* Tab Switcher - 统一风格 */}
        <div className="flex bg-gray-100/80 p-1.5 rounded-2xl mb-6">
          <button 
            onClick={() => setCurrentTab('records')}
            className={cn(
              "flex-1 py-2.5 text-sm font-bold text-center rounded-xl transition-all duration-200",
              currentTab === 'records' 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            检测记录
          </button>
          <button 
            onClick={() => setCurrentTab('diary')}
            className={cn(
              "flex-1 py-2.5 text-sm font-bold text-center rounded-xl transition-all duration-200",
              currentTab === 'diary' 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            皮肤日记
          </button>
        </div>

        {currentTab === 'records' && (
          <>
            <section className="mb-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">最近记录</h3>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.28 }}
                className="space-y-4"
              >
                {allRecords.slice(0, 2).map((record) => (
                  <RecordCard key={record.id} record={record} onSelect={onSelect} />
                ))}
              </motion.div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">更早记录</h3>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.28, delay: 0.06 }}
                className="space-y-4"
              >
                {allRecords.slice(2).map((record) => (
                  <RecordCard key={record.id} record={record} onSelect={onSelect} />
                ))}
                {OLDER_RECORDS.map((record) => (
                  <RecordCard 
                    key={record.id} 
                    record={{
                      ...record,
                      probability: 0.75,
                      typicalImage: record.image,
                    }} 
                    onSelect={onSelect} 
                  />
                ))}
              </motion.div>
            </section>
          </>
        )}

        {currentTab === 'diary' && (
          <>
            <section className="mb-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">最近记录</h3>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.28 }}
                className="space-y-4"
              >
                {SAMPLE_DIARY_ENTRIES.map((entry) => (
                  <motion.button
                    key={entry.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full flex items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <img 
                      src={entry.image} 
                      alt={entry.title} 
                      className="w-16 h-16 rounded-xl object-cover bg-gray-100" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1.5">
                        <h4 className="font-bold text-gray-900 truncate">{entry.title}</h4>
                        <span className={cn("text-[10px] px-2.5 py-1 rounded-full font-bold", statusColorMap[entry.status] || 'bg-gray-100 text-gray-600')}>
                          {entry.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{entry.date}</p>
                      <div className="flex items-center gap-1.5 text-blue-600 text-xs font-semibold">
                        <Eye size={14} />
                        <span>查看详情</span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-300" />
                  </motion.button>
                ))}
              </motion.div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">更早记录</h3>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.28, delay: 0.06 }}
                className="space-y-4"
              >
                {OLDER_DIARY_ENTRIES.map((entry) => (
                  <motion.button
                    key={entry.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full flex items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <img 
                      src={entry.image} 
                      alt={entry.title} 
                      className="w-16 h-16 rounded-xl object-cover bg-gray-100" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1.5">
                        <h4 className="font-bold text-gray-900 truncate">{entry.title}</h4>
                        <span className={cn("text-[10px] px-2.5 py-1 rounded-full font-bold", statusColorMap[entry.status] || 'bg-gray-100 text-gray-600')}>
                          {entry.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{entry.date}</p>
                      <div className="flex items-center gap-1.5 text-blue-600 text-xs font-semibold">
                        <Eye size={14} />
                        <span>查看详情</span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-300" />
                  </motion.button>
                ))}
              </motion.div>
            </section>

            {/* 快速记录卡片 */}
            <section className="mt-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">快速记录</h3>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 rounded-2xl bg-white shadow-sm border border-gray-100 text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                    <Camera className="text-blue-600" size={20} />
                  </div>
                  <p className="text-sm font-bold text-gray-900">拍照记录</p>
                  <p className="text-xs text-gray-400 mt-1">记录今日皮肤状态</p>
                </motion.button>
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 rounded-2xl bg-white shadow-sm border border-gray-100 text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
                    <Sun className="text-amber-500" size={20} />
                  </div>
                  <p className="text-sm font-bold text-gray-900">防晒打卡</p>
                  <p className="text-xs text-gray-400 mt-1">记录防晒措施</p>
                </motion.button>
              </div>
            </section>
          </>
        )}
      </div>

      {/* FAB - 统一风格 */}
      <motion.button 
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-28 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_8px_30px_rgba(37,99,235,0.4)]"
      >
        <Plus size={28} />
      </motion.button>
    </div>
  );
}

interface RecordCardProps {
  record: SkinRecord & { statusColor?: string };
  onSelect: (r: SkinRecord) => void;
}

const RecordCard: React.FC<RecordCardProps> = ({ record, onSelect }) => {
  const statusColorMap: Record<string, string> = {
    '恢复中': 'bg-emerald-100 text-emerald-700',
    '待复查': 'bg-blue-100 text-blue-700',
    '已结束': 'bg-gray-100 text-gray-600',
  };

  return (
    <motion.button
      onClick={() => onSelect(record)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="w-full flex items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <img 
        src={record.image} 
        alt={record.title} 
        className="w-16 h-16 rounded-xl object-cover bg-gray-100" 
        referrerPolicy="no-referrer" 
      />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1.5">
          <h4 className="font-bold text-gray-900 truncate">{record.title}</h4>
          <span className={cn("text-[10px] px-2.5 py-1 rounded-full font-bold", statusColorMap[record.status] || 'bg-gray-100 text-gray-600')}>
            {record.status}
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-2">{record.date}</p>
        <div className="flex items-center gap-1.5 text-blue-600 text-xs font-semibold">
          <Eye size={14} />
          <span>查看报告</span>
        </div>
      </div>
      <ChevronRight size={20} className="text-gray-300" />
    </motion.button>
  );
};
