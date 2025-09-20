#!/usr/bin/env python3
"""
Debug script for voice services
Test Gemini AI and TTS directly
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_gemini_direct():
    """Test Gemini AI directly"""
    print("🤖 Testing Gemini AI directly...")
    
    try:
        import google.generativeai as genai
        
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            print("❌ GEMINI_API_KEY not found")
            return False
        
        print(f"✅ API Key found: {api_key[:10]}...{api_key[-4:]}")
        
        # Configure and test
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Test query
        test_prompt = "Tell me about basketball in one sentence."
        print(f"📝 Testing query: '{test_prompt}'")
        
        response = model.generate_content(test_prompt)
        print(f"✅ Response: {response.text}")
        
        return True
        
    except Exception as e:
        print(f"❌ Gemini test failed: {e}")
        return False

def test_tts_direct():
    """Test ElevenLabs TTS directly"""
    print("\n🎤 Testing ElevenLabs TTS directly...")
    
    try:
        import requests
        
        api_key = os.getenv('ELEVENLABS_API_KEY')
        if not api_key:
            print("❌ ELEVENLABS_API_KEY not set")
            return False
        
        print(f"✅ API Key found: {api_key[:10]}...{api_key[-4:]}")
        
        # Test synthesis
        test_text = "Hello, this is a test of the ElevenLabs text to speech system."
        print(f"📝 Testing text: '{test_text}'")
        
        # ElevenLabs API endpoint
        url = "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL"  # Bella voice
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": api_key
        }
        
        data = {
            "text": test_text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75,
                "style": 0.0,
                "use_speaker_boost": True
            }
        }
        
        # Make API request
        response = requests.post(url, json=data, headers=headers)
        
        if response.status_code == 200:
            print(f"✅ Audio generated: {len(response.content)} bytes")
            
            # Save test file
            test_file = "test_elevenlabs_audio.mp3"
            with open(test_file, 'wb') as out:
                out.write(response.content)
            
            print(f"✅ Test audio saved: {test_file}")
            return True
        else:
            print(f"❌ ElevenLabs API error: {response.status_code} - {response.text}")
            return False
        
    except Exception as e:
        print(f"❌ ElevenLabs TTS test failed: {e}")
        return False

def test_voice_service():
    """Test voice service initialization"""
    print("\n🔧 Testing Voice Service...")
    
    try:
        # Add current directory to path
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        
        from services.voice_service import VoiceService
        
        print("✅ Voice service imported successfully")
        
        # Initialize service
        voice_service = VoiceService()
        print("✅ Voice service initialized")
        
        # Check Gemini model
        if voice_service.model:
            print("✅ Gemini model is available")
        else:
            print("❌ Gemini model is None")
        
        # Check TTS service
        if voice_service.tts_service:
            print("✅ TTS service is available")
        else:
            print("❌ TTS service is None")
        
        # Test persona retrieval
        personas = voice_service.get_available_personas()
        print(f"✅ Available personas: {personas}")
        
        return True
        
    except Exception as e:
        print(f"❌ Voice service test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all debug tests"""
    print("🔍 Voice Services Debug Script")
    print("=" * 40)
    
    tests = [
        test_gemini_direct(),
        test_tts_direct(),
        test_voice_service()
    ]
    
    print("\n" + "=" * 40)
    if all(tests):
        print("🎉 All debug tests passed!")
    else:
        print("⚠️  Some debug tests failed")
    
    print("\n📋 Next steps:")
    print("1. Fix any issues found above")
    print("2. Run: python run_voice_tests.py")
    print("3. Test in the frontend")

if __name__ == "__main__":
    main()
