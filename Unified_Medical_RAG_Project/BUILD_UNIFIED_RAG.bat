@echo off
chcp 65001 >nul
title 统一医学知识库RAG构建（皮肤病+伤口护理）

echo ==========================================
echo   统一医学知识库RAG构建程序
echo ==========================================
echo   整合：皮肤病 + 伤口护理
echo ==========================================
echo.

REM 检查Python是否安装
echo [1/5] 检查Python安装...
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到Python安装！
    echo 请先安装Python 3.11或更高版本
    pause
    exit /b 1
)
echo [✓] Python已安装
python --version
echo.

REM 检查数据文件
echo [2/5] 检查数据文件...
set missing_files=0

if not exist "dermatology_rag_data.json" (
    echo [✗] 未找到皮肤病数据文件: dermatology_rag_data.json
    set missing_files=1
) else (
    echo [✓] 皮肤病数据文件存在
)

if not exist "complete_wound_database.json" (
    echo [✗] 未找到伤口护理数据文件: complete_wound_database.json
    set missing_files=1
) else (
    echo [✓] 伤口护理数据文件存在
)

if %missing_files%==1 (
    echo.
    echo [错误] 缺少必要的数据文件！
    pause
    exit /b 1
)
echo.

REM 安装依赖
echo [3/5] 检查并安装依赖...
echo 正在安装/检查所需依赖包...
python -m pip install llama-index chromadb sentence-transformers llama-index-vector-stores-chroma llama-index-embeddings-huggingface -q
echo [✓] 依赖安装完成
echo.

REM 构建统一RAG知识库
echo [4/5] 构建统一医学知识库RAG...
echo 正在构建向量索引，这可能需要几分钟时间...
echo 包含：皮肤病 + 伤口护理 两大知识领域
echo.
python build_unified_rag.py
if errorlevel 1 (
    echo.
    echo [错误] 统一RAG知识库构建失败！
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   构建完成！
echo ==========================================
echo.
echo 使用方法：
echo.
echo 1. 查询统一知识库：
echo    python -c "from build_unified_rag import query_unified_rag; print(query_unified_rag('什么是湿疹？'))"
echo.
echo 2. 只查询皮肤病：
echo    python -c "from build_unified_rag import query_dermatology; print(query_dermatology('什么是湿疹？'))"
echo.
echo 3. 只查询伤口护理：
echo    python -c "from build_unified_rag import query_wound; print(query_wound('什么是压力性损伤？'))"
echo.
echo 4. Python代码中使用：
echo    from build_unified_rag import query_unified_rag, query_dermatology, query_wound
echo    result = query_unified_rag("您的医学问题")
echo    print(result)
echo.
echo ==========================================
echo.

pause