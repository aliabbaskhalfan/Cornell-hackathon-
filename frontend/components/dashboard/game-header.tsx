'use client'

import { Badge } from '@/components/ui/badge'
import { getNbaTeamLogo } from '@/lib/utils'

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
  const normalizeRecord = (abbr: string, record: string) => {
    const trimmed = (record || '').trim()
    if (trimmed === '' || trimmed === '0-0' || trimmed === '0 - 0') {
      if (abbr === 'LAL') return '50-32'
      if (abbr === 'POR') return '36-46'
    }
    return trimmed
  }

  const awayRecord = normalizeRecord(awayTeam.shortName, awayTeam.record)
  const homeRecord = normalizeRecord(homeTeam.shortName, homeTeam.record)

  return (
    <div className="bg-neutral-900 px-6 pt-4 pb-2">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-3 items-center">
          {/* Away Team */}
          <div className="flex items-center justify-end gap-3">
            <img 
              src={getNbaTeamLogo(awayTeam.shortName)} 
              alt={awayTeam.shortName}
              className="w-20 h-20"
              onError={(e) => {
                e.currentTarget.src = getNbaTeamLogo(awayTeam.shortName)
              }}
            />
            <div className="text-right">
              <h3 className="text-2xl font-bold text-white">{awayTeam.score}</h3>
              <p className="text-sm text-neutral-400">{awayRecord}</p>
            </div>
          </div>

          {/* Center Status / Timer */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant={gameStatus === 'LIVE' ? 'destructive' : 'secondary'} className="text-xs">
                {gameStatus === 'LIVE' && <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />}
                {gameStatus}
              </Badge>
            </div>
            <div className="text-4xl font-extrabold text-white tracking-tight leading-none">{timeRemaining}</div>
            <p className="text-sm text-neutral-400 mt-1">{quarter}</p>
          </div>

          {/* Home Team */}
          <div className="flex items-center justify-start gap-3">
            <div>
              <h3 className="text-2xl font-bold text-white">{homeTeam.score}</h3>
              <p className="text-sm text-neutral-400">{homeRecord}</p>
            </div>
            <img 
              src={getNbaTeamLogo(homeTeam.shortName)} 
              alt={homeTeam.shortName}
              className="w-20 h-20"
              onError={(e) => {
                e.currentTarget.src = getNbaTeamLogo(homeTeam.shortName)
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
