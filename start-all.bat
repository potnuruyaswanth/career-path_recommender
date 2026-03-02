@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Resolve repo root based on this script location
set ROOT=%~dp0
pushd "%ROOT%"

set SKIP_BACKEND=%SKIP_BACKEND%
if "%SKIP_BACKEND%"=="" set SKIP_BACKEND=0

if not "%SKIP_BACKEND%"=="1" (
  echo [1/4] Ensuring backend deps (pip install -r backend/requirements.txt)
  cd /d "%ROOT%backend"
  python -m pip install -r requirements.txt >nul 2>&1
  if errorlevel 1 (
    echo Failed to install backend dependencies. Check Python/pip installation.
    pause
    goto :eof
  )

  echo [2/4] Starting backend (FastAPI @ http://127.0.0.1:8000)
  REM Run backend in the SAME terminal (no new windows)
  start "" /b cmd /c "cd /d %ROOT%backend && python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"
) else (
  echo [1/4] SKIP_BACKEND=1 detected; skipping backend install/start.
)

echo [3/4] Ensuring frontend deps (npm install)
cd /d "%ROOT%frontend"
call npm install >nul 2>&1

echo [4/4] Launching frontend (Vite @ http://localhost:5173)
REM Run frontend in the SAME terminal (no new windows)
start "" /b cmd /c "cd /d %ROOT%frontend && npm run dev"

REM Do not auto-open browser to avoid wrong port when occupied
echo Tip: Open your browser to http://localhost:5173/ (or the port Vite prints)

echo All set! Backend and Frontend are starting in this terminal.
if not "%SKIP_BACKEND%"=="1" (
  echo - Backend: http://127.0.0.1:8000
) else (
  echo - Backend: skipped (set SKIP_BACKEND=0 to start locally)
  echo - Tip: set VITE_API_BASE before running to point frontend at your deployed API.
)

echo.
echo ===== QUICK LINKS =====
echo Click to open:
echo - Frontend (deployed): https://career-path-navigator-sobk.vercel.app
echo - Backend API (deployed): https://career-navigator-backend-7el6.onrender.com
echo - Frontend (local): http://localhost:5173/
echo - Backend (local): http://127.0.0.1:8000
echo - API Docs (local): http://127.0.0.1:8000/docs
echo.
echo Press Ctrl+C to stop the servers, or close this window.
endlocal
popd
exit /b 0
