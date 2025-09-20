'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Mic, MicOff, Send, Bot, User, MessageCircle, ChevronUp, Plus, Globe, Megaphone, AppWindow, Circle, AudioWaveform } from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function BottomChatBar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I\'m your NBA assistant. Ask me anything about the current game stats, players, or strategies!',
      timestamp: new Date('2024-01-15T20:30:00Z')
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Based on the current stats, LeBron is having a great game with excellent court vision!",
        "Stephen Curry is shooting lights out from three-point range tonight!",
        "Giannis is dominating both ends of the court with his athleticism.",
        "The pace of this game is really picking up in this quarter.",
        "That's an interesting observation about the defensive matchups.",
        "Looking at the recent plays, I can see the momentum shifting."
      ]

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
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
      {/* Styled Bottom Chat Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Main Search Bar Container */}
          <div className="rounded-2xl bg-neutral-900 px-3 py-2 shadow-lg">
            <div className="flex items-center space-x-2">
              {/* Input Section */}
              <div className="flex-1 px-4">
                <Input
                  placeholder={isRecording ? "Listening..." : "Ask anything"}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isRecording || isLoading}
                  onFocus={() => setIsExpanded(true)}
                  className="bg-transparent border-0 text-white placeholder:text-neutral-400 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0"
                />
              </div>

              {/* Voice Button Only */}
              <div className="flex items-center space-x-1 pr-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleRecording}
                  className={`h-8 w-8 ${
                    isRecording 
                      ? "text-red-400 bg-red-900/20 animate-pulse" 
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                  }`}
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Recording Status */}
          {isRecording && (
            <div className="mt-2 flex items-center justify-center space-x-2 text-sm text-neutral-400">
              <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
              <span>Recording... Click mic to stop</span>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Chat Dialog */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-4xl w-full h-[70vh] p-0 bg-neutral-900/95 backdrop-blur-md border-neutral-700/50 shadow-2xl">
          <div className="flex flex-col h-full">
            <DialogHeader className="p-4 border-b border-neutral-700/30">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-neutral-300" />
                <DialogTitle className="text-white">NBA Assistant</DialogTitle>
                <Badge variant="secondary" className="text-xs bg-neutral-800/60 text-neutral-300 border-neutral-600/50">
                  AI Powered
                </Badge>
              </div>
              <p className="text-sm text-neutral-400 text-left">
                Ask questions about live game stats and analysis
              </p>
            </DialogHeader>

            {/* Messages */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex items-start space-x-2 max-w-[70%] ${
                        message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div
                        className={`p-2 rounded-full flex-shrink-0 ${
                          message.type === 'user'
                            ? 'bg-neutral-700/80 text-white backdrop-blur-sm'
                            : 'bg-neutral-800/60 text-neutral-300 backdrop-blur-sm'
                        }`}
                      >
                        {message.type === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div
                        className={`p-3 rounded-lg backdrop-blur-sm ${
                          message.type === 'user'
                            ? 'bg-neutral-700/80 text-white border border-neutral-600/30'
                            : 'bg-neutral-800/60 text-white border border-neutral-700/30'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.type === 'user'
                              ? 'text-neutral-300'
                              : 'text-neutral-400'
                          }`}
                        >
                          {mounted ? formatTime(message.timestamp) : 'Just now'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2 max-w-[70%]">
                      <div className="p-2 rounded-full bg-neutral-800/60 text-neutral-300 backdrop-blur-sm">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="p-3 rounded-lg bg-neutral-800/60 backdrop-blur-sm border border-neutral-700/30">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add bottom padding to prevent content from being hidden behind the chat bar */}
      <div className="h-20" />
    </>
  )
}
