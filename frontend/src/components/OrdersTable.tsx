import EscrowStatus from './EscrowStatus'

interface Order {
  id: string
  product_name: string
  customer_name: string
  customer_phone: string
  total_amount: number
  strategy: string
  deposit_percentage: number
  order_status: string
  escrow_status: string
  created_at: string
  can_cancel: boolean
}

interface Props {
  orders: Order[]
  onCancel: (id: string) => void
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'بانتظار الدفع',
  deposit_paid: 'دُفع العربون',
  fully_paid: 'مدفوع بالكامل',
  driver_delivered: 'تم التسليم',
  completed: 'مكتمل',
  disputed: 'خلاف',
  returned: 'مرجع',
  cancelled: 'ملغى',
  expired: 'منتهي',
}

const STRATEGY_LABEL: Record<string, string> = {
  cod_protected: 'COD محمي',
  full: 'كامل مسبق',
}

function strategyLabel(s: string, pct: number) {
  if (s === 'deposit') return `عربون ${pct}%`
  return STRATEGY_LABEL[s] ?? s
}

function strategyColor(s: string): string {
  if (s === 'cod_protected') return 'var(--primary)'
  if (s === 'deposit') return 'var(--amber)'
  return 'var(--blue)'
}

function strategyBg(s: string): string {
  if (s === 'cod_protected') return 'var(--primary-light)'
  if (s === 'deposit') return 'var(--amber-light)'
  return 'var(--blue-light)'
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit', year: '2-digit' })
    + ' ' + d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
}

export default function OrdersTable({ orders, onCancel }: Props) {
  if (orders.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white', border: '1px solid var(--border)',
        borderRadius: 12, padding: '3rem',
        textAlign: 'center', color: 'var(--text-secondary)',
      }}>
        لا توجد طلبات بعد
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>الطلبات ({orders.length})</h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB' }}>
              {['الزبون', 'الهاتف', 'المنتج', 'المبلغ', 'الاستراتيجية', 'حالة الطلب', 'Escrow', 'التاريخ', 'إجراء'].map(h => (
                <th key={h} style={{
                  padding: '10px 12px', textAlign: 'right',
                  fontWeight: 500, color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o, i) => (
              <tr key={o.id} style={{ borderBottom: i < orders.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '10px 12px', fontWeight: 500 }}>{o.customer_name}</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', direction: 'ltr' }}>{o.customer_phone}</td>
                <td style={{ padding: '10px 12px' }}>{o.product_name}</td>
                <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--primary)' }}>{o.total_amount.toFixed(2)}₪</td>
                <td style={{ padding: '10px 12px' }}>
                  <span className="badge" style={{ backgroundColor: strategyBg(o.strategy), color: strategyColor(o.strategy) }}>
                    {strategyLabel(o.strategy, o.deposit_percentage)}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                  {STATUS_LABEL[o.order_status] ?? o.order_status}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <EscrowStatus status={o.escrow_status} />
                </td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {formatDate(o.created_at)}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  {o.can_cancel && (
                    <button
                      onClick={() => onCancel(o.id)}
                      style={{
                        padding: '4px 10px', borderRadius: 6,
                        border: '1px solid var(--danger)',
                        color: 'var(--danger)', backgroundColor: 'var(--danger-light)',
                        cursor: 'pointer', fontSize: 12, fontWeight: 500,
                      }}
                    >
                      إلغاء
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
