import React from 'react'
import { Link } from 'react-router-dom'

const s = {
  nav: {
    padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    maxWidth: '1200px', margin: '0 auto', width: '100%'
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '10px', fontSize: '22px', fontWeight: '700', color: 'var(--primary)'
  },
  navLinks: {
    display: 'flex', gap: '30px', alignItems: 'center'
  },
  link: {
    fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)', transition: 'var(--transition)'
  },
  hero: {
    padding: '80px 40px', maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '60px'
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', padding: '6px 14px', background: 'var(--primary-light)',
    color: 'var(--primary)', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginBottom: '24px',
    gap: '8px'
  },
  title: {
    fontSize: '56px', fontWeight: '800', lineHeight: '1.1', color: 'var(--text-main)', marginBottom: '20px'
  },
  subtitle: {
    fontSize: '18px', color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '500px'
  },
  btnGroup: {
    display: 'flex', gap: '16px'
  },
  btnPrimary: {
    padding: '14px 28px', background: 'var(--primary)', color: 'white', borderRadius: '10px',
    fontWeight: '600', fontSize: '15px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
  },
  btnSecondary: {
    padding: '14px 28px', background: 'white', color: 'var(--primary)', borderRadius: '10px',
    fontWeight: '600', fontSize: '15px', border: '1px solid var(--border-color)'
  },
  stats: {
    display: 'flex', gap: '40px', marginTop: '60px'
  },
  statItem: {
    display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '14px'
  },
  section: {
    padding: '100px 40px', textAlign: 'center'
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', maxWidth: '1100px', margin: '50px auto'
  },
  featureCard: {
    padding: '40px 30px', borderRadius: '20px', background: 'white', border: '1px solid var(--border-color)',
    textAlign: 'left', transition: 'var(--transition)'
  },
  iconBox: {
    width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', marginBottom: '24px'
  }
}

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={s.nav}>
        <div style={s.logo}>
          <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>C</div>
          Cloudify
        </div>
        <div style={s.navLinks}>
          <a href="#features" style={s.link}>Features</a>
          <a href="#pricing" style={s.link}>Pricing</a>
          <a href="#about" style={s.link}>About</a>
          <Link to="/login" style={{ ...s.link, marginLeft: '20px' }}>Login</Link>
          <Link to="/register" style={{ ...s.btnPrimary, padding: '10px 20px', textDecoration: 'none' }}>Register</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={s.hero} className="animate-fade-up">
        <div style={{ flex: 1 }}>
          <div style={s.badge}>
            <span style={{ fontSize: '14px' }}>✨</span> AI-powered cloud file manager
          </div>
          <h1 style={s.title}>Smart storage for <br/><span style={{ color: 'var(--primary)' }}>everything</span> you create</h1>
          <p style={s.subtitle}>
            Cloudify automatically organizes, classifies, and secures your files using AI — so you spend less time managing and more time creating.
          </p>
          <div style={s.btnGroup}>
            <Link to="/register" style={{ ...s.btnPrimary, textDecoration: 'none' }}>Start for free</Link>
            <button style={s.btnSecondary}>See how it works ▷</button>
          </div>
          
          <div style={s.stats}>
            <div style={s.statItem}>
              <span style={{ color: 'var(--primary)' }}>☁</span> 5 GB Free Storage
            </div>
            <div style={s.statItem}>
              <span style={{ color: 'var(--primary)' }}>💳</span> No Credit Card
            </div>
            <div style={s.statItem}>
              <span style={{ color: 'var(--primary)' }}>🛡</span> Secure & Private
            </div>
          </div>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <img 
            src="/cloud_storage_3d_hero_1777552890269.png" 
            alt="Cloud Storage" 
            style={{ width: '100%', maxWidth: '550px', transform: 'scale(1.1)' }} 
            className="animate-float"
          />
        </div>
      </header>

      {/* Features Section */}
      <section id="features" style={s.section}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', letterSpacing: '1px', marginBottom: '12px' }}>FEATURES</div>
        <h2 style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-main)' }}>Everything in one place</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '12px', maxWidth: '600px', margin: '12px auto' }}>
          Built for students and teams who need secure, intelligent file management without the complexity.
        </p>

        <div style={s.grid}>
          <FeatureCard 
            icon="🤖" color="#EEF2FF" iconColor="#4F46E5"
            title="AI classification" 
            desc="Files are automatically tagged as documents, images, code, spreadsheets, or archives the moment they upload." 
          />
          <FeatureCard 
            icon="📄" color="#F0FDF4" iconColor="#16A34A"
            title="PDF summaries" 
            desc="AI reads your PDFs and generates a 2-sentence summary so you know what's inside without opening." 
          />
          <FeatureCard 
            icon="🛡" color="#FEF2F2" iconColor="#DC2626"
            title="Virus scanning" 
            desc="Every uploaded file is scanned by ClamAV before it reaches your storage. Infected files are blocked instantly." 
          />
          <FeatureCard 
            icon="🔗" color="#F0FDFA" iconColor="#0D9488"
            title="Secure sharing" 
            desc="Share files with time-limited links (1 hour to 7 days) and granular roles — viewer or editor access." 
          />
          <FeatureCard 
            icon="⏱" color="#FFFBEB" iconColor="#D97706"
            title="Auto file expiry" 
            desc="Files auto-delete after 7 days by default. You choose the expiry — or set none — to prevent storage bloat." 
          />
          <FeatureCard 
            icon="🔍" color="#F5F3FF" iconColor="#7C3AED"
            title="Smart search" 
            desc="Search by filename, category, or AI-generated keywords. Find what you need in seconds." 
          />
        </div>
      </section>

      {/* Ready to try section */}
      <section style={{ ...s.section, background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--primary-light)', padding: '60px', borderRadius: '30px', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '16px' }}>Ready to try Cloudify?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
              Free to use. No credit card required.<br/>
              5 GB of secure cloud storage — ready in 60 seconds.
            </p>
            <div style={s.btnGroup}>
              <Link to="/register" style={{ ...s.btnPrimary, textDecoration: 'none' }}>Create free account</Link>
              <Link to="/login" style={{ ...s.btnSecondary, textDecoration: 'none' }}>Sign in</Link>
            </div>
            
            <div style={{ display: 'flex', gap: '30px', marginTop: '40px', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>
              <span>⚙ AI Powered</span>
              <span>🛡 100% Secure</span>
              <span>⚡ Easy to Use</span>
            </div>
          </div>
          <div style={{ width: '200px', height: '200px', background: 'white', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px' }}>
            ☁
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '80px 40px', maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '300px' }}>
          <div style={{ ...s.logo, marginBottom: '20px' }}>
            <div style={{ width: '28px', height: '28px', background: 'var(--primary)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '16px' }}>C</div>
            Cloudify
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
            Smart, secure and intelligent cloud storage for everyone.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
             <span style={{ fontSize: '20px', cursor: 'pointer' }}>𝕏</span>
             <span style={{ fontSize: '20px', cursor: 'pointer' }}>in</span>
             <span style={{ fontSize: '20px', cursor: 'pointer' }}>🐱</span>
          </div>
        </div>

        <FooterColumn title="Product" links={['Features', 'Pricing', 'About']} />
        <FooterColumn title="Company" links={['Privacy Policy', 'Terms of Service', 'Contact']} />
        
        <div style={{ textAlign: 'right' }}>
           <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>
             © 2026 Cloudify - Advanced Cloud Manager
           </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc, color, iconColor }) {
  return (
    <div style={s.featureCard} className="card-hover">
      <div style={{ ...s.iconBox, background: color, color: iconColor, fontSize: '24px' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{desc}</p>
    </div>
  )
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>{title}</h4>
      <ul style={{ listStyle: 'none' }}>
        {links.map(l => (
          <li key={l} style={{ marginBottom: '12px' }}>
            <a href="#" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{l}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
