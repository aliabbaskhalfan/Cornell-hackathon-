'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface BoxScoreProps {
  gameId: string
}

export function BoxScore({ gameId }: BoxScoreProps) {
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

  const boxScore = data?.box_score
  if (!boxScore || !boxScore.Players) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              No box score data available
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const players = boxScore.Players

  return (
    <div className="h-full overflow-y-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Box Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left p-2">Player</th>
                  <th className="text-center p-2">PTS</th>
                  <th className="text-center p-2">REB</th>
                  <th className="text-center p-2">AST</th>
                  <th className="text-center p-2">STL</th>
                  <th className="text-center p-2">BLK</th>
                  <th className="text-center p-2">TOV</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player: any, index: number) => (
                  <tr key={player.PlayerID || index} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="p-2">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {player.Name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {player.Team}
                        </p>
                      </div>
                    </td>
                    <td className="text-center p-2 font-medium">
                      {player.Points || 0}
                    </td>
                    <td className="text-center p-2">
                      {player.Rebounds || 0}
                    </td>
                    <td className="text-center p-2">
                      {player.Assists || 0}
                    </td>
                    <td className="text-center p-2">
                      {player.Steals || 0}
                    </td>
                    <td className="text-center p-2">
                      {player.Blocks || 0}
                    </td>
                    <td className="text-center p-2">
                      {player.Turnovers || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
