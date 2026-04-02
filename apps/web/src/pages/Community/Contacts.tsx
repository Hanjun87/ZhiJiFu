import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, MessageCircle, Users, UserPlus } from 'lucide-react';
import { Page } from '../../types';
import { MOCK_USERS } from './constants';
import BackButton from '../../components/common/BackButton';

interface ContactsProps {
  onNavigate: (p: Page) => void;
}

// 通讯录联系人数据
const CONTACTS_DATA = [
  {
    id: '1',
    user: MOCK_USERS.doctor_lin,
    lastMessage: '建议您先停用目前的护肤品',
    time: '10分钟前',
    unread: 2,
    online: true,
  },
  {
    id: '2',
    user: MOCK_USERS.prof_zhang,
    lastMessage: '好的，我已经看到您的报告了',
    time: '2小时前',
    unread: 0,
    online: false,
  },
  {
    id: '3',
    user: MOCK_USERS.doctor_zhang,
    lastMessage: '请按照处方用药，一周后复诊',
    time: '昨天',
    unread: 1,
    online: true,
  },
  {
    id: '4',
    user: MOCK_USERS.lin,
    lastMessage: '谢谢分享！我也在用同款',
    time: '昨天',
    unread: 0,
    online: true,
  },
  {
    id: '5',
    user: MOCK_USERS.azheng,
    lastMessage: '请问这个在哪里买的？',
    time: '3天前',
    unread: 0,
    online: false,
  },
  {
    id: '6',
    user: MOCK_USERS.yueyue,
    lastMessage: '你的皮肤现在好多了！',
    time: '1周前',
    unread: 0,
    online: false,
  },
];

// 新的朋友请求数据
const NEW_FRIENDS_REQUESTS = [
  {
    id: '1',
    user: MOCK_USERS.doctor_zhang,
    message: '想向您咨询皮肤问题',
    time: '5分钟前',
  },
];

// 群聊数据
const GROUP_CHATS = [
  {
    id: '1',
    name: '护肤交流群',
    members: 128,
    lastMessage: '有人用过这个产品吗？',
    time: '刚刚',
    unread: 5,
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=group1',
  },
  {
    id: '2',
    name: '敏感肌互助',
    members: 256,
    lastMessage: '分享一个修复经验',
    time: '10分钟前',
    unread: 0,
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=group2',
  },
];

export const Contacts: React.FC<ContactsProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'newFriends' | 'groups'>('contacts');
  const [searchQuery, setSearchQuery] = useState('');

  // 过滤联系人
  const filteredContacts = CONTACTS_DATA.filter(contact =>
    contact.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 顶部背景装饰 */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-blue-500/10 via-blue-500/5 to-transparent pointer-events-none" />
      
      {/* Header */}
      <header className="sticky top-0 z-10 px-5 py-3 pt-6 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BackButton onClick={() => onNavigate('community')} />
            <h1 className="text-xl font-bold text-gray-900">通讯录</h1>
          </div>
          <span className="text-sm text-gray-500">
            {activeTab === 'contacts' && `${CONTACTS_DATA.length}位联系人`}
            {activeTab === 'newFriends' && `${NEW_FRIENDS_REQUESTS.length}个请求`}
            {activeTab === 'groups' && `${GROUP_CHATS.length}个群聊`}
          </span>
        </div>
        
        {/* 搜索框 */}
        <div className="relative flex items-center bg-gray-100 rounded-xl px-4 py-2.5">
          <Search size={16} className="text-gray-400 mr-3" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索"
            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-gray-400 outline-none"
          />
        </div>
      </header>

      <main className="flex-1 p-5">
        {/* 快捷操作 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('contacts')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'contacts'
                  ? 'bg-gray-800 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <MessageCircle size={20} />
              联系人
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('groups')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'groups'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-green-50 text-green-600'
              }`}
            >
              <Users size={20} />
              群聊
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('newFriends')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'newFriends'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-blue-50 text-blue-600'
              }`}
            >
              <UserPlus size={20} />
              申请
            </motion.button>
          </div>
        </motion.section>
        
        {/* 联系人列表 */}
        {activeTab === 'contacts' && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            {/* 专家医生分组 */}
            <div className="px-2 py-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">专家医生</span>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {filteredContacts.slice(0, 3).map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onNavigate('community_chat')}
                  className="px-4 py-4 flex items-center gap-3 border-b border-gray-50 last:border-b-0 cursor-pointer active:bg-gray-50 transition-colors"
                >
                  <div className="relative">
                    <img 
                      src={contact.user.avatar} 
                      alt={contact.user.name}
                      className="w-12 h-12 rounded-full object-cover bg-gray-100"
                    />
                    {contact.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-900">{contact.user.name}</h3>
                      <span className="text-xs text-gray-400">{contact.time}</span>
                    </div>
                    <p className="text-xs text-blue-600 mb-0.5">{contact.user.title} · {contact.user.hospital}</p>
                    <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
                  </div>
                  {contact.unread > 0 && (
                    <span className="bg-red-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center font-bold px-1.5">
                      {contact.unread}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
            
            {/* 社区好友分组 */}
            <div className="px-2 py-3 mt-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">社区好友</span>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {filteredContacts.slice(3).map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.25 + index * 0.05 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onNavigate('community_chat')}
                  className="px-4 py-4 flex items-center gap-3 border-b border-gray-50 last:border-b-0 cursor-pointer active:bg-gray-50 transition-colors"
                >
                  <div className="relative">
                    <img 
                      src={contact.user.avatar} 
                      alt={contact.user.name}
                      className="w-12 h-12 rounded-full object-cover bg-gray-100"
                    />
                    {contact.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-900">{contact.user.name}</h3>
                      <span className="text-xs text-gray-400">{contact.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
                  </div>
                  {contact.unread > 0 && (
                    <span className="bg-red-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center font-bold px-1.5">
                      {contact.unread}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* 群聊 */}
        {activeTab === 'groups' && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {GROUP_CHATS.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onNavigate('community_chat')}
                  className="px-4 py-4 flex items-center gap-3 border-b border-gray-50 last:border-b-0 cursor-pointer active:bg-gray-50 transition-colors"
                >
                  <img 
                    src={group.avatar} 
                    alt={group.name}
                    className="w-12 h-12 rounded-xl object-cover bg-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-900">{group.name}</h3>
                      <span className="text-xs text-gray-400">{group.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-0.5">{group.members}人</p>
                    <p className="text-sm text-gray-500 truncate">{group.lastMessage}</p>
                  </div>
                  {group.unread > 0 && (
                    <span className="bg-red-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center font-bold px-1.5">
                      {group.unread}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* 新的朋友 */}
        {activeTab === 'newFriends' && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {NEW_FRIENDS_REQUESTS.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="px-4 py-4 flex items-center gap-3 border-b border-gray-50 last:border-b-0"
                >
                  <img 
                    src={request.user.avatar} 
                    alt={request.user.name}
                    className="w-12 h-12 rounded-full object-cover bg-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900">{request.user.name}</h3>
                    <p className="text-xs text-blue-600 mb-0.5">{request.user.title}</p>
                    <p className="text-sm text-gray-500 truncate">{request.message}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{request.time}</span>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1.5 rounded-full bg-blue-500 text-white text-xs font-semibold"
                    >
                      接受
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold"
                    >
                      忽略
                    </motion.button>
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

export default Contacts;
