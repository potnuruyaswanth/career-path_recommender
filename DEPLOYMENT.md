# 🚀 Deployment Guide

## 🌐 Live Production URLs (Primary)

**Use these URLs for production access:**

- **Frontend:** https://career-path-navigator-sobk.vercel.app
- **Backend API:** https://career-navigator-backend-7el6.onrender.com
- **API Docs:** https://career-navigator-backend-7el6.onrender.com/docs

**Status:** ✅ Live and auto-deploying on every `git push origin main`

## Deployment Architecture
**Split Deployment:**
- **Vercel** (Frontend) - Static React app with auto-deployment
- **Render** (Backend) - Python FastAPI service with auto-deployment

## Auto-Deployment

Both services automatically deploy on every push to `main` branch:
- **Vercel:** Listens to GitHub webhooks, builds and deploys frontend
- **Render:** Listens to GitHub webhooks, builds and deploys backend

## Configuration Files

### Frontend - `vercel.json`
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "env": {
    "VITE_API_BASE": "https://career-navigator-backend-7el6.onrender.com"
  }
}
```

### Backend - `render.yaml`
```yaml
services:
  - type: web
    name: career-navigator-backend
    env: python
    buildCommand: "cd backend && pip install -r requirements.txt"
    startCommand: "cd backend && python main.py"
```

## Local Development

### Backend (Port 8000)
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Frontend (Vercel)
- `VITE_API_BASE`: Backend API URL (set in vercel.json)

### Backend (Render)
No additional environment variables required for basic deployment.

## Troubleshooting

### Frontend shows "Failed to fetch"
- Verify `VITE_API_BASE` is set correctly in vercel.json
- Check CORS configuration in backend/main.py
- Confirm backend is running at the specified URL

### CORS Errors
- Ensure frontend URL is added to `origins` list in backend/main.py
- Both http and https versions may need to be included

### Run frontend locally against deployed API
```
set SKIP_BACKEND=1
set VITE_API_BASE=https://career-navigator-backend-7el6.onrender.com
start-all.bat
```
This skips the local backend and points Vite to the deployed Render API.

## Quick Deploy

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Wait for auto-deployment:**
   - Vercel: ~2-3 minutes
   - Render: ~5-8 minutes (free tier)

3. **Verify:**
   - Frontend: https://career-path-navigator-sobk.vercel.app
   - Backend API: https://career-navigator-backend-7el6.onrender.com/docs

## Dashboard Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Render Dashboard:** https://dashboard.render.com
