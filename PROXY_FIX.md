# 🔧 代理问题解决方案

## ❌ 问题描述

构建时出现错误：
```
Connect to 127.0.0.1:7897 failed: Connection refused: getsockopt
```

## 🔍 问题原因

系统注册表中配置了代理 `127.0.0.1:7897`，但代理服务未运行。

## ✅ 已执行的修复

### 1. 清理 Gradle 代理配置
- 文件：`C:\Users\你的用户名\.gradle\gradle.properties`
- 已删除所有 `systemProp.http.proxyHost` 和 `systemProp.https.proxyHost` 配置

### 2. 禁用系统代理
- 修改注册表：`HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings`
- 设置 `ProxyEnable = 0`

### 3. 清理 Gradle 缓存
- 删除了 `.gradle`、`build`、`app\build` 文件夹

## 🚀 下一步操作

### 方法 1: 使用 Android Studio（推荐）⭐

由于系统 Java 版本是 25（不兼容 Gradle 8.2.2），**强烈建议使用 Android Studio**：

1. **打开 Android Studio**
2. **Open** → 选择 `e:\workspace\SkinAI\skinAI\apps\web\android`
3. **等待 Gradle 同步**完成
4. **Build** → **Build APK(s)**

Android Studio 会自动使用内置的 JDK 17/21，不会有兼容性问题。

### 方法 2: 安装 JDK 17 后使用命令行

如果你想使用命令行构建：

1. **下载并安装 JDK 17**
   - 从 Oracle 或 Microsoft 下载
   - 或使用 Android Studio 内置的 JDK

2. **配置 JDK 路径**
   
   编辑 `e:\workspace\SkinAI\skinAI\apps\web\android\gradle.properties`，添加：
   ```properties
   org.gradle.java.home=C:\\Program Files\\Java\\jdk-17
   ```

3. **重新构建**
   ```bash
   cd e:\workspace\SkinAI\skinAI\apps\web
   npm run android:sync
   
   cd android
   .\gradlew assembleDebug
   ```

## 📝 验证代理已禁用

运行以下命令验证：
```powershell
# 检查注册表代理设置
[Microsoft.Win32.Registry]::GetValue("HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings", "ProxyEnable", $null)
# 应该返回 0

# 检查环境变量
$env:HTTP_PROXY
$env:HTTPS_PROXY
# 应该返回空
```

## 🔄 如果仍然遇到问题

### 完全清理并重建

```bash
# 1. 清理所有缓存
cd e:\workspace\SkinAI\skinAI\apps\web\android
Remove-Item -Path ".gradle" -Recurse -Force
Remove-Item -Path "build" -Recurse -Force
Remove-Item -Path "app\build" -Recurse -Force

# 2. 清理 Gradle 全局缓存
cd ~
Remove-Item -Path ".gradle\caches" -Recurse -Force

# 3. 重新同步
cd e:\workspace\SkinAI\skinAI\apps\web
npm run android:sync
```

### 在 Android Studio 中清理缓存

1. **File** → **Invalidate Caches** → **Invalidate and Restart**
2. 等待 Android Studio 重启
3. 重新打开项目并同步

---

**最后更新**: 2024-01-XX
**状态**: 代理已禁用 ✅
