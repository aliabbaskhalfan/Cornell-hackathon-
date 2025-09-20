# Backend Tests

This directory contains tests for the backend voice features.

## Test Files

- `test_voice_features.py` - Comprehensive voice features testing

## Running Tests

### Quick Start
```bash
# From backend directory
python run_voice_tests.py
```

### Direct Test Execution
```bash
# From backend directory
python tests/test_voice_features.py
```

### Using pytest
```bash
# From backend directory
python -m pytest tests/test_voice_features.py -v
```

## Test Types

### Unit Tests
- Test voice service directly without server
- Test persona configurations
- Test rule-based responses

### Integration Tests
- Test API endpoints
- Test TTS functionality
- Test Gemini AI integration
- Test voice query processing

## Requirements

- Backend server running (for integration tests)
- Required environment variables set
- All dependencies installed

## Test Output

The tests will show:
- ✅ Successful tests
- ❌ Failed tests with error details
- ⚠️ Warnings for missing server
- 🎯 Test progress indicators
