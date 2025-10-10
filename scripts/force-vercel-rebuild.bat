@echo off
REM Force Vercel Rebuild Script
REM This script forces a clean rebuild by clearing all caches

echo ========================================
echo FORCE VERCEL REBUILD
echo ========================================
echo.

echo Step 1: Cleaning local build artifacts...
if exist .next (
    echo   - Deleting .next folder...
    rmdir /s /q .next
)
if exist node_modules\.cache (
    echo   - Deleting node_modules\.cache folder...
    rmdir /s /q node_modules\.cache
)
echo   ✓ Local cache cleared
echo.

echo Step 2: Creating cache-busting commit...
echo.
echo // Build ID: %date% %time% > .vercel-build-id
git add .vercel-build-id
git commit -m "Force rebuild: %date% %time%"
echo   ✓ Cache-busting commit created
echo.

echo Step 3: Pushing to GitHub...
git push origin main
echo   ✓ Pushed to GitHub
echo.

echo ========================================
echo NEXT STEPS:
echo ========================================
echo 1. Go to: https://vercel.com/dashboard
echo 2. Find your project deployment
echo 3. Click on the latest deployment
echo 4. If it used cache, click "Redeploy"
echo 5. UNCHECK "Use existing Build Cache"
echo 6. Click "Redeploy" button
echo.
echo This will force Vercel to rebuild from scratch!
echo ========================================

pause
