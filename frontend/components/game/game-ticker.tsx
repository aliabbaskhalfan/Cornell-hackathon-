'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatTime } from '@/lib/utils'

interface GameTickerProps {
  gameId: string
}

export function GameTicker({ gameId }: GameTickerProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['game-snapshot', gameId],
    queryFn: () => api.getGameSnapshot(gameId),
    refetchInterval: 3000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    )
  }

  const playByPlay = data?.play_by_play || []

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Live Play-by-Play
        </h3>
        
        {playByPlay.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-slate-600 dark:text-slate-400">
                No play-by-play data available
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {playByPlay.slice(-10).reverse().map((play: any, index: number) => (
              <Card key={play.PlayID || index} className="score-ticker">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {play.Description}
                      </p>
                      {play.PlayerID && (
                        <p className="text-xs text-slate-500">
                          Player ID: {play.PlayerID}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p>Q{play.Period}</p>
                      <p>{formatTime(play.Clock)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
