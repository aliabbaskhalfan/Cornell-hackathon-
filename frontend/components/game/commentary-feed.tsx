'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Volume2 } from 'lucide-react'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface CommentaryFeedProps {
  gameId: string
}

export function CommentaryFeed({ gameId }: CommentaryFeedProps) {
  const [persona, setPersona] = useState('passionate')
  
  const { data: commentaryData, isLoading: commentaryLoading } = useQuery({
    queryKey: ['commentary-history', gameId],
    queryFn: () => api.getCommentaryHistory(gameId),
    refetchInterval: 5000,
  })

  const { mutate: emitCommentary, isPending: isEmitting } = useMutation({
    mutationFn: () => api.emitCommentary(gameId, 'generic', persona),
    onSuccess: () => {
      // Refetch commentary history
      queryClient.invalidateQueries({ queryKey: ['commentary-history', gameId] })
    },
  })

  if (commentaryLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    )
  }

  const commentary = commentaryData?.commentary || []

  const playAudio = (audioUrl: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play().catch(console.error)
    }
  }

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Live Commentary
          </h3>
          
          <div className="flex items-center space-x-2">
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-sm"
            >
              <option value="passionate">Passionate</option>
              <option value="nerdy">Nerdy</option>
              <option value="raw">Raw</option>
            </select>
            
            <Button
              size="sm"
              onClick={() => emitCommentary()}
              disabled={isEmitting}
            >
              <Play className="h-4 w-4 mr-2" />
              Generate Commentary
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {commentary.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                No commentary available yet
              </p>
              <Button onClick={() => emitCommentary()} disabled={isEmitting}>
                <Play className="h-4 w-4 mr-2" />
                Generate First Commentary
              </Button>
            </CardContent>
          </Card>
        ) : (
          commentary.map((item: any, index: number) => (
            <Card key={index} className="commentary-line">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-slate-900 dark:text-white mb-2">
                      {item.text}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <span className="capitalize">{item.persona}</span>
                      <span>•</span>
                      <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  
                  {item.audio_url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => playAudio(item.audio_url)}
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
