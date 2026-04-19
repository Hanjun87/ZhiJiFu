知己肤 - AI皮肤健康检测平台

项目简介
--------
一款基于人工智能的皮肤健康检测与管理移动应用，提供皮肤疾病识别、
健康记录追踪、社区交流、专家咨询等功能。


技术栈
------
前端: React 19 + TypeScript + Vite + Tailwind CSS + Capacitor
后端: Node.js + Express + Python Django
AI模型: PyTorch + PanDerm (Vision Transformer)


项目结构
--------
apps/web/          前端应用 (React + Capacitor移动端)
backend/            Express API网关
services/django/    Django核心服务
model/              AI模型与预测代码
img/                图片素材
assets_backup/      素材备份
start.py            一键启动脚本


核心功能
--------
1. 皮肤AI检测 - 拍照或上传图片识别皮肤疾病
2. 健康档案 - 记录检测历史，追踪皮肤状态
3. 社区交流 - 帖子分享、专家文章、用户互动
4. 专家咨询 - 在线咨询皮肤科医生
5. 医院页面 - 查看专家信息，预约挂号
6. 用户系统 - 支持普通用户和医生角色


快速启动
--------
使用一键启动脚本（推荐）:
  python start.py

这会同时启动：
- 前端应用 (http://localhost:3001)
- Django后端 (http://localhost:8788)
- Node API网关 (http://localhost:8790)

按 Ctrl+C 停止所有服务


手动启动（开发调试）
--------------------
npm run dev:web       启动前端
npm run dev:django    启动Django
npm run dev:api       启动API网关


常用命令
--------
开发:
  python start.py          一键启动所有服务
  npm run dev:web          单独启动前端
  npm run dev:django       单独启动Django
  npm run dev:api          单独启动API服务

构建:
  npm run build:web        构建前端生产版本
  npm run build:backend    构建后端

移动端:
  npm run android:sync     同步到Android项目
  npm run android:open     打开Android Studio
  npm run android:build:debug  构建调试包

Django管理:
  npm run migrate:admin    数据库迁移
  npm run setup:commercial 初始化后台
  npm run createsuperuser:admin 创建管理员


AI模型说明
----------
采用二阶段层级分类：
- Stage 1: 23大类粗分类 (准确率63.77%)
- Stage 2: 细分类 (11个高精度类别)
- Top-3准确率: 83.31%

模型文件位置: model/models/
- stage1_best.pth
- 18个分类专用模型


环境要求
--------
Node.js >= 18.0.0
Python >= 3.10
PyTorch >= 2.0 (GPU推荐)


安装步骤
--------
1. 安装Node依赖
   npm install

2. 创建Python虚拟环境
   python -m venv .venv

3. 安装Python依赖
   .venv\Scripts\pip install -r services\django\requirements.txt
   .venv\Scripts\pip install torch torchvision

4. 配置环境变量
   复制 .env.example 到 .env 并填写配置

5. 启动项目
   python start.py


主要API
-------
POST /api/auth/register          用户注册
POST /api/auth/login             登录
POST /api/analyze-skin           皮肤识别
POST /api/analyze-skin-record    状态分析
POST /api/ai-doctor-chat         AI医生对话
POST /api/ai-doctor-chat-stream  流式对话


注意事项
--------
1. AI诊断仅供参考，不能替代专业医疗建议
2. 首次启动会自动加载AI模型，需要一些时间
3. 确保端口3001、8788、8790未被占用
4. 移动端打包需要Android Studio或Xcode


版本信息
--------
知己肤 v1.0.0
许可证: Apache-2.0
