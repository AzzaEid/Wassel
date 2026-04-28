interface ScoringData {
  risk_score: number
  strategy_recommendation: string
  reasoning: string
  customer_name: string | null
  exists: boolean
}

interface Props {
  scoring: ScoringData
  amount?: number
}

export default function StrategyCard({ scoring, amount }: Props) {
  const { strategy_recommendation: s, reasoning, risk_score } = scoring

  let icon = '🔴', bg = 'var(--danger-light)', color = 'var(--danger)', label = 'دفع كامل مسبق'
  if (s === 'cod_protected') {
    icon = '🟢'; bg = 'var(--primary-light)'; color = 'var(--primary)'; label = 'COD محمي'
  } else if (s === 'deposit') {
    icon = '🟡'; bg = 'var(--amber-light)'; color = 'var(--amber)'
    if (risk_score < 60) label = 'عربون 30%'
    else label = 'عربون 20%'
  }

  return (
    <div style={{
      marginTop: 10,
      padding: '10px 14px',
      borderRadius: 10,
      backgroundColor: bg,
      border: `1px solid ${color}22`,
    }}>
      <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        <span style={{ fontWeight: 600, color, fontSize: 14 }}>الاستراتيجية: {label}</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{reasoning}</p>
      {amount && s === 'deposit' && (
        <p style={{ fontSize: 13, color, margin: '4px 0 0', fontWeight: 500 }}>
          {s === 'deposit' && risk_score < 60
            ? `ادفع ${(amount * 0.3).toFixed(2)}₪ الآن + ${(amount * 0.7).toFixed(2)}₪ عند الاستلام`
            : `ادفع ${(amount * 0.2).toFixed(2)}₪ الآن + ${(amount * 0.8).toFixed(2)}₪ عند الاستلام`}
        </p>
      )}
      {amount && s === 'full' && (
        <p style={{ fontSize: 13, color, margin: '4px 0 0', fontWeight: 500 }}>
          ادفع {amount.toFixed(2)}₪ كاملاً مسبقاً
        </p>
      )}
    </div>
  )
}
