import { useState, useEffect, useCallback } from 'react'
import Layout from '../components/Layout'
import StatsGrid from '../components/StatsGrid'
import OrdersTable from '../components/OrdersTable'
import RiskBadge from '../components/RiskBadge'
import StrategyCard from '../components/StrategyCard'
import { getDashboard, getScoring, createOrder, cancelOrder } from '../lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

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
  const [customerName, setCustomerName] = useState('')
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

  const isNewCustomer = scoring && !scoring.customer_name

  const handleCreate = async () => {
    if (!product || !amount || !scoring) return
    if (isNewCustomer && !customerName.trim()) return
    setCreating(true)
    try {
      const order = await createOrder({
        merchant_id: MERCHANT_ID,
        customer_phone: phone.trim(),
        customer_name: (scoring.customer_name ?? customerName.trim()) || undefined,
        product_name: product,
        amount: parseFloat(amount),
        delivery_address: address || undefined,
      })
      setCreatedOrder(order)
      setPhone(''); setProduct(''); setAmount(''); setAddress(''); setScoring(null); setCustomerName('')
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

      {/* Impact Widget */}
      {data?.stats && data.stats.released_this_week > 0 && (
        <div style={{
          marginTop: 16, padding: '1rem 1.25rem', borderRadius: 12,
          background: 'linear-gradient(135deg, #1D6B4F 0%, #0D4A36 100%)',
          color: 'white', display: 'flex', gap: 24, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>💰 محمي في Escrow</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{data.stats.escrow_held.toFixed(0)}₪</div>
          </div>
          <div style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <div>
            <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>✅ محرَّر هذا الأسبوع</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{data.stats.released_this_week.toFixed(0)}₪</div>
          </div>
          <div style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <div>
            <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>🛡️ إعادات مُجنَّبة</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{data.stats.returned_count} × 20₪</div>
          </div>
          <div style={{ marginRight: 'auto', alignSelf: 'center', fontSize: 12, opacity: 0.7, maxWidth: 140 }}>
            بدون وصّل كنت خسرت تكاليف التوصيل على كل إعادة
          </div>
        </div>
      )}

      {/* Weekly Chart */}
      {data?.weekly_chart && data.weekly_chart.some((d: any) => d.amount > 0) && (
        <div style={{ marginTop: 16, backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>نشاط Escrow — آخر 7 أيام</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data.weekly_chart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <Tooltip formatter={(v: any) => [`${v}₪`, 'مدفوع']} />
              <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

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
            {scoring.ai_insight && (
              <div style={{
                marginTop: 10, padding: '10px 12px', borderRadius: 8,
                backgroundColor: '#F0FFF9', border: '1px solid #A7D7C5',
                fontSize: 13, color: '#1D6B4F', lineHeight: 1.6,
              }}>
                ✨ <strong>تحليل وصّل:</strong> {scoring.ai_insight}
              </div>
            )}
          </div>
        )}

        {/* Order form — shown after phone check */}
        {scoring && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isNewCustomer && (
              <input
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="اسم الزبون *"
                style={{
                  border: '1px solid var(--amber)', borderRadius: 8,
                  padding: '8px 12px', fontSize: 14, textAlign: 'right', outline: 'none',
                  backgroundColor: 'var(--amber-light)',
                }}
              />
            )}
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
              disabled={creating || !product || !amount || (isNewCustomer && !customerName.trim())}
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
