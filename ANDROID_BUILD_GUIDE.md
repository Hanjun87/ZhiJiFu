# 知己肤 Android 应用打包与 Android Studio 使用指南

## 📱 项目概述

本项目使用 **Capacitor + React** 构建跨平台移动应用，支持 Android 平台。

- **应用名称**: 知己肤
- **包名**: `com.zhijifu.app`
- **版本**: 1.0
- **框架**: Capacitor 8.2.0 + React 19
- **最低 Android 版本**: API 22 (Android 5.1)

---

## 🔧 环境要求

### 必需软件

1. **Node.js** (v18 或更高版本)
2. **npm** (已包含在 Node.js 中)
3. **Android Studio** (最新稳定版)
4. **Android SDK** (API 34 或更高)
5. **JDK 17** 或 **JDK 21** (Android Studio 内置)

### 可选工具

- Git (版本控制)

---

## 📦 方法一：使用 Android Studio (强烈推荐 ⭐)

> **为什么推荐使用 Android Studio？**
> - 自动配置正确的 JDK 版本（内置 JDK 17/21）
> - 自动处理 Gradle 依赖下载
> - 可视化构建过程，易于调试
> - 可以直接在模拟器上测试应用

### 步骤 1: 构建 Web 项目并同步到 Android

首先需要在命令行中构建 Web 项目并同步到 Android：

```bash
# 进入 web 项目目录
cd e:\workspace\SkinAI\skinAI\apps\web

# 构建生产版本并同步到 Android
npm run android:sync
```

这个命令会自动：
- 使用 Vite 构建生产版本的 Web 应用
- 将构建产物复制到 Android 项目
- 同步 Capacitor 配置

### 步骤 2: 用 Android Studio 打开项目

1. 启动 **Android Studio**
2. 点击 **"Open an Existing Project"** (打开现有项目)
3. 选择目录：`e:\workspace\SkinAI\skinAI\apps\web\android`
4. 点击 **"OK"**

### 步骤 3: 等待项目同步

- Android Studio 会自动下载依赖并同步 Gradle 项目
- 首次打开可能需要几分钟时间
- 等待底部状态栏显示 "Sync Successful"

### 步骤 4: 配置 JDK (如需要)

如果遇到 Java 版本错误：

1. 点击 **File** → **Settings** → **Build, Execution, Deployment** → **Build Tools** → **Gradle**
2. 设置 **Gradle JDK** 为 **Android Studio 内置的 JDK** (通常是 `jbr-17` 或 `jbr-21`)
3. 点击 **Apply** → **OK**
4. 点击工具栏的 **"Sync Project with Gradle Files"** 按钮 (🔄图标)

### 步骤 5: 构建 APK

#### 方式 A: 使用菜单构建（推荐）

1. 点击顶部菜单 **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. 等待构建完成
3. 构建成功后会弹出通知，点击 **"locate"** 可以找到 APK 文件

#### 方式 B: 使用 Gradle 面板

1. 在右侧边栏找到 **Gradle** 面板
2. 展开 `:app` → **Tasks** → **build**
3. 双击 **assembleDebug** (构建 Debug 版)

### 步骤 6: 获取 APK 文件

构建成功后，APK 文件位于：

```
e:\workspace\SkinAI\skinAI\apps\web\android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 📦 方法二：使用命令行（仅当你有 JDK 17 或 21 时）

> **注意**: 此方法需要系统安装 JDK 17 或 JDK 21。如果你只有 Java 25 或更高版本，请使用 Android Studio 方法。

### 前提条件

确保你有兼容的 Java 版本：
```bash
java -version
```

需要看到 `version "17"` 或 `version "21"`。如果是其他版本（如 Java 25），需要：
- 安装 JDK 17 或 21，或
- 使用 Android Studio（推荐）

### 步骤 1: 配置 JDK 路径（可选）

如果你有多个 Java 版本，在 `gradle.properties` 中指定 JDK 路径：

编辑 `e:\workspace\SkinAI\skinAI\apps\web\android\gradle.properties`，添加：
```properties
org.gradle.java.home=C:\\Program Files\\Java\\jdk-17
```

### 步骤 2: 构建并同步项目

```bash
cd e:\workspace\SkinAI\skinAI\apps\web
npm run android:sync
```

### 步骤 3: 使用 Gradle 构建 APK

```bash
cd e:\workspace\SkinAI\skinAI\apps\web\android

# 构建 Debug 版本
.\gradlew assembleDebug

# 或构建 Release 版本（需要签名配置）
.\gradlew assembleRelease
```

### 步骤 4: 获取 APK 文件

构建成功后，APK 文件位于：
```
e:\workspace\SkinAI\skinAI\apps\web\android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 📱 安装和测试 APK

### 方式 1: 通过 USB 调试安装

1. 在 Android 手机上启用 **开发者选项** 和 **USB 调试**
2. 连接手机到电脑
3. 使用 ADB 安装：

```bash
adb install e:\workspace\SkinAI\skinAI\apps\web\android\app\build\outputs\apk\debug\app-debug.apk
```

### 方式 2: 直接传输 APK

1. 将 APK 文件复制到手机
2. 在手机上打开 APK 文件进行安装
3. 可能需要允许 "安装未知来源应用"

### 方式 3: 从 Android Studio 直接运行

1. 连接 Android 设备或启动模拟器
2. 在 Android Studio 中点击 **Run** 按钮 (▶️)
3. 选择目标设备
4. 应用会自动安装并启动

---

## 🔐 构建 Release 版本 (用于发布)

### 步骤 1: 生成签名密钥

```bash
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-alias
```

### 步骤 2: 配置签名

编辑 `e:\workspace\SkinAI\skinAI\apps\web\android\app\build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file("path/to/my-release-key.jks")
            storePassword "your-store-password"
            keyAlias "my-alias"
            keyPassword "your-key-password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 步骤 3: 构建 Release APK

```bash
cd e:\workspace\SkinAI\skinAI\apps\web\android
gradlew assembleRelease
```

---

## ⚙️ 配置说明

### 应用配置

配置文件位于：`e:\workspace\SkinAI\skinAI\apps\web\capacitor.config.ts`

```typescript
const config: CapacitorConfig = {
  appId: 'com.zhijifu.app',    // 应用 ID
  appName: '知己肤',            // 应用名称
  webDir: 'dist'               // Web 构建输出目录
};
```

### AndroidManifest.xml

位置：`e:\workspace\SkinAI\skinAI\apps\web\android\app\src\main\AndroidManifest.xml`

主要权限：
- `INTERNET`: 网络访问权限
- 已配置文件提供者以支持文件上传/下载

### build.gradle 配置

**最低 SDK 版本**: 22 (Android 5.1)
**目标 SDK 版本**: 34 (Android 14)
**编译 SDK 版本**: 34

---

## 🔧 常见问题解决

### 1. Java 版本错误 ⭐ 最常见

**错误信息**:
```
Unsupported class file major version 69
```
或
```
Could not resolve com.android.tools.build:gradle:8.2.2
```

**原因**: 系统安装的 Java 版本太新（Java 25），Gradle 8.2.2 不支持。

**解决方案 A** (推荐): 使用 Android Studio
1. 打开 Android Studio
2. File → Settings → Build, Execution, Deployment → Build Tools → Gradle
3. 设置 **Gradle JDK** 为 **Android Studio 内置 JDK** (jbr-17 或 jbr-21)
4. 点击 Apply → OK
5. 重新同步项目

**解决方案 B**: 安装 JDK 17 或 21
1. 下载并安装 JDK 17 或 21
2. 编辑 `gradle.properties`，添加：
   ```properties
   org.gradle.java.home=C:\\Program Files\\Java\\jdk-17
   ```
3. 重新运行构建命令

### 2. 代理配置错误

**错误信息**:
```
Connect to 127.0.0.1:7897 [/127.0.0.1] failed: Connection refused
```

**原因**: Gradle 配置了代理，但代理服务未运行。

**解决方案**:
编辑全局 Gradle 配置文件（通常在 `C:\Users\你的用户名\.gradle\gradle.properties`），删除以下行：
```properties
systemProp.http.proxyHost=127.0.0.1
systemProp.http.proxyPort=7897
systemProp.https.proxyHost=127.0.0.1
systemProp.https.proxyPort=7897
```

### 3. Gradle 同步失败

**解决方案**:
- 删除项目中的 `.gradle` 文件夹
- 删除 `build` 文件夹
- 在 Android Studio 中点击 **File** → **Invalidate Caches** → **Invalidate and Restart**
- 检查网络连接（可能需要 VPN 下载依赖）

### 4. SDK 版本不匹配

**解决方案**:
1. 打开 Android Studio 的 **SDK Manager** (Tools → SDK Manager)
2. 安装以下组件：
   - Android API 34 (Android 14)
   - Android SDK Build-Tools 34.0.0
   - Android SDK Platform-Tools
3. 点击 Apply 安装
4. 重新同步项目

### 5. 构建失败 - 内存不足

**错误**: `OutOfMemoryError` 或 `GC overhead limit exceeded`

**解决方案**:
编辑 `e:\workspace\SkinAI\skinAI\apps\web\android\gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError
```

### 6. APK 安装失败

**可能原因**:
- Android 版本太低 (需要 5.1 以上)
- 未允许安装未知来源应用
- APK 文件损坏
- 签名冲突（已安装其他版本）

**解决方案**:
- 检查设备 Android 版本（设置 → 关于手机）
- 设置 → 安全 → 允许安装未知来源应用
- 重新构建 APK
- 卸载旧版本应用后再安装

### 7. 找不到 gradlew 命令

**解决方案**:
- 确保在 Android 项目目录：`cd e:\workspace\SkinAI\skinAI\apps\web\android`
- Windows PowerShell 使用：`.\gradlew.bat` 或 `.\gradlew`
- 确保 gradlew 文件有执行权限（Linux/Mac: `chmod +x gradlew`）

---

## 📊 项目结构

```
apps/web/
├── src/                      # React 源代码
├── dist/                     # 构建输出 (Vite 生成)
├── android/                  # Android 项目
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/        # Java 源代码
│   │   │   ├── res/         # 资源文件
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle     # 应用级构建配置
│   ├── build.gradle         # 项目级构建配置
│   └── gradle.properties    # Gradle 配置
├── capacitor.config.ts      # Capacitor 配置
└── package.json             # Node.js 依赖
```

---

## 🎯 快速参考命令

### 开发和调试

```bash
# 开发模式 (热重载)
npm run dev

# 构建生产版本
npm run build

# 同步到 Android
npm run android:sync

# 打开 Android Studio
npm run android:open
```

### 构建命令

```bash
# 构建 Debug APK
cd android && gradlew assembleDebug

# 构建 Release APK
cd android && gradlew assembleRelease

# 清理构建
cd android && gradlew clean
```

### 安装命令

```bash
# 安装到连接的设备
adb install app-debug.apk

# 查看设备日志
adb logcat

# 清除应用数据
adb shell pm clear com.zhijifu.app
```

---

## 📞 技术支持

如有问题，请检查：
1. Node.js 和 npm 版本
2. Android Studio 和 SDK 版本
3. Gradle 和 JDK 版本兼容性
4. 构建日志中的具体错误信息

---

## 📝 更新日志

- **2024-01-XX**: 初始版本
  - Capacitor 8.2.0
  - React 19
  - Android API 34
  - 支持 Android 5.1+

---

**最后更新**: 2024-01-XX
**文档版本**: 1.0
