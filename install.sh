#!/bin/bash

echo "🚀 Installing Stonks App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "⚠️  Please update .env file with your API keys before running the app"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs
mkdir -p uploads

# Set up Tailwind CSS
echo "🎨 Setting up Tailwind CSS..."
cd client
npx tailwindcss init -p
cd ..

echo "✅ Installation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env file with your API keys"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "🔑 Required API Keys:"
echo "- ALPHA_VANTAGE_API_KEY (get from https://www.alphavantage.co/)"
echo "- YAHOO_FINANCE_API_KEY (optional, for additional data)"
echo "- NEWS_API_KEY (optional, for market news)"
echo ""
echo "🎉 Happy trading!" 