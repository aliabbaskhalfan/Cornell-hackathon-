#!/usr/bin/env python3
"""
Configuration Checker for Voice Features
Run this to diagnose Gemini AI and TTS configuration issues
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_env_file():
    """Check if .env file exists and is readable"""
    print("🔍 Checking .env file...")
    
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_path):
        print("✅ .env file exists")
        return True
    else:
        print("❌ .env file not found")
        print("   Create a .env file in the backend directory")
        return False

def check_gemini_config():
    """Check Gemini AI configuration"""
    print("\n🤖 Checking Gemini AI configuration...")
    
    api_key = os.getenv('GEMINI_API_KEY')
    if api_key:
        print("✅ GEMINI_API_KEY is set")
        print(f"   Key: {api_key[:10]}...{api_key[-4:] if len(api_key) > 14 else '***'}")
        
        # Test import
        try:
            import google.generativeai as genai
            print("✅ google-generativeai package is installed")
            
            # Test API key
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-pro')
            print("✅ Gemini AI configuration looks good")
            return True
        except ImportError:
            print("❌ google-generativeai package not installed")
            print("   Run: pip install google-generativeai")
            return False
        except Exception as e:
            print(f"❌ Gemini AI test failed: {e}")
            return False
    else:
        print("❌ GEMINI_API_KEY not set")
        print("   Add GEMINI_API_KEY=your_key_here to .env file")
        return False

def check_tts_config():
    """Check ElevenLabs TTS configuration"""
    print("\n🎤 Checking ElevenLabs TTS configuration...")
    
    api_key = os.getenv('ELEVENLABS_API_KEY')
    
    if api_key:
        print("✅ ELEVENLABS_API_KEY is set")
        print(f"   Key: {api_key[:10]}...{api_key[-4:] if len(api_key) > 14 else '***'}")
    else:
        print("❌ ELEVENLABS_API_KEY not set")
        print("   Add ELEVENLABS_API_KEY=your_api_key to .env file")
        return False
    
    # Test import
    try:
        import requests
        print("✅ requests package is installed")
        
        # Test API key with a simple request
        if api_key:
            headers = {"xi-api-key": api_key}
            response = requests.get("https://api.elevenlabs.io/v1/voices", headers=headers)
            if response.status_code == 200:
                print("✅ ElevenLabs API key is valid")
                return True
            else:
                print(f"❌ ElevenLabs API key test failed: {response.status_code}")
                return False
        else:
            print("⚠️  ElevenLabs configuration incomplete")
            return False
    except ImportError:
        print("❌ requests package not installed")
        print("   Run: pip install requests")
        return False
    except Exception as e:
        print(f"❌ ElevenLabs test failed: {e}")
        return False

def check_audio_directory():
    """Check audio directory exists"""
    print("\n📁 Checking audio directory...")
    
    audio_dir = os.path.join(os.path.dirname(__file__), 'static', 'audio')
    if os.path.exists(audio_dir):
        print("✅ Audio directory exists")
        return True
    else:
        print("❌ Audio directory not found")
        print(f"   Expected: {os.path.abspath(audio_dir)}")
        print("   Creating directory...")
        try:
            os.makedirs(audio_dir, exist_ok=True)
            print("✅ Audio directory created")
            return True
        except Exception as e:
            print(f"❌ Failed to create audio directory: {e}")
            return False

def check_dependencies():
    """Check required Python packages"""
    print("\n📦 Checking Python dependencies...")
    
    required_packages = [
        'google.generativeai',
        'google.cloud.texttospeech',
        'requests',
        'python-dotenv'
    ]
    
    all_good = True
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} not installed")
            all_good = False
    
    return all_good

def main():
    """Run all configuration checks"""
    print("🔧 Voice Features Configuration Checker")
    print("=" * 50)
    
    checks = [
        check_env_file(),
        check_dependencies(),
        check_gemini_config(),
        check_tts_config(),
        check_audio_directory()
    ]
    
    print("\n" + "=" * 50)
    if all(checks):
        print("🎉 All configuration checks passed!")
        print("   You can now run: python run_voice_tests.py")
    else:
        print("⚠️  Some configuration issues found")
        print("   See the setup guide: GEMINI_TTS_SETUP.md")
    
    print("\n📋 Next Steps:")
    print("1. Fix any configuration issues above")
    print("2. Run: python run_voice_tests.py")
    print("3. Test manually in the frontend")

if __name__ == "__main__":
    main()
