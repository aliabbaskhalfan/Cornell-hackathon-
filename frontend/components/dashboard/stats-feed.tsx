'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TrendingUp, TrendingDown, Clock, Zap } from 'lucide-react'
import { api } from '@/lib/api'

interface StatUpdate {
  id: string
  type: 'score' | 'stat' | 'milestone' | 'foul'
  player: string
  team: string
  description: string
  value?: string
  timestamp: Date
  isNew?: boolean
}

const initialStats: StatUpdate[] = []

interface StatsFeedProps {
  clockSeconds?: number
  quarterIndex?: number
}

export function StatsFeed({ clockSeconds, quarterIndex }: StatsFeedProps) {
  const [stats, setStats] = useState<StatUpdate[]>(initialStats)
  const [mounted, setMounted] = useState(false)
  const [gameId, setGameId] = useState<string | null>(null)
  const [roster, setRoster] = useState<Record<string, string>>({})
  const [useMock, setUseMock] = useState(false)
  const lastClockRef = useRef<number | null>(null)
  const lastQuarterRef = useRef<number | null>(null)
  const [schedule, setSchedule] = useState<Array<{ id: string; quarter: number; at: number; play: { player: string; team: string; description: string; value?: string; type: 'score' | 'stat' } }>>([])

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch initial game data
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await api.getScoreboard()
        if (response.success && response.games.length > 0) {
          const live = response.games.find((g: any) => g.status === 'InProgress')
          const game = live || response.games[0]
          const selectedGameId = game.game_id || game.gameId
          setGameId(selectedGameId)
          setUseMock(!live)
          try {
            const snap = await api.getGameSnapshot(selectedGameId)
            if (snap.success && snap.box_score) {
              const rawPlayers = snap.box_score.players || snap.box_score.Players || []
              const mapping: Record<string, string> = {}
              ;(rawPlayers as any[]).forEach((p: any) => {
                const id = String(p.playerId ?? p.PlayerID ?? '')
                const name = p.name ?? p.Name
                if (id && name) mapping[id] = name
              })
              setRoster(mapping)
            }
          } catch {}
        } else {
          setUseMock(true)
        }
      } catch (error) {
        console.error('Error fetching game data:', error)
        setUseMock(true)
      }
    }

    fetchGameData()
  }, [])

  const inferPointsFromDescription = (desc?: string): number => {
    if (!desc) return 0
    const d = desc.toLowerCase()
    if (d.includes('3-pt') || d.includes('3pt') || d.includes('three')) return 3
    if (d.includes('free throw')) return 1
    if (d.includes('2-pt') || d.includes('2pt') || d.includes('layup') || d.includes('dunk') || d.includes('jumper')) return 2
    return 0
  }

  const extractPlayerFromDescription = (desc?: string): string | null => {
    if (!desc) return null
    const markers = [' makes ', ' misses ', ' blocks ', ' steals ', ' assists ', ' with ', ' draws ', ' turnover', ' fouled']
    let idx = -1
    for (const m of markers) {
      const i = desc.indexOf(m)
      if (i !== -1) {
        idx = i
        break
      }
    }
    if (idx === -1) return null
    const candidate = desc.slice(0, idx).trim()
    if (candidate.length >= 3 && candidate.length <= 40) return candidate
    return null
  }

  // -------- Time-driven scheduling (prefer real data) --------
  const generateFallbackQuarterSchedule = (qIndex: number) => {
    // Fallback simple schedule every ~15s across 12 minutes
    const items: Array<{ id: string; quarter: number; at: number; play: { player: string; team: string; description: string; value?: string; type: 'score' | 'stat' } }> = []
    const templates = [
      { player: 'LeBron James', team: 'LAL', description: 'makes a driving layup', value: '+2', type: 'score' as const },
      { player: 'Anthony Davis', team: 'LAL', description: 'blocks the shot', type: 'stat' as const },
      { player: 'D\'Angelo Russell', team: 'LAL', description: 'hits a 3-pointer', value: '+3', type: 'score' as const },
      { player: 'Austin Reaves', team: 'LAL', description: 'records an assist', type: 'stat' as const },
      { player: 'Scoot Henderson', team: 'POR', description: 'drains a mid-range jumper', value: '+2', type: 'score' as const },
      { player: 'Anfernee Simons', team: 'POR', description: 'from deep for three', value: '+3', type: 'score' as const },
      { player: 'Jerami Grant', team: 'POR', description: 'blocks the layup', type: 'stat' as const },
      { player: 'Deandre Ayton', team: 'POR', description: 'putback dunk', value: '+2', type: 'score' as const },
    ]
    let t = 12 * 60
    while (t > 0) {
      const step = 12 + Math.floor(Math.random() * 9) // 12-20s
      t = Math.max(0, t - step)
      const tpl = templates[Math.floor(Math.random() * templates.length)]
      items.push({ id: `${qIndex}-${t}-${Math.random().toString(36).slice(2,7)}`, quarter: qIndex, at: t, play: tpl })
    }
    return items
  }

  // Reset schedule when entering mock mode or quarter changes
  useEffect(() => {
    if (!useMock) return
    const q = typeof quarterIndex === 'number' ? quarterIndex : 0
    const needs = !schedule.some(s => s.quarter === q) || lastQuarterRef.current !== q
    if (!needs) return

    const buildRealSchedule = async () => {
      try {
        const snap = await api.getGameSnapshot(gameId || 'lakers_trailblazers_20250413')
        const raw = snap.play_by_play || []
        const items: Array<{ id: string; quarter: number; at: number; play: { player: string; team: string; description: string; value?: string; type: 'score' | 'stat' } }> = []
        raw.forEach((p: any, idx: number) => {
          const desc = p.Description || p.description || ''
          const team = p.Team || p.team || 'UNK'
          const clockStr = p.Clock || p.clock || '12:00'
          const [m, s] = clockStr.split(':').map((x: string) => parseInt(x, 10))
          const at = isNaN(m) || isNaN(s) ? 12 * 60 : (m * 60 + s)
          const lower = desc.toLowerCase()
          let points = 0
          if (lower.includes('3-pt') || lower.includes('3pt') || lower.includes('three')) points = 3
          else if (lower.includes('free throw')) points = 1
          else if (lower.includes('makes 2-pt') || lower.includes('2-pt') || lower.includes('layup') || lower.includes('dunk') || lower.includes('jumper')) points = 2
          const playerName = p.PlayerName || p.playerName || extractPlayerFromDescription(desc) || 'Unknown Player'
          const type = points > 0 ? 'score' as const : 'stat' as const
          items.push({ id: String(p.PlayID ?? p.playId ?? `${p.Period}-${idx}`), quarter: (p.Period ?? p.period ?? 1) - 1, at, play: { player: playerName, team, description: desc, value: points ? `+${points}` : undefined, type } })
        })
        if (items.length > 0) {
          setSchedule(prev => prev.filter(s => s.quarter !== q).concat(items))
          lastQuarterRef.current = q
          lastClockRef.current = typeof clockSeconds === 'number' ? clockSeconds : 12 * 60
          return
        }
      } catch {}
      // Fallback to synthetic schedule for this quarter
      const next = generateFallbackQuarterSchedule(q)
      setSchedule(prev => prev.filter(s => s.quarter !== q).concat(next))
      lastQuarterRef.current = q
      lastClockRef.current = typeof clockSeconds === 'number' ? clockSeconds : 12 * 60
    }

    buildRealSchedule()
  }, [useMock, quarterIndex, gameId])

  // Drive plays by countdown clock when in mock mode
  useEffect(() => {
    if (!useMock) return
    if (typeof clockSeconds !== 'number') return
    const q = typeof quarterIndex === 'number' ? quarterIndex : 0
    if (lastClockRef.current == null) lastClockRef.current = clockSeconds

    const from = lastClockRef.current
    const to = clockSeconds
    // Trigger plays whose at is between to..from (since clock counts down)
    const toEmit = schedule
      .filter(s => s.quarter === q)
      .filter(s => s.at <= from && s.at > to)
      .sort((a, b) => b.at - a.at)

    if (toEmit.length > 0) {
      toEmit.forEach(s => {
        const newStat: StatUpdate = {
          id: s.id,
          type: s.play.type,
          player: s.play.player,
          team: s.play.team,
          description: s.play.description,
          value: s.play.value,
          timestamp: new Date(),
          isNew: true
        }
        setStats(prev => {
          const exists = prev.some(p => p.id === newStat.id)
          if (exists) return prev
          const updated = [newStat, ...prev.slice(0, 19)]
          setTimeout(() => {
            setStats(current => current.map(p => p.id === newStat.id ? { ...p, isNew: false } : p))
          }, 3000)
          return updated
        })
      })
    }

    lastClockRef.current = clockSeconds
  }, [clockSeconds, useMock, schedule, quarterIndex])

  useEffect(() => {
    const interval = setInterval(async () => {
      if (gameId && !useMock) {
        try {
          // Fetch play-by-play data from backend
          const gameSnapshot = await api.getGameSnapshot(gameId)
          // Refresh roster opportunistically if present
          if (gameSnapshot.success && gameSnapshot.box_score) {
            const rawPlayers = gameSnapshot.box_score.players || gameSnapshot.box_score.Players || []
            if (rawPlayers && (rawPlayers as any[]).length > 0) {
              const mapping: Record<string, string> = { ...roster }
              ;(rawPlayers as any[]).forEach((p: any) => {
                const id = String(p.playerId ?? p.PlayerID ?? '')
                const name = p.name ?? p.Name
                if (id && name) mapping[id] = name
              })
              setRoster(mapping)
            }
          }
          if (gameSnapshot.success && gameSnapshot.play_by_play) {
            const recentPlays = gameSnapshot.play_by_play.slice(-5) // Get last 5 plays
            
            recentPlays.forEach((play: any) => {
              const description = play.Description || play.description || play.playText || 'Play occurred'
              const points = play.points ?? inferPointsFromDescription(description)
              const pid = String(play.PlayerID ?? play.playerId ?? '')
              const parsedName = extractPlayerFromDescription(description)
              const playerName = roster[pid] || play.PlayerName || play.playerName || parsedName || 'Unknown Player'
              const team = play.Team || play.team || 'UNK'
              const newStat: StatUpdate = {
                id: String(play.PlayID ?? play.playId ?? Date.now()),
                type: points > 0 ? 'score' : 'stat',
                player: playerName,
                team,
                description,
                value: points ? `+${points}` : '',
                timestamp: new Date(),
                isNew: true
              }

              setStats(prevStats => {
                // Check if this play already exists
                const exists = prevStats.some(stat => stat.id === newStat.id)
                if (!exists) {
                  const updated = [newStat, ...prevStats.slice(0, 19)] // Keep only 20 most recent
                  // Remove the "new" flag after 3 seconds
                  setTimeout(() => {
                    setStats(current => 
                      current.map(stat => 
                        stat.id === newStat.id ? { ...stat, isNew: false } : stat
                      )
                    )
                  }, 3000)
                  
                  return updated
                }
                return prevStats
              })
            })
          }
        } catch (error) {
          console.error('Error fetching play-by-play data:', error)
        }
      } else {
        // In mock mode, scheduling is driven by the game clock above; nothing to do on interval
      }
    }, 5000) // Check for updates every 5 seconds

    return () => clearInterval(interval)
  }, [gameId])

  const getStatIcon = (type: string) => {
    switch (type) {
      case 'score':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'stat':
        return <Zap className="h-4 w-4 text-blue-500" />
      case 'milestone':
        return <TrendingUp className="h-4 w-4 text-purple-500" />
      case 'foul':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getTeamColor = (team: string) => {
    const colors: { [key: string]: string } = {
      'GSW': 'bg-blue-100 text-blue-800',
      'LAL': 'bg-purple-100 text-purple-800',
      'POR': 'bg-red-100 text-red-800',
      'MIL': 'bg-green-100 text-green-800',
      'BOS': 'bg-green-100 text-green-800',
      'DAL': 'bg-blue-100 text-blue-800'
    }
    return colors[team] || 'bg-gray-100 text-gray-800'
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return `${Math.floor(diff / 3600)}h ago`
  }

  return (
    <div className="space-y-4">

      <div className="h-[600px] border border-transparent rounded-lg">
        <ScrollArea className="h-full">
          <div className="space-y-0">
            {stats.map((stat, index) => (
              <div
                key={stat.id}
                className={`py-4 px-4 h-[52px] transition-all duration-500 ease-in-out hover:bg-neutral-800/30 ${
                  index === stats.length - 1 ? '' : 'border-b border-neutral-800'
                } ${
                  stat.isNew 
                    ? 'bg-yellow-900/20 border-l-2 border-l-yellow-500' 
                    : ''
                }`}
                style={{
                  animation: stat.isNew ? 'slideDown 0.5s ease-out' : undefined
                }}
              >
              <div className="flex items-center justify-between w-full h-full">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <span className="font-medium text-white text-sm w-48 truncate">{stat.player}</span>
                  <Badge variant="outline" className={`${getTeamColor(stat.team)} text-xs flex-shrink-0`}>
                    {stat.team}
                  </Badge>
                  <span className="text-neutral-300 flex-shrink-0 text-sm">-</span>
                  <span className="text-neutral-300 flex-1 min-w-0 text-sm">{stat.description}</span>
                  {stat.value && (
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {stat.value}
                    </Badge>
                  )}
                  <span className="text-xs text-neutral-500 flex-shrink-0 w-16 text-right">
                    {mounted ? formatTime(stat.timestamp) : 'now'}
                  </span>
                </div>
              </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
