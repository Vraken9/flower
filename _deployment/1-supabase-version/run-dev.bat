@echo off
echo ========================================
echo   Flower Marketplace - Supabase Version
echo ========================================
echo.
echo Menjalankan frontend (Next.js + Supabase)...
echo Buka http://localhost:3000 setelah siap
echo.
cd /d "%~dp0..\web"
npm run dev
pause
