import React from 'react'
import { Link } from 'react-router-dom'

const s = {
  page: {
    minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column'
  },
  nav: {
    padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    maxWidth: '1200px', margin: '0 auto', width: '100%'
  },
  content: {
    maxWidth: '1000px', margin: '60px auto', padding: '0 20px', display: 'flex', gap: '60px', alignItems: 'flex-start'
  },
  left: {
    flex: 1.5, background: 'white', padding: '40px', borderRadius: '24px', boxShadow: 'var(--shadow-lg)'
  },
  right: {
    flex: 1
  },
  title: {
    fontSize: '32px', fontWeight: '800', marginBottom: '12px'
  },
  sub: {
    color: 'var(--text-muted)', marginBottom: '32px'
  },
  label: {
    display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px'
  },
  input: {
    width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)',
    background: 'var(--bg-main)', marginBottom: '20px', fontSize: '14px'
  },
  area: {
    width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)',
    background: 'var(--bg-main)', marginBottom: '20px', fontSize: '14px', minHeight: '120px', resize: 'none'
  },
  btn: {
    width: '100%', padding: '14px', background: 'var(--primary)', color: 'white', borderRadius: '12px',
    fontWeight: '700', fontSize: '15px', border: 'none', cursor: 'pointer'
  },
  contactItem: {
    display: 'flex', gap: '16px', marginBottom: '24px'
  },
  iconBox: {
    width: '44px', height: '44px', borderRadius: '10px', background: 'white', border: '1px solid var(--border-color)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'var(--primary)'
  }
}

export default function ContactPage() {
  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', fontWeight: '700', color: 'var(--primary)' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>C</div>
          Cloudify
        </Link>
        <div style={{ display: 'flex', gap: '30px' }}>
          <Link to="/" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>Features</Link>
          <Link to="/" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>Pricing</Link>
          <Link to="/login" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>Login</Link>
        </div>
      </nav>

      <div style={s.content} className="animate-fade-up">
        <div style={s.left}>
          <h1 style={s.title}>Contact Us</h1>
          <p style={s.sub}>We'd love to hear from you. Reach out for support, partnerships, or any other queries.</p>
          
          <form onSubmit={e => e.preventDefault()}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={s.label}>First name</label>
                <input style={s.input} placeholder="John" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Last name</label>
                <input style={s.input} placeholder="Doe" />
              </div>
            </div>
            
            <label style={s.label}>Email address</label>
            <input style={s.input} placeholder="john@example.com" />
            
            <label style={s.label}>Subject</label>
            <input style={s.input} placeholder="How can we help you?" />
            
            <label style={s.label}>Message</label>
            <textarea style={s.area} placeholder="Type your message..." />
            
            <button style={s.btn}>Send Message</button>
          </form>
        </div>

        <div style={s.right}>
          <div style={{ marginBottom: '40px' }}>
             <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>Get in touch</h2>
             
             <ContactItem icon="📧" title="Email" val="support@cloudify.com" sub="We typically reply in a few minutes." />
             <ContactItem icon="📞" title="Phone" val="+91 98765 43210" sub="Mon - Sat, 9:00 AM - 6:00 PM" />
             <ContactItem icon="📍" title="Address" val="GLA University, Mathura" sub="Department of CEA, Group No. 10" />
          </div>

          <div>
             <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Follow us</h2>
             <div style={{ display: 'flex', gap: '16px' }}>
               <SocialIcon icon="𝕏" />
               <SocialIcon icon="in" />
               <SocialIcon icon="🐱" />
             </div>
          </div>
          
          <img 
            src="https://img.icons8.com/bubbles/200/000000/headset.png" 
            alt="Support" 
            style={{ width: '200px', marginTop: '40px', opacity: 0.8 }} 
          />
        </div>
      </div>
    </div>
  )
}

function ContactItem({ icon, title, val, sub }) {
  return (
    <div style={s.contactItem}>
      <div style={s.iconBox}>{icon}</div>
      <div>
        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{title}</div>
        <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>{val}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub}</div>
      </div>
    </div>
  )
}

function SocialIcon({ icon }) {
  return (
    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'white', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer' }}>
      {icon}
    </div>
  )
}
