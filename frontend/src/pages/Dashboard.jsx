import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiClient } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import UploadZone from '../components/UploadZone'
import FileCard from '../components/FileCard'
import { smartSearch } from '../services/aiServices'

const CATEGORY_FILTERS = ['All', 'Document', 'Image', 'Code', 'Spreadsheet', 'Archive', 'Other']

const s = {
  main: {
    flex: 1, overflow: 'auto', background: 'var(--bg-main)', height: '100vh'
  },
  content: {
    padding: '40px', maxWidth: '1200px', margin: '0 auto'
  },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px'
  },
  searchBox: {
    position: 'relative', width: '100%', maxWidth: '400px'
  },
  searchInput: {
    width: '100%', padding: '12px 16px 12px 42px', borderRadius: '14px', border: '1px solid var(--border-color)',
    fontSize: '14px', background: 'white', outline: 'none', transition: 'var(--transition)'
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px'
  },
  statCard: {
    background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)',
    display: 'flex', alignItems: 'center', gap: '20px', boxShadow: 'var(--shadow-sm)'
  },
  statIcon: {
    width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'var(--primary)'
  },
  filterBar: {
    display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap'
  },
  filterBtn: (active) => ({
    padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
    background: active ? 'var(--primary)' : 'white', color: active ? 'white' : 'var(--text-muted)',
    border: '1px solid', borderColor: active ? 'var(--primary)' : 'var(--border-color)',
    cursor: 'pointer', transition: 'var(--transition)'
  }),
  listHeader: {
    display: 'grid', gridTemplateColumns: '40px 2fr 1fr 1fr 1fr 100px', padding: '12px 16px',
    fontSize: '12px', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase',
    letterSpacing: '0.5px'
  }
}

function fmtBytes(b) {
  if (b > 1024 * 1024 * 1024) return (b / 1024 / 1024 / 1024).toFixed(1) + ' GB'
  if (b > 1024 * 1024) return (b / 1024 / 1024).toFixed(1) + ' MB'
  return Math.round(b / 1024) + ' KB'
}

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [files, setFiles] = useState([])
  const [stats, setStats] = useState({ total: 0, usedBytes: 0, shared: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab')
    const tabMap = { shared: 'Shared', recent: 'Recent', starred: 'Starred', trash: 'Trash' }
    return tabMap[tabParam] || 'My files'
  })
  const [searchResults, setSearchResults] = useState(null)

  useEffect(() => {
    fetchFiles()
  }, [])

  useEffect(() => {
    if (activeTab === 'My files') setSearchParams({})
    else setSearchParams({ tab: activeTab.toLowerCase().replace(' ', '-') })
  }, [activeTab, setSearchParams])

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const { data } = await apiClient.get('/api/files')
      const fileList = Array.isArray(data.files) ? data.files : []
      setFiles(fileList)
      setStats({
        total: data.count || fileList.length,
        usedBytes: data.stats?.usedBytes || fileList.reduce((s, f) => s + (f.size || 0), 0),
        shared: data.stats?.shared || fileList.filter(f => f.sharedWith?.length > 0).length,
      })
    } catch (err) {
      setError('Failed to load files')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!search.trim()) { setSearchResults(null); return }
    const timer = setTimeout(async () => {
      const results = await smartSearch(search, files)
      setSearchResults(results)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, files])

  const getTabFiles = () => {
    const now = new Date()
    switch (activeTab) {
      case 'Recent': return files.filter(f => (now - new Date(f.createdAt)) < 7 * 24 * 60 * 60 * 1000)
      case 'Shared': return files.filter(f => f.sharedWith?.length > 0)
      case 'Starred': return files.filter(f => f.starred)
      case 'Trash': return files.filter(f => f.isDeleted)
      default: return files
    }
  }

  const filtered = (searchResults ?? getTabFiles()).filter(f => 
    filter === 'All' || f.category?.toLowerCase() === filter.toLowerCase()
  )

  const usedPct = Math.min(Math.round((stats.usedBytes / (5 * 1024 ** 3)) * 100), 100)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main style={s.main}>
        <div style={s.content}>
          {/* Top Bar */}
          <div style={s.topBar}>
            <div style={s.searchBox}>
              <span style={{ position: 'absolute', left: '16px', top: '12px', fontSize: '18px' }}>🔍</span>
              <input 
                style={s.searchInput}
                placeholder="Search files, folders..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', cursor: 'pointer' }}>🔔</div>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>G</div>
            </div>
          </div>

          {/* Stats */}
          <div style={s.statsGrid} className="animate-fade-up">
            <div style={s.statCard}>
              <div style={s.statIcon}>📂</div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '800', lineHeight: '1' }}>{stats.total}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '600' }}>Total files</div>
              </div>
            </div>
            <div style={{ ...s.statCard, flex: 1, flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-end' }}>
                 <div>
                   <div style={{ fontSize: '24px', fontWeight: '800', lineHeight: '1' }}>{fmtBytes(stats.usedBytes)} <span style={{ fontSize: '14px', color: 'var(--text-light)' }}>/ 5 GB</span></div>
                   <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '600' }}>Storage used</div>
                 </div>
                 <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>{usedPct}%</div>
              </div>
              <div style={{ height: '8px', width: '100%', background: 'var(--bg-main)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${usedPct}%`, background: 'var(--primary)', borderRadius: '10px' }} />
              </div>
            </div>
            <div style={s.statCard}>
              <div style={{ ...s.statIcon, background: '#F0FDF4', color: '#16A34A' }}>👥</div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '800', lineHeight: '1' }}>{stats.shared}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '600' }}>Shared</div>
              </div>
            </div>
          </div>

          {/* Upload */}
          <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <UploadZone onUploaded={fetchFiles} />
          </div>

          {/* Filters */}
          <div style={s.filterBar} className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {CATEGORY_FILTERS.map(cat => (
              <button 
                key={cat} 
                style={s.filterBtn(filter === cat)}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Files List */}
          <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
               <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{filter === 'All' ? 'Recent files' : filter + 's'}</h3>
               <button style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: '700', background: 'none' }}>View all</button>
             </div>

             <div style={s.listHeader}>
                <div></div>
                <div>Name</div>
                <div>Type</div>
                <div>Size</div>
                <div>Uploaded</div>
                <div style={{ textAlign: 'right' }}>Actions</div>
             </div>

             <div style={{ marginTop: '12px' }}>
                {loading ? (
                   [1,2,3].map(i => <div key={i} style={{ height: '60px', background: 'white', borderRadius: '12px', marginBottom: '8px', border: '1px solid var(--border-color)', opacity: 0.5 }}></div>)
                ) : filtered.length === 0 ? (
                   <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
                      <div style={{ fontWeight: '700' }}>No files found</div>
                      <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Try uploading a file or changing your filters</div>
                   </div>
                ) : (
                   filtered.map(f => <FileCard key={f._id} file={f} />)
                )}
             </div>
          </div>
        </div>
      </main>
    </div>
  )
}
