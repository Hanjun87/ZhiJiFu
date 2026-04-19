// AI辅助生成：TraeCN, 2026-3-29 - 添加 hospital 页面类型
export type Page = 'home' | 'camera' | 'analysis' | 'result' | 'records' | 'record_detail' | 'profile' | 'consultations' | 'appointments' | 'settings' | 'about' | 'community' | 'community_post_detail' | 'community_expert' | 'community_create' | 'community_contacts' | 'community_chat' | 'history' | 'hospital' | 'profile_edit' | 'skin_record_analysis' | 'skin_record_result' | 'diary_detail' | 'disease_trend_test' | 'login' | 'register_user' | 'register_doctor';

export interface Record {
  id: string;
  title: string;
  date: string;
  status: '恢复中' | '待复查' | '已结束';
  image: string;
  probability: number;
  typicalImage: string;
  recoveryProgress?: {
    recoveryPercent: number;
    estimatedDaysToFullRecovery: number;
    startedAt: string;
    progressChanged: 'improving' | 'stable' | 'concerning' | 'uncertain';
  };
}

export interface AnalysisResult {
  diagnosis: string;
  probability: number;
  typicalImage: string;
  userImage: string;
}

// 皮肤记录分析结果
export interface SkinRecordAnalysisResult {
  photoQuality: {
    clarity: number;
    lighting: number;
    composition: number;
  };
  skinStatus: {
    overall: string;
    moisture: string;
    texture: string;
    issues: Array<{
      type: string;
      severity: number;
      description: string;
    }>;
  };
  observations: string[];
  suggestions: string[];
}
