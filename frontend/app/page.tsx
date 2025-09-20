'use client'

import { useRouter } from 'next/navigation'
import OnboardingContainer from '@/components/onboarding/OnboardingContainer'
import { OnboardingData } from '@/types/onboarding'

export default function HomePage() {
  const router = useRouter()

  const handleComplete = (data: OnboardingData) => {
    // Clear the saved data from localStorage since onboarding is complete
    localStorage.removeItem('onboarding-data')
    
    // Redirect to dashboard instead of showing completion modal
    router.push('/dashboard')
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
