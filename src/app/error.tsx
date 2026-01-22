'use client'

export default function GlobalError() {
  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong!</h1>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            An unexpected error occurred
          </p>
          <a
            href="/"
            style={{
              padding: '10px 20px',
              background: '#0070f3',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '5px',
              fontSize: '1rem',
            }}
          >
            Go Home
          </a>
        </div>
      </body>
    </html>
  )
}
