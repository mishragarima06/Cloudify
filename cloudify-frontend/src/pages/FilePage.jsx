import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CATEGORY_STYLE } from '../components/UploadZone'

function fmtSize(bytes) {
  if (!bytes) return '—'
  if (bytes > 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  return Math.round(bytes / 1024) + ' KB'
}

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}

const ROW = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '0.5px solid var(--gray-border)' }
const KEY = { fontSize: 12, color: 'var(--text-sub)' }
const VAL = { fontSize: 12, fontWeight: 500, color: 'var(--text)' }
const CHIP = (bg, color) => ({ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: bg, color, fontWeight: 500 })

export default function FilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [file, setFile]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [showShare, setShowShare] = useState(false)
  const [shareEmail, setEmail]    = useState('')
  const [shareRole, setRole]      = useState('viewer')
  const [shareExpiry, setExpiry]  = useState('24h')
  const [shareLink, setShareLink] = useState('')
  const [delConfirm, setDel]      = useState(false)
  const [msg, setMsg]             = useState('')

  useEffect(() => {
    axios.get(`/api/files/${id}`)
      .then(r => setFile(r.data))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false))
  }, [id])

  const download = async () => {
    const res = await axios.get(`/api/files/${id}/download`, { responseType: 'blob' })
    const url = URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a'); a.href = url; a.download = file.name; a.click()
    URL.revokeObjectURL(url)
  }

  const share = async () => {
    try {
      await axios.post(`/api/files/${id}/share`, { email: shareEmail, role: shareRole })
      setMsg('Shared successfully!'); setEmail('')
    } catch { setMsg('Share failed') }
  }

  const genLink = async () => {
    const { data } = await axios.post(`/api/files/${id}/share-link`, { expiresIn: shareExpiry })
    setShareLink(data.link)
  }

  const deleteFile = async () => {
    await axios.delete(`/api/files/${id}`)
    navigate('/dashboard')
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ width: 28, height: 28, border: '3px solid var(--blue-light)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (!file) return null
  const cat = CATEGORY_STYLE[file.category] || CATEGORY_STYLE.other
  const daysLeft = file.expiresAt ? Math.ceil((new Date(file.expiresAt) - new Date()) / 86400000) : null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-bg)', padding: '28px 24px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        {/* Back */}
        <button onClick={() => navigate('/dashboard')} style={{
          background: 'transparent', border: 'none', color: 'var(--blue)',
          fontSize: 13, cursor: 'pointer', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 5
        }}>
          ← Back to dashboard
        </button>

        {/* Main card */}
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-lg)',
          border: '0.5px solid var(--gray-border)', padding: 24,
          animation: 'fadeUp 0.3s ease', marginBottom: 14
        }}>
          {/* File header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 18, borderBottom: '0.5px solid var(--gray-border)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
              {cat.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-text)' }}>
                {fmtSize(file.size)} · Uploaded {fmtDate(file.createdAt)}
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div style={ROW}>
            <span style={KEY}>Category</span>
            <span style={CHIP(cat.badge.bg, cat.badge.color)}>{cat.label}</span>
          </div>
          <div style={ROW}>
            <span style={KEY}>Encryption</span>
            <span style={CHIP('var(--green-light)', 'var(--green)')}>AES-256</span>
          </div>
          <div style={ROW}>
            <span style={KEY}>Virus scan</span>
            <span style={CHIP(file.isVirusScanned ? 'var(--green-light)' : 'var(--amber-light)', file.isVirusScanned ? 'var(--green)' : 'var(--amber)')}>
              {file.isVirusScanned ? 'Clean' : 'Pending'}
            </span>
          </div>
          <div style={ROW}>
            <span style={KEY}>Expires</span>
            <span style={CHIP(daysLeft && daysLeft <= 3 ? 'var(--red-light)' : 'var(--amber-light)', daysLeft && daysLeft <= 3 ? 'var(--red)' : 'var(--amber)')}>
              {daysLeft ? `${daysLeft} days left` : 'Never'}
            </span>
          </div>
          <div style={{ ...ROW, borderBottom: 'none' }}>
            <span style={KEY}>Access</span>
            <span style={VAL}>{file.sharedWith?.length > 0 ? `${file.sharedWith.length} people` : 'Only you'}</span>
          </div>

          {/* AI Summary */}
          {file.summary && (
            <div style={{ marginTop: 16, background: 'var(--blue-light)', borderRadius: 8, padding: '10px 14px', borderLeft: '3px solid var(--blue)' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--blue)', marginBottom: 4 }}>AI Summary</div>
              <div style={{ fontSize: 12, color: 'var(--blue-dark)', lineHeight: 1.55 }}>{file.summary}</div>
            </div>
          )}

          {/* Tags */}
          {file.tags?.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {file.tags.map(t => (
                <span key={t} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'var(--gray-2)', color: 'var(--text-sub)', border: '0.5px solid var(--gray-border)' }}>
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 20 }}>
            <button onClick={download} style={{
              padding: '9px', background: 'var(--blue)', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer'
            }}>
              Download
            </button>
            <button onClick={() => setShowShare(s => !s)} style={{
              padding: '9px', background: showShare ? 'var(--blue-light)' : 'transparent',
              color: showShare ? 'var(--blue-dark)' : 'var(--text-sub)',
              border: '0.5px solid var(--gray-border)', borderRadius: 8, fontSize: 12, cursor: 'pointer'
            }}>
              Share
            </button>
            <button onClick={() => setDel(true)} style={{
              padding: '9px', background: 'transparent', color: 'var(--red)',
              border: '0.5px solid #F7C1C1', borderRadius: 8, fontSize: 12, cursor: 'pointer'
            }}>
              Delete
            </button>
          </div>
        </div>

        {/* Share panel */}
        {showShare && (
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '0.5px solid var(--gray-border)', padding: 20, marginBottom: 14, animation: 'fadeUp 0.25s ease' }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Share with people</div>
            {msg && <div style={{ fontSize: 12, color: 'var(--green)', marginBottom: 10 }}>{msg}</div>}

            {/* Share by email */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                placeholder="Email address..."
                value={shareEmail} onChange={e => setEmail(e.target.value)}
                style={{ flex: 1, padding: '8px 11px', fontSize: 12, border: '0.5px solid var(--gray-border)', borderRadius: 7, background: 'var(--gray-2)', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--blue-mid)'}
                onBlur={e => e.target.style.borderColor = 'var(--gray-border)'}
              />
              <select value={shareRole} onChange={e => setRole(e.target.value)} style={{ padding: '8px', fontSize: 12, border: '0.5px solid var(--gray-border)', borderRadius: 7, background: 'var(--gray-2)', outline: 'none' }}>
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
              <button onClick={share} style={{ padding: '8px 14px', background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>
                Add
              </button>
            </div>

            {/* People with access */}
            {file.sharedWith?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--gray-text)', marginBottom: 8 }}>People with access</div>
                {file.sharedWith.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '0.5px solid var(--gray-border)' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--blue)' }}>
                      {(s.user?.name || s.email || 'U')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, fontSize: 12, color: 'var(--text-sub)' }}>{s.user?.email || s.email}</div>
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: 'var(--green-light)', color: 'var(--green)' }}>{s.role}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Share link */}
            <div style={{ background: 'var(--gray-2)', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-sub)', marginBottom: 8 }}>Shareable link</div>
              {shareLink ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1, fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shareLink}</div>
                  <button onClick={() => navigator.clipboard.writeText(shareLink)} style={{ padding: '4px 10px', background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Copy</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <select value={shareExpiry} onChange={e => setExpiry(e.target.value)} style={{ padding: '6px 8px', fontSize: 11, border: '0.5px solid var(--gray-border)', borderRadius: 6, background: 'var(--white)', outline: 'none' }}>
                    <option value="1h">1 hour</option>
                    <option value="24h">24 hours</option>
                    <option value="7d">7 days</option>
                    <option value="never">Never</option>
                  </select>
                  <button onClick={genLink} style={{ padding: '6px 14px', background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>
                    Generate link
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete confirm */}
        {delConfirm && (
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1.5px solid #F7C1C1', padding: 20, animation: 'fadeUp 0.2s ease' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--red)', marginBottom: 8 }}>Delete this file?</div>
            <div style={{ fontSize: 12, color: 'var(--text-sub)', marginBottom: 16 }}>Yeh action undo nahi ho sakti. File permanently delete ho jaayegi.</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={deleteFile} style={{ flex: 1, padding: 9, background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                Haan, delete karo
              </button>
              <button onClick={() => setDel(false)} style={{ flex: 1, padding: 9, background: 'transparent', color: 'var(--text-sub)', border: '0.5px solid var(--gray-border)', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
