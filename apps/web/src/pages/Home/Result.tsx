import React from 'react';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { AnalysisResult } from '../../types';

export default function Result({
  analysisResult,
  isSavingDiary,
  onSaveRecord,
  onNavigate,
}: {
  analysisResult: AnalysisResult | null;
  isSavingDiary: boolean;
  onSaveRecord: () => void;
  onNavigate: (page: any) => void;
}) {
  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto pb-32">
      <header className="p-6 flex items-center justify-between bg-white sticky top-0 z-10">
        <button onClick={() => onNavigate('home')} className="text-gray-400">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold text-gray-900">识别结果报告</h2>
        <div className="w-6" />
      </header>
      <div className="p-6 text-center">
        <p className="text-gray-400 text-sm mb-2">匹配结果可能是</p>
        <h1 className="text-3xl font-black text-blue-600 mb-4">{analysisResult?.diagnosis}</h1>
        <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
          <span className="text-blue-600 font-bold">{analysisResult?.probability}%</span>
          <span className="text-blue-400 text-xs">可能性</span>
        </div>
      </div>
      <div className="px-6 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-blue-500 rounded-full" />
            <h3 className="font-bold text-gray-900">结果说明</h3>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">当前模型仅返回疾病名称与置信度。识别结果为 {analysisResult?.diagnosis}，置信度 {analysisResult?.probability}%，请结合临床检查进一步确认。</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-blue-500 rounded-full" />
            <h3 className="font-bold text-gray-900">对比图</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 text-center">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
                <img src={analysisResult?.userImage} alt="User" className="w-full h-full object-cover" />
              </div>
              <p className="text-[10px] text-gray-400">您的照片</p>
            </div>
            <div className="space-y-2 text-center">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
                <img src={analysisResult?.typicalImage} alt="Typical" className="w-full h-full object-cover" />
              </div>
              <p className="text-[10px] text-gray-400">典型病例</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-blue-500 rounded-full" />
            <h3 className="font-bold text-gray-900">健康建议</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <span className="text-gray-500 text-sm">保持患处清洁干燥，避免抓挠与刺激。</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <span className="text-gray-500 text-sm">若症状持续或加重，请尽快就医。</span>
            </li>
          </ul>
        </div>
        <p className="text-center text-[10px] text-gray-300 px-8">*本报告仅供参考，不作为最终诊断依据。皮肤病种类复杂，如有不适请务必寻求专业医师诊治。</p>
      </div>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-6 bg-white border-t border-gray-100 flex gap-4 z-20">
        <button onClick={onSaveRecord} className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2">
          {isSavingDiary ? <Loader2 className="animate-spin" size={20} /> : '保存记录'}
        </button>
        <button onClick={() => onNavigate('consultations')} className="flex-1 py-4 bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 active:scale-95 transition-transform">
          咨询医生
        </button>
      </div>
    </div>
  );
}
