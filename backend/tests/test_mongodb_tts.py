#!/usr/bin/env python3
"""
Test script for MongoDB and Live TTS functionality
Run this to test database operations and real TTS API calls

Usage:
    python test_mongodb_tts.py
    python -m pytest test_mongodb_tts.py
"""

import requests
import json
import time
import sys
import os
from datetime import datetime, timedelta

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configuration
API_BASE_URL = "http://localhost:5002/api"
VOICE_ENDPOINT = f"{API_BASE_URL}/voice"

def test_mongodb_connection():
    """Test MongoDB connection and basic operations"""
    print("🗄️  Testing MongoDB connection and operations...")
    
    try:
        from database import db
        
        # Test connection
        print("✅ MongoDB connection established")
        
        # Test basic operations
        test_data = {
            "test_id": f"test_{int(time.time())}",
            "message": "MongoDB test data",
            "timestamp": datetime.utcnow(),
            "test_type": "connection_test"
        }
        
        # Insert test document
        result = db.games.insert_one(test_data)
        print(f"✅ Document inserted with ID: {result.inserted_id}")
        
        # Find test document
        found_doc = db.games.find_one({"test_id": test_data["test_id"]})
        if found_doc:
            print("✅ Document retrieved successfully")
            print(f"   Test ID: {found_doc['test_id']}")
            print(f"   Message: {found_doc['message']}")
        else:
            print("❌ Document not found")
        
        # Update test document
        update_result = db.games.update_one(
            {"test_id": test_data["test_id"]},
            {"$set": {"updated": True, "update_time": datetime.utcnow()}}
        )
        if update_result.modified_count > 0:
            print("✅ Document updated successfully")
        else:
            print("❌ Document update failed")
        
        # Verify update
        updated_doc = db.games.find_one({"test_id": test_data["test_id"]})
        if updated_doc and updated_doc.get("updated"):
            print("✅ Update verification successful")
        else:
            print("❌ Update verification failed")
        
        # Clean up test document
        delete_result = db.games.delete_one({"test_id": test_data["test_id"]})
        if delete_result.deleted_count > 0:
            print("✅ Test document cleaned up")
        else:
            print("❌ Cleanup failed")
        
        # Test collections exist
        collections = db.db.list_collection_names()
        expected_collections = ["games", "events", "statlines", "commentary", "users"]
        print(f"✅ Available collections: {collections}")
        
        for collection_name in expected_collections:
            if collection_name in collections:
                print(f"   ✅ {collection_name} collection exists")
            else:
                print(f"   ⚠️  {collection_name} collection missing")
        
        print("✅ MongoDB tests completed successfully!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Make sure you're running from the backend directory")
        return False
    except Exception as e:
        print(f"❌ MongoDB test error: {e}")
        return False

def test_live_tts():
    """Test live TTS functionality with real API calls"""
    print("\n🎤 Testing Live TTS functionality...")
    
    # Check if server is running
    if not test_server_connection():
        print("❌ Server not running. Cannot test live TTS.")
        print("To test live TTS:")
        print("1. Start the backend: cd backend && python run.py")
        print("2. Run this test again: python tests/test_mongodb_tts.py")
        return False
    
    try:
        # Test different personas with live TTS
        test_cases = [
            {
                "persona": "passionate",
                "text": "LeBron James just made an incredible slam dunk! The crowd is going wild!",
                "description": "Passionate commentator"
            },
            {
                "persona": "nerdy", 
                "text": "The Lakers have a 67.3% field goal percentage in the third quarter, which is 12.4% above their season average.",
                "description": "Analytical commentator"
            },
            {
                "persona": "funny",
                "text": "That player just tried to shoot from half court. Spoiler alert: it didn't go well!",
                "description": "Humorous commentator"
            }
        ]
        
        successful_tests = 0
        
        for i, test_case in enumerate(test_cases, 1):
            print(f"\n  Test {i}: {test_case['description']}")
            print(f"  Text: '{test_case['text'][:50]}...'")
            
            try:
                response = requests.post(f"{VOICE_ENDPOINT}/test", json={
                    "test_type": "tts",
                    "persona": test_case["persona"],
                    "text": test_case["text"]
                }, timeout=30)
                
                if response.status_code == 200:
                    data = response.json()
                    if data["success"]:
                        result = data["results"][test_case["persona"]]
                        print(f"    ✅ TTS successful!")
                        print(f"    Audio URL: {result['audio_url']}")
                        print(f"    Duration: {result.get('duration', 'N/A')} seconds")
                        
                        # Test if audio file exists
                        audio_path = result['audio_url'].replace('/static/audio/', '')
                        full_path = f"/Users/arsh/Documents/BigRedHacks25/Cornell-hackathon-/backend/static/audio/{audio_path}"
                        if os.path.exists(full_path):
                            file_size = os.path.getsize(full_path)
                            print(f"    File size: {file_size} bytes")
                            successful_tests += 1
                        else:
                            print(f"    ⚠️  Audio file not found at: {full_path}")
                    else:
                        print(f"    ❌ TTS failed: {data.get('error')}")
                else:
                    print(f"    ❌ Request failed with status {response.status_code}")
                    print(f"    Response: {response.text}")
                
            except requests.exceptions.Timeout:
                print(f"    ❌ Request timed out (30s)")
            except Exception as e:
                print(f"    ❌ Error: {e}")
            
            time.sleep(1)  # Rate limiting
        
        print(f"\n✅ Live TTS tests completed: {successful_tests}/{len(test_cases)} successful")
        return successful_tests > 0
        
    except Exception as e:
        print(f"❌ Live TTS test error: {e}")
        return False

def test_voice_query_live():
    """Test live voice query processing with TTS"""
    print("\n🎯 Testing Live Voice Query Processing...")
    
    if not test_server_connection():
        print("❌ Server not running. Cannot test live voice queries.")
        return False
    
    test_cases = [
        {
            "transcript": "What's the current score of the Lakers game?",
            "persona": "passionate",
            "user_context": {
                "interests": ["NBA", "Lakers"],
                "fantasy_info": "I'm tracking LeBron's stats"
            }
        },
        {
            "transcript": "Tell me about basketball statistics and analytics",
            "persona": "nerdy",
            "user_context": {
                "interests": ["analytics", "data"],
                "preferences": "I want technical details"
            }
        }
    ]
    
    successful_tests = 0
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n  Voice Query Test {i}:")
        print(f"  Transcript: '{test_case['transcript']}'")
        print(f"  Persona: {test_case['persona']}")
        
        try:
            response = requests.post(VOICE_ENDPOINT, json=test_case, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data["success"]:
                    resp = data["response"]
                    print(f"    ✅ Query processed successfully!")
                    print(f"    Response: {resp['text'][:100]}...")
                    print(f"    Audio URL: {resp['audio_url']}")
                    
                    # Verify audio file exists
                    audio_path = resp['audio_url'].replace('/static/audio/', '')
                    full_path = f"/Users/arsh/Documents/BigRedHacks25/Cornell-hackathon-/backend/static/audio/{audio_path}"
                    if os.path.exists(full_path):
                        file_size = os.path.getsize(full_path)
                        print(f"    Audio file size: {file_size} bytes")
                        successful_tests += 1
                    else:
                        print(f"    ⚠️  Audio file not found")
                else:
                    print(f"    ❌ Query failed: {data.get('error')}")
            else:
                print(f"    ❌ Request failed with status {response.status_code}")
                
        except requests.exceptions.Timeout:
            print(f"    ❌ Request timed out (30s)")
        except Exception as e:
            print(f"    ❌ Error: {e}")
        
        time.sleep(1)  # Rate limiting
    
    print(f"\n✅ Live voice query tests completed: {successful_tests}/{len(test_cases)} successful")
    return successful_tests > 0

def test_server_connection():
    """Test if server is running"""
    try:
        response = requests.get(f"{API_BASE_URL}/voice/personas", timeout=5)
        return response.status_code == 200
    except Exception:
        return False

def main():
    """Run MongoDB and Live TTS tests"""
    print("🚀 Starting MongoDB and Live TTS Test Suite")
    print("=" * 60)
    
    # Test MongoDB
    mongodb_success = test_mongodb_connection()
    
    # Test Live TTS
    tts_success = test_live_tts()
    
    # Test Live Voice Queries
    voice_query_success = test_voice_query_live()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Results Summary:")
    print(f"   MongoDB: {'✅ PASSED' if mongodb_success else '❌ FAILED'}")
    print(f"   Live TTS: {'✅ PASSED' if tts_success else '❌ FAILED'}")
    print(f"   Voice Queries: {'✅ PASSED' if voice_query_success else '❌ FAILED'}")
    
    if mongodb_success and tts_success and voice_query_success:
        print("\n🎉 All tests passed! MongoDB and TTS are working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the output above for details.")
    
    print("\nTo run individual tests:")
    print("1. MongoDB only: test_mongodb_connection()")
    print("2. TTS only: test_live_tts()")
    print("3. Voice queries only: test_voice_query_live()")

if __name__ == "__main__":
    main()
