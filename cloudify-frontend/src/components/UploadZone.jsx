import React, { useState, useRef } from 'react'
import axios from 'axios'

const CATEGORY_STYLE = {
  document:    { bg: '#FCEBEB', icon: '📄', badge: { bg: '#EEEDFE', color: '#3C3489' }, label: 'Document' },
  image:       { bg: '#EAF3DE', icon: '🖼',  badge: { bg: '#EAF3DE', color: '#27500A' }, label: 'Image' },
  spreadsheet: { bg: '#E6F1FB', icon: '📊', badge: { bg: '#E6F1FB', color: '#0C447C' }, label: 'Spreadsheet' },
  code:        { bg: '#FAEEDA', icon: '💻', badge: { bg: '#FAEEDA', color: '#633806' }, label: 'Code' },
  archive:     { bg: '#EEEDFE', icon: '📦', badge: { bg: '#EEEDFE', color: '#3C3489' }, label: 'Archive' },
  other:       { bg: '#F1EFE8', icon: '📁', badge: { bg: '#F1EFE8', color: '#444441' }, label: 'Other' },
}

const UPLOAD_STEPS = [
  { pct: 20, label: 'Virus scanning...',        bg: '#FAEEDA', color: '#633806' },
  { pct: 45, label: 'AI classifying...',         bg: '#EEEDFE', color: '#3C3489' },
  { pct: 70, label: 'Encrypting (AES-256)...',   bg: '#E6F1FB', color: '#0C447C' },
  { pct: 90, label: 'Uploading to Firebase...',  bg: '#EAF3DE', color: '#27500A' },
  { pct: 100, label: 'Done! File saved.',        bg: '#EAF3DE', color: '#27500A' },
]

export default function UploadZone({ onUploaded }) {
  const [dragging, setDragging]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState(0)
  const [stepIdx, setStepIdx]     = useState(0)
  const [currentFile, setCurrentFile] = useState(null)
  const [error, setError]         = useState('')
  const fileRef = useRef()

  const handleDrop = e => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  const handleFileInput = e => {
    if (e.target.files[0]) uploadFile(e.target.files[0])
  }

  const uploadFile = async (file) => {
    setError(''); setUploading(true); setProgress(0); setStepIdx(0)
    setCurrentFile({ name: file.name, size: file.size })

    // Animate steps
    let idx = 0
    const interval = setInterval(() => {
      if (idx < UPLOAD_STEPS.length - 1) {
        idx++; setStepIdx(idx); setProgress(UPLOAD_STEPS[idx].pct)
      }
    }, 700)

    try {
      const form = new FormData()
      form.append('file', file)
      const { data } = await axios.post('/api/files/upload', form, {
        onUploadProgress: e => {
          const pct = Math.round((e.loaded / e.total) * 40) // 0-40% real progress
          setProgress(pct)
        }
      })
      clearInterval(interval)
      setProgress(100); setStepIdx(UPLOAD_STEPS.length - 1)
      setTimeout(() => {
        setUploading(false); setCurrentFile(null)
        onUploaded && onUploaded(data)
      }, 1200)
    } catch (err) {
      clearInterval(interval)
      setError(err.response?.data?.msg || 'Upload failed. Try again.')
      setUploading(false); setCurrentFile(null)
    }
  }

  const step = UPLOAD_STEPS[stepIdx]

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Drop Zone */}
      <div
        onClick={() => !uploading && fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? 'var(--blue)' : 'var(--blue-mid)'}`,
          borderRadius: 12, padding: '22px 16px', textAlign: 'center',
          background: dragging ? 'var(--blue-light)' : '#F0F6FD',
          cursor: uploading ? 'default' : 'pointer',
          transition: 'all 0.2s'
        }}
      >
        <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFileInput} />
        <div style={{
          width: 38, height: 38, borderRadius: 10, background: 'var(--blue)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 10px'
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2v10M6 5l3-3 3 3M3 13v2h12v-2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--blue-dark)', marginBottom: 3 }}>
          {uploading ? currentFile?.name : 'Yahan drag karo ya click karo'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--blue-mid)' }}>
          PDF, JPG, XLSX, PY · max 50MB
        </div>
        <div style={{
          display: 'inline-block', marginTop: 10, background: 'var(--blue)',
          color: '#fff', borderRadius: 6, padding: '5px 14px', fontSize: 11, fontWeight: 500
        }}>
          Browse files
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && currentFile && (
        <div style={{
          marginTop: 10, background: 'var(--white)', border: '0.5px solid var(--gray-border)',
          borderRadius: 10, padding: '12px 14px', animation: 'fadeUp 0.25s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ fontSize: 20, flexShrink: 0 }}>📄</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentFile.name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--gray-text)' }}>
                {(currentFile.size / 1024 / 1024).toFixed(1)} MB
              </div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue)' }}>{progress}%</div>
          </div>
          {/* Progress bar */}
          <div style={{ height: 4, background: 'var(--gray-border)', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{
              height: '100%', width: `${progress}%`, borderRadius: 2,
              background: progress === 100 ? 'var(--green)' : 'var(--blue)',
              transition: 'width 0.5s ease'
            }} />
          </div>
          {/* Status chip */}
          <div style={{
            display: 'inline-block', fontSize: 10, padding: '2px 9px',
            borderRadius: 10, background: step.bg, color: step.color, fontWeight: 500
          }}>
            {step.label}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 8, background: 'var(--red-light)', borderRadius: 7,
          padding: '8px 12px', fontSize: 12, color: 'var(--red)'
        }}>
          {error}
        </div>
      )}
    </div>
  )
}

export { CATEGORY_STYLE }
