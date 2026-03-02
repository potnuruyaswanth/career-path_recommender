# 📋 Deployment Configuration Guide

## ✅ Current Deployment Setup

### Frontend (Vercel)
- **URL**: https://career-path-navigator-sobk.vercel.app
- **API Base**: `https://career-navigator-backend-7el6.onrender.com`
- **Environment File**: `.env.production` (Vercel uses this automatically)
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output**: `frontend/dist`

### Backend (Render)
- **URL**: https://career-navigator-backend-7el6.onrender.com
- **Port**: 8000
- **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port 8000`
- **CORS Enabled**: ✅ Yes (Vercel domain configured)

---

## 🔧 Environment Variables

### Development (Local)
```bash
# frontend/.env.development
VITE_API_BASE=http://127.0.0.1:8000
```

### Production (Vercel)
```bash
# frontend/.env.production
VITE_API_BASE=https://career-navigator-backend-7el6.onrender.com
```

---

## 🌐 Port Configuration

| Service | Local | Production |
|---------|-------|------------|
| Backend | http://127.0.0.1:8000 | https://career-navigator-backend-7el6.onrender.com |
| Frontend | http://localhost:5173 | https://career-path-navigator-sobk.vercel.app |

---

## 🚀 Deployment Process

### First Time Setup
1. Push to GitHub
2. Render auto-deploys backend
3. Vercel auto-deploys frontend
4. Both services read from environment variables

### To Update Production URLs
1. Update `.env.production` file
2. Update `vercel.json` with new API URL
3. Push to GitHub
4. Vercel will redeploy automatically

---

## ✨ How It Works

1. **Development**: Uses `http://127.0.0.1:8000` (local backend)
2. **Production**: Uses `https://career-navigator-backend-7el6.onrender.com` (Render API)
3. **Auto-Detection**: Frontend code reads `VITE_API_BASE` environment variable
4. **CORS**: Backend accepts requests from both local and production frontends

---

## 🔐 CORS Configuration (Backend)

The backend's `main.py` allows requests from:
- ✅ Local development (localhost:5173, etc.)
- ✅ Production Vercel (https://career-path-navigator-sobk.vercel.app)
- ✅ All standard HTTP methods (GET, POST, OPTIONS)

---

## ✅ Verification Checklist

- [x] `.env.production` created with correct API URL
- [x] `.env.development` created for local development
- [x] `vercel.json` updated with API endpoint
- [x] `render.yaml` configured for backend deployment
- [x] Backend CORS allows Vercel domain
- [x] Frontend pages use `import.meta.env.VITE_API_BASE`
- [x] Fallback to localhost for local development

---

## 📞 Support

If ports are still showing localhost after deployment:
1. Check that Vercel's env vars are set correctly
2. Verify `VITE_API_BASE` is being passed to build
3. Clear browser cache and redeploy
4. Check Vercel deployment logs for env var issues
