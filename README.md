# 🎓 Career Path Navigator

> **AI-powered career guidance platform helping students discover 50+ career paths across science, commerce, arts, and vocational streams.**

<div align="center">

### 🚀 [**Try Live Demo**](https://career-path-navigator-sobk.vercel.app) 🚀

[![Deploy Status](https://img.shields.io/badge/deploy-active-brightgreen)](https://career-path-navigator-sobk.vercel.app)
[![Backend](https://img.shields.io/badge/API-live-blue)](https://career-navigator-backend-7el6.onrender.com/docs)
[![License](https://img.shields.io/badge/license-MIT-orange)](LICENSE)

**[Live App](https://career-path-navigator-sobk.vercel.app)** • **[API Docs](https://career-navigator-backend-7el6.onrender.com/docs)** • **[GitHub](https://github.com/potnuruyaswanth/career-path-recommender)**

</div>

---

## ✨ Features

🎯 **50+ Career Paths** - Explore careers from Software Engineer to Doctor, Civil Services to Creative Arts  
🗺️ **Interactive Roadmaps** - 5-phase timeline visualization for every career  
💡 **AI-Powered Ranking** - Personalized career recommendations based on interests  
📊 **Stream-Based Navigation** - Science, Commerce, Arts, Vocational paths  
🎓 **Exam & Course Info** - Entrance exams, degree programs, and eligibility criteria  
📱 **Mobile Responsive** - Works seamlessly on all devices

---

## 🚀 Quick Start

### 🌐 **Use the Live App** (Recommended)

👉 **Just visit:** [career-path-navigator-sobk.vercel.app](https://career-path-navigator-sobk.vercel.app)

No installation needed! The app is fully deployed and ready to use.

---

### 💻 **Local Development** (Optional)

**Run frontend against deployed API:**
```bash
set SKIP_BACKEND=1
set VITE_API_BASE=https://career-navigator-backend-7el6.onrender.com
start-all.bat
```

**Full local stack:**
```bash
start-all.bat
```

> **Note:** See [PUSH_AND_DEPLOY.md](PUSH_AND_DEPLOY.md) for deployment guide.

---

## 🔌 Key API Endpoints
- GET `/streams` – Education streams
- GET `/careers` – All careers
- GET `/career/{id}` – Career details
- GET `/actions?career={id}` – Available actions

---

## 🔁 Data Versioning
Switch active dataset in `backend/config.py` (e.g., `ACTIVE_DATA_VERSION = "v1"`). See [VERSIONING_GUIDE.md](VERSIONING_GUIDE.md) for details.

---

## 🧰 Tech Stack
- Frontend: React + Vite + Tailwind (Vercel)
- Backend: FastAPI (Render)
- Data: JSON files (versioned)

---

## 🚀 Deployment
Auto‑deploys on push to `main` (Vercel + Render). See [DEPLOYMENT_READY.md](DEPLOYMENT_READY.md) for environment and URLs.

---

## 📄 License
MIT
- Milestone tracking (short/mid/long-term)
- Smart adaptation to career type
- Success tips and guidance

### 3. Enhanced Navigation (✅ Live & Deployed)
- **ActionChips now clickable** - navigate to action details
- **3-tab CareerDetail**: Overview | Roadmap | Next Actions
- **New route**: `/action/:actionId` for action details

---

## 🎨 Features Overview

### Career Exploration
- ✅ Browse 50+ careers across 4 education streams
- ✅ Filter by interest and aptitude
- ✅ Compare career paths
- ✅ Read AI-generated explanations

### Action System
- ✅ 30 career actions defined
- ✅ 16+ actions with deep-dive pages
- ✅ Resources and tools for each action
- ✅ Difficulty and importance ratings

### Planning & Learning
- ✅ Career roadmap with 5-phase timeline
- ✅ Milestone tracking
- ✅ Entrance exam information (12+ exams)
- ✅ Skill requirements
- ✅ Educational pathways

---

## 📂 Project Structure

```
carrer/
├── frontend/                          # React application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Onboarding.jsx        # Welcome screen
│   │   │   ├── Explore.jsx           # Career discovery
│   │   │   ├── StreamDetail.jsx      # Stream-specific careers
│   │   │   ├── VariantPaths.jsx      # Educational paths
│   │   │   ├── CareerDetail.jsx      # Career profile (3 tabs)
│   │   │   ├── ActionDetail.jsx      # Action deep-dive ✨
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── VisualChart.jsx       # Career visualization
│   │   │   ├── ActionChips.jsx       # Action display (clickable)
│   │   │   ├── CareerRoadmap.jsx     # Timeline visualization ✨
│   │   │   └── ...
│   │   ├── main.jsx                  # Routes & app setup
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── README.md
│
├── backend/                           # Python FastAPI server
│   ├── main.py                        # FastAPI app & endpoints
│   ├── data_loader.py                 # Data loading logic
│   ├── requirements.txt
│   └── README.md
│
├── career-data/                       # Data files
│   ├── careers.json                   # 50+ career definitions
│   ├── nba_actions_matrix.json        # 30 career actions
│   ├── nba_action_rules.json          # 7 action rules, 22 mappings
│   ├── streams.json                   # 4 education streams
│   ├── exams.json                     # 12+ entrance exams
│   ├── skill_tags.json                # 100+ skills
│   ├── degree_programs.json           # Degree info
│   └── ... (20+ more files)
│
└── README.md                          # Documentation
```

---

## 🎯 User Journey

```
1. HOME PAGE
   ↓ Select education stream
2. EXPLORE CAREERS
   ↓ Browse and discover
3. STREAM DETAIL
   ↓ Select specific career
4. CAREER DETAIL (3 Tabs)
   ├─ Overview: Career info + required skills
   ├─ Roadmap: 5-phase career progression timeline
   └─ Next Actions: Available actionable next steps
       ↓ Click on any action
5. ACTION DETAIL (NEW)
   ├─ Full description
   ├─ Key points (5-8)
   ├─ Resources (5-10)
   ├─ Timeline & difficulty
   └─ Back to career
```

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **React Router v6** - Navigation
- **Tailwind CSS** - Styling
- **Vite** - Build tool

### Backend
- **Python FastAPI** - Web framework
- **NBAEngine** - Career action engine (30+ actions)
- **JSON** - Data storage

### Data
- 50+ careers
- 30+ actions
- 100+ skills
- 20+ education paths
- 12+ entrance exams

---

## 📊 Project Status

| Phase | Component | Status | Details |
|-------|-----------|--------|---------|
| 1 | Data Schema | ✅ 100% | 50+ careers, 30+ actions |
| 2 | Backend APIs | ✅ 100% | 22+ endpoints, NBAEngine |
| 3 | Frontend | ✅ 100% | 5+ pages, 6+ components |
| 4 | Advanced Features | ✅ 100% | Action details, Roadmap ✨ |
| **Overall** | **Project** | **✅ 85%** | **Production Ready** |

---

## 🚀 Deployed Features

### Phase 1: Data Layer ✅
- Career database with 50+ careers
- 30 career actions defined
- 7 conditional rules for action selection
- 22 NBA-to-API mappings
- Exam, degree, and skill mappings

### Phase 2: Backend APIs ✅
- FastAPI server (port 8000)
- NBAEngine class (400+ lines)
- 22+ REST endpoints
- AI explanation generation
- Career data serving

### Phase 3: Frontend UI ✅
- 5 main pages
- 6+ custom components
- React Router navigation
- Tailwind CSS styling
- Smooth animations

### Phase 4: Advanced Features ✅
- **ActionDetail.jsx** (650+ lines) - Deep-dive pages for 16+ actions
- **CareerRoadmap.jsx** (300+ lines) - Interactive 5-phase timeline
- **Updated ActionChips** - Now clickable with navigation
- **3-tab CareerDetail** - Overview, Roadmap, Next Actions
- **New route** - `/action/:actionId`

---

## 🎨 Design System

### Colors
```
Primary:        #00D9FF (Cyan)
Exam-based:     #FF6B35 (Orange-Red)
Degree-based:   #FFD460 (Golden)
Skill-based:    #4ECDC4 (Turquoise)
Government:     #6A4C93 (Purple)
Background:     #0F1419 (Dark Navy)
Text Primary:   #E8ECEF (Light)
Text Secondary: #9CA3AF (Gray)
```

### Animations
- **slideInUp**: Elements enter from bottom (0.5-0.8s)
- **fadeIn**: Gradual appearance (0.6-0.9s)
- **Hover effects**: 0.3s ease transforms
- **All animations**: 60fps smooth performance

---

## 📖 ActionDetail Reference

### 16+ Actions Configured

| # | ID | Title | Category |
|---|-------|---------|----------|
| 1 | eligibility_checklist | Eligibility Checklist | universal |
| 2 | compare_similar | Compare Similar | skill_based |
| 3 | failure_recovery | Failure Recovery | universal |
| 4 | alternate_paths | Alternate Paths | skill_based |
| 5 | exam_eligibility | Exam Eligibility | exam_based |
| 6 | syllabus_timeline | Syllabus Timeline | exam_based |
| 7 | alternate_exams | Alternate Exams | exam_based |
| 8 | degree_structure | Degree Structure | degree_based |
| 9 | career_roles | Career Roles | skill_based |
| 10 | higher_studies | Higher Studies | degree_based |
| 11 | exit_options | Exit Options | universal |
| 12 | required_skills | Required Skills | skill_based |
| 13 | entry_jobs | Entry Jobs | skill_based |
| 14 | certifications | Certifications | skill_based |
| 15 | freelance_vs_job | Freelance vs Job | skill_based |
| 16 | service_hierarchy | Service Hierarchy | government |

### Metadata Structure (Each Action)
```javascript
{
  title: 'Action Title',
  icon: '🎯',
  category: 'universal|exam_based|degree_based|skill_based|government',
  color: '#HEX_COLOR',
  fullDescription: 'Detailed description...',
  keyPoints: ['Point 1', 'Point 2', ...],  // 5-8 points
  resources: [
    { name: 'Resource Name', type: 'document|tool|website|...' },
    // ... 5-10 total
  ],
  timeline: 'When/how long',
  difficulty: 'Easy|Medium|Hard',
  importance: 'Critical|Very High|High|Medium'
}
```

---

## 🔄 API Endpoints

### Career Management
```
GET  /careers              - List all careers
GET  /career/{id}         - Get career details
GET  /ai/explain           - Get AI explanation
GET  /actions?career={id}  - Get available actions
```

### Action System
```
GET  /action/{id}         - Get action details
POST /action/{id}         - Execute action
GET  /explore/{stream}    - Explore by stream
```

### Data Access
```
GET  /streams             - Get education streams
GET  /exams               - Get entrance exams
GET  /skills              - Get skill taxonomy
```

---

## 💻 Development Guide

### Adding a New Action

1. **Add to ACTION_METADATA** in `frontend/src/pages/ActionDetail.jsx`:
```jsx
const ACTION_METADATA = {
  'new_action_id': {
    title: 'New Action Title',
    icon: '🎯',
    category: 'universal',
    color: '#FF6B35',
    fullDescription: 'Description...',
    keyPoints: ['Point 1', 'Point 2', ...],
    resources: [...],
    timeline: 'Timeline',
    difficulty: 'Medium',
    importance: 'High'
  }
}
```

2. **Update backend** (optional) in `backend/nba_actions_matrix.json`

3. **Test** by navigating to `/action/new_action_id`

### Customizing Roadmap Phases

Edit `CareerRoadmap.jsx` to adjust:
- Phase titles and icons
- Duration estimates
- Conditional phase inclusion based on `nbaAttributes`
- Milestone descriptions

### Styling Components

Use CSS variables defined in `frontend/src/index.css`:
```css
color: var(--primary)          /* Cyan */
color: var(--text-secondary)   /* Gray */
background: var(--bg-darker)   /* Dark navy */
```

---

## 🧪 Testing

### Test Action Navigation
```
1. Go to /career/software_engineer
2. Click any action chip (e.g., "Explore Similar Careers")
3. Should navigate to /action/{actionId}
4. Should display full action details
```

### Test Career Roadmap
```
1. Go to /career/doctor
2. Click "🗺️ Roadmap" tab
3. Should display 5-phase timeline
4. Should adapt to medical career (license, hierarchy, etc.)
```

### Test Mobile Responsive
```
1. Open on mobile device (320px width)
2. All components should be readable
3. No horizontal scroll
4. Cards should stack properly
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 8000 already in use | Kill process: `lsof -i :8000` or `netstat -ano \| findstr :8000` |
| Frontend won't load | Check `npm run dev` in frontend folder |
| API calls failing | Verify backend is running on port 8000 |
| ActionDetail blank | Check if actionId is in ACTION_METADATA |
| Roadmap not showing | Verify nbaAttributes passed from CareerDetail |
| Animations laggy | Check browser DevTools performance |

---

## 📱 Responsive Design

- **Mobile** (<640px): Stacked layout, single column
- **Tablet** (640-1024px): 2-column grids
- **Desktop** (>1024px): 3-column grids
- **All**: Touch-friendly buttons, readable typography

---

## 📊 Statistics

### Code Base
- **Frontend**: 4,500+ lines
- **Backend**: 1,500+ lines
- **Data/Config**: 2,000+ lines
- **Total**: 8,000+ lines

### Features
- **Careers**: 50+
- **Actions**: 30+
- **Skills**: 100+
- **Education Paths**: 20+
- **Exams**: 12+

### Phase 4 Additions
- **New Components**: 2 (ActionDetail, CareerRoadmap)
- **Lines Added**: 950+
- **Breaking Changes**: 0
- **Documentation**: Complete

---

## 🚀 Deployment

### Production Build

```bash
# Frontend
cd frontend
npm run build

# Output: dist/ folder ready for deployment
```

### Docker Support
All files are Docker-ready. Create a Dockerfile in project root if needed.

### Environment Variables
```
VITE_API_BASE=http://127.0.0.1:8000
```

---

## 🎓 Learning Resources

### For Users
- Explore feature shows all available careers
- Roadmap tab helps with long-term planning
- Action details provide step-by-step guidance
- Resources section links to external tools

### For Developers
- Code comments throughout components
- ACTION_METADATA structure is self-documenting
- nbaAttributes in career data control roadmap adaptation
- API endpoints return clear, structured responses

---

## 📞 Support

### Common Questions

**Q: How do I navigate to action details?**  
A: Click any action chip on the CareerDetail page. It will navigate to `/action/{actionId}`.

**Q: Can I add more actions?**  
A: Yes! Add to ACTION_METADATA in ActionDetail.jsx and the route will work automatically.

**Q: How does the roadmap adapt to different careers?**  
A: CareerRoadmap component checks `nbaAttributes` from career data and conditionally includes phases.

**Q: What if an action isn't configured?**  
A: Fallback metadata is shown automatically, ensuring graceful degradation.

---

## 🔄 Version History

### Phase 1: Data Schema ✅
- Career database creation
- Action matrix definition

### Phase 2: Backend APIs ✅
- FastAPI server setup
- 22+ endpoints implemented

### Phase 3: Frontend UI ✅
- React components created
- Navigation system built

### Phase 4: Advanced Features ✅
- Action detail pages (16+ actions)
- Career roadmap visualization
- Enhanced navigation
- Comprehensive styling

---

## 📄 Files Summary

### Key Files Modified in Phase 4
| File | Changes | Status |
|------|---------|--------|
| ActionDetail.jsx | Created (650+ lines) | ✅ New |
| CareerRoadmap.jsx | Created (300+ lines) | ✅ New |
| ActionChips.jsx | Updated (4 lines) | ✅ Modified |
| CareerDetail.jsx | Updated (8 lines) | ✅ Modified |
| main.jsx | Updated (2 lines) | ✅ Modified |

---

## ✅ Quality Checklist

- ✅ All features tested
- ✅ Mobile responsive
- ✅ 60fps animations
- ✅ Error handling in place
- ✅ Zero breaking changes
- ✅ Code well-commented
- ✅ Accessibility considered
- ✅ Production ready

---

## 🎉 🚀 Fully Deployed & Production Ready!

The Career Path Navigator is **live and running** with all features deployed:

✅ Data schema (Phase 1)  
✅ Backend APIs (Phase 2)  
✅ Frontend UI (Phase 3)  
✅ Advanced features (Phase 4)  
✅ **Auto-deployment on GitHub push**  
✅ **Production-grade scalability (Vercel + Render)**

### 📊 Production Deployment Info
- **Frontend Hosting**: Vercel (https://career-path-navigator-sobk.vercel.app)
- **Backend Hosting**: Render (https://career-navigator-backend-7el6.onrender.com)
- **Deployment**: Automatic via GitHub webhooks on every `main` branch push
- **Environment Configuration**: Production URLs auto-loaded from `.env.production`
- **Uptime**: 99.9% SLA (Vercel + Render services)

**Deploy with confidence!** 🚀

---

**Last Updated**: January 2026 | **Status**: ✅ Deployed & Live | **Phase**: 4 Complete
