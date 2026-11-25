#!/bin/bash
echo "========================================"
echo "TechStore - Stripe E-commerce"
echo "========================================"
echo

if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    echo "Please copy .env.example to .env and add your Stripe keys"
    echo "  cp .env.example .env"
    exit 1
fi

if [ ! -d node_modules ]; then
    echo "Installing dependencies..."
    npm install
    echo
fi

echo "Starting server..."
echo
echo "Open http://localhost:3000 in your browser"
echo "Press Ctrl+C to stop"
echo

npm run dev