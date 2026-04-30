import { useState, useEffect, useCallback } from 'react'
import Layout from '../components/Layout'
import EscrowStatus from '../components/EscrowStatus'
import { getDashboard, adminSimulate, adminReset, adminEvents } from '../lib/api'
import axios from 'axios'

interface Order {
  id: string
  product_name: string
  customer_name: string
  order_status: string
  escrow_status: string
  total_amount: number
}

interface EventItem {
  id: string
  timestamp: string
  description: string
  order_id: string | null
}

interface Result {
  ok: boolean
  message: string
}

async function checkBackend(): Promise<boolean> {
  try {
    console.log('🔍 Checking backend...')
    const response = await axios.get('http://127.0.0.1:8000/api/health', { timeout: 5000 })
    console.log('✅ Backend OK:', response.data)
    return true
  } catch (error: any) {
    console.error('❌ Backend check failed:', {
      code: error.code,
      message: error.message,
      status: error.response?.status,
    })
    return false
  }
}

function getErrorMsg(e: any): string {
  if (e?.code === 'ERR_NETWORK' || e?.code === 'ERR_CONNECTION_REFUSED') {
    return 'تعذّر الاتصال بالـ Backend — تأكدي أن uvicorn يعمل على المنفذ 8000'
  }
  if (e?.response?.data?.detail) return e.response.data.detail
  if (e?.response?.status) return `خطأ ${e.response.status}`
  return e?.message ?? 'خطأ غير معروف'
}

export default function AdminPanel() {
  const [backendOk, setBackendOk] = useState<boolean | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [events, setEvents] = useState<EventItem[]>([])
  const [result, setResult] = useState<Result | null>(null)
  const [resetting, setResetting] = useState(false)
  const [loadingOrders, setLoadingOrders] = useState(true)

  /* ── Backend health ─────────────────────────────── */
  const pingBackend = useCallback(async () => {
    const ok = await checkBackend()
    setBackendOk(ok)
    return ok
  }, [])

  /* ── Fetch orders ───────────────────────────────── */
  const fetchOrders = useCallback(async () => {
    try {
      const d = await getDashboard('merchant-001')
      const list: Order[] = d.orders ?? []
      setOrders(list)
      setSelectedId(prev => prev || (list[0]?.id ?? ''))
      setBackendOk(true)
    } catch (e: any) {
      if (e?.code === 'ERR_NETWORK' || e?.code === 'ERR_CONNECTION_REFUSED') {
        setBackendOk(false)
      }
      setOrders([])
    } finally {
      setLoadingOrders(false)
    }
  }, [])

  /* ── Fetch events ───────────────────────────────── */
  const fetchEvents = useCallback(async () => {
    try {
      setEvents(await adminEvents())
    } catch {}
  }, [])

  /* ── Mount + polling ───────────────────────────── */
  useEffect(() => {
    pingBackend().then(ok => { if (ok) { fetchOrders(); fetchEvents() } })
    const t1 = setInterval(fetchOrders, 5000)
    const t2 = setInterval(fetchEvents, 3000)
    const t3 = setInterval(pingBackend, 8000)
    return () => { clearInterval(t1); clearInterval(t2); clearInterval(t3) }
  }, [pingBackend, fetchOrders, fetchEvents])

  /* ── Simulate action ───────────────────────────── */
  const run = async (action: string, label: string) => {
    if (!selectedId) { setResult({ ok: false, message: 'اختري طلباً أولاً' }); return }
    setResult(null)
    try {
      await adminSimulate(action, selectedId)
      setResult({ ok: true, message: `✅ تم — ${label}` })
      await fetchOrders()
      await fetchEvents()
    } catch (e: any) {
      setResult({ ok: false, message: `❌ ${getErrorMsg(e)}` })
    }
  }

  /* ── Reset ─────────────────────────────────────── */
  const handleReset = async () => {
    setResetting(true)
    setResult(null)
    try {
      await adminReset()
      setResult({ ok: true, message: '✅ تم إعادة تعيين البيانات' })
      setSelectedId('')
      await fetchOrders()
      await fetchEvents()
    } catch (e: any) {
      setResult({ ok: false, message: `❌ Reset فشل — ${getErrorMsg(e)}` })
    } finally {
      setResetting(false)
    }
  }

  const selectedOrder = orders.find(o => o.id === selectedId)

  function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString('ar-EG', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
  }

  const Btn = ({
    onClick, bg, color, border, disabled = false, children,
  }: {
    onClick: () => void; bg: string; color: string
    border?: string; disabled?: boolean; children: React.ReactNode
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1, padding: '10px 8px',
        border: border ?? 'none', borderRadius: 8,
        backgroundColor: disabled ? '#F3F4F6' : bg,
        color: disabled ? '#9CA3AF' : color,
        fontWeight: 600, fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
        transition: 'opacity 0.15s',
      }}
    >
      {children}
    </button>
  )

  return (
    <Layout>
      {/* ── Header ─────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>لوحة تحكم الديمو</h1>

        {/* Backend status badge */}
        <span style={{
          padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 500,
          backgroundColor: backendOk === null ? '#F3F4F6'
            : backendOk ? 'var(--primary-light)' : 'var(--danger-light)',
          color: backendOk === null ? '#6B7280'
            : backendOk ? 'var(--primary)' : 'var(--danger)',
        }}>
          {backendOk === null ? '⏳ يتحقق...'
            : backendOk ? '🟢 Backend متصل'
            : '🔴 Backend غير متصل'}
        </span>
      </div>

      {/* ── Backend offline warning ─────────────────── */}
      {backendOk === false && (
        <div style={{
          marginBottom: 20, padding: '14px 16px', borderRadius: 10,
          backgroundColor: 'var(--danger-light)', border: '1px solid #F5BDBD',
          color: 'var(--danger)',
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>⚠️ Backend غير شغّال</div>
          <div style={{ fontSize: 13 }}>
            شغّلي الـ Backend أولاً:
            <code style={{
              display: 'block', marginTop: 6, padding: '6px 10px',
              backgroundColor: '#FFF5F5', borderRadius: 6, direction: 'ltr',
              fontSize: 12, border: '1px solid #F5BDBD',
            }}>
              cd backend && venv\Scripts\uvicorn main:app --reload --port 8000
            </code>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* ── Left: Controls ─────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Order selector */}
          <div style={{ backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--text-secondary)' }}>
              اختري الطلب
            </label>

            {loadingOrders ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>جاري التحميل...</p>
            ) : orders.length === 0 ? (
              <p style={{ color: 'var(--danger)', fontSize: 13, margin: 0 }}>
                {backendOk === false ? 'Backend غير متصل' : 'لا توجد طلبات — اضغطي Reset'}
              </p>
            ) : (
              <select
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
                style={{
                  width: '100%', border: '1px solid var(--border)', borderRadius: 8,
                  padding: '8px 10px', fontSize: 13, backgroundColor: 'white',
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                  outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="">— اختري طلباً —</option>
                {orders.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.product_name} — {o.customer_name} [{o.escrow_status}]
                  </option>
                ))}
              </select>
            )}

            {selectedOrder && (
              <div style={{
                marginTop: 10, padding: '8px 10px', borderRadius: 8,
                backgroundColor: '#F9FAFB', fontSize: 12,
                display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>{selectedOrder.total_amount.toFixed(2)}₪</span>
                <EscrowStatus status={selectedOrder.escrow_status} />
                <span style={{ color: 'var(--text-secondary)', fontSize: 11, direction: 'ltr' }}>
                  {selectedOrder.id.slice(0, 8)}...
                </span>
              </div>
            )}
          </div>

          {/* Simulation buttons */}
          <div style={{ backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem' }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, color: 'var(--text-secondary)' }}>
              محاكاة الأحداث
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn bg="var(--primary)" color="white" onClick={() => run('delivered', 'السائق سلّم')} disabled={!backendOk || !selectedId}>
                  📦 السائق سلّم
                </Btn>
                <Btn bg="var(--danger-light)" color="var(--danger)" border="1px solid var(--danger)" onClick={() => run('refused', 'الزبون رفض')} disabled={!backendOk || !selectedId}>
                  ❌ الزبون رفض
                </Btn>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn bg="var(--primary-light)" color="var(--primary)" border="1px solid var(--primary)" onClick={() => run('customer-confirm', 'الزبون أكد')} disabled={!backendOk || !selectedId}>
                  ✅ الزبون أكد
                </Btn>
                <Btn bg="var(--amber-light)" color="var(--amber)" border="1px solid var(--amber)" onClick={() => run('48h', '48h انتهت')} disabled={!backendOk || !selectedId}>
                  ⏰ 48h انتهت
                </Btn>
              </div>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div style={{
              padding: '10px 14px', borderRadius: 10,
              backgroundColor: result.ok ? 'var(--primary-light)' : 'var(--danger-light)',
              color: result.ok ? 'var(--primary)' : 'var(--danger)',
              border: `1px solid ${result.ok ? '#A7D7C5' : '#F5BDBD'}`,
              fontWeight: 500, fontSize: 13, lineHeight: 1.5,
            }}>
              {result.message}
            </div>
          )}

          {/* Reset */}
          <div style={{ backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem' }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
              إعادة تعيين كاملة للبيانات (يُرجع الـ seed data)
            </div>
            <button
              onClick={handleReset}
              disabled={resetting || backendOk === false}
              style={{
                width: '100%', padding: '10px', borderRadius: 8,
                border: '1px solid var(--danger)',
                backgroundColor: (resetting || backendOk === false) ? '#F3F4F6' : 'var(--danger-light)',
                color: (resetting || backendOk === false) ? '#9CA3AF' : 'var(--danger)',
                fontWeight: 600, fontSize: 13,
                cursor: (resetting || backendOk === false) ? 'not-allowed' : 'pointer',
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
              }}
            >
              {resetting ? 'جاري الإعادة...' : '🔄 Reset كل البيانات'}
            </button>
          </div>

          {/* Quick links */}
          <div style={{ backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem' }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, color: 'var(--text-secondary)' }}>روابط سريعة</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <a href="/dashboard" target="_blank" style={{ color: 'var(--primary)', fontSize: 13, textDecoration: 'none' }}>
                ↗ لوحة التاجر
              </a>
              <a href="/delivery-company" target="_blank" style={{ color: 'var(--primary)', fontSize: 13, textDecoration: 'none' }}>
                🚚 شركة التوصيل (إنشاء طلب)
              </a>
              <a href="/driver" target="_blank" style={{ color: 'var(--primary)', fontSize: 13, textDecoration: 'none' }}>
                🛵 واجهة السائق
              </a>
              {selectedOrder && (
                <a href={`/pay/${selectedOrder.id}`} target="_blank" style={{ color: 'var(--blue)', fontSize: 13, textDecoration: 'none' }}>
                  ↗ صفحة دفع الطلب المختار
                </a>
              )}
              <a href="http://localhost:8000/docs" target="_blank" style={{ color: 'var(--text-secondary)', fontSize: 13, textDecoration: 'none' }}>
                ↗ API Docs
              </a>
            </div>
          </div>
        </div>

        {/* ── Right: Events feed ─────────────────────── */}
        <div style={{
          backgroundColor: 'white', border: '1px solid var(--border)',
          borderRadius: 12, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>سجل الأحداث</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🔄 كل 3 ثوانٍ</span>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 480 }}>
            {events.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem', fontSize: 13, margin: 0 }}>
                {backendOk === false ? 'Backend غير متصل' : 'لا توجد أحداث بعد'}
              </p>
            ) : (
              events.map(ev => (
                <div key={ev.id} style={{
                  padding: '10px 16px', borderBottom: '1px solid var(--border)',
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                }}>
                  <span style={{
                    fontSize: 11, color: 'var(--text-secondary)',
                    minWidth: 60, direction: 'ltr', paddingTop: 2, flexShrink: 0,
                  }}>
                    {fmtTime(ev.timestamp)}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.4 }}>
                    {ev.description}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Orders table ───────────────────────────── */}
      <div style={{ marginTop: 24, backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{
          padding: '12px 16px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>جميع الطلبات ({orders.length})</span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>اضغطي على طلب لاختياره</span>
        </div>

        {orders.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem', fontSize: 13, margin: 0 }}>
            {backendOk === false ? 'Backend غير متصل — شغّليه أولاً' : 'لا توجد طلبات — اضغطي Reset'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB' }}>
                  {['الزبون', 'المنتج', 'المبلغ', 'حالة الطلب', 'Escrow'].map(h => (
                    <th key={h} style={{
                      padding: '8px 12px', textAlign: 'right',
                      fontWeight: 500, color: 'var(--text-secondary)',
                      borderBottom: '1px solid var(--border)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr
                    key={o.id}
                    onClick={() => setSelectedId(o.id)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: o.id === selectedId ? 'var(--primary-light)' : 'transparent',
                      borderBottom: i < orders.length - 1 ? '1px solid var(--border)' : 'none',
                      transition: 'background-color 0.1s',
                    }}
                  >
                    <td style={{ padding: '8px 12px' }}>{o.customer_name}</td>
                    <td style={{ padding: '8px 12px' }}>{o.product_name}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--primary)' }}>{o.total_amount.toFixed(2)}₪</td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', fontSize: 12 }}>{o.order_status}</td>
                    <td style={{ padding: '8px 12px' }}><EscrowStatus status={o.escrow_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
