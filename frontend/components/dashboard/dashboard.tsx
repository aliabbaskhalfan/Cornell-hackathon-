'use client'

import { GameHeader } from './game-header'
import { NBAStatsTable } from './nba-stats-table'
import { StatsFeed } from './stats-feed'
import { BottomChatBar } from './bottom-chat-bar'

export function Dashboard() {
  // Mock game data - replace with real API data
  const gameData = {
    homeTeam: {
      name: 'Los Angeles Lakers',
      shortName: 'LAL',
      score: 108,
      record: '45-37'
    },
    awayTeam: {
      name: 'Golden State Warriors',
      shortName: 'GSW',
      score: 112,
      record: '44-38'
    },
    gameStatus: 'LIVE',
    quarter: '4th Quarter',
    timeRemaining: '2:45'
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Game Header - Google Sports Style */}
      <GameHeader 
        homeTeam={gameData.homeTeam}
        awayTeam={gameData.awayTeam}
        gameStatus={gameData.gameStatus}
        quarter={gameData.quarter}
        timeRemaining={gameData.timeRemaining}
      />

      {/* Main Content */}
      <div className="max-w-full mx-auto px-6 pb-6">
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column - Player Stats */}
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Player Statistics</h2>
            </div>
            <NBAStatsTable />
          </div>

          {/* Right Column - Live Updates */}
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Live Updates</h2>
            </div>
            <StatsFeed />
          </div>
        </div>
      </div>

      {/* Bottom Chat Bar */}
      <BottomChatBar />
    </div>
  )
}
