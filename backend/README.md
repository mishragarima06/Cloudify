# Cloudify Backend 🚀

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Create .env file
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

### 3. Fill these values in .env:
- `MONGO_URI` — your MongoDB Atlas connection string
- `JWT_SECRET` — any random long string
- `ENCRYPTION_KEY` — exactly 32 characters
- `FIREBASE_*` — from your Firebase project settings
- `FLASK_AI_URL` — your Python Flask service URL

### 4. Run the server
```bash
# Development
npm run dev

# Production
npm start
```

---

## API Endpoints

### Auth Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/auth/register | Register new user | ❌ |
| POST | /api/auth/login | Login (Step 1) | ❌ |
| POST | /api/auth/2fa/verify | Login Step 2 (OTP) | ❌ |
| GET | /api/auth/me | Get current user | ✅ |
| POST | /api/auth/logout | Logout | ✅ |
| POST | /api/auth/2fa/setup | Get QR code | ✅ |
| POST | /api/auth/2fa/enable | Activate 2FA | ✅ |

### File Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/files/upload | Upload file | ✅ |
| GET | /api/files | Get my files | ✅ |
| GET | /api/files/download/:id | Download file | ✅ |
| DELETE | /api/files/:id | Delete file | ✅ |
| POST | /api/files/:id/share | Share with user | ✅ |
| POST | /api/files/:id/share-link | Generate share link | ✅ |
| GET | /api/files/s/:token | Access share link | ❌ |
| GET | /api/files/:id/logs | Activity logs | ✅ |

---

## Login Flow with 2FA
```
Step 1: POST /api/auth/login
  → If 2FA disabled: get JWT token directly
  → If 2FA enabled: get userId back

Step 2: POST /api/auth/2fa/verify (with userId + OTP)
  → Get JWT token
```

## 2FA Setup Flow
```
1. POST /api/auth/2fa/setup  → get QR code image
2. Scan QR in Google Authenticator app
3. POST /api/auth/2fa/enable (with OTP) → 2FA activated
```
