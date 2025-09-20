#!/usr/bin/env python3
"""
Voice Features Test Runner
Run this from the backend directory to test voice features
"""

import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import and run tests
from tests.test_voice_features import main

if __name__ == "__main__":
    print("🎯 Running Voice Features Tests from Backend Directory")
    print("=" * 60)
    main()
