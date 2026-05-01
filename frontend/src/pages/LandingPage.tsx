import { useNavigate } from 'react-router-dom'

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#F3F8F5', direction: 'rtl', fontFamily: "'IBM Plex Sans Arabic', sans-serif", color: '#0F2318', overflowX: 'hidden' },

  /* ── NAV ── */
  nav: { position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(243,248,245,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(29,107,79,0.12)', padding: '0 5vw', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 },
  navLogo: { display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', cursor: 'pointer' },
  navLogoImg: { width: 32, height: 32, objectFit: 'contain' },
  navLogoText: { fontWeight: 900, fontSize: 20, color: '#1D6B4F', letterSpacing: -0.5 },
  navLinks: { display: 'flex', gap: 8, alignItems: 'center' },
  navLink: { padding: '8px 14px', borderRadius: 8, border: 'none', backgroundColor: 'transparent', color: '#4A6B5A', fontWeight: 500, fontSize: 14, cursor: 'pointer', fontFamily: "'IBM Plex Sans Arabic', sans-serif" },

  /* ── PRICING ── */
  pricingWrap: { padding: '5rem 5vw', maxWidth: 1100, margin: '0 auto' },
  pricingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 },
  priceCard: { background: 'white', border: '1px solid rgba(29,107,79,0.15)', borderRadius: 20, padding: '2rem', boxShadow: '0 2px 16px rgba(29,107,79,0.07)', position: 'relative', display: 'flex', flexDirection: 'column' },
  priceCardFeatured: { background: 'linear-gradient(145deg, #0A1A11, #1D4A35)', border: '2px solid #2A8B68', borderRadius: 20, padding: '2rem', boxShadow: '0 8px 40px rgba(29,107,79,0.25)', position: 'relative', display: 'flex', flexDirection: 'column', color: 'white' },
  priceBadge: { position: 'absolute', top: -12, right: '50%', transform: 'translateX(50%)', background: '#F59E0B', color: '#0A1A11', fontWeight: 800, fontSize: 11, padding: '4px 14px', borderRadius: 20, whiteSpace: 'nowrap' as const },
  priceLabel: { fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 8 },
  priceNum: { fontSize: 42, fontWeight: 900, lineHeight: 1, marginBottom: 4, fontFamily: "'Space Mono', monospace" },
  pricePeriod: { fontSize: 13, marginBottom: 20, opacity: 0.6 },
  priceDivider: { height: 1, background: 'rgba(29,107,79,0.1)', margin: '0 0 20px' },
  priceFeatureList: { display: 'flex', flexDirection: 'column', gap: 10, flex: 1, marginBottom: 24 },
  priceFeatureItem: { display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13 },
  priceBtn: { padding: '12px', borderRadius: 10, border: 'none', backgroundColor: '#1D6B4F', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'IBM Plex Sans Arabic', sans-serif", textAlign: 'center' as const },
  priceBtnFeatured: { padding: '12px', borderRadius: 10, border: 'none', backgroundColor: '#F59E0B', color: '#0A1A11', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: "'IBM Plex Sans Arabic', sans-serif", textAlign: 'center' as const },
  priceBtnGhost: { padding: '12px', borderRadius: 10, border: '1px solid rgba(29,107,79,0.25)', backgroundColor: 'transparent', color: '#1D6B4F', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: "'IBM Plex Sans Arabic', sans-serif", textAlign: 'center' as const },

  /* ── HERO ── */
  hero: { background: 'linear-gradient(145deg, #0A1A11 0%, #1D6B4F 55%, #0F2D1E 100%)', color: 'white', padding: '6rem 5vw 5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' },
  heroBadge: { display: 'inline-block', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 20, padding: '5px 16px', fontSize: 12, color: '#F59E0B', marginBottom: 24, letterSpacing: 1 },
  heroLogo: { width: 110, height: 110, margin: '0 auto 24px', filter: 'brightness(0) invert(1) drop-shadow(0 0 30px rgba(42,139,104,0.6))' },
  heroTitle: { margin: '0 0 8px', fontSize: 'clamp(42px, 9vw, 88px)', fontWeight: 900, lineHeight: 1.05, fontFamily: "'Cairo', sans-serif" },
  heroSub: { margin: '0 0 16px', fontSize: 'clamp(18px, 2.5vw, 26px)', fontWeight: 600, opacity: 0.9 },
  heroDesc: { margin: '0 auto 40px', maxWidth: 620, fontSize: 16, opacity: 0.72, lineHeight: 1.8 },
  heroButtons: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' },
  heroCta: { padding: '14px 32px', borderRadius: 12, border: 'none', backgroundColor: '#F59E0B', color: '#0A1A11', fontWeight: 800, fontSize: 16, cursor: 'pointer', fontFamily: "'IBM Plex Sans Arabic', sans-serif", boxShadow: '0 4px 24px rgba(245,158,11,0.35)', transition: 'transform 0.15s, box-shadow 0.15s' },
  heroGhost: { padding: '14px 32px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.35)', backgroundColor: 'transparent', color: 'white', fontWeight: 600, fontSize: 15, cursor: 'pointer', fontFamily: "'IBM Plex Sans Arabic', sans-serif" },
  heroGlow1: { position: 'absolute', top: '-30%', right: '-15%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(42,139,104,0.25) 0%, transparent 70%)', pointerEvents: 'none' },
  heroGlow2: { position: 'absolute', bottom: '-20%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)', pointerEvents: 'none' },

  /* ── TRUST BAR ── */
  trustBar: { backgroundColor: '#0F2318', color: 'white', padding: '18px 5vw', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(20px, 5vw, 60px)', flexWrap: 'wrap' },
  trustItem: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 },
  trustDot: { width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2A8B68', flexShrink: 0 },

  /* ── SECTION ── */
  section: { padding: '5rem 5vw', maxWidth: 1100, margin: '0 auto' },
  sectionLabel: { textAlign: 'center', fontSize: 12, fontWeight: 600, letterSpacing: 3, color: '#2A8B68', marginBottom: 10, textTransform: 'uppercase' },
  sectionTitle: { textAlign: 'center', fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 800, margin: '0 0 12px', fontFamily: "'Cairo', sans-serif" },
  sectionSub: { textAlign: 'center', fontSize: 15, color: '#4A6B5A', margin: '0 auto 48px', maxWidth: 580, lineHeight: 1.7 },

  /* ── PROBLEM STATS ── */
  statsWrap: { background: 'linear-gradient(135deg, #FEF3C7 0%, #FFF7ED 100%)', borderRadius: 20, padding: '3rem 5vw', margin: '4rem 5vw' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, maxWidth: 900, margin: '0 auto', textAlign: 'center' },
  statNum: { fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 900, color: '#92400E', lineHeight: 1, marginBottom: 8, fontFamily: "'Space Mono', monospace" },
  statLabel: { fontSize: 14, color: '#78350F', lineHeight: 1.5 },
  statTagline: { textAlign: 'center', marginTop: 28, fontSize: 16, fontWeight: 700, color: '#92400E', fontStyle: 'italic' },

  /* ── HOW IT WORKS ── */
  stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 },
  stepCard: { background: 'white', border: '1px solid rgba(29,107,79,0.15)', borderRadius: 16, padding: '2rem', boxShadow: '0 2px 16px rgba(29,107,79,0.07)', position: 'relative', overflow: 'hidden' },
  stepNum: { fontSize: 64, fontWeight: 900, color: 'rgba(29,107,79,0.07)', position: 'absolute', top: 12, left: 16, lineHeight: 1, fontFamily: "'Space Mono', monospace", userSelect: 'none' },
  stepIcon: { fontSize: 32, marginBottom: 14 },
  stepTitle: { fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#0F2318', fontFamily: "'Cairo', sans-serif" },
  stepDesc: { fontSize: 14, color: '#4A6B5A', lineHeight: 1.7 },
  stepAccent: { position: 'absolute', bottom: 0, right: 0, left: 0, height: 3, background: 'linear-gradient(90deg, #1D6B4F, #2A8B68)' },

  /* ── STRATEGY SPECTRUM ── */
  spectrumWrap: { background: 'linear-gradient(135deg, #0A1A11 0%, #0F2D1E 100%)', borderRadius: 24, padding: '3.5rem 5vw', margin: '0 0 5rem', color: 'white' },
  spectrumTitle: { textAlign: 'center', fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: 800, marginBottom: 8, fontFamily: "'Cairo', sans-serif" },
  spectrumSub: { textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 36 },
  spectrumGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 },
  specCard: { borderRadius: 12, padding: '16px 14px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' },
  specRange: { fontFamily: "'Space Mono', monospace", fontSize: 11, marginBottom: 8, opacity: 0.7 },
  specStrategy: { fontWeight: 700, fontSize: 14, marginBottom: 4, fontFamily: "'Cairo', sans-serif" },
  specDetail: { fontSize: 12, opacity: 0.65, lineHeight: 1.5 },
  specNote: { textAlign: 'center', marginTop: 24, fontSize: 13, color: 'rgba(245,158,11,0.85)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20 },

  /* ── FEATURES ── */
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 },
  featCard: { background: 'white', border: '1px solid rgba(29,107,79,0.13)', borderRadius: 14, padding: '1.75rem', boxShadow: '0 2px 12px rgba(29,107,79,0.06)' },
  featIcon: { fontSize: 30, marginBottom: 12 },
  featTitle: { fontSize: 16, fontWeight: 700, marginBottom: 6, fontFamily: "'Cairo', sans-serif" },
  featDesc: { fontSize: 13, color: '#4A6B5A', lineHeight: 1.65 },

  /* ── FOR WHO ── */
  audienceWrap: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 },
  audienceCard: { borderRadius: 16, padding: '2rem', border: '1.5px solid rgba(29,107,79,0.2)' },
  audienceRole: { fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' },
  audienceTitle: { fontSize: 20, fontWeight: 800, marginBottom: 12, fontFamily: "'Cairo', sans-serif" },
  audiencePain: { fontSize: 13, lineHeight: 1.7, marginBottom: 8 },

  /* ── CTA BANNER ── */
  ctaBanner: { background: 'linear-gradient(135deg, #1D6B4F 0%, #0A3A28 100%)', padding: '5rem 5vw', textAlign: 'center', color: 'white' },
  ctaTitle: { fontSize: 'clamp(26px, 5vw, 46px)', fontWeight: 900, margin: '0 0 14px', fontFamily: "'Cairo', sans-serif", lineHeight: 1.2 },
  ctaSub: { fontSize: 16, opacity: 0.75, margin: '0 0 36px', lineHeight: 1.6 },
  ctaBtn: { padding: '16px 40px', borderRadius: 14, border: 'none', backgroundColor: '#F59E0B', color: '#0A1A11', fontWeight: 800, fontSize: 17, cursor: 'pointer', fontFamily: "'IBM Plex Sans Arabic', sans-serif", boxShadow: '0 6px 30px rgba(245,158,11,0.4)', display: 'inline-block' },
  ctaSecondary: { display: 'block', marginTop: 18, fontSize: 13, color: 'rgba(255,255,255,0.5)' },

  /* ── FOOTER ── */
  footer: { backgroundColor: '#0F2318', color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '2rem 5vw', fontSize: 13 },
  footerLogo: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 },
  footerLogoImg: { width: 28, height: 28, objectFit: 'contain', filter: 'brightness(0) invert(1) opacity(0.7)' },
  footerLogoText: { color: 'rgba(255,255,255,0.75)', fontWeight: 800, fontSize: 17 },
}

const strategies = [
  { range: '0 — جديد', label: 'دفع كامل', detail: '100% مسبق', bg: 'rgba(220,38,38,0.15)', color: '#FCA5A5' },
  { range: '1 – 29', label: 'دفع كامل', detail: 'خطر مرتفع', bg: 'rgba(220,38,38,0.1)', color: '#FECACA' },
  { range: '30 – 59', label: 'عربون 30٪', detail: '30% الآن + 70% عند الاستلام', bg: 'rgba(245,158,11,0.12)', color: '#FCD34D' },
  { range: '60 – 79', label: 'عربون 20٪', detail: '20% الآن + 80% عند الاستلام', bg: 'rgba(16,185,129,0.12)', color: '#6EE7B7' },
  { range: '80 – 100', label: 'COD محمي', detail: '0% مسبق — الكل عند الاستلام', bg: 'rgba(16,185,129,0.2)', color: '#34D399' },
]

const features = [
  { icon: '🧠', title: 'ذكاء فوري بدون تسجيل', desc: 'رقم الهاتف فقط يكفي — وصّل تحسب درجة ثقة الزبون من سجل طلباته وتختار الاستراتيجية تلقائياً' },
  { icon: '🔒', title: 'Escrow محمي للطرفين', desc: 'المبلغ محجوز في حساب ضمان — لا يصل للتاجر ولا يُعاد للزبون إلا بعد التأكيد المزدوج' },
  { icon: '🔗', title: 'تكامل شركات التوصيل', desc: 'شركة التوصيل ترسل shipment.created webhook ووصّل تُنشئ الطلب وتولّد رابط الدفع تلقائياً' },
  { icon: '⚡', title: 'إطلاق تلقائي بعد 48 ساعة', desc: 'إذا لم يتفاعل الزبون — وصّل تُحرر الأموال للتاجر تلقائياً بعد 48 ساعة من التسليم' },
  { icon: '↩️', title: 'حماية عند الرفض', desc: 'الزبون رفض الاستلام؟ رسوم التوصيل فقط تُخصم والباقي يُعاد تلقائياً — بدون نزاع' },
  { icon: '📊', title: 'لوحة تحكم ذكية', desc: 'إحصائيات حية، مخطط المدفوعات الأسبوعي، وتحليل مخاطر كل زبون في مكان واحد' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={S.page}>

      {/* NAV */}
      <nav style={S.nav}>
        <span style={S.navLogo} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src="/wassel_logo.png" alt="وصّل" style={S.navLogoImg} />
          <span style={S.navLogoText}>وصّل</span>
        </span>
        <div style={S.navLinks}>
          <button style={S.navLink} onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>كيف تعمل؟</button>
          <button style={S.navLink} onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>التسعير</button>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', backgroundColor: '#1D6B4F', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
            ابدأ مجاناً ←
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={S.hero}>
        <div style={S.heroGlow1} />
        <div style={S.heroGlow2} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <img src="/wassel_logo.png" alt="وصّل" style={S.heroLogo} />
          <h1 style={S.heroTitle}>وصّل</h1>
          <p style={S.heroSub}>ادفع بأمان. <span style={{ color: '#F59E0B' }}>استلم بثقة.</span></p>
          <p style={S.heroDesc}>
            منصة ضمان مالي ذكية للتجارة الإلكترونية العربية — تحجز مدفوعات COD في حساب ضمان آمن
            وتختار استراتيجية الدفع المثلى لكل زبون تلقائياً بناءً على سجله.
          </p>
          <div style={S.heroButtons}>
            <button style={S.heroCta} onClick={() => navigate('/dashboard')}>
              ابدأ مجاناً ←
            </button>
            <button style={S.heroGhost} onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>
              كيف تعمل؟
            </button>
          </div>
          <p style={{ marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>لا بطاقة ائتمانية مطلوبة — الخطة المجانية فعّالة فوراً</p>
        </div>
      </div>

      {/* TRUST BAR */}
      <div style={S.trustBar}>
        {['98.5٪ من كل صفقة للتاجر', 'إطلاق تلقائي خلال 48 ساعة', 'تكامل كامل مع شركات التوصيل', 'لا عمولة على الطرود المُعادة'].map(t => (
          <div key={t} style={S.trustItem}>
            <span style={S.trustDot} />
            <span style={{ fontSize: 13, opacity: 0.8 }}>{t}</span>
          </div>
        ))}
      </div>

      {/* PROBLEM STATS */}
      <div style={S.statsWrap}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: '#92400E', marginBottom: 8 }}>المشكلة بالأرقام</div>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, color: '#78350F', fontFamily: "'Cairo', sans-serif", margin: 0 }}>
            COD كسر التجارة العربية — وصّل أصلحها
          </h2>
        </div>
        <div style={S.statsGrid}>
          {[
            { num: '80٪', label: 'من التجارة الإلكترونية العربية تعمل بنظام الدفع عند الاستلام' },
            { num: '20٪', label: 'من الطرود تُعاد — التاجر يخسر التوصيل والوقت والبضاعة' },
            { num: '7 أيام', label: 'متوسط انتظار التاجر لاسترداد أمواله المجمّدة' },
            { num: '$20B', label: 'حجم سوق BNPL في منطقة MENA — الفرصة هائلة' },
          ].map(s => (
            <div key={s.num}>
              <div style={S.statNum}>{s.num}</div>
              <div style={S.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
        <p style={S.statTagline}>"التاجر يخاطر بكل طلب — الزبون لا يثق — الكل يخسر"</p>
      </div>

      {/* HOW IT WORKS */}
      <div id="how" style={S.section}>
        <div style={S.sectionLabel}>كيف تعمل؟</div>
        <h2 style={S.sectionTitle}>ثلاث خطوات تحمي الجميع</h2>
        <p style={S.sectionSub}>وصّل تقف في المنتصف — تحمي التاجر من الإلغاء المجاني، وتحمي الزبون من الدفع دون ضمان</p>
        <div style={S.stepsGrid}>
          {[
            {
              n: '01', icon: '🧠',
              title: 'التاجر يُنشئ الطلب — وصّل تُحلّل',
              desc: 'بمجرد إدخال رقم هاتف الزبون، وصّل تحسب درجة ثقته تلقائياً وتختار الاستراتيجية المثلى: عربون 20٪ أو 30٪ أو دفع كامل أو COD محمي بالكامل — بدون تسجيل الزبون.',
            },
            {
              n: '02', icon: '🔒',
              title: 'الزبون يدفع — المبلغ يُحجز بأمان',
              desc: 'رابط دفع آمن يُرسل للزبون. المبلغ يدخل حساب Escrow محمي — لا يصل للتاجر ولا يُعاد للزبون حتى تنتهي رحلة الطلب بشكل صحيح.',
            },
            {
              n: '03', icon: '✅',
              title: 'التأكيد يُطلق الأموال',
              desc: 'السائق يُسلّم، الزبون يضغط "استلمت" — وصّل تُحرر 98.5٪ للتاجر فوراً. رفض الاستلام؟ رسوم التوصيل فقط تُخصم والباقي يُعاد تلقائياً.',
            },
          ].map(s => (
            <div key={s.n} style={S.stepCard}>
              <span style={S.stepNum}>{s.n}</span>
              <div style={S.stepIcon}>{s.icon}</div>
              <div style={S.stepTitle}>{s.title}</div>
              <div style={S.stepDesc}>{s.desc}</div>
              <div style={S.stepAccent} />
            </div>
          ))}
        </div>
      </div>

      {/* STRATEGY SPECTRUM */}
      <div style={{ padding: '0 5vw 5rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={S.spectrumWrap}>
          <div style={S.spectrumTitle}>بدلاً من "ادفع الكل أو لا تدفع شيئاً" —</div>
          <div style={{ textAlign: 'center', fontSize: 'clamp(18px, 3vw, 28px)', fontWeight: 800, color: '#F59E0B', marginBottom: 6, fontFamily: "'Cairo', sans-serif" }}>
            طيف ذكي يتكيّف مع كل زبون
          </div>
          <p style={S.spectrumSub}>وصّل تحسب درجة ثقة من 0 إلى 100 بناءً على سجل الزبون — وتختار تلقائياً</p>
          <div style={S.spectrumGrid}>
            {strategies.map(st => (
              <div key={st.range} style={{ ...S.specCard, background: st.bg }}>
                <div style={{ ...S.specRange, color: st.color }}>{st.range}</div>
                <div style={{ ...S.specStrategy, color: st.color }}>{st.label}</div>
                <div style={S.specDetail}>{st.detail}</div>
              </div>
            ))}
          </div>
          <p style={S.specNote}>
            ✨ معادلة الحساب: درجة الثقة = 100 − (معدل الإرجاع × 70) − عقوبة قلة التجربة
          </p>
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ ...S.section, paddingTop: 0 }}>
        <div style={S.sectionLabel}>المميزات</div>
        <h2 style={S.sectionTitle}>كل ما تحتاجه في منصة واحدة</h2>
        <p style={S.sectionSub}>مبنية خصيصاً لواقع التجارة العربية — لا حلول مستوردة</p>
        <div style={S.featuresGrid}>
          {features.map(f => (
            <div key={f.title} style={S.featCard}>
              <div style={S.featIcon}>{f.icon}</div>
              <div style={S.featTitle}>{f.title}</div>
              <div style={S.featDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PRICING */}
      <div id="pricing" style={S.pricingWrap}>
        <div style={S.sectionLabel}>التسعير</div>
        <h2 style={S.sectionTitle}>ابدأ مجاناً — ادفع مع النمو</h2>
        <p style={S.sectionSub}>لا التزامات مسبقة. غيّر خطتك في أي وقت.</p>
        <div style={S.pricingGrid}>

          {/* FREE */}
          <div style={S.priceCard}>
            <div style={{ ...S.priceLabel, color: '#4A6B5A' }}>مجاني</div>
            <div style={{ ...S.priceNum, color: '#0F2318' }}>0<span style={{ fontSize: 18, fontWeight: 500 }}>₪</span></div>
            <div style={{ ...S.pricePeriod, color: '#4A6B5A' }}>للأبد، بدون بطاقة</div>
            <div style={{ ...S.priceDivider, background: 'rgba(29,107,79,0.1)' }} />
            <div style={S.priceFeatureList}>
              {[
                { ok: true, text: 'حتى 20 طلب شهرياً' },
                { ok: true, text: 'Escrow آمن لكل طلب' },
                { ok: true, text: 'رابط دفع مخصص' },
                { ok: true, text: 'عمولة 1.5٪ فقط على الصفقات' },
                { ok: false, text: 'تكامل Webhook' },
                { ok: false, text: 'دعم ذو أولوية' },
              ].map(f => (
                <div key={f.text} style={S.priceFeatureItem}>
                  <span style={{ color: f.ok ? '#1D6B4F' : '#CBD5E1', flexShrink: 0, marginTop: 1 }}>{f.ok ? '✓' : '✗'}</span>
                  <span style={{ color: f.ok ? '#0F2318' : '#94A3B8' }}>{f.text}</span>
                </div>
              ))}
            </div>
            <button style={S.priceBtnGhost} onClick={() => navigate('/dashboard')}>ابدأ مجاناً</button>
          </div>

          {/* PRO — featured */}
          <div style={S.priceCardFeatured}>
            <div style={S.priceBadge}>الأكثر شيوعاً</div>
            <div style={{ ...S.priceLabel, color: 'rgba(255,255,255,0.6)' }}>تاجر</div>
            <div style={{ ...S.priceNum, color: 'white' }}>49<span style={{ fontSize: 18, fontWeight: 500 }}>₪</span></div>
            <div style={{ ...S.pricePeriod, color: 'rgba(255,255,255,0.5)' }}>شهرياً</div>
            <div style={{ ...S.priceDivider, background: 'rgba(255,255,255,0.1)' }} />
            <div style={S.priceFeatureList}>
              {[
                'طلبات غير محدودة',
                'عمولة مخفّضة 1٪',
                'Escrow + إطلاق تلقائي',
                'تحليل درجة ثقة الزبون',
                'مخطط مدفوعات أسبوعي',
                'دعم عبر واتساب',
              ].map(f => (
                <div key={f} style={S.priceFeatureItem}>
                  <span style={{ color: '#34D399', flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span style={{ color: 'rgba(255,255,255,0.85)' }}>{f}</span>
                </div>
              ))}
            </div>
            <button style={S.priceBtnFeatured} onClick={() => navigate('/dashboard')}>ابدأ الآن ←</button>
          </div>

          {/* ENTERPRISE */}
          <div style={S.priceCard}>
            <div style={{ ...S.priceLabel, color: '#4A6B5A' }}>شركات التوصيل</div>
            <div style={{ ...S.priceNum, color: '#0F2318', fontSize: 28, marginTop: 7 }}>تواصل معنا</div>
            <div style={{ ...S.pricePeriod, color: '#4A6B5A' }}>تسعير مخصص</div>
            <div style={{ ...S.priceDivider, background: 'rgba(29,107,79,0.1)' }} />
            <div style={S.priceFeatureList}>
              {[
                { ok: true, text: 'تكامل Webhook كامل' },
                { ok: true, text: 'عمولة 0.8٪ فقط' },
                { ok: true, text: 'API كاملة للمطورين' },
                { ok: true, text: 'صفحة سائق مخصصة' },
                { ok: true, text: 'لوحة إدارة متقدمة' },
                { ok: true, text: 'دعم فني مباشر' },
              ].map(f => (
                <div key={f.text} style={S.priceFeatureItem}>
                  <span style={{ color: '#1D6B4F', flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span style={{ color: '#0F2318' }}>{f.text}</span>
                </div>
              ))}
            </div>
            <button style={S.priceBtn} onClick={() => navigate('/delivery-company')}>جرّب التكامل</button>
          </div>

        </div>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#4A6B5A' }}>
          جميع الخطط تشمل: Escrow آمن · إطلاق تلقائي · حماية من الرفض · لوحة تاجر كاملة
        </p>
      </div>

      {/* FOR WHO */}
      <div style={{ padding: '0 5vw 5rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={S.sectionLabel}>لمن وصّل؟</div>
        <h2 style={{ ...S.sectionTitle, marginBottom: 36 }}>حلّ حقيقي لمشكلة حقيقية</h2>
        <div style={S.audienceWrap}>
          {[
            {
              color: '#1D6B4F', bg: 'rgba(29,107,79,0.04)',
              role: '🏪 التاجر',
              title: 'توقّف عن الخسارة في كل إعادة',
              items: ['أنشئ طلباً وشارك رابط الدفع خلال ثوانٍ', 'درجة ثقة الزبون أمامك قبل الشحن', 'أموالك محمية — لا رفض مجاني بعد الآن', '98.5٪ من كل صفقة لك مباشرة'],
            },
            {
              color: '#B45309', bg: 'rgba(180,83,9,0.04)',
              role: '👤 الزبون',
              title: 'ادفع بثقة — أموالك ليست في خطر',
              items: ['لا دفع مسبق كامل بلا ضمان', 'المبلغ محجوز — لا يصل للتاجر إلا بعد استلامك', 'رفضت الاستلام؟ استردادك تلقائي', 'عربون صغير يكفي لتأكيد جديتك'],
            },
            {
              color: '#1D4ED8', bg: 'rgba(29,78,216,0.04)',
              role: '🚚 شركة التوصيل',
              title: 'تكامل لحظي عبر Webhook',
              items: ['أرسل shipment.created وصّل تعمل الباقي', 'طلبات الدفع تُنشأ تلقائياً لكل شحنة', 'السائق يُحدّث الحالة عبر صفحة مخصصة', 'لا تعديل في نظامك الحالي'],
            },
          ].map(a => (
            <div key={a.role} style={{ ...S.audienceCard, background: a.bg, borderColor: a.color + '33' }}>
              <div style={{ ...S.audienceRole, color: a.color }}>{a.role}</div>
              <div style={{ ...S.audienceTitle, color: '#0F2318' }}>{a.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {a.items.map(item => (
                  <div key={item} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: a.color, marginTop: 2, flexShrink: 0 }}>✓</span>
                    <span style={S.audiencePain}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA BANNER */}
      <div style={S.ctaBanner}>
        <h2 style={S.ctaTitle}>
          توقّف عن الخسارة في كل إعادة.<br />
          <span style={{ color: '#F59E0B' }}>وصّل تحمي كل صفقة.</span>
        </h2>
        <p style={S.ctaSub}>
          انضم للتجار الذين يحمون مبيعاتهم مع وصّل —<br />
          ابدأ بالخطة المجانية، لا بطاقة ائتمانية مطلوبة
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={S.ctaBtn} onClick={() => navigate('/dashboard')}>
            ابدأ مجاناً ←
          </button>
          <button onClick={() => navigate('/delivery-company')} style={{ padding: '16px 28px', borderRadius: 14, border: '1.5px solid rgba(255,255,255,0.3)', background: 'transparent', color: 'white', fontWeight: 600, fontSize: 15, cursor: 'pointer', fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
            🚚 تكامل شركات التوصيل
          </button>
        </div>
        <span style={S.ctaSecondary}>لا التزام — يمكنك الإلغاء في أي وقت</span>
      </div>

      {/* FOOTER */}
      <footer style={S.footer}>
        <div style={S.footerLogo}>
          <img src="/wassel_logo.png" alt="وصّل" style={S.footerLogoImg} />
          <span style={S.footerLogoText}>وصّل — Wassel</span>
        </div>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'لوحة التاجر', to: '/dashboard' },
            { label: 'شركات التوصيل', to: '/delivery-company' },
            { label: 'صفحة السائق', to: '/driver' },
          ].map(l => (
            <button key={l.label} onClick={() => navigate(l.to)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: 13, fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
              {l.label}
            </button>
          ))}
        </div>
        طبقة ثقة مالية ذكية للتجارة الإلكترونية العربية &nbsp;|&nbsp; © 2026 وصّل
      </footer>
    </div>
  )
}
