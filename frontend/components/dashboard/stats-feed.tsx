'use client'

import { useState, useEffect, useRef } from 'react'
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

// Helper function to determine event type from play description for more specific commentary
function getEventTypeFromDescription(description: string): string {
  const desc = description.toLowerCase()
  
  if (desc.includes('3pt') || desc.includes('3-pt') || desc.includes('three')) {
    return desc.includes('miss') ? 'missed_three' : 'made_three'
  }
  if (desc.includes('free throw')) {
    return desc.includes('miss') ? 'missed_free_throw' : 'made_free_throw'
  }
  if (desc.includes('dunk')) {
    return 'dunk'
  }
  if (desc.includes('layup')) {
    return desc.includes('miss') ? 'missed_layup' : 'made_layup'
  }
  if (desc.includes('rebound')) {
    return 'rebound'
  }
  if (desc.includes('steal')) {
    return 'steal'
  }
  if (desc.includes('block')) {
    return 'block'
  }
  if (desc.includes('turnover')) {
    return 'turnover'
  }
  if (desc.includes('foul')) {
    return 'foul'
  }
  if (desc.includes('timeout')) {
    return 'timeout'
  }
  if (desc.includes('jump ball')) {
    return 'jump_ball'
  }
  if (desc.includes('q1 start') || desc.includes('q2 start') || desc.includes('q3 start') || desc.includes('q4 start')) {
    return 'quarter_start'
  }
  
  return 'generic'
}

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

  const areRostersEqual = (a: Record<string, string>, b: Record<string, string>) => {
    const ak = Object.keys(a)
    const bk = Object.keys(b)
    if (ak.length !== bk.length) return false
    for (const k of ak) {
      if (a[k] !== b[k]) return false
    }
    return true
  }

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
    
    // Try to extract player name from common NBA play-by-play patterns
    // Pattern 1: "Player Name 25' 3PT Jump Shot (3 PTS)"
    // Pattern 2: "Player Name REBOUND (Off:1 Def:0)"
    // Pattern 3: "Player Name Free Throw 1 of 2 (1 PTS)"
    
    // Handle special non-player events first
    if (desc.includes('Q1 start') || desc.includes('Q2 start') || desc.includes('Q3 start') || desc.includes('Q4 start')) {
      return 'Game Official'
    }
    
    // Handle jump ball: "Jump Ball Clingan vs. Len: Tip to Camara"
    const jumpBallMatch = desc.match(/^Jump Ball\s+(\w+(?:\s+\w+)?)\s+vs\.\s+(\w+(?:\s+\w+)?):?\s*(?:Tip to\s+(\w+(?:\s+\w+)?))?/i)
    if (jumpBallMatch) {
      // Return the player who got the tip, or the first player mentioned
      return jumpBallMatch[3] || jumpBallMatch[1] || 'Center'
    }
    
    // Handle team rebounds: "Lakers Rebound", "TRAIL BLAZERS Rebound"
    if (desc.includes('Rebound') && (desc.includes('Lakers') || desc.includes('TRAIL BLAZERS') || desc.includes('POR') || desc.includes('LAL'))) {
      return 'Team'
    }
    
    // Handle timeouts: "Lakers Timeout: Regular", "TRAIL BLAZERS Timeout: Regular"
    if (desc.includes('Timeout:')) {
      return 'Coach'
    }

    // First, handle common patterns by looking for name before specific actions
    const actionPatterns = [
      // Handle MISS shots: "MISS Murray 6' Driving Layup"
      /^MISS\s+(\w+(?:\s+\w+)?)\s+\d+['']?\s+.*(?:Jump Shot|Layup|Dunk|Hook Shot)/i,
      // Handle made shots: "Murray 6' Driving Layup (2 PTS)"
      /^(\w+(?:\s+\w+)?)\s+\d+['']?\s+.*(?:Jump Shot|Layup|Dunk|Hook Shot)/i,
      // Handle rebounds: "Murray REBOUND (Off:0 Def:1)"
      /^(\w+(?:\s+\w+)?)\s+REBOUND/i,
      // Handle free throws: "Walker Free Throw 1 of 2"
      /^(\w+(?:\s+\w+)?)\s+Free Throw/i,
      // Handle fouls and defensive plays: "Koloko S.FOUL", "Murray BLOCK"
      /^(\w+(?:\s+\w+)?)\s+(?:STEAL|BLOCK|S\.FOUL|P\.FOUL|L\.B\.FOUL)/i,
      // Handle turnovers: "Goodwin Bad Pass Turnover", "Knecht Traveling Turnover"
      /^(\w+(?:\s+\w+)?)\s+(?:Bad Pass|Traveling|Out of Bounds).*Turnover/i,
      // Handle substitutions: "SUB: Rupert FOR Thybulle"
      /^SUB:\s+(\w+(?:\s+\w+)?)\s+FOR/i,
      // Handle violations: "Goodwin Violation:Kicked Ball"
      /^(\w+(?:\s+\w+)?)\s+Violation/i
    ]
    
    for (const pattern of actionPatterns) {
      const match = desc.match(pattern)
      if (match && match[1]) {
        const name = match[1].trim()
        if (name.length >= 3 && name.length <= 30 && !name.includes('MISS')) {
          return name
        }
      }
    }
    
    // Fallback: try original logic with more markers, handling MISS prefix
    let workingDesc = desc
    if (desc.startsWith('MISS ')) {
      workingDesc = desc.substring(5) // Remove "MISS " prefix
    }
    
    const markers = [' makes ', ' misses ', ' blocks ', ' steals ', ' assists ', ' with ', ' draws ', ' turnover', ' fouled', ' REBOUND', ' Free Throw', ' STEAL', ' BLOCK', ' FOUL']
    let idx = -1
    for (const m of markers) {
      const i = workingDesc.indexOf(m)
      if (i !== -1) {
        idx = i
        break
      }
    }
    if (idx === -1) return null
    const candidate = workingDesc.slice(0, idx).trim()
    if (candidate.length >= 3 && candidate.length <= 30) return candidate
    return null
  }

  // -------- Time-driven scheduling (prefer real data) --------

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
      // No fallback: rely solely on backend play-by-play
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
    const fetchAndAppend = async () => {
      if (gameId) {
        try {
          // Fetch play-by-play data from backend
          const gameSnapshot = await api.getGameSnapshot(gameId)
          console.log('[StatsFeed] snapshot', {
            success: gameSnapshot?.success,
            plays: Array.isArray(gameSnapshot?.play_by_play) ? gameSnapshot.play_by_play.length : 'n/a',
            clock: gameSnapshot?.game?.TimeRemainingMinutes + ':' + String(gameSnapshot?.game?.TimeRemainingSeconds).padStart(2, '0')
          })
          // Refresh roster opportunistically if present
          if (gameSnapshot.success && gameSnapshot.box_score) {
            const rawPlayers = gameSnapshot.box_score.players || gameSnapshot.box_score.Players || []
            if (rawPlayers && (rawPlayers as any[]).length > 0) {
              const mapping: Record<string, string> = {}
              ;(rawPlayers as any[]).forEach((p: any) => {
                const id = String(p.playerId ?? p.PlayerID ?? '')
                const name = p.name ?? p.Name
                if (id && name) mapping[id] = name
              })
              setRoster(mapping)
            }
          }
          if (gameSnapshot.success && gameSnapshot.play_by_play) {
            // Filter plays that should be visible based on game clock progression
            const gm = gameSnapshot.game || gameSnapshot.Game || {}
            const currentRemaining = (gm.TimeRemainingMinutes ?? 12) * 60 + (gm.TimeRemainingSeconds ?? 0)
            
            // Show plays that have already happened (clock time > current remaining time)
            const visiblePlays = gameSnapshot.play_by_play.filter((play: any) => {
              const clockStr = play.Clock || play.clock || '12:00'
              const [m, s] = clockStr.split(':').map((x: string) => parseInt(x, 10))
              const playRemaining = isNaN(m) || isNaN(s) ? 12 * 60 : (m * 60 + s)
              return playRemaining > currentRemaining
            })
            
            console.log('[StatsFeed] filtering plays', { 
              total: gameSnapshot.play_by_play.length,
              visible: visiblePlays.length,
              currentRemaining,
              firstPlay: visiblePlays[0]?.Clock,
              lastPlay: visiblePlays[visiblePlays.length - 1]?.Clock
            })
            
            // Take the most recent 10 visible plays to avoid overwhelming the feed
            const recentPlays = visiblePlays.slice(-10)
            
            // Generate Gemini commentary for each play
            for (const play of recentPlays) {
              const description = play.Description || play.description || play.playText || 'Play occurred'
              const points = play.points ?? play.Points ?? inferPointsFromDescription(description)
              const pid = String(play.PlayID ?? play.playId ?? Date.now())
              
              // Check if this play already exists
              const exists = stats.some(stat => stat.id === pid)
              if (!exists) {
                try {
                  // Determine specific event type from play description
                  const eventType = getEventTypeFromDescription(description)
                  
                  // Get user context (could be from localStorage or props in a real app)
                  const userContext = {
                    interests: ['basketball', 'lakers', 'trail blazers'],
                    preferences: { style: 'exciting' }
                  }
                  
                  // Generate natural commentary using Gemini with the actual play description
                  const commentaryResponse = await api.emitCommentary(gameId, eventType, 'passionate', description, userContext)
                  
                  if (commentaryResponse.success && commentaryResponse.commentary) {
                    // Extract text from commentary response object
                    const commentaryText = typeof commentaryResponse.commentary === 'string' 
                      ? commentaryResponse.commentary 
                      : commentaryResponse.commentary.text || 'Commentary generated'
                    
                    const newStat: StatUpdate = {
                      id: pid,
                      type: points > 0 ? 'score' : 'stat',
                      player: '', // No player name needed for commentary
                      team: '', // No team needed for commentary
                      description: commentaryText,
                      value: '',
                      timestamp: new Date(),
                      isNew: true
                    }

                    setStats(prevStats => {
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
                    })
                  }
                } catch (error) {
                  console.error('[StatsFeed] Error generating commentary:', error)
                  // Fallback to original play description if commentary fails
                  const parsedName = extractPlayerFromDescription(description)
                  const playerName = roster[pid] || play.PlayerName || play.playerName || parsedName || 'Unknown Player'
                  const team = play.Team || play.team || 'UNK'
                  
                  const newStat: StatUpdate = {
                    id: pid,
                    type: points > 0 ? 'score' : 'stat',
                    player: playerName,
                    team,
                    description,
                    value: points ? `+${points}` : '',
                    timestamp: new Date(),
                    isNew: true
                  }

                  setStats(prevStats => {
                    const updated = [newStat, ...prevStats.slice(0, 19)]
                    setTimeout(() => {
                      setStats(current => 
                        current.map(stat => 
                          stat.id === newStat.id ? { ...stat, isNew: false } : stat
                        )
                      )
                    }, 3000)
                    
                    return updated
                  })
                }
              }
            }
          }
        } catch (error) {
          console.error('[StatsFeed] Error fetching play-by-play data:', error)
        }
      }
    }

    // Polling interval only (avoid immediate rapid loops on mount)
    const interval = setInterval(fetchAndAppend, 5000)
    return () => clearInterval(interval)
  }, [gameId, useMock])

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

      <div className="h-[520px] border border-transparent rounded-lg">
        <ScrollArea className="h-full">
          <div className="space-y-0 text-xs">
            {stats.map((stat, index) => (
              <div
                key={stat.id}
                className={`py-3 px-3 h-[44px] transition-all duration-500 ease-in-out hover:bg-neutral-800/30 ${
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
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {/* Show player/team info only for non-commentary updates */}
                  {stat.player && (
                    <>
                      <span className="font-medium text-white text-xs w-40 truncate">{stat.player}</span>
                      <Badge variant="outline" className={`${getTeamColor(stat.team)} text-[10px] py-0.5 px-1 flex-shrink-0`}>
                        {stat.team}
                      </Badge>
                      <span className="text-neutral-300 flex-shrink-0 text-xs">-</span>
                    </>
                  )}
                  {/* Commentary text spans full width with special styling */}
                  <span className={`flex-1 min-w-0 text-xs ${!stat.player ? 'font-medium text-yellow-200 leading-relaxed' : 'text-neutral-300'}`}>
                    {stat.description}
                  </span>
                  {stat.value && (
                    <Badge variant="secondary" className="text-[10px] py-0.5 px-1 flex-shrink-0">
                      {stat.value}
                    </Badge>
                  )}
                  <span className="text-[10px] text-neutral-500 flex-shrink-0 w-14 text-right">
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
