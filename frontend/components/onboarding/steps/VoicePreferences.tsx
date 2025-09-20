'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Volume2, Mic } from 'lucide-react';
import { OnboardingStepProps } from '@/types/onboarding';

export default function VoicePreferences({ data, updateData, onNext, onPrevious, isFirstStep }: OnboardingStepProps) {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const handleSliderChange = (key: keyof typeof data, value: number[]) => {
    updateData({ [key]: value[0] });
  };

  const handleSelectChange = (key: keyof typeof data, value: string) => {
    updateData({ [key]: value });
  };

  const playPreview = () => {
    setIsPlayingPreview(true);
    // Simulate audio preview
    setTimeout(() => setIsPlayingPreview(false), 2000);
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

  const getGenderLabel = (value: string) => {
    switch (value) {
      case 'male': return 'Male';
      case 'female': return 'Female';
      case 'no-preference': return 'No Preference';
      default: return 'Male';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Logo in top left */}
      <div className="flex justify-start">
        <img 
          src="/images/logo.png" 
          alt="CourtSide Logo" 
          className="h-12 w-auto object-contain"
        />
      </div>
      
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white">Choose your commentator voice</h1>
        <p className="text-lg text-neutral-300">Customize the voice and audio settings for your AI commentator</p>
      </div>

      <div className="space-y-8">
        {/* Voice Gender */}
        <Card className="bg-neutral-800 border-neutral-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Voice Gender</h3>
              <Select
                value={data.voiceGender}
                onValueChange={(value) => handleSelectChange('voiceGender', value)}
              >
                <SelectTrigger className="w-full bg-neutral-700 border-neutral-600 text-white">
                  <SelectValue placeholder="Select voice gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="no-preference">No Preference</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

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
