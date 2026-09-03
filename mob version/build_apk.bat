@echo off
echo =======================================================
echo   Building SIMDEX Pro Android APK (VS Code Runner)
echo =======================================================
echo.

cd /d "%~dp0"

echo [1/3] Syncing latest web assets into Android app...
if not exist "app\src\main\assets\www" mkdir "app\src\main\assets\www"
copy /Y "..\index.html" "app\src\main\assets\www\index.html" >nul
copy /Y "..\style.css" "app\src\main\assets\www\style.css" >nul
copy /Y "..\app.js" "app\src\main\assets\www\app.js" >nul
copy /Y "..\app_logo.png" "app\src\main\assets\www\app_logo.png" >nul
copy /Y "..\resources.md" "app\src\main\assets\www\resources.md" >nul
echo    Assets synced successfully!

echo.
echo [2/3] Building APK with Gradle...
call gradlew.bat assembleDebug

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Build failed. If Android SDK or Java JDK 17+ is not in your PATH,
    echo     check the instructions in mob version/README.md
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Build Complete!
echo.
echo =======================================================
echo  SUCCESS! Your APK is ready:
echo  mob version\app\build\outputs\apk\debug\app-debug.apk
echo =======================================================

if exist "app\build\outputs\apk\debug" (
    explorer "app\build\outputs\apk\debug"
)

pause
