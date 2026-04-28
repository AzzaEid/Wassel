interface Props {
  status: string
}

const STATUS_MAP: Record<string, { icon: string; label: string; bg: string; color: string }> = {
  empty:            { icon: '⏳', label: 'جديد',           bg: '#F3F4F6', color: '#6B7280' },
  funded:           { icon: '🔒', label: 'محجوز',          bg: 'var(--blue-light)', color: 'var(--blue)' },
  driver_confirmed: { icon: '🚚', label: 'تحت التوصيل',    bg: 'var(--amber-light)', color: 'var(--amber)' },
  released:         { icon: '✅', label: 'أُفرج',           bg: 'var(--primary-light)', color: 'var(--primary)' },
  auto_released:    { icon: '✅', label: 'أُفرج تلقائياً', bg: 'var(--primary-light)', color: 'var(--primary)' },
  frozen:           { icon: '⚠️', label: 'مجمّد',          bg: 'var(--danger-light)', color: 'var(--danger)' },
  refunded:         { icon: '↩️', label: 'أُعيد',           bg: 'var(--amber-light)', color: 'var(--amber)' },
  cancelled:        { icon: '❌', label: 'ملغى',            bg: '#F3F4F6', color: '#6B7280' },
  expired:          { icon: '⏰', label: 'منتهي',           bg: '#F3F4F6', color: '#6B7280' },
}

export default function EscrowStatus({ status }: Props) {
  const s = STATUS_MAP[status] ?? { icon: '?', label: status, bg: '#F3F4F6', color: '#6B7280' }
  return (
    <span className="badge" style={{ backgroundColor: s.bg, color: s.color }}>
      {s.icon} {s.label}
    </span>
  )
}
