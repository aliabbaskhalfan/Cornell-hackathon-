'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Settings, User, Volume2 } from 'lucide-react'
import { useState } from 'react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [persona, setPersona] = useState('passionate')
  const [voice, setVoice] = useState('female')
  const [humorLevel, setHumorLevel] = useState(5)

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 z-50 transform transition-transform duration-300 ease-in-out">
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Settings
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="space-y-6">
            {/* Commentary Persona */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Commentary Style</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Persona</label>
                  <select 
                    value={persona}
                    onChange={(e) => setPersona(e.target.value)}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-sm"
                  >
                    <option value="passionate">Passionate</option>
                    <option value="nerdy">Nerdy</option>
                    <option value="raw">Raw</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Voice</label>
                  <select 
                    value={voice}
                    onChange={(e) => setVoice(e.target.value)}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-sm"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Humor Level: {humorLevel}</label>
                  <input 
                    type="range"
                    min="1"
                    max="10"
                    value={humorLevel}
                    onChange={(e) => setHumorLevel(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Audio Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Audio Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Commentary Volume</span>
                  <Volume2 className="h-4 w-4 text-slate-500" />
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="80"
                  className="w-full"
                />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Background Music</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </CardContent>
            </Card>
            
            {/* User Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Sports Fan</p>
                    <p className="text-xs text-slate-500">Default User</p>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
