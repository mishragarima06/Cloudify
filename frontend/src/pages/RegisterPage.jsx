import React, { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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

// Sanitize input to prevent XSS
const sanitizeInput = (input) => {
  return String(input)
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
}

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const { login } = useAuth()

  // Email validation regex
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  // Password strength validation
  const validatePasswordStrength = (pass) => {
    // Must be 6+ chars (backend can enforce stronger requirements)
    return pass.length >= 6
  }

  // Form validation with all checks
  const validateForm = useCallback(() => {
    const newErrors = {}

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Name zaroori hai'
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name 2 characters se bada hona chahiye'
    } else if (name.trim().length > 50) {
      newErrors.name = 'Name 50 characters se chhota hona chahiye'
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email zaroori hai'
    } else if (!validateEmail(email.trim())) {
      newErrors.email = 'Valid email dalo'
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password zaroori hai'
    } else if (!validatePasswordStrength(password)) {
      newErrors.password = 'Password 6 characters se bada hona chahiye'
    }

    // Confirm password validation
    if (!confirmPass) {
      newErrors.confirmPass = 'Password confirm karo'
    } else if (confirmPass !== password) {
      newErrors.confirmPass = 'Passwords match nahi kar rahe'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [name, email, password, confirmPass])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setError('')
    setLoading(true)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'

      // Sanitize inputs before sending to API
      const sanitizedName = sanitizeInput(name)
      const sanitizedEmail = sanitizeInput(email)

      console.log('RegisterPage: Attempting signup')

      const { data } = await axios.post(`${apiUrl}/api/auth/register`, {
        name: sanitizedName,
        email: sanitizedEmail,
        password
      })

      // Handle 2FA requirement
      if (data.requires2FA && data.tempToken) {
        sessionStorage.setItem('tempToken', data.tempToken)
        navigate('/verify', { replace: true })
      }
      // Handle direct registration (no 2FA)
      else if (data.token && data.user) {
        // Store token in localStorage for persistence
        localStorage.setItem('cf_token', data.token)

        // Update AuthContext with user and token
        login(data.token, data.user)

        navigate('/dashboard', { replace: true })
      } else {
        setError('Invalid response from server')
      }
    } catch (err) {
      console.error('RegisterPage: Registration error:', err)

      // Enhanced error handling with status codes
      let errorMsg = 'Registration failed. Dobara try karo.'

      if (!err.response) {
        errorMsg = 'Network error - internet check karo'
      } else if (err.response.status === 409) {
        errorMsg = 'Email pehle se exist karta hai'
      } else if (err.response.status === 400) {
        errorMsg = err.response.data?.msg || 'Invalid data provided'
      } else if (err.response.status === 429) {
        errorMsg = 'Bohot requests. Baad mein try karo.'
      } else if (err.response.status >= 500) {
        errorMsg = 'Server error - baad mein try karo'
      } else {
        errorMsg = err.response.data?.msg || err.response.data?.message || errorMsg
      }

      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleNameChange = (e) => {
    setName(e.target.value)
    if (errors.name) setErrors({ ...errors, name: '' })
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    if (errors.email) setErrors({ ...errors, email: '' })
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
    if (errors.password) setErrors({ ...errors, password: '' })
  }

  const handleConfirmPassChange = (e) => {
    setConfirmPass(e.target.value)
    if (errors.confirmPass) setErrors({ ...errors, confirmPass: '' })
  }

  return (
    <div style={s.page}>
      <div style={s.box}>
        <div style={s.logo}>C</div>
        <div style={s.card}>
          <div style={s.title}>Create Account</div>
          <div style={s.sub}>Join Cloudify today</div>

          {error && <div style={s.err}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <label style={s.label}>Full Name</label>
            <input
              style={{
                ...s.input,
                borderColor: errors.name ? 'var(--red)' : 'var(--gray-border)'
              }}
              type="text"
              placeholder="Your name"
              value={name}
              onChange={handleNameChange}
              disabled={loading}
              onFocus={e => e.target.style.borderColor = 'var(--blue-mid)'}
              onBlur={e => e.target.style.borderColor = errors.name ? 'var(--red)' : 'var(--gray-border)'}
            />
            {errors.name && <div style={{ fontSize: 11, color: 'var(--red)', marginBottom: 10 }}>{errors.name}</div>}

            <label style={s.label}>Email address</label>
            <input
              style={{
                ...s.input,
                borderColor: errors.email ? 'var(--red)' : 'var(--gray-border)'
              }}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={handleEmailChange}
              disabled={loading}
              onFocus={e => e.target.style.borderColor = 'var(--blue-mid)'}
              onBlur={e => e.target.style.borderColor = errors.email ? 'var(--red)' : 'var(--gray-border)'}
            />
            {errors.email && <div style={{ fontSize: 11, color: 'var(--red)', marginBottom: 10 }}>{errors.email}</div>}

            <label style={s.label}>Password</label>
            <input
              style={{
                ...s.input,
                borderColor: errors.password ? 'var(--red)' : 'var(--gray-border)'
              }}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={handlePasswordChange}
              disabled={loading}
              onFocus={e => e.target.style.borderColor = 'var(--blue-mid)'}
              onBlur={e => e.target.style.borderColor = errors.password ? 'var(--red)' : 'var(--gray-border)'}
            />
            {errors.password && <div style={{ fontSize: 11, color: 'var(--red)', marginBottom: 10 }}>{errors.password}</div>}

            <label style={s.label}>Confirm Password</label>
            <input
              style={{
                ...s.input,
                borderColor: errors.confirmPass ? 'var(--red)' : 'var(--gray-border)'
              }}
              type="password"
              placeholder="••••••••"
              value={confirmPass}
              onChange={handleConfirmPassChange}
              disabled={loading}
              onFocus={e => e.target.style.borderColor = 'var(--blue-mid)'}
              onBlur={e => e.target.style.borderColor = errors.confirmPass ? 'var(--red)' : 'var(--gray-border)'}
            />
            {errors.confirmPass && <div style={{ fontSize: 11, color: 'var(--red)', marginBottom: 10 }}>{errors.confirmPass}</div>}

            <button
              style={{
                ...s.btn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div style={s.divider}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 500, textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>
        </div>
        <div style={s.footer}>Secured with JWT + bcrypt</div>
      </div>
    </div>
  )
}
