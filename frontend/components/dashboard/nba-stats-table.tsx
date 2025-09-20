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

// Mock NBA player stats data - replace with real API data
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
  // Warriors (GSW) - 5 players
  {
    id: '6',
    name: 'Stephen Curry',
    team: 'GSW',
    position: 'PG',
    points: 32,
    rebounds: 4,
    assists: 9,
    steals: 3,
    blocks: 0,
    fg_percentage: 47.8,
    three_point_percentage: 42.1,
    minutes: 38,
    fouls: 3
  },
  {
    id: '7',
    name: 'Klay Thompson',
    team: 'GSW',
    position: 'SG',
    points: 22,
    rebounds: 5,
    assists: 3,
    steals: 1,
    blocks: 1,
    fg_percentage: 44.5,
    three_point_percentage: 40.3,
    minutes: 33,
    fouls: 2
  },
  {
    id: '8',
    name: 'Draymond Green',
    team: 'GSW',
    position: 'PF',
    points: 6,
    rebounds: 9,
    assists: 7,
    steals: 2,
    blocks: 1,
    fg_percentage: 38.9,
    three_point_percentage: 28.7,
    minutes: 35,
    fouls: 5
  },
  {
    id: '9',
    name: 'Andrew Wiggins',
    team: 'GSW',
    position: 'SF',
    points: 16,
    rebounds: 6,
    assists: 2,
    steals: 1,
    blocks: 0,
    fg_percentage: 47.3,
    three_point_percentage: 34.8,
    minutes: 31,
    fouls: 2
  },
  {
    id: '10',
    name: 'Kevon Looney',
    team: 'GSW',
    position: 'C',
    points: 4,
    rebounds: 8,
    assists: 1,
    steals: 0,
    blocks: 1,
    fg_percentage: 64.2,
    three_point_percentage: 0.0,
    minutes: 24,
    fouls: 3
  }
]

export function NBAStatsTable() {
  const [stats, setStats] = useState<PlayerStats[]>(mockPlayerStats)
  const [isLive, setIsLive] = useState(true)

  // Simulate live updates - one player at a time
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      // Pick a random player to update
      const randomPlayerIndex = Math.floor(Math.random() * stats.length)
      
      setStats(prevStats => 
        prevStats.map((player, index) => {
          if (index === randomPlayerIndex) {
            const updatedPlayer = {
              ...player,
              points: player.points + Math.floor(Math.random() * 3),
              rebounds: player.rebounds + Math.floor(Math.random() * 2),
              assists: player.assists + Math.floor(Math.random() * 2),
              isNew: true // Mark as new for animation
            }
            
            // Remove the "new" flag after animation duration
            setTimeout(() => {
              setStats(current => 
                current.map(p => 
                  p.id === player.id ? { ...p, isNew: false } : p
                )
              )
            }, 2000)
            
            return updatedPlayer
          }
          return player
        })
      )
    }, 3000) // Update every 3 seconds

    return () => clearInterval(interval)
  }, [isLive, stats.length])

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
      'MIL': 'bg-green-100 text-green-800',
      'BOS': 'bg-green-100 text-green-800',
      'DAL': 'bg-blue-100 text-blue-800',
    }
    return teamColors[team] || 'bg-gray-100 text-gray-800'
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
