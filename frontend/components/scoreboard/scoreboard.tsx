'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GameCard } from './game-card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatScore, getGameStatus, getStatusColor } from '@/lib/utils'
import { api } from '@/lib/api'

interface ScoreboardProps {
  onGameSelect: (gameId: string) => void
}

export function Scoreboard({ onGameSelect }: ScoreboardProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['scoreboard'],
    queryFn: api.getScoreboard,
    refetchInterval: 5000, // Refetch every 5 seconds
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">Error loading games</p>
            <p className="text-sm text-slate-600">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const games = data?.games || []

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          NBA Scoreboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Live games and commentary • {games.length} games today
        </p>
      </div>

      {games.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              No games scheduled for today
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <GameCard
              key={game.game_id}
              game={game}
              onClick={() => onGameSelect(game.game_id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
