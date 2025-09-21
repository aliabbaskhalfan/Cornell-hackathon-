"use client"

import { useParams } from 'next/navigation'
import { Dashboard } from '@/components/dashboard/dashboard'

export default function GamePage() {
  const params = useParams()
  // Currently we do not need the id to change behavior; Dashboard handles the mock/live
  // But we keep the route for future expansion
  return <Dashboard />
}
