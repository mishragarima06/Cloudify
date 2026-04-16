import React from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORY_STYLE } from './UploadZone'

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

export default function FileCard({ file }) {
  const navigate = useNavigate()
  const cat = CATEGORY_STYLE[file.category] || CATEGORY_STYLE.other
  const daysLeft = file.expiresAt
    ? Math.ceil((new Date(file.expiresAt) - new Date()) / 86400000)
    : null

  return (
    <div
      onClick={() => navigate(`/file/${file._id}`)}
      style={{
        background: 'var(--white)', border: '0.5px solid var(--gray-border)',
        borderRadius: 10, padding: 12, cursor: 'pointer',
        transition: 'border-color 0.15s, transform 0.12s'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--blue-mid)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--gray-border)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Icon */}
      <div style={{
        width: 34, height: 34, borderRadius: 8, background: cat.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, marginBottom: 8
      }}>
        {cat.icon}
      </div>

      {/* Name */}
      <div style={{
        fontSize: 12, fontWeight: 500, color: 'var(--text)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        marginBottom: 3
      }}>
        {file.name}
      </div>

      {/* Meta */}
      <div style={{ fontSize: 10, color: 'var(--gray-text)', marginBottom: 6 }}>
        {fmtSize(file.size)} · {fmtDate(file.createdAt)}
      </div>

      {/* Badges row */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{
          fontSize: 9, padding: '1px 6px', borderRadius: 8,
          background: cat.badge.bg, color: cat.badge.color, fontWeight: 500
        }}>
          {cat.label}
        </span>

        {file.isVirusScanned && (
          <span style={{
            fontSize: 9, padding: '1px 6px', borderRadius: 8,
            background: 'var(--green-light)', color: 'var(--green)'
          }}>
            Clean
          </span>
        )}

        {daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
          <span style={{
            fontSize: 9, padding: '1px 6px', borderRadius: 8,
            background: 'var(--amber-light)', color: 'var(--amber)'
          }}>
            {daysLeft}d left
          </span>
        )}
      </div>
    </div>
  )
}
