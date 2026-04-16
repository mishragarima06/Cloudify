import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import UploadZone from '../components/UploadZone'
import FileCard from '../components/FileCard'

const CATEGORY_FILTERS = ['All', 'Document', 'Image', 'Code', 'Spreadsheet', 'Archive', 'Other']

function fmtBytes(b) {
  if (b > 1024 * 1024 * 1024) return (b / 1024 / 1024 / 1024).toFixed(1) + ' GB'
  if (b > 1024 * 1024) return (b / 1024 / 1024).toFixed(0) + ' MB'
  return Math.round(b / 1024) + ' KB'
}

export default function Dashboard() {
  const [files, setFiles] = useState([])
  const [stats, setStats] = useState({ total: 0, usedBytes: 0, shared: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [activeTab, setActiveTab] = useState('My files')

  const fetchFiles = async () => {
    try {
      setError('')
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000'
      const { data } = await axios.get(`${apiUrl}/api/files`)
      
      setFiles(Array.isArray(data.files) ? data.files : [])
      setStats(data.stats || { total: 0, usedBytes: 0, shared: 0 })
    } catch (err) {
      console.error('Dashboard: Error fetching files:', err)
      
      let errorMsg = 'Files load nahi ho sake'
      if (!err.response) {
        errorMsg = 'Network error - internet check karo'
      } else if (err.response.status === 401) {
        errorMsg = 'Session expire ho gaya'
      } else if (err.response.status >= 500) {
        errorMsg = 'Server error - baad mein try karo'
      }
      
      setError(errorMsg)
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch files on component mount
  useEffect(() => {
    fetchFiles()
  }, [])

  // Filter files based on search and category
  const filtered = files.filter(f => {
    const matchSearch = f.name?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || f.category?.toLowerCase() === filter.toLowerCase()
    return matchSearch && matchFilter
  })

  const usedPct = Math.min(Math.round((stats.usedBytes / (5 * 1024 ** 3)) * 100), 100)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main style={{ flex: 1, overflow: 'auto', padding: '24px 28px', minWidth: 0 }}>

        {/* Top bar with search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}
              width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="#000" strokeWidth="1.4" />
              <path d="M9.5 9.5l2.5 2.5" stroke="#000" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              placeholder="Search files..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px 8px 32px', fontSize: 13,
                border: '0.5px solid var(--gray-border)', borderRadius: 8,
                background: 'var(--white)', color: 'var(--text)', outline: 'none'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--blue-mid)'}
              onBlur={e => e.target.style.borderColor = 'var(--gray-border)'}
            />
          </div>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', background: 'var(--blue-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600, color: 'var(--blue)', flexShrink: 0
          }}>
            GS
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: 'var(--red-light)', border: '0.5px solid var(--red)',
            borderRadius: 8, padding: '12px 14px', fontSize: 12, color: 'var(--red)',
            marginBottom: 16
          }}>
            {error}
          </div>
        )}

        {/* Stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 22 }}
          className="fade-up">
          {[
            { num: stats.total || 0, label: 'Total files' },
            { num: fmtBytes(stats.usedBytes || 0) + ' / 5 GB', label: 'Storage used' },
            { num: stats.shared || 0, label: 'Shared' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'var(--white)', border: '0.5px solid var(--gray-border)',
              borderRadius: 10, padding: '14px 16px'
            }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', lineHeight: 1 }}>
                {s.num}
              </div>
              <div style={{ fontSize: 11, color: 'var(--gray-text)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Storage bar */}
        <div style={{ marginBottom: 22, animation: 'fadeUp 0.35s 0.05s ease both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--gray-text)', marginBottom: 5 }}>
            <span>Storage</span>
            <span>{usedPct}% used</span>
          </div>
          <div style={{ height: 5, background: 'var(--gray-border)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${usedPct}%`, borderRadius: 3,
              background: usedPct > 80 ? 'var(--red)' : 'var(--blue)',
              transition: 'width 0.6s ease'
            }} />
          </div>
        </div>

        {/* Upload zone */}
        <div style={{ animation: 'fadeUp 0.35s 0.1s ease both' }}>
          <UploadZone onUploaded={() => fetchFiles()} />
        </div>

        {/* Category filters */}
        <div style={{
          display: 'flex', gap: 6, flexWrap: 'wrap',
          marginBottom: 14, animation: 'fadeUp 0.35s 0.15s ease both'
        }}>
          {CATEGORY_FILTERS.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                border: '0.5px solid', cursor: 'pointer', transition: 'all 0.12s',
                borderColor: filter === cat ? 'var(--blue)' : 'var(--gray-border)',
                background: filter === cat ? 'var(--blue-light)' : 'transparent',
                color: filter === cat ? 'var(--blue-dark)' : 'var(--gray-text)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Files section */}
        <div style={{ animation: 'fadeUp 0.35s 0.2s ease both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-sub)' }}>
              {filter === 'All' ? 'Recent files' : filter + 's'} · {filtered.length}
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  height: 100, borderRadius: 10,
                  background: 'linear-gradient(90deg, var(--gray-2) 25%, var(--gray-border) 50%, var(--gray-2) 75%)',
                  backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite'
                }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '40px 20px',
              background: 'var(--white)', borderRadius: 12,
              border: '0.5px solid var(--gray-border)'
            }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>📭</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>
                {search ? 'Koi file nahi mili' : 'Abhi koi file nahi hai'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-text)' }}>
                {search ? 'Alag keyword se search karo' : 'Upar upload zone se pehli file upload karo'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 10 }}>
              {filtered.map(f => <FileCard key={f._id} file={f} />)}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
