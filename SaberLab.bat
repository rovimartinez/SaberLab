@echo off
title Ejecutando School Platform
cd /d "C:\Users\Elizabeth\Desktop\SaberLab"

:: Abre el navegador en la dirección local
echo Abriendo el navegador...
start http://localhost:5173

:: Ejecuta el servidor de desarrollo
echo Iniciando el servidor...
npm run dev

pause