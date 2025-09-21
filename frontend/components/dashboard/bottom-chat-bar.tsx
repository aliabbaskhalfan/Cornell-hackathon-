'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mic, ArrowUp, Bot, X } from 'lucide-react'
import { api } from '@/lib/api'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  audioUrl?: string
}

export function BottomChatBar() {
  const [inputValue, setInputValue] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState<Array<{ id: string; question: string; answer: string }>>([])
  const [exitingIds, setExitingIds] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const [mounted, setMounted] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Focus input on mount for quick typing
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userInput = inputValue
    setInputValue('')
    setIsLoading(true)

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
      const userContext = { user_id: userId || undefined, preferences }

      // Process voice query with backend
      const response = await api.processVoiceQuery(
        userInput,
        undefined, // gameId - backend can infer or ignore
        persona, // supported persona
        userContext // user context with nested preferences
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
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    
    if (!isRecording) {
      // Start recording
      console.log('Starting voice recording...')
      
      // Simulate voice recording
      setTimeout(() => {
        setIsRecording(false)
        setInputValue('What are the key stats from this quarter?')
      }, 3000)
    } else {
      // Stop recording
      console.log('Stopping voice recording...')
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
                  <span className="text-sm">Courtside — Powered by Gemini is thinking</span>
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
                    <div className="text-xs text-neutral-400 mb-1">Courtside — Powered by Gemini</div>
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
                  placeholder={isRecording ? 'Listening...' : 'Ask anything'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isRecording || isLoading}
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
                    disabled={isLoading}
                    className={`h-8 w-8 ${
                      isRecording
                        ? 'text-red-400 bg-red-900/20 animate-pulse'
                        : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
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
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind the chat bar and to give room for stacked messages */}
      <div className="h-40" />
    </>
  )
}
