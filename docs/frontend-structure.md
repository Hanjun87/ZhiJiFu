# SkinAI 前端项目结构说明

## 项目概述

SkinAI 前端是一个基于 React + TypeScript + Vite 构建的移动端 Web 应用，采用 SPA（单页应用）架构，实现皮肤健康检测、社区交流和健康日记等功能。

## 技术栈

- **框架**: React 19
- **构建工具**: Vite 6
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **动画**: Motion (framer-motion)
- **图标**: Lucide React

## 目录结构

```
apps/web/src/
├── api/                          # API 请求模块
│   ├── index.ts                  # API 导出入口
│   └── request.ts                # 统一请求封装函数
│
├── components/                   # 可复用组件
│   └── common/
│       ├── BottomNav.tsx         # 底部导航栏组件
│       └── PostCard.tsx          # 帖子卡片组件
│
├── modules/                      # 业务模块
│   └── skin/
│       ├── api.ts                # 皮肤分析 API 调用
│       ├── hooks.ts              # 皮肤分析相关 Hooks
│       ├── index.ts              # 模块导出
│       ├── types.ts              # 模块类型定义
│       └── utils.ts              # 模块工具函数
│
├── pages/                       # 页面组件
│   ├── Community/               # 社区模块
│   │   ├── CommunityFeed.tsx    # 社区动态流
│   │   ├── CreatePost.tsx       # 发布帖子
│   │   ├── ExpertColumn.tsx     # 专家专栏
│   │   ├── PostDetail.tsx       # 帖子详情
│   │   ├── constants.ts         # 常量定义
│   │   └── types.ts             # 类型定义
│   │
│   ├── Diary/                   # 健康日记模块
│   │   ├── DiaryDetail.tsx      # 日记详情
│   │   └── index.tsx            # 日记列表页
│   │
│   ├── Home/                    # 首页模块（核心功能）
│   │   ├── Analysis.tsx         # 分析中页面
│   │   ├── Camera.tsx           # 拍照页面
│   │   ├── Result.tsx           # 分析结果页面
│   │   └── index.tsx            # 首页
│   │
│   ├── Profile/                 # 个人中心模块
│   │   ├── PlaceholderPage.tsx  # 占位页面
│   │   └── index.tsx            # 个人中心页
│   │
│   └── Records/                 # 记录模块
│       ├── RecordDetail.tsx     # 记录详情
│       └── index.tsx            # 记录列表页
│
├── App.tsx                      # 主应用组件（路由及状态管理）
├── index.css                    # 全局样式
├── main.tsx                     # 入口文件
├── types.ts                     # 全局类型定义
└── vite-env.d.ts                # Vite 类型声明
```

## 页面路由结构

采用前端路由方案，通过 `currentPage` 状态控制页面切换：

### Tab 页面（Level 0）
- `home` - 首页（皮肤识别入口）
- `records` - 识别记录
- `community` - 社区
- `diary` - 健康日记
- `profile` - 个人中心

### 子页面（Level 1）
- `camera` - 拍照页面
- `analysis` - 分析中页面
- `result` - 分析结果页面
- `record_detail` - 记录详情
- `diary_detail` - 日记详情
- `community_post_detail` - 帖子详情
- `community_expert` - 专家专栏
- `community_create` - 发布帖子

## 核心模块说明

### 1. 首页模块 (Home)

**功能**：皮肤拍照识别

**核心流程**：
1. 用户点击首页「拍照识别」按钮 → 跳转 Camera 页面
2. 打开摄像头或选择相册图片
3. 拍摄/选择图片后自动上传 → 跳转 Analysis 页面
4. 调用后端 AI API 分析 → 跳转 Result 页面显示结果
5. 用户可选择保存到记录

**关键组件**：
- [Camera.tsx](file:///e:/workspace/SkinAI/skinAI/apps/web/src/pages/Home/Camera.tsx) - 摄像头控制、拍照、相册选择
- [Analysis.tsx](file:///e:/workspace/SkinAI/skinAI/apps/web/src/pages/Home/Analysis.tsx) - 分析中动画显示
- [Result.tsx](file:///e:/workspace/SkinAI/skinAI/apps/web/src/pages/Home/Result.tsx) - 分析结果展示

### 2. 皮肤分析模块 (modules/skin)

**功能**：封装皮肤识别相关逻辑

**主要功能**：
- `api.ts` - 调用后端 `/api/analyze-skin` 接口进行 AI 皮肤分析
- `hooks.ts` - 提供皮肤分析相关的 React Hooks
- `types.ts` - 定义 `SkinAnalyzePayload`, `SkinAnalyzeResult` 等类型

### 3. API 请求模块 (api)

**功能**：统一处理 HTTP 请求

**实现**：
- 使用原生 `fetch` API
- 封装统一的 `request<T>` 函数
- 支持 GET/POST 等方法
- 统一错误处理

### 4. 状态管理

采用 React 内置的 `useState` 和 `useContext`：

**App.tsx 全局状态**：
- `currentPage` - 当前页面
- `capturedImage` - 拍摄的图片 base64
- `analysisResult` - 分析结果
- `records` - 识别记录列表
- `isAnalyzing` - 是否正在分析

## 数据流

```
用户操作 → App.tsx 状态变更 → 页面重新渲染
                ↓
         调用 API (modules/skin/api.ts)
                ↓
         请求后端 (http://localhost:8787)
                ↓
         AI 分析返回结果
                ↓
         更新状态 → 页面跳转/显示结果
```

## 环境变量

```bash
# 前端配置
VITE_API_BASE_URL=    # 后端 API 地址（可选，网页开发可留空）
```

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器（端口 3000）
npm run dev

# 构建生产版本
npm run build

# 代码检查
npm run lint
```

## 后端 API 接口

前端通过以下接口与后端通信：

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/analyze-skin` | POST | 皮肤分析（需上传 base64 图片） |

## 扩展说明

### 添加新页面

1. 在 `pages/` 下创建新模块目录
2. 编写页面组件
3. 在 `types.ts` 的 `Page` 类型中添加新页面名称
4. 在 `App.tsx` 的 `levels` 对象中配置页面层级
5. 在对应位置导入并渲染组件

### 添加新 API

1. 在 `modules/` 下创建对应业务模块
2. 编写 API 调用函数
3. 在模块 `index.ts` 中导出
