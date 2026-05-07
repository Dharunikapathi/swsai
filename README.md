# SWS AI Document Management Dashboard

A professional, full-stack document management platform built for SWS AI document intelligence.

## 🚀 Live Demo
- **Frontend**: [Your Vercel URL]
- **Backend**: [Your Railway/Render URL]

## ✨ Features

- **Parallel File Uploads**: Individual progress tracking for every file with animated shimmer bars.
- **Integrated PDF Intelligence**: Full-screen viewer with automated text analysis (Page count, Words, Headings).
- **Smart Real-time Notifications**: 
    - WebSocket-powered unread alerts.
    - Bulk upload summary (>3 files) with automatic DB persistence.
- **Premium UI/UX**:
    - Branded design with **Livvic** font and curated blue/white palette.
    - Mobile-responsive collapsible sidebar.
    - Glassmorphic header and smooth Framer Motion transitions.
    - Loading skeletons and interactive empty states.
- **Security**: 10MB file size limit and secure PDF serving.

## 🛠 Tech Stack

| Layer | Choice |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS v3 |
| **Styling** | Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **Real-time** | WebSocket (`ws`) |
| **Analysis** | `pdf-parse` for document intelligence |

## 📦 Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### 2. Backend Setup
```bash
cd server
npm install
# Copy .env.example -> .env and fill in DATABASE_URL
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
# Copy .env.example -> .env and fill in VITE_API_URL and VITE_WS_URL
npm run dev
```

## 🗄 Database Schema (Prisma)

```prisma
model Document {
  id          String   @id @default(uuid())
  name        String
  size        Int
  mimeType    String
  storagePath String
  status      String   @default("pending")
  uploadedAt  DateTime @default(now())
  sessionId   String?
}

model Notification {
  id        String   @id @default(uuid())
  message   String
  type      String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  metadata  Json?
}

model UploadSession {
  id          String   @id @default(uuid())
  fileCount   Int
  completedAt DateTime?
  status      String   @default("processing")
  createdAt   DateTime @default(now())
}
```

## 📝 Development Schedule & Commits
This project was built following a structured 15-minute commit schedule:
1. **0:15**: Setup & Prisma Schema
2. **0:45**: Backend Multer & Upload Routes
3. **1:30**: Frontend Dashboard & Parallel Progress
4. **2:15**: WebSocket Integration & Bulk Events
5. **3:00**: Notification Panel & Reading History
6. **3:45**: PDF Viewer, Analysis & Responsive Polish

## 📄 License
MIT
