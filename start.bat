@echo off
echo ========================================
echo TechStore - Stripe E-commerce
echo ========================================
echo.

if not exist .env (
    echo ERROR: .env file not found!
    echo Please copy .env.example to .env and add your Stripe keys
    echo.
    pause
    exit /b 1
)

if not exist node_modules (
    echo Installing dependencies...
    npm install
    echo.
)

echo Starting server...
echo.
echo Open http://localhost:3000 in your browser
echo Press Ctrl+C to stop
echo.

npm run dev

pause