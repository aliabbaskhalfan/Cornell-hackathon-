'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, MicOff, Volume2, Settings, TestTube } from 'lucide-react'
import { api } from '@/lib/api'

interface VoiceQAProps {
  gameId?: string | null
}

interface Persona {
  description: string
  voice_config: string
  style: string
}

interface UserContext {
  interests?: string[]
  fantasy_info?: string
  preferences?: string
}

export function VoiceQA({ gameId }: VoiceQAProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState('passionate')
  const [personas, setPersonas] = useState<Record<string, Persona>>({})
  const [showSettings, setShowSettings] = useState(false)
  const [userContext, setUserContext] = useState<UserContext>({
    interests: [],
    fantasy_info: '',
    preferences: ''
  })
  const [textInput, setTextInput] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    // Load available personas
    loadPersonas()
    
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setTranscript(transcript)
        handleVoiceQuery(transcript)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const loadPersonas = async () => {
    try {
      const result = await api.getPersonas()
      if (result.success) {
        setPersonas(result.personas)
      }
    } catch (error) {
      console.error('Error loading personas:', error)
    }
  }

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true)
      setTranscript('')
      setResponse(null)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const handleVoiceQuery = async (transcript: string) => {
    setIsProcessing(true)
    try {
      const result = await api.processVoiceQuery(
        transcript, 
        gameId || undefined, 
        selectedPersona,
        userContext
      )
      setResponse(result.response)
      
      // Play audio response if available
      if (result.response.audio_url) {
        const audio = new Audio(result.response.audio_url)
        audio.play().catch(console.error)
      }
    } catch (error) {
      console.error('Voice query error:', error)
      setResponse({
        text: 'Sorry, I had trouble processing your question. Please try again.',
        audio_url: null
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTextQuery = async () => {
    if (!textInput.trim()) return
    
    setIsProcessing(true)
    try {
      const result = await api.processVoiceQuery(
        textInput, 
        gameId || undefined, 
        selectedPersona,
        userContext
      )
      setResponse(result.response)
      setTranscript(textInput)
      
      // Play audio response if available
      if (result.response.audio_url) {
        const audio = new Audio(result.response.audio_url)
        audio.play().catch(console.error)
      }
    } catch (error) {
      console.error('Text query error:', error)
      setResponse({
        text: 'Sorry, I had trouble processing your question. Please try again.',
        audio_url: null
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const testTTS = async () => {
    setIsProcessing(true)
    try {
      const result = await api.testVoiceFeatures('tts')
      if (result.success) {
        // Play the passionate persona audio as a test
        const testAudio = result.results[selectedPersona]?.audio_url
        if (testAudio) {
          const audio = new Audio(testAudio)
          audio.play().catch(console.error)
        }
      }
    } catch (error) {
      console.error('TTS test error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const testGemini = async () => {
    setIsProcessing(true)
    try {
      const result = await api.testVoiceFeatures('gemini', {
        query: 'Tell me something interesting about basketball',
        persona: selectedPersona,
        user_context: userContext
      })
      if (result.success) {
        setResponse(result.response)
        setTranscript(result.query)
        
        // Play audio response if available
        if (result.response.audio_url) {
          const audio = new Audio(result.response.audio_url)
          audio.play().catch(console.error)
        }
      }
    } catch (error) {
      console.error('Gemini test error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const playResponse = () => {
    if (response?.audio_url) {
      const audio = new Audio(response.audio_url)
      audio.play().catch(console.error)
    }
  }

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Card className="w-96 max-h-96 overflow-y-auto">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                Voice Q&A
              </h3>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant={isListening ? 'destructive' : 'default'}
                  size="sm"
                  onClick={isListening ? stopListening : startListening}
                  disabled={isProcessing}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {showSettings && (
              <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Voice Persona
                  </label>
                  <select
                    value={selectedPersona}
                    onChange={(e) => setSelectedPersona(e.target.value)}
                    className="w-full mt-1 text-xs border rounded px-2 py-1"
                  >
                    {Object.entries(personas).map(([key, persona]) => (
                      <option key={key} value={key}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} - {persona.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Your Interests (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={userContext.interests?.join(', ') || ''}
                    onChange={(e) => setUserContext({
                      ...userContext,
                      interests: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    })}
                    placeholder="NBA fantasy, Lakers, statistics..."
                    className="w-full mt-1 text-xs border rounded px-2 py-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Fantasy Context
                  </label>
                  <textarea
                    value={userContext.fantasy_info || ''}
                    onChange={(e) => setUserContext({
                      ...userContext,
                      fantasy_info: e.target.value
                    })}
                    placeholder="I have LeBron James on my fantasy team..."
                    className="w-full mt-1 text-xs border rounded px-2 py-1 h-16 resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testTTS}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    <TestTube className="h-3 w-3 mr-1" />
                    Test TTS
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testGemini}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    <TestTube className="h-3 w-3 mr-1" />
                    Test AI
                  </Button>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Text Input (alternative to voice)
              </label>
              <div className="flex gap-1 mt-1">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Ask me anything about basketball..."
                  className="flex-1 text-xs border rounded px-2 py-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleTextQuery()}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTextQuery}
                  disabled={isProcessing || !textInput.trim()}
                >
                  Send
                </Button>
              </div>
            </div>
            
            {transcript && (
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <p className="font-medium">You said:</p>
                <p>"{transcript}"</p>
              </div>
            )}
            
            {isProcessing && (
              <div className="text-sm text-blue-600">
                Processing your question...
              </div>
            )}
            
            {response && (
              <div className="space-y-2">
                <div className="text-sm text-slate-900 dark:text-white">
                  <p className="font-medium">Response ({response.persona}):</p>
                  <p>{response.text}</p>
                </div>
                
                {response.audio_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={playResponse}
                    className="w-full"
                  >
                    <Volume2 className="h-4 w-4 mr-2" />
                    Play Response
                  </Button>
                )}
              </div>
            )}
            
            {!gameId && (
              <div className="text-xs text-slate-500">
                Select a game to ask game-specific questions
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
