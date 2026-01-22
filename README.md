# VideoStream - AI Video Processing Platform

A full-stack video upload, sensitivity processing, and streaming application with real-time progress updates.

![VideoStream](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

- **Video Upload & Streaming**: Upload videos with drag & drop, stream with adaptive playback
- **AI Sensitivity Analysis**: Automated content moderation with detailed breakdowns
- **Real-time Processing**: Socket.io powered live progress updates
- **Role-based Access Control**: Admin, Editor, and Viewer roles
- **Modern UI/UX**: Premium SaaS-style dashboard with glassmorphism design
- **Responsive Design**: Works seamlessly on desktop and mobile

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- Framer Motion (animations)
- Lucide React (icons)
- Socket.io Client
- React Router v6
- React Hot Toast

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Socket.io
- Multer (file uploads)

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### Clone Repository
```bash
git clone <your-repo-url>
cd VideoStreamApp
```

### Backend Setup
```bash
cd server
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Seed demo users (optional)
npm run seed

# Start development server
npm run dev
```

### Frontend Setup
```bash
cd client
npm install

# Start development server
npm run dev
```

## 🔐 Demo Credentials

| Role   | Email                    | Password    |
|--------|--------------------------|-------------|
| Admin  | admin@videostream.com    | Admin@123   |
| Editor | editor@videostream.com   | Editor@123  |
| Viewer | viewer@videostream.com   | Viewer@123  |

## 🚀 Deployment Guide

### Step 1: Setup MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free account and new cluster
3. Create database user with password
4. Whitelist IP: `0.0.0.0/0` (allow from anywhere)
5. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/videostream`

### Step 2: Deploy Backend to Render

1. Go to [Render.com](https://render.com)
2. Create new **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `videostream-api`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node

5. Add Environment Variables:
   ```
   PORT=3001
   MONGODB_URI=your-mongodb-atlas-uri
   JWT_SECRET=your-secure-secret-key
   JWT_EXPIRE=30d
   CLIENT_URL=https://your-frontend.vercel.app
   NODE_ENV=production
   ALLOWED_VIDEO_TYPES=video/mp4,video/webm,video/quicktime,video/x-msvideo
   ```

6. Deploy and note the URL (e.g., `https://videostream-api.onrender.com`)

### Step 3: Deploy Frontend to Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add Environment Variables:
   ```
   VITE_API_URL=https://videostream-api.onrender.com/api
   VITE_SOCKET_URL=https://videostream-api.onrender.com
   ```

5. Deploy!

### Step 4: Update Backend CORS

After frontend is deployed, update `CLIENT_URL` in Render to match your Vercel URL.

### Step 5: Seed Database (Optional)

Run the seed script on your deployed backend:
```bash
# Using Render Shell or locally with production env
npm run seed
```

## 📁 Project Structure

```
VideoStreamApp/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── auth/          # Protected routes
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   └── utils/         # Helper functions
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                 # Node.js Backend
│   ├── src/
│   │   ├── config/        # DB & multer config
│   │   ├── controllers/   # Route controllers
│   │   ├── middlewares/   # Auth & error handling
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── sockets/       # Socket.io handlers
│   │   ├── uploads/       # Video files
│   │   └── utils/         # Seed script
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/videostream
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
ALLOWED_VIDEO_TYPES=video/mp4,video/webm,video/quicktime,video/x-msvideo
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

## 📜 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Videos
- `GET /api/videos` - List all videos
- `POST /api/videos/upload` - Upload video (Editor/Admin)
- `GET /api/videos/:id` - Get video details
- `GET /api/videos/:id/stream` - Stream video
- `DELETE /api/videos/:id` - Delete video (Editor/Admin)
- `GET /api/videos/stats` - Get video statistics

### Users (Admin only)
- `GET /api/users` - List all users
- `PUT /api/users/:id/role` - Update user role
- `PUT /api/users/:id/status` - Toggle user status
- `DELETE /api/users/:id` - Delete user

## 🔒 Role Permissions

| Action          | Viewer | Editor | Admin |
|-----------------|--------|--------|-------|
| View videos     | ✅     | ✅     | ✅    |
| Upload videos   | ❌     | ✅     | ✅    |
| Delete videos   | ❌     | ✅     | ✅    |
| Manage users    | ❌     | ❌     | ✅    |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using React, Node.js, and MongoDB
