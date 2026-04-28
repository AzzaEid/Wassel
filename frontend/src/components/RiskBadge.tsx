interface Props {
  score: number
  showScore?: boolean
}

export default function RiskBadge({ score, showScore = true }: Props) {
  let bg: string, color: string, label: string, dot: string

  if (score === 0) {
    bg = 'var(--danger-light)'; color = 'var(--danger)'; label = 'زبون جديد'; dot = '🔴'
  } else if (score < 30) {
    bg = 'var(--danger-light)'; color = 'var(--danger)'; label = 'خطر عالٍ'; dot = '🔴'
  } else if (score < 60) {
    bg = 'var(--amber-light)'; color = 'var(--amber)'; label = 'متوسط'; dot = '🟡'
  } else if (score < 80) {
    bg = 'var(--blue-light)'; color = 'var(--blue)'; label = 'جيد'; dot = '🔵'
  } else {
    bg = 'var(--primary-light)'; color = 'var(--primary)'; label = 'موثوق'; dot = '🟢'
  }

  return (
    <span className="badge" style={{ backgroundColor: bg, color }}>
      {dot} {label}{showScore && score > 0 ? ` (${score})` : ''}
    </span>
  )
}
