# ElevenLabs TTS Setup Guide

## 🔧 **Configuration Steps**

### **1. Get ElevenLabs API Key**

#### **Option A: Free Tier (Recommended for Testing)**
1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign up for a free account
3. Go to your profile → API Key
4. Copy your API key
5. Free tier includes 10,000 characters per month

#### **Option B: Paid Plans**
- **Starter**: $5/month - 30,000 characters
- **Creator**: $22/month - 100,000 characters
- **Pro**: $99/month - 500,000 characters

### **2. Update .env File**
Add your ElevenLabs API key to the `backend/.env` file:

```bash
# ElevenLabs TTS
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### **3. Voice Configurations**

The system uses these ElevenLabs voices for different personas:

#### **Nerdy Persona**
- **Voice**: Adam (pNInz6obpgDQGcFmaJgB)
- **Style**: Analytical, clear male voice
- **Settings**: High stability, moderate similarity boost

#### **Passionate Persona**
- **Voice**: Bella (EXAVITQu4vr4xnSDxMaL)
- **Style**: Energetic, expressive female voice
- **Settings**: Medium stability, high similarity boost

#### **Funny Persona**
- **Voice**: Josh (VR6AewLTigWG4xSOukaG)
- **Style**: Expressive, humorous male voice
- **Settings**: Low stability, high similarity boost, some style

#### **Raw Persona**
- **Voice**: Domi (AZnzlk1XvdvUeBnXmlld)
- **Style**: Clear, factual female voice
- **Settings**: High stability, low similarity boost

## 🧪 **Testing**

### **1. Configuration Check**
```bash
cd backend
python check_config.py
```

### **2. Direct TTS Test**
```bash
cd backend
python debug_voice.py
```

### **3. Full Voice Features Test**
```bash
cd backend
python run_voice_tests.py
```

## 🎯 **Voice Settings Explained**

### **Stability** (0.0 - 1.0)
- **Low (0.0-0.3)**: More expressive, varied
- **Medium (0.4-0.6)**: Balanced
- **High (0.7-1.0)**: Consistent, stable

### **Similarity Boost** (0.0 - 1.0)
- **Low (0.0-0.4)**: More creative, varied
- **Medium (0.5-0.7)**: Balanced
- **High (0.8-1.0)**: Closer to original voice

### **Style** (0.0 - 1.0)
- **0.0**: Neutral, factual
- **0.2**: Slightly expressive
- **0.5+**: Very expressive, dramatic

### **Speaker Boost**
- **True**: Enhances voice clarity
- **False**: Natural voice characteristics

## 🚨 **Troubleshooting**

### **API Key Issues**
- **Error**: "ELEVENLABS_API_KEY not set"
  - **Solution**: Add API key to `.env` file
  - **Format**: `ELEVENLABS_API_KEY=your_key_here`

- **Error**: "401 Unauthorized"
  - **Solution**: Check API key is correct
  - **Test**: Visit ElevenLabs dashboard to verify key

### **Character Limit Issues**
- **Error**: "429 Too Many Requests"
  - **Solution**: You've hit your monthly character limit
  - **Fix**: Upgrade plan or wait for next month

### **Audio File Issues**
- **Error**: "Audio file not found"
  - **Solution**: Check `static/audio/` directory exists
  - **Fix**: Create directory: `mkdir -p backend/static/audio`

## 💡 **Benefits of ElevenLabs**

### **vs Google Cloud TTS**
- ✅ **Better Voice Quality**: More natural, human-like voices
- ✅ **Easier Setup**: Just need API key, no service accounts
- ✅ **More Voice Options**: 30+ voices vs limited Google voices
- ✅ **Better Control**: Fine-tune stability, similarity, style
- ✅ **Faster**: No complex authentication flow

### **Free Tier Limits**
- **Characters**: 10,000 per month
- **Voices**: Access to all voices
- **Quality**: Same high quality as paid plans
- **Perfect for**: Testing and development

## 🔄 **Migration from Google Cloud TTS**

The system automatically falls back gracefully:

- **No ElevenLabs Key**: Returns text-only responses
- **Invalid Key**: Logs error, returns text-only
- **Rate Limited**: Logs warning, returns text-only

This ensures the core functionality works even without TTS configured.

## 📋 **Next Steps**

1. **Get ElevenLabs API Key**: Sign up at elevenlabs.io
2. **Add to .env**: `ELEVENLABS_API_KEY=your_key`
3. **Test Configuration**: `python check_config.py`
4. **Test TTS**: `python debug_voice.py`
5. **Test Full System**: `python run_voice_tests.py`

The system will now use ElevenLabs for all TTS functionality with much better voice quality!
