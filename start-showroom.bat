@echo off
title DEV CYCLE - 3D Showroom Server
echo ========================================================
echo   Launching DEV CYCLE 3D Showroom on localhost:3000
echo ========================================================
start "" "http://localhost:3000"
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port 3000
pause
