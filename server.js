const http = require('http')
const url = require('url')

// In-memory user storage (for testing)
const users = []
let tokenCounter = 1000

// Simple JWT-like token generator
const generateToken = () => `token_${tokenCounter++}_${Date.now()}`

// CORS headers
const setCORSHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Content-Type', 'application/json')
}

// Parse JSON body
const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch (e) {
        reject(e)
      }
    })
  })
}

const server = http.createServer(async (req, res) => {
  setCORSHeaders(res)

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  const parsedUrl = url.parse(req.url, true)
  const pathname = parsedUrl.pathname

  // Login endpoint
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    try {
      const { email, password } = await parseBody(req)

      if (!email || !password) {
        res.writeHead(400)
        res.end(JSON.stringify({ msg: 'Email and password required' }))
        return
      }

      // Check if user exists
      const user = users.find(u => u.email === email)
      if (!user || user.password !== password) {
        res.writeHead(401)
        res.end(JSON.stringify({ msg: 'Invalid email or password' }))
        return
      }

      const token = generateToken()
      res.writeHead(200)
      res.end(JSON.stringify({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }))
    } catch (err) {
      console.error('Login error:', err)
      res.writeHead(500)
      res.end(JSON.stringify({ msg: 'Server error' }))
    }
  }

  // Register endpoint
  else if (pathname === '/api/auth/register' && req.method === 'POST') {
    try {
      const { name, email, password } = await parseBody(req)

      if (!name || !email || !password) {
        res.writeHead(400)
        res.end(JSON.stringify({ msg: 'Name, email, and password required' }))
        return
      }

      // Check if email already exists
      if (users.find(u => u.email === email)) {
        res.writeHead(409)
        res.end(JSON.stringify({ msg: 'Email already exists' }))
        return
      }

      // Create new user
      const newUser = {
        id: users.length + 1,
        name,
        email,
        password // In real app, hash this!
      }
      users.push(newUser)

      const token = generateToken()
      res.writeHead(201)
      res.end(JSON.stringify({
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email
        }
      }))
    } catch (err) {
      console.error('Register error:', err)
      res.writeHead(500)
      res.end(JSON.stringify({ msg: 'Server error' }))
    }
  }

  // Health check
  else if (pathname === '/health' && req.method === 'GET') {
    res.writeHead(200)
    res.end(JSON.stringify({ status: 'ok' }))
  }

  // Not found
  else {
    res.writeHead(404)
    res.end(JSON.stringify({ msg: 'Not found' }))
  }
})

const PORT = 5000
server.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`)
  console.log(`\nTest credentials:`)
  console.log(`  Email: test@example.com`)
  console.log(`  Password: password123`)
  console.log(`\nEndpoints:`)
  console.log(`  POST /api/auth/login`)
  console.log(`  POST /api/auth/register`)
  console.log(`  GET /health`)
})
