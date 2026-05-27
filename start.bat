@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo.
echo ============================================
echo   皮玺玉 x AI 貔貅 · 个人 IP 站点 启动器
echo ============================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [X] 没找到 Node.js
  echo     请先安装：https://nodejs.org/
  pause
  exit /b 1
)

set PORT=5173

netstat -ano | findstr ":%PORT% " | findstr "LISTENING" >nul
if not errorlevel 1 (
  echo [!] 端口 %PORT% 已被占用
  echo.
  echo   1) 杀掉占用进程
  echo   2) 改用端口 5174
  echo   3) 取消
  echo.
  set /p choice="请选择 (1/2/3): "
  if "!choice!"=="1" (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
      taskkill /F /PID %%a >nul 2>&1
      echo [OK] 已结束 PID %%a
    )
  ) else if "!choice!"=="2" (
    set PORT=5174
    echo [OK] 端口切换为 %PORT%
  ) else (
    echo [X] 已取消
    pause
    exit /b 0
  )
)

if not exist "node_modules\" (
  echo [.] 第一次跑，先装依赖...
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo [X] 依赖安装失败
    pause
    exit /b 1
  )
)

echo [.] 启动 dev server (端口 %PORT%)...
echo.
echo   浏览器即将自动打开 http://localhost:%PORT%/
echo   关闭此窗口即可停止 dev server
echo.

start "" "http://localhost:%PORT%/"
call npm run dev -- --port %PORT%

endlocal
