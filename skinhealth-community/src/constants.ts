import { Post, Article, User } from './types';

export const MOCK_USERS: Record<string, User> = {
  lin: {
    id: '1',
    name: '林小鹿',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lin',
    location: '广东',
  },
  doctor_zhang: {
    id: '2',
    name: '张明远 博士',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang',
    title: '副主任医师',
    hospital: '三甲医院皮肤科',
    isExpert: true,
  },
  doctor_lin: {
    id: '3',
    name: '林慕韩 博士',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lin_doc',
    title: '副主任医师',
    hospital: '三甲医院',
    isExpert: true,
    experience: '15年+',
    consultations: 3820,
  },
  prof_zhang: {
    id: '4',
    name: '张秋婉 教授',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang_prof',
    title: '主任医师',
    hospital: '硕导',
    isExpert: true,
    experience: '22年+',
    consultations: 5140,
  },
  azheng: {
    id: '5',
    name: '阿正_SkinCare',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=azheng',
    location: '上海',
  },
  yueyue: {
    id: '6',
    name: '悦悦子_Oli',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yueyue',
    location: '广州',
  }
};

export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    author: MOCK_USERS.lin,
    time: '2小时前',
    title: '坚持防晒打卡第15天，肤色值真的有变化！✨',
    content: '最近一直在用AI识别追踪肤色变化，今天发现肤色指数提升了3个点！除了坚持涂防晒，物理遮蔽真的很重要。大家帮我看看现在的恢复状态怎么样？',
    images: ['https://picsum.photos/seed/skincare1/800/600'],
    tags: ['防晒', '护肤打卡'],
    likes: 128,
    comments: 28,
    shares: 12,
    report: {
      score: 82,
      trend: [
        { day: 1, value: 75 },
        { day: 5, value: 77 },
        { day: 10, value: 80 },
        { day: 15, value: 82 },
      ]
    },
    protection: {
      measures: ['涂抹SPF50+', '物理撑伞', '补涂2次'],
      image: 'https://picsum.photos/seed/skincare2/800/400'
    },
    expertReply: {
      expert: MOCK_USERS.doctor_zhang,
      content: '"从数据曲线来看，你的表皮屏障修复非常理想。建议在接下来的10天内继续保持物理遮蔽，同时可以增加含神经酰胺成分的修护乳液。目前的肤色提升属于正常的炎症后色素沉着消退期。"',
      time: '1小时前'
    }
  },
  {
    id: '2',
    author: MOCK_USERS.azheng,
    time: '2小时前',
    title: '坚持抗氧化护理第21天',
    content: '坚持抗氧化护理第21天，肤色暗沉明显改善，之前的过敏红斑也消退了不少。对比了皮肤检测报告，平滑度提升了15%！#护肤日记 #过敏修复',
    images: ['https://picsum.photos/seed/skin_day1/400/400', 'https://picsum.photos/seed/skin_day21/400/400'],
    tags: ['护肤日记', '过敏修复'],
    likes: 128,
    comments: 42,
    shares: 5,
  },
  {
    id: '3',
    author: MOCK_USERS.yueyue,
    time: '5小时前',
    title: '求助！脸颊两侧突然起小红点',
    content: '求助！最近脸颊两侧突然起这种小红点，不痒但是很干。有用过同款情况的姐妹吗？目前的护肤品已经精简到只有凡士林了。',
    images: ['https://picsum.photos/seed/skin_problem/800/600'],
    tags: ['求助', '敏感肌'],
    likes: 32,
    comments: 89,
    shares: 2,
  }
];

export const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    title: '深度解析：为什么你的敏感肌总是不见好？',
    summary: '很多朋友在护肤过程中容易陷入盲目修护的误区。本文将从皮肤屏障生理机制出发，详解四大致敏核心因素，助你精准避雷...',
    cover: 'https://picsum.photos/seed/article1/800/400',
    author: MOCK_USERS.prof_zhang,
    views: '24.8k',
    likes: '1.2k',
    category: '护肤科学'
  },
  {
    id: '2',
    title: '痤疮治疗新方案：激光技术与口服药物的协同效应',
    summary: '传统治疗痤疮周期长、易反复。近年来光动力疗法与新型抗炎药物的结合正在改变临床现状，大幅降低了痤疮后瘢痕的形成...',
    cover: 'https://picsum.photos/seed/article2/800/400',
    author: MOCK_USERS.doctor_lin,
    views: '15.2k',
    likes: '856',
    category: '临床前沿'
  }
];
