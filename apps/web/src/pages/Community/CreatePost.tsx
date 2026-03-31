import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, X, ArrowLeft, Image as ImageIcon, Loader2, Check, 
  MapPin, Hash, Eye, EyeOff, ChevronDown, FileText 
} from 'lucide-react';
import { Page } from '../../types';
import { createPost, uploadImage, getSkinRecords, SkinRecord } from '../../api/community';

// 发布区域选项 - 与社区导航一致
const POST_REGIONS = {
  all: {
    name: '全部',
    subCategories: ['推荐', '热门', '最新']
  },
  skin: {
    name: '皮肤病',
    subCategories: ['湿疹', '痤疮', '皮炎', '荨麻疹', '银屑病', '白癜风', '带状疱疹', '真菌感染', '皮肤瘙痒', '皮肤过敏']
  },
  wound: {
    name: '伤口',
    subCategories: ['擦伤', '烫伤', '割伤', '术后护理', '疤痕修复', '溃疡', '褥疮', '冻伤', '烧伤', '咬伤']
  },
  whitening: {
    name: '美白',
    subCategories: ['淡斑', '祛痘印', '均匀肤色', '防晒', '抗氧化', '提亮', '去角质', '补水亮肤', '美白精华', '内服美白']
  }
};

interface CreatePostProps {
  onNavigate: (p: Page) => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onNavigate }) => {
  // 表单状态
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState<'all' | 'skin' | 'wound' | 'whitening'>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [location, setLocation] = useState('');
  const [selectedSkinRecord, setSelectedSkinRecord] = useState<SkinRecord | null>(null);
  
  // UI状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSkinRecords, setShowSkinRecords] = useState(false);
  const [skinRecords, setSkinRecords] = useState<SkinRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 加载皮肤报告
  useEffect(() => {
    loadSkinRecords();
  }, []);

  const loadSkinRecords = async () => {
    try {
      const data = await getSkinRecords();
      setSkinRecords(data.records);
    } catch (err) {
      console.error('加载皮肤报告失败:', err);
    }
  };

  // 自动调整textarea高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 9) {
      setError('最多只能上传9张图片');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const fileArray = Array.from(files);
      const uploadPromises = fileArray.map((file: File) => uploadImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (err) {
      setError('图片上传失败，请重试');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 删除图片
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('请输入标题');
      return;
    }
    if (title.trim().length < 5) {
      setError('标题至少需要5个字符');
      return;
    }
    if (!content.trim()) {
      setError('请输入内容');
      return;
    }
    if (content.trim().length < 10) {
      setError('内容至少需要10个字符');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createPost({
        title: title.trim(),
        content: content.trim(),
        images,
        isAnonymous,
        skinRecordId: selectedSkinRecord?.id,
        mainCategory: selectedMainCategory,
        subCategory: selectedSubCategory,
        location: location || undefined,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onNavigate('community');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || '发布失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCategory = POST_REGIONS[selectedMainCategory];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white px-4 py-3 pt-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <motion.button 
            onClick={() => onNavigate('community')} 
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <h1 className="text-lg font-bold text-gray-900">发布帖子</h1>
          <motion.button 
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 bg-blue-500 text-white rounded-full font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              '发布'
            )}
          </motion.button>
        </div>
      </header>

      <main className="flex-1 p-4">
        {/* 错误提示 */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 发布区域选择 - 与社区导航一致 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          {/* 一级分类 */}
          <div className="flex gap-2 mb-3">
            {(Object.keys(POST_REGIONS) as Array<'all' | 'skin' | 'wound' | 'whitening'>).map((key) => (
              <motion.button
                key={key}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedMainCategory(key);
                  setSelectedSubCategory(null);
                }}
                className={`flex-1 py-2.5 px-2 rounded-xl text-sm font-semibold transition-all ${
                  selectedMainCategory === key
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                    : 'bg-white text-gray-600 shadow-sm border border-gray-100'
                }`}
              >
                {POST_REGIONS[key].name}
              </motion.button>
            ))}
          </div>

          {/* 二级分类 */}
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
            <div className="flex flex-wrap gap-2">
              {currentCategory.subCategories.map((subCat, idx) => {
                const isActive = selectedSubCategory === subCat;
                return (
                  <motion.button
                    key={idx}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedSubCategory(isActive ? null : subCat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/20'
                        : 'bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    {subCat}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* 标题输入 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3"
        >
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="添加标题..." 
            maxLength={100}
            className="w-full border-none focus:ring-0 text-lg font-bold placeholder:text-gray-300 p-0 bg-transparent outline-none"
          />
          <div className="text-right text-xs text-gray-300 mt-1">
            {title.length}/100
          </div>
        </motion.div>

        {/* 内容输入 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4"
        >
          <textarea 
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享你的皮肤状况或护理心得..." 
            className="w-full border-none focus:ring-0 text-base placeholder:text-gray-400 p-0 bg-transparent resize-none outline-none min-h-[100px]"
          />
          <div className="text-right text-xs text-gray-300 mt-1">
            {content.length} 字
          </div>
        </motion.div>

        {/* 图片上传 */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon size={16} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-500">添加图片</span>
            <span className="text-xs text-gray-400">{images.length}/9</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* 上传按钮 */}
            {images.length < 9 && (
              <motion.button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                whileTap={{ scale: 0.95 }}
                className="w-20 h-20 rounded-xl bg-gray-100 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 text-gray-400"
              >
                {isUploading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Plus size={24} />
                )}
              </motion.button>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            
            {/* 已上传图片 */}
            {images.map((img, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-20 h-20 rounded-xl overflow-hidden relative"
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button 
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center"
                >
                  <X size={12} />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 附加选项 */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* 位置 */}
          <button className="w-full flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-gray-400" />
              <span className="text-sm text-gray-600">添加位置</span>
            </div>
            <ChevronDown size={18} className="text-gray-400" />
          </button>

          {/* 匿名发布 */}
          <button 
            onClick={() => setIsAnonymous(!isAnonymous)}
            className="w-full flex items-center justify-between p-4 border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              {isAnonymous ? (
                <EyeOff size={18} className="text-blue-500" />
              ) : (
                <Eye size={18} className="text-gray-400" />
              )}
              <span className={`text-sm ${isAnonymous ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                匿名发布
              </span>
            </div>
            <div className={`w-11 h-6 rounded-full relative transition-colors ${isAnonymous ? 'bg-blue-500' : 'bg-gray-200'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isAnonymous ? 'left-6' : 'left-1'}`} />
            </div>
          </button>

          {/* 关联皮肤报告 */}
          <button 
            onClick={() => setShowSkinRecords(!showSkinRecords)}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              <FileText size={18} className={selectedSkinRecord ? 'text-blue-500' : 'text-gray-400'} />
              <span className={`text-sm ${selectedSkinRecord ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                {selectedSkinRecord ? '已关联皮肤报告' : '关联皮肤报告'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {selectedSkinRecord && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSkinRecord(null);
                  }}
                  className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center"
                >
                  <X size={12} className="text-gray-500" />
                </button>
              )}
              <ChevronDown size={18} className={`text-gray-400 transition-transform ${showSkinRecords ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* 皮肤报告列表 */}
          <AnimatePresence>
            {showSkinRecords && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden bg-gray-50"
              >
                <div className="p-4 space-y-2">
                  {skinRecords.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-2">暂无皮肤报告</p>
                  ) : (
                    skinRecords.map((record) => (
                      <button
                        key={record.id}
                        onClick={() => {
                          setSelectedSkinRecord(selectedSkinRecord?.id === record.id ? null : record);
                          setShowSkinRecords(false);
                        }}
                        className={`w-full p-3 rounded-xl text-left transition-colors ${
                          selectedSkinRecord?.id === record.id 
                            ? 'bg-blue-100 border border-blue-200' 
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {record.skinOverall || '皮肤分析报告'}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(record.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {selectedSkinRecord?.id === record.id && (
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                              <Check size={12} className="text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </main>

      {/* 成功提示 */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-2xl p-8 flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check size={32} className="text-green-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">发布成功！</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreatePost;
