export type Page = 'home' | 'camera' | 'analysis' | 'result' | 'records' | 'record_detail' | 'profile' | 'consultations' | 'appointments' | 'settings' | 'about' | 'community' | 'community_post_detail' | 'community_expert' | 'community_create' | 'community_contacts' | 'community_chat' | 'history' | 'hospital' | 'profile_edit' | 'skin_record_analysis' | 'skin_record_result' | 'diary_detail';

export interface Record {
  id: string;
  title: string;
  date: string;
  status: '恢复中' | '待复查' | '已结束';
  image: string;
  probability: number;
  typicalImage: string;
}

export interface AnalysisResult {
  diagnosis: string;
  probability: number;
  typicalImage: string;
  userImage: string;
}
