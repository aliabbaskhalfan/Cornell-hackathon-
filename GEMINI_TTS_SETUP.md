# Gemini AI & Google Cloud TTS Setup Guide

## 🔧 **Configuration Steps**

### **1. Create .env File**
Create a `.env` file in the `backend/` directory with the following content:

```bash
# Basic Configuration
SECRET_KEY=dev-secret-key
MONGO_URI=mongodb://localhost:27017/sports_commentator
REDIS_URL=redis://localhost:6379/0

# SportsDataIO API
SPORTSDATA_API_KEY=your_sportsdata_api_key_here

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Google Cloud TTS
GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id
GOOGLE_APPLICATION_CREDENTIALS=./sportcommentator-bad015085463.json
```

### **2. Get Gemini AI API Key**

#### **Option A: Google AI Studio (Free)**
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" → "Create API Key"
4. Copy the API key
5. Add it to your `.env` file as `GEMINI_API_KEY=your_key_here`

#### **Option B: Google Cloud Console**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the "Generative Language API"
4. Go to "APIs & Services" → "Credentials"
5. Create an API key
6. Add it to your `.env` file

### **3. Configure Google Cloud TTS**

#### **Step 1: Get Project ID**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Copy the Project ID from the project selector
4. Add it to your `.env` file as `GOOGLE_CLOUD_PROJECT_ID=your_project_id`

#### **Step 2: Enable Text-to-Speech API**
1. In Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Cloud Text-to-Speech API"
3. Click "Enable"

#### **Step 3: Create Service Account**
1. Go to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Name: `sport-commentator-tts`
4. Description: `Service account for TTS functionality`
5. Click "Create and Continue"

#### **Step 4: Grant Permissions**
1. Add these roles:
   - `Cloud Text-to-Speech API User`
   - `Storage Object Viewer` (for audio file access)
2. Click "Continue" → "Done"

#### **Step 5: Create Service Account Key**
1. Click on your service account
2. Go to "Keys" tab
3. Click "Add Key" → "Create New Key"
4. Choose "JSON" format
5. Download the key file
6. Replace `sportcommentator-bad015085463.json` with your new key file
7. Update `.env`: `GOOGLE_APPLICATION_CREDENTIALS=./your_new_key_file.json`

### **4. Test Configuration**

Run the test script to verify everything works:

```bash
cd backend
python run_voice_tests.py
```

## 🚨 **Troubleshooting**

### **Gemini AI Issues**
- **Error**: "Gemini API key not configured"
  - **Solution**: Check `GEMINI_API_KEY` in `.env` file
  - **Test**: Visit [Google AI Studio](https://aistudio.google.com/) to verify key works

- **Error**: "API quota exceeded"
  - **Solution**: Wait for quota reset or upgrade plan
  - **Fallback**: System will use rule-based responses

### **TTS Issues**
- **Error**: "Google Cloud credentials not found"
  - **Solution**: Check `GOOGLE_APPLICATION_CREDENTIALS` path in `.env`
  - **Verify**: File exists and is readable

- **Error**: "Project not found"
  - **Solution**: Verify `GOOGLE_CLOUD_PROJECT_ID` is correct
  - **Check**: Project ID in Google Cloud Console

- **Error**: "Text-to-Speech API not enabled"
  - **Solution**: Enable the API in Google Cloud Console
  - **Steps**: APIs & Services → Library → Cloud Text-to-Speech API → Enable

### **Audio File Issues**
- **Error**: "Audio file not found"
  - **Solution**: Check `static/audio/` directory exists
  - **Fix**: Create directory: `mkdir -p backend/static/audio`

## 🎯 **Quick Test Commands**

### **Test Gemini Only**
```bash
curl -X POST http://localhost:5002/api/voice/test \
  -H "Content-Type: application/json" \
  -d '{
    "test_type": "gemini",
    "query": "Tell me about basketball",
    "persona": "nerdy"
  }'
```

### **Test TTS Only**
```bash
curl -X POST http://localhost:5002/api/voice/test \
  -H "Content-Type: application/json" \
  -d '{"test_type": "tts"}'
```

### **Test Both Together**
```bash
curl -X POST http://localhost:5002/api/voice \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "What is a triple double?",
    "persona": "passionate"
  }'
```

## 💡 **Free Tier Limits**

### **Gemini AI**
- Free tier: 15 requests per minute
- Free tier: 1 million tokens per day
- Perfect for testing and development

### **Google Cloud TTS**
- Free tier: 1 million characters per month
- Free tier: 4 million characters per month for WaveNet voices
- More than enough for testing

## 🔄 **Fallback Behavior**

The system is designed to work even without these services:

- **No Gemini**: Falls back to rule-based responses
- **No TTS**: Returns text-only responses
- **No Audio**: Still provides text responses

This ensures the core functionality works while you set up the external services.
