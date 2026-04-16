import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
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
  input: {
    width: '100%', padding: '9px 12px', fontSize: 13,
    border: '0.5px solid var(--gray-border)', borderRadius: 8,
    background: 'var(--gray-2)', color: 'var(--text)',
    outline: 'none', marginBottom: 14, transition: 'border 0.15s',
    textAlign: 'center', letterSpacing: '4px', fontSize: 20
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
  }
}

export default function OTPPage() {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  // Check if tempToken exists on mount
  useEffect(() => {
    const tempToken = sessionStorage.getItem('tempToken')
    if (!tempToken) {
      setSessionExpired(true)
      setError('Session expire ho gaya. Login karo dobara.')
    }
  }, [])

  // Validate OTP format (must be 6 digits)
  const validateOTP = (value) => {
    return /^\d{0,6}$/.test(value)
  }

  const handleOTPChange = (e) => {
    const value = e.target.value
    if (validateOTP(value)) {
      setOtp(value)
      if (error) setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate OTP length
    if (!otp || otp.length !== 6) {
      setError('6-digit OTP dalo')
      return
    }

    const tempToken = sessionStorage.getItem('tempToken')
    if (!tempToken) {
      setError('Session expire ho gaya. Login karo dobara.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'

      console.log('OTPPage: Verifying OTP')

      const { data } = await axios.post(
        `${apiUrl}/api/auth/verify-otp`,
        { otp: otp.trim() },
        {
          headers: {
            'Authorization': `Bearer ${tempToken}`
          }
        }
      )

      if (data.token && data.user) {
        // Clear tempToken immediately after successful verification
        sessionStorage.removeItem('tempToken')

        // Store token in localStorage for persistence
        localStorage.setItem('cf_token', data.token)

        // Update AuthContext with user and token
        login(data.token, data.user)

        navigate('/dashboard', { replace: true })
      } else {
        setError('Invalid response from server')
      }
    } catch (err) {
      console.error('OTPPage: OTP verification error:', err)

      // Enhanced error handling
      let errorMsg = 'OTP verification failed'

      if (!err.response) {
        errorMsg = 'Network error - internet check karo'
      } else if (err.response.status === 400) {
        errorMsg = 'OTP galat hai'
      } else if (err.response.status === 401) {
        errorMsg = 'Session expire ho gaya'
        sessionStorage.removeItem('tempToken')
      } else if (err.response.status === 429) {
        errorMsg = 'Bohot attempts. Baad mein try karo.'
      } else if (err.response.status >= 500) {
        errorMsg = 'Server error - baad mein try karo'
      } else {
        errorMsg = err.response.data?.msg || err.response.data?.message || errorMsg
      }

      setError(errorMsg)
      // Clear OTP field on error
      setOtp('')
    } finally {
      setLoading(false)
    }
  }

  if (sessionExpired) {
    return (
      <div style={s.page}>
        <div style={s.box}>
          <div style={s.logo}>C</div>
          <div style={s.card}>
            <div style={s.title}>Session Expired</div>
            <div style={s.sub}>{error}</div>
            <button
              style={s.btn}
              onClick={() => navigate('/login', { replace: true })}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.box}>
        <div style={s.logo}>C</div>
        <div style={s.card}>
          <div style={s.title}>Verify Your Account</div>
          <div style={s.sub}>Enter the 6-digit code sent to your email</div>

          {error && <div style={s.err}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <input
              style={{
                ...s.input,
                borderColor: error ? 'var(--red)' : 'var(--gray-border)'
              }}
              type="text"
              placeholder="000000"
              value={otp}
              onChange={handleOTPChange}
              maxLength="6"
              disabled={loading}
              autoFocus
              onFocus={e => e.target.style.borderColor = 'var(--blue-mid)'}
              onBlur={e => e.target.style.borderColor = error ? 'var(--red)' : 'var(--gray-border)'}
            />

            <button
              style={{
                ...s.btn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button
              onClick={() => navigate('/login', { replace: true })}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--blue)',
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}