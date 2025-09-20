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
        const response = await api.getScoreboard()

        if (response.success && response.games.length > 0) {
          // Prefer a live game; if none, run mock simulation instead of showing Final
          const live = response.games.find((g: any) => g.status === 'InProgress')
          const game = live || response.games[0]

          if (game.status === 'InProgress') {
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
              quarter: game.quarter || '1st Quarter',
              timeRemaining: game.clock || '12:00'
            })
            setHomeAbbr(game.teams.home.abbreviation)
            setAwayAbbr(game.teams.away.abbreviation)
            setScheduledPlays([])
            setIsMock(false)
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
            // Build a real schedule from backend play-by-play for the known demo game
            try {
              const snap = await api.getGameSnapshot(game.game_id || 'lakers_trailblazers_20250413')
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
            } catch (e) {
              setScheduledPlays([])
            }
            setIsMock(true)
          }
        } else {
          // Fallback to mock data if no games available
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
      } finally {
        setLoading(false)
      }
    }

    fetchGameData()
  }, [])

  // Live simulation driven by schedule when available; otherwise simple mock
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

        // Score updates from scheduled plays if present; fallback to random
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
          } else {
            // Fallback minimal random scoring if no schedule exists
            const shouldScore = scheduledPlays.length === 0 && Math.random() < (advancedQuarter ? 0 : 0.2)
            if (shouldScore) {
              const isThree = Math.random() < 0.38
              const points = isThree ? 3 : Math.random() < 0.15 ? 1 : 2
              const favorHome = current.homeTeam.score <= current.awayTeam.score ? 0.56 : 0.44
              if (Math.random() < favorHome) homeDelta = points
              else awayDelta = points
            }
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

      {/* Main Content */}
      <div className="max-w-full mx-auto px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Player Stats */}
          <div className="lg:col-span-7">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Player Statistics</h2>
            </div>
            <NBAStatsTable />
          </div>

          {/* Right Column - Live Updates */}
          <div className="lg:col-span-5">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Live Updates</h2>
            </div>
            <StatsFeed clockSeconds={clockSeconds} quarterIndex={quarterIndex} />
          </div>
        </div>
      </div>

      {/* Bottom Chat Bar */}
      <BottomChatBar />
    </div>
  )
}
