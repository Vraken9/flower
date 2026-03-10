@echo off
echo ========================================
echo   Flower Marketplace - Self-Hosted
echo   (Docker Compose)
echo ========================================
echo.
echo Menjalankan PostgreSQL + Backend + Frontend + Nginx...
echo.
cd /d "%~dp0"
docker-compose up --build
pause
