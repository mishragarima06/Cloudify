import React from 'react'
import { useNavigate } from 'react-router-dom'

const s = {
  page: {
    minHeight: '100vh',
    background: '#ffffff',
    color: '#333333',
    fontFamily: 'Inter, sans-serif'
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    borderBottom: '1px solid #f0f0f0'
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 20,
    fontWeight: 600,
    color: 'var(--blue)',
    cursor: 'pointer'
  },
  logoIcon: {
    width: 32, height: 32, borderRadius: 8,
    background: 'var(--blue)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: 18, color: '#fff', fontWeight: 700
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: 24
  },
  link: {
    color: '#555',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'color 0.2s'
  },
  btnSecondary: {
    padding: '8px 16px',
    background: 'transparent',
    color: 'var(--blue)',
    border: '1px solid var(--blue)',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  btnPrimary: {
    padding: '8px 16px',
    background: 'var(--blue)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'opacity 0.2s'
  },
  hero: {
    padding: '100px 20px',
    textAlign: 'center',
    maxWidth: 800,
    margin: '0 auto'
  },
  heroBadge: {
    display: 'inline-block',
    padding: '6px 16px',
    background: 'var(--blue-light)',
    color: 'var(--blue-dark)',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 24
  },
  heroTitle: {
    fontSize: 56,
    fontWeight: 700,
    lineHeight: 1.15,
    color: '#111',
    marginBottom: 24
  },
  heroSub: {
    fontSize: 18,
    color: '#555',
    lineHeight: 1.6,
    marginBottom: 40,
    maxWidth: 640,
    margin: '0 auto 40px'
  },
  heroBtns: {
    display: 'flex',
    gap: 16,
    justifyContent: 'center'
  },
  heroBtnLarge: {
    padding: '12px 24px',
    background: 'var(--blue)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer'
  },
  heroBtnOutline: {
    padding: '12px 24px',
    background: 'transparent',
    color: '#111',
    border: '1px solid #ccc',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer'
  },
  featuresSection: {
    padding: '80px 40px',
    background: '#fcfcfc',
    textAlign: 'center',
    borderTop: '1px solid #f0f0f0'
  },
  featuresTitleSmall: {
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--blue)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12
  },
  featuresTitle: {
    fontSize: 36,
    fontWeight: 700,
    color: '#111',
    marginBottom: 16
  },
  featuresSub: {
    fontSize: 16,
    color: '#555',
    marginBottom: 60,
    maxWidth: 600,
    margin: '0 auto 60px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 24,
    maxWidth: 1040,
    margin: '0 auto',
    textAlign: 'left'
  },
  card: {
    background: '#fff',
    padding: 28,
    borderRadius: 16,
    border: '1px solid #eaeaea',
    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
  },
  cardIconBox: {
    width: 44, height: 44,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    marginBottom: 20
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#111',
    marginBottom: 10
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 1.5
  },
  ctaSection: {
    padding: '80px 20px',
    textAlign: 'center',
    background: 'var(--blue-light)',
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: 700,
    color: 'var(--blue-dark)',
    marginBottom: 16
  },
  ctaSub: {
    fontSize: 16,
    color: 'var(--blue)',
    marginBottom: 32
  },
  footer: {
    padding: '40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#222',
    color: '#aaa',
    fontSize: 14
  },
  footerLinks: {
    display: 'flex',
    gap: 24
  }
}

const featuresData = [
  {
    icon: '🤖', bg: '#f3e8ff', color: '#9333ea',
    title: 'AI classification',
    desc: 'Files are automatically tagged as documents, images, code, spreadsheets, or archives the moment they upload.'
  },
  {
    icon: '📄', bg: '#e0f2fe', color: '#0284c7',
    title: 'PDF summaries',
    desc: 'AI reads your PDFs and generates a 2-sentence summary so you know what\'s inside without opening.'
  },
  {
    icon: '🛡️', bg: '#fee2e2', color: '#dc2626',
    title: 'Virus scanning',
    desc: 'Every uploaded file is scanned by ClamAV before it reaches your storage. Infected files are blocked instantly.'
  },
  {
    icon: '🔗', bg: '#dcfce7', color: '#16a34a',
    title: 'Secure sharing',
    desc: 'Share files with time-limited links (1 hour to 7 days) and granular roles — viewer or editor access.'
  },
  {
    icon: '⏱️', bg: '#fef3c7', color: '#d97706',
    title: 'Auto file expiry',
    desc: 'Files auto-delete after 7 days by default. You choose the expiry — or set none — to prevent storage bloat.'
  },
  {
    icon: '🔍', bg: '#e0e7ff', color: '#4f46e5',
    title: 'Smart search',
    desc: 'Search by filename, category, or AI-generated keywords. Find what you need in seconds.'
  }
]

export default function LandingPage() {
  const navigate = useNavigate()

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div style={s.page}>
      {/* Navigation */}
      <nav style={s.nav}>
        <div style={s.logoArea} onClick={() => window.scrollTo(0, 0)}>
          <div style={s.logoIcon}>C</div>
          <span>Cloudify</span>
        </div>
        <div style={s.navLinks}>
          <span 
            style={s.link} 
            onClick={scrollToFeatures}
            onMouseEnter={e => e.target.style.color = 'var(--blue)'}
            onMouseLeave={e => e.target.style.color = '#555'}
          >
            Features
          </span>
          <button style={s.btnSecondary} onClick={() => navigate('/login')}>Login</button>
          <button style={s.btnPrimary} onClick={() => navigate('/register')}>Register</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={s.hero}>
        <div style={s.heroBadge}>
          <span style={{ color: 'var(--blue)' }}>•</span> AI-powered cloud file manager
        </div>
        <h1 style={s.heroTitle}>
          Smart storage for <span style={{ color: 'var(--blue)' }}>everything</span> you create
        </h1>
        <p style={s.heroSub}>
          Cloudify automatically organizes, classifies, and secures your files using AI — so you spend less time managing and more time creating.
        </p>
        <div style={s.heroBtns}>
          <button style={s.heroBtnLarge} onClick={() => navigate('/register')}>Start for free</button>
          <button style={s.heroBtnOutline} onClick={scrollToFeatures}>See how it works ↗</button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={s.featuresSection}>
        <div style={s.featuresTitleSmall}>FEATURES</div>
        <h2 style={s.featuresTitle}>Everything in one place</h2>
        <p style={s.featuresSub}>
          Built for students and teams who need secure, intelligent file management without the complexity.
        </p>

        <div style={s.grid}>
          {featuresData.map((f, i) => (
            <div key={i} style={s.card}>
              <div style={{ ...s.cardIconBox, background: f.bg, color: f.color }}>
                {f.icon}
              </div>
              <h3 style={s.cardTitle}>{f.title}</h3>
              <p style={s.cardText}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={s.ctaSection}>
        <h2 style={s.ctaTitle}>Ready to try Cloudify?</h2>
        <p style={s.ctaSub}>
          Free to use. No credit card. 5 GB of secure cloud storage — ready in 60 seconds.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 24 }}>
          <button style={s.heroBtnLarge} onClick={() => navigate('/register')}>Create free account</button>
          <button style={{ ...s.heroBtnOutline, background: '#fff', borderColor: 'transparent' }} onClick={() => navigate('/login')}>Sign in</button>
        </div>
        <p style={{ marginTop: 32, fontSize: 13, color: 'var(--blue)' }}>
          GLA University · Department of CEA · Group No. 10
        </p>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff', fontWeight: 600 }}>
          <span style={{ color: 'var(--blue)' }}>C</span> Cloudify
        </div>
        <div style={s.footerLinks}>
          <span style={{ cursor: 'pointer' }} onClick={scrollToFeatures}>Features</span>
          <span style={{ cursor: 'pointer' }}>About</span>
        </div>
        <div>
          © 2026 Cloudify · GLA University, Mathura
        </div>
      </footer>
    </div>
  )
}
