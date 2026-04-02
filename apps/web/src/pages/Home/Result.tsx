import React from 'react';
import { motion } from 'motion/react';
import { Share2, Sparkles, Info, Thermometer, Activity, Stethoscope, Droplets, Clock, FileText, UserPlus, Bot } from 'lucide-react';
import { AnalysisResult } from '../../types';
import BackButton from '../../components/common/BackButton';

interface ResultProps {
  analysisResult: AnalysisResult | null;
  isSavingDiary: boolean;
  onSaveRecord: () => void;
  onNavigate: (page: any) => void;
}

export default function Result({ analysisResult, isSavingDiary, onSaveRecord, onNavigate }: ResultProps) {
  const diagnosis = analysisResult?.diagnosis || '未知';
  const probability = analysisResult?.probability || 0;
  const userImage = analysisResult?.userImage || '';
  const typicalImage = analysisResult?.typicalImage || '';

  // 根据匹配度确定风险等级
  const getRiskLevel = (prob: number) => {
    if (prob >= 90) return { level: '高度', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (prob >= 70) return { level: '中度', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    return { level: '轻度', color: 'text-emerald-600', bgColor: 'bg-emerald-50' };
  };

  // 根据疾病名称获取建议行动
  const getAction = (diag: string) => {
    const actions: Record<string, string> = {
      '特应性皮炎': '皮肤修护',
      '湿疹': '保湿护理',
      '痤疮': '控油祛痘',
      '过敏性皮炎': '抗过敏治疗',
      '银屑病': '专科治疗',
      '白癜风': '色素修复',
    };
    return actions[diag] || '咨询医生';
  };

  const risk = getRiskLevel(probability);
  const action = getAction(diagnosis);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Header - 使用档案详情风格的简洁导航栏 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl px-5 py-3 pt-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <BackButton onClick={() => onNavigate('home')} />
          <h1 className="text-lg font-bold text-gray-900">识别结果</h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Share2 size={20} />
          </motion.button>
        </div>
      </header>

      <main className="p-5">
        {/* 1. Top Section: Disease Name & Match % */}
        <motion.section 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-1 mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 font-bold text-xs rounded-full flex items-center gap-1">
              <Sparkles size={12} />
              AI 智能识别
            </span>
            <span className="text-gray-400 text-xs">{new Date().toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">{diagnosis}</h2>
          <p className="text-blue-600 font-bold text-lg">匹配度 {probability}%</p>
        </motion.section>

        {/* 2. Visual Comparison Section (Smaller side-by-side) */}
        <motion.section 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-3 mb-5"
        >
          <div className="flex items-center gap-2">
            <Activity className="text-blue-600" size={20} />
            <h3 className="text-lg font-bold text-gray-900">视觉特征对比</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <div className="absolute top-2 left-2 z-10 bg-black/50 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded">
                您的上传
              </div>
              <img 
                alt="User upload" 
                className="w-full h-32 object-cover rounded-xl shadow-sm bg-gray-100" 
                src={userImage}
              />
            </div>
            <div className="relative">
              <div className="absolute top-2 left-2 z-10 bg-blue-600/80 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded">
                典型案例
              </div>
              <img 
                alt="Medical case" 
                className="w-full h-32 object-cover rounded-xl shadow-sm bg-gray-100" 
                src={typicalImage}
              />
            </div>
          </div>
        </motion.section>

        {/* 3. Disease Explanation */}
        <motion.section 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-blue-50/50 border border-blue-100/50 p-5 rounded-2xl mb-5"
        >
          <div className="flex items-center gap-2 mb-2 text-blue-600">
            <Info size={16} />
            <span className="text-xs font-bold tracking-wider uppercase">病症解析</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            AI 分析发现您的患处呈现典型特征，与医学图库中记录的{diagnosis}表现高度一致。
            这种病症常表现为皮肤异常，建议及时关注并采取适当的护理措施。
            识别结果仅供参考，如有不适请及时就医。
          </p>
        </motion.section>

        {/* 4. Risk Level & Action */}
        <motion.section 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-2 gap-4 mb-5"
        >
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-gray-400 text-xs mb-1">风险等级</p>
            <p className={`font-bold text-xl ${risk.color}`}>{risk.level}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-gray-400 text-xs mb-1">建议行动</p>
            <p className="font-bold text-xl text-blue-600">{action}</p>
          </div>
        </motion.section>

        {/* 5. Professional Nursing Suggestions */}
        <motion.section 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="space-y-4 mb-5"
        >
          <div className="flex items-center gap-2">
            <Stethoscope className="text-blue-600" size={20} />
            <h3 className="text-lg font-bold text-gray-900">专业护理建议</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Droplets className="text-blue-600" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">保湿屏障修护</h4>
                <p className="text-gray-500 text-xs mt-1">每日使用温和保湿产品，保持皮肤水分，避免使用刺激性护肤品。</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                <Thermometer className="text-orange-600" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">温和清洁</h4>
                <p className="text-gray-500 text-xs mt-1">使用温水清洁，避免过热或过冷的水温，减少皮肤刺激。</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <Clock className="text-emerald-600" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">及时就医</h4>
                <p className="text-gray-500 text-xs mt-1">如症状持续或加重，请尽快前往正规医院皮肤科就诊。</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 6. Bottom Action Buttons */}
        <motion.section 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-3 pt-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={onSaveRecord}
              disabled={isSavingDiary}
              className="bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm hover:bg-gray-200 disabled:opacity-50"
            >
              {isSavingDiary ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileText size={18} />
              )}
              创建档案
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('consultations')}
              className="bg-blue-600 text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 text-sm hover:bg-blue-700"
            >
              <UserPlus size={18} />
              咨询医生
            </motion.button>
          </div>
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('community_create')}
            className="w-full bg-blue-50 text-blue-600 py-3.5 rounded-xl font-bold border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Bot size={18} />
            分享到社区求助
          </motion.button>
        </motion.section>

        {/* Disclaimer */}
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.4, delay: 0.35 }} 
          className="text-center text-xs text-gray-400 py-4"
        >
          *本报告仅供参考，不作为最终诊断依据。如有不适请务必寻求专业医师诊治。
        </motion.p>
      </main>
    </div>
  );
}
