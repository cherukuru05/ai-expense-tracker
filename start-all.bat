@echo off
echo ============================================
echo  FinTrack AI - Full Stack Startup
echo ============================================
echo.

REM Check if MongoDB data directory exists
if not exist "D:\mongodb_data" (
    echo Creating MongoDB data directory on D:\mongodb_data...
    mkdir "D:\mongodb_data"
)

echo [1/3] Starting MongoDB...
start "MongoDB" /min "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "D:\mongodb_data" --port 27017
timeout /t 3 /nobreak >nul

echo [2/3] Starting Backend API (port 3001)...
start "FinTrack Backend" /min cmd /c "cd /d %~dp0backend && node src/server.js"
timeout /t 2 /nobreak >nul

echo [3/3] Starting ML Service (port 8000)...
start "FinTrack ML" /min cmd /c "D:\ml_env\Scripts\python.exe %~dp0ml-service\main.py"
timeout /t 2 /nobreak >nul

echo.
echo ============================================
echo  All services started!
echo.
echo  App:      http://localhost:5173  (run npm run dev in frontend/)
echo  Backend:  http://localhost:3001/api
echo  ML:       http://localhost:8000
echo  Admin:    Open adminlogin.html in browser
echo ============================================
echo.
pause
