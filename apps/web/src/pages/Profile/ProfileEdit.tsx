import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Camera, X, Check } from 'lucide-react';
import BackButton from '../../components/common/BackButton';

// 使用 DiceBear API 生成随机卡通头像
const getRandomAvatar = (seed?: string) => {
  const randomSeed = seed || Math.random().toString(36).substring(7);
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
};

// 生成预设头像列表
const generatePresetAvatars = () => {
  const seeds = ['user1', 'user2', 'user3', 'user4', 'user5', 'user6'];
  return seeds.map(seed => getRandomAvatar(seed));
};

interface ProfileEditProps {
  onBack: () => void;
}

export default function ProfileEdit({ onBack }: ProfileEditProps) {
  const [nickname, setNickname] = useState('健康守护者');
  const [bio, setBio] = useState('记录皮肤变化，分享护肤心得。坚持科学护肤，追求健康肌肤。');
  const [avatar, setAvatar] = useState(getRandomAvatar());
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

  const presetAvatars = generatePresetAvatars();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white px-5 py-3 pt-6">
        <div className="flex items-center justify-between">
          <BackButton onClick={onBack} />
          <h1 className="text-lg font-bold text-gray-900">编辑资料</h1>
          <button 
            onClick={handleSave}
            className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
          >
            <Check size={20} />
          </button>
        </div>
      </header>

      {/* Avatar Section */}
      <div className="px-5 py-6 bg-white mb-4">
        <div className="flex flex-col items-center">
          <div 
            className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 ring-4 ring-gray-50 cursor-pointer"
            onClick={() => setShowAvatarOptions(true)}
          >
            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Camera size={24} className="text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3">点击更换头像</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="px-5 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="text-xs text-gray-400 block mb-2">昵称</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full text-gray-900 font-medium bg-transparent border-none focus:ring-0 p-0"
            placeholder="请输入昵称"
          />
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="text-xs text-gray-400 block mb-2">简介</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full text-gray-600 text-sm bg-transparent border-none focus:ring-0 p-0 resize-none"
            placeholder="介绍一下自己..."
          />
        </div>
      </div>

      {/* Avatar Selection Modal */}
      {showAvatarOptions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => setShowAvatarOptions(false)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="bg-white w-full rounded-t-3xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900">选择头像</h3>
              <button 
                onClick={() => setShowAvatarOptions(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {presetAvatars.map((presetAvatar, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setAvatar(presetAvatar);
                    setShowAvatarOptions(false);
                  }}
                  className={`relative aspect-square rounded-2xl overflow-hidden ${
                    avatar === presetAvatar ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <img src={presetAvatar} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                  {avatar === presetAvatar && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <Check size={16} className="text-white" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-600 transition-colors"
            >
              从相册选择
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
