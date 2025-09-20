'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit3 } from 'lucide-react';
import { OnboardingStepProps } from '@/types/onboarding';

export default function PreviewConfirm({ data, updateData, onNext, onPrevious, isFirstStep }: OnboardingStepProps) {

  const getSliderLabel = (value: number, labels: [string, string]) => {
    const [left, right] = labels;
    if (value < 25) return left;
    if (value < 75) return 'Balanced';
    return right;
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

  const generateWelcomeMessage = () => {
    const teamName = data.favoriteTeam ? data.favoriteTeam.city : 'all teams';
    const energyStyle = data.energyLevel > 70 ? 'high-energy' : data.energyLevel < 30 ? 'calm' : 'balanced';
    const comedyStyle = data.comedyLevel > 70 ? 'comedic' : data.comedyLevel < 30 ? 'serious' : 'balanced';
    const statStyle = data.statFocus > 70 ? 'analytical' : data.statFocus < 30 ? 'casual' : 'moderate';
    
    return `Welcome to your personalized sports experience! Based on your preferences, I'll be your ${energyStyle} ${comedyStyle} ${statStyle} Courtside commentator for ${teamName}. Let's get started!`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Logo in top left */}
      <div className="flex justify-start">
        <img 
          src="/images/logo.png" 
          alt="CourtSide Logo" 
          className="h-12 w-auto object-contain"
        />
      </div>
      
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white">Ready to go live!</h1>
        <p className="text-lg text-neutral-300">Review your settings and start your personalized commentary experience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">Your Settings</h2>
          
          {/* Team Selection */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {data.favoriteTeam ? (
                    <>
                      <img
                        src={data.favoriteTeam.logo}
                        alt={`${data.favoriteTeam.city} ${data.favoriteTeam.name} logo`}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm" style="background: linear-gradient(135deg, ${data.favoriteTeam!.primaryColor}, ${data.favoriteTeam!.secondaryColor})">${data.favoriteTeam!.abbreviation}</div>`;
                          }
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-white">{data.favoriteTeam.city} {data.favoriteTeam.name}</h3>
                        <p className="text-sm text-neutral-400">{data.favoriteTeam.record.wins}-{data.favoriteTeam.record.losses}</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-neutral-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">N</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Neutral Fan</h3>
                        <p className="text-sm text-neutral-400">No favorite team</p>
                      </div>
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" className="bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Commentary Style */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Commentary Style</h3>
                <Button variant="outline" size="sm" className="bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-400">Energy:</span>
                  <Badge variant="secondary">
                    {getSliderLabel(data.energyLevel, ['Chill', 'Hyped'])}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-400">Comedy:</span>
                  <Badge variant="secondary">
                    {getSliderLabel(data.comedyLevel, ['Serious', 'Comedic'])}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-400">Stats:</span>
                  <Badge variant="secondary">
                    {getSliderLabel(data.statFocus, ['Light Stats', 'Deep Analytics'])}
                  </Badge>
                </div>
                {data.favoriteTeam && (
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-400">Bias:</span>
                    <Badge variant="secondary">
                      {getSliderLabel(data.biasLevel, ['Neutral', 'Team Homer'])}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">Additional Settings</h2>
          
          {/* Voice Settings */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Voice Settings</h3>
                <Button variant="outline" size="sm" className="bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-400">Gender:</span>
                  <Badge variant="secondary">{getGenderLabel(data.voiceGender)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-400">Speed:</span>
                  <Badge variant="secondary">{getSpeedLabel(data.voiceSpeed)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-400">Accent:</span>
                  <Badge variant="secondary">{getAccentLabel(data.accent)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-400">Frequency:</span>
                  <Badge variant="secondary">{getFrequencyLabel(data.commentaryFrequency)}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Features</h3>
                <Button variant="outline" size="sm" className="bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-400">Live Q&A:</span>
                  <Badge variant={data.liveQA ? "default" : "secondary"}>
                    {data.liveQA ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-400">Background Audio:</span>
                  <Badge variant={data.backgroundAudio ? "default" : "secondary"}>
                    {data.backgroundAudio ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Instructions */}
          {data.customInstructions && (
            <Card className="bg-neutral-800 border-neutral-700">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">Custom Instructions</h3>
                    <Button variant="outline" size="sm" className="bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-600">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  <div className="bg-neutral-700 p-4 rounded-lg">
                    <p className="text-neutral-300 text-sm whitespace-pre-wrap">{data.customInstructions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
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
          Start Experience
        </Button>
      </div>
    </div>
  );
}
