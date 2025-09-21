'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { GameCard } from '@/components/scoreboard/game-card'
import { Header } from '@/components/layout/header'

interface StaticGame {
  game_id: string
  league: string
  status: 'InProgress' | 'Final' | 'Scheduled'
  clock: string
  score: { home: number; away: number }
  teams: {
    home: { id: string; name: string; abbreviation: string }
    away: { id: string; name: string; abbreviation: string }
  }
  updated_at: string
}

export default function DashboardPage() {
  const games: StaticGame[] = useMemo(() => [
    {
      game_id: 'lakers_trailblazers_20250413',
      league: 'NBA',
      status: 'Scheduled',
      clock: 'Starting Soon',
      score: { home: 0, away: 0 },
      teams: {
        home: { id: 'POR', name: 'Portland Trail Blazers', abbreviation: 'POR' },
        away: { id: 'LAL', name: 'Los Angeles Lakers', abbreviation: 'LAL' },
      },
      updated_at: new Date().toISOString(),
    },
    {
      game_id: 'bos_mia_20250413',
      league: 'NBA',
      status: 'Final',
      clock: '',
      score: { home: 104, away: 109 },
      teams: {
        home: { id: 'BOS', name: 'Boston Celtics', abbreviation: 'BOS' },
        away: { id: 'MIA', name: 'Miami Heat', abbreviation: 'MIA' },
      },
      updated_at: new Date().toISOString(),
    },
    {
      game_id: 'nyk_bkn_20250413',
      league: 'NBA',
      status: 'Final',
      clock: '',
      score: { home: 98, away: 101 },
      teams: {
        home: { id: 'NYK', name: 'New York Knicks', abbreviation: 'NYK' },
        away: { id: 'BKN', name: 'Brooklyn Nets', abbreviation: 'BKN' },
      },
      updated_at: new Date().toISOString(),
    },
  ], [])

  return (
    <div className="min-h-screen bg-neutral-900">
      <Header onMenuClick={() => {}} selectedGame={null} />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">NBA Games</h1>
          <p className="text-slate-600 dark:text-slate-400">Live and final games</p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game, idx) => {
          const isLakers = game.game_id === 'lakers_trailblazers_20250413'
          const card = (
            <GameCard key={game.game_id} game={game as any} onClick={() => {}} disabled={!isLakers} />
          )
          return isLakers ? (
            <Link key={game.game_id} href={`/dashboard/${game.game_id}`}>{card}</Link>
          ) : (
            <div key={game.game_id}>{card}</div>
          )
        })}
      </div>
      </div>
    </div>
  )
}
