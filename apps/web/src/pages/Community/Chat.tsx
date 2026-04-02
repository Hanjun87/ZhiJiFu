import React, { useState } from 'react';
import { MoreVertical, Image as ImageIcon, Camera, Mic, Send, Smile } from 'lucide-react';
import { Page } from '../../types';
import { MOCK_USERS } from './constants';
import BackButton from '../../components/common/BackButton';

interface ChatProps {
  onNavigate: (p: Page) => void;
  backTo?: Page;
}

interface Message {
  id: string;
  content: string;
  sender: 'me' | 'other';
  time: string;
}

const INITIAL_MESSAGES: Message[] = [
  { id: '1', content: '您好，请问有什么可以帮助您的？', sender: 'other', time: '10:00' },
  { id: '2', content: '我最近皮肤有点过敏，想咨询一下', sender: 'me', time: '10:05' },
  { id: '3', content: '建议您先停用目前的护肤品，观察3天看看情况', sender: 'other', time: '10:08' },
];

export const Chat: React.FC<ChatProps> = ({ onNavigate, backTo = 'community_contacts' }) => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputText.trim(),
      sender: 'me',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // 模拟对方回复
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        content: '收到，我会尽快回复您',
        sender: 'other',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 pt-6 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <BackButton onClick={() => onNavigate(backTo)} />
          <div className="flex items-center gap-2">
            <img 
              src={MOCK_USERS.doctor_lin.avatar} 
              alt={MOCK_USERS.doctor_lin.name}
              className="w-10 h-10 rounded-full object-cover bg-gray-100"
            />
            <div>
              <h1 className="text-base font-bold text-gray-900">{MOCK_USERS.doctor_lin.name}</h1>
              <p className="text-xs text-gray-500">在线</p>
            </div>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
          <MoreVertical size={18} />
        </button>
      </header>

      {/* 消息列表 */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end gap-2 max-w-[80%] ${message.sender === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
                {message.sender === 'other' && (
                  <img 
                    src={MOCK_USERS.doctor_lin.avatar} 
                    alt=""
                    className="w-8 h-8 rounded-full object-cover bg-gray-100 flex-shrink-0"
                  />
                )}
                <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                  message.sender === 'me' 
                    ? 'bg-blue-500 text-white rounded-br-md' 
                    : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
                }`}>
                  {message.content}
                  <div className={`text-[10px] mt-1 ${message.sender === 'me' ? 'text-blue-100' : 'text-gray-400'}`}>
                    {message.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 输入栏 */}
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
            <Mic size={20} />
          </button>
          <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none"
            />
            <button className="ml-2 text-gray-400">
              <Smile size={20} />
            </button>
          </div>
          {!inputText.trim() ? (
            <>
              <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                <ImageIcon size={20} />
              </button>
              <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                <Camera size={20} />
              </button>
            </>
          ) : (
            <button
              onClick={sendMessage}
              className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white"
            >
              <Send size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
