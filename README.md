# SWS AI Document Management Dashboard

A full-stack, real-time Document Management Dashboard built for SWS AI.

## Tech Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS v3, Framer Motion
- **Backend**: Node.js, Express, TypeScript, Multer, WebSocket (`ws`)
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel (Frontend), Railway (Backend)

## Features
- **Individual & Bulk Upload**: Upload PDF documents with real-time progress bars.
- **Smart Notifications**: WebSocket-powered notifications for bulk uploads (>3 files).
- **Persistent Notification Center**: Side panel to manage success/info/error notifications.
- **Download Functionality**: Instantly download any uploaded document.
- **Premium Design**: SWS AI branded UI with Livvic font, smooth animations, and responsive layout.

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL database

### 2. Backend Setup
```bash
cd server
npm install
# Copy .env.example to .env and fill in your DATABASE_URL
npx prisma migrate dev
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
# Copy .env.example to .env and fill in VITE_API_URL and VITE_WS_URL
npm run dev
```

## Environment Variables

### Server (`server/.env`)
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default 4000)
- `CLIENT_URL`: URL of the frontend (for CORS)

### Client (`client/.env`)
- `VITE_API_URL`: Backend API URL
- `VITE_WS_URL`: Backend WebSocket URL

## Deployment
- **Frontend**: Connect your GitHub repo to Vercel. Set the root directory to `client`.
- **Backend**: Connect your GitHub repo to Railway. Set the root directory to `server`.

## License
MIT
