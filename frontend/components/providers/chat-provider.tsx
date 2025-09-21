'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ChatContextType {
  isChatAnswering: boolean
  setChatAnswering: (answering: boolean) => void
}

const ChatContext = createContext<ChatContextType>({
  isChatAnswering: false,
  setChatAnswering: () => {},
})

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isChatAnswering, setIsChatAnswering] = useState(false)

  const setChatAnswering = (answering: boolean) => {
    setIsChatAnswering(answering)
  }

  return (
    <ChatContext.Provider value={{ isChatAnswering, setChatAnswering }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
