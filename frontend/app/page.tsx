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
                  Your personalized commentator is ready to go.
                </p>
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
