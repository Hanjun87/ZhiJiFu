import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Calendar, Search, Star, Clock, Video } from 'lucide-react';
import { Page } from '../../types';
import { MOCK_USERS } from './constants';

interface Consultation {
  id: string;
  expert: typeof MOCK_USERS.doctor_lin;
  status: '进行中' | '待回复' | '已结束';
  lastMessage: string;
  time: string;
  unread: number;
}

interface Appointment {
  id: string;
  expert: typeof MOCK_USERS.doctor_lin;
  date: string;
  time: string;
  type: '视频问诊' | '图文咨询';
  status: '待就诊' | '已完成' | '已取消';
}

const MOCK_CONSULTATIONS: Consultation[] = [
  {
    id: '1',
    expert: MOCK_USERS.doctor_lin,
    status: '进行中',
    lastMessage: '建议您先停用目前的护肤品，观察3天看看情况',
    time: '10分钟前',
    unread: 2,
  },
  {
    id: '2',
    expert: MOCK_USERS.doctor_zhang,
    status: '待回复',
    lastMessage: '好的，我已经上传了皮肤检测报告',
    time: '2小时前',
    unread: 0,
  },
];

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    expert: MOCK_USERS.doctor_lin,
    date: '今天',
    time: '14:30',
    type: '视频问诊',
    status: '待就诊',
  },
  {
    id: '2',
    expert: MOCK_USERS.prof_zhang,
    date: '明天',
    time: '09:00',
    type: '图文咨询',
    status: '待就诊',
  },
];

interface HospitalProps {
  onNavigate: (p: Page) => void;
  onSwitchToCommunity?: () => void;
}

export const Hospital = ({ onNavigate, onSwitchToCommunity }: HospitalProps) => {
  const [activeTab, setActiveTab] = useState<'consultations' | 'appointments'>('appointments');

  const experts = [MOCK_USERS.doctor_lin, MOCK_USERS.prof_zhang];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Header - 只固定社区/医院标签 */}
      <header className="sticky top-0 z-10 bg-white px-5 py-3 pt-6">
        {/* Tab Switcher */}
        <div className="flex items-center justify-center">
          <div className="flex bg-gray-100 rounded-full p-1">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onSwitchToCommunity}
              className="px-6 py-2 rounded-full text-sm font-semibold transition-all text-gray-500 hover:text-gray-700"
            >
              社区
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 rounded-full text-sm font-semibold transition-all bg-white text-blue-600 shadow-sm"
            >
              医院
            </motion.button>
          </div>
        </div>
      </header>

      <main className="p-5">
        {/* Search Bar - 随页面滚动 */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative flex items-center bg-gray-100 rounded-xl px-4 py-2.5 mb-4"
        >
          <Search size={16} className="text-gray-400 mr-3" />
          <input 
            type="text" 
            placeholder="搜索专家、科室、疾病..." 
            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-gray-400 outline-none"
          />
        </motion.div>

        {/* Quick Actions - 随页面滚动 */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="flex gap-3 mb-6"
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'appointments'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Calendar size={18} />
            专家预约
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('consultations')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'consultations'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <MessageSquare size={18} />
            我的咨询
          </motion.button>
        </motion.div>

        {/* Recommended Experts */}
        <motion.section 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">推荐专家</h2>
            <span className="text-blue-600 text-xs font-semibold cursor-pointer">查看全部</span>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {experts.map((expert, idx) => (
              <motion.div 
                key={idx}
                whileTap={{ scale: 0.98 }}
                className="flex-shrink-0 w-36 bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
              >
                <div className="relative w-14 h-14 mx-auto mb-3">
                  <img src={expert.avatar} alt="" className="w-full h-full rounded-full object-cover bg-gray-100" />
                  <span className="absolute -bottom-0.5 -right-0.5 bg-green-500 w-3.5 h-3.5 rounded-full border-2 border-white"></span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 text-center truncate">{expert.name}</h3>
                <p className="text-xs text-gray-400 text-center truncate mt-0.5">{expert.title}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star size={10} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs text-gray-500">5.0</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Tab Content */}
        {activeTab === 'consultations' ? (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <h2 className="text-sm font-bold text-gray-900 mb-4">我的咨询</h2>
            <div className="space-y-3">
              {MOCK_CONSULTATIONS.map((consultation) => (
                <motion.div
                  key={consultation.id}
                  whileTap={{ scale: 0.99 }}
                  className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <img 
                        src={consultation.expert.avatar} 
                        alt="" 
                        className="w-12 h-12 rounded-full object-cover bg-gray-100" 
                      />
                      {consultation.status === '进行中' && (
                        <span className="absolute -bottom-0.5 -right-0.5 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-bold text-gray-900">{consultation.expert.name}</h3>
                        <span className="text-xs text-gray-400">{consultation.time}</span>
                      </div>
                      <p className="text-xs text-blue-600 mb-1">{consultation.expert.title} · {consultation.expert.hospital}</p>
                      <p className="text-sm text-gray-500 truncate">{consultation.lastMessage}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        consultation.status === '进行中' 
                          ? 'bg-green-100 text-green-600' 
                          : consultation.status === '待回复'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {consultation.status}
                      </span>
                      {consultation.unread > 0 && (
                        <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                          {consultation.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        ) : (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <h2 className="text-sm font-bold text-gray-900 mb-4">我的预约</h2>
            <div className="space-y-3">
              {MOCK_APPOINTMENTS.map((appointment) => (
                <motion.div
                  key={appointment.id}
                  whileTap={{ scale: 0.99 }}
                  className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                      {appointment.type === '视频问诊' ? (
                        <Video size={20} className="text-blue-500" />
                      ) : (
                        <MessageSquare size={20} className="text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-bold text-gray-900">{appointment.expert.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          appointment.status === '待就诊' 
                            ? 'bg-blue-100 text-blue-600' 
                            : appointment.status === '已完成'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                      <p className="text-xs text-blue-600 mb-2">{appointment.expert.title}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {appointment.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {appointment.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

      </main>
    </div>
  );
};
