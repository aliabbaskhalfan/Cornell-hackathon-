# Voice Features Testing Guide

This guide helps you test the enhanced voice features including TTS, Gemini AI integration, and persona management.

## Features Implemented

### 1. **Enhanced Voice Service**
- ✅ Gemini AI integration for contextual responses
- ✅ Multiple persona support (nerdy, funny, passionate, raw)
- ✅ User context system (interests, fantasy info, preferences)
- ✅ Fallback to rule-based responses if Gemini fails

### 2. **Text-to-Speech (TTS)**
- ✅ Google Cloud TTS integration
- ✅ Different voice configurations per persona
- ✅ Audio file generation and playback

### 3. **User Settings & Context**
- ✅ Persona selection (nerdy, funny, passionate, raw)
- ✅ User interests input
- ✅ Fantasy context input
- ✅ Preferences customization

### 4. **Test Endpoints**
- ✅ `/api/voice/test` - Test TTS and Gemini features
- ✅ `/api/voice/personas` - Get available personas
- ✅ Enhanced `/api/voice/` - Process queries with context

## Setup Requirements

### Environment Variables
Create a `.env` file in the backend directory with:

```bash
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Google Cloud TTS
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# Other existing variables...
SECRET_KEY=dev-secret-key
MONGO_URI=mongodb://localhost:27017/sports_commentator
REDIS_URL=redis://localhost:6379/0
SPORTSDATA_API_KEY=your_sportsdata_key
```

### Dependencies
All required dependencies are already in `requirements.txt`:
- `google-generativeai` - For Gemini AI
- `google-cloud-texttospeech` - For TTS

## Testing Methods

### 1. **Automated Testing**

#### From Backend Directory (Recommended)
```bash
cd backend
python run_voice_tests.py
```

#### Direct Test File
```bash
cd backend
python tests/test_voice_features.py
```

#### Using pytest (if installed)
```bash
cd backend
python -m pytest tests/test_voice_features.py -v
```

This will test:
- TTS functionality with all personas
- Gemini AI integration
- Voice query processing
- Persona information retrieval

### 2. **Manual Frontend Testing**
1. Start the backend: `cd backend && python run.py`
2. Start the frontend: `cd frontend && npm run dev`
3. Open the voice Q&A component
4. Click the settings button to configure:
   - Select different personas
   - Add your interests
   - Add fantasy context
5. Test features:
   - Use voice input (microphone button)
   - Use text input (type and send)
   - Test TTS (Test TTS button)
   - Test AI (Test AI button)

### 3. **API Testing**
Test endpoints directly:

```bash
# Get available personas
curl http://localhost:5002/api/voice/personas

# Test TTS
curl -X POST http://localhost:5002/api/voice/test \
  -H "Content-Type: application/json" \
  -d '{"test_type": "tts"}'

# Test Gemini AI
curl -X POST http://localhost:5002/api/voice/test \
  -H "Content-Type: application/json" \
  -d '{
    "test_type": "gemini",
    "query": "Tell me about basketball",
    "persona": "nerdy",
    "user_context": {
      "interests": ["NBA fantasy"],
      "fantasy_info": "I have LeBron James"
    }
  }'

# Process voice query
curl -X POST http://localhost:5002/api/voice \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "What is a triple double?",
    "persona": "passionate",
    "user_context": {
      "interests": ["statistics"],
      "fantasy_info": "I track player stats"
    }
  }'
```

## Persona Characteristics

### **Nerdy**
- Analytical and data-driven
- Loves statistics and technical details
- Voice: Male, slower rate, lower pitch
- Style: Technical

### **Funny**
- Humorous and entertaining
- Witty observations and jokes
- Voice: Female, faster rate, higher pitch
- Style: Humorous

### **Passionate**
- Energetic and enthusiastic
- Gets excited about the action
- Voice: Female, faster rate, higher pitch
- Style: Energetic

### **Raw**
- Straightforward and factual
- No embellishment
- Voice: Male, normal rate, normal pitch
- Style: Factual

## User Context Examples

### **Interests**
- "NBA fantasy, Lakers, statistics"
- "analytics, data science, basketball"
- "entertainment, humor, sports"

### **Fantasy Context**
- "I have LeBron James on my fantasy team"
- "I'm tracking Anthony Davis's rebounds"
- "My fantasy league focuses on efficiency stats"

### **Preferences**
- "I want detailed technical analysis"
- "I prefer entertaining commentary"
- "Give me the facts without fluff"

## Troubleshooting

### **TTS Issues**
- Check Google Cloud credentials
- Verify `GOOGLE_APPLICATION_CREDENTIALS` path
- Ensure `static/audio/` directory exists

### **Gemini AI Issues**
- Verify `GEMINI_API_KEY` is set
- Check API quota and limits
- Fallback to rule-based responses will work

### **Audio Playback Issues**
- Check browser audio permissions
- Verify audio file URLs are accessible
- Test with different browsers

## Next Steps

1. **Test all personas** - Try each voice style
2. **Test user context** - Add your interests and fantasy info
3. **Test both input methods** - Voice and text
4. **Test AI responses** - Ask various basketball questions
5. **Test TTS quality** - Listen to different voice configurations

The system is designed to work even without Gemini AI (falls back to rule-based responses) and without Google Cloud TTS (returns text-only responses).
