import { request } from './request';
import type { Post, User, SkinRecord, CreatePostData } from '../pages/Community/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Mock 用户数据
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: '护肤达人小美',
    avatar: 'https://picsum.photos/seed/user1/100/100',
    location: '上海',
    isExpert: false,
  },
  {
    id: '2',
    name: '皮肤科医生李主任',
    avatar: 'https://picsum.photos/seed/user2/100/100',
    location: '北京',
    isExpert: true,
    title: '皮肤科主任医师',
    hospital: '协和医院',
    experience: '20年',
    consultations: 15234,
  },
  {
    id: '3',
    name: '战痘勇士',
    avatar: 'https://picsum.photos/seed/user3/100/100',
    location: '广州',
    isExpert: false,
  },
  {
    id: '4',
    name: '敏感肌护理师',
    avatar: 'https://picsum.photos/seed/user4/100/100',
    location: '深圳',
    isExpert: false,
  },
  {
    id: '5',
    name: '医美专家王医生',
    avatar: 'https://picsum.photos/seed/user5/100/100',
    location: '杭州',
    isExpert: true,
    title: '美容皮肤科专家',
    hospital: '浙大附一',
    experience: '15年',
    consultations: 8932,
  },
  {
    id: '6',
    name: '美白研究员',
    avatar: 'https://picsum.photos/seed/user6/100/100',
    location: '成都',
    isExpert: false,
  },
  {
    id: '7',
    name: '痘痘肌自救指南',
    avatar: 'https://picsum.photos/seed/user7/100/100',
    location: '武汉',
    isExpert: false,
  },
  {
    id: '8',
    name: '成分党小明',
    avatar: 'https://picsum.photos/seed/user8/100/100',
    location: '南京',
    isExpert: false,
  },
];

// Mock 帖子数据
const MOCK_POSTS: Post[] = [
  {
    id: '1',
    author: MOCK_USERS[0],
    time: '2小时前',
    title: '三个月战痘成功，分享我的经验',
    content: '从满脸痘痘到现在皮肤光滑，用了整整三个月时间。首先要感谢社区里各位姐妹的建议，让我少走了很多弯路。\n\n我的护肤步骤：\n1. 早上：清水洗脸→爽肤水→维C精华→防晒\n2. 晚上：卸妆→洁面→水杨酸→修护精华→面霜\n\n最重要的是坚持和耐心，不要频繁更换护肤品！',
    images: [
      'https://picsum.photos/seed/post1a/400/400',
      'https://picsum.photos/seed/post1b/400/400',
    ],
    tags: ['痤疮', '护肤心得', '祛痘印'],
    likes: 2345,
    comments: 567,
    shares: 123,
    report: {
      score: 85,
      trend: [
        { day: 1, value: 60 },
        { day: 7, value: 65 },
        { day: 14, value: 72 },
        { day: 21, value: 78 },
        { day: 30, value: 85 },
      ],
    },
    expertReply: {
      expert: MOCK_USERS[1],
      content: '你的护肤步骤很科学，建议继续坚持使用水杨酸，但要注意浓度不要过高。如果痘痘反复，建议来医院做个全面检查。',
      time: '1小时前',
    },
  },
  {
    id: '2',
    author: MOCK_USERS[2],
    time: '4小时前',
    title: '求助：这种痘痘该怎么办？',
    content: '最近下巴和额头长了很多这种红肿的痘痘，按压会疼，已经两周了没有消退。用过阿达帕林凝胶，但是效果不明显。有没有姐妹有类似经历的？求推荐有效的治疗方法！',
    images: [
      'https://picsum.photos/seed/post2a/400/400',
      'https://picsum.photos/seed/post2b/400/400',
    ],
    tags: ['痤疮', '求助', '敏感肌'],
    likes: 456,
    comments: 234,
    shares: 45,
    expertReply: {
      expert: MOCK_USERS[1],
      content: '从图片看是炎症性痤疮，建议口服抗生素配合外用药物治疗。同时注意饮食清淡，避免熬夜。',
      time: '3小时前',
    },
  },
  {
    id: '3',
    author: MOCK_USERS[3],
    time: '5小时前',
    title: '敏感肌换季护理心得',
    content: '作为一个资深敏感肌，每到换季就头疼。经过无数次试错，终于总结出一套适合自己的护理方法。\n\n核心原则：精简护肤\n- 停用所有功效型产品\n- 只用基础保湿\n- 严格防晒\n\n推荐几个我用下来不错的产品：理肤泉B5修复霜、薇诺娜特护霜、雅漾喷雾。',
    images: [
      'https://picsum.photos/seed/post3a/400/400',
    ],
    tags: ['敏感肌', '护肤心得', '换季护肤'],
    likes: 1892,
    comments: 345,
    shares: 234,
  },
  {
    id: '4',
    author: MOCK_USERS[4],
    time: '6小时前',
    title: '激光祛斑后护理指南',
    content: '刚做完皮秒激光，医生嘱咐了很多注意事项，整理出来分享给大家：\n\n1. 前3天不能碰水\n2. 每天涂修复药膏\n3. 严格物理防晒\n4. 忌辛辣刺激食物\n5. 不要用手抠结痂\n\n期待效果！',
    images: [
      'https://picsum.photos/seed/post4a/400/400',
      'https://picsum.photos/seed/post4b/400/400',
    ],
    tags: ['淡斑', '医美体验', '术后护理'],
    likes: 1234,
    comments: 456,
    shares: 178,
  },
  {
    id: '5',
    author: MOCK_USERS[5],
    time: '8小时前',
    title: '美白精华测评对比',
    content: '用了市面上热门的几款美白精华，来做个真实测评：\n\n1. SK-II小灯泡：效果最明显，但价格贵\n2. 倩碧镭射瓶：温和不刺激，适合敏感肌\n3. 修丽可发光瓶：成分党最爱，效果明显\n4. 欧莱雅光子瓶：性价比高，学生党首选\n\n个人最推荐倩碧，温和有效！',
    images: [
      'https://picsum.photos/seed/post5a/400/400',
      'https://picsum.photos/seed/post5b/400/400',
      'https://picsum.photos/seed/post5c/400/400',
    ],
    tags: ['美白', '成分分析', '产品测评'],
    likes: 3456,
    comments: 678,
    shares: 456,
  },
  {
    id: '6',
    author: MOCK_USERS[6],
    time: '10小时前',
    title: '湿疹反复发作怎么办？',
    content: '手臂上的湿疹已经困扰我半年了，时好时坏。去医院看过，医生说是特应性皮炎，开了激素药膏。\n\n想问大家：\n1. 激素药膏能长期使用吗？\n2. 有什么好的保湿产品推荐？\n3. 饮食上需要注意什么？\n\n求支招！',
    images: [
      'https://picsum.photos/seed/post6a/400/400',
    ],
    tags: ['湿疹', '求助', '皮炎'],
    likes: 567,
    comments: 234,
    shares: 89,
    expertReply: {
      expert: MOCK_USERS[1],
      content: '激素药膏不建议长期使用，可以和非激素药膏交替使用。保湿推荐用含有神经酰胺的产品。',
      time: '8小时前',
    },
  },
  {
    id: '7',
    author: MOCK_USERS[7],
    time: '12小时前',
    title: 'A醇入门指南：从0.1%开始',
    content: '想尝试A醇抗老的姐妹看过来！作为过来人，强烈建议从低浓度开始建立耐受。\n\n我的建立耐受时间表：\n第1-2周：每周2次\n第3-4周：隔天使用\n第5周起：每天使用\n\n期间如果出现脱皮、泛红，就减少使用频率。',
    images: [
      'https://picsum.photos/seed/post7a/400/400',
      'https://picsum.photos/seed/post7b/400/400',
    ],
    tags: ['成分分析', '护肤心得', '抗老'],
    likes: 2345,
    comments: 456,
    shares: 345,
  },
  {
    id: '8',
    author: MOCK_USERS[0],
    time: '1天前',
    title: '防晒打卡第30天',
    content: '坚持涂防晒一个月了，来汇报一下成果！\n\n最明显的变化：\n- 肤色提亮了一个度\n- 痘印淡化速度变快\n- 皮肤整体状态更稳定\n\n姐妹们，防晒真的是最低成本的抗老方式！',
    images: [
      'https://picsum.photos/seed/post8a/400/400',
      'https://picsum.photos/seed/post8b/400/400',
    ],
    tags: ['防晒', '护肤打卡', '美白'],
    likes: 1567,
    comments: 234,
    shares: 123,
    report: {
      score: 78,
      trend: [
        { day: 1, value: 70 },
        { day: 7, value: 72 },
        { day: 14, value: 74 },
        { day: 21, value: 76 },
        { day: 30, value: 78 },
      ],
    },
  },
  {
    id: '9',
    author: MOCK_USERS[2],
    time: '1天前',
    title: '闭口粉刺清理记录',
    content: '额头长了很多闭口，今天去做了针清，记录一下恢复过程。\n\nDay 1：刚做完有点红肿，敷了医用面膜\n期待后续效果，会持续更新！',
    images: [
      'https://picsum.photos/seed/post9a/400/400',
      'https://picsum.photos/seed/post9b/400/400',
    ],
    tags: ['痤疮', '护肤打卡', '闭口'],
    likes: 890,
    comments: 123,
    shares: 67,
  },
  {
    id: '10',
    author: MOCK_USERS[3],
    time: '2天前',
    title: '玫瑰痤疮治疗半年总结',
    content: '确诊玫瑰痤疮半年了，从最初的红肿发烫到现在基本稳定，想给同样困扰的姐妹一些信心。\n\n治疗方案：\n1. 口服多西环素\n2. 外用壬二酸\n3. 严格防晒\n4. 避免诱因（辛辣、热饮、情绪激动）\n\n现在皮肤状态稳定多了，偶尔还会泛红但很快就能消退。',
    images: [
      'https://picsum.photos/seed/post10a/400/400',
      'https://picsum.photos/seed/post10b/400/400',
    ],
    tags: ['皮炎', '护肤心得', '玫瑰痤疮'],
    likes: 4567,
    comments: 890,
    shares: 567,
  },
  {
    id: '11',
    author: MOCK_USERS[4],
    time: '2天前',
    title: '水光针体验分享',
    content: '第一次尝试水光针，来分享一下体验：\n\n过程：敷麻药30分钟→注射15分钟→敷面膜\n疼痛感：可以忍受，像蚂蚁咬\n恢复期：前3天有针眼，第5天基本恢复\n效果：皮肤明显水润，毛孔有改善\n\n总体满意，会考虑定期做！',
    images: [
      'https://picsum.photos/seed/post11a/400/400',
    ],
    tags: ['医美体验', '补水', '毛孔'],
    likes: 2345,
    comments: 456,
    shares: 234,
  },
  {
    id: '12',
    author: MOCK_USERS[5],
    time: '3天前',
    title: '烟酰胺和维C能一起用吗？',
    content: '很多姐妹问烟酰胺和维C能不能一起用，查了很多资料，结论是：可以！\n\n但要注意：\n1. 浓度不要太高\n2. 敏感肌建议分开使用\n3. 白天用维C要做好防晒\n\n我自己是早上维C，晚上烟酰胺，效果很好。',
    images: [
      'https://picsum.photos/seed/post12a/400/400',
      'https://picsum.photos/seed/post12b/400/400',
    ],
    tags: ['成分分析', '美白', '护肤心得'],
    likes: 3456,
    comments: 567,
    shares: 456,
  },
];

// 获取帖子列表
export async function getPosts(params?: {
  category?: string;
  tag?: string;
  sort?: 'hot' | 'new';
  page?: number;
  pageSize?: number;
}): Promise<{ posts: Post[]; total: number; page: number; pageSize: number; totalPages: number }> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredPosts = [...MOCK_POSTS];
  
  // 根据标签筛选
  if (params?.tag) {
    filteredPosts = filteredPosts.filter(post => post.tags.includes(params.tag!));
  }
  
  // 排序
  if (params?.sort === 'new') {
    // 按时间排序（模拟）
    filteredPosts = filteredPosts.sort((a, b) => parseInt(b.id) - parseInt(a.id));
  } else {
    // 按热度排序
    filteredPosts = filteredPosts.sort((a, b) => b.likes - a.likes);
  }
  
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    posts: filteredPosts.slice(start, end),
    total: filteredPosts.length,
    page,
    pageSize,
    totalPages: Math.ceil(filteredPosts.length / pageSize),
  };
}

// 获取帖子详情
export async function getPostDetail(postId: string): Promise<Post & { comments_list?: any[] }> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const post = MOCK_POSTS.find(p => p.id === postId);
  if (!post) {
    throw new Error('帖子不存在');
  }
  
  return {
    ...post,
    comments_list: [
      {
        id: '1',
        author: MOCK_USERS[1],
        content: '很有帮助，谢谢分享！',
        time: '1小时前',
        likes: 23,
      },
      {
        id: '2',
        author: MOCK_USERS[2],
        content: '同款产品，效果确实不错',
        time: '2小时前',
        likes: 15,
      },
    ],
  };
}

// 创建帖子
export async function createPost(data: CreatePostData): Promise<{ success: boolean; message: string; postId: string }> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    success: true,
    message: '发布成功',
    postId: Math.random().toString(36).substring(7),
  };
}

// 点赞/取消点赞
export async function likePost(postId: string): Promise<{ success: boolean; liked: boolean; likes: number }> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return {
    success: true,
    liked: true,
    likes: Math.floor(Math.random() * 1000) + 100,
  };
}

// 创建评论
export async function createComment(postId: string, content: string, parentId?: string): Promise<{ success: boolean; message: string; commentId: string }> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    message: '评论成功',
    commentId: Math.random().toString(36).substring(7),
  };
}

// 获取皮肤报告列表
export async function getSkinRecords(): Promise<{ records: SkinRecord[] }> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    records: [
      {
        id: '1',
        createdAt: new Date().toISOString(),
        skinOverall: '轻度痤疮',
        skinIssues: ['痤疮', '痘印'],
        photoClarity: 85,
      },
      {
        id: '2',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        skinOverall: '敏感肌',
        skinIssues: ['泛红', '干燥'],
        photoClarity: 78,
      },
    ],
  };
}

// 上传图片（模拟，实际应该上传到云存储）
export async function uploadImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const randomId = Math.random().toString(36).substring(7);
      resolve(`https://picsum.photos/seed/${randomId}/800/600`);
    };
    reader.readAsDataURL(file);
  });
}

export type { Post, User, SkinRecord, CreatePostData };
