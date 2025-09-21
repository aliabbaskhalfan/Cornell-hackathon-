'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, MicOff, Volume2 } from 'lucide-react'
import { api } from '@/lib/api'
import { useChat } from '@/components/providers/chat-provider'

interface VoiceQAProps {
  gameId?: string | null
}

export function VoiceQA({ gameId }: VoiceQAProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  
  // Use chat context to notify other components when processing voice queries
  const { setChatAnswering } = useChat()

  useEffect(() => {
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
    setChatAnswering(true) // Notify other components that voice query is being processed
    try {
      const result = await api.processVoiceQuery(transcript, gameId || undefined)
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
      setChatAnswering(false) // Reset chat answering state
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
      <Card className="w-80">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                Voice Q&A
              </h3>
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
                  <p className="font-medium">Response:</p>
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
