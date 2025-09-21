'use client'

import { useState, useRef, useEffect } from 'react'
import { useReactMediaRecorder } from 'react-media-recorder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mic, ArrowUp, Bot, X } from 'lucide-react'
import { api } from '@/lib/api'
import apiClient from '@/lib/api'
import { useChat } from '@/components/providers/chat-provider'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  audioUrl?: string
}

export function BottomChatBar() {
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState<Array<{ id: string; question: string; answer: string }>>([])
  const [exitingIds, setExitingIds] = useState<string[]>([])
  const [currentGameId, setCurrentGameId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [mounted, setMounted] = useState(false)
  const [showNetworkError, setShowNetworkError] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  
  // Use chat context to notify other components when answering
  const { setChatAnswering } = useChat()

  // Use react-media-recorder for reliable audio recording
  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl
  } = useReactMediaRecorder({
    audio: true,
    onStop: (blobUrl, blob) => {
      console.log('Recording stopped, processing audio...', 'Type:', blob?.type, 'Size:', blob?.size)
      handleAudioRecording(blob)
    }
  })

  const isRecording = status === 'recording'

  // Handle audio recording and transcription
  const handleAudioRecording = async (audioBlob: Blob) => {
    console.log('Processing audio blob:', audioBlob)
    setIsTranscribing(true)
    
    try {
      // Create FormData to send audio to backend for transcription
      const formData = new FormData()
      const filename = audioBlob.type.includes('wav') ? 'recording.wav' : 
                       audioBlob.type.includes('webm') ? 'recording.webm' :
                       audioBlob.type.includes('mp3') ? 'recording.mp3' :
                       audioBlob.type.includes('mp4') ? 'recording.mp4' :
                       audioBlob.type.includes('ogg') ? 'recording.ogg' :
                       'recording.webm' // default to webm which is widely supported
      formData.append('audio', audioBlob, filename)
      
      // Send to backend for transcription using the configured API base URL
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'
      console.log('Sending audio for transcription...')
      
      const response = await fetch(`${baseURL}/api/voice/transcribe`, {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const transcript = data.transcript || data.text
          if (transcript) {
            console.log('Transcription result:', transcript)
            const trimmedTranscript = transcript.trim()
            setInputValue(trimmedTranscript)
            
            // Auto-send the transcribed message after a brief moment to show the text
            setTimeout(() => {
              console.log('Auto-send timeout triggered for transcript:', trimmedTranscript)
              
              // Send the transcript directly without relying on inputValue state
              if (trimmedTranscript && !isLoading) {
                console.log('Auto-sending transcript:', trimmedTranscript)
                handleSendMessage(trimmedTranscript)
              } else {
                console.log('Auto-send skipped:', { hasTranscript: !!trimmedTranscript, isLoading })
              }
            }, 800) // Give user 800ms to see the transcribed text
          } else {
            console.warn('No transcript received from server')
            setInputValue('Could not transcribe audio')
          }
        } else {
          console.error('Transcription API error:', data.error)
          setInputValue('Speech recognition failed: ' + (data.error || 'Unknown error'))
        }
      } else {
        const errorText = await response.text()
        console.error('Transcription failed:', response.status, errorText)
        setInputValue('Speech recognition failed')
      }
    } catch (error) {
      console.error('Error processing audio:', error)
      setInputValue('Error processing speech')
    } finally {
      setIsTranscribing(false)
      clearBlobUrl()
    }
  }

  // Handle client-side mounting and game detection
  useEffect(() => {
    setMounted(true)
    
    // Detect current game ID from URL or use default
    const detectGameId = async () => {
      try {
        // Try to get current game from scoreboard
        const response = await api.getScoreboard()
        if (response.success && response.games.length > 0) {
          const liveGame = response.games.find((g: any) => g.status === 'InProgress')
          const game = liveGame || response.games[0]
          setCurrentGameId(game.game_id || game.gameId || 'lakers_trailblazers_20250413')
        } else {
          setCurrentGameId('lakers_trailblazers_20250413')
        }
      } catch {
        setCurrentGameId('lakers_trailblazers_20250413')
      }
    }
    
    detectGameId()
  }, [])

  // Focus input on mount for quick typing
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [])

  const handleSendMessage = async (customText?: string) => {
    const messageText = customText || inputValue.trim()
    if (!messageText || isLoading) return

    const userInput = messageText
    setInputValue('')
    setIsLoading(true)
    setChatAnswering(true) // Notify other components that chat is answering

    try {
      // Get user preferences from localStorage
      const userPreferences = localStorage.getItem('user-preferences')
      let preferences: any = {}
      try {
        preferences = userPreferences ? JSON.parse(userPreferences) : {}
      } catch {
        preferences = {}
      }

      // Map to supported personas (fallback to 'nerdy' for analytical tone)
      const persona: 'passionate' | 'nerdy' = (Number(preferences?.energyLevel) > 70) ? 'passionate' : 'nerdy'

      // Build user_context payload expected by backend (include nested preferences and user_id)
      const userId = (typeof window !== 'undefined') ? localStorage.getItem('user_id') : undefined
      const userContext = { 
        user_id: userId || undefined, 
        preferences,
        interests: preferences.favoriteTeam ? [preferences.favoriteTeam.name || preferences.favoriteTeam] : ['basketball'],
        fantasy_info: preferences.fantasyInfo ? `Fantasy: ${preferences.fantasyInfo.league || 'Unknown'} - ${preferences.fantasyInfo.notes || ''}` : undefined,
        customInstructions: preferences.customInstructions || undefined
      }

      // Process voice query with backend using current game context
      const response = await api.processVoiceQuery(
        userInput,
        currentGameId || undefined, // Pass current game ID for context
        persona, // supported persona
        userContext // user context with nested preferences and game context
      )

      const addNotification = (question: string, answer: string) => {
        const id = `${Date.now()}`
        setNotifications(prev => {
          if (prev.length > 0) {
            const exiting = prev[0]
            setExitingIds(ids => [...ids, exiting.id])
            // After exit animation, replace with the new one
            setTimeout(() => {
              setNotifications([{ id, question, answer }])
              setExitingIds(ids => ids.filter(x => x !== exiting.id))
            }, 300)
            return prev
          }
          return [{ id, question, answer }]
        })
      }

      if (response.success) {
        const text = (response.response && response.response.text) ? response.response.text : response.response
        const answer = typeof text === 'string' ? text : JSON.stringify(text)
        addNotification(userInput, answer)
        
        // Speak the response using TTS with user's voice preferences
        try {
          const pref = (typeof window !== 'undefined') ? localStorage.getItem('speak_live_updates') : 'false'
          const speakOn = pref === 'true'
          if (speakOn && answer) {
            // Gather user preferences to pass voice selection explicitly
            let ttsOptions: any = { text: answer, persona }
            try {
              const userPreferences = localStorage.getItem('user-preferences')
              if (userPreferences) {
                const preferences = JSON.parse(userPreferences)
                if (preferences?.voiceId) ttsOptions.voice_id = preferences.voiceId
                if (preferences?.language) ttsOptions.language = preferences.language
              }
            } catch {}
            
            const ttsResp = await apiClient.post('/api/voice/tts', ttsOptions)
            const url: string | undefined = ttsResp.data?.audio_url
            if (url) {
              const base = (apiClient.defaults.baseURL as string) || ''
              const full = url.startsWith('http') ? url : `${base}${url}`
              const audio = new Audio(full)
              audio.volume = 0.8
              audio.play().catch(() => {})
            }
          }
        } catch (ttsError) {
          console.warn('Failed to speak chat response:', ttsError)
        }
      } else {
        throw new Error(response.error || 'Failed to process query')
      }
    } catch (error) {
      console.error('Error processing voice query:', error)
      const fallback = "I'm having trouble processing that right now. Please try again."
      const id = `${Date.now()}`
      setNotifications(prev => {
        if (prev.length > 0) {
          const exiting = prev[0]
          setExitingIds(ids => [...ids, exiting.id])
          setTimeout(() => {
            setNotifications([{ id, question: userInput, answer: fallback }])
            setExitingIds(ids => ids.filter(x => x !== exiting.id))
          }, 300)
          return prev
        }
        return [{ id, question: userInput, answer: fallback }]
      })
    } finally {
      setIsLoading(false)
      setChatAnswering(false) // Reset chat answering state
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleRecording = () => {
    // Don't allow recording while transcribing
    if (isTranscribing) {
      return
    }
    
    if (!isRecording) {
      // Reset error states when starting fresh
      setShowNetworkError(false)
      
      // Check microphone permissions and start recording
      console.log('Starting audio recording...')
      startRecording()
    } else {
      // Stop recording
      console.log('Stopping audio recording...')
      stopRecording()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      {/* Ephemeral area above the chat bar: thinking + vertical answer bubbles */}
      {(isLoading || notifications.length > 0) && (
        <div className="fixed bottom-[80px] left-0 right-0 z-[60] px-4 pointer-events-none">
          <div className="max-w-2xl mx-auto relative space-y-2">
            {isLoading && (
              <div className="rounded-2xl bg-neutral-900/90 backdrop-blur border border-neutral-700/60 shadow-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
                <div className="p-2 rounded-full bg-neutral-800 text-neutral-200">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 text-neutral-300">
                  <span className="text-sm">CourtSide — Powered by Gemini is thinking</span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {notifications[0] && (
                <div
                  key={notifications[0].id}
                  className={`pointer-events-auto rounded-2xl bg-neutral-900/90 backdrop-blur border border-neutral-700/60 shadow-xl p-4 flex items-start gap-3 transition-all duration-300 ${exitingIds.includes(notifications[0].id) ? 'animate-out fade-out slide-out-to-top-2' : 'animate-in fade-in slide-in-from-bottom-2'}`}
                >
                  <div className="p-2 rounded-full bg-neutral-800 text-neutral-200">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-neutral-400 mb-1">CourtSide — Powered by Gemini</div>
                    <div className="text-sm text-neutral-100 font-medium">{notifications[0].question}</div>
                    <div className="text-sm text-neutral-300 mt-1 whitespace-pre-wrap">{notifications[0].answer}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const id = notifications[0].id
                      setExitingIds(ids => [...ids, id])
                      setTimeout(() => {
                        setNotifications([])
                        setExitingIds(ids => ids.filter(x => x !== id))
                      }, 300)
                    }}
                    className="text-neutral-400 hover:text-white hover:bg-neutral-800"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Chat Bar (compact, centered, no popup) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl bg-neutral-900 border border-neutral-600 px-3 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="flex-1 px-1">
                <Input
                  ref={inputRef}
                  placeholder={
                    isRecording ? 'Listening...' : 
                    isTranscribing ? 'Converting speech...' : 
                    'Ask anything'
                  }
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isRecording || isTranscribing || isLoading}
                  className="bg-transparent border-0 text-white placeholder:text-neutral-400 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0"
                />
              </div>

              {/* Action button: mic when empty, arrow when text */}
              <div className="pr-1">
                {inputValue.trim().length === 0 ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleRecording}
                    disabled={isLoading || isTranscribing}
                    className={`h-8 w-8 ${
                      isRecording
                        ? 'text-red-400 bg-red-900/20 animate-pulse'
                        : isTranscribing
                        ? 'text-blue-400 bg-blue-900/20 animate-pulse'
                        : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    onClick={() => handleSendMessage()}
                    disabled={isLoading}
                    className="h-8 w-8 rounded-full bg-neutral-200 text-neutral-900 hover:bg-white"
                    aria-label="Send"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {isRecording && (
            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-neutral-400">
              <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
              <span>Recording... Tap mic to stop</span>
            </div>
          )}
          
          {(status === 'stopping' || isTranscribing) && (
            <div className="mt-2 flex flex-col items-center justify-center gap-3 text-sm">
              {/* Main transcription indicator */}
              <div className="flex items-center gap-2 text-blue-400">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
                <span>Converting speech to text with AI...</span>
              </div>
              
              {/* Audio wave animation */}
              <div className="flex items-center gap-1">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 16 + 8}px`,
                      animationDelay: `${i * 100}ms`,
                      animationDuration: '1.5s'
                    }}
                  />
                ))}
              </div>
              
              {/* Progress text */}
              <div className="text-xs text-neutral-500">
                Please wait while we process your audio...
              </div>
            </div>
          )}
          
          {showNetworkError && (
            <div className="mt-2 flex flex-col items-center justify-center gap-2 text-sm text-red-400">
              <div className="flex items-center gap-2">
                <span>⚠️ Speech recognition unavailable due to network issues.</span>
                <button 
                  onClick={() => setShowNetworkError(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="text-xs text-neutral-500">
                Google's speech servers may be temporarily unreachable. Try typing your question instead.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind the chat bar and to give room for stacked messages */}
      <div className="h-20" />
    </>
  )
}
