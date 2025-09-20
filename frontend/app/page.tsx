'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed')
    
    if (hasCompletedOnboarding === 'true') {
      // User has completed onboarding, go to dashboard
      router.push('/dashboard')
    } else {
      // For now, go directly to dashboard until onboarding is merged
      // TODO: Change this to router.push('/onboarding') after merge
      router.push('/dashboard')
    }
    
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  return null // This component just handles routing
}
