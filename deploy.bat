@echo off
echo ========================================
echo   DEPLOYING TO VERCEL - READY TO GO!
echo ========================================
echo.

echo [1/4] Checking build...
cd frontend
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed! Fix errors before deploying.
    pause
    exit /b 1
)
echo Build successful!
echo.

cd ..

echo [2/4] Adding changes to Git...
git add .
echo.

echo [3/4] Committing changes...
git commit -m "Fix: Action buttons animations (4 images) & deployment config - Build errors resolved: CSS import order, terser dependency, Vercel routing for SPA"
echo.

echo [4/4] Pushing to GitHub (triggers Vercel deployment)...
git push origin main
echo.

echo ========================================
echo   DEPLOYMENT INITIATED!
echo ========================================
echo.
echo Vercel will now build and deploy your app.
echo.
echo Monitor deployment at:
echo https://vercel.com/dashboard
echo.
echo Your site will be live at:
echo https://career-path-navigator-sobk.vercel.app
echo.
echo Wait 2-3 minutes then test the site.
echo.
pause
