import React from 'react';
import { ChevronRight, Scan, Search } from 'lucide-react';
import { Record } from '../../types';

export default function Records({
  records,
  onSelect,
}: {
  records: Record[];
  onSelect: (record: Record) => void;
}) {
  return (
    <div className="flex flex-col h-full bg-gray-50 pb-24">
      <header className="p-6 flex items-center justify-center bg-white sticky top-0 z-10 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">健康档案</h2>
        <button className="absolute right-6 text-gray-400"><Search size={24} /></button>
      </header>
      <div className="p-4">
        {records.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 py-16 px-8 text-center">
            <p className="text-gray-500 font-bold mb-2">暂无识别记录</p>
            <p className="text-xs text-gray-400">完成一次拍照识别并保存后，会在这里显示</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map(record => (
              <button
                key={record.id}
                onClick={() => onSelect(record)}
                className="w-full bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 active:bg-gray-50 transition-colors cursor-pointer text-left"
              >
                <img src={record.image} alt={record.title} className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-900">{record.title}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-500">
                      {record.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mb-2">{record.date}</p>
                  <div className="text-blue-500 text-[10px] font-bold flex items-center gap-1">
                    <Scan size={12} /> 查看报告
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-200" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
