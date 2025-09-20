'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TrendingUp, TrendingDown, Clock, Zap } from 'lucide-react'

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

const initialStats: StatUpdate[] = [
  {
    id: '1',
    type: 'score',
    player: 'Stephen Curry',
    team: 'GSW',
    description: '3-pointer made',
    value: '+3',
    timestamp: new Date('2024-01-15T20:30:00Z')
  },
  {
    id: '2',
    type: 'stat',
    player: 'LeBron James',
    team: 'LAL',
    description: 'Assist',
    value: '7 AST',
    timestamp: new Date('2024-01-15T20:29:00Z')
  },
  {
    id: '3',
    type: 'stat',
    player: 'Anthony Davis',
    team: 'LAL',
    description: 'Block',
    value: '4 BLK',
    timestamp: new Date('2024-01-15T20:28:00Z')
  }
]

export function StatsFeed() {
  const [stats, setStats] = useState<StatUpdate[]>(initialStats)
  const [mounted, setMounted] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const newUpdates = [
        'made a 3-pointer',
        'recorded an assist',
        'grabbed a rebound',
        'made a steal',
        'blocked a shot',
        'committed a foul',
        'made a free throw',
        'scored 2 points'
      ]
      
      const players = ['Stephen Curry', 'LeBron James', 'Giannis Antetokounmpo', 'Jayson Tatum', 'Luka Dončić']
      const teams = ['GSW', 'LAL', 'MIL', 'BOS', 'DAL']
      
      const randomPlayer = players[Math.floor(Math.random() * players.length)]
      const randomTeam = teams[Math.floor(Math.random() * teams.length)]
      const randomUpdate = newUpdates[Math.floor(Math.random() * newUpdates.length)]
      
      const newStat: StatUpdate = {
        id: Date.now().toString(),
        type: Math.random() > 0.7 ? 'score' : 'stat',
        player: randomPlayer,
        team: randomTeam,
        description: randomUpdate,
        value: Math.random() > 0.5 ? `+${Math.floor(Math.random() * 3) + 1}` : '',
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
    }, 4000) // New update every 4 seconds

    return () => clearInterval(interval)
  }, [])

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
