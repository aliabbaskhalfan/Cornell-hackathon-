'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { OnboardingData, NBATeam } from '@/types/onboarding'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { NBA_TEAMS } from '@/data/nba-teams'

const defaultPrefs: Partial<OnboardingData> = {}

export default function ProfilePage() {
  const [prefs, setPrefs] = useState<Partial<OnboardingData>>(defaultPrefs)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getUserPreferences()
        if (res.success) {
          setPrefs(res.preferences || {})
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const update = (updates: Partial<OnboardingData>) => {
    setPrefs(prev => ({ ...(prev || {}), ...updates }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await api.saveUserPreferences(prefs)
      if (res.success) setMessage('Saved')
    } catch (e) {
      const err: any = e
      const reason = err?.response?.data?.error || err?.message || 'Unknown error'
      console.error('Failed to save preferences:', err)
      setMessage(`Failed to save: ${reason}`)
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-white">Loading preferences…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Profile & Preferences</h1>

        <div className="space-y-6">
          {/* Favorite Team */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-xl font-semibold text-white">Favorite Team</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Select
                  value={(prefs.favoriteTeam as NBATeam | null)?.id ?? 'neutral'}
                  onValueChange={(val) => {
                    if (val === 'neutral') {
                      update({ favoriteTeam: null })
                    } else {
                      const team = NBA_TEAMS.find(t => t.id === val) || null
                      update({ favoriteTeam: team })
                    }
                  }}
                >
                  <SelectTrigger className="bg-neutral-700 border-neutral-600 text-white">
                    <SelectValue placeholder="Neutral fan" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 text-white border-neutral-700 max-h-80 overflow-auto">
                    <SelectItem value="neutral">Neutral fan</SelectItem>
                    {NBA_TEAMS.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.city} {t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Style Sliders */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-semibold text-white">Commentary Style</h2>
              <div>
                <div className="flex justify-between text-neutral-300 mb-2">
                  <span>Energy</span>
                  <span>{Math.round(prefs.energyLevel ?? 50)}</span>
                </div>
                <Slider value={[prefs.energyLevel ?? 50]} onValueChange={(v) => update({ energyLevel: v[0] })} max={100} step={1} />
              </div>
              <div>
                <div className="flex justify-between text-neutral-300 mb-2">
                  <span>Comedy</span>
                  <span>{Math.round(prefs.comedyLevel ?? 25)}</span>
                </div>
                <Slider value={[prefs.comedyLevel ?? 25]} onValueChange={(v) => update({ comedyLevel: v[0] })} max={100} step={1} />
              </div>
              <div>
                <div className="flex justify-between text-neutral-300 mb-2">
                  <span>Stat Focus</span>
                  <span>{Math.round(prefs.statFocus ?? 50)}</span>
                </div>
                <Slider value={[prefs.statFocus ?? 50]} onValueChange={(v) => update({ statFocus: v[0] })} max={100} step={1} />
              </div>
              {(prefs.favoriteTeam as NBATeam | null) && (
                <div>
                  <div className="flex justify-between text-neutral-300 mb-2">
                    <span>Bias</span>
                    <span>{Math.round(prefs.biasLevel ?? 50)}</span>
                  </div>
                  <Slider value={[prefs.biasLevel ?? 50]} onValueChange={(v) => update({ biasLevel: v[0] })} max={100} step={1} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Voice Settings */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white">Voice</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Gender</label>
                  <Select value={prefs.voiceGender || 'male'} onValueChange={(v) => update({ voiceGender: v as any })}>
                    <SelectTrigger className="bg-neutral-700 border-neutral-600 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-neutral-800 text-white border-neutral-700">
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="no-preference">No Preference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-neutral-300 mb-2">Speed</label>
                  <Slider value={[prefs.voiceSpeed ?? 50]} onValueChange={(v) => update({ voiceSpeed: v[0] })} max={100} step={1} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Language</label>
                  <Select value={prefs.language || 'en'} onValueChange={(v) => update({ language: v as any })}>
                    <SelectTrigger className="bg-neutral-700 border-neutral-600 text-white"><SelectValue placeholder="Select language" /></SelectTrigger>
                    <SelectContent className="bg-neutral-800 text-white border-neutral-700">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="it">Italian</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                      <SelectItem value="ko">Korean</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Accent</label>
                  <Select value={prefs.accent || 'american'} onValueChange={(v) => update({ accent: v as any })}>
                    <SelectTrigger className="bg-neutral-700 border-neutral-600 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-neutral-800 text-white border-neutral-700">
                      <SelectItem value="american">American</SelectItem>
                      <SelectItem value="british">British</SelectItem>
                      <SelectItem value="australian">Australian</SelectItem>
                      <SelectItem value="southern">Southern US</SelectItem>
                      <SelectItem value="new-york">New York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Frequency</label>
                  <Select value={prefs.commentaryFrequency || 'key-moments'} onValueChange={(v) => update({ commentaryFrequency: v as any })}>
                    <SelectTrigger className="bg-neutral-700 border-neutral-600 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-neutral-800 text-white border-neutral-700">
                      <SelectItem value="every-play">Every Play</SelectItem>
                      <SelectItem value="key-moments">Key Moments</SelectItem>
                      <SelectItem value="major-events">Major Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Fantasy */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white">Fantasy Alerts</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Platform</label>
                  <Select
                    value={(prefs.fantasyInfo as any)?.league || ''}
                    onValueChange={(val) => update({ fantasyInfo: { ...(prefs.fantasyInfo || {}), league: val as any } })}
                  >
                    <SelectTrigger className="bg-neutral-700 border-neutral-600 text-white">
                      <SelectValue placeholder="Select league" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 text-white border-neutral-700">
                      <SelectItem value="Yahoo">Yahoo</SelectItem>
                      <SelectItem value="ESPN">ESPN</SelectItem>
                      <SelectItem value="Sleeper">Sleeper</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Notes</label>
                <Textarea
                  placeholder="Players or rules to watch for"
                  value={(prefs.fantasyInfo as any)?.notes || ''}
                  onChange={(e) => update({ fantasyInfo: { ...(prefs.fantasyInfo || {}), notes: e.target.value } })}
                  className="min-h-[80px] resize-none bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white">Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Live Q&A</label>
                  <Select value={(prefs.liveQA ? 'on' : 'off')} onValueChange={(v) => update({ liveQA: v === 'on' })}>
                    <SelectTrigger className="bg-neutral-700 border-neutral-600 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-neutral-800 text-white border-neutral-700">
                      <SelectItem value="on">Enabled</SelectItem>
                      <SelectItem value="off">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Background Audio</label>
                  <Select value={(prefs.backgroundAudio ? 'on' : 'off')} onValueChange={(v) => update({ backgroundAudio: v === 'on' })}>
                    <SelectTrigger className="bg-neutral-700 border-neutral-600 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-neutral-800 text-white border-neutral-700">
                      <SelectItem value="on">Enabled</SelectItem>
                      <SelectItem value="off">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Instructions */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-xl font-semibold text-white">Custom Instructions</h2>
              <Textarea
                value={prefs.customInstructions || ''}
                onChange={(e) => update({ customInstructions: e.target.value })}
                className="min-h-[120px] resize-none bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400"
                placeholder="Tell your commentator how to behave, what to focus on…"
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="bg-neutral-800 border border-neutral-600 text-white hover:bg-neutral-700">
              {saving ? 'Saving…' : 'Save Preferences'}
            </Button>
          </div>
          {message && <div className="text-sm text-neutral-300">{message}</div>}
        </div>
      </div>
    </div>
  )
}


