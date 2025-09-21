#!/usr/bin/env python3
"""
Quick test script to generate MP3 with default commentator voice
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.tts_service import TTSService
from config import Config

def test_commentator_voice():
    """Generate test audio with default commentator voice"""
    
    # Check if API key is configured
    if not Config.ELEVENLABS_API_KEY:
        print("❌ ElevenLabs API key not configured!")
        print("Please set ELEVENLABS_API_KEY in your .env file")
        return
    
    print("🎙️  Generating test audio with default commentator voice...")
    
    # Text to speak
    text = ("Based on the play-by-play, the Lakers have secured one rebound at the 2:50 mark "
            "of the first quarter. This is a low rebounding total thus far, a trend we'll want "
            "to monitor for its potential impact on their overall game performance.")
    
    # Initialize TTS service
    tts = TTSService()
    
    # Generate audio using default 'passionate' persona (default commentator)
    audio_path = tts.generate_audio(text, persona='passionate')
    
    if audio_path:
        print(f"✅ Audio generated successfully!")
        print(f"📁 File saved at: {audio_path}")
        print(f"🔗 Full path: {os.path.join(os.getcwd(), audio_path.lstrip('/'))}")
    else:
        print("❌ Failed to generate audio")
        print("This is likely due to API quota limits or configuration issues.")
        print("\n📋 Test configuration:")
        print(f"   Voice ID: {tts.voice_configs['passionate']['voice_id']}")
        print(f"   Persona: passionate (default commentator)")
        print(f"   Text length: {len(text)} characters")
        print(f"   Voice settings: {tts.voice_configs['passionate']}")
        print(f"\n📝 Text to be spoken:")
        print(f'   "{text}"')

if __name__ == "__main__":
    test_commentator_voice()
