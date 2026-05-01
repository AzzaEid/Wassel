import { useState } from 'react'
import Layout from '../components/Layout'
import FloatingNav from '../components/FloatingNav'
import { sendDeliveryWebhook } from '../lib/api'

function Field({ label, value, onChange, placeholder, type = 'text', required = false }: {
  label: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string; type?: string; required?: boolean
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-secondary)' }}>
        {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
      </label>
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        style={{
          width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
          borderRadius: 8, fontSize: 14, backgroundColor: 'white',
          fontFamily: "'IBM Plex Sans Arabic', sans-serif",
          outline: 'none', boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

interface FormData {
  product_name: string; customer_name: string
  customer_phone: string; amount: string; delivery_address: string
}
const EMPTY: FormData = { product_name: '', customer_name: '', customer_phone: '', amount: '', delivery_address: '' }

export default function DeliveryCompanyPage() {
  const [form, setForm] = useState<FormData>(EMPTY)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setError(null); setResult(null)
    const amount = parseFloat(form.amount)
    if (!form.product_name || !form.customer_phone || isNaN(amount) || amount <= 0) {
      setError('يرجى ملء جميع الحقول المطلوبة بشكل صحيح'); return
    }
    setLoading(true)
    try {
      const data = await sendDeliveryWebhook({
        event: 'shipment.created',
        merchant_id: 'merchant-001',
        customer_phone: form.customer_phone,
        customer_name: form.customer_name || undefined,
        product_name: form.product_name,
        total_amount: amount,
        delivery_address: form.delivery_address || undefined,
      })
      setResult(data)
      setForm(EMPTY)
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? 'حدث خطأ')
    } finally { setLoading(false) }
  }

  return (
    <Layout>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', backgroundColor: 'var(--primary-light)',
            margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
          }}>🚚</div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700 }}>شركة التوصيل</h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>
            أدخل تفاصيل الطرد لإنشاء طلب دفع تلقائياً عبر وصّل
          </p>
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="اسم المنتج / الطرد" value={form.product_name}
              onChange={set('product_name')} placeholder="مثال: جوال سامسونج" required />
            <Field label="اسم الزبون" value={form.customer_name} onChange={set('customer_name')}
              placeholder="مثال: محمد عبدالله" />
            <Field label="رقم هاتف الزبون" value={form.customer_phone}
              onChange={set('customer_phone')} placeholder="+970599100002" type="tel" required />
            <Field label="المبلغ (₪)" value={form.amount} onChange={set('amount')}
              placeholder="مثال: 350" type="number" required />
            <Field label="عنوان التسليم" value={form.delivery_address}
              onChange={set('delivery_address')} placeholder="مثال: رام الله، شارع الإرسال" />

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 8, backgroundColor: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid #F5BDBD', fontSize: 13 }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} style={{
              padding: '12px', borderRadius: 10, border: 'none',
              backgroundColor: loading ? '#D1D5DB' : 'var(--primary)',
              color: 'white', fontWeight: 700, fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            }}>
              {loading ? 'جاري الإرسال...' : '📦 إرسال الطلب للزبون'}
            </button>
          </form>
        </div>

        {result && (
          <div style={{ marginTop: 20, backgroundColor: 'white', border: '2px solid var(--primary)', borderRadius: 14, padding: '1.25rem' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', marginBottom: 10 }}>
              ✅ تم إنشاء الطلب — شارك رابط الدفع مع الزبون:
            </div>
            <div style={{ padding: '10px 12px', backgroundColor: 'var(--primary-light)', borderRadius: 8, fontSize: 13, direction: 'ltr', wordBreak: 'break-all', marginBottom: 12, fontFamily: 'monospace', color: 'var(--primary)' }}>
              {result.payment_url}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => navigator.clipboard.writeText(result.payment_url)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--primary)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
                📋 نسخ الرابط
              </button>
              <a href={result.payment_url} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '9px', borderRadius: 8, backgroundColor: 'var(--primary)', color: 'white', fontWeight: 600, fontSize: 13, textDecoration: 'none', textAlign: 'center', fontFamily: "'IBM Plex Sans Arabic', sans-serif", display: 'block' }}>
                ↗ فتح الرابط
              </a>
            </div>
          </div>
        )}
      </div>
      <FloatingNav />
    </Layout>
  )
}
