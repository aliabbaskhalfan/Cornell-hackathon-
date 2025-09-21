from flask import Blueprint, jsonify, request
from services.voice_service import VoiceService
from database import db
import logging
import tempfile
import os
import time
import google.generativeai as genai
from config import Config

voice_bp = Blueprint('voice', __name__)
logger = logging.getLogger(__name__)

voice_service = VoiceService()

@voice_bp.route('/', methods=['GET'])
def voice_health():
    """Health/info endpoint for voice API (GET-friendly)."""
    try:
        personas = voice_service.get_available_personas()
        return jsonify({
            "success": True,
            "message": "Voice API is healthy. Use POST to this endpoint to get a Gemini answer and TTS.",
            "personas": personas,
            "usage": {
                "method": "POST",
                "path": "/api/voice",
                "body": {
                    "transcript": "your question",
                    "game_id": "lakers_trailblazers_20250413",
                    "persona": "passionate",
                    "user_context": {"interests": ["lakers"], "preferences": {"brevity": "short"}}
                }
            }
        })
    except Exception as e:
        logger.error(f"Error in voice health: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@voice_bp.route('', methods=['GET'])
def voice_health_no_slash():
    return voice_health()

@voice_bp.route('/', methods=['POST'])
def process_voice_query():
    """Process voice query and return response with audio"""
    try:
        data = request.get_json()
        transcript = data.get('transcript')
        game_id = data.get('game_id')
        persona = data.get('persona', 'passionate')
        user_context = data.get('user_context') or {}
        # Attach user_id from header when missing for persistence
        try:
            if 'user_id' not in user_context:
                user_id = request.headers.get('X-User-Id') or request.args.get('user_id')
                if user_id:
                    user_context['user_id'] = user_id
        except Exception:
            pass
        
        if not transcript:
            return jsonify({
                "success": False,
                "error": "transcript is required"
            }), 400
        
        response = voice_service.process_query(
            transcript=transcript,
            game_id=game_id,
            persona=persona,
            user_context=user_context
        )
        
        return jsonify({
            "success": True,
            "response": response
        })
    except Exception as e:
        logger.error(f"Error processing voice query: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@voice_bp.route('', methods=['POST'])
def process_voice_query_no_slash():
    return process_voice_query()

@voice_bp.route('/tts', methods=['POST'])
def speak_tts():
    """Generate TTS audio for provided text (no Gemini)."""
    try:
        data = request.get_json() or {}
        text = data.get('text', '').strip()
        persona = data.get('persona', 'passionate')
        language = data.get('language')
        voice_id = data.get('voice_id')
        model_id = data.get('model_id')
        voice_settings = data.get('voice_settings')
        if not text:
            return jsonify({ 'success': False, 'error': 'text is required' }), 400
        # Fallback to stored user preferences when options not explicitly provided
        try:
            if (not voice_id or not language):
                user_id = request.headers.get('X-User-Id') or request.args.get('user_id')
                if user_id:
                    user_doc = db.users.find_one({'_id': user_id}) or {}
                    prefs = user_doc.get('preferences') or {}
                    voice_id = voice_id or prefs.get('voiceId') or prefs.get('voice_id')
                    language = language or prefs.get('language')
        except Exception:
            pass

        audio_url = voice_service.tts_service.generate_audio(
            text,
            persona,
            voice_id=voice_id,
            model_id=model_id,
            language=language,
            voice_settings=voice_settings
        )
        if not audio_url:
            return jsonify({ 'success': False, 'error': 'Failed to generate audio' }), 500
        return jsonify({ 'success': True, 'audio_url': audio_url })
    except Exception as e:
        logger.error(f"Error generating TTS: {e}")
        return jsonify({ 'success': False, 'error': str(e) }), 500

@voice_bp.route('/voices', methods=['GET'])
def list_voices():
    """List available ElevenLabs voices."""
    try:
        refresh = request.args.get('refresh') in ('1', 'true', 'yes')
        voices = voice_service.tts_service.list_voices(force_refresh=refresh)
        return jsonify({ 'success': True, 'voices': voices })
    except Exception as e:
        logger.error(f"Error listing voices: {e}")
        return jsonify({ 'success': False, 'error': str(e) }), 500

@voice_bp.route('/personas', methods=['GET'])
def get_personas():
    """Get available personas"""
    try:
        personas = voice_service.get_available_personas()
        persona_info = {}
        for persona in personas:
            persona_info[persona] = voice_service.get_persona_info(persona)
        
        return jsonify({
            "success": True,
            "personas": persona_info
        })
    except Exception as e:
        logger.error(f"Error getting personas: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@voice_bp.route('/test', methods=['POST'])
def test_voice_features():
    """Test endpoint for voice features"""
    try:
        data = request.get_json()
        test_type = data.get('test_type', 'tts')
        
        if test_type == 'tts':
            # Test TTS with specific persona or all personas
            test_text = "Hello! This is a test of the text-to-speech system."
            target_persona = data.get('persona')
            
            if target_persona:
                # Test specific persona only
                audio_url = voice_service.tts_service.generate_audio(test_text, target_persona)
                results = {
                    target_persona: {
                        'text': test_text,
                        'audio_url': audio_url
                    }
                }
            else:
                # Test all personas (fallback for backward compatibility)
                results = {}
                for persona in voice_service.get_available_personas():
                    audio_url = voice_service.tts_service.generate_audio(test_text, persona)
                    results[persona] = {
                        'text': test_text,
                        'audio_url': audio_url
                    }
            
            return jsonify({
                "success": True,
                "test_type": "tts",
                "results": results
            })
        
        elif test_type == 'gemini':
            # Test Gemini AI integration
            test_query = data.get('query', 'Tell me about basketball')
            persona = data.get('persona', 'passionate')
            user_context = data.get('user_context')
            
            response = voice_service.process_query(
                transcript=test_query,
                persona=persona,
                user_context=user_context
            )
            
            return jsonify({
                "success": True,
                "test_type": "gemini",
                "query": test_query,
                "response": response
            })
        
        else:
            return jsonify({
                "success": False,
                "error": "Invalid test_type. Use 'tts' or 'gemini'"
            }), 400
            
    except Exception as e:
        logger.error(f"Error in voice test: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@voice_bp.route('/transcribe', methods=['POST'])
def transcribe_audio():
    """Transcribe audio file to text using Gemini AI"""
    try:
        # Check if audio file is present
        if 'audio' not in request.files:
            return jsonify({
                "success": False,
                "error": "No audio file provided"
            }), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({
                "success": False,
                "error": "No audio file selected"
            }), 400
        
        # Check if Gemini API is configured
        if not Config.GEMINI_API_KEY:
            return jsonify({
                "success": False,
                "error": "Gemini AI not configured"
            }), 500
        
        # Determine file extension based on content type or filename
        content_type = audio_file.content_type or ''
        filename = audio_file.filename or ''
        
        if 'wav' in content_type or filename.endswith('.wav'):
            suffix = '.wav'
        elif 'webm' in content_type or filename.endswith('.webm'):
            suffix = '.webm'
        elif 'mp3' in content_type or filename.endswith('.mp3'):
            suffix = '.mp3'
        elif 'mp4' in content_type or filename.endswith('.mp4'):
            suffix = '.mp4'
        elif 'ogg' in content_type or filename.endswith('.ogg'):
            suffix = '.ogg'
        else:
            # Default to webm as it's most common from browsers
            suffix = '.webm'
        
        # Save audio file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            audio_file.save(temp_file.name)
            temp_file_path = temp_file.name
            
        logger.info(f"Saved audio file: {temp_file_path}, content_type: {content_type}, filename: {filename}")
        
        try:
            # Configure Gemini
            genai.configure(api_key=Config.GEMINI_API_KEY)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            # Upload audio file to Gemini
            logger.info(f"Uploading audio file: {temp_file_path}")
            try:
                audio_file_obj = genai.upload_file(temp_file_path)
                logger.info(f"File uploaded with ID: {audio_file_obj.name}")
            except Exception as upload_error:
                logger.error(f"Failed to upload file to Gemini: {upload_error}")
                raise Exception(f"Audio upload failed: {str(upload_error)}")
            
            
            # Wait for the file to be processed and become ACTIVE
            max_wait_time = 30  # seconds
            wait_interval = 1   # seconds
            elapsed_time = 0
            
            while elapsed_time < max_wait_time:
                file_info = genai.get_file(audio_file_obj.name)
                logger.info(f"File state: {file_info.state}")
                
                if file_info.state.name == 'ACTIVE':
                    break
                elif file_info.state.name == 'FAILED':
                    raise Exception(f"File processing failed: {file_info.error}")
                
                time.sleep(wait_interval)
                elapsed_time += wait_interval
            
            if elapsed_time >= max_wait_time:
                raise Exception("File processing timeout - file did not become ACTIVE within 30 seconds")
            
            # Generate transcription
            logger.info("Generating transcription...")
            try:
                # Try first with a simple prompt
                response = model.generate_content([
                    "Transcribe the spoken words in this audio:",
                    audio_file_obj
                ])
            except Exception as transcribe_error:
                logger.warning(f"First transcription attempt failed: {transcribe_error}")
                # Try with an even simpler prompt
                response = model.generate_content([
                    "What words are spoken in this audio file?",
                    audio_file_obj
                ])
            
            transcript = response.text.strip()
            logger.info(f"Transcription completed: {transcript[:100]}...")
            
            # Clean up: delete the uploaded file and temporary file
            try:
                genai.delete_file(audio_file_obj.name)
                logger.info("Uploaded file deleted from Gemini")
            except Exception as cleanup_error:
                logger.warning(f"Failed to delete uploaded file: {cleanup_error}")
            
            os.unlink(temp_file_path)
            
            return jsonify({
                "success": True,
                "transcript": transcript,
                "text": transcript  # Alias for compatibility
            })
            
        except Exception as e:
            # Clean up temporary file on error
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
            
            # Also try to clean up any uploaded file
            try:
                if 'audio_file_obj' in locals():
                    genai.delete_file(audio_file_obj.name)
                    logger.info("Uploaded file deleted from Gemini after error")
            except Exception as cleanup_error:
                logger.warning(f"Failed to delete uploaded file after error: {cleanup_error}")
            
            raise e
            
    except Exception as e:
        logger.error(f"Error transcribing audio: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
