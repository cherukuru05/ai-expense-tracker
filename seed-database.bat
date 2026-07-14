@echo off
echo ============================================
echo  FinTrack AI - Seed Demo Data
echo ============================================
echo.
echo This will create a demo user and sample data.
echo.
cd /d "%~dp0backend"
node src/seed.js
echo.
pause
