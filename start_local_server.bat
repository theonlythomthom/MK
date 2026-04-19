@echo off
where python >nul 2>nul
if errorlevel 1 (
  echo Python wurde nicht gefunden.
  echo Bitte start_local_server.py mit einer Python-Installation starten.
  pause
  exit /b 1
)
python "%~dp0start_local_server.py"
