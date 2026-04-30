import React, { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, apiClient } from '../context/AuthContext'

const s = {
  page: {
    minHeight: '100vh', display: 'flex', background: 'white'
  },
  left: {
    flex: 1.2, display: 'flex', flexDirection: 'column', padding: '60px',
    background: 'var(--primary-light)', position: 'relative', overflow: 'hidden'
  },
  right: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px'
  },
  formBox: {
    width: '100%', maxWidth: '420px'
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', fontWeight: '700', color: 'var(--primary)', marginBottom: '100px'
  },
  title: {
    fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '12px'
  },
  subtitle: {
    fontSize: '15px', color: 'var(--text-muted)', marginBottom: '32px'
  },
  label: {
    display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '8px'
  },
  input: {
    width: '100%', padding: '12px 16px', fontSize: '14px', border: '1px solid var(--border-color)',
    borderRadius: '12px', background: 'var(--bg-main)', color: 'var(--text-main)', transition: 'var(--transition)', marginBottom: '20px'
  },
  btnPrimary: {
    width: '100%', padding: '14px', background: 'var(--primary)', color: 'white', borderRadius: '12px',
    fontWeight: '700', fontSize: '15px', marginTop: '10px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
  },
  socialBtn: {
    flex: 1, padding: '12px', border: '1px solid var(--border-color)', borderRadius: '12px',
    background: 'white', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
  },
  divider: {
    display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--text-light)', fontSize: '12px', margin: '24px 0'
  },
  err: {
    background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px', padding: '12px',
    fontSize: '13px', color: '#B91C1C', marginBottom: '20px'
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { login, isAuth } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuth) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuth, navigate])

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const validateForm = useCallback(() => {
    const newErrors = {}
    if (!email.trim()) newErrors.email = 'Email required'
    else if (!validateEmail(email)) newErrors.email = 'Valid email required'
    if (!password) newErrors.password = 'Password required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [email, password])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setError('')
    setLoading(true)

    try {
      const { data } = await apiClient.post('/api/auth/login', {
        email: email.trim(),
        password
      })

      if (data.requires2FA && data.tempToken) {
        sessionStorage.setItem('tempToken', data.tempToken)
        navigate('/verify', { replace: true })
      } else if (data.token && data.user) {
        localStorage.setItem('cf_token', data.token)
        login(data.token, data.user)
        navigate('/dashboard', { replace: true })
      } else {
        setError('Invalid response from server')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      {/* Left Panel */}
      <div style={s.left}>
        <div style={s.logo}>
          <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>C</div>
          Cloudify
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '42px', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.2' }}>Welcome back!</h2>
          <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginTop: '16px', maxWidth: '400px' }}>
            Sign in to your Cloudify account and manage your files with intelligence.
          </p>
          
          <div style={{ marginTop: '40px' }}>
            <AuthFeature icon="☁" title="Secure cloud storage" desc="Your files are safe and encrypted." />
            <AuthFeature icon="💻" title="Access anywhere" desc="Access your files from any device." />
            <AuthFeature icon="🤖" title="Smart organization" desc="AI-powered file management." />
          </div>
        </div>
        
        <img 
          src="/auth_illustration_3d_1777553005441.png" 
          alt="Illustration" 
          style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '500px', opacity: 0.8 }} 
        />
      </div>

      {/* Right Panel */}
      <div style={s.right}>
        <div style={s.formBox}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
             <h1 style={s.title}>Login to your account</h1>
             <p style={s.subtitle}>Enter your details to continue</p>
          </div>

          {error && <div style={s.err}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <label style={s.label}>Email address</label>
            <input
              style={{ ...s.input, borderColor: errors.email ? 'var(--danger)' : 'var(--border-color)' }}
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <label style={s.label}>Password</label>
               <a href="#" style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600', marginBottom: '8px' }}>Forgot password?</a>
            </div>
            <input
              style={{ ...s.input, borderColor: errors.password ? 'var(--danger)' : 'var(--border-color)' }}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPass(e.target.value)}
              disabled={loading}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
               <input type="checkbox" id="remember" style={{ width: '16px', height: '16px' }} />
               <label htmlFor="remember" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Remember me</label>
            </div>

            <button type="submit" style={s.btnPrimary} disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <div style={s.divider}>
             <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
             <span>Or continue with</span>
             <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button style={s.socialBtn}>
              <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '16px' }} /> Google
            </button>
            <button style={s.socialBtn}>
              <img src="https://github.com/favicon.ico" alt="GitHub" style={{ width: '16px' }} /> GitHub
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)', marginTop: '32px' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '700' }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function AuthFeature({ icon, title, desc }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
       <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: 'var(--shadow-sm)' }}>{icon}</div>
       <div>
         <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{title}</div>
         <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{desc}</div>
       </div>
    </div>
  )
}