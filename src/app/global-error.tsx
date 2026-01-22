'use client'

import { Geist, Geist_Mono } from "next/font/google"

const geistSans = Geist({ subsets: ["latin"] })

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className={geistSans.className}>
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Critical System Error</h1>
          <p className="mb-8 text-gray-600">A global error occurred that crashed the root layout.</p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-black text-white rounded-lg font-medium"
          >
            Attempt Recovery
          </button>
        </div>
      </body>
    </html>
  )
}