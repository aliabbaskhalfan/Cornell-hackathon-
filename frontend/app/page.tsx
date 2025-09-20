'use client'

import { useRouter } from 'next/navigation'
import OnboardingContainer from '@/components/onboarding/OnboardingContainer'
import { OnboardingData } from '@/types/onboarding'
import { api } from '@/lib/api'

export default function HomePage() {
  const router = useRouter()

  const handleComplete = (data: OnboardingData) => {
    // Clear the saved data from localStorage since onboarding is complete
    localStorage.removeItem('onboarding-data')
    
    // Persist preferences to backend then redirect
    api.saveUserPreferences(data)
      .catch(() => {})
      .finally(() => {
        router.push('/dashboard')
      })
  };

  const handleSkip = () => {
    // Reset onboarding to start over
    localStorage.removeItem('onboarding-data')
    window.location.reload()
  };

  return (
    <OnboardingContainer
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  )
}
