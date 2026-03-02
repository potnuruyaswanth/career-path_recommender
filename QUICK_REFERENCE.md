# 🚀 Quick Reference - Commands & Links

## 📦 Installation

```bash
# Install all dependencies
npm install
cd frontend && npm install
cd ../backend && pip install -r requirements.txt

# Or use provided script
cd frontend && npm install && cd ..
```

---

## 🎮 Running the App

### Development Mode (All Servers)
```bash
# Windows
start-all.bat

# Linux/Mac
bash start-all.bat  # Or run commands manually
```

### Individual Servers

**Backend Only:**
```bash
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Frontend Only:**
```bash
cd frontend
npm run dev
```

---

## 🏗️ Building

```bash
# Build frontend for production
npm run build

# Or from frontend directory
cd frontend && npm run build

# Preview production build
cd frontend && npm run preview
```

---

## 🌐 URLs

### Local Development
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### Production (Deployed)
- **Frontend:** https://career-path-navigator-sobk.vercel.app
- **Backend API:** https://career-navigator-backend-7el6.onrender.com

---

## 📝 Testing

```bash
# Run tests
npm run test

# Run in frontend directory
cd frontend && npm test
```

---

## 🔍 Debugging

### Browser DevTools
```
F12 or Ctrl+Shift+I
- Console tab: Check for errors
- Network tab: Check API calls
- Elements tab: Inspect components
```

### VS Code Debugging
```
Install "Console Ninja" or "Debugger for Chrome"
Set breakpoints and debug from VS Code
```

### Backend Debugging
```
FastAPI docs: http://localhost:8000/docs
ReDoc: http://localhost:8000/redoc
```

---

## 📂 Important Files

```
carrer/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ActionChips.jsx  ← ACTION BUTTONS & GALLERY
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── ActionDetail.jsx
│   │   │   ├── CareerDetail.jsx
│   │   │   └── ...
│   │   ├── index.css  ← ANIMATIONS
│   │   └── main.jsx  ← ROUTING
│   ├── vercel.json  ← DEPLOYMENT CONFIG
│   └── vite.config.js
├── backend/
│   ├── main.py
│   └── requirements.txt
├── vercel.json  ← ROOT DEPLOYMENT CONFIG
└── package.json  ← ROOT SCRIPTS
```

---

## 🎨 Component Testing

### Test Action Gallery Modal
1. Navigate to career page
2. Click "Next Best Actions" tab
3. Expand a category
4. Click an action button
5. Modal should appear with:
   - 4 images
   - Previous/Next buttons
   - Image counter
   - Close button
   - Learn More button

### Test Animations
- Button fade-in (on page load)
- Category slide-down (on expand)
- Modal slide-up (on open)
- Image swap (on change)
- Hover scale effects

### Test Responsive
```
Resize browser to:
- Desktop: 1920px
- Tablet: 768px
- Mobile: 375px
```

---

## 🚀 Deployment

### Push to GitHub
```bash
git add .
git commit -m "Your message"
git push origin main
```

### Vercel Auto-Deploy
- Push triggers automatic build
- Runs `npm run build` from root
- Deploys frontend from `frontend/dist`
- Uses `frontend/vercel.json` for SPA routing

### Manual Redeploy on Vercel
1. Go to https://vercel.com/dashboard
2. Select "career-path-navigator" project
3. Click "Deployments" tab
4. Click "..." menu
5. Click "Redeploy" (with cache clear option)

---

## 🔧 Configuration Files

### vercel.json (Root)
- Build command
- Output directory
- Environment variables

### frontend/vercel.json
- React Router rewrites (SPA routing)
- Environment variables

### frontend/vite.config.js
- Build optimization
- Dev server config
- Code splitting

### package.json (Root)
- Build scripts
- Project metadata

---

## 🐛 Troubleshooting Commands

```bash
# Clear npm cache
npm cache clean --force

# Clear Vercel cache
vercel env pull  # If CLI installed

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version

# Check Python version
python --version

# Check pip packages
pip list | grep -i fastapi

# Kill ports if stuck
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8000
kill -9 <PID>
```

---

## 📊 Performance Check

```bash
# Analyze bundle size
npm run build -- --analyze

# Check for unused dependencies
npm audit

# Performance testing
# Use Chrome DevTools Lighthouse
# Or go to https://web.dev/measure/
```

---

## 🎯 Common Tasks

### Add New Action
1. Edit `frontend/src/pages/ActionDetail.jsx`
2. Add entry to `ACTION_METADATA` object
3. Include: title, icon, category, color, description, etc.

### Update Images
1. Modify `chipImages` array in `ActionChips.jsx`
2. Replace SVG data URLs with real image URLs
3. Or fetch from API endpoint

### Modify Animations
1. Edit `frontend/src/index.css`
2. Update `@keyframes` definitions
3. Or adjust animation properties in components

### Change Colors
1. Search for `CATEGORY_COLORS` in `ActionChips.jsx`
2. Update hex colors for each category
3. Colors: Cyan, Orange, Teal, Purple, Red, Yellow, etc.

---

## 📚 Documentation Files

```
carrer/
├── README.md  ← Main documentation
├── FINAL_FIX_SUMMARY.md  ← Complete fix overview
├── ACTIONS_AND_DEPLOYMENT_FIX.md  ← Detailed fixes
├── TESTING_CHECKLIST.md  ← Test cases
└── QUICK_REFERENCE.md  ← This file
```

---

## 🔐 Environment Variables

### Vercel Settings
```
VITE_API_BASE = https://career-navigator-backend-7el6.onrender.com
```

### Local Development
Auto-detected from hostname:
- `localhost` → http://localhost:8000
- `127.0.0.1` → http://localhost:8000
- Other → Render backend URL

---

## 💡 Pro Tips

1. **Use Vercel Preview URLs** for testing before merging
2. **Check build logs** in Vercel dashboard if deployment fails
3. **Monitor backend health** at https://career-navigator-backend-7el6.onrender.com/docs
4. **Use React DevTools** to inspect component state
5. **Check Network tab** to debug API calls
6. **Test on mobile** using Chrome Device Emulation (F12 → ⌘+Shift+M)

---

## 📞 Quick Links

- **GitHub Repo:** https://github.com/kuruvamunirangadu/Career-path-Navigator
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Render Dashboard:** https://dashboard.render.com
- **API Documentation:** http://localhost:8000/docs
- **Vite Docs:** https://vitejs.dev
- **React Docs:** https://react.dev

---

## ✅ Pre-Deployment Checklist

- [ ] All tests pass locally
- [ ] No console errors
- [ ] Animations work smoothly
- [ ] Modal gallery displays 4 images
- [ ] Responsive design tested
- [ ] API calls working
- [ ] Build completes without errors
- [ ] Vercel deployment configured
- [ ] Environment variables set
- [ ] Git changes committed

---

**Last Updated:** January 26, 2026
**Version:** 1.0.0
