'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { api } from '@/lib/api'

interface PlayerStats {
  id: string
  name: string
  team: string
  position: string
  points: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  fg_percentage: number
  three_point_percentage: number
  minutes: number
  fouls: number
  isNew?: boolean
}

const mockPlayerStats: PlayerStats[] = [
  // Lakers (LAL) - 5 players
  {
    id: '1',
    name: 'LeBron James',
    team: 'LAL',
    position: 'SF',
    points: 28,
    rebounds: 8,
    assists: 7,
    steals: 2,
    blocks: 1,
    fg_percentage: 52.3,
    three_point_percentage: 38.5,
    minutes: 36,
    fouls: 2
  },
  {
    id: '2',
    name: 'Anthony Davis',
    team: 'LAL',
    position: 'PF',
    points: 24,
    rebounds: 11,
    assists: 3,
    steals: 1,
    blocks: 4,
    fg_percentage: 48.9,
    three_point_percentage: 31.2,
    minutes: 34,
    fouls: 3
  },
  {
    id: '3',
    name: 'D\'Angelo Russell',
    team: 'LAL',
    position: 'PG',
    points: 18,
    rebounds: 3,
    assists: 8,
    steals: 2,
    blocks: 0,
    fg_percentage: 43.7,
    three_point_percentage: 39.8,
    minutes: 32,
    fouls: 2
  },
  {
    id: '4',
    name: 'Austin Reaves',
    team: 'LAL',
    position: 'SG',
    points: 12,
    rebounds: 4,
    assists: 5,
    steals: 1,
    blocks: 0,
    fg_percentage: 46.2,
    three_point_percentage: 35.4,
    minutes: 28,
    fouls: 1
  },
  {
    id: '5',
    name: 'Christian Wood',
    team: 'LAL',
    position: 'C',
    points: 8,
    rebounds: 6,
    assists: 2,
    steals: 0,
    blocks: 2,
    fg_percentage: 51.8,
    three_point_percentage: 33.9,
    minutes: 22,
    fouls: 4
  },
  // Trail Blazers (POR) - 5 players
  {
    id: '6',
    name: 'Scoot Henderson',
    team: 'POR',
    position: 'PG',
    points: 22,
    rebounds: 4,
    assists: 8,
    steals: 2,
    blocks: 0,
    fg_percentage: 45.1,
    three_point_percentage: 35.8,
    minutes: 34,
    fouls: 2
  },
  {
    id: '7',
    name: 'Anfernee Simons',
    team: 'POR',
    position: 'SG',
    points: 24,
    rebounds: 3,
    assists: 4,
    steals: 1,
    blocks: 0,
    fg_percentage: 44.2,
    three_point_percentage: 39.1,
    minutes: 35,
    fouls: 2
  },
  {
    id: '8',
    name: 'Jerami Grant',
    team: 'POR',
    position: 'PF',
    points: 19,
    rebounds: 6,
    assists: 3,
    steals: 1,
    blocks: 1,
    fg_percentage: 47.3,
    three_point_percentage: 37.6,
    minutes: 33,
    fouls: 3
  },
  {
    id: '9',
    name: 'Matisse Thybulle',
    team: 'POR',
    position: 'SF',
    points: 8,
    rebounds: 4,
    assists: 2,
    steals: 2,
    blocks: 1,
    fg_percentage: 43.2,
    three_point_percentage: 35.1,
    minutes: 28,
    fouls: 2
  },
  {
    id: '10',
    name: 'Deandre Ayton',
    team: 'POR',
    position: 'C',
    points: 16,
    rebounds: 12,
    assists: 1,
    steals: 0,
    blocks: 1,
    fg_percentage: 59.4,
    three_point_percentage: 0.0,
    minutes: 32,
    fouls: 3
  }
]

export function NBAStatsTable() {
  const [stats, setStats] = useState<PlayerStats[]>([])
  const [isLive, setIsLive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [gameId, setGameId] = useState<string | null>(null)

  // Fetch initial game data and stats
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setLoading(true)
        const response = await api.getScoreboard()
        
        if (response.success && response.games.length > 0) {
          const game = response.games.find((g: any) => g.status === 'InProgress') || response.games[0]
          const selectedGameId = game.game_id || game.gameId
          setGameId(selectedGameId)

          // Fetch game snapshot for player stats
          const gameSnapshot = await api.getGameSnapshot(selectedGameId)
          if (gameSnapshot.success && gameSnapshot.box_score) {
            const rawPlayers = gameSnapshot.box_score.players || gameSnapshot.box_score.Players || []
            const playerStats = (rawPlayers as any[]).map((player: any) => ({
              id: player.playerId ?? player.PlayerID ?? String(Math.random()),
              name: player.name ?? player.Name ?? 'Unknown Player',
              team: player.team ?? player.Team ?? 'UNK',
              position: player.position ?? player.Position ?? 'N/A',
              points: player.points ?? player.Points ?? 0,
              rebounds: player.rebounds ?? player.Rebounds ?? 0,
              assists: player.assists ?? player.Assists ?? 0,
              steals: player.steals ?? player.Steals ?? 0,
              blocks: player.blocks ?? player.Blocks ?? 0,
              fg_percentage: player.fieldGoalPercentage ?? player.FieldGoalsPercentage ?? 0,
              three_point_percentage: player.threePointPercentage ?? player.ThreePointersPercentage ?? 0,
              minutes: player.minutes ?? player.Minutes ?? 0,
              fouls: player.fouls ?? player.PersonalFouls ?? 0
            })) || []
            
            setStats(playerStats)
          } else {
            // Fallback to mock data
            setStats(mockPlayerStats)
          }
        } else {
          // Fallback to mock data (LAL vs POR)
          setStats(mockPlayerStats)
        }
      } catch (error) {
        console.error('Error fetching game data:', error)
        // Fallback to mock data (LAL vs POR)
        setStats(mockPlayerStats)
      } finally {
        setLoading(false)
      }
    }

    fetchGameData()
  }, [])

  // Simulate live updates - one player at a time
  useEffect(() => {
    if (!isLive || !gameId) return

    const interval = setInterval(async () => {
      try {
        // Try backend snapshot; if it fails, simulate random updates
        const result = await api.getGameSnapshot(gameId).catch(() => null)
        if (result && result.success && result.box_score) {
          const rawPlayers = result.box_score.players || result.box_score.Players || []
          const freshStats = (rawPlayers as any[]).map((player: any) => ({
            id: player.playerId ?? player.PlayerID ?? String(Math.random()),
            name: player.name ?? player.Name ?? 'Unknown Player',
            team: player.team ?? player.Team ?? 'UNK',
            position: player.position ?? player.Position ?? 'N/A',
            points: player.points ?? player.Points ?? 0,
            rebounds: player.rebounds ?? player.Rebounds ?? 0,
            assists: player.assists ?? player.Assists ?? 0,
            steals: player.steals ?? player.Steals ?? 0,
            blocks: player.blocks ?? player.Blocks ?? 0,
            fg_percentage: player.fieldGoalPercentage ?? player.FieldGoalsPercentage ?? 0,
            three_point_percentage: player.threePointPercentage ?? player.ThreePointersPercentage ?? 0,
            minutes: player.minutes ?? player.Minutes ?? 0,
            fouls: player.fouls ?? player.PersonalFouls ?? 0
          })) || []

          setStats(prevStats => {
            const updatedStats = freshStats.map(freshPlayer => {
              const prevPlayer = prevStats.find(p => p.id === freshPlayer.id)
              if (prevPlayer) {
                const hasChanges = (
                  freshPlayer.points !== prevPlayer.points ||
                  freshPlayer.rebounds !== prevPlayer.rebounds ||
                  freshPlayer.assists !== prevPlayer.assists ||
                  freshPlayer.steals !== prevPlayer.steals ||
                  freshPlayer.blocks !== prevPlayer.blocks ||
                  freshPlayer.fg_percentage !== prevPlayer.fg_percentage ||
                  freshPlayer.three_point_percentage !== prevPlayer.three_point_percentage ||
                  freshPlayer.minutes !== prevPlayer.minutes ||
                  freshPlayer.fouls !== prevPlayer.fouls
                )
                return hasChanges ? { ...freshPlayer, isNew: true } : freshPlayer
              }
              return freshPlayer
            })

            setTimeout(() => {
              setStats(current => current.map(p => ({ ...p, isNew: false })))
            }, 2000)

            return updatedStats
          })
        } else {
          // Mock: randomly update one player's stats to simulate live
          setStats(prev => {
            if (prev.length === 0) return prev
            const index = Math.floor(Math.random() * prev.length)
            const deltaPoints = Math.random() < 0.5 ? 2 : 3
            const updated = prev.map((p, i) => {
              if (i !== index) return p
              return {
                ...p,
                points: p.points + deltaPoints,
                rebounds: Math.random() < 0.15 ? p.rebounds + 1 : p.rebounds,
                assists: Math.random() < 0.2 ? p.assists + 1 : p.assists,
                isNew: true
              }
            })
            setTimeout(() => {
              setStats(current => current.map(p => ({ ...p, isNew: false })))
            }, 2000)
            return updated
          })
        }
      } catch (error) {
        console.error('Error fetching live stats:', error)
      }
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [isLive, gameId])

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'PG': return 'bg-blue-100 text-blue-800'
      case 'SG': return 'bg-green-100 text-green-800'
      case 'SF': return 'bg-yellow-100 text-yellow-800'
      case 'PF': return 'bg-orange-100 text-orange-800'
      case 'C': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTeamColor = (team: string) => {
    const teamColors: { [key: string]: string } = {
      'LAL': 'bg-purple-100 text-purple-800',
      'GSW': 'bg-blue-100 text-blue-800',
      'POR': 'bg-red-100 text-red-800',
      'MIL': 'bg-green-100 text-green-800',
      'BOS': 'bg-green-100 text-green-800',
      'DAL': 'bg-blue-100 text-blue-800',
    }
    return teamColors[team] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-[600px] border border-transparent rounded-lg overflow-hidden flex items-center justify-center">
          <div className="text-white text-lg">Loading player stats...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      <div className="h-[600px] border border-transparent rounded-lg overflow-hidden flex flex-col">
        <div className="flex-1 w-full">
          <Table className="w-full table-fixed h-full">
            <TableHeader className="bg-neutral-900">
              <TableRow className="border-b border-neutral-800 hover:bg-transparent">
                <TableHead className="text-neutral-400 font-medium w-48">Player</TableHead>
                <TableHead className="text-neutral-400 font-medium w-20">Team</TableHead>
                <TableHead className="text-neutral-400 font-medium w-16">Pos</TableHead>
                <TableHead className="text-neutral-400 font-medium text-right w-16">PTS</TableHead>
                <TableHead className="text-neutral-400 font-medium text-right w-16">REB</TableHead>
                <TableHead className="text-neutral-400 font-medium text-right w-16">AST</TableHead>
                <TableHead className="text-neutral-400 font-medium text-right w-16">STL</TableHead>
                <TableHead className="text-neutral-400 font-medium text-right w-16">BLK</TableHead>
                <TableHead className="text-neutral-400 font-medium text-right w-16">FG%</TableHead>
                <TableHead className="text-neutral-400 font-medium text-right w-16">3P%</TableHead>
                <TableHead className="text-neutral-400 font-medium text-right w-16">MIN</TableHead>
                <TableHead className="text-neutral-400 font-medium text-right w-16">PF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="h-full">
              {stats.map((player, index) => (
                <TableRow 
                  key={player.id} 
                  className={`transition-all duration-500 ease-in-out h-[52px] ${
                    index === stats.length - 1 ? '' : 'border-b border-neutral-800'
                  } ${
                    player.isNew 
                      ? 'bg-yellow-900/20 border-l-2 border-l-yellow-500 shadow-md' 
                      : 'hover:bg-neutral-800/50'
                  }`}
                  style={{
                    animation: player.isNew ? 'slideDown 0.5s ease-out' : undefined
                  }}
                >
                <TableCell className="font-medium text-white truncate">{player.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getTeamColor(player.team)}>
                    {player.team}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getPositionColor(player.position)}>
                    {player.position}
                  </Badge>
                </TableCell>
                  <TableCell className="text-right font-semibold text-white">{player.points}</TableCell>
                  <TableCell className="text-right text-neutral-300">{player.rebounds}</TableCell>
                  <TableCell className="text-right text-neutral-300">{player.assists}</TableCell>
                  <TableCell className="text-right text-neutral-300">{player.steals}</TableCell>
                  <TableCell className="text-right text-neutral-300">{player.blocks}</TableCell>
                  <TableCell className="text-right text-neutral-300">{player.fg_percentage}%</TableCell>
                  <TableCell className="text-right text-neutral-300">{player.three_point_percentage}%</TableCell>
                  <TableCell className="text-right text-neutral-300">{player.minutes}</TableCell>
                  <TableCell className="text-right text-neutral-300">{player.fouls}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
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
