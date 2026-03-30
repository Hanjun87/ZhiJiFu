import React, { useState, useCallback } from 'react';
import { ArrowLeft, Flashlight, Image as ImageIcon, RefreshCw, ScanLine, ClipboardList, ChevronDown, Plus, FileText, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Page } from '../../types';

// 模拟档案数据
const MOCK_RECORDS = [
  { id: 'new', name: '新建档案', isNew: true },
  { id: '1', name: '面部痤疮治疗', date: '2024-01-15', isNew: false },
  { id: '2', name: '湿疹护理记录', date: '2024-01-10', isNew: false },
  { id: '3', name: '皮肤过敏观察', date: '2024-01-05', isNew: false },
];

export default function Camera({
  videoRef,
  canvasRef,
  fileInputRef,
  cameraReady,
  cameraError,
  cameraLoading,
  startCamera,
  takePhoto,
  switchCamera,
  onNavigate,
  onFileSelect,
  mode,
  setMode,
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  cameraReady: boolean;
  cameraError: string;
  cameraLoading: boolean;
  startCamera: () => void;
  takePhoto: () => void;
  switchCamera: () => void;
  onNavigate: (p: Page) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mode: 'skin' | 'record';
  setMode: (mode: 'skin' | 'record') => void;
}) {
  const [selectedRecord, setSelectedRecord] = useState(MOCK_RECORDS[0]);
  const [showRecordDropdown, setShowRecordDropdown] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [flashLoading, setFlashLoading] = useState(false);

  // 切换闪光灯
  const toggleFlash = useCallback(async () => {
    if (!cameraReady || !videoRef.current?.srcObject) {
      return;
    }

    setFlashLoading(true);
    try {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      
      const capabilities = track.getCapabilities() as any;
      if (!capabilities?.torch) {
        alert('您的设备不支持闪光灯功能');
        setFlashLoading(false);
        return;
      }

      const newFlashState = !flashEnabled;
      await track.applyConstraints({
        advanced: [{ torch: newFlashState }] as any
      });
      
      setFlashEnabled(newFlashState);
    } catch (error) {
      console.error('切换闪光灯失败:', error);
      alert('无法切换闪光灯，请检查相机权限');
    } finally {
      setFlashLoading(false);
    }
  }, [cameraReady, flashEnabled, videoRef]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* 顶部导航栏 */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-12 pb-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
        <motion.button 
          onClick={() => onNavigate('home')} 
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white"
        >
          <ArrowLeft size={22} />
        </motion.button>
        
        {/* 模式指示器 */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md">
          {mode === 'skin' ? (
            <>
              <ScanLine size={16} className="text-blue-400" />
              <span className="text-sm font-medium text-white">识别模式</span>
            </>
          ) : (
            <>
              <ClipboardList size={16} className="text-emerald-400" />
              <span className="text-sm font-medium text-white">记录模式</span>
            </>
          )}
        </div>

        <motion.button 
          onClick={toggleFlash}
          disabled={!cameraReady || flashLoading}
          whileTap={{ scale: 0.9 }}
          className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
            flashEnabled 
              ? 'bg-yellow-400 text-yellow-900' 
              : 'bg-white/10 text-white'
          } ${(!cameraReady || flashLoading) ? 'opacity-50' : ''}`}
        >
          <Zap size={20} className={flashEnabled ? 'fill-current' : ''} />
        </motion.button>
      </div>

      {/* 档案选择器 - 仅在识别模式下显示 */}
      {mode === 'skin' && (
        <div className="absolute top-24 left-4 right-4 z-20">
          <div className="relative">
            <motion.button
              onClick={() => setShowRecordDropdown(!showRecordDropdown)}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText size={16} className="text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-400">当前档案</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedRecord.name}</p>
                </div>
              </div>
              <ChevronDown size={20} className={`text-gray-400 transition-transform ${showRecordDropdown ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {showRecordDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                  {MOCK_RECORDS.map((record) => (
                    <button
                      key={record.id}
                      onClick={() => {
                        setSelectedRecord(record);
                        setShowRecordDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        selectedRecord.id === record.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      {record.isNew ? (
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Plus size={16} className="text-blue-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <FileText size={16} className="text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${record.isNew ? 'text-blue-600' : 'text-gray-900'}`}>
                          {record.name}
                        </p>
                        {!record.isNew && record.date && (
                          <p className="text-xs text-gray-400">{record.date}</p>
                        )}
                      </div>
                      {selectedRecord.id === record.id && (
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* 相机预览区域 */}
      <div className="flex-1 relative overflow-hidden">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        
        {/* 扫描框 */}
        {cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-72 h-72">
              {/* 四角标记 */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/80 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/80 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white/80 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/80 rounded-br-lg" />
              
              {/* 扫描线动画 */}
              <motion.div 
                animate={{ top: ['0%', '100%'] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"
              />
            </div>
          </div>
        )}

        {/* 未开启摄像头提示 */}
        {!cameraReady && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center px-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
              <ScanLine size={32} className="text-white/60" />
            </div>
            <p className="text-white/80 text-sm mb-6">{cameraError || (cameraLoading ? '正在开启摄像头...' : '需要摄像头权限才能使用')}</p>
            <motion.button 
              onClick={startCamera}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-full bg-blue-500 text-white text-sm font-semibold"
            >
              {cameraLoading ? '开启中...' : '开启摄像头'}
            </motion.button>
          </div>
        )}
      </div>

      {/* 底部控制面板 */}
      <div className="bg-white rounded-t-3xl px-6 pt-6 pb-10">
        {/* 模式切换 */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex p-1 bg-gray-100 rounded-2xl">
            <motion.button
              onClick={() => setMode('skin')}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === 'skin'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              <ScanLine size={18} />
              识别皮肤问题
            </motion.button>
            <motion.button
              onClick={() => setMode('record')}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === 'record'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              <ClipboardList size={18} />
              记录皮肤状态
            </motion.button>
          </div>
        </div>

        {/* 提示文字 */}
        <p className="text-center text-gray-400 text-xs mb-6">
          {mode === 'skin' ? '将皮肤问题区域对准框内，保持光线充足' : '拍摄清晰的皮肤照片，记录当前状态'}
        </p>

        {/* 控制按钮 */}
        <div className="flex items-center justify-between px-4">
          {/* 相册 */}
          <motion.button 
            onClick={() => fileInputRef.current?.click()} 
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
          >
            <ImageIcon size={22} />
          </motion.button>

          {/* 拍照按钮 */}
          <motion.button 
            onClick={takePhoto}
            whileTap={{ scale: 0.9 }}
            className="relative w-20 h-20 rounded-full bg-white p-1 shadow-lg"
          >
            <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
            <div className={`w-full h-full rounded-full ${mode === 'skin' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
              <div className="absolute inset-2 rounded-full border-2 border-white/30" />
            </div>
          </motion.button>

          {/* 切换摄像头 */}
          <motion.button 
            onClick={switchCamera} 
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
          >
            <RefreshCw size={22} />
          </motion.button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <input type="file" ref={fileInputRef} onChange={onFileSelect} accept="image/*" className="hidden" />
    </div>
  );
}
