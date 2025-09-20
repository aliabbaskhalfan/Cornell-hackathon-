from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import os
from dotenv import load_dotenv
from routes import api_bp
from socket_handlers import register_socket_handlers

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb://localhost:27017/sports_commentator')

# Initialize extensions
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)

# Register blueprints
app.register_blueprint(api_bp, url_prefix='/api')

# Register socket handlers
register_socket_handlers(socketio)

@app.route('/')
def health_check():
    return jsonify({"status": "healthy", "message": "Sports Commentator API"})

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
