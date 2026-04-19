@echo off
setlocal
cd /d "%~dp0"

if not exist node_modules (
  echo node_modules fehlt. Fuehre npm install aus...
  call npm install
  if errorlevel 1 goto :fail
)

echo Starte Vite-Dev-Server...
call npm run dev:open
if errorlevel 1 goto :fail
goto :eof

:fail
echo.
echo Dev-Start fehlgeschlagen.
pause
exit /b 1
