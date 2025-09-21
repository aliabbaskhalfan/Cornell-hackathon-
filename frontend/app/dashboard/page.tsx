'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dashboard } from '@/components/dashboard/dashboard'
import { api } from '@/lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const [allowed, setAllowed] = useState<boolean>(false)
  const [checked, setChecked] = useState<boolean>(false)

  useEffect(() => {
    let mounted = true
    const check = async () => {
      try {
        // Prefer backend truth since localStorage may be empty in incognito
        const res = await api.getUserPreferences().catch(() => null)
        const hasPrefs = !!(res && res.success && res.preferences)

        if (!hasPrefs) {
          // Fallback to local onboarding data to avoid bounce-back after completing onboarding
          try {
            const localCompleted = localStorage.getItem('onboarding-completed') === 'true'
            const localData = localStorage.getItem('onboarding-data')
            if (localCompleted || localData) {
              if (mounted) setAllowed(true)
              return
            }
          } catch {}

          router.replace('/')
          return
        }

        if (mounted) setAllowed(true)
      } finally {
        if (mounted) setChecked(true)
      }
    }
    check()
    return () => { mounted = false }
  }, [router])

  if (!checked) {
    return null
  }

  if (!allowed) {
    return null
  }

  return <Dashboard />
}
