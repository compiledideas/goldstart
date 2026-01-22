'use client'

export default function GlobalError({ error }: { error: any }) {
  return (
    <html>
      <body>
        <h2>Build Error Detected</h2>
        <p>{error?.message}</p>
      </body>
    </html>
  )
}
