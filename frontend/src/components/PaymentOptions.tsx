interface Props {
  strategy: string
  depositPercentage: number
  depositAmount: number
  totalAmount: number
  selected: 'deposit' | 'full'
  onSelect: (t: 'deposit' | 'full') => void
}

export default function PaymentOptions({ strategy, depositPercentage, depositAmount, totalAmount, selected, onSelect }: Props) {
  const remainingAmount = +(totalAmount - depositAmount).toFixed(2)

  if (strategy === 'full') {
    return (
      <div
        style={{
          border: '2px solid var(--primary)',
          borderRadius: 12,
          padding: '1rem',
          backgroundColor: 'var(--primary-light)',
          cursor: 'pointer',
        }}
        onClick={() => onSelect('full')}
      >
        <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 4 }}>💳 دفع كامل</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{totalAmount.toFixed(2)}₪</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>🔒 المبلغ كاملاً في Escrow</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Option 1: deposit */}
      <div
        onClick={() => onSelect('deposit')}
        style={{
          border: `2px solid ${selected === 'deposit' ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 12, padding: '1rem', cursor: 'pointer',
          backgroundColor: selected === 'deposit' ? 'var(--primary-light)' : 'white',
          transition: 'all 0.15s',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, color: selected === 'deposit' ? 'var(--primary)' : 'var(--text)', marginBottom: 2 }}>
              {strategy === 'cod_protected' ? '🤝 COD محمي' : `💰 عربون ${depositPercentage}%`}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
              {depositAmount.toFixed(2)}₪ الآن
            </div>
            {remainingAmount > 0 && (
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                + {remainingAmount.toFixed(2)}₪ عند الاستلام
              </div>
            )}
          </div>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            border: `2px solid ${selected === 'deposit' ? 'var(--primary)' : 'var(--border)'}`,
            backgroundColor: selected === 'deposit' ? 'var(--primary)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {selected === 'deposit' && <span style={{ color: 'white', fontSize: 11 }}>✓</span>}
          </div>
        </div>
        {selected === 'deposit' && (
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>
            ✅ الخيار الموصى به
          </div>
        )}
      </div>

      {/* Option 2: full */}
      <div
        onClick={() => onSelect('full')}
        style={{
          border: `2px solid ${selected === 'full' ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 12, padding: '1rem', cursor: 'pointer',
          backgroundColor: selected === 'full' ? 'var(--primary-light)' : 'white',
          transition: 'all 0.15s',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, color: selected === 'full' ? 'var(--primary)' : 'var(--text)', marginBottom: 2 }}>
              💳 دفع كامل
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
              {totalAmount.toFixed(2)}₪ الآن
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>🔒 كامل في Escrow</div>
          </div>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            border: `2px solid ${selected === 'full' ? 'var(--primary)' : 'var(--border)'}`,
            backgroundColor: selected === 'full' ? 'var(--primary)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {selected === 'full' && <span style={{ color: 'white', fontSize: 11 }}>✓</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
