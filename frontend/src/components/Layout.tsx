import { ReactNode } from 'react'
import FloatingNav from './FloatingNav'

interface Props {
  children: ReactNode
  balance?: number
  merchantName?: string
}

export default function Layout({ children, balance, merchantName }: Props) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1rem' }}
          className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: 18,
            }}>و</div>
            <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>وصّل</span>
          </div>

          {/* Merchant info */}
          <div className="flex items-center gap-3">
            {merchantName && (
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                مرحباً، {merchantName}
              </span>
            )}
            {balance !== undefined && (
              <span style={{
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '4px 12px', borderRadius: 20,
                fontWeight: 600, fontSize: 14,
              }}>
                {balance.toFixed(2)}₪
              </span>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '1.5rem 1rem' }}>
        {children}
      </main>

      <FloatingNav />
    </div>
  )
}
