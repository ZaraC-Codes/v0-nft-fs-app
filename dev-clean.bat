@echo off
echo Cleaning Next.js cache and starting fresh...

REM Kill any running Node processes
taskkill /F /IM node.exe 2>nul

REM Wait a moment for processes to close
timeout /t 2 /nobreak >nul

REM Remove .next directory if it exists
if exist .next (
    echo Removing .next directory...
    rmdir /s /q .next
)

REM Remove node_modules/.cache if it exists
if exist node_modules\.cache (
    echo Removing node_modules\.cache directory...
    rmdir /s /q node_modules\.cache
)

REM Set Node options to increase memory
set NODE_OPTIONS=--max-old-space-size=4096

echo Starting development server with increased memory...
pnpm run dev
