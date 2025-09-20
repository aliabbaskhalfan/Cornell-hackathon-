#!/usr/bin/env python3
"""
Development server runner for Sports Commentator API
"""

import os
import sys
from app import app, socketio

if __name__ == '__main__':
    # Set development environment
    os.environ['FLASK_ENV'] = 'development'
    os.environ['FLASK_DEBUG'] = '1'
    
    port = int(os.getenv('PORT', 5002))  # Use port 5002 to avoid conflicts
    
    print("🏀 Starting Sports Commentator API Server...")
    print("📡 Socket.IO enabled for real-time updates")
    print(f"🔗 API available at: http://localhost:{port}")
    print(f"📊 Health check: http://localhost:{port}/")
    
    try:
        socketio.run(
            app,
            debug=True,
            host='0.0.0.0',
            port=port,
            allow_unsafe_werkzeug=True
        )
    except KeyboardInterrupt:
        print("\n👋 Shutting down server...")
        sys.exit(0)
