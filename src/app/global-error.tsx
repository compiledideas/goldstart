'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-5 text-center">
          <h1 className="text-3xl font-bold mb-4">A critical error occurred</h1>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Refresh App
          </button>
        </div>
      </body>
    </html>
  )
}