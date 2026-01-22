'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App Error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <h2 className="text-2xl font-bold tracking-tight mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-6">We encountered an unexpected error in the application.</p>
      <Button onClick={() => reset()}>
        Try again
      </Button>
    </div>
  )
}