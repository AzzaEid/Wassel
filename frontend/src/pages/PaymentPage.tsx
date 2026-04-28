import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import PaymentOptions from '../components/PaymentOptions'
import { getOrderStatus, processPayment, confirmDelivery, reportDispute } from '../lib/api'

export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<'deposit' | 'full'>('deposit')

  // Card form
  const [cards, setCards] = useState(['4242', '4242', '4242', '4242'])
  const [expiry, setExpiry] = useState('12/28')
  const [cvv, setCvv] = useState('123')

  const [paying, setPaying] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [disputing, setDisputing] = useState(false)

  const fetchOrder = useCallback(async () => {
    if (!orderId) return
    try {
      const d = await getOrderStatus(orderId)
      setOrder(d)
      if (d.strategy === 'deposit') setSelectedType('deposit')
      else setSelectedType('full')
    } catch {}
    finally { setLoading(false) }
  }, [orderId])

  useEffect(() => {
    fetchOrder()
    const id = setInterval(fetchOrder, 5000)
    return () => clearInterval(id)
  }, [fetchOrder])

  const handlePay = async () => {
    if (!orderId) return
    setPaying(true)
    try {
      await processPayment(orderId, selectedType)
      await fetchOrder()
    } finally { setPaying(false) }
  }

  const handleConfirm = async () => {
    if (!orderId) return
    setConfirming(true)
    try {
      await confirmDelivery(orderId)
      await fetchOrder()
    } finally { setConfirming(false) }
  }

  const handleDispute = async () => {
    if (!orderId) return
    setDisputing(true)
    try {
      await reportDispute(orderId)
      await fetchOrder()
    } finally { setDisputing(false) }
  }

  const payAmount = order
    ? (selectedType === 'deposit' ? order.deposit_amount : order.total_amount)
    : 0

  if (loading) {
    return (
      <PageShell>
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          جاري التحميل...
        </div>
      </PageShell>
    )
  }

  if (!order) {
    return (
      <PageShell>
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger)' }}>
          الطلب غير موجود
        </div>
      </PageShell>
    )
  }

  const status = order.order_status
  const escrow = order.escrow_status

  /* ── Completed ─────────────────────────────────── */
  if (status === 'completed' || escrow === 'released' || escrow === 'auto_released') {
    return (
      <PageShell>
        <StatusScreen
          icon="🎉" title="شكراً! تم إتمام الطلب بنجاح"
          sub="نأمل أن تكون راضياً عن تجربتك مع وصّل"
          color="var(--primary)" bg="var(--primary-light)"
        />
      </PageShell>
    )
  }

  /* ── Disputed ───────────────────────────────────── */
  if (status === 'disputed' || escrow === 'frozen') {
    return (
      <PageShell>
        <StatusScreen
          icon="⚠️" title="تم الإبلاغ عن مشكلة"
          sub="تم إعادة مبلغك (بعد خصم تكلفة التوصيل). تواصل مع المتجر لمزيد من التفاصيل."
          color="var(--amber)" bg="var(--amber-light)"
        />
      </PageShell>
    )
  }

  /* ── Returned / Refunded ────────────────────────── */
  if (status === 'returned' || escrow === 'refunded') {
    return (
      <PageShell>
        <StatusScreen
          icon="↩️" title="تم إعادة المبلغ إليك"
          sub="تم معالجة الإعادة بنجاح."
          color="var(--blue)" bg="var(--blue-light)"
        />
      </PageShell>
    )
  }

  /* ── Cancelled ──────────────────────────────────── */
  if (status === 'cancelled') {
    return (
      <PageShell>
        <StatusScreen
          icon="❌" title="تم إلغاء هذا الطلب"
          sub="تواصل مع المتجر للحصول على مزيد من المعلومات."
          color="var(--danger)" bg="var(--danger-light)"
        />
      </PageShell>
    )
  }

  /* ── Expired ────────────────────────────────────── */
  if (status === 'expired') {
    return (
      <PageShell>
        <StatusScreen
          icon="⏰" title="انتهت صلاحية هذا الرابط"
          sub="صلاحية رابط الدفع 24 ساعة. تواصل مع المتجر للحصول على رابط جديد."
          color="var(--text-secondary)" bg="#F3F4F6"
        />
      </PageShell>
    )
  }

  /* ── Driver Delivered → Confirm / Dispute ────────── */
  if (status === 'driver_delivered') {
    return (
      <PageShell>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📦</div>
          <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>وصل طلبك!</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>
            هل كل شيء مطابق للطلب؟
          </p>
        </div>

        <OrderInfoCard order={order} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
          <button
            onClick={handleConfirm}
            disabled={confirming}
            style={{
              width: '100%', padding: '14px', borderRadius: 10,
              backgroundColor: 'var(--primary)', color: 'white',
              border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer',
            }}
          >
            {confirming ? 'جاري المعالجة...' : '✅ تأكيد الاستلام'}
          </button>
          <button
            onClick={handleDispute}
            disabled={disputing}
            style={{
              width: '100%', padding: '14px', borderRadius: 10,
              backgroundColor: 'var(--danger-light)', color: 'var(--danger)',
              border: '1px solid var(--danger)', fontWeight: 600, fontSize: 15, cursor: 'pointer',
            }}
          >
            {disputing ? 'جاري المعالجة...' : '⚠️ في مشكلة'}
          </button>
        </div>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)' }}>
          🔒 مبلغك محمي في Escrow حتى تؤكد الاستلام
        </div>
      </PageShell>
    )
  }

  /* ── Paid → Waiting ─────────────────────────────── */
  if (status === 'deposit_paid' || status === 'fully_paid') {
    const paidAmount = status === 'deposit_paid' ? order.deposit_amount : order.total_amount
    const remaining = status === 'deposit_paid' ? (order.total_amount - order.deposit_amount) : 0

    return (
      <PageShell>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
          <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>
            تم الدفع بنجاح
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>
            رقم الطلب: <code style={{ backgroundColor: '#F3F4F6', padding: '2px 6px', borderRadius: 4, direction: 'ltr', display: 'inline-block' }}>{order.id.slice(0, 12)}...</code>
          </p>
        </div>

        <div style={{
          backgroundColor: 'var(--primary-light)', borderRadius: 12, padding: '1rem',
          marginBottom: 16, border: '1px solid #A7D7C5',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>المبلغ المدفوع</span>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary)' }}>{paidAmount.toFixed(2)}₪</span>
          </div>
          {remaining > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>المتبقي عند الاستلام</span>
              <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--amber)' }}>{remaining.toFixed(2)}₪</span>
            </div>
          )}
        </div>

        <div style={{
          backgroundColor: 'var(--blue-light)', borderRadius: 10, padding: '12px 14px',
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 18 }}>🔒</span>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--blue)', fontSize: 14 }}>مبلغك محمي في Escrow</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              زر تأكيد الاستلام سيظهر تلقائياً عند وصول طلبك
            </div>
          </div>
        </div>
      </PageShell>
    )
  }

  /* ── Pending → Payment Form ─────────────────────── */
  return (
    <PageShell>
      {/* Order info */}
      <OrderInfoCard order={order} />

      {/* Payment options */}
      <div style={{ marginTop: 20 }}>
        <h3 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 600 }}>اختر طريقة الدفع</h3>
        <PaymentOptions
          strategy={order.strategy}
          depositPercentage={order.deposit_percentage}
          depositAmount={order.deposit_amount}
          totalAmount={order.total_amount}
          selected={selectedType}
          onSelect={setSelectedType}
        />
      </div>

      {/* Mock card form */}
      <div style={{
        marginTop: 20, padding: '1rem', borderRadius: 12,
        border: '1px solid var(--border)', backgroundColor: 'white',
      }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 10 }}>
          💳 بيانات البطاقة (تجريبي)
        </div>

        {/* Card number - 4 groups */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, direction: 'ltr' }}>
          {cards.map((v, i) => (
            <input
              key={i}
              value={v}
              onChange={e => {
                const next = [...cards]
                next[i] = e.target.value.slice(0, 4)
                setCards(next)
              }}
              maxLength={4}
              style={{
                flex: 1, border: '1px solid var(--border)', borderRadius: 6,
                padding: '8px', fontSize: 14, textAlign: 'center',
                letterSpacing: 3, outline: 'none',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, direction: 'ltr' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>MM/YY</label>
            <input
              value={expiry}
              onChange={e => setExpiry(e.target.value)}
              placeholder="12/28"
              style={{
                width: '100%', border: '1px solid var(--border)', borderRadius: 6,
                padding: '8px', fontSize: 14, textAlign: 'center', outline: 'none',
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>CVV</label>
            <input
              value={cvv}
              onChange={e => setCvv(e.target.value)}
              maxLength={3}
              style={{
                width: '100%', border: '1px solid var(--border)', borderRadius: 6,
                padding: '8px', fontSize: 14, textAlign: 'center', outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Pay button */}
      <button
        onClick={handlePay}
        disabled={paying}
        style={{
          width: '100%', marginTop: 16, padding: '14px',
          backgroundColor: paying ? '#9CA3AF' : 'var(--primary)',
          color: 'white', border: 'none', borderRadius: 10,
          fontWeight: 700, fontSize: 16, cursor: paying ? 'not-allowed' : 'pointer',
        }}
      >
        {paying ? 'جاري المعالجة...' : `ادفع ${payAmount.toFixed(2)}₪ الآن`}
      </button>

      {/* Trust banner */}
      <div style={{
        marginTop: 14, textAlign: 'center', fontSize: 13,
        color: 'var(--text-secondary)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        🔒 مبلغك محمي — يُعاد إليك إذا لم يصل طلبك
      </div>
    </PageShell>
  )
}

/* ── Sub-components ─────────────────────────────────────── */

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh', backgroundColor: 'var(--bg)',
      display: 'flex', justifyContent: 'center',
      padding: '1.5rem 1rem',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>{children}</div>
    </div>
  )
}

function OrderInfoCard({ order }: { order: any }) {
  return (
    <div style={{
      backgroundColor: 'white', borderRadius: 12,
      border: '1px solid var(--border)', padding: '1rem',
      marginBottom: 4,
    }}>
      {order.merchant_name && (
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
          {order.merchant_name}
        </div>
      )}
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{order.product_name}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>المبلغ الكلي</span>
        <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary)' }}>
          {order.total_amount?.toFixed(2)}₪
        </span>
      </div>
    </div>
  )
}

function StatusScreen({ icon, title, sub, color, bg }: {
  icon: string; title: string; sub: string; color: string; bg: string
}) {
  return (
    <div style={{
      textAlign: 'center', padding: '3rem 1.5rem',
      backgroundColor: bg, borderRadius: 16,
      border: `1px solid ${color}33`,
    }}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>{icon}</div>
      <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color }}>{title}</h2>
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{sub}</p>
    </div>
  )
}
