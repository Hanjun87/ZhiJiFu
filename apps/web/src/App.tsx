/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import Home from './pages/Home';
import CameraPage from './pages/Home/Camera';
import Analysis from './pages/Home/Analysis';
import Result from './pages/Home/Result';
import SkinRecordAnalysis from './pages/Home/SkinRecordAnalysis';
import SkinRecordResult from './pages/Home/SkinRecordResult';
import RecordsPage from './pages/Records';
import RecordDetailPage from './pages/Records/RecordDetail';
import DiaryDetailPage from './pages/Records/DiaryDetail';

import { History } from './pages/Records/History';

import ProfilePage from './pages/Profile';
import PlaceholderPage from './pages/Profile/PlaceholderPage';
import SettingsPage from './pages/Profile/Settings';
import ProfileEditPage from './pages/Profile/ProfileEdit';
import { CommunityFeed } from './pages/Community/CommunityFeed';
import { PostDetail } from './pages/Community/PostDetail';
import { ExpertColumn } from './pages/Community/ExpertColumn';
import { CreatePost } from './pages/Community/CreatePost';
import { Contacts } from './pages/Community/Contacts';
import { Chat } from './pages/Community/Chat';
import { Page, Record as SkinRecord, AnalysisResult } from './types';
import { BottomNav } from './components/common/BottomNav';
import { MessageSquare, Calendar, Settings } from 'lucide-react';
import { cn } from './lib/utils';
import { getPageTransition, pagePresenceMode, resolveTransition } from './lib/transitions';
import BackButton from './components/common/BackButton';

// --- Main App ---

export default function App() {
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  const buildApiUrl = (path: string) => `${apiBaseUrl}${path}`;
  const primaryTabs: Page[] = ['home', 'records', 'community', 'profile'];
  const isTabPage = (page: Page) => primaryTabs.includes(page);
  const pageRootMap: Record<Page, Page> = {
    home: 'home',
    camera: 'home',
    analysis: 'home',
    result: 'home',
    records: 'records',
    record_detail: 'records',
    history: 'records',
    community: 'community',
    community_post_detail: 'community',
    community_expert: 'community',
    community_create: 'community',
    community_contacts: 'community',
    community_chat: 'community',
    hospital: 'community',
    profile: 'profile',
    profile_edit: 'profile',
    consultations: 'profile',
    appointments: 'profile',
    settings: 'profile',
    about: 'profile',
    skin_record_analysis: 'home',
    skin_record_result: 'home',
    diary_detail: 'records',
  };
  const [currentPage, _setCurrentPage] = useState<Page>('home');
  const [previousPage, setPreviousPage] = useState<Page>('home');
  const reducedMotion = useReducedMotion();
  const [transitionState, setTransitionState] = useState(() => resolveTransition('home', 'home'));

  const getRootTab = (page: Page) => {
    // 对于帖子详情页面，根据来源决定根标签页
    if (page === 'community_post_detail') {
      return previousPage === 'profile' ? 'profile' : 'community';
    }
    return pageRootMap[page] ?? 'home';
  };

  const setCurrentPage = (page: Page) => {
    if (page === currentPage) {
      return;
    }
    const currentRootTab = getRootTab(currentPage);
    const nextRootTab = getRootTab(page);
    setTransitionState(resolveTransition(currentPage, page));
    setPreviousPage(currentPage);
    _setCurrentPage(page);
  };

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [records, setRecords] = useState<SkinRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<SkinRecord | null>(null);
  const [selectedDiaryEntry, setSelectedDiaryEntry] = useState<{id: string; date: string; time: string; title: string; status: string; image: string} | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSavingDiary, setIsSavingDiary] = useState(false);
  const [cameraMode, setCameraMode] = useState<'skin' | 'record'>('skin');



  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraError, setCameraError] = useState('');
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // --- AI Logic ---

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setCapturedImage(dataUrl);
        analyzeSkin(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeSkin = async (base64Image: string) => {
    setIsAnalyzing(true);
    setCurrentPage('analysis');

    try {
      const response = await fetch(buildApiUrl('/api/analyze-skin'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageBase64: base64Image
        })
      });
      if (!response.ok) {
        let errorMessage = '识别服务不可用';
        try {
          const errorData = await response.json();
          if (typeof errorData?.message === 'string' && errorData.message.trim()) {
            errorMessage = errorData.message;
          }
        } catch {
        }
        throw new Error(errorMessage);
      }
      const data = await response.json();

      setAnalysisResult({
        diagnosis: data.diagnosis,
        probability: data.probability,
        userImage: base64Image,
        typicalImage: base64Image
      });
      setCurrentPage('result');
    } catch (error) {
      console.error("Analysis failed:", error);
      setCurrentPage('home');
      window.alert(error instanceof Error ? error.message : '识别失败，请稍后重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveRecord = () => {
    if (!analysisResult) {
      return;
    }
    setIsSavingDiary(true);
    const newRecord: SkinRecord = {
      id: Date.now().toString(),
      title: analysisResult.diagnosis,
      date: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: '待复查',
      image: analysisResult.userImage,
      probability: analysisResult.probability,
      typicalImage: analysisResult.typicalImage
    };
    setRecords(prev => [newRecord, ...prev]);
    setTimeout(() => {
      setIsSavingDiary(false);
      setCurrentPage('records');
    }, 600);
  };

  // --- Camera Logic ---

  const startCamera = async () => {
    if (cameraLoading) return;
    setCameraError('');
    setCameraLoading(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('当前设备不支持相机调用');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
    } catch (err) {
      const name = err instanceof DOMException ? err.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setCameraError('未获得摄像头权限，请在系统设置中允许相机访问后重试');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setCameraError('未检测到可用摄像头');
      } else {
        setCameraError('相机启动失败，请重试');
      }
      setCameraReady(false);
      console.error("Error accessing camera:", err);
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  };

  const switchCamera = () => {
    stopCamera();
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    setTimeout(() => startCamera(), 100);
  };

  const takePhoto = () => {
    if (!cameraReady) {
      setCameraError('相机尚未就绪，请先授权并开启相机');
      return;
    }
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
        
        // 根据模式选择不同的处理流程
        if (cameraMode === 'skin') {
          analyzeSkin(dataUrl);
        } else {
          // 记录皮肤状态模式
          setCurrentPage('skin_record_analysis');
          // 模拟分析过程
          setTimeout(() => {
            setCurrentPage('skin_record_result');
          }, 2500);
        }
      }
    }
  };

  useEffect(() => {
    if (currentPage === 'camera') {
      startCamera();
    } else {
      stopCamera();
      setCameraError('');
    }
    return () => stopCamera();
  }, [currentPage]);

  // --- Render Helpers ---

  const pageTransition = getPageTransition(transitionState.kind, transitionState.direction, Boolean(reducedMotion));
  const immersivePage = ['camera', 'analysis', 'result', 'skin_record_analysis', 'skin_record_result'].includes(currentPage);
  const activeRootTab = getRootTab(currentPage);
  const activeRootTabIndex = primaryTabs.indexOf(activeRootTab);
  const overlayPageVisible = !isTabPage(currentPage);
  const shellClassName = cn(
    'relative mx-auto h-screen max-w-md overflow-hidden font-sans shadow-[0_24px_80px_rgba(15,23,42,0.18)]',
    immersivePage
      ? 'bg-slate-950 text-white'
      : 'bg-[radial-gradient(circle_at_top,#eff6ff_0%,#ffffff_36%,#f8fafc_100%)]'
  );

  const renderPrimaryTab = (page: Page) => {
    if (page === 'home') {
      return <Home onNavigate={setCurrentPage} />;
    }
    if (page === 'records') {
      return (
        <RecordsPage
          records={records}
          onSelect={(r) => {
            setSelectedRecord(r);
            setCurrentPage('record_detail');
          }}
          onNavigate={setCurrentPage}
          onSelectDiary={(entry) => {
            setSelectedDiaryEntry(entry);
          }}
        />
      );
    }
    if (page === 'community') {
      return <CommunityFeed onNavigate={setCurrentPage} initialTab={currentPage === 'hospital' ? 'hospital' : 'community'} />;
    }
    return <ProfilePage onNavigate={setCurrentPage} />;
  };

  const renderOverlayPage = () => {
    if (currentPage === 'camera') {
      return (
        <CameraPage
          videoRef={videoRef}
          canvasRef={canvasRef}
          fileInputRef={fileInputRef}
          cameraReady={cameraReady}
          cameraError={cameraError}
          cameraLoading={cameraLoading}
          startCamera={startCamera}
          takePhoto={takePhoto}
          switchCamera={switchCamera}
          onNavigate={setCurrentPage}
          onFileSelect={handleFileSelect}
          mode={cameraMode}
          setMode={setCameraMode}
        />
      );
    }
    if (currentPage === 'analysis') {
      return <Analysis capturedImage={capturedImage} />;
    }
    if (currentPage === 'result') {
      return (
        <Result
          analysisResult={analysisResult}
          isSavingDiary={isSavingDiary}
          onSaveRecord={handleSaveRecord}
          onNavigate={setCurrentPage}
        />
      );
    }
    if (currentPage === 'skin_record_analysis') {
      return <SkinRecordAnalysis capturedImage={capturedImage} />;
    }
    if (currentPage === 'skin_record_result') {
      return (
        <SkinRecordResult
          capturedImage={capturedImage}
          onSave={() => {
            setIsSavingDiary(true);
            setTimeout(() => {
              setIsSavingDiary(false);
              setCurrentPage('records');
            }, 800);
          }}
          onNavigate={setCurrentPage}
          isSaving={isSavingDiary}
        />
      );
    }
    if (currentPage === 'record_detail') {
      return <RecordDetailPage record={selectedRecord} onBack={() => setCurrentPage('records')} onNavigate={setCurrentPage} />;
    }
    if (currentPage === 'diary_detail') {
      return <DiaryDetailPage entry={selectedDiaryEntry} onBack={() => setCurrentPage('records')} onNavigate={setCurrentPage} />;
    }

    if (currentPage === 'history') {
      return <History onNavigate={setCurrentPage} />;
    }
    if (currentPage === 'consultations') {
      return <PlaceholderPage title="我的咨询" icon={<MessageSquare size={48} />} onBack={() => setCurrentPage('profile')} />;
    }
    if (currentPage === 'appointments') {
      return <PlaceholderPage title="专家预约" icon={<Calendar size={48} />} onBack={() => setCurrentPage('profile')} />;
    }
    if (currentPage === 'settings') {
      return <SettingsPage onBack={() => setCurrentPage('profile')} />;
    }
    if (currentPage === 'profile_edit') {
      return <ProfileEditPage onBack={() => setCurrentPage('profile')} />;
    }
    if (currentPage === 'about') {
      return (
        <div className="flex flex-col min-h-screen bg-gray-50">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-white px-5 py-3 pt-6">
            <div className="flex items-center justify-between">
              <BackButton onClick={() => setCurrentPage('profile')} />
              <h1 className="text-lg font-bold text-gray-900">关于应用</h1>
              <div className="w-10" />
            </div>
          </header>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col items-center justify-center p-12 text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl flex items-center justify-center mb-6 shadow-sm p-4">
              <img src="/logo.png" alt="知己肤" className="w-16 h-16 object-contain" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">知己肤</h3>
            <p className="text-gray-400 text-sm max-w-xs mb-6">AI 驱动的皮肤健康检测与管理平台</p>
            <div className="text-xs text-gray-400">
              <p>版本 1.0.0</p>
            </div>
          </motion.div>
        </div>
      );
    }
    if (currentPage === 'community_post_detail') {
      const backToPage = previousPage === 'profile' ? 'profile' : 'community';
      return <PostDetail onNavigate={setCurrentPage} backTo={backToPage} />;
    }
    if (currentPage === 'community_expert') {
      return <ExpertColumn onNavigate={setCurrentPage} />;
    }
    if (currentPage === 'community_contacts') {
      return <Contacts onNavigate={setCurrentPage} />;
    }
    if (currentPage === 'community_chat') {
      return <Chat onNavigate={setCurrentPage} backTo="community_contacts" />;
    }
    return <CreatePost onNavigate={setCurrentPage} />;
  };

  return (
    <div className="min-h-screen bg-slate-100 px-0 sm:px-6">
      <div className={shellClassName}>
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_68%)]"
          animate={immersivePage ? { opacity: 0.12, scale: 1.05 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-16 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl"
          animate={immersivePage ? { x: 12, opacity: 0.25 } : { x: 0, opacity: 0.8 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
        {primaryTabs.map((page, index) => (
          <motion.div
            key={page}
            initial={false}
            animate={{
              x: `${(index - activeRootTabIndex) * 100}%`,
              opacity: 1,
            }}
            transition={{ duration: page === activeRootTab || page === getRootTab(currentPage) ? 0.6 : 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'absolute inset-0 min-h-screen transform-gpu will-change-transform overflow-y-auto',
              activeRootTab === page && !overlayPageVisible ? 'pointer-events-auto z-10' : 'pointer-events-none z-0'
            )}
          >
            {renderPrimaryTab(page)}
          </motion.div>
        ))}
        {/* Overlay 背景遮罩 - 防止页面切换时看到底层内容 */}
        {overlayPageVisible && (
          <div className="absolute inset-0 z-10 bg-gray-50" />
        )}
        <AnimatePresence mode="popLayout" initial={false}>
          {overlayPageVisible && (
            <motion.div
              key={currentPage}
              initial={pageTransition.initial}
              animate={pageTransition.animate}
              exit={pageTransition.exit}
              className="absolute inset-0 z-20 min-h-screen transform-gpu will-change-transform bg-gray-50 overflow-y-auto"
            >
              {renderOverlayPage()}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isTabPage(currentPage) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ opacity: 0, transition: { duration: 0.14, ease: [0.4, 0, 1, 1] } }}
            >
              <BottomNav activePage={currentPage} onNavigate={setCurrentPage} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
