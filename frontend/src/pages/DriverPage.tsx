import { useState, useEffect, useCallback } from 'react'
import Layout from '../components/Layout'
import { getDeliveryQueue, fireDriverAction } from '../lib/api'

interface QueueItem {
  id: string
  product_name: string
  customer_name: string
  customer_phone: string
  delivery_address: string | null
  total_amount: number
  order_status: string
  escrow_status: string
}

type ActionState = 'idle' | 'loading' | 'delivered' | 'refused' | 'error'

export default function DriverPage() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionStates, setActionStates] = useState<Record<string, ActionState>>({})
  const [messages, setMessages] = useState<Record<string, string>>({})

  const fetchQueue = useCallback(async () => {
    try {
      const data = await getDeliveryQueue()
      setQueue(data)
    } catch {
      // keep last state
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQueue()
    const t = setInterval(fetchQueue, 5000)
    return () => clearInterval(t)
  }, [fetchQueue])

  const act = async (orderId: string, action: 'delivered' | 'refused') => {
    setActionStates(s => ({ ...s, [orderId]: 'loading' }))
    setMessages(m => ({ ...m, [orderId]: '' }))
    try {
      await fireDriverAction(action, orderId)
      const newState = action === 'delivered' ? 'delivered' : 'refused'
      setActionStates(s => ({ ...s, [orderId]: newState }))
      setMessages(m => ({
        ...m,
        [orderId]: action === 'delivered'
          ? '✅ تم تسجيل التسليم — في انتظار تأكيد الزبون'
          : '↩️ تم تسجيل الرفض — سيتم استرداد المبلغ',
      }))
      setTimeout(fetchQueue, 800)
    } catch (e: any) {
      setActionStates(s => ({ ...s, [orderId]: 'error' }))
      setMessages(m => ({
        ...m,
        [orderId]: e?.response?.data?.detail ?? e?.message ?? 'حدث خطأ',
      }))
    }
  }

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          backgroundColor: '#FFF3CD',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
        }}>🛵</div>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>واجهة السائق</h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
            الطرود المدفوعة الجاهزة للتسليم — تحديث كل 5 ثوانٍ
          </p>
        </div>
        <span style={{
          marginRight: 'auto', padding: '4px 14px', borderRadius: 20,
          backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
          fontWeight: 600, fontSize: 13,
        }}>
          {queue.length} طرد
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', fontSize: 14 }}>
          جاري تحميل قائمة التسليم...
        </div>
      ) : queue.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '3rem',
          backgroundColor: 'white', border: '1px solid var(--border)',
          borderRadius: 14, color: 'var(--text-secondary)',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>لا توجد طرود جاهزة للتسليم</div>
          <div style={{ fontSize: 13 }}>ستظهر الطلبات هنا بعد أن يدفع الزبون</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {queue.map(item => {
            const state = actionStates[item.id] ?? 'idle'
            const isDone = state === 'delivered' || state === 'refused'
            const isLoading = state === 'loading'

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: 'white',
                  border: `1px solid ${isDone ? (state === 'delivered' ? '#A7D7C5' : '#F5BDBD') : 'var(--border)'}`,
                  borderRadius: 14, padding: '1.25rem',
                  opacity: isDone ? 0.75 : 1,
                  transition: 'opacity 0.3s, border-color 0.3s',
                }}
              >
                {/* Order info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                      {item.product_name}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {item.customer_name} — {item.customer_phone}
                    </div>
                    {item.delivery_address && (
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                        📍 {item.delivery_address}
                      </div>
                    )}
                  </div>
                  <div style={{
                    padding: '6px 14px', borderRadius: 20,
                    backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                    fontWeight: 700, fontSize: 15,
                  }}>
                    {item.total_amount.toFixed(2)}₪
                  </div>
                </div>

                {/* Status message */}
                {messages[item.id] && (
                  <div style={{
                    marginBottom: 12, padding: '8px 12px', borderRadius: 8, fontSize: 13,
                    backgroundColor: state === 'error' ? 'var(--danger-light)' : 'var(--primary-light)',
                    color: state === 'error' ? 'var(--danger)' : 'var(--primary)',
                    border: `1px solid ${state === 'error' ? '#F5BDBD' : '#A7D7C5'}`,
                  }}>
                    {messages[item.id]}
                  </div>
                )}

                {/* Action buttons */}
                {!isDone && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => act(item.id, 'delivered')}
                      disabled={isLoading}
                      style={{
                        flex: 1, padding: '11px', borderRadius: 9, border: 'none',
                        backgroundColor: isLoading ? '#D1D5DB' : 'var(--primary)',
                        color: 'white', fontWeight: 700, fontSize: 14,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                        transition: 'background-color 0.15s',
                      }}
                    >
                      {isLoading ? '...' : '✅ تم التسليم'}
                    </button>
                    <button
                      onClick={() => act(item.id, 'refused')}
                      disabled={isLoading}
                      style={{
                        flex: 1, padding: '11px', borderRadius: 9,
                        border: '1px solid var(--danger)',
                        backgroundColor: isLoading ? '#F3F4F6' : 'var(--danger-light)',
                        color: isLoading ? '#9CA3AF' : 'var(--danger)',
                        fontWeight: 700, fontSize: 14,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                        transition: 'background-color 0.15s',
                      }}
                    >
                      {isLoading ? '...' : '❌ رفض التسليم'}
                    </button>
                  </div>
                )}

                {isDone && (
                  <div style={{
                    padding: '10px', borderRadius: 9, textAlign: 'center',
                    backgroundColor: state === 'delivered' ? 'var(--primary-light)' : 'var(--danger-light)',
                    color: state === 'delivered' ? 'var(--primary)' : 'var(--danger)',
                    fontWeight: 600, fontSize: 14,
                  }}>
                    {state === 'delivered' ? '✅ تم التسليم' : '❌ مرفوض'}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Layout>
  )
}
