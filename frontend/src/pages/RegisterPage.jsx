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
    borderRadius: '12px', background: 'var(--bg-main)', color: 'var(--text-main)', transition: 'var(--transition)', marginBottom: '16px'
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
    display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--text-light)', fontSize: '12px', margin: '20px 0'
  },
  err: {
    background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px', padding: '12px',
    fontSize: '13px', color: '#B91C1C', marginBottom: '20px'
  }
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

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const validateForm = useCallback(() => {
    const newErrors = {}
    if (!name.trim()) newErrors.name = 'Name required'
    if (!email.trim()) newErrors.email = 'Email required'
    else if (!validateEmail(email.trim())) newErrors.email = 'Valid email required'
    if (!password) newErrors.password = 'Password required'
    else if (password.length < 6) newErrors.password = 'Min 6 characters'
    if (confirmPass !== password) newErrors.confirmPass = 'Passwords do not match'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [name, email, password, confirmPass])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setError('')
    setLoading(true)

    try {
      const { data } = await apiClient.post('/api/auth/register', {
        name: name.trim(),
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
      setError(err.response?.data?.message || 'Registration failed. Try again.')
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
          <h2 style={{ fontSize: '42px', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.2' }}>Create your account</h2>
          <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginTop: '16px', maxWidth: '400px' }}>
            Join Cloudify and start managing your files smarter today.
          </p>
          
          <div style={{ marginTop: '40px' }}>
            <AuthFeature icon="📊" title="5 GB free storage" desc="Get started with 5 GB of secure storage." />
            <AuthFeature icon="🤖" title="AI-powered features" desc="Smart classification, summaries & more." />
            <AuthFeature icon="🔒" title="Secure & private" desc="Enterprise-grade security for your files." />
          </div>
        </div>
        
        <img 
          src="/auth_illustration_3d_1777553005441.png" 
          alt="Illustration" 
          style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '500px', opacity: 0.8, transform: 'scaleX(-1)' }} 
        />
      </div>

      {/* Right Panel */}
      <div style={s.right}>
        <div style={s.formBox}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
             <h1 style={s.title}>Create your account</h1>
             <p style={s.subtitle}>Fill in your details to get started</p>
          </div>

          {error && <div style={s.err}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <label style={s.label}>Full Name</label>
            <input
              style={{ ...s.input, borderColor: errors.name ? 'var(--danger)' : 'var(--border-color)' }}
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading}
            />

            <label style={s.label}>Email address</label>
            <input
              style={{ ...s.input, borderColor: errors.email ? 'var(--danger)' : 'var(--border-color)' }}
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />

            <label style={s.label}>Password</label>
            <input
              style={{ ...s.input, borderColor: errors.password ? 'var(--danger)' : 'var(--border-color)' }}
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
            />

            <label style={s.label}>Confirm Password</label>
            <input
              style={{ ...s.input, borderColor: errors.confirmPass ? 'var(--danger)' : 'var(--border-color)' }}
              type="password"
              placeholder="Repeat password"
              value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
              disabled={loading}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
               <input type="checkbox" id="terms" style={{ width: '16px', height: '16px' }} required />
               <label htmlFor="terms" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                 I agree to the <a href="#" style={{ color: 'var(--primary)', fontWeight: '600' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--primary)', fontWeight: '600' }}>Privacy Policy</a>
               </label>
            </div>

            <button type="submit" style={s.btnPrimary} disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <div style={s.divider}>
             <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
             <span>Or register with</span>
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

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)', marginTop: '24px' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700' }}>Login</Link>
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
