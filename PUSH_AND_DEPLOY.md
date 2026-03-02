# 📤 Push Changes & Deploy Live

## Quick Steps

### 1. Check Status
```bash
git status
```

### 2. Add Changes
```bash
git add .
```

### 3. Commit
```bash
git commit -m "Your change description"
```

Example:
```bash
git commit -m "Fix API integration and update deployment docs"
```

### 4. Push to GitHub
```bash
git push origin main
```

---

## Auto-Deployment (Automatic)

After you `git push`, both services auto-deploy within 2-5 minutes:

| Service | Platform | Deploy Time | Status URL |
|---------|----------|-------------|------------|
| Frontend | Vercel | 1-2 min | https://career-path-navigator-sobk.vercel.app |
| Backend | Render | 2-3 min | https://career-navigator-backend-7el6.onrender.com/docs |

---

## Verify Deployment

### Frontend Live
Open: https://career-path-navigator-sobk.vercel.app

### Backend Live
Open: https://career-navigator-backend-7el6.onrender.com/docs

---

## Complete Workflow Example

```bash
# 1. Make your changes in code

# 2. Test locally at http://localhost:5174

# 3. Check what changed
git status

# 4. Stage all changes
git add .

# 5. Commit with message
git commit -m "Fix career data loading on mobile"

# 6. Push to GitHub (triggers auto-deploy)
git push origin main

# 7. Wait 2-5 minutes for deployment

# 8. Verify live
# Frontend: https://career-path-navigator-sobk.vercel.app
# Backend: https://career-navigator-backend-7el6.onrender.com
```

---

## Troubleshooting

**Changes not showing after push?**
- Wait 3-5 minutes for Vercel/Render to rebuild
- Hard refresh browser (Ctrl+Shift+R)
- Check Vercel/Render dashboard for build errors

**Backend errors?**
- Check Render logs: https://dashboard.render.com
- Verify `backend/requirements.txt` has all dependencies

**Frontend errors?**
- Check Vercel logs: https://vercel.com/dashboard
- Verify `.env.local` has correct `VITE_API_BASE`

---

## Manual Redeploy (If Needed)

**Vercel:** Push to `main` or use Vercel dashboard → Redeploy  
**Render:** Push to `main` or use Render dashboard → Manual Deploy
