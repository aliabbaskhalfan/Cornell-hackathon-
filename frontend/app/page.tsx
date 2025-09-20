'use client'

import { useState } from 'react'
import { Scoreboard } from '@/components/scoreboard/scoreboard'
import { GameView } from '@/components/game/game-view'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { AudioControls } from '@/components/audio/audio-controls'
import { VoiceQA } from '@/components/voice/voice-qa'

export default function HomePage() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          selectedGame={selectedGame}
        />
        
        <main className="flex-1 overflow-hidden">
          {selectedGame ? (
            <GameView 
              gameId={selectedGame} 
              onBack={() => setSelectedGame(null)}
            />
          ) : (
            <Scoreboard onGameSelect={setSelectedGame} />
          )}
        </main>
        
        {/* Audio Controls */}
        <AudioControls />
        
        {/* Voice Q&A */}
        <VoiceQA gameId={selectedGame} />
      </div>
    </div>
  )
}
