'use client'

import { useRouter } from 'next/navigation'
import OnboardingContainer from '@/components/onboarding/OnboardingContainer'
import { OnboardingData } from '@/types/onboarding'
import { api } from '@/lib/api'

export default function HomePage() {
  const router = useRouter()

  const handleComplete = async (data: OnboardingData) => {
    try {
      const res = await api.saveUserPreferences(data)
      if (res?.success) {
        // Only clear cached onboarding data after a successful save
        localStorage.removeItem('onboarding-data')
      }
    } catch (e) {
      // Keep local data for retry if save fails
    } finally {
      // Navigate after save attempt completes to avoid race with dashboard check
      router.push('/dashboard')
    }
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
