# 🏀 AI Sports Commentator - Setup Guide

A real-time AI-powered sports commentary application with customizable personas, voice Q&A, and live game updates.

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** (for backend)
- **Node.js 18+** (for frontend)
- **MongoDB** (local or Atlas)
- **Redis** (for Celery tasks)

### API Keys Required

- **SportsDataIO API Key** - For NBA data
- **Google Gemini API Key** - For AI commentary
- **Google Cloud TTS** - For text-to-speech (optional)

### 1. Run Setup Script

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. Configure Environment

Update `backend/.env` with your API keys:

```env
# Flask Configuration
SECRET_KEY=your-secret-key-here
MONGO_URI=mongodb://localhost:27017/sports_commentator

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# SportsDataIO API
SPORTSDATA_API_KEY=your-sportsdata-api-key

# Google AI
GEMINI_API_KEY=your-gemini-api-key

# Google Cloud TTS (optional)
GOOGLE_CLOUD_PROJECT_ID=your-gcp-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

### 3. Start Development Servers

```bash
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh
```

Or start manually:

**Backend:**
```bash
cd backend
source venv/bin/activate
python run.py
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### 4. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/

## 🏗️ Architecture

### Backend (Flask + Python)

```
backend/
├── app.py                 # Main Flask application
├── config.py             # Configuration settings
├── database.py           # MongoDB connection & schemas
├── routes/               # API endpoints
│   ├── nba_routes.py     # NBA data endpoints
│   ├── commentary_routes.py # Commentary endpoints
│   └── voice_routes.py   # Voice Q&A endpoints
├── services/             # Business logic
│   ├── sportsdata_service.py # SportsDataIO integration
│   ├── game_service.py   # Game data management
│   ├── commentary_service.py # Gemini integration
│   ├── tts_service.py    # Google Cloud TTS
│   └── voice_service.py  # Voice Q&A processing
├── tasks/               # Celery background tasks
│   ├── data_ingestion_tasks.py # Data polling
│   └── commentary_tasks.py # Commentary generation
└── socket_handlers.py   # Socket.IO event handlers
```

### Frontend (Next.js + React)

```
frontend/
├── app/                 # Next.js 14 app directory
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── layout/         # Header, sidebar, navigation
│   ├── scoreboard/     # Game cards, scoreboard
│   ├── game/          # Game view, ticker, box score
│   ├── audio/         # Audio controls
│   ├── voice/         # Voice Q&A interface
│   ├── ui/            # shadcn/ui components
│   └── providers/     # React Query, Socket.IO providers
└── lib/               # Utilities, API client
```

## 🎯 Features

### MVP Features ✅

- **Live Data Ingestion** - NBA games, scores, play-by-play
- **AI Commentary** - Gemini-generated commentary with personas
- **Audio Delivery** - Google Cloud TTS for spoken commentary
- **Voice Q&A** - Speech-to-text queries with AI responses
- **Real-time Updates** - Socket.IO for live data streaming
- **Dashboard** - Clean UI with shadcn/ui components

### Commentary Personas

- **Passionate** - Energetic, enthusiastic style
- **Nerdy** - Analytical, data-driven approach
- **Raw** - Straightforward, factual reporting

### Voice Q&A Examples

- "How close is LeBron to a triple-double?"
- "What's the current score?"
- "How many points does Tatum have?"
- "What's happening in the game?"

## 🔧 Development

### Backend Development

```bash
cd backend
source venv/bin/activate

# Install new dependencies
pip install package-name
pip freeze > requirements.txt

# Run with debug mode
python run.py

# Run Celery worker (for background tasks)
celery -A celery_app worker --loglevel=info
```

### Frontend Development

```bash
cd frontend

# Install new dependencies
npm install package-name

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

### Database Management

The application uses MongoDB with the following collections:

- `users` - User preferences and profiles
- `games` - Game data and status
- `events` - Play-by-play events
- `statlines` - Player statistics
- `commentary` - Generated commentary

### API Endpoints

**NBA Data:**
- `GET /api/nba/scoreboard` - Today's games
- `GET /api/nba/game/:id/snapshot` - Game details
- `GET /api/nba/q/triple/:gameId/:playerId` - Triple-double progress

**Commentary:**
- `POST /api/commentary/emit` - Generate commentary
- `GET /api/commentary/history/:gameId` - Commentary history

**Voice Q&A:**
- `POST /api/voice` - Process voice query

## 🚀 Deployment

### Backend Deployment

**Render/Fly.io/Heroku:**
```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export MONGO_URI="mongodb+srv://..."
export GEMINI_API_KEY="..."
export SPORTSDATA_API_KEY="..."

# Run application
python run.py
```

### Frontend Deployment

**Vercel:**
```bash
# Build and deploy
npm run build
vercel --prod
```

### Environment Variables

Set these in your deployment platform:

**Backend:**
- `MONGO_URI`
- `REDIS_URL`
- `SPORTSDATA_API_KEY`
- `GEMINI_API_KEY`
- `GOOGLE_CLOUD_PROJECT_ID`
- `GOOGLE_APPLICATION_CREDENTIALS`

**Frontend:**
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SOCKET_URL`

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check `MONGO_URI` in `.env`
   - Ensure MongoDB is running locally or Atlas is accessible

2. **API Key Errors**
   - Verify all API keys are set correctly
   - Check API key permissions and quotas

3. **Socket.IO Connection Issues**
   - Ensure backend is running on port 5000
   - Check CORS settings in Flask app

4. **TTS Audio Not Playing**
   - Verify Google Cloud TTS credentials
   - Check audio file permissions in `static/audio/`

### Debug Mode

Enable debug logging:

```python
# In backend/app.py
app.config['DEBUG'] = True
```

```bash
# Frontend debug
npm run dev -- --verbose
```

## 📝 Demo Script

1. **Open Scoreboard** - Show live games
2. **Select Game** - Click on active game
3. **Live Commentary** - Generate AI commentary
4. **Switch Personas** - Try different styles
5. **Voice Q&A** - Ask "How close is LeBron to a triple-double?"
6. **Audio Playback** - Listen to generated responses

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 Hackathon Track Fit

- **Entertainment/Media** - Sports-as-entertainment with immersive commentary
- **Software** - Real-time ingestion, AI pipeline, WebSocket updates
- **Design** - Clean dashboard UI/UX with smooth voice interaction
- **Gemini API** - AI-generated live commentary and Q&A responses
- **MongoDB Atlas** - Real-time caching of sports feeds

---

**Happy coding! 🚀**
