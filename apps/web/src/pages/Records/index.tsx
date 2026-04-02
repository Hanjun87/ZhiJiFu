import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Eye, Clock } from 'lucide-react';
import { Record as SkinRecord } from '../../types';
import { cn } from '../../lib/utils';

interface RecordsProps {
  records: SkinRecord[];
  onSelect: (record: SkinRecord) => void;
  onNavigate: (page: string) => void;
  onSelectDiary?: (entry: {id: string; date: string; time: string; title: string; status: string; image: string}) => void;
  activeTab?: 'records' | 'diary';
}

const SAMPLE_RECORDS = [
  {
    id: '1',
    title: "过敏性皮炎",
    date: "10月24日",
    time: "14:30",
    status: "恢复中" as const,
    statusColor: "bg-emerald-100 text-emerald-700",
    image: "https://picsum.photos/seed/skin1/200/200",
  },
  {
    id: '2',
    title: "轻微擦伤",
    date: "10月18日",
    time: "10:15",
    status: "待复查" as const,
    statusColor: "bg-blue-100 text-blue-700",
    image: "https://picsum.photos/seed/skin2/200/200",
  },
];

const OLDER_RECORDS = [
  {
    id: '3',
    title: "慢性湿疹",
    date: "09月05日",
    time: "16:50",
    status: "已结束" as const,
    statusColor: "bg-gray-100 text-gray-600",
    image: "https://picsum.photos/seed/skin3/200/200",
  },
];

// 皮肤日记数据 - 日期在前，描述在后
const SAMPLE_DIARY_ENTRIES = [
  {
    id: '1',
    date: "01月15日",
    time: "09:30",
    title: "今日皮肤状况",
    status: "良好" as const,
    image: "https://picsum.photos/seed/diary1/200/200",
  },
  {
    id: '2',
    date: "01月14日",
    time: "18:15",
    title: "晒后修复记录",
    status: "恢复中" as const,
    image: "https://picsum.photos/seed/diary2/200/200",
  },
];

const OLDER_DIARY_ENTRIES = [
  {
    id: '3',
    date: "01月10日",
    time: "20:00",
    title: "冬季保湿打卡",
    status: "已结束" as const,
    image: "https://picsum.photos/seed/diary3/200/200",
  },
];

export default function Records({
  records,
  onSelect,
  onNavigate,
  onSelectDiary,
  activeTab = 'records',
}: RecordsProps) {
  const [currentTab, setCurrentTab] = useState<'records' | 'diary'>(activeTab);



  const statusColorMap: Record<string, string> = {
    '恢复中': 'bg-emerald-100 text-emerald-700',
    '待复查': 'bg-blue-100 text-blue-700',
    '已结束': 'bg-gray-100 text-gray-600',
    '良好': 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* 顶部背景装饰 */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-blue-500/10 via-blue-500/5 to-transparent pointer-events-none" />
      
      {/* Header */}
      <header className="sticky top-0 z-10 px-5 py-3 pt-6">
        {/* Tab Switcher - 胶囊按钮风格 */}
        <div className="flex items-center justify-center">
          <div className="flex bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-sm border border-gray-100">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentTab('records')}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                currentTab === 'records'
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              检测记录
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentTab('diary')}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                currentTab === 'diary'
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              皮肤日记
            </motion.button>
          </div>
        </div>
      </header>

      <div className="p-6">

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
                {SAMPLE_RECORDS.map((record) => (
                  <RecordCard 
                    key={record.id} 
                    record={record} 
                    statusColorMap={statusColorMap}
                    onSelect={onSelect} 
                  />
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
                {OLDER_RECORDS.map((record) => (
                  <RecordCard 
                    key={record.id} 
                    record={record}
                    statusColorMap={statusColorMap}
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
                  <DiaryCard 
                    key={entry.id}
                    entry={entry} 
                    statusColorMap={statusColorMap} 
                    onClick={() => {
                      onSelectDiary?.(entry);
                      onNavigate('diary_detail');
                    }}
                  />
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
                  <DiaryCard 
                    key={entry.id} 
                    entry={entry} 
                    statusColorMap={statusColorMap}
                    onClick={() => {
                      onSelectDiary?.(entry);
                      onNavigate('diary_detail');
                    }}
                  />
                ))}
              </motion.div>
            </section>
          </>
        )}
      </div>

    </div>
  );
}

interface DiaryCardProps {
  entry: {
    id: string;
    date: string;
    time: string;
    title: string;
    status: string;
    image: string;
  };
  statusColorMap: Record<string, string>;
  onClick?: () => void;
}

const DiaryCard: React.FC<DiaryCardProps> = ({ entry, statusColorMap, onClick }) => (
  <motion.button
    onClick={onClick}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2, scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    className="w-full flex items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
  >
    {/* 日期显示 - 左侧 */}
    <div className="flex flex-col items-center justify-center w-14 h-14 bg-blue-50 rounded-xl shrink-0">
      <span className="text-lg font-bold text-blue-600">{entry.date.split('月')[1].replace('日', '')}</span>
      <span className="text-[10px] text-blue-400">{entry.date.split('月')[0]}月</span>
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <Clock size={12} className="text-gray-400" />
        <span className="text-xs text-gray-500">{entry.time}</span>
      </div>

      <p className="text-base font-bold text-gray-900 mb-2 truncate">{entry.title}</p>

      {/* 第三行：状态标签 */}
      <div className="flex items-center gap-2">
        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", statusColorMap[entry.status] || 'bg-gray-100 text-gray-600')}>
          {entry.status}
        </span>
        <span className="text-[10px] text-blue-600 flex items-center gap-1">
          <Eye size={12} />
          查看详情
        </span>
      </div>
    </div>

    {/* 右侧图片 */}
    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
      <img
        src={entry.image}
        alt={entry.title}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>

    <ChevronRight size={20} className="text-gray-300 shrink-0" />
  </motion.button>
);

interface RecordCardProps {
  record: {
    id: string;
    title: string;
    date: string;
    time: string;
    status: string;
    image: string;
  };
  statusColorMap: Record<string, string>;
  onSelect: (r: any) => void;
}

const RecordCard: React.FC<RecordCardProps> = ({ record, statusColorMap, onSelect }) => (
  <motion.button
    onClick={() => onSelect(record)}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2, scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    className="w-full flex items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
  >
    {/* 日期显示 - 左侧 */}
    <div className="flex flex-col items-center justify-center w-14 h-14 bg-blue-50 rounded-xl shrink-0">
      <span className="text-lg font-bold text-blue-600">{record.date.split('月')[1].replace('日', '')}</span>
      <span className="text-[10px] text-blue-400">{record.date.split('月')[0]}月</span>
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <Clock size={12} className="text-gray-400" />
        <span className="text-xs text-gray-500">{record.time}</span>
      </div>

      <p className="text-base font-bold text-gray-900 mb-2 truncate">{record.title}</p>

      {/* 第三行：状态标签 */}
      <div className="flex items-center gap-2">
        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", statusColorMap[record.status] || 'bg-gray-100 text-gray-600')}>
          {record.status}
        </span>
        <span className="text-[10px] text-blue-600 flex items-center gap-1">
          <Eye size={12} />
          查看详情
        </span>
      </div>
    </div>

    {/* 右侧图片 */}
    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
      <img
        src={record.image}
        alt={record.title}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>

    <ChevronRight size={20} className="text-gray-300 shrink-0" />
  </motion.button>
);
