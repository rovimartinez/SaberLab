@echo off
title SaberLab - Cockpit de Lanzamiento (Frontend + D1 Cloud)
cd /d "%~dp0"
cls

:: Iniciar el runner visual de SaberLab optimizado (gestiona puertos, backend D1 y Vite en < 2s)
node scripts/dev-runner.js

if %errorlevel% neq 0 (
  echo.
  echo  ========================================================================
  echo   [!] El servidor se detuvo con codigo de salida %errorlevel%
  echo  ========================================================================
  pause
)
