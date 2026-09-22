@echo off
title SaberLab - Cockpit de Lanzamiento (Frontend + D1 Cloud)
cd /d "%~dp0"
cls

:: 1. Liberar puertos 5173 y 8788 si quedaron colgados de una sesion previa
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Process -Id (Get-NetTCPConnection -LocalPort 5173,8788 -State Listen -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force" >nul 2>&1

:: 2. Iniciar el runner visual de SaberLab (Compilador D1 + Vite + Apertura Inteligente)
node scripts/dev-runner.js

if %errorlevel% neq 0 (
  echo.
  echo  ========================================================================
  echo   [!] El servidor se detuvo con codigo de salida %errorlevel%
  echo  ========================================================================
  pause
)
