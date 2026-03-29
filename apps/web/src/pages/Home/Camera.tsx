import React from 'react';
import { ArrowLeft, Flashlight, Camera as CameraIcon, Image as ImageIcon, RefreshCw, ScanLine, ClipboardList, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Page } from '../../types';

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

  return (
    <div className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-black z-50 flex flex-col">
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={() => onNavigate('home')} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-md">
          <ArrowLeft size={24} />
        </button>
        <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-md">
          <Flashlight size={24} />
        </button>
      </div>
      <div className="flex-grow relative overflow-hidden">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_52%)]"
          animate={{ opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
        />
        {!cameraReady && (
          <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center px-8 text-center">
            <p className="text-white text-sm mb-4">{cameraError || (cameraLoading ? '正在开启摄像头...' : '请先开启摄像头权限')}</p>
            <button onClick={startCamera} className="px-5 py-2.5 rounded-full bg-blue-500 text-white text-sm font-semibold active:scale-95 transition-transform">
              {cameraLoading ? '开启中...' : '开启摄像头'}
            </button>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-72 h-72 border-2 border-blue-500/50 rounded-3xl relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-2xl" />
            <motion.div animate={{ top: ['0%', '100%', '0%'] }} transition={{ repeat: Infinity, duration: 3, ease: 'linear' }} className="absolute left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
          </div>
        </div>
        <motion.div
          className="pointer-events-none absolute bottom-12 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-blue-500/15 blur-3xl"
          animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <div className="bg-white p-6 pb-12 rounded-t-[40px] flex flex-col items-center">
        {/* Mode Selection Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl mb-5">
          <button
            onClick={() => setMode('skin')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              mode === 'skin'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ScanLine size={18} />
            识别皮肤问题
          </button>
          <button
            onClick={() => setMode('record')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              mode === 'record'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ClipboardList size={18} />
            记录皮肤状态
          </button>
        </div>

        <p className="text-gray-500 text-sm mb-5">
          {mode === 'skin' ? '请将镜头对准皮肤问题区域，并保持光线充足' : '请拍摄清晰的皮肤照片，用于记录和对比'}
        </p>

        {/* Optimized Camera Controls */}
        <div className="flex items-center justify-center w-full gap-8">
          {/* Gallery Button */}
          <motion.button 
            onClick={() => fileInputRef.current?.click()} 
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-600 shadow-sm border border-gray-200 group-active:shadow-inner transition-all">
              <ImageIcon size={24} />
            </div>
            <span className="text-xs text-gray-400 font-medium">相册</span>
          </motion.button>

          {/* Main Shutter Button */}
          <div className="relative">
            {/* Outer glow ring */}
            <motion.div
              className="absolute inset-[-6px] rounded-full bg-blue-400/10"
              animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Main button */}
            <motion.button 
              onClick={takePhoto}
              whileTap={{ scale: 0.92 }}
              className="relative w-20 h-20 rounded-full bg-gradient-to-br from-white to-gray-50 p-1.5 shadow-xl shadow-blue-200/50"
            >
              {/* Inner ring */}
              <div className="w-full h-full rounded-full border-2 border-blue-500/30 p-1">
                {/* Center button */}
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center text-white shadow-lg">
                  {mode === 'skin' ? (
                    <Sparkles size={28} className="text-white" />
                  ) : (
                    <CameraIcon size={28} className="text-white" />
                  )}
                </div>
              </div>
            </motion.button>
          </div>

          {/* Switch Camera Button */}
          <motion.button 
            onClick={switchCamera} 
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-600 shadow-sm border border-gray-200 group-active:shadow-inner transition-all">
              <RefreshCw size={24} />
            </div>
            <span className="text-xs text-gray-400 font-medium">切换</span>
          </motion.button>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <input type="file" ref={fileInputRef} onChange={onFileSelect} accept="image/*" className="hidden" />
    </div>
  );
}
