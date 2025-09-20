'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Volume2, VolumeX, Play, Pause, SkipForward } from 'lucide-react'

export function AudioControls() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(80)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)

  const togglePlayPause = () => {
    if (currentAudio) {
      if (isPlaying) {
        currentAudio.pause()
      } else {
        currentAudio.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (currentAudio) {
      currentAudio.volume = newVolume / 100
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-3">
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlayPause}
                disabled={!currentAudio}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <Button variant="ghost" size="icon">
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-3">
              <Volume2 className="h-4 w-4 text-slate-500" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-slate-500 w-8">{volume}</span>
            </div>
            
            <div className="text-sm text-slate-500">
              Live Commentary
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
