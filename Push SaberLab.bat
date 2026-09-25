@echo off
chcp 65001 >nul
title SaberLab — Cockpit de Despliegue GitHub
cd /d "C:\Users\Elizabeth\Desktop\SaberLab"

:: Lanzar el cockpit visual de push directamente
node scripts/push-runner.js

if %errorlevel% neq 0 (
  echo.
  echo  ========================================================================
  echo   [!] El proceso de despliegue se detuvo con codigo %errorlevel%
  echo  ========================================================================
  pause
)