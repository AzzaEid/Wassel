import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const PAGES = [
  { path: '/dashboard',         label: 'لوحة التاجر',     icon: '📊' },
  { path: '/delivery-company',  label: 'شركة التوصيل',   icon: '🚚' },
  { path: '/driver',            label: 'واجهة السائق',    icon: '🛵' },
  { path: '/admin',             label: 'لوحة التحكم',    icon: '⚙️' },
]

export default function FloatingNav() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const loc = useLocation()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const go = (path: string) => {
    setOpen(false)
    navigate(path)
  }

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        bottom: 28,
        left: 28,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 8,
      }}
    >
      {/* Menu items — rendered above the button */}
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {PAGES.map(p => {
            const active = loc.pathname === p.path
            return (
              <button
                key={p.path}
                onClick={() => go(p.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px', borderRadius: 12,
                  border: active ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: active ? 'var(--primary)' : 'white',
                  color: active ? 'white' : 'var(--text)',
                  fontWeight: active ? 700 : 500,
                  fontSize: 14, cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  whiteSpace: 'nowrap',
                  transition: 'background-color 0.15s',
                }}
              >
                <span style={{ fontSize: 16 }}>{p.icon}</span>
                {p.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="فتح القائمة"
        style={{
          width: 52, height: 52, borderRadius: '50%', border: 'none',
          backgroundColor: 'var(--primary)',
          color: 'white', fontSize: 22, cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s, background-color 0.15s',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
        }}
      >
        {open ? '✕' : '☰'}
      </button>
    </div>
  )
}
