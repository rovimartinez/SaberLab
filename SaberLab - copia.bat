@echo off
title SaberLab - Servidor Unificado (Frontend + D1 Cloud)
cd /d "%~dp0"

echo =========================================================
echo       Iniciando SaberLab (Frontend + D1 Cloud Direct)
echo =========================================================
echo.

:: 1. Liberar puertos 5173 y 8788 si quedaron ocupados de una sesion previa
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Process -Id (Get-NetTCPConnection -LocalPort 5173,8788 -State Listen -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force" >nul 2>&1


:: 2. Lanzar la apertura automatica del navegador en segundo plano (espera 5s)
start "" /b cmd /c "ping 127.0.0.1 -n 6 >nul & start http://localhost:5173"

:: 3. Ejecutar servidor unificado en esta misma ventana
echo Compilando funciones y conectando con Cloudflare D1...
echo.
echo Presiona Ctrl+C en esta ventana para detener SaberLab cuando termines.
echo.
call npm.cmd run dev

if %errorlevel% neq 0 (
  echo.
  echo =========================================================
  echo [!] El servidor se detuvo con codigo de salida %errorlevel%
  echo =========================================================
  pause
)
