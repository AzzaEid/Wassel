import { useState, useEffect, useCallback } from 'react'
import Layout from '../components/Layout'
import StatsGrid from '../components/StatsGrid'
import OrdersTable from '../components/OrdersTable'
import RiskBadge from '../components/RiskBadge'
import StrategyCard from '../components/StrategyCard'
import { getDashboard, getScoring, createOrder, cancelOrder } from '../lib/api'

const MERCHANT_ID = 'merchant-001'

export default function Dashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Phone check
  const [phone, setPhone] = useState('')
  const [checking, setChecking] = useState(false)
  const [scoring, setScoring] = useState<any>(null)

  // Order form
  const [product, setProduct] = useState('')
  const [amount, setAmount] = useState('')
  const [address, setAddress] = useState('')
  const [creating, setCreating] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const d = await getDashboard(MERCHANT_ID)
      setData(d)
    } catch (error: any) {
      console.error('Dashboard fetch error:', error)
    }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 5000)
    return () => clearInterval(id)
  }, [fetchData])

  const handleCheck = async () => {
    if (!phone.trim()) return
    setChecking(true)
    setScoring(null)
    setCreatedOrder(null)
    try {
      const s = await getScoring(phone.trim())
      setScoring(s)
    } finally { setChecking(false) }
  }

  const handleCreate = async () => {
    if (!product || !amount || !scoring) return
    setCreating(true)
    try {
      const order = await createOrder({
        merchant_id: MERCHANT_ID,
        customer_phone: phone.trim(),
        customer_name: scoring.customer_name ?? undefined,
        product_name: product,
        amount: parseFloat(amount),
        delivery_address: address || undefined,
      })
      setCreatedOrder(order)
      setPhone(''); setProduct(''); setAmount(''); setAddress(''); setScoring(null)
      fetchData()
    } finally { setCreating(false) }
  }

  const handleCancel = async (id: string) => {
    try { await cancelOrder(id); fetchData() } catch {}
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(createdOrder.payment_url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const amountNum = parseFloat(amount) || 0

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        جاري التحميل...
      </div>
    )
  }

  return (
    <Layout merchantName={data?.merchant?.name} balance={data?.merchant?.balance}>

      {/* Stats */}
      {data?.stats && <StatsGrid stats={data.stats} />}

      {/* New Order */}
      <div style={{ marginTop: 24, backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: 16, fontWeight: 600 }}>إنشاء طلب جديد</h2>

        {/* Phone row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCheck()}
            placeholder="رقم هاتف الزبون (+970...)"
            style={{
              flex: 1, border: '1px solid var(--border)', borderRadius: 8,
              padding: '8px 12px', fontSize: 14, textAlign: 'right',
              outline: 'none',
            }}
          />
          <button
            onClick={handleCheck}
            disabled={checking || !phone.trim()}
            className="btn-primary"
            style={{ whiteSpace: 'nowrap', padding: '8px 20px' }}
          >
            {checking ? '...' : 'تحقق'}
          </button>
        </div>

        {/* Scoring result */}
        {scoring && (
          <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', backgroundColor: '#FAFAFA' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <RiskBadge score={scoring.risk_score} />
              {scoring.customer_name
                ? <span style={{ fontWeight: 600 }}>{scoring.customer_name}</span>
                : <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>زبون جديد — سيُنشأ حسابه تلقائياً</span>}
            </div>
            <StrategyCard scoring={scoring} amount={amountNum} />
          </div>
        )}

        {/* Order form — shown after phone check */}
        {scoring && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              value={product}
              onChange={e => setProduct(e.target.value)}
              placeholder="اسم المنتج"
              style={{
                border: '1px solid var(--border)', borderRadius: 8,
                padding: '8px 12px', fontSize: 14, textAlign: 'right', outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                value={amount}
                onChange={e => setAmount(e.target.value)}
                type="number"
                placeholder="المبلغ (₪)"
                style={{
                  flex: 1, border: '1px solid var(--border)', borderRadius: 8,
                  padding: '8px 12px', fontSize: 14, textAlign: 'right', outline: 'none',
                }}
              />
              <input
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="عنوان التوصيل"
                style={{
                  flex: 2, border: '1px solid var(--border)', borderRadius: 8,
                  padding: '8px 12px', fontSize: 14, textAlign: 'right', outline: 'none',
                }}
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={creating || !product || !amount}
              className="btn-primary"
              style={{ padding: '10px', fontSize: 14 }}
            >
              {creating ? 'جاري الإنشاء...' : 'إنشاء رابط الدفع'}
            </button>
          </div>
        )}

        {/* Created order */}
        {createdOrder && (
          <div style={{
            marginTop: 16, padding: '14px 16px', borderRadius: 10,
            backgroundColor: 'var(--primary-light)', border: '1px solid #A7D7C5',
          }}>
            <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 8, fontSize: 14 }}>
              ✅ تم إنشاء رابط الدفع
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <code style={{
                flex: 1, backgroundColor: 'white', borderRadius: 6,
                padding: '6px 10px', fontSize: 12, border: '1px solid var(--border)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                direction: 'ltr', display: 'block',
              }}>
                {createdOrder.payment_url}
              </code>
              <button
                onClick={handleCopy}
                style={{
                  backgroundColor: copied ? '#16A34A' : 'var(--primary)',
                  color: 'white', border: 'none', borderRadius: 6,
                  padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                {copied ? '✓ تم النسخ' : 'نسخ الرابط'}
              </button>
              <a
                href={createdOrder.payment_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: 'var(--blue)', color: 'white', borderRadius: 6,
                  padding: '6px 14px', fontSize: 13, fontWeight: 500,
                  textDecoration: 'none', whiteSpace: 'nowrap',
                }}
              >
                فتح ↗
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Orders table */}
      <div style={{ marginTop: 24 }}>
        <OrdersTable orders={data?.orders ?? []} onCancel={handleCancel} />
      </div>

      {/* Polling indicator */}
      <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
        🔄 يتحدث تلقائياً كل 5 ثوانٍ
      </div>
    </Layout>
  )
}
