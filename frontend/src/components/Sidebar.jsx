import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const s = {
  aside: {
    width: '240px', flexShrink: 0, background: 'white', borderRight: '1px solid var(--border-color)',
    display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0
  },
  logoBox: {
    padding: '30px 24px', display: 'flex', alignItems: 'center', gap: '12px'
  },
  logo: {
    width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700'
  },
  nav: {
    padding: '0 12px', flex: 1
  },
  navItem: (active) => ({
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px',
    marginBottom: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: active ? '600' : '500',
    color: active ? 'var(--primary)' : 'var(--text-muted)',
    background: active ? 'var(--primary-light)' : 'transparent',
    transition: 'var(--transition)'
  }),
  userSection: {
    padding: '20px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-main)'
  },
  userCard: {
    display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'
  },
  avatar: {
    width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', fontSize: '13px'
  },
  logoutBtn: {
    width: '100%', padding: '10px', background: 'white', border: '1px solid var(--border-color)',
    borderRadius: '10px', color: 'var(--danger)', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
  }
}

const NAV_ITEMS = [
  { label: 'My files', icon: '📁', id: 'my-files' },
  { label: 'Shared', icon: '👥', id: 'shared' },
  { label: 'Recent', icon: '🕒', id: 'recent' },
  { label: 'Starred', icon: '⭐', id: 'starred' },
  { label: 'Trash', icon: '🗑', id: 'trash' },
]

export default function Sidebar({ activeTab, onTabChange }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <aside style={s.aside}>
      <div style={s.logoBox}>
        <div style={s.logo}>C</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1' }}>Cloudify</span>
          <span style={{ fontSize: '10px', color: 'var(--text-light)', fontWeight: '600', marginTop: '4px' }}>Smart Cloud Manager</span>
        </div>
      </div>

      <nav style={s.nav}>
        {NAV_ITEMS.map(item => {
          const isActive = activeTab.toLowerCase().replace(' ', '-') === item.id || 
                          (item.id === 'my-files' && (activeTab === 'My files' || !activeTab))
          return (
            <div 
              key={item.id} 
              style={s.navItem(isActive)}
              onClick={() => onTabChange(item.label)}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {item.label}
            </div>
          )
        })}
      </nav>

      <div style={s.userSection}>
        <div style={s.userCard}>
          <div style={s.avatar}>{initials}</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button 
          style={s.logoutBtn}
          onClick={() => { logout(); navigate('/login') }}
        >
          Logout
        </button>
      </div>
    </aside>
  )
}
