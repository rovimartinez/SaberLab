@echo off
title Ejecutando SaberLab
cd /d "%~dp0"

set "PORT_BUSY="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":5173 :8788" ^| findstr "LISTENING"') do (
  set "PORT_BUSY=1"
)

if defined PORT_BUSY (
  echo Cerrando servidores anteriores en los puertos 5173 o 8788...

  for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":5173 :8788" ^| findstr "LISTENING"') do (
    taskkill /PID %%P /F >nul 2>nul
  )
)

echo Iniciando SaberLab...
start "Vite - Frontend" cmd /k "npm.cmd run dev:frontend"
start "Wrangler - Functions" cmd /k "npx wrangler pages dev public --port 8788"

echo Esperando a que Vite y Wrangler esten listos...
timeout /t 15 /nobreak >nul

echo Abriendo el navegador...
start "" http://localhost:5173
