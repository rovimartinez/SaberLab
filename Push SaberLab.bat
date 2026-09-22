@echo off
chcp 65001 >nul
title SaberLab — Cockpit de Despliegue GitHub
cd /d "C:\Users\Elizabeth\Desktop\SaberLab"

:: Liberar puertos por si el servidor dev estaba corriendo
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Process -Id (Get-NetTCPConnection -LocalPort 5173,8788 -State Listen -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force" >nul 2>&1

:: Lanzar el cockpit visual de push
node scripts/push-runner.js

if %errorlevel% neq 0 (
  echo.
  echo  ========================================================================
  echo   [!] El proceso de despliegue se detuvo con codigo %errorlevel%
  echo  ========================================================================
  pause
)