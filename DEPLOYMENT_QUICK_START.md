# 🚀 DEPLOYMENT QUICK START (Visual Guide)

## Choose Your Adventure

### 🎯 Path 1: GitHub Actions (CI/CD) - RECOMMENDED
> Automatic deployment on every push. Best for teams.

```
┌─────────────────────────────────────────┐
│ Step 1: Create Azure Credentials (2 min)│
│ $ az ad sp create-for-rbac               │
│   --name CareerAppDeployer --sdk-auth    │
│                                          │
│ ✓ Copy the JSON output                  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ Step 2: Add to GitHub (1 min)           │
│ Go to: github.com/kuruvamunirangadu/    │
│        Career-path-Navigator            │
│        → Settings → Secrets              │
│        → New secret                      │
│        Name: AZURE_CREDENTIALS          │
│        Value: (paste JSON from step 1)  │
│                                          │
│ ✓ Secret added                          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ Step 3: Deploy (1 min)                  │
│ $ git push origin main                  │
│                                          │
│ ✓ GitHub Actions starts automatically   │
│ ✓ Docker images build                   │
│ ✓ Pushed to Azure Container Registry    │
│ ✓ Deployed to live servers              │
│                                          │
│ ⏱️  15-20 minutes → Live! 🎉             │
└─────────────────────────────────────────┘
```

**Then what?**
- Every code change → Push to main → Auto-deploys
- View live URLs in GitHub Actions logs
- Share URLs with users

---

### ⚡ Path 2: One-Click Script
> Manual deployment via bash script. Fastest way.

```
┌──────────────────────────────────────────┐
│ Step 1: Ensure Docker & Azure CLI Running
│ • Docker Desktop: Open app              │
│ • Azure CLI: Already installed?          │
└──────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│ Step 2: Run Script                       │
│ $ ./deploy.sh                            │
│                                          │
│ Script will:                             │
│  1. Check prerequisites                  │
│  2. Login to Azure (use device code)    │
│  3. Create resource group                │
│  4. Create container registry            │
│  5. Build Docker images                  │
│  6. Push to Azure                        │
│  7. Deploy containers                    │
│  8. Show live URLs ✓                     │
│                                          │
│ ⏱️  15 minutes → Live! 🎉                │
└──────────────────────────────────────────┘
```

**Live URLs Example:**
```
✓ Backend:  https://career-backend-xxx.azurecontainerapps.io
✓ Frontend: https://career-frontend-xxx.azurecontainerapps.io
```

---

### 🔧 Path 3: Manual Azure Commands
> Step-by-step for learning. See [DEPLOYMENT_GUIDE.md](.azure/DEPLOYMENT_GUIDE.md)

```
Phase 1: Setup
├─ az group create (resource group)
├─ az acr create (container registry)
└─ az acr login (login to registry)

Phase 2: Build & Push
├─ docker build (backend image)
├─ docker build (frontend image)
├─ docker push (backend to registry)
└─ docker push (frontend to registry)

Phase 3: Deploy
├─ az containerapp create (backend)
└─ az containerapp create (frontend)

Result: Live URLs ✓
```

---

## 🎯 Recommended: Path 1 (GitHub Actions)

### Why?
✅ Automatic on every push (zero manual steps)
✅ Team collaboration friendly
✅ Audit trail of deployments  
✅ Rollback capability
✅ Scales with your team

### Setup Time: ~5 minutes
- Create credentials: 2 mins
- Add to GitHub: 1 min
- Wait for first deploy: 20 mins

### After First Deploy: Automatic! 
- Every push = auto-deploy
- No manual steps needed

---

## 📊 Comparison Table

| Aspect | Path 1 (GitHub) | Path 2 (Script) | Path 3 (Manual) |
|--------|-----------------|-----------------|-----------------|
| **Setup Time** | 5 min | 1 min | 30 min |
| **Deploy Time** | 20 min | 15 min | 20 min |
| **Recurring Deploy** | Automatic | Manual | Manual |
| **Team Friendly** | ✅ Yes | ⚠️ Semi | ❌ No |
| **Learning Value** | ⭐⭐ | ⭐ | ⭐⭐⭐ |
| **Recommended** | ✅ YES | ✅ For MVP | For Learning |

---

## 🚨 Important Reminders

### Before You Deploy
- [ ] All code committed to `main` branch
- [ ] `git status` shows clean
- [ ] Local app runs: `http://localhost:5173`
- [ ] Docker Desktop running (for Path 2/3)

### During Deployment
- ⏳ First deploy takes 20-25 minutes
- 📺 Watch the progress in terminal/GitHub Actions
- ⚠️ Don't close the terminal!

### After Deployment
- ✅ Test the URLs:
  ```bash
  curl https://<backend-url>/streams?class=10
  open https://<frontend-url>
  ```
- 📝 Note down live URLs
- 📢 Share with team/stakeholders
- 🔐 Store URLs securely

---

## 🆘 Quick Troubleshooting

### "Docker not found"
```bash
# Download: https://www.docker.com/products/docker-desktop
# Then restart terminal
docker --version  # Should show version
```

### "Azure CLI not found"  
```bash
# Download: https://docs.microsoft.com/cli/azure/install-azure-cli
# Then restart terminal
az --version  # Should show version
```

### "Script permission denied"
```bash
# On Mac/Linux
chmod +x deploy.sh
./deploy.sh

# On Windows PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\deploy.sh
```

### "Build failed"
```bash
# Clear Docker cache
docker system prune -a

# Rebuild
./deploy.sh
# or
az acr build --registry careerappregistry \
  --image career-backend:latest \
  --file backend/Dockerfile .
```

---

## 📱 After Going Live

### Day 1: Celebrate! 🎉
- App is live and working
- Users can access it
- Share the URL widely

### Week 1: Optimize
- Monitor performance (add Application Insights)
- Set up alerts for errors
- Check API response times

### Month 1: Enhance
- Add custom domain
- Set up auto-scaling
- Add analytics tracking
- Create backup strategy

---

## 💡 Pro Tips

1. **Test Before Deploy**
   ```bash
   # Local test
   npm run dev  # Frontend
   
   # In another terminal
   uvicorn backend/main:app --reload
   
   # Check: http://localhost:5173
   ```

2. **Monitor Deployments**
   ```bash
   # Watch live logs
   az containerapp logs show \
     -g career-app-rg \
     -n career-backend \
     --follow
   ```

3. **Get Live URLs Anytime**
   ```bash
   # Backend URL
   az containerapp show -g career-app-rg -n career-backend \
     --query "properties.configuration.ingress.fqdn" -o tsv
   
   # Frontend URL
   az containerapp show -g career-app-rg -n career-frontend \
     --query "properties.configuration.ingress.fqdn" -o tsv
   ```

4. **Rollback to Previous**
   ```bash
   # All images stored in Container Registry
   # Previous versions always available
   az containerapp update \
     -g career-app-rg \
     -n career-backend \
     --image <previous-image-url>
   ```

---

## 🎯 Decision Tree

```
Do you want automatic deployment?
├─ YES → Use Path 1 (GitHub Actions) ← RECOMMENDED
│        Setup now, forget about it
│
└─ NO → Do you like command line?
        ├─ YES → Use Path 3 (Manual commands)
        │        Full control, learn Azure
        │
        └─ NO → Use Path 2 (Script)
               Easy, one command, done!
```

---

## ✨ You're All Set!

**Your app is production-ready. Pick your path above and you'll be live in 20 minutes!**

### Quick Checklist
- [ ] Azure account ready
- [ ] Docker Desktop installed
- [ ] GitHub repo updated
- [ ] Pick deployment path (1, 2, or 3)
- [ ] Follow steps for your path
- [ ] Celebrate going live! 🎉

---

**Questions?** Check [DEPLOYMENT_READY.md](DEPLOYMENT_READY.md) or [.azure/DEPLOYMENT_GUIDE.md](.azure/DEPLOYMENT_GUIDE.md)

**Ready?** Pick a path above and let's go live! 🚀
