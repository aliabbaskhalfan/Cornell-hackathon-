'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { GameTicker } from './game-ticker'
import { BoxScore } from './box-score'
import { CommentaryFeed } from './commentary-feed'
import { GameHeader } from './game-header'

interface GameViewProps {
  gameId: string
  onBack: () => void
}

export function GameView({ gameId, onBack }: GameViewProps) {
  const [activeTab, setActiveTab] = useState<'ticker' | 'boxscore' | 'commentary'>('ticker')

  return (
    <div className="h-full flex flex-col">
      {/* Game Header */}
      <GameHeader gameId={gameId} onBack={onBack} />
      
      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-2">
        <div className="flex space-x-1">
          <Button
            variant={activeTab === 'ticker' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('ticker')}
          >
            Live Ticker
          </Button>
          <Button
            variant={activeTab === 'boxscore' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('boxscore')}
          >
            Box Score
          </Button>
          <Button
            variant={activeTab === 'commentary' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('commentary')}
          >
            Commentary
          </Button>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'ticker' && <GameTicker gameId={gameId} />}
        {activeTab === 'boxscore' && <BoxScore gameId={gameId} />}
        {activeTab === 'commentary' && <CommentaryFeed gameId={gameId} />}
      </div>
    </div>
  )
}
