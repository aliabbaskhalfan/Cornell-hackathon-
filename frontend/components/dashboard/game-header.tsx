'use client'

import { Badge } from '@/components/ui/badge'

interface Team {
  name: string
  shortName: string
  score: number
  logo?: string
  record: string
}

interface GameHeaderProps {
  homeTeam: Team
  awayTeam: Team
  gameStatus: string
  quarter: string
  timeRemaining: string
}

export function GameHeader({ homeTeam, awayTeam, gameStatus, quarter, timeRemaining }: GameHeaderProps) {
  const getTeamLogo = (teamCode: string) => {
    return `https://cdn.nba.com/logos/nba/${teamCode === 'GSW' ? '1610612744' : teamCode === 'LAL' ? '1610612747' : '1610612744'}/primary/L/logo.svg`
  }

  return (
    <div className="bg-neutral-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Away Team */}
          <div className="flex items-center space-x-4">
            <img 
              src={getTeamLogo(awayTeam.shortName)} 
              alt={awayTeam.shortName}
              className="w-20 h-20"
              onError={(e) => {
                e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="32" fill="#3B82F6"/><text x="40" y="50" text-anchor="middle" fill="white" font-size="16" font-weight="bold">${awayTeam.shortName}</text></svg>`)}`
              }}
            />
            <div>
              <h3 className="text-2xl font-bold text-white">{awayTeam.score}</h3>
              <p className="text-sm text-neutral-400">{awayTeam.record}</p>
            </div>
          </div>

          {/* Game Status */}
          <div className="text-center">
            <Badge variant={gameStatus === 'LIVE' ? 'destructive' : 'secondary'} className="text-sm mb-2">
              {gameStatus === 'LIVE' && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />}
              {gameStatus}
            </Badge>
            <p className="text-sm text-neutral-400">{quarter} • {timeRemaining}</p>
          </div>

          {/* Home Team */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <h3 className="text-2xl font-bold text-white">{homeTeam.score}</h3>
              <p className="text-sm text-neutral-400">{homeTeam.record}</p>
            </div>
            <img 
              src={getTeamLogo(homeTeam.shortName)} 
              alt={homeTeam.shortName}
              className="w-20 h-20"
              onError={(e) => {
                e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="32" fill="#EF4444"/><text x="40" y="50" text-anchor="middle" fill="white" font-size="16" font-weight="bold">${homeTeam.shortName}</text></svg>`)}`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
