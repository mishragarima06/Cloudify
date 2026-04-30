import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const s = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-main)', padding: '20px'
  },
  card: {
    width: '100%', maxWidth: '420px', background: 'white', borderRadius: '24px',
    padding: '40px', textAlign: 'center', boxShadow: 'var(--shadow-lg)'
  },
  logo: {
    width: '48px', height: '48px', background: 'var(--primary)', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
    fontSize: '24px', fontWeight: '700', margin: '0 auto 32px'
  },
  title: {
    fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px'
  },
  sub: {
    fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px'
  },
  otpContainer: {
    display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '32px'
  },
  otpInput: {
    width: '48px', height: '56px', fontSize: '20px', fontWeight: '700', textAlign: 'center',
    border: '1.5px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-main)',
    outline: 'none', transition: 'var(--transition)'
  },
  btn: {
    width: '100%', padding: '14px', background: 'var(--primary)', color: 'white',
    borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)', border: 'none'
  },
  err: {
    background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px',
    padding: '12px', fontSize: '13px', color: '#B91C1C', marginBottom: '20px'
  },
  resend: {
    marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)'
  }
}

export default function OTPPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(45)
  const inputRefs = useRef([])
  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    const tempToken = sessionStorage.getItem('tempToken')
    if (!tempToken) {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  const handleChange = (index, value) => {
    if (isNaN(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1)
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fullOtp = otp.join('')
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    const tempToken = sessionStorage.getItem('tempToken')
    setError('')
    setLoading(true)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const { data } = await axios.post(
        `${apiUrl}/api/auth/verify-otp`,
        { otp: fullOtp },
        { headers: { 'Authorization': `Bearer ${tempToken}` } }
      )

      if (data.token && data.user) {
        sessionStorage.removeItem('tempToken')
        localStorage.setItem('cf_token', data.token)
        login(data.token, data.user)
        navigate('/dashboard', { replace: true })
      } else {
        setError('Invalid response')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card} className="animate-fade-up">
        <div style={s.logo}>C</div>
        <h1 style={s.title}>Verify your account</h1>
        <p style={s.sub}>Enter the 6-digit code sent to your email</p>

        {error && <div style={s.err}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.otpContainer}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => inputRefs.current[idx] = el}
                style={{ ...s.otpInput, borderColor: error ? 'var(--danger)' : 'var(--border-color)' }}
                type="text"
                value={digit}
                onChange={e => handleChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                maxLength="1"
                disabled={loading}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              />
            ))}
          </div>

          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div style={s.resend}>
          {timer > 0 ? (
            `Resend code in 00:${timer.toString().padStart(2, '0')}`
          ) : (
            <button 
              onClick={() => setTimer(45)}
              style={{ background: 'none', color: 'var(--primary)', fontWeight: '700', fontSize: '14px' }}
            >
              Resend code
            </button>
          )}
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={() => navigate('/login')}
            style={{ background: 'none', color: 'var(--text-muted)', fontSize: '13px' }}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}