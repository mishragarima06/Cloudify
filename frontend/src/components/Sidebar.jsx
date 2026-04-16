import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { label: 'My files',  icon: '📁', path: '/dashboard' },
  { label: 'Shared',    icon: '🔗', path: '/dashboard?tab=shared' },
  { label: 'Recent',    icon: '🕐', path: '/dashboard?tab=recent' },
  { label: 'Starred',   icon: '⭐', path: '/dashboard?tab=starred' },
  { label: 'Trash',     icon: '🗑', path: '/dashboard?tab=trash' },
]

export default function Sidebar({ activeTab, onTabChange }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()

  return (
    <aside style={{
      width: 'var(--sidebar-w)', flexShrink: 0,
      background: 'var(--white)', borderRight: '0.5px solid var(--gray-border)',
      display: 'flex', flexDirection: 'column', height: '100vh',
      position: 'sticky', top: 0
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '0.5px solid var(--gray-border)' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--blue)', letterSpacing: '-0.3px' }}>
          Cloudify
        </div>
        <div style={{ fontSize: 10, color: 'var(--gray-text)', marginTop: 1 }}>Smart Cloud Manager</div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 8px', flex: 1 }}>
        {NAV.map(item => {
          const isActive = activeTab === item.label.toLowerCase().replace(' ', '-')
            || (item.label === 'My files' && !activeTab)
          return (
            <div
              key={item.label}
              onClick={() => onTabChange && onTabChange(item.label)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 10px', borderRadius: 8, marginBottom: 2,
                cursor: 'pointer', fontSize: 13, fontWeight: isActive ? 500 : 400,
                color: isActive ? 'var(--blue-dark)' : 'var(--text-sub)',
                background: isActive ? 'var(--blue-light)' : 'transparent',
                transition: 'all 0.12s'
              }}
            >
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              {item.label}
            </div>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '12px 12px 16px', borderTop: '0.5px solid var(--gray-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--blue-light)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600, color: 'var(--blue)', flexShrink: 0
          }}>{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--gray-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email || ''}
            </div>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate('/login') }}
          style={{
            width: '100%', padding: '7px', fontSize: 12,
            border: '0.5px solid var(--gray-border)', borderRadius: 7,
            background: 'transparent', color: 'var(--red)', cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  )
}
