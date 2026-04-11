import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const s = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'var(--gray-bg)', padding: '20px'
  },
  box: {
    width: '100%', maxWidth: '380px',
    animation: 'fadeUp 0.4s ease both'
  },
  logo: {
    width: 42, height: 42, borderRadius: 12,
    background: 'var(--blue-light)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px',
    fontSize: 20, fontWeight: 600, color: 'var(--blue)'
  },
  card: {
    background: 'var(--white)', borderRadius: 'var(--radius-lg)',
    border: '0.5px solid var(--gray-border)', padding: '28px 28px 24px',
    boxShadow: 'var(--shadow)'
  },
  title: {
    fontSize: 18, fontWeight: 600, color: 'var(--text)',
    textAlign: 'center', marginBottom: 4
  },
  sub: {
    fontSize: 13, color: 'var(--text-sub)',
    textAlign: 'center', marginBottom: 22
  },
  label: {
    display: 'block', fontSize: 12, fontWeight: 500,
    color: 'var(--text-sub)', marginBottom: 5
  },
  input: {
    width: '100%', padding: '9px 12px', fontSize: 13,
    border: '0.5px solid var(--gray-border)', borderRadius: 8,
    background: 'var(--gray-2)', color: 'var(--text)',
    outline: 'none', marginBottom: 14, transition: 'border 0.15s'
  },
  btn: {
    width: '100%', padding: '10px', background: 'var(--blue)',
    color: '#fff', border: 'none', borderRadius: 8,
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    marginTop: 4, transition: 'opacity 0.15s'
  },
  err: {
    background: 'var(--red-light)', border: '0.5px solid #F7C1C1',
    borderRadius: 7, padding: '8px 12px', fontSize: 12,
    color: 'var(--red)', marginBottom: 14
  },
  divider: {
    textAlign: 'center', fontSize: 12, color: 'var(--gray-text)',
    marginTop: 18
  },
  footer: {
    textAlign: 'center', fontSize: 11, color: 'var(--gray-text)',
    marginTop: 14
  }
}

export default function LoginPage() {
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Email aur password dono bharo'); return }
    setError(''); setLoading(true)
    try {
      const { data } = await axios.post('/api/auth/login', { email, password })
      if (data.requires2FA) {
        // tempToken store karo, OTP page pe jao
        sessionStorage.setItem('tempToken', data.tempToken)
        navigate('/verify')
      } else {
        // Direct login (2FA off)
        localStorage.setItem('cf_token', data.token)
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Dobara try karo.')
    } finally { setLoading(false) }
  }

  return (
    <div style={s.page}>
      <div style={s.box}>
        <div style={s.logo}>C</div>
        <div style={s.card}>
          <div style={s.title}>Welcome to Cloudify</div>
          <div style={s.sub}>Sign in to your account</div>

          {error && <div style={s.err}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <label style={s.label}>Email address</label>
            <input
              style={s.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--blue-mid)'}
              onBlur={e => e.target.style.borderColor = 'var(--gray-border)'}
            />

            <label style={s.label}>Password</label>
            <input
              style={s.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPass(e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--blue-mid)'}
              onBlur={e => e.target.style.borderColor = 'var(--gray-border)'}
            />

            <button
              style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div style={s.divider}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--blue)', fontWeight: 500 }}>
              Register
            </Link>
          </div>
        </div>
        <div style={s.footer}>Secured with JWT + bcrypt</div>
      </div>
    </div>
  )
}
