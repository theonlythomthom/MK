@echo off
setlocal
cd /d "%~dp0"

if not exist dist\index.html (
  echo Kein dist-Build gefunden. Es wird jetzt ein Build erzeugt.
  if not exist node_modules (
    echo node_modules fehlt. Fuehre npm install aus...
    call npm install
    if errorlevel 1 goto :fail
  )
  call npm run build
  if errorlevel 1 goto :fail
)

echo Starte Mario Kart World Cup...
call npm start
if errorlevel 1 goto :fail
goto :eof

:fail
echo.
echo Start fehlgeschlagen.
pause
exit /b 1
