@echo off
REM Medico.AI — Windows startup script
REM Double-click this file to run the project

cd /d "%~dp0"

echo.
echo ============================================================
echo   Medico.AI — Smart Medicine Cost Optimizer
echo ============================================================
echo.

python run_project.py

pause
