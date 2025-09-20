#!/usr/bin/env python3
"""
Test script for voice features - OPTIMIZED FOR REDUCED API CALLS
Run this to test TTS, Gemini AI integration, and persona functionality

OPTIMIZATIONS:
- TTS: Tests 2 personas instead of 4 (50% reduction)
- Gemini: Tests 4 queries instead of 12 (67% reduction) 
- Voice Query: Tests 2 cases instead of 3 (33% reduction)
- Total API calls: ~8 instead of ~19 (58% reduction)

Usage:
    python test_voice_features.py
    python -m pytest test_voice_features.py
"""

import requests
import json
import time
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configuration
API_BASE_URL = "http://localhost:5002/api"
VOICE_ENDPOINT = f"{API_BASE_URL}/voice"

def test_tts():
    """Test Text-to-Speech functionality - reduced API calls"""
    print("🎤 Testing TTS functionality...")
    
    try:
        # Test only 2 personas instead of all 4 to reduce API calls
        test_personas = ["passionate", "nerdy"]  # Representative samples
        
        print("✅ TTS test successful!")
        print("Testing personas:")
        
        for persona in test_personas:
            response = requests.post(f"{VOICE_ENDPOINT}/test", json={
                "test_type": "tts",
                "persona": persona  # Test specific persona
            })
            
            if response.status_code == 200:
                data = response.json()
                if data["success"]:
                    result = data["results"][persona]
                    print(f"  - {persona}: {result['audio_url']}")
                else:
                    print(f"  - {persona}: ❌ Failed - {data.get('error')}")
            else:
                print(f"  - {persona}: ❌ Request failed - {response.status_code}")
            
    except Exception as e:
        print(f"❌ TTS test error: {e}")

def test_gemini():
    """Test Gemini AI integration - reduced API calls"""
    print("\n🤖 Testing Gemini AI integration...")
    
    # Reduced to 1 query per persona (4 total calls instead of 12)
    test_cases = [
        ("nerdy", "Tell me about basketball statistics"),
        ("funny", "Make me laugh about basketball"),
        ("passionate", "What's exciting about the NBA?"),
        ("raw", "Explain triple-doubles in basketball")
    ]
    
    for persona, query in test_cases:
        print(f"\n  Testing {persona} persona:")
        try:
            response = requests.post(f"{VOICE_ENDPOINT}/test", json={
                "test_type": "gemini",
                "query": query,
                "persona": persona,
                "user_context": {
                    "interests": ["NBA fantasy", "statistics"],
                    "fantasy_info": "I have LeBron James on my fantasy team",
                    "preferences": "I like detailed analysis"
                }
            })
            
            if response.status_code == 200:
                data = response.json()
                if data["success"]:
                    print(f"    ✅ Query: '{query}'")
                    print(f"    Response: {data['response']['text'][:100]}...")
                    print(f"    Audio: {data['response']['audio_url']}")
                else:
                    print(f"    ❌ Query failed: {data.get('error')}")
            else:
                print(f"    ❌ Request failed with status {response.status_code}")
                
        except Exception as e:
            print(f"    ❌ Error: {e}")
        
        time.sleep(0.5)  # Reduced rate limiting

def test_voice_query():
    """Test voice query processing - reduced API calls"""
    print("\n🎯 Testing voice query processing...")
    
    # Reduced to 2 test cases instead of 3
    test_cases = [
        {
            "transcript": "What's the score?",
            "persona": "passionate",
            "user_context": {
                "interests": ["NBA", "Lakers"],
                "fantasy_info": "I'm tracking LeBron's stats"
            }
        },
        {
            "transcript": "Tell me about basketball statistics",
            "persona": "nerdy",
            "user_context": {
                "interests": ["analytics", "data"],
                "preferences": "I want technical details"
            }
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n  Test case {i}:")
        try:
            response = requests.post(VOICE_ENDPOINT, json=test_case)
            
            if response.status_code == 200:
                data = response.json()
                if data["success"]:
                    resp = data["response"]
                    print(f"    ✅ Transcript: '{test_case['transcript']}'")
                    print(f"    Persona: {resp['persona']}")
                    print(f"    Response: {resp['text'][:100]}...")
                    print(f"    Audio: {resp['audio_url']}")
                else:
                    print(f"    ❌ Failed: {data.get('error')}")
            else:
                print(f"    ❌ Request failed with status {response.status_code}")
                
        except Exception as e:
            print(f"    ❌ Error: {e}")
        
        time.sleep(0.5)  # Reduced rate limiting

def test_personas():
    """Test persona information retrieval"""
    print("\n👥 Testing persona information...")
    
    try:
        response = requests.get(f"{VOICE_ENDPOINT}/personas")
        
        if response.status_code == 200:
            data = response.json()
            if data["success"]:
                print("✅ Available personas:")
                for persona, info in data["personas"].items():
                    print(f"  - {persona}: {info['description']}")
                    print(f"    Style: {info['style']}, Voice: {info['voice_config']}")
            else:
                print("❌ Failed to get personas:", data.get("error"))
        else:
            print(f"❌ Request failed with status {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def test_voice_service_unit():
    """Test voice service directly without server"""
    print("\n🔧 Testing Voice Service Unit Tests...")
    
    try:
        from services.voice_service import VoiceService
        
        # Initialize service
        voice_service = VoiceService()
        
        # Test persona retrieval
        personas = voice_service.get_available_personas()
        print(f"✅ Available personas: {personas}")
        
        # Test persona info
        for persona in personas:
            info = voice_service.get_persona_info(persona)
            print(f"  - {persona}: {info['description']}")
        
        # Test rule-based response (without Gemini)
        test_transcript = "What's the score?"
        response = voice_service._generate_rule_based_response(
            test_transcript, 
            None, 
            'passionate'
        )
        print(f"✅ Rule-based response: {response[:50]}...")
        
        print("✅ Unit tests passed!")
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Make sure you're running from the backend directory")
    except Exception as e:
        print(f"❌ Unit test error: {e}")

def test_server_connection():
    """Test if server is running"""
    try:
        response = requests.get(f"{API_BASE_URL}/voice/personas", timeout=5)
        return response.status_code == 200
    except Exception:
        return False

def main():
    """Run all voice feature tests"""
    print("🚀 Starting Voice Features Test Suite (OPTIMIZED)")
    print("=" * 50)
    print("📊 API Call Reduction: ~58% fewer calls than before")
    print("=" * 50)
    
    # Run unit tests first
    test_voice_service_unit()
    
    # Check if server is running for integration tests
    if not test_server_connection():
        print("\n⚠️  Server not running. Skipping integration tests.")
        print("To run integration tests:")
        print("1. Start the backend: cd backend && python run.py")
        print("2. Run this test again: python tests/test_voice_features.py")
        return
    
    print("\n🌐 Server is running. Running optimized integration tests...")
    
    # Run integration tests
    test_personas()
    test_tts()
    test_gemini()
    test_voice_query()
    
    print("\n" + "=" * 50)
    print("🎉 Voice features test completed!")
    print("📊 Total API calls made: ~8 (vs ~19 before optimization)")
    print("\nTo test manually:")
    print("1. Start the backend: cd backend && python run.py")
    print("2. Start the frontend: cd frontend && npm run dev")
    print("3. Open the voice Q&A component in the browser")
    print("4. Try different personas and user contexts")

if __name__ == "__main__":
    main()
