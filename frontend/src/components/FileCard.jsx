import React from 'react'
import { useNavigate } from 'react-router-dom'

function fmtSize(bytes) {
  if (bytes > 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  if (bytes > 1024) return Math.round(bytes / 1024) + ' KB'
  return bytes + ' B'
}

function fmtDate(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - d) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return diff + ' days ago'
}

const s = {
  row: {
    display: 'grid', gridTemplateColumns: '40px 2fr 1fr 1fr 1fr 100px', alignItems: 'center',
    padding: '12px 16px', borderBottom: '1px solid var(--border-color)',
    background: 'white', cursor: 'pointer', transition: 'var(--transition)', borderRadius: '12px',
    marginBottom: '4px'
  },
  iconBox: (color) => ({
    width: '32px', height: '32px', borderRadius: '8px', background: color,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
  }),
  name: {
    fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', paddingLeft: '12px'
  },
  meta: {
    fontSize: '13px', color: 'var(--text-muted)'
  },
  actionBtn: {
    padding: '6px', borderRadius: '8px', background: 'transparent', color: 'var(--text-light)', cursor: 'pointer'
  }
}

const CATEGORY_ICONS = {
  document: { icon: '📄', color: '#EEF2FF' },
  image: { icon: '🖼', color: '#F0FDF4' },
  spreadsheet: { icon: '📊', color: '#E6F1FB' },
  code: { icon: '💻', color: '#FAEEDA' },
  archive: { icon: '📦', color: '#EEEDFE' },
  other: { icon: '📁', color: '#F8FAF9' },
}

export default function FileCard({ file }) {
  const navigate = useNavigate()
  const cat = CATEGORY_ICONS[file.category] || CATEGORY_ICONS.other

  return (
    <div 
      style={s.row} 
      onClick={() => navigate(`/file/${file._id}`)}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
      onMouseLeave={e => e.currentTarget.style.background = 'white'}
    >
      <div style={s.iconBox(cat.color)}>{cat.icon}</div>
      <div style={s.name}>{file.name}</div>
      <div style={s.meta}>{file.category || 'Other'}</div>
      <div style={s.meta}>{fmtSize(file.size)}</div>
      <div style={s.meta}>{fmtDate(file.createdAt)}</div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
         <button style={s.actionBtn}>🔗</button>
         <button style={s.actionBtn}>⋮</button>
      </div>
    </div>
  )
}
