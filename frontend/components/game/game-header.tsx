'use client'

import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { formatScore, getGameStatus, getStatusColor } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface GameHeaderProps {
  gameId: string
  onBack: () => void
}

export function GameHeader({ gameId, onBack }: GameHeaderProps) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['game-snapshot', gameId],
    queryFn: () => api.getGameSnapshot(gameId),
    refetchInterval: 3000, // Refetch every 3 seconds
  })

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Scoreboard
          </Button>
          <LoadingSpinner size="sm" />
        </div>
      </div>
    )
  }

  const game = data?.game
  if (!game) {
    return (
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Scoreboard
          </Button>
          <p className="text-red-600">Game not found</p>
        </div>
      </div>
    )
  }

  const status = getGameStatus(game.Status)
  const statusColor = getStatusColor(game.Status)
  const score = formatScore(game.HomeTeamScore, game.AwayTeamScore)

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Scoreboard
        </Button>
        
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Away Team
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {game.AwayTeamScore}
                </p>
              </div>
              
              <div className="text-center">
                <p className={`text-sm font-medium ${statusColor}`}>
                  {status}
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {score}
                </p>
                {game.Clock && (
                  <p className="text-xs text-slate-500">
                    {game.Clock}
                  </p>
                )}
              </div>
              
              <div className="text-left">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Home Team
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {game.HomeTeamScore}
                </p>
              </div>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
