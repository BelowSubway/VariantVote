@echo off
setlocal

cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Please install Node.js and run this file again.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo Installation failed.
    pause
    exit /b 1
  )
)

echo Starting Variant Vote...
set "APP_URL=http://127.0.0.1:5173/"
echo Browser URL: %APP_URL%
echo Opening browser when frontend and backend are ready...
start "" powershell -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -Command "$url='%APP_URL%'; function Test-Port($port) { try { $client=[Net.Sockets.TcpClient]::new(); $connect=$client.BeginConnect('127.0.0.1',$port,$null,$null); if (-not $connect.AsyncWaitHandle.WaitOne(500)) { $client.Close(); return $false }; $client.EndConnect($connect); $client.Close(); return $true } catch { return $false } }; for ($i=0; $i -lt 120; $i++) { if ((Test-Port 5173) -and (Test-Port 3001)) { Start-Process $url; exit 0 }; Start-Sleep -Milliseconds 500 }; exit 1"
call npm run dev

endlocal
