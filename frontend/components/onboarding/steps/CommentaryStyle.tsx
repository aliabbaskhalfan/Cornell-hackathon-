'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Volume2 } from 'lucide-react';
import { OnboardingStepProps } from '@/types/onboarding';

export default function CommentaryStyle({ data, updateData, onNext, onPrevious, isFirstStep }: OnboardingStepProps) {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const handleSliderChange = (key: keyof typeof data, value: number[]) => {
    updateData({ [key]: value[0] });
  };

  const playPreview = () => {
    setIsPlayingPreview(true);
    // Simulate audio preview
    setTimeout(() => setIsPlayingPreview(false), 2000);
  };

  const getSliderLabel = (value: number, labels: [string, string]) => {
    const [left, right] = labels;
    if (value < 25) return left;
    if (value < 75) return 'Balanced';
    return right;
  };

  const getCommentaryPreview = () => {
    const energy = data.energyLevel > 70 ? 'high' : data.energyLevel < 30 ? 'low' : 'medium';
    const comedy = data.comedyLevel > 70 ? 'high' : data.comedyLevel < 30 ? 'low' : 'medium';
    const stats = data.statFocus > 70 ? 'heavy' : data.statFocus < 30 ? 'light' : 'moderate';
    
    let preview = "And here we go! ";
    
    if (energy === 'high') preview += "What an incredible play! ";
    else if (energy === 'low') preview += "Nice execution there. ";
    else preview += "Great play by the team. ";
    
    if (comedy === 'high') preview += "That was smoother than a fresh jar of peanut butter! ";
    else if (comedy === 'low') preview += "Precise execution. ";
    
    if (stats === 'heavy') preview += "His true shooting percentage of 65.2% really shows here. ";
    else if (stats === 'light') preview += "That's a solid bucket. ";
    
    if (data.favoriteTeam && data.biasLevel > 70) {
      preview += `You love to see it from ${data.favoriteTeam.city}! `;
    }
    
    return preview;
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white">Customize your commentator</h1>
        <p className="text-lg text-neutral-300">Adjust the personality and style of your Courtside commentator</p>
      </div>

      <div className="space-y-8">
        {/* Energy Level */}
        <Card className="bg-neutral-800 border-neutral-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">Energy Level</h3>
                <span className="text-sm text-neutral-300">
                  {getSliderLabel(data.energyLevel, ['Chill', 'Hyped'])}
                </span>
              </div>
              <div className="space-y-2">
                <Slider
                  value={[data.energyLevel]}
                  onValueChange={(value) => handleSliderChange('energyLevel', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-neutral-400">
                  <span>Chill</span>
                  <span>Hyped</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comedy Level */}
        <Card className="bg-neutral-800 border-neutral-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">Comedy Level</h3>
                <span className="text-sm text-neutral-300">
                  {getSliderLabel(data.comedyLevel, ['Serious', 'Comedic'])}
                </span>
              </div>
              <div className="space-y-2">
                <Slider
                  value={[data.comedyLevel]}
                  onValueChange={(value) => handleSliderChange('comedyLevel', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-neutral-400">
                  <span>Serious</span>
                  <span>Comedic</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stat Focus */}
        <Card className="bg-neutral-800 border-neutral-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">Stat Focus</h3>
                <span className="text-sm text-neutral-300">
                  {getSliderLabel(data.statFocus, ['Light Stats', 'Deep Analytics'])}
                </span>
              </div>
              <div className="space-y-2">
                <Slider
                  value={[data.statFocus]}
                  onValueChange={(value) => handleSliderChange('statFocus', value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-neutral-400">
                  <span>Light Stats</span>
                  <span>Deep Analytics</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bias Level - only show if team selected */}
        {data.favoriteTeam && (
          <Card className="bg-neutral-800 border-neutral-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-white">Bias Level</h3>
                  <span className="text-sm text-neutral-300">
                    {getSliderLabel(data.biasLevel, ['Neutral', 'Team Homer'])}
                  </span>
                </div>
                <div className="space-y-2">
                  <Slider
                    value={[data.biasLevel]}
                    onValueChange={(value) => handleSliderChange('biasLevel', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-neutral-400">
                    <span>Neutral</span>
                    <span>Team Homer</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
