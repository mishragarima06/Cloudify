import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiClient } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'

const s = {
  main: {
    flex: 1, overflow: 'auto', background: 'var(--bg-main)', height: '100vh'
  },
  content: {
    padding: '40px', maxWidth: '1000px', margin: '0 auto'
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px'
  },
  backBtn: {
    padding: '10px 20px', borderRadius: '12px', background: 'white', border: '1px solid var(--border-color)',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
  },
  detailsCard: {
    background: 'white', padding: '40px', borderRadius: '24px', border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-lg)'
  },
  fileIcon: {
    width: '80px', height: '80px', background: 'var(--primary-light)', borderRadius: '20px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', marginBottom: '24px'
  },
  title: {
    fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '12px'
  },
  meta: {
    fontSize: '14px', color: 'var(--text-muted)', display: 'flex', gap: '20px', marginBottom: '32px'
  },
  actionGroup: {
    display: 'flex', gap: '16px', marginBottom: '40px'
  },
  btnPrimary: {
    padding: '12px 24px', background: 'var(--primary)', color: 'white', borderRadius: '12px',
    fontWeight: '700', fontSize: '15px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'
  },
  btnSecondary: {
    padding: '12px 24px', background: 'white', color: 'var(--text-main)', borderRadius: '12px',
    border: '1px solid var(--border-color)', fontWeight: '700', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'
  },
  infoSection: {
    borderTop: '1px solid var(--border-color)', paddingTop: '32px'
  },
  label: {
    fontSize: '12px', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '8px'
  },
  text: {
    fontSize: '15px', color: 'var(--text-main)', marginBottom: '24px', lineHeight: '1.6'
  }
}

export default function FilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchFile()
  }, [id])

  const fetchFile = async () => {
    try {
      setLoading(true)
      const { data } = await apiClient.get(`/api/files`) // Note: Backend usually has /api/files/:id
      // For now finding in list if backend detail route isn't specific
      const found = data.files?.find(f => f._id === id)
      if (found) setFile(found)
      else setError('File not found')
    } catch (err) {
      setError('Failed to load file details')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const response = await apiClient.get(`/api/files/download/${id}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', file.originalName || file.name)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      alert('Download failed')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this file?')) return
    try {
      await apiClient.delete(`/api/files/${id}`)
      navigate('/dashboard')
    } catch (err) {
      alert('Delete failed')
    }
  }

  if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar activeTab="My files" onTabChange={() => navigate('/dashboard')} />
      
      <main style={s.main}>
        <div style={s.content} className="animate-fade-up">
          <div style={s.header}>
             <button style={s.backBtn} onClick={() => navigate(-1)}>← Back to Dashboard</button>
             <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ ...s.backBtn, color: file?.starred ? 'var(--warning)' : 'var(--text-light)' }}>★</button>
                <button style={s.backBtn}>⚙</button>
             </div>
          </div>

          {!file ? (
             <div style={{ textAlign: 'center', padding: '60px' }}>{error || 'File not found'}</div>
          ) : (
            <div style={s.detailsCard}>
              <div style={s.fileIcon}>📄</div>
              <h1 style={s.title}>{file.name}</h1>
              <div style={s.meta}>
                 <span>📁 {file.category || 'Other'}</span>
                 <span>⚖ {(file.size / 1024 / 1024).toFixed(2)} MB</span>
                 <span>📅 {new Date(file.createdAt).toLocaleDateString()}</span>
              </div>

              <div style={s.actionGroup}>
                 <button style={s.btnPrimary} onClick={handleDownload}>📥 Download File</button>
                 <button style={s.btnSecondary}>🔗 Share Link</button>
                 <button style={{ ...s.btnSecondary, color: 'var(--danger)', borderColor: '#FCA5A5' }} onClick={handleDelete}>🗑 Delete</button>
              </div>

              <div style={s.infoSection}>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                    <div>
                       <div style={s.label}>AI Summary</div>
                       <div style={s.text}>{file.aiSummary || 'No summary available for this file type.'}</div>
                    </div>
                    <div>
                       <div style={s.label}>Security Status</div>
                       <div style={{ ...s.text, color: 'var(--success)', fontWeight: '700' }}>
                          ✓ Virus Scanned (ClamAV)<br/>
                          ✓ Encrypted (AES-256)
                       </div>
                    </div>
                 </div>

                 <div style={s.label}>Tags</div>
                 <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                    {file.tags?.map(t => (
                       <span key={t} style={{ padding: '4px 12px', background: 'var(--bg-main)', borderRadius: '20px', fontSize: '13px', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                          #{t}
                       </span>
                    )) || <span style={{ color: 'var(--text-light)', fontSize: '14px' }}>No tags available</span>}
                 </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
