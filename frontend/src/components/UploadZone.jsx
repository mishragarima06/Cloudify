import React, { useState, useRef } from 'react'
import { apiClient } from '../context/AuthContext'
import { runAIPipeline } from "../services/aiServices";

const s = {
  zone: (dragging, uploading) => ({
    border: dragging ? '2px dashed var(--primary)' : '2px dashed var(--border-color)',
    borderRadius: '20px', padding: '40px 20px', textAlign: 'center',
    background: dragging ? 'var(--primary-light)' : 'var(--bg-main)',
    cursor: uploading ? 'default' : 'pointer',
    transition: 'var(--transition)', position: 'relative'
  }),
  iconBox: {
    width: '60px', height: '60px', background: 'white', borderRadius: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
    boxShadow: 'var(--shadow-md)', color: 'var(--primary)', fontSize: '24px'
  },
  title: {
    fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px'
  },
  subtitle: {
    fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px'
  },
  btn: {
    display: 'inline-flex', padding: '10px 24px', background: 'var(--primary)', color: 'white',
    borderRadius: '10px', fontWeight: '600', fontSize: '13px', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.15)'
  },
  progressCard: {
    marginTop: '20px', background: 'white', border: '1px solid var(--border-color)',
    borderRadius: '16px', padding: '20px', animation: 'fadeUp 0.3s ease'
  },
  progressBar: {
    height: '6px', background: 'var(--bg-main)', borderRadius: '10px', overflow: 'hidden', margin: '12px 0'
  },
  progressFill: (pct) => ({
    height: '100%', width: `${pct}%`, background: 'var(--primary)', transition: 'width 0.3s ease'
  })
}

const STEPS = [
  { id: 'scan', pct: 15, label: 'Virus scanning...', color: 'var(--warning)' },
  { id: 'classify', pct: 35, label: 'AI classifying...', color: 'var(--primary)' },
  { id: 'tags', pct: 55, label: 'Extracting tags...', color: 'var(--primary)' },
  { id: 'encrypt', pct: 75, label: 'Encrypting (AES-256)...', color: 'var(--primary)' },
  { id: 'upload', pct: 90, label: 'Uploading to Firebase...', color: 'var(--success)' },
  { id: 'done', pct: 100, label: 'Done! File saved.', color: 'var(--success)' },
]

export default function UploadZone({ onUploaded }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stepIdx, setStepIdx] = useState(0)
  const [currentFile, setCurrentFile] = useState(null)
  const [error, setError] = useState('')
  const [blocked, setBlocked] = useState(null)
  const fileRef = useRef()

  const setStep = (id) => {
    const idx = STEPS.findIndex(s => s.id === id)
    if (idx >= 0) { setStepIdx(idx); setProgress(STEPS[idx].pct) }
  }

  const uploadFile = async (file) => {
    setError(''); setBlocked(null); setUploading(true)
    setProgress(0); setStepIdx(0)
    setCurrentFile({ name: file.name, size: file.size })

    try {
      setStep('scan')
      const aiResult = await runAIPipeline(file, 'free')

      if (aiResult.blocked) {
        setBlocked(aiResult.threat)
        setUploading(false)
        setCurrentFile(null)
        return
      }

      setStep('classify')
      await pause(400)
      setStep('tags')
      await pause(400)
      setStep('encrypt')
      
      const form = new FormData()
      form.append('file', file)
      form.append('aiMeta', JSON.stringify({
        category: aiResult.category,
        tags: aiResult.tags,
        summary: aiResult.summary,
        isVirusScanned: true,
        virusScanAt: aiResult.virusScan?.scannedAt,
        expiresAt: aiResult.expiry?.expiresAt
      }))

      setStep('upload')
      const { data } = await apiClient.post('/api/files/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => {
          const realPct = 90 + Math.round((e.loaded / e.total) * 9)
          setProgress(realPct)
        }
      })

      setStep('done')
      setTimeout(() => {
        setUploading(false)
        setCurrentFile(null)
        onUploaded?.(data)
      }, 1000)

    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
      setUploading(false)
      setCurrentFile(null)
    }
  }

  const step = STEPS[stepIdx]

  return (
    <div style={{ marginBottom: '30px' }}>
      <div
        onClick={() => !uploading && fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); e.dataTransfer.files[0] && uploadFile(e.dataTransfer.files[0]) }}
        style={s.zone(dragging, uploading)}
      >
        <input ref={fileRef} type="file" style={{ display: 'none' }}
          onChange={e => e.target.files[0] && uploadFile(e.target.files[0])} />
        
        <div style={s.iconBox}>☁</div>
        <div style={s.title}>
          {uploading ? 'Uploading your file...' : 'Drag & drop files here or click to upload'}
        </div>
        <div style={s.subtitle}>PDF, JPG, XLSX, PY, ZIP · Max 50MB</div>
        <div style={s.btn}>Browse files</div>
      </div>

      {uploading && currentFile && (
        <div style={s.progressCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{currentFile.name}</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary)' }}>{progress}%</div>
          </div>
          <div style={s.progressBar}>
            <div style={s.progressFill(progress)} />
          </div>
          <div style={{ fontSize: '12px', color: step.color, fontWeight: '600' }}>{step.label}</div>
        </div>
      )}

      {blocked && (
        <div style={{ ...s.progressCard, border: '1px solid var(--danger)', background: '#FEF2F2' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--danger)', marginBottom: '4px' }}>⛔ Virus Detected</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{blocked}</div>
          <button 
            onClick={() => { setBlocked(null); fileRef.current?.click() }}
            style={{ marginTop: '12px', padding: '6px 16px', background: 'var(--danger)', color: 'white', borderRadius: '8px', fontSize: '12px' }}
          >
            Try another file
          </button>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--danger)', fontWeight: '600' }}>{error}</div>
      )}
    </div>
  )
}

const pause = (ms) => new Promise(r => setTimeout(r, ms))