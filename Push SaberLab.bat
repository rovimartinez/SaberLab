@echo off
:: Cambia la codificación a UTF-8 para mostrar tildes y signos correctamente
chcp 65001 >nul
title Actualizador Plataforma Escolar
color 0b

set "REPO_PATH=C:\Users\Elizabeth\Desktop\SaberLab"

echo Accediendo al repositorio...
cd /d "%REPO_PATH%"

if not exist ".git" (
    color 0c
    echo =====================================================
    echo ERROR: No se encontró la carpeta .git en:
    echo %REPO_PATH%
    echo =====================================================
    pause
    exit
)

echo.
echo === Preparando archivos para GitHub ===
git add .

:: Ahora el signo de apertura ¿ se verá bien
set /p msg="¿Qué cambios hiciste hoy?: "

git commit -m "%msg%"
git push origin main

echo.
echo ===================================
echo   ¡Actualización completada!
echo ===================================
pause