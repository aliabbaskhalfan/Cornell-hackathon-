'use client'

import { useState, useEffect, useRef } from 'react'
import { GameHeader } from './game-header'
import { Header } from '@/components/layout/header'
import { NBAStatsTable } from './nba-stats-table'
import { StatsFeed } from './stats-feed'
import { BottomChatBar } from './bottom-chat-bar'
import { api } from '@/lib/api'

interface GameData {
  homeTeam: {
    name: string
    shortName: string
    score: number
    record: string
  }
  awayTeam: {
    name: string
    shortName: string
    score: number
    record: string
  }
  gameStatus: string
  quarter: string
  timeRemaining: string
}

export function Dashboard() {
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMock, setIsMock] = useState(false)
  const [gameId, setGameId] = useState<string | null>(null)
  const [clockSeconds, setClockSeconds] = useState(12 * 60)
  const [quarterIndex, setQuarterIndex] = useState(0)
  const simTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastClockRef = useRef<number | null>(null)
  const lastQuarterRef = useRef<number | null>(null)
  const [scheduledPlays, setScheduledPlays] = useState<Array<{ quarter: number, at: number, team: string, points: number }>>([])
  const [homeAbbr, setHomeAbbr] = useState<string>('POR')
  const [awayAbbr, setAwayAbbr] = useState<string>('LAL')

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setLoading(true)
        // Always reset backend mock timer on page load to align clocks in demo
        try { await api.resetMockTimer() } catch {}
        const response = await api.getScoreboard()
        console.log('[Dashboard] /scoreboard', response)

        if (response.success && response.games.length > 0) {
          // Prefer a live game; if none, run mock simulation instead of showing Final
          const live = response.games.find((g: any) => g.status === 'InProgress')
          const game = live || response.games[0]

          // Always use mock mode when backend is using mock data (game_id indicates this)
          const isBackendMock = game.game_id === 'lakers_trailblazers_20250413'
          
          if (game.status === 'InProgress' && !isBackendMock) {
            // Real live game - use polling mode
            try {
              const snap = await api.getGameSnapshot(game.game_id)
              console.log('[Dashboard] live snapshot', { plays: snap?.play_by_play?.length, game: snap?.game })
              const gm = snap.game || snap.Game || {}
              setGameData({
                homeTeam: {
                  name: game.teams.home.name,
                  shortName: game.teams.home.abbreviation,
                  score: gm.HomeTeamScore ?? game.score?.home ?? 0,
                  record: ''
                },
                awayTeam: {
                  name: game.teams.away.name,
                  shortName: game.teams.away.abbreviation,
                  score: gm.AwayTeamScore ?? game.score?.away ?? 0,
                  record: ''
                },
                gameStatus: 'LIVE',
                quarter: (gm.Quarter ? `${gm.Quarter}st Quarter` : '1st Quarter'),
                timeRemaining: (gm.TimeRemainingMinutes != null && gm.TimeRemainingSeconds != null)
                  ? `${gm.TimeRemainingMinutes}:${String(gm.TimeRemainingSeconds).padStart(2, '0')}`
                  : (game.clock || '12:00')
              })
              setHomeAbbr(game.teams.home.abbreviation)
              setAwayAbbr(game.teams.away.abbreviation)
              setScheduledPlays([])
              setIsMock(false)
              setGameId(game.game_id)
            } catch {
              // Fallback to scoreboard data
              setGameData({
                homeTeam: {
                  name: game.teams.home.name,
                  shortName: game.teams.home.abbreviation,
                  score: game.score?.home ?? 0,
                  record: ''
                },
                awayTeam: {
                  name: game.teams.away.name,
                  shortName: game.teams.away.abbreviation,
                  score: game.score?.away ?? 0,
                  record: ''
                },
                gameStatus: 'LIVE',
                quarter: '1st Quarter',
                timeRemaining: game.clock || '12:00'
              })
              setIsMock(false)
              setGameId(game.game_id)
            }
          } else {
            // Start a fresh mock game instead of showing a finished one
            setGameData({
              homeTeam: {
                name: 'Portland Trail Blazers',
                shortName: 'POR',
                score: 0,
                record: '0-0'
              },
              awayTeam: {
                name: 'Los Angeles Lakers',
                shortName: 'LAL',
                score: 0,
                record: '0-0'
              },
              gameStatus: 'LIVE',
              quarter: '1st Quarter',
              timeRemaining: '12:00'
            })
            setClockSeconds(12 * 60)
            setQuarterIndex(0)
            setHomeAbbr('POR')
            setAwayAbbr('LAL')
            // Build a schedule from backend play-by-play for the known demo game (no random fallback)
            try {
              const snap = await api.getGameSnapshot(game.game_id || 'lakers_trailblazers_20250413')
              console.log('[Dashboard] mock snapshot', { plays: snap?.play_by_play?.length, game: snap?.game })
              const plays = (snap.play_by_play || []).map((p: any) => {
                const clockStr = p.Clock || p.clock || '12:00'
                const [m, s] = clockStr.split(':').map((x: string) => parseInt(x, 10))
                const at = isNaN(m) || isNaN(s) ? 12 * 60 : (m * 60 + s)
                const desc = p.Description || p.description || ''
                const lower = desc.toLowerCase()
                let points = 0
                if (lower.includes('3-pt') || lower.includes('3pt') || lower.includes('three')) points = 3
                else if (lower.includes('free throw')) points = 1
                else if (lower.includes('makes 2-pt') || lower.includes('2-pt') || lower.includes('layup') || lower.includes('dunk') || lower.includes('jumper')) points = 2
                const team = p.Team || p.team || 'UNK'
                return { quarter: (p.Period ?? p.period ?? 1) - 1, at, team, points }
              }).filter((x: any) => x.points > 0)
              setScheduledPlays(plays)

              // Align local clock/quarter to backend snapshot to avoid timeline drift
              const gm = snap.game || snap.Game || {}
              const tmin = gm.TimeRemainingMinutes ?? gm.timeRemainingMinutes
              const tsec = gm.TimeRemainingSeconds ?? gm.timeRemainingSeconds
              if (typeof tmin === 'number' && typeof tsec === 'number') {
                setClockSeconds((tmin * 60) + tsec)
              }
              const qraw = gm.Quarter ?? gm.quarter
              if (qraw != null) {
                const qidx = (typeof qraw === 'string' ? parseInt(qraw, 10) : qraw) - 1
                if (!isNaN(qidx)) setQuarterIndex(Math.max(0, Math.min(3, qidx)))
              }
            } catch (e) {
              setScheduledPlays([])
            }
            setIsMock(true)
            setGameId(game.game_id || 'lakers_trailblazers_20250413')
          }
        } else {
          // Fallback to mock data by hydrating from backend snapshot
          try {
            // Reset backend mock timer so clock starts at 12:00 on refresh
            try { await api.resetMockTimer() } catch {}
            const snap = await api.getGameSnapshot('lakers_trailblazers_20250413')
            const gm = snap.game || snap.Game || {}

            // Build schedule from play-by-play
            const plays = (snap.play_by_play || []).map((p: any) => {
              const clockStr = p.Clock || p.clock || '12:00'
              const [m, s] = clockStr.split(':').map((x: string) => parseInt(x, 10))
              const at = isNaN(m) || isNaN(s) ? 12 * 60 : (m * 60 + s)
              const desc = p.Description || p.description || ''
              const lower = desc.toLowerCase()
              let points = 0
              if (lower.includes('3-pt') || lower.includes('3pt') || lower.includes('three')) points = 3
              else if (lower.includes('free throw')) points = 1
              else if (lower.includes('makes 2-pt') || lower.includes('2-pt') || lower.includes('layup') || lower.includes('dunk') || lower.includes('jumper')) points = 2
              const team = p.Team || p.team || 'UNK'
              return { quarter: (p.Period ?? p.period ?? 1) - 1, at, team, points }
            }).filter((x: any) => x.points > 0)
            setScheduledPlays(plays)

            // Align clock/quarter and initial visible scores
            const tmin = gm.TimeRemainingMinutes ?? gm.timeRemainingMinutes ?? 12
            const tsec = gm.TimeRemainingSeconds ?? gm.timeRemainingSeconds ?? 0
            setClockSeconds((tmin * 60) + tsec)
            const qraw = gm.Quarter ?? gm.quarter ?? 1
            const qidx = (typeof qraw === 'string' ? parseInt(qraw, 10) : qraw) - 1
            setQuarterIndex(Math.max(0, Math.min(3, isNaN(qidx) ? 0 : qidx)))
            setHomeAbbr('POR')
            setAwayAbbr('LAL')

            setGameData({
              homeTeam: {
                name: 'Portland Trail Blazers',
                shortName: 'POR',
                score: gm.HomeTeamScore ?? 0,
                record: '0-0'
              },
              awayTeam: {
                name: 'Los Angeles Lakers',
                shortName: 'LAL',
                score: gm.AwayTeamScore ?? 0,
                record: '0-0'
              },
              gameStatus: 'LIVE',
              quarter: (gm.Quarter ? `${gm.Quarter}st Quarter` : '1st Quarter'),
              timeRemaining: `${tmin}:${String(tsec).padStart(2, '0')}`
            })
          } catch {
            // Minimal fallback
            setGameData({
              homeTeam: {
                name: 'Portland Trail Blazers',
                shortName: 'POR',
                score: 0,
                record: '0-0'
              },
              awayTeam: {
                name: 'Los Angeles Lakers',
                shortName: 'LAL',
                score: 0,
                record: '0-0'
              },
              gameStatus: 'LIVE',
              quarter: '1st Quarter',
              timeRemaining: '12:00'
            })
            setClockSeconds(12 * 60)
            setQuarterIndex(0)
          }
          setIsMock(true)
          setGameId('lakers_trailblazers_20250413')
        }
      } catch (err) {
        console.error('Error fetching game data:', err)
        setError('Failed to load game data')
        // Use fallback data (mock live simulation)
        setGameData({
          homeTeam: {
            name: 'Portland Trail Blazers',
            shortName: 'POR',
            score: 0,
            record: '0-0'
          },
          awayTeam: {
            name: 'Los Angeles Lakers',
            shortName: 'LAL',
            score: 0,
            record: '0-0'
          },
          gameStatus: 'LIVE',
          quarter: '1st Quarter',
          timeRemaining: '12:00'
        })
        setClockSeconds(12 * 60)
        setQuarterIndex(0)
        setIsMock(true)
        setGameId('lakers_trailblazers_20250413')
      } finally {
        setLoading(false)
      }
    }

    fetchGameData()
  }, [])

    // Live simulation driven strictly by schedule (no random scoring)
  useEffect(() => {
    if (!isMock || !gameData) return

    const formatClock = (totalSeconds: number) => {
      const minutes = Math.max(0, Math.floor(totalSeconds / 60))
      const seconds = Math.max(0, totalSeconds % 60)
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    const quarters = ['1st Quarter', '2nd Quarter', '3rd Quarter', '4th Quarter']

    if (simTimerRef.current) clearInterval(simTimerRef.current)

    simTimerRef.current = setInterval(() => {
      setClockSeconds(prev => {
        // Normal speed: 1 real second = 1 in-game second
        let next = prev - 1
        let advancedQuarter = false
        let resetGame = false

        if (next <= 0) {
          if (quarterIndex < 3) {
            // Move to next quarter
            next = 12 * 60
            setQuarterIndex(q => q + 1)
            advancedQuarter = true
          } else {
            // Loop game: reset to Q1
            next = 12 * 60
            setQuarterIndex(0)
            advancedQuarter = true
            resetGame = true
          }
        }

        // Score updates only from scheduled plays
        const from = lastClockRef.current ?? (12 * 60)
        const to = next
        const playsThisTick = scheduledPlays
          .filter(p => p.quarter === quarterIndex)
          .filter(p => p.at <= from && p.at > to)

        setGameData(current => {
          if (!current) return current

          let homeDelta = 0
          let awayDelta = 0
          if (playsThisTick.length > 0) {
            playsThisTick.forEach(p => {
              if (p.team === homeAbbr) homeDelta += p.points
              else if (p.team === awayAbbr) awayDelta += p.points
              // Unknown team ignored
            })
          }

          return {
            homeTeam: {
              ...current.homeTeam,
              score: resetGame ? 0 : current.homeTeam.score + homeDelta,
            },
            awayTeam: {
              ...current.awayTeam,
              score: resetGame ? 0 : current.awayTeam.score + awayDelta,
            },
            gameStatus: 'LIVE',
            quarter: resetGame
              ? quarters[0]
              : quarters[advancedQuarter ? Math.min(quarterIndex + 1, 3) : quarterIndex],
            timeRemaining: formatClock(next),
          }
        })

        lastClockRef.current = next
        lastQuarterRef.current = quarterIndex
        return next
      })
    }, 1000)

    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current)
    }
  }, [isMock, gameData, quarterIndex])

  // Live polling when not in mock mode: keep scores/clock fresh from backend
  useEffect(() => {
    if (isMock || !gameId) return
    const interval = setInterval(async () => {
      try {
        const snap = await api.getGameSnapshot(gameId)
        const gm = snap.game || snap.Game || {}
        setGameData(current => {
          if (!current) return current
          return {
            homeTeam: { ...current.homeTeam, score: gm.HomeTeamScore ?? current.homeTeam.score },
            awayTeam: { ...current.awayTeam, score: gm.AwayTeamScore ?? current.awayTeam.score },
            gameStatus: 'LIVE',
            quarter: (gm.Quarter ? `${gm.Quarter}st Quarter` : current.quarter),
            timeRemaining: (gm.TimeRemainingMinutes != null && gm.TimeRemainingSeconds != null)
              ? `${gm.TimeRemainingMinutes}:${String(gm.TimeRemainingSeconds).padStart(2, '0')}`
              : current.timeRemaining,
          }
        })
      } catch {}
    }, 3000)
    return () => clearInterval(interval)
  }, [isMock, gameId])

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading game data...</div>
      </div>
    )
  }

  // Do not block UI on error; we continue with mock/live data

  if (!gameData) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-white text-xl">No game data available</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      <Header onMenuClick={() => {}} selectedGame={null} />
      {/* Fixed Logo - Top Left */}
      <div className="fixed -top-8 -left-8 z-50">
        <img 
          src="/images/logo.png" 
          alt="CourtSide Logo" 
          className="h-48 w-auto object-contain"
        />
      </div>

      {/* Game Header - Google Sports Style */}
      <GameHeader 
        homeTeam={gameData.homeTeam}
        awayTeam={gameData.awayTeam}
        gameStatus={gameData.gameStatus}
        quarter={gameData.quarter}
        timeRemaining={gameData.timeRemaining}
      />

      {/* Main Content (scaled down slightly to give bottom chat room) */}
      <div className="max-w-full mx-auto px-6 mt-3">
        <div className="origin-top scale-[0.95] lg:scale-[0.95]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column - Player Stats */}
          <div className="lg:col-span-7 h-full">
            <div className="h-full rounded-xl border border-neutral-700/60 bg-neutral-900/50">
              <div className="px-4 py-3 border-b border-neutral-700/60">
                <h2 className="text-xl font-bold text-white">Player Statistics</h2>
              </div>
              <div className="p-4">
                <NBAStatsTable />
              </div>
            </div>
          </div>

          {/* Right Column - Live Updates */}
          <div className="lg:col-span-5 h-full">
            <div className="h-full rounded-xl border border-neutral-700/60 bg-neutral-900/50">
              <div className="px-4 py-3 border-b border-neutral-700/60">
                <h2 className="text-xl font-bold text-white">Live Updates</h2>
              </div>
              <div className="p-4">
                <StatsFeed clockSeconds={clockSeconds} quarterIndex={quarterIndex} />
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Bottom Chat Bar */}
      <BottomChatBar />
    </div>
  )
}
