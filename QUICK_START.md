# 🚀 快速开始 - 构建 Android APK

> 这是最简化的构建指南，详细文档请查看 [ANDROID_BUILD_GUIDE.md](./ANDROID_BUILD_GUIDE.md)

---

## ✅ 前提条件

- ✅ 已安装 **Android Studio**（最新稳定版）
- ✅ 已完成 `npm run android:sync`

---

## 📦 快速构建步骤

### 步骤 1: 同步项目到 Android

打开 **PowerShell** 或 **命令提示符**，执行：

```bash
cd e:\workspace\SkinAI\skinAI\apps\web
npm run android:sync
```

等待看到 `Sync finished` 消息。

---

### 步骤 2: 用 Android Studio 打开项目

1. 启动 **Android Studio**
2. 点击 **Open** 或 **Open an Existing Project**
3. 选择文件夹：`e:\workspace\SkinAI\skinAI\apps\web\android`
4. 点击 **OK**

---

### 步骤 3: 等待 Gradle 同步

- Android Studio 会自动同步 Gradle 项目（首次可能需要几分钟）
- 等待底部状态栏显示 **"Sync Successful"**

---

### 步骤 4: 构建 APK

点击顶部菜单：

**Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**

等待构建完成。

---

### 步骤 5: 找到 APK 文件

构建成功后会弹出通知，点击 **"locate"**，或在文件资源管理器中打开：

```
e:\workspace\SkinAI\skinAI\apps\web\android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 📱 安装到手机

### 方法 1: USB 调试安装

1. 手机启用 **开发者选项** 和 **USB 调试**
2. 连接手机到电脑
3. 运行命令：
   ```bash
   adb install e:\workspace\SkinAI\skinAI\apps\web\android\app\build\outputs\apk\debug\app-debug.apk
   ```

### 方法 2: 直接传输

1. 将 APK 文件复制到手机
2. 在手机上点击 APK 文件安装
3. 允许 "安装未知来源应用"

---

## ❌ 遇到问题？

### 错误：Java 版本不支持

```
Unsupported class file major version 69
```

**解决**:
1. Android Studio 中点击 **File** → **Settings**
2. 导航到 **Build, Execution, Deployment** → **Build Tools** → **Gradle**
3. 设置 **Gradle JDK** 为 **Android Studio 内置 JDK**
4. 点击 **Apply** → **OK**
5. 点击工具栏的 🔄 按钮重新同步

---

### 错误：代理连接失败

```
Connect to 127.0.0.1:7897 failed
```

**解决**:
1. 打开 `C:\Users\你的用户名\.gradle\gradle.properties`
2. 删除所有包含 `proxy` 的行
3. 保存文件
4. 重启 Android Studio

---

### 错误：Gradle 同步失败

**解决**:
1. 关闭 Android Studio
2. 删除以下文件夹：
   - `e:\workspace\SkinAI\skinAI\apps\web\android\.gradle`
   - `e:\workspace\SkinAI\skinAI\apps\web\android\build`
3. 重新打开 Android Studio
4. 点击 **File** → **Invalidate Caches** → **Invalidate and Restart**

---

## 📋 验证 APK

构建成功的 APK 应该：
- ✅ 文件大小约 1-2 MB
- ✅ 路径包含 `debug`（Debug 版本）
- ✅ 可以被 Android 手机安装

---

## 🎯 下一步

- 在 Android Studio 中连接模拟器或真机进行调试
- 使用 **Run** 按钮 (▶️) 直接运行应用
- 查看详细文档获取更多配置选项

---

**最后更新**: 2024-01-XX
**适用版本**: 1.0
