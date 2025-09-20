'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import OnboardingContainer from '@/components/onboarding/OnboardingContainer'
import { OnboardingData } from '@/types/onboarding'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [isCompleted, setIsCompleted] = useState(false)
  const [completedData, setCompletedData] = useState<OnboardingData | null>(null)

  const handleComplete = (data: OnboardingData) => {
    setCompletedData(data)
    setIsCompleted(true)
    
    // Clear the saved data from localStorage since onboarding is complete
    localStorage.removeItem('onboarding-data')
  };

  const handleSkip = () => {
    // Reset onboarding to start over
    setIsCompleted(false)
    setCompletedData(null)
    localStorage.removeItem('onboarding-data')
  };

  if (isCompleted && completedData) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-neutral-800 border-neutral-700">
          <CardContent className="p-8 text-center">
            <div className="space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white">
                  Setup Complete!
                </h1>
                <p className="text-lg text-neutral-300">
                  Your personalized Courtside commentator is ready to go.
                </p>
              </div>

              <div className="bg-neutral-700/50 p-6 rounded-lg text-left">
                <h3 className="font-semibold mb-4 text-white">Your Settings Summary:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Favorite Team:</span>
                    <span className="font-medium text-white">
                      {completedData.favoriteTeam 
                        ? `${completedData.favoriteTeam.city} ${completedData.favoriteTeam.name}`
                        : 'Neutral Fan'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Energy Level:</span>
                    <span className="font-medium text-white">
                      {completedData.energyLevel > 70 ? 'Hyped' : completedData.energyLevel < 30 ? 'Chill' : 'Balanced'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Voice:</span>
                    <span className="font-medium text-white">
                      {completedData.voiceGender === 'male' ? 'Male' : completedData.voiceGender === 'female' ? 'Female' : 'No Preference'} - {completedData.accent}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Live Q&A:</span>
                    <span className="font-medium text-white">
                      {completedData.liveQA ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleSkip}
                  className="px-8 py-3"
                >
                  Start Over
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 bg-black border-neutral-600 text-neutral-300 hover:bg-neutral-800"
                >
                  Refresh Page
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <OnboardingContainer
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  )
}
