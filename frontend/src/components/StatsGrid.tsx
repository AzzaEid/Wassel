interface Stats {
  total_orders: number
  escrow_held: number
  released_this_week: number
  return_rate_percent: number
  returned_count: number
}

interface Props { stats: Stats }

function StatCard({ icon, label, value, bg, color }: {
  icon: string; label: string; value: string; bg: string; color: string
}) {
  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '1rem 1.25rem',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 36, height: 36, borderRadius: 10,
          backgroundColor: bg, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>{icon}</span>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
      </div>
      <span style={{ fontSize: 22, fontWeight: 700, color }}>{value}</span>
    </div>
  )
}

export default function StatsGrid({ stats }: Props) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: 12,
    }}>
      <StatCard
        icon="📦" label="إجمالي الطلبات"
        value={String(stats.total_orders)}
        bg="#F3F4F6" color="var(--text)"
      />
      <StatCard
        icon="🔒" label="محجوز في Escrow"
        value={`${stats.escrow_held.toFixed(2)}₪`}
        bg="var(--blue-light)" color="var(--blue)"
      />
      <StatCard
        icon="✅" label="تم الإفراج هذا الأسبوع"
        value={`${stats.released_this_week.toFixed(2)}₪`}
        bg="var(--primary-light)" color="var(--primary)"
      />
      <StatCard
        icon="📊" label="معدل الإرجاع"
        value={`${stats.return_rate_percent}%`}
        bg={stats.return_rate_percent > 20 ? 'var(--danger-light)' : 'var(--amber-light)'}
        color={stats.return_rate_percent > 20 ? 'var(--danger)' : 'var(--amber)'}
      />
      <StatCard
        icon="↩️" label="عدد المرجعة"
        value={String(stats.returned_count)}
        bg="var(--amber-light)" color="var(--amber)"
      />
    </div>
  )
}
