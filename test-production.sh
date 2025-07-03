#!/bin/bash

# Function to display messages
echo_message() {
  echo "============================================="
  echo "$1"
  echo "============================================="
}

# Function to check if a command succeeded
check_status() {
  if [ $? -ne 0 ]; then
    echo_message "❌ ERROR: $1 failed"
    exit 1
  else
    echo_message "✅ $1 completed successfully"
  fi
}

# Check if environment files exist
if [ ! -f "./server/.env.production" ]; then
  echo_message "❌ ERROR: server/.env.production file not found"
  exit 1
fi

if [ ! -f "./client/.env.production" ]; then
  echo_message "❌ ERROR: client/.env.production file not found"
  exit 1
fi

# Install dependencies
echo_message "Installing dependencies"
npm run install-all
check_status "Dependencies installation"

# Build the client
echo_message "Building client for production"
cd client
npm run build
check_status "Client build"

# Start the server in production mode
echo_message "Starting server in production mode"
cd ../server
NODE_ENV=production node server.js

# Note: Server will keep running, so the script won't proceed past this point
# To test fully, open another terminal and try accessing the API endpoints
