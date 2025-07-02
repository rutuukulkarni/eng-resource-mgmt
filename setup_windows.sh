@echo off
REM Windows setup script for Engineering Resource Management System

REM 1. Check for Node.js and npm
where node >nul 2>nul || (
  echo Node.js is not installed. Please install Node.js (https://nodejs.org/) and rerun this script.
  exit /b 1
)
where npm >nul 2>nul || (
  echo npm is not installed. Please install Node.js (https://nodejs.org/) and rerun this script.
  exit /b 1
)

REM 2. Check for MongoDB
where mongod >nul 2>nul || (
  echo MongoDB is not installed. Please install MongoDB Community Edition (https://www.mongodb.com/try/download/community) and ensure mongod is in your PATH.
  exit /b 1
)

REM 3. Install backend dependencies
cd server
if exist node_modules (
  echo Backend dependencies already installed.
) else (
  echo Installing backend dependencies...
  npm install
)

REM 4. Install frontend dependencies
cd ../client
if exist node_modules (
  echo Frontend dependencies already installed.
) else (
  echo Installing frontend dependencies...
  npm install
)

REM 5. Seed the database
cd ../server
if exist .env (
  echo Using existing .env file.
) else (
  echo MONGODB_URI=mongodb://localhost:27017/eng-res-mgmt > .env
  echo JWT_SECRET=supersecretkey >> .env
  echo JWT_EXPIRE=7d >> .env
)

REM 6. Start MongoDB (if not already running)
start mongod --dbpath %cd%\..\data

REM 7. Seed database
node seedData.js

REM 8. Start backend server
start cmd /k "cd /d %cd% && node server.js"

REM 9. Start frontend server
cd ../client
start cmd /k "cd /d %cd% && npm run dev"

echo Setup complete. Backend running on http://localhost:5001, Frontend on http://localhost:5173
pause
