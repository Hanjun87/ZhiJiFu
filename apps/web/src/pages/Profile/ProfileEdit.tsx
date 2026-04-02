import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Camera, X, Check } from 'lucide-react';
import BackButton from '../../components/common/BackButton';

interface ProfileEditProps {
  onBack: () => void;
}

export default function ProfileEdit({ onBack }: ProfileEditProps) {
  const [nickname, setNickname] = useState('健康守护者');
  const [bio, setBio] = useState('记录皮肤变化，分享护肤心得。坚持科学护肤，追求健康肌肤。');
  const [avatar, setAvatar] = useState('https://picsum.photos/seed/avatar/200/200');
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    // 这里可以添加保存逻辑
    onBack();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target?.result as string);
        setShowAvatarOptions(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const presetAvatars = [
    'https://picsum.photos/seed/avatar1/200/200',
    'https://picsum.photos/seed/avatar2/200/200',
    'https://picsum.photos/seed/avatar3/200/200',
    'https://picsum.photos/seed/avatar4/200/200',
    'https://picsum.photos/seed/avatar5/200/200',
    'https://picsum.photos/seed/avatar6/200/200',
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white px-5 py-3 pt-6">
        <div className="flex items-center justify-between">
          <BackButton onClick={onBack} />
          <h1 className="text-lg font-bold text-gray-900">编辑资料</h1>
          <button 
            onClick={handleSave}
            className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
          >
            <Check size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 p-6">
        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="relative">
            <motion.div 
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAvatarOptions(true)}
              className="w-28 h-28 rounded-full border-4 border-blue-50 overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 cursor-pointer shadow-lg"
            >
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            </motion.div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowAvatarOptions(true)}
              className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center shadow-md"
            >
              <Camera size={18} className="text-white" />
            </motion.button>
          </div>
          <p className="mt-4 text-sm text-gray-400">点击更换头像</p>
        </motion.div>

        {/* Nickname Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4"
        >
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            昵称
          </label>
          <div className="relative">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="请输入昵称"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              {nickname.length}/20
            </span>
          </div>
        </motion.div>

        {/* Bio Input - 个性签名 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
        >
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            个性签名
          </label>
          <div className="relative">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={100}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="写下你的个性签名..."
            />
            <span className="absolute right-3 bottom-3 text-xs text-gray-400">
              {bio.length}/100
            </span>
          </div>
        </motion.div>

        {/* User ID Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
        >
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            用户ID
          </label>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-mono">88472910</span>
            <span className="text-xs text-gray-400">不可修改</span>
          </div>
        </motion.div>
      </div>

      {/* Avatar Selection Modal */}
      {showAvatarOptions && (
        <AvatarModal
          currentAvatar={avatar}
          presetAvatars={presetAvatars}
          onSelect={(url) => {
            setAvatar(url);
            setShowAvatarOptions(false);
          }}
          onUpload={() => fileInputRef.current?.click()}
          onClose={() => setShowAvatarOptions(false)}
        />
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

// Avatar Selection Modal
interface AvatarModalProps {
  currentAvatar: string;
  presetAvatars: string[];
  onSelect: (url: string) => void;
  onUpload: () => void;
  onClose: () => void;
}

function AvatarModal({ currentAvatar, presetAvatars, onSelect, onUpload, onClose }: AvatarModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      {/* Modal Content */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">更换头像</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Upload Button */}
        <div className="p-4">
          <button
            onClick={onUpload}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors mb-6"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
              <Camera size={24} className="text-white" />
            </div>
            <div className="text-left">
              <span className="font-bold text-gray-900 block">上传照片</span>
              <span className="text-xs text-gray-500">从相册选择一张图片</span>
            </div>
          </button>

          {/* Preset Avatars */}
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            推荐头像
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {presetAvatars.map((url, index) => (
              <motion.button
                key={index}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(url)}
                className={`
                  relative aspect-square rounded-2xl overflow-hidden
                  ${currentAvatar === url ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                `}
              >
                <img src={url} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                {currentAvatar === url && (
                  <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check size={16} className="text-white" />
                    </div>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Cancel Button */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
