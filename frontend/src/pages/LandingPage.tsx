import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white', direction: 'rtl' }}>

      {/* Hero */}
      <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
          <h1 style={{ margin: '0 0 12px', fontSize: 32, fontWeight: 800, lineHeight: 1.3 }}>
            وصّل
          </h1>
          <p style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600, opacity: 0.95 }}>
            ثق بكل صفقة — مالك محمي حتى يصل طلبك
          </p>
          <p style={{ margin: '0 0 32px', fontSize: 15, opacity: 0.8, lineHeight: 1.7 }}>
            طبقة ثقة مالية ذكية تحل مشكلة الدفع عند الاستلام في التجارة الإلكترونية العربية.
            تحجز المبلغ في Escrow آمن — ولا يُحرَّر إلا بعد تأكيد الاستلام.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '13px 28px', borderRadius: 10, border: 'none',
                backgroundColor: 'white', color: 'var(--primary)',
                fontWeight: 700, fontSize: 15, cursor: 'pointer',
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
              }}
            >
              ابدأ كتاجر ←
            </button>
            <button
              onClick={() => navigate('/delivery-company')}
              style={{
                padding: '13px 28px', borderRadius: 10,
                border: '2px solid rgba(255,255,255,0.6)', backgroundColor: 'transparent',
                color: 'white', fontWeight: 600, fontSize: 15, cursor: 'pointer',
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
              }}
            >
              جرّب كشركة توصيل
            </button>
          </div>
        </div>
      </div>

      {/* Problem stats */}
      <div style={{ backgroundColor: '#FEF2F2', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { num: '15-20٪', label: 'طرود COD تُعاد في العالم العربي' },
            { num: '5-7 أيام', label: 'التاجر ينتظرها لاسترداد أمواله' },
            { num: '+20₪', label: 'تكلفة توصيل يتحملها التاجر على كل إعادة' },
          ].map(s => (
            <div key={s.num}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--danger)' }}>{s.num}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, maxWidth: 140 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: '3rem 1.5rem', maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 700, marginBottom: 32 }}>كيف تعمل وصّل؟</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { step: '01', title: 'التاجر يُنشئ طلباً', desc: 'وصّل تحسب درجة ثقة الزبون تلقائياً، وتختار استراتيجية الدفع المناسبة — عربون، دفع كامل، أو COD' },
            { step: '02', title: 'الزبون يدفع بأمان', desc: 'المبلغ يُحجز في Escrow محمي. لا يصل للتاجر ولا يُعاد للزبون إلا بعد تأكيد الاستلام.' },
            { step: '03', title: 'التسليم والتأكيد', desc: 'السائق يؤكد، الزبون يضغط "استلمت" — المبلغ يُحرَّر فوراً للتاجر. رفض؟ المبلغ يعود للزبون تلقائياً.' },
          ].map(s => (
            <div key={s.step} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--primary)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14, flexShrink: 0,
              }}>{s.step}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{s.title}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA footer */}
      <div style={{ backgroundColor: 'var(--primary-light)', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>
          جاهز لحماية أرباحك؟
        </h3>
        <p style={{ margin: '0 0 20px', color: 'var(--text-secondary)', fontSize: 14 }}>
          جرّب النموذج التجريبي الآن — لا يلزم تسجيل
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '13px 32px', borderRadius: 10, border: 'none',
            backgroundColor: 'var(--primary)', color: 'white',
            fontWeight: 700, fontSize: 15, cursor: 'pointer',
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
          }}
        >
          ابدأ الآن ←
        </button>
      </div>
    </div>
  )
}
