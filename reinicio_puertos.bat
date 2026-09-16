@echo off
title Liberar y Reiniciar Puertos - SaberLab
chcp 65001 >nul
cd /d "%~dp0"

echo =======================================================
echo   SABERLAB - LIMPIADOR Y REINICIADOR DE PUERTOS
echo =======================================================
echo.
echo [1/3] Deteniendo procesos en puertos 5173 y 8788...

for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":5173 :8788" ^| findstr "LISTENING"') do (
  echo   - Cerrando PID en puerto: %%P
  taskkill /PID %%P /F >nul 2>nul
)

echo.
echo [2/3] Finalizando procesos residuales de Node y Wrangler...
taskkill /F /IM node.exe >nul 2>nul
taskkill /F /IM wrangler.exe >nul 2>nul

echo Esperando liberacion de sockets...
timeout /t 2 /nobreak >nul

echo.
echo [3/3] Verificando estado de puertos...
netstat -ano | findstr ":5173 :8788" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
  echo [!] AVISO: Algunos sockets aun estan en espera o bloqueados.
) else (
  echo [OK] Puertos 5173 y 8788 completamente libres.
)

echo.
echo =======================================================
echo   ¿Deseas iniciar SaberLab ahora mismo?
echo =======================================================
echo Presiona [S] para Iniciar SaberLab
echo Presiona cualquier otra tecla para salir
choice /c SN /n /m "Opcion (S/N): "

if errorlevel 2 goto fin
if errorlevel 1 goto iniciar

:iniciar
echo.
echo Iniciando SaberLab...
call "%~dp0SaberLab.bat"
goto fin

:fin
echo.
echo Listo. Puedes cerrar esta ventana.
pause
