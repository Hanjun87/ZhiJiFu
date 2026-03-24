src/
├── assets/                # 静态资源（图片 / 字体 / 全局样式）
├── components/            # ⭐ 通用组件（跨页面复用）
│   ├── Button/
│   ├── Card/
│   └── Modal/
│
├── pages/                 # ⭐ 页面（路由级组件）
│   ├── Home/
│   ├── Detect/
│   ├── Result/
│   └── Profile/
│
├── modules/               # ⭐⭐ 核心（按业务拆分）
│   ├── skin/              # 皮肤检测模块（你的项目重点）
│   │   ├── api.ts         # 接口
│   │   ├── hooks.ts       # 自定义 hooks
│   │   ├── store.ts       # 状态（可选）
│   │   ├── types.ts       # TS类型
│   │   └── utils.ts
│   │
│   ├── user/
│   └── ai/
│
├── api/                   # ⭐ 全局请求层
│   ├── request.ts         # axios封装（拦截器）
│   └── index.ts
│
├── store/                 # 全局状态（Redux / Zustand）
├── hooks/                 # 全局 hooks
├── router/                # 路由配置
├── utils/                 # 工具函数
├── types/                 # 全局类型定义
├── constants/             # 常量（配置项 / 枚举）
│
├── App.tsx                # 根组件
└── main.tsx               # 入口