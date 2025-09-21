'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Volume2, Mic } from 'lucide-react';
import { OnboardingStepProps } from '@/types/onboarding';
import { api } from '@/lib/api';

export default function VoicePreferences({ data, updateData, onNext, onPrevious, isFirstStep }: OnboardingStepProps) {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [voices, setVoices] = useState<Array<{ voice_id: string; name: string }>>([])
  const [loadingVoices, setLoadingVoices] = useState(false)

  useEffect(() => {
    const loadVoices = async () => {
      setLoadingVoices(true)
      try {
        const res = await api.listVoices()
        if (res.success) {
          const vs = (res.voices || []).map((v: any) => ({ voice_id: v.voice_id, name: v.name }))
          setVoices(vs)
        }
      } catch {}
      setLoadingVoices(false)
    }
    loadVoices()
  }, [])

  const handleSliderChange = (key: keyof typeof data, value: number[]) => {
    updateData({ [key]: value[0] });
  };

  const handleSelectChange = (key: keyof typeof data, value: string) => {
    updateData({ [key]: value });
  };

  const playPreview = async () => {
    if (isPlayingPreview) return
    setIsPlayingPreview(true)
    try {
      const res = await api.speakTts('This is a quick preview of your commentator voice.', {
        persona: 'passionate',
        language: data.language,
        voice_id: data.voiceId,
      })
      if (res.success && res.audio_url) {
        const audio = new Audio(res.audio_url)
        audio.onended = () => setIsPlayingPreview(false)
        audio.onerror = () => setIsPlayingPreview(false)
        audio.play().catch(() => setIsPlayingPreview(false))
      } else {
        setIsPlayingPreview(false)
      }
    } catch {
      setIsPlayingPreview(false)
    }
  };

  const getSpeedLabel = (value: number) => {
    if (value < 25) return 'Slow';
    if (value < 75) return 'Normal';
    return 'Fast';
  };

  const getFrequencyLabel = (value: string) => {
    switch (value) {
      case 'every-play': return 'Every Play';
      case 'key-moments': return 'Key Moments Only';
      case 'major-events': return 'Major Events Only';
      default: return 'Key Moments Only';
    }
  };

  const getAccentLabel = (value: string) => {
    switch (value) {
      case 'american': return 'American Standard';
      case 'british': return 'British';
      case 'australian': return 'Australian';
      case 'southern': return 'Southern US';
      case 'new-york': return 'New York';
      default: return 'American Standard';
    }
  };

  // removed gender selection UI

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white">Choose your commentator voice</h1>
        <p className="text-lg text-neutral-300">Customize the voice and audio settings for your AI commentator</p>
      </div>

      <div className="space-y-8">
        {/* ElevenLabs Voice (optional) */}
        <Card className="bg-neutral-800 border-neutral-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Voice Selection</h3>
                <Button size="sm" onClick={() => playPreview()} disabled={isPlayingPreview} className="bg-neutral-700 border-neutral-600 text-white">
                  {isPlayingPreview ? 'Playing…' : 'Preview'}
                </Button>
              </div>
              <Select
                value={data.voiceId || ''}
                onValueChange={(value) => {
                  const name = voices.find(v => v.voice_id === value)?.name
                  updateData({ voiceId: value, voiceName: name || undefined })
                }}
              >
                <SelectTrigger className="w-full bg-neutral-700 border-neutral-600 text-white">
                  <SelectValue placeholder={loadingVoices ? 'Loading voices…' : 'Select a voice (optional)'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key={'gnPxliFHTp6OK6tcoA6i'} value={'gnPxliFHTp6OK6tcoA6i'}>Default Commentator</SelectItem>
                  {(voices || [])
                    .filter(v => v.voice_id !== 'gnPxliFHTp6OK6tcoA6i')
                    .map(v => (
                      <SelectItem key={v.voice_id} value={v.voice_id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-neutral-400">Choose a specific ElevenLabs voice. Leave empty to use the default persona mapping.</p>
            </div>
          </CardContent>
        </Card>
        {/* Gender selection removed - explicit voice selection controls the voice */}

        {/* Voice Speed */}
        <Card className="bg-neutral-800 border-neutral-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">Voice Speed</h3>
                <span className="text-sm text-neutral-300">
                  {getSpeedLabel(data.voiceSpeed)}
                </span>
              </div>
              <div className="space-y-2">
                <Slider
                  value={[data.voiceSpeed]}
                  onValueChange={(value) => handleSliderChange('voiceSpeed', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-neutral-400">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="bg-neutral-800 border-neutral-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Language</h3>
              <Select
                value={data.language || 'en'}
                onValueChange={(value) => handleSelectChange('language', value)}
              >
                <SelectTrigger className="w-full bg-neutral-700 border-neutral-600 text-white">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
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
          </CardContent>
        </Card>

        {/* Accent/Style */}
        <Card className="bg-neutral-800 border-neutral-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Accent/Style</h3>
              <Select
                value={data.accent}
                onValueChange={(value) => handleSelectChange('accent', value)}
              >
                <SelectTrigger className="w-full bg-neutral-700 border-neutral-600 text-white">
                  <SelectValue placeholder="Select accent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="american">American Standard</SelectItem>
                  <SelectItem value="british">British</SelectItem>
                  <SelectItem value="australian">Australian</SelectItem>
                  <SelectItem value="southern">Southern US</SelectItem>
                  <SelectItem value="new-york">New York</SelectItem>
                  <SelectItem value="indian">Indian</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Commentary Frequency */}
        <Card className="bg-neutral-800 border-neutral-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Commentary Frequency</h3>
              <Select
                value={data.commentaryFrequency}
                onValueChange={(value) => handleSelectChange('commentaryFrequency', value)}
              >
                <SelectTrigger className="w-full bg-neutral-700 border-neutral-600 text-white">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="every-play">Every Play (constant)</SelectItem>
                  <SelectItem value="key-moments">Key Moments Only (selective)</SelectItem>
                  <SelectItem value="major-events">Major Events Only (minimal)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-neutral-400">
                {data.commentaryFrequency === 'every-play' && "Commentary for every single play and action"}
                {data.commentaryFrequency === 'key-moments' && "Commentary for important plays, scores, and key moments"}
                {data.commentaryFrequency === 'major-events' && "Commentary only for major events like dunks, buzzer beaters, and game-changing plays"}
              </p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirstStep}
          className="px-8 bg-neutral-800 border-neutral-600 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-none"
        >
          Previous
        </Button>
        <Button
          onClick={onNext}
          className="px-8 bg-neutral-800 border-neutral-600 text-white hover:bg-neutral-700 transition-none"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
