// src/components/UploadZone.jsx — Complete Updated Version

import React, { useState, useRef } from 'react'
import axios from 'axios'
import { runAIPipeline } from "../services/aiServices";

export const CATEGORY_STYLE = {
  document: { bg: '#FCEBEB', icon: '📄', badge: { bg: '#EEEDFE', color: '#3C3489' }, label: 'Document' },
  image: { bg: '#EAF3DE', icon: '🖼', badge: { bg: '#EAF3DE', color: '#27500A' }, label: 'Image' },
  spreadsheet: { bg: '#E6F1FB', icon: '📊', badge: { bg: '#E6F1FB', color: '#0C447C' }, label: 'Spreadsheet' },
  code: { bg: '#FAEEDA', icon: '💻', badge: { bg: '#FAEEDA', color: '#633806' }, label: 'Code' },
  archive: { bg: '#EEEDFE', icon: '📦', badge: { bg: '#EEEDFE', color: '#3C3489' }, label: 'Archive' },
  other: { bg: '#F1EFE8', icon: '📁', badge: { bg: '#F1EFE8', color: '#444441' }, label: 'Other' },
}

// Upload ke dauraan dikhne wale steps
const STEPS = [
  { id: 'scan', pct: 15, label: 'Virus scanning...', bg: '#FAEEDA', color: '#633806' },
  { id: 'classify', pct: 35, label: 'AI classifying...', bg: '#EEEDFE', color: '#3C3489' },
  { id: 'tags', pct: 55, label: 'Extracting tags...', bg: '#E6F1FB', color: '#0C447C' },
  { id: 'encrypt', pct: 75, label: 'Encrypting (AES-256)...', bg: '#E6F1FB', color: '#0C447C' },
  { id: 'upload', pct: 90, label: 'Uploading to Firebase...', bg: '#EAF3DE', color: '#27500A' },
  { id: 'done', pct: 100, label: 'Done! File saved.', bg: '#EAF3DE', color: '#27500A' },
]

export default function UploadZone({ onUploaded, userPlan = 'free' }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stepIdx, setStepIdx] = useState(0)
  const [currentFile, setCurrentFile] = useState(null)
  const [error, setError] = useState('')
  const [blocked, setBlocked] = useState(null) // Virus threat info
  const fileRef = useRef()

  const setStep = (id) => {
    const idx = STEPS.findIndex(s => s.id === id)
    if (idx >= 0) { setStepIdx(idx); setProgress(STEPS[idx].pct) }
  }

  const handleDrop = e => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  const uploadFile = async (file) => {
    // Reset state
    setError(''); setBlocked(null); setUploading(true)
    setProgress(0); setStepIdx(0)
    setCurrentFile({ name: file.name, size: file.size })

    try {
      // ── STEP 1: AI PIPELINE (Virus scan + Classify + Tags + Summary) ──
      setStep('scan')
      const aiResult = await runAIPipeline(file, userPlan)

      // Infected file — block karo
      if (aiResult.blocked) {
        setBlocked(aiResult.threat)
        setUploading(false)
        setCurrentFile(null)
        return
      }

      setStep('classify')
      await pause(300) // UI update ke liye thoda wait

      setStep('tags')
      await pause(300)

      // ── STEP 2: BACKEND UPLOAD ──
      setStep('encrypt')
      const form = new FormData()
      form.append('file', file)
      // AI metadata bhi bhejo — backend ko dobara classify nahi karna padega
      form.append('aiMeta', JSON.stringify({
        category: aiResult.category,
        tags: aiResult.tags,
        summary: aiResult.summary,
        isVirusScanned: true,
        virusScanAt: aiResult.virusScan?.scannedAt,
        expiresAt: aiResult.expiry?.expiresAt
      }))

      setStep('upload')
      const { data } = await axios.post('/api/files/upload', form, {
        onUploadProgress: e => {
          // Real upload progress (90-99% ke beech)
          const realPct = 90 + Math.round((e.loaded / e.total) * 9)
          setProgress(realPct)
        }
      })

      // ── DONE ──
      setStep('done')
      setTimeout(() => {
        setUploading(false)
        setCurrentFile(null)
        onUploaded?.(data)
      }, 1200)

    } catch (err) {
      setError(err.response?.data?.msg || 'Upload failed. Dobara try karo.')
      setUploading(false)
      setCurrentFile(null)
    }
  }

  const step = STEPS[stepIdx]

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
        <input ref={fileRef} type="file" style={{ display: 'none' }}
          onChange={e => e.target.files[0] && uploadFile(e.target.files[0])} />
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2v10M6 5l3-3 3 3M3 13v2h12v-2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--blue-dark)', marginBottom: 3 }}>
          {uploading ? currentFile?.name : 'Yahan drag karo ya click karo'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--blue-mid)' }}>
          PDF, JPG, XLSX, PY · max 50MB
        </div>
        <div style={{ display: 'inline-block', marginTop: 10, background: 'var(--blue)', color: '#fff', borderRadius: 6, padding: '5px 14px', fontSize: 11, fontWeight: 500 }}>
          Browse files
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && currentFile && (
        <div style={{ marginTop: 10, background: 'var(--white)', border: '0.5px solid var(--gray-border)', borderRadius: 10, padding: '12px 14px', animation: 'fadeUp 0.25s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ fontSize: 20 }}>📄</div>
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
          <div style={{ height: 4, background: 'var(--gray-border)', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', width: `${progress}%`, borderRadius: 2, background: progress === 100 ? 'var(--green)' : 'var(--blue)', transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ display: 'inline-block', fontSize: 10, padding: '2px 9px', borderRadius: 10, background: step.bg, color: step.color, fontWeight: 500 }}>
            {step.label}
          </div>
        </div>
      )}

      {/* Virus Blocked Warning */}
      {blocked && (
        <div style={{ marginTop: 10, background: '#FFF0F0', border: '1px solid #FFCCCC', borderRadius: 10, padding: '14px 16px', animation: 'fadeUp 0.25s ease' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)', marginBottom: 4 }}>
            ⛔ File Blocked — Virus Detected
          </div>
          <div style={{ fontSize: 12, color: '#CC4444' }}>{blocked}</div>
          <div style={{ fontSize: 11, color: 'var(--gray-text)', marginTop: 6 }}>
            Yeh file upload nahi ho sakti. Ek safe file choose karo.
          </div>
          <button
            onClick={() => { setBlocked(null); fileRef.current?.click() }}
            style={{ marginTop: 10, padding: '6px 14px', background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}
          >
            Doosri file choose karo
          </button>
        </div>
      )}

      {/* General Error */}
      {error && (
        <div style={{ marginTop: 8, background: 'var(--red-light)', borderRadius: 7, padding: '8px 12px', fontSize: 12, color: 'var(--red)' }}>
          {error}
        </div>
      )}
    </div>
  )
}

const pause = (ms) => new Promise(r => setTimeout(r, ms))