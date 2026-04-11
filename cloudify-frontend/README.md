# Cloudify — Frontend

Exact same UI as designed in our project — Login, 2FA OTP, Dashboard, Upload, File Detail, Share.

## Setup

```bash
npm install
npm start        # http://localhost:3000
```

## .env
```
REACT_APP_API_URL=http://localhost:5000
```

## Pages & Routes

| Route         | Component      | Description                        |
|---------------|----------------|------------------------------------|
| /login        | LoginPage      | Email + password form              |
| /register     | RegisterPage   | Form + QR code display             |
| /verify       | OTPPage        | 6-box OTP input, auto-focus        |
| /dashboard    | Dashboard      | Sidebar, stats, upload, file grid  |
| /file/:id     | FilePage       | Detail, share modal, delete        |

## Component Tree

```
App
├── LoginPage
├── RegisterPage
├── OTPPage
└── Dashboard (protected)
    ├── Sidebar
    ├── UploadZone       ← drag & drop + progress bar + AI status chips
    ├── FileCard         ← category icon, badges, expiry chip
    └── FilePage (protected)
        ├── AI Summary box
        ├── Tags row
        ├── Share modal  ← email + role + share link with expiry
        └── Delete confirm
```

## Features
- JWT auth stored in localStorage
- 2FA OTP with 6-box auto-focus + paste support
- Drag & drop upload with animated progress + status chips
- AI category badges on file cards
- File expiry chip when ≤ 7 days left
- Share by email (viewer/editor roles)
- Time-limited share links
- AES-256 encrypted badge on file detail
- AI summary + keyword tags display
