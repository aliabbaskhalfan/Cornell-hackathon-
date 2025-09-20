#!/usr/bin/env python3
"""
Test script for Voice Input and Chat functionality
Tests real voice queries and chat interactions with the app

Usage:
    python test_voice_chat.py
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

def test_voice_queries():
    """Test various voice input queries"""
    print("🎤 Testing Voice Input Queries...")
    print("=" * 50)
    
    # Real-world voice queries users might ask
    voice_queries = [
        {
            "transcript": "What's the score of the Lakers game?",
            "persona": "passionate",
            "user_context": {
                "interests": ["NBA", "Lakers"],
                "fantasy_info": "I have LeBron James on my fantasy team"
            },
            "expected": "score information"
        },
        {
            "transcript": "Tell me about LeBron's stats tonight",
            "persona": "nerdy", 
            "user_context": {
                "interests": ["statistics", "analytics"],
                "fantasy_info": "I'm tracking LeBron's performance"
            },
            "expected": "statistical analysis"
        },
        {
            "transcript": "Who's winning the game?",
            "persona": "funny",
            "user_context": {
                "interests": ["NBA", "entertainment"],
                "preferences": "I like humor"
            },
            "expected": "game status with humor"
        },
        {
            "transcript": "What happened in the last quarter?",
            "persona": "raw",
            "user_context": {
                "interests": ["NBA", "game analysis"],
                "preferences": "I want direct information"
            },
            "expected": "quarter summary"
        },
        {
            "transcript": "Is my fantasy player doing well?",
            "persona": "passionate",
            "user_context": {
                "interests": ["fantasy basketball"],
                "fantasy_info": "I have Anthony Davis and LeBron James"
            },
            "expected": "fantasy performance"
        }
    ]
    
    successful_queries = 0
    
    for i, query in enumerate(voice_queries, 1):
        print(f"\n🎯 Voice Query {i}:")
        print(f"   Transcript: '{query['transcript']}'")
        print(f"   Persona: {query['persona']}")
        print(f"   Expected: {query['expected']}")
        
        try:
            response = requests.post(VOICE_ENDPOINT, json={
                "transcript": query["transcript"],
                "persona": query["persona"],
                "user_context": query["user_context"]
            }, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data["success"]:
                    resp = data["response"]
                    print(f"   ✅ Response: {resp['text'][:150]}...")
                    print(f"   🎵 Audio: {resp['audio_url']}")
                    
                    # Check audio file
                    audio_path = resp['audio_url'].replace('/static/audio/', '')
                    full_path = f"/Users/arsh/Documents/BigRedHacks25/Cornell-hackathon-/backend/static/audio/{audio_path}"
                    if os.path.exists(full_path):
                        file_size = os.path.getsize(full_path)
                        print(f"   📁 Audio size: {file_size} bytes")
                        successful_queries += 1
                    else:
                        print(f"   ⚠️  Audio file missing")
                else:
                    print(f"   ❌ Failed: {data.get('error')}")
            else:
                print(f"   ❌ HTTP {response.status_code}: {response.text[:100]}")
                
        except requests.exceptions.Timeout:
            print(f"   ❌ Request timed out")
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        time.sleep(1)  # Rate limiting
    
    print(f"\n📊 Voice Query Results: {successful_queries}/{len(voice_queries)} successful")
    return successful_queries

def test_chat_conversation():
    """Test a conversational flow with the app"""
    print("\n💬 Testing Chat Conversation Flow...")
    print("=" * 50)
    
    # Simulate a conversation flow
    conversation = [
        {
            "transcript": "Hi, I'm new to basketball. Can you help me understand the game?",
            "persona": "nerdy",
            "user_context": {
                "interests": ["learning", "basketball basics"],
                "experience_level": "beginner"
            }
        },
        {
            "transcript": "What's a triple-double?",
            "persona": "nerdy", 
            "user_context": {
                "interests": ["statistics", "learning"],
                "experience_level": "beginner"
            }
        },
        {
            "transcript": "That's cool! Who are the best players for triple-doubles?",
            "persona": "passionate",
            "user_context": {
                "interests": ["NBA", "statistics"],
                "experience_level": "beginner"
            }
        },
        {
            "transcript": "Tell me something funny about basketball",
            "persona": "funny",
            "user_context": {
                "interests": ["entertainment", "humor"],
                "experience_level": "beginner"
            }
        }
    ]
    
    successful_responses = 0
    
    for i, message in enumerate(conversation, 1):
        print(f"\n💭 Message {i}:")
        print(f"   User: '{message['transcript']}'")
        print(f"   Persona: {message['persona']}")
        
        try:
            response = requests.post(VOICE_ENDPOINT, json={
                "transcript": message["transcript"],
                "persona": message["persona"],
                "user_context": message["user_context"]
            }, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data["success"]:
                    resp = data["response"]
                    print(f"   🤖 App: {resp['text'][:200]}...")
                    print(f"   🎵 Audio: {resp['audio_url']}")
                    successful_responses += 1
                else:
                    print(f"   ❌ Failed: {data.get('error')}")
            else:
                print(f"   ❌ HTTP {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        time.sleep(1.5)  # Conversation pacing
    
    print(f"\n📊 Conversation Results: {successful_responses}/{len(conversation)} responses successful")
    return successful_responses

def test_persona_switching():
    """Test switching between different personas"""
    print("\n🎭 Testing Persona Switching...")
    print("=" * 50)
    
    same_query = "What's happening in the NBA tonight?"
    personas = ["passionate", "nerdy", "funny", "raw"]
    
    successful_personas = 0
    
    for persona in personas:
        print(f"\n🎭 Testing {persona} persona:")
        print(f"   Query: '{same_query}'")
        
        try:
            response = requests.post(VOICE_ENDPOINT, json={
                "transcript": same_query,
                "persona": persona,
                "user_context": {
                    "interests": ["NBA", "basketball"],
                    "preferences": "I want to hear different perspectives"
                }
            }, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data["success"]:
                    resp = data["response"]
                    print(f"   ✅ {persona.title()} response: {resp['text'][:100]}...")
                    print(f"   🎵 Audio: {resp['audio_url']}")
                    successful_personas += 1
                else:
                    print(f"   ❌ Failed: {data.get('error')}")
            else:
                print(f"   ❌ HTTP {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        time.sleep(1)
    
    print(f"\n📊 Persona Results: {successful_personas}/{len(personas)} personas successful")
    return successful_personas

def test_edge_cases():
    """Test edge cases and error handling"""
    print("\n🔍 Testing Edge Cases...")
    print("=" * 50)
    
    edge_cases = [
        {
            "transcript": "",
            "persona": "passionate",
            "description": "Empty transcript"
        },
        {
            "transcript": "a" * 1000,  # Very long text
            "persona": "nerdy",
            "description": "Very long transcript"
        },
        {
            "transcript": "What's the score?",
            "persona": "invalid_persona",
            "description": "Invalid persona"
        },
        {
            "transcript": "!@#$%^&*()",  # Special characters
            "persona": "funny",
            "description": "Special characters only"
        }
    ]
    
    handled_cases = 0
    
    for i, case in enumerate(edge_cases, 1):
        print(f"\n🔍 Edge Case {i}: {case['description']}")
        print(f"   Transcript: '{case['transcript'][:50]}...'")
        print(f"   Persona: {case['persona']}")
        
        try:
            response = requests.post(VOICE_ENDPOINT, json={
                "transcript": case["transcript"],
                "persona": case["persona"],
                "user_context": {"interests": ["NBA"]}
            }, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if data["success"]:
                    resp = data["response"]
                    print(f"   ✅ Handled gracefully: {resp['text'][:100]}...")
                    handled_cases += 1
                else:
                    print(f"   ⚠️  Error handled: {data.get('error')}")
                    handled_cases += 1  # Still counts as handled
            else:
                print(f"   ❌ HTTP error: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Exception: {e}")
        
        time.sleep(0.5)
    
    print(f"\n📊 Edge Case Results: {handled_cases}/{len(edge_cases)} cases handled")
    return handled_cases

def main():
    """Run comprehensive voice input and chat tests"""
    print("🚀 Starting Voice Input and Chat Test Suite")
    print("=" * 60)
    
    # Test voice queries
    voice_results = test_voice_queries()
    
    # Test conversation flow
    chat_results = test_chat_conversation()
    
    # Test persona switching
    persona_results = test_persona_switching()
    
    # Test edge cases
    edge_results = test_edge_cases()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Comprehensive Test Results:")
    print(f"   Voice Queries: {voice_results}/5 successful")
    print(f"   Chat Conversation: {chat_results}/4 responses")
    print(f"   Persona Switching: {persona_results}/4 personas")
    print(f"   Edge Cases: {edge_results}/4 handled")
    
    total_tests = voice_results + chat_results + persona_results + edge_results
    max_tests = 5 + 4 + 4 + 4
    
    print(f"\n🎯 Overall Success Rate: {total_tests}/{max_tests} ({total_tests/max_tests*100:.1f}%)")
    
    if total_tests >= max_tests * 0.8:  # 80% success rate
        print("\n🎉 Voice input and chat functionality is working well!")
    else:
        print("\n⚠️  Some issues detected. Check the output above for details.")
    
    print("\n💡 To test manually:")
    print("1. Start frontend: cd frontend && npm run dev")
    print("2. Open voice Q&A component")
    print("3. Try different personas and queries")

if __name__ == "__main__":
    main()
