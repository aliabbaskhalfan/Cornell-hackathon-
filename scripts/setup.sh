#!/bin/bash

# Sports Commentator Setup Script
echo "🏀 Setting up Courtside..."

# Check if Python 3.10+ is installed
python_version=$(python3 --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1,2)
required_version="3.10"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Python 3.10+ is required. Current version: $python_version"
    echo ""
    echo "💡 Solutions:"
    echo "1. Install Python 3.10+ using Homebrew: brew install python@3.11"
    echo "2. Use pyenv to manage Python versions: pyenv install 3.11.0"
    echo "3. Continue anyway (may have compatibility issues): Press Enter"
    echo ""
    read -p "Press Enter to continue anyway, or Ctrl+C to exit..."
else
    echo "✅ Python $python_version detected"
fi

# Setup backend
echo "📦 Setting up backend..."
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create necessary directories
mkdir -p static/audio
mkdir -p logs

echo "✅ Backend setup complete"

# Setup frontend
echo "📦 Setting up frontend..."
cd ../frontend

# Install dependencies
npm install

echo "✅ Frontend setup complete"

# Create environment files
echo "📝 Creating environment files..."
cd ..

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "📝 Created backend/.env - Please update with your API keys"
fi

if [ ! -f frontend/.env.local ]; then
    cp frontend/.env.example frontend/.env.local
    echo "📝 Created frontend/.env.local"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your API keys:"
echo "   - SPORTSDATA_API_KEY"
echo "   - GEMINI_API_KEY"
echo "   - GOOGLE_CLOUD_PROJECT_ID"
echo "   - MONGO_URI"
echo ""
echo "2. Start the backend:"
echo "   cd backend && source venv/bin/activate && python run.py"
echo ""
echo "3. Start the frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "Happy coding! 🚀"
