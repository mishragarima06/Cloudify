import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const s = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'var(--gray-bg)', padding: '20px'
  },
  box: { width: '100%', maxWidth: '400px', animation: 'fadeUp 0.4s ease both' },
  logo: {
    width: 42, height: 42, borderRadius: 12, background: 'var(--blue-light)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px', fontSize: 20, fontWeight: 600, color: 'var(--blue)'
  },
  card: {
    background: 'var(--white)', borderRadius: 'var(--radius-lg)',
    border: '0.5px solid var(--gray-border)', padding: '28px 28px 24px',
    boxShadow: 'var(--shadow)'
  },
  title: { fontSize: 18, fontWeight: 600, textAlign: 'center', marginBottom: 4 },
  sub:   { fontSize: 13, color: 'var(--text-sub)', textAlign: 'center', marginBottom: 22 },
  label: { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-sub)', marginBottom: 5 },
  input: {
    width: '100%', padding: '9px 12px', fontSize: 13,
    border: '0.5px solid var(--gray-border)', borderRadius: 8,
    background: 'var(--gray-2)', color: 'var(--text)',
    outline: 'none', marginBottom: 14, transition: 'border 0.15s'
  },
  btn: {
    width: '100%', padding: '10px', background: 'var(--blue)',
    color: '#fff', border: 'none', borderRadius: 8,
    fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s'
  },
  err: {
    background: 'var(--red-light)', border: '0.5px solid #F7C1C1',
    borderRadius: 7, padding: '8px 12px', fontSize: 12,
    color: 'var(--red)', marginBottom: 14
  },
  qrSection: {
    textAlign: 'center', marginTop: 20, padding: '20px',
    background: 'var(--gray-2)', borderRadius: 10,
    border: '0.5px solid var(--gray-border)'
  },
  qrTitle: { fontSize: 13, fontWeight: 600, marginBottom: 4 },
  qrSub:   { fontSize: 11, color: 'var(--text-sub)', marginBottom: 14 },
  qrImg:   { width: 160, height: 160, borderRadius: 8, border: '4px solid var(--white)' },
  chip: {
    display: 'inline-block', background: 'var(--green-light)',
    color: 'var(--green)', fontSize: 11, padding: '3px 10px',
    borderRadius: 20, fontWeight: 500, marginTop: 10
  }
}

export default function RegisterPage() {
  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [qrCode, setQrCode]   = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const navigate = useNavigate()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      setError('Saare fields bharo'); return
    }
    setError(''); setLoading(true)
    try {
      const { data } = await axios.post('/api/auth/register', form)
      setQrCode(data.qrCode)
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed')
    } finally { setLoading(false) }
  }

  if (done) return (
    <div style={s.page}>
      <div style={s.box}>
        <div style={s.logo}>C</div>
        <div style={s.card}>
          <div style={s.title}>Almost done!</div>
          <div style={s.sub}>Google Authenticator app se yeh QR scan karo</div>
          <div style={s.qrSection}>
            <div style={s.qrTitle}>Scan this QR code</div>
            <div style={s.qrSub}>Google Authenticator → + button → QR code scan karo</div>
            {qrCode && <img src={qrCode} alt="2FA QR Code" style={s.qrImg} />}
            <div style={s.chip}>speakeasy TOTP · Scan once, use forever</div>
          </div>
          <button
            style={{ ...s.btn, marginTop: 18 }}
            onClick={() => navigate('/verify')}
          >
            Maine scan kar liya — Login karo
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      <div style={s.box}>
        <div style={s.logo}>C</div>
        <div style={s.card}>
          <div style={s.title}>Create account</div>
          <div style={s.sub}>Cloudify pe nayi ID banao</div>
          {error && <div style={s.err}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <label style={s.label}>Full name</label>
            <input style={s.input} placeholder="Gauri Singh" value={form.name}
              onChange={set('name')}
              onFocus={e => e.target.style.borderColor='var(--blue-mid)'}
              onBlur={e => e.target.style.borderColor='var(--gray-border)'} />
            <label style={s.label}>Email address</label>
            <input style={s.input} type="email" placeholder="you@example.com" value={form.email}
              onChange={set('email')}
              onFocus={e => e.target.style.borderColor='var(--blue-mid)'}
              onBlur={e => e.target.style.borderColor='var(--gray-border)'} />
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" placeholder="Min 8 characters" value={form.password}
              onChange={set('password')}
              onFocus={e => e.target.style.borderColor='var(--blue-mid)'}
              onBlur={e => e.target.style.borderColor='var(--gray-border)'} />
            <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--gray-text)', marginTop: 16 }}>
            Already have account?{' '}
            <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 500 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
