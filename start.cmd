
@echo off
echo Starting Kharidify setup and services...

REM Install dependencies and setup database
call npm install
mkdir public\uploads 2>nul

REM Setup environment variables if .env doesn't exist
if not exist .env (
  echo DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kharidify > .env
  echo STRIPE_SECRET_KEY=your_stripe_secret_key >> .env
  echo VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key >> .env
)

REM Initialize database using drizzle-kit
call npx drizzle-kit push

REM Start the website and admin panel
start cmd /k "echo Starting website and admin panel... && npm run dev"

REM Wait 5 seconds then open in browser
timeout /t 5
start http://localhost:5000/admin

echo Setup complete! Please update the .env file with your actual credentials.
