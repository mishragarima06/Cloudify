import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const s = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'var(--gray-bg)', padding: '20px'
  },
  box: { width: '100%', maxWidth: '360px', animation: 'fadeUp 0.4s ease both' },
  card: {
    background: 'var(--white)', borderRadius: 'var(--radius-lg)',
    border: '0.5px solid var(--gray-border)', padding: '32px 28px 28px',
    boxShadow: 'var(--shadow)', textAlign: 'center'
  },
  icon: {
    width: 52, height: 52, borderRadius: 14, background: 'var(--blue-light)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px', fontSize: 26
  },
  title: { fontSize: 18, fontWeight: 600, marginBottom: 6 },
  sub:   { fontSize: 13, color: 'var(--text-sub)', marginBottom: 26, lineHeight: 1.5 },
  otpRow: { display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 },
  otpInput: {
    width: 44, height: 52, border: '0.5px solid var(--gray-border)',
    borderRadius: 10, background: 'var(--gray-2)', textAlign: 'center',
    fontSize: 22, fontWeight: 600, color: 'var(--text)',
    fontFamily: "'DM Mono', monospace", outline: 'none',
    transition: 'border 0.15s, background 0.15s'
  },
  btn: {
    width: '100%', padding: '11px', background: 'var(--blue)',
    color: '#fff', border: 'none', borderRadius: 8,
    fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 10
  },
  btnGhost: {
    width: '100%', padding: '9px', background: 'transparent',
    color: 'var(--text-sub)', border: '0.5px solid var(--gray-border)',
    borderRadius: 8, fontSize: 12, cursor: 'pointer'
  },
  err: {
    background: 'var(--red-light)', borderRadius: 7, padding: '8px 12px',
    fontSize: 12, color: 'var(--red)', marginBottom: 14
  },
  success: {
    background: 'var(--green-light)', borderRadius: 7, padding: '8px 12px',
    fontSize: 12, color: 'var(--green)', marginBottom: 14
  },
  chip: {
    display: 'inline-block', background: 'var(--green-light)', color: 'var(--green)',
    fontSize: 11, padding: '3px 10px', borderRadius: 20, marginBottom: 22, fontWeight: 500
  }
}

export default function OTPPage() {
  const [otp, setOtp]         = useState(['', '', '', '', '', ''])
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const refs = useRef([])
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[idx] = val.slice(-1)
    setOtp(next)
    setError('')
    if (val && idx < 5) refs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0)
      refs.current[idx - 1]?.focus()
  }

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (paste.length === 6) {
      setOtp(paste.split(''))
      refs.current[5]?.focus()
    }
  }

  const verify = async () => {
    const code = otp.join('')
    if (code.length < 6) { setError('6-digit code poora bharo'); return }
    const tempToken = sessionStorage.getItem('tempToken')
    setLoading(true); setError('')
    try {
      const { data } = await axios.post('/api/auth/verify-2fa', { otp: code, tempToken })
      setSuccess('OTP verified! Login ho gaya')
      login(data.token, data.user)
      setTimeout(() => navigate('/dashboard'), 800)
    } catch {
      setError('Galat OTP, dobara try karo')
      setOtp(['', '', '', '', '', ''])
      refs.current[0]?.focus()
    } finally { setLoading(false) }
  }

  return (
    <div style={s.page}>
      <div style={s.box}>
        <div style={s.card}>
          <div style={s.icon}>🔐</div>
          <div style={s.title}>Two-factor auth</div>
          <div style={s.chip}>speakeasy TOTP · 30 sec window</div>
          <div style={s.sub}>
            Google Authenticator app se<br />6-digit code enter karo
          </div>

          {error   && <div style={s.err}>{error}</div>}
          {success && <div style={s.success}>{success}</div>}

          <div style={s.otpRow} onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => refs.current[i] = el}
                style={{
                  ...s.otpInput,
                  borderColor: digit ? 'var(--blue-mid)' : 'var(--gray-border)',
                  background: digit ? 'var(--blue-light)' : 'var(--gray-2)'
                }}
                maxLength={1}
                value={digit}
                onChange={e => handleChange(e.target.value, i)}
                onKeyDown={e => handleKeyDown(e, i)}
                onFocus={e => e.target.style.borderColor = 'var(--blue-mid)'}
                onBlur={e => e.target.style.borderColor = digit ? 'var(--blue-mid)' : 'var(--gray-border)'}
              />
            ))}
          </div>

          <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} onClick={verify} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>
          <button style={s.btnGhost} onClick={() => navigate('/login')}>
            Wapas login pe jao
          </button>
        </div>
      </div>
    </div>
  )
}
