'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatScore, getGameStatus, getStatusColor } from '@/lib/utils'
import { Clock, Users } from 'lucide-react'

interface Game {
  game_id: string
  league: string
  status: string
  clock: string
  score: {
    home: number
    away: number
  }
  teams: {
    home: {
      id: string
      name: string
      abbreviation: string
    }
    away: {
      id: string
      name: string
      abbreviation: string
    }
  }
  updated_at: string
}

interface GameCardProps {
  game: Game
  onClick: () => void
}

export function GameCard({ game, onClick }: GameCardProps) {
  const status = getGameStatus(game.status)
  const statusColor = getStatusColor(game.status)
  const score = formatScore(game.score.home, game.score.away)

  return (
    <Card 
      className="game-card cursor-pointer hover:shadow-lg transition-all duration-200"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${statusColor}`}>
            {status}
          </span>
          {game.status === 'InProgress' && (
            <div className="flex items-center space-x-1 text-sm text-slate-600">
              <Clock className="h-4 w-4" />
              <span>{game.clock}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {game.teams.away.abbreviation.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {game.teams.away.name}
                </p>
                <p className="text-xs text-slate-500">
                  {game.teams.away.abbreviation}
                </p>
              </div>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {game.score.away}
            </span>
          </div>
          
          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {game.teams.home.abbreviation.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {game.teams.home.name}
                </p>
                <p className="text-xs text-slate-500">
                  {game.teams.home.abbreviation}
                </p>
              </div>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {game.score.home}
            </span>
          </div>
          
          {/* Game Info */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Game {game.game_id}</span>
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>Live Commentary</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
