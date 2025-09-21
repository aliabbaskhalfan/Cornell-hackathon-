'use client'

import { Button } from '@/components/ui/button'
import { Menu, Volume2, VolumeX, User } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface HeaderProps {
  onMenuClick: () => void
  selectedGame?: string | null
}

export function Header({ onMenuClick, selectedGame }: HeaderProps) {
  const [audioEnabled, setAudioEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    try {
      const stored = localStorage.getItem('speak_live_updates')
      if (stored == null) {
        localStorage.setItem('speak_live_updates', 'true')
        return true
      }
      return stored === 'true'
    } catch {
      return true
    }
  })

  return (
    <header className="bg-blue-600 border-b border-blue-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden text-white hover:bg-blue-700 hover:text-blue-100 active:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 select-none"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white border-2 border-orange-500 hover:border-orange-400 hover:bg-orange-50 active:bg-orange-100 transition-all duration-200 rounded-lg flex items-center justify-center shadow-sm cursor-pointer select-none">
              <span className="text-orange-600 hover:text-orange-700 font-bold text-sm transition-colors">🏀</span>
            </div>
            <h1 className="text-xl font-bold text-white select-none">
              CourtSide
            </h1>
          </div>
          
          {selectedGame && (
            <div className="hidden md:flex items-center space-x-2 text-sm text-blue-100 select-none">
              <span>•</span>
              <span>Game {selectedGame}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const next = !audioEnabled
              setAudioEnabled(next)
              try { localStorage.setItem('speak_live_updates', String(next)) } catch {}
            }}
            className="bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50 hover:border-orange-400 hover:text-orange-700 active:bg-orange-100 active:border-orange-600 active:text-orange-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 rounded-full transition-all duration-200 select-none"
          >
            {audioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>

          <Link href="/dashboard/profile" className="ml-1">
            <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2 bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50 hover:border-orange-400 hover:text-orange-700 active:bg-orange-100 active:border-orange-600 active:text-orange-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 transition-all duration-200 select-none">
              <User className="h-4 w-4" />
              Profile
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
