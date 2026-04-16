// ============================================================
// src/services/aiService.js
// ============================================================
// YEH FILE SABHI AI FEATURES KA ENTRY POINT HAI
// Abhi: Mock data return karta hai (no backend needed)
// Baad mein: DEV_MOCK = false karo aur real API connect ho jaayega
// ============================================================

const DEV_MOCK = import.meta.env.VITE_DEV_BYPASS !== 'false' // Default true for dev

// ─── CLASSIFICATION RULES ────────────────────────────────────
// Extension ke basis par category map
const EXTENSION_MAP = {
    // Documents
    pdf: 'document', doc: 'document', docx: 'document',
    txt: 'document', odt: 'document', rtf: 'document',
    // Images
    jpg: 'image', jpeg: 'image', png: 'image',
    gif: 'image', webp: 'image', svg: 'image', heic: 'image',
    // Spreadsheets
    xls: 'spreadsheet', xlsx: 'spreadsheet',
    csv: 'spreadsheet', ods: 'spreadsheet',
    // Code
    js: 'code', jsx: 'code', ts: 'code', tsx: 'code',
    py: 'code', java: 'code', cpp: 'code', c: 'code',
    html: 'code', css: 'code', json: 'code', xml: 'code',
    php: 'code', rb: 'code', go: 'code', rs: 'code',
    // Archives
    zip: 'archive', rar: 'archive', tar: 'archive',
    gz: 'archive', '7z': 'archive',
}

// ─── MOCK TAG DATABASE ───────────────────────────────────────
// Category ke hisaab se sample tags (real mein Claude API dega)
const MOCK_TAGS = {
    document: ['report', 'official', 'text', 'notes'],
    image: ['photo', 'visual', 'media', 'graphic'],
    spreadsheet: ['data', 'table', 'numbers', 'analysis'],
    code: ['programming', 'source-code', 'developer'],
    archive: ['compressed', 'backup', 'bundle'],
    other: ['file', 'misc'],
}

// ─── MOCK SUMMARIES ──────────────────────────────────────────
const MOCK_SUMMARIES = {
    document: 'Yeh ek text document hai. Backend connect hone par Claude AI is file ka actual content padhkar detailed summary generate karega.',
    image: 'Yeh ek image file hai. Backend connect hone par Claude Vision is image ka visual description aur content analysis karega.',
    spreadsheet: 'Yeh ek spreadsheet hai jisme tabular data hai. Backend connect hone par AI data patterns aur statistics extract karega.',
    code: 'Yeh ek source code file hai. Backend connect hone par AI language, functions, aur logic ka summary dega.',
    archive: 'Yeh ek compressed archive hai. Backend connect hone par AI andar ke files list karega.',
    other: 'Yeh ek file hai. Backend AI integration ke baad detailed analysis milega.',
}


// ════════════════════════════════════════════════════════════
// FEATURE 1: FILE CLASSIFICATION
// ════════════════════════════════════════════════════════════
// Kya karta hai: File ki category detect karta hai
// Input:  File object { name, size, type }
// Output: { category: string, confidence: number }

export async function classifyFile(file) {
    if (DEV_MOCK) {
        // Mock: Extension se category detect karo
        await delay(400) // Realistic lag simulate karo
        const ext = file.name.split('.').pop().toLowerCase()
        const category = EXTENSION_MAP[ext] || 'other'
        return {
            category,
            confidence: 0.92,
            source: 'extension-map' // Baad mein 'claude-api' hoga
        }
    }

    // REAL BACKEND CALL (jab backend ready ho)
    try {
        const token = localStorage.getItem('cf_token')
        if (!token) throw new Error('No authentication token found')
        
        const res = await fetch('/api/ai/classify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ filename: file.name, mimeType: file.type, size: file.size })
        })
        
        if (!res.ok) {
            throw new Error(`API error: ${res.status} ${res.statusText}`)
        }
        return await res.json()
    } catch (err) {
        console.error('classifyFile error:', err)
        throw err
    }
}


// ════════════════════════════════════════════════════════════
// FEATURE 2: TAG EXTRACTION
// ════════════════════════════════════════════════════════════
// Kya karta hai: File se relevant keywords/tags nikalta hai
// Input:  File object + already-detected category
// Output: string[] — ['tag1', 'tag2', ...]

export async function extractTags(file, category = 'other') {
    if (DEV_MOCK) {
        await delay(300)
        const baseTags = MOCK_TAGS[category] || MOCK_TAGS.other
        // File name se bhi kuch tags banao
        const nameParts = file.name.replace(/\.[^.]+$/, '').split(/[-_\s]+/)
        const nameTags = nameParts.filter(p => p.length > 2).slice(0, 2)
        return [...new Set([...nameTags, ...baseTags])].slice(0, 5)
    }

    // REAL BACKEND CALL
    try {
        const token = localStorage.getItem('cf_token')
        if (!token) throw new Error('No authentication token found')
        
        const res = await fetch('/api/ai/tags', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ filename: file.name, category })
        })
        
        if (!res.ok) {
            throw new Error(`API error: ${res.status} ${res.statusText}`)
        }
        const data = await res.json()
        return data.tags || []
    } catch (err) {
        console.error('extractTags error:', err)
        throw err
    }
}


// ════════════════════════════════════════════════════════════
// FEATURE 3: SUMMARY GENERATION
// ════════════════════════════════════════════════════════════
// Kya karta hai: File content ka short AI summary banata hai
// Input:  File object + category
// Output: string — summary text

export async function generateSummary(file, category = 'other') {
    if (DEV_MOCK) {
        await delay(600) // Summary generation thodi slow hoti hai
        const template = MOCK_SUMMARIES[category] || MOCK_SUMMARIES.other
        return `${file.name}: ${template}`
    }

    // REAL BACKEND CALL
    // Note: Large files ke liye backend file ka text extract karega
    // aur Claude API ko bhejega
    try {
        const token = localStorage.getItem('cf_token')
        if (!token) throw new Error('No authentication token found')
        
        const res = await fetch('/api/ai/summary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ filename: file.name, category, fileId: file._id })
        })
        
        if (!res.ok) {
            throw new Error(`API error: ${res.status} ${res.statusText}`)
        }
        const data = await res.json()
        return data.summary || ''
    } catch (err) {
        console.error('generateSummary error:', err)
        throw err
    }
}


// ════════════════════════════════════════════════════════════
// FEATURE 4: VIRUS SCANNING
// ════════════════════════════════════════════════════════════
// Kya karta hai: File ko malware ke liye scan karta hai
// Input:  File object (actual binary)
// Output: { clean: boolean, threat: string|null, confidence: number }

export async function virusScan(file) {
    if (DEV_MOCK) {
        await delay(800) // Scan time simulate karo
        // Demo: .exe files ko "infected" mark karo, baaki clean
        const dangerousExts = ['exe', 'bat', 'cmd', 'scr', 'vbs', 'ps1']
        const ext = file.name.split('.').pop().toLowerCase()
        const isClean = !dangerousExts.includes(ext)
        return {
            clean: isClean,
            threat: isClean ? null : 'Suspicious executable detected',
            confidence: 0.97,
            scanEngine: 'mock-scanner', // Baad mein 'clamav' ya 'virustotal' hoga
            scannedAt: new Date().toISOString()
        }
    }

    // REAL BACKEND CALL
    // File binary bhejni padegi ClamAV/VirusTotal ke liye
    try {
        const token = localStorage.getItem('cf_token')
        if (!token) throw new Error('No authentication token found')
        
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/ai/virus-scan', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        })
        
        if (!res.ok) {
            throw new Error(`API error: ${res.status} ${res.statusText}`)
        }
        return await res.json()
    } catch (err) {
        console.error('virusScan error:', err)
        throw err
    }
}


// ════════════════════════════════════════════════════════════
// FEATURE 5: AUTO EXPIRY CALCULATION
// ════════════════════════════════════════════════════════════
// Kya karta hai: File type ke hisaab se auto expiry set karta hai
// Input:  category, fileSize, userPlan
// Output: { expiresAt: Date|null, reason: string }
//
// Default Rules:
//   - Free users: 30 days
//   - Images: 90 days
//   - Code files: Never expire
//   - Archives > 100MB: 7 days

export function calculateExpiry(category, fileSizeBytes, userPlan = 'free') {
    const now = new Date()
    const addDays = (d) => new Date(now.getTime() + d * 86400000)

    // Pro users ke liye no expiry by default
    if (userPlan === 'pro') {
        return { expiresAt: null, reason: 'Pro plan — no expiry' }
    }

    // Size-based rules (free users)
    const sizeMB = fileSizeBytes / (1024 * 1024)
    if (sizeMB > 100 && (category === 'archive' || category === 'other')) {
        return { expiresAt: addDays(7), reason: 'Large file — 7 day limit' }
    }

    // Category-based rules
    const rules = {
        code: { days: null, reason: 'Code files never expire' },
        image: { days: 90, reason: 'Images expire in 90 days' },
        document: { days: 30, reason: 'Documents expire in 30 days' },
        spreadsheet: { days: 30, reason: 'Spreadsheets expire in 30 days' },
        archive: { days: 30, reason: 'Archives expire in 30 days' },
        other: { days: 30, reason: 'Files expire in 30 days' },
    }

    const rule = rules[category] || rules.other
    return {
        expiresAt: rule.days ? addDays(rule.days) : null,
        reason: rule.reason
    }
}


// ════════════════════════════════════════════════════════════
// FEATURE 6: AI-POWERED SMART SEARCH
// ════════════════════════════════════════════════════════════
// Kya karta hai: Natural language query se files dhundta hai
// Input:  query string, files array
// Output: Ranked files array

export async function smartSearch(query, files) {
    if (DEV_MOCK) {
        await delay(200)
        // Simple mock: name, tags, category match karo
        const q = query.toLowerCase()
        return files
            .map(f => {
                let score = 0
                if (f.name.toLowerCase().includes(q)) score += 10
                if (f.category?.toLowerCase().includes(q)) score += 5
                if (f.tags?.some(t => t.toLowerCase().includes(q))) score += 3
                if (f.summary?.toLowerCase().includes(q)) score += 2
                return { ...f, _score: score }
            })
            .filter(f => f._score > 0)
            .sort((a, b) => b._score - a._score)
    }

    // REAL BACKEND CALL
    try {
        const token = localStorage.getItem('cf_token')
        if (!token) throw new Error('No authentication token found')
        
        const res = await fetch('/api/ai/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ query, fileIds: files.map(f => f._id) })
        })
        
        if (!res.ok) {
            throw new Error(`API error: ${res.status} ${res.statusText}`)
        }
        const data = await res.json()
        return data.results || []
    } catch (err) {
        console.error('smartSearch error:', err)
        throw err
    }
}


// ─── UTILITY ─────────────────────────────────────────────────
const delay = (ms) => new Promise(r => setTimeout(r, ms))

// ─── MAIN PIPELINE (Sab steps ek saath) ─────────────────────
// Upload ke time ek hi call mein sab AI steps run karo
// Returns: { category, tags, summary, virusScan, expiry }

export async function runAIPipeline(file, userPlan = 'free') {
    // Step 1: Virus scan (SABSE PEHLE — infected files process mat karo)
    const scanResult = await virusScan(file)
    if (!scanResult.clean) {
        return {
            blocked: true,
            threat: scanResult.threat,
            category: null, tags: [], summary: null, expiry: null
        }
    }

    // Step 2: Classification
    const { category } = await classifyFile(file)

    // Step 3 & 4: Tags + Summary (parallel chalaao — faster!)
    const [tags, summary] = await Promise.all([
        extractTags(file, category),
        generateSummary(file, category)
    ])

    // Step 5: Expiry calculate karo
    const expiry = calculateExpiry(category, file.size, userPlan)

    return {
        blocked: false,
        category,
        tags,
        summary,
        virusScan: scanResult,
        expiry
    }
}

export default {
    classifyFile,
    extractTags,
    generateSummary,
    virusScan,
    calculateExpiry,
    smartSearch,
    runAIPipeline
}
