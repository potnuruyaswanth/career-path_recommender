# 📊 Architecture & Flow Diagrams

## 1. Component Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CareerDetail Page                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Tabs Navigation                    │  │
│  │  [Overview] [Roadmap] [Next Best Actions] ← SELECTED │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            ActionChips Component                      │  │
│  │  (Fetches: /api/career/{id}/next-actions)           │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Category Groups (Expandable)                 │  │
│  │  • Universal (4) ▼                                    │  │
│  │  • Exam-based (3) ▼                                   │  │
│  │  • Degree-based (4) ▼                                 │  │
│  │  • Skill-based (4) ▼                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ActionChip Components (Buttons)                      │  │
│  │  [✓ Eligibility] [⚖ Compare] [🔄 Failure] [🛤 Paths] │  │
│  └──────────────────────────────────────────────────────┘  │
│           ↓ User clicks button                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │       Image Gallery Modal (Centered Overlay)         │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Eligibility Checklist  [✕]                    │  │  │
│  │  │  ┌──────────────────────────────────┐          │  │  │
│  │  │  │   [Image Display - Guide 2/4]    │          │  │  │
│  │  │  │                                  │          │  │  │
│  │  │  └──────────────────────────────────┘          │  │  │
│  │  │  [← Prev] 2/4 [Next →]                         │  │  │
│  │  │  [📷] [📷] [📷] [📷]  ← Thumbnails             │  │  │
│  │  │  [Learn More →]                                │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│           ↓ User clicks "Learn More"                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           ActionDetail Page                          │  │
│  │      (URL: /action/eligibility_checklist)            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow Diagram

```
┌─────────────────────┐
│    Frontend App     │
│  (React + Router)   │
└──────────┬──────────┘
           │
           ├─→ GET /career/{id}/next-actions
           │   ├─→ Backend API
           │   └─→ Response: { actions, categories }
           │
           ├─→ Render ActionChips Component
           │   ├─→ Parse categories
           │   ├─→ Render ActionChip buttons
           │   └─→ Apply animations
           │
           └─→ User Interaction
               ├─→ Click Category (Expand/Collapse)
               │   └─→ Show ActionChip buttons
               │
               ├─→ Click Action Button
               │   └─→ Show Image Modal
               │
               ├─→ Navigate Images (Prev/Next/Thumbnails)
               │   └─→ Update selectedImageIndex state
               │
               └─→ Click "Learn More"
                   ├─→ Close Modal
                   ├─→ Navigate to /action/{actionId}
                   └─→ Load ActionDetail page
```

---

## 3. Animation Timeline

```
Timeline (in milliseconds)

Page Load:
  0ms     ┌─────────────────────────────────────┐
          │ Category Header appears (fadeIn)     │
  100ms   │                                     │
  200ms   ├─ Action Button 1 (fadeInUp 0s)      │ → Appears immediately
  300ms   ├─ Action Button 2 (fadeInUp 50ms)    │ → Appears after 50ms
  400ms   ├─ Action Button 3 (fadeInUp 100ms)   │ → Appears after 100ms
  500ms   ├─ Action Button 4 (fadeInUp 150ms)   │ → Appears after 150ms
  600ms   │                                     │
          └─────────────────────────────────────┘

Category Click:
  0ms     ┌─────────────────────────────────────┐
          │ Category expands (slideDown 300ms)   │
  300ms   │ Buttons appear with staggered times  │
          └─────────────────────────────────────┘

Modal Open:
  0ms     ┌─────────────────────────────────────┐
          │ Overlay fade-in (fadeIn 300ms)       │
  100ms   │ Modal slides up (slideInUp 300ms)    │
  300ms   │ Content visible and interactive      │
          └─────────────────────────────────────┘

Image Change:
  0ms     ┌─────────────────────────────────────┐
          │ Current image fades out              │
  200ms   │ New image fades in (imageSwap 400ms) │
  400ms   │ Image fully visible                  │
          └─────────────────────────────────────┘

Button Hover:
  0ms     ┌─────────────────────────────────────┐
          │ Background color changes (instant)   │
  100ms   │ Scale increases (scale 1.05)        │
  200ms   │ Shadow expands (instant)             │
          │ (All with transition: 300ms ease)    │
          └─────────────────────────────────────┘
```

---

## 4. State Management (ActionChip Component)

```
ActionChip Component State:

┌────────────────────────────────────────┐
│     Local Component State              │
│                                        │
│  showImageModal: boolean               │
│  ├─ false: Modal hidden               │
│  └─ true: Modal visible               │
│                                        │
│  selectedImageIndex: number (0-3)      │
│  ├─ 0: Guide 1 displayed              │
│  ├─ 1: Guide 2 displayed              │
│  ├─ 2: Guide 3 displayed              │
│  └─ 3: Guide 4 displayed              │
│                                        │
└────────────────────────────────────────┘

User Actions & State Updates:

Click Action Button
    ↓
setShowImageModal(true)
    ↓
Modal appears with fadeIn animation

Click "Prev" Button
    ↓
setSelectedImageIndex((prev) => (prev - 1 + 4) % 4)
    ↓
Image changes with imageSwap animation
Counter updates to show new index

Click "Next" Button
    ↓
setSelectedImageIndex((prev) => (prev + 1) % 4)
    ↓
Image changes with imageSwap animation
Counter updates to show new index

Click Thumbnail
    ↓
setSelectedImageIndex(thumbnailIndex)
    ↓
Image changes with imageSwap animation
Selected thumbnail gets border highlight

Click "Learn More" or "✕"
    ↓
setShowImageModal(false)
    ↓
Modal disappears with fadeOut animation
```

---

## 5. File Dependencies

```
ActionChips.jsx Dependencies:

ActionChips.jsx
├── Imports:
│   ├── React { useEffect, useState }
│   ├── { useNavigate, useParams }
│   ├── API_BASE from apiConfig
│   └── CSS animations from index.css
│
├── Exports:
│   ├── default ActionChips component
│   └── ActionChip sub-component
│
└── Uses:
    ├── fetch() to GET /career/{id}/next-actions
    ├── Animations: fadeInUp, slideDown, fadeIn
    ├── useNavigate() to go to /action/{id}
    └── React Router DOM methods

index.css Dependencies:

index.css
├── Tailwind CSS
│   ├── @tailwind base
│   ├── @tailwind components
│   └── @tailwind utilities
│
└── Custom Keyframes:
    ├── @keyframes fadeIn
    ├── @keyframes fadeInUp
    ├── @keyframes slideDown
    ├── @keyframes slideInUp
    ├── @keyframes imageSwap
    └── @keyframes thumbnailHover
```

---

## 6. API Integration Flow

```
Frontend Action Flow:

CareerDetail Page
    ↓
User clicks "Next Best Actions" tab
    ↓
ActionChips component mounts
    ↓
useEffect() runs
    ↓
Fetch: GET /career/{careerId}/next-actions
    │
    ├─ Success (200):
    │  ├─ Parse response data
    │  ├─ Get action_categories
    │  ├─ Get nba_attributes
    │  └─ Render categories & buttons
    │
    └─ Failure (4xx/5xx):
       ├─ Show error message
       └─ Display "Failed to load actions" alert

User clicks action button
    ↓
Modal opens with image
    ↓
User clicks "Learn More"
    ↓
Navigate to /action/{actionId}
    ↓
ActionDetail page loads
    ├─ Look up ACTION_METADATA[actionId]
    ├─ Find metadata object
    └─ Render action details

Backend Response Example:

GET /career/software_engineer/next-actions

{
  "available": true,
  "career_id": "software_engineer",
  "career_name": "Software Engineer",
  "actions": [
    {
      "id": "eligibility_checklist",
      "title": "Eligibility Checklist",
      "icon": "✓",
      "category": "universal"
    },
    ...
  ],
  "action_categories": {
    "universal": [
      { "id": "eligibility_checklist", ... },
      { "id": "compare_similar", ... }
    ],
    "exam_based": [ ... ],
    "degree_based": [ ... ],
    "skill_based": [ ... ]
  },
  "nba_attributes": {
    "has_exam": true,
    "has_degree": true,
    "is_skill_based": true
  }
}
```

---

## 7. Component Lifecycle

```
ActionChips Component Lifecycle:

1. MOUNT
   ├─ Initialize state: actions=null, loading=true, error=null
   ├─ Render: Loading spinner
   └─ useEffect() fires

2. FETCH DATA
   ├─ setLoading(true)
   ├─ Fetch /career/{id}/next-actions
   └─ Receive data

3. DATA RECEIVED
   ├─ setActions(data)
   ├─ setLoading(false)
   ├─ Re-render with data
   └─ Show categories

4. USER INTERACTION
   ├─ User clicks category header
   │  ├─ setExpandedCategory(category)
   │  ├─ Category collapse/expands
   │  └─ Buttons animate in/out
   │
   ├─ User clicks action button
   │  ├─ Navigate to ActionChip
   │  └─ ActionChip renders modal
   │
   └─ Modal interactions
      ├─ Click prev/next/thumbnail
      ├─ setSelectedImageIndex()
      ├─ Image updates
      └─ Counter updates

5. UNMOUNT
   ├─ Component removed from DOM
   └─ Cleanup automatic (React handles)

ActionChip Component Lifecycle:

1. RENDER
   ├─ Receive props: chip, color, onNavigate, delay
   ├─ Initialize state: showImageModal=false, selectedImageIndex=0
   └─ Render button with animation

2. USER CLICKS BUTTON
   ├─ setShowImageModal(true)
   ├─ Modal appears
   └─ Image gallery visible

3. GALLERY INTERACTION
   ├─ setSelectedImageIndex(newIndex)
   ├─ Image transitions
   └─ Counter updates

4. LEARN MORE CLICKED
   ├─ setShowImageModal(false)
   ├─ onNavigate() callback fires
   └─ Navigate to /action/{actionId}
```

---

## 8. Error Handling Flow

```
Error Scenarios & Handling:

1. API Fails to Load Actions
   ├─ Try/Catch in useEffect
   ├─ Set error state
   ├─ Show error message UI
   └─ User can retry

2. actionId Not Found
   ├─ ActionDetail checks ACTION_METADATA
   ├─ If not found, show generic action
   └─ Still displays page (graceful)

3. Image Load Fails
   ├─ Browser shows broken image icon
   ├─ Could add onerror handler
   └─ Fallback to placeholder

4. Modal Won't Close
   ├─ Click outside modal (onClick handler)
   ├─ Click ✕ button (onClick handler)
   ├─ Click "Learn More" (onClick handler)
   └─ setShowImageModal(false) called

5. Responsive Issues
   ├─ Mobile viewport < 375px
   ├─ Modal max-width: 90%
   ├─ Buttons stack properly
   └─ Scrollable if needed
```

---

## 9. Styling & CSS Architecture

```
CSS Structure (index.css):

1. GLOBAL STYLES
   ├─ CSS Variables (--primary, --bg, etc)
   ├─ Tailwind directives
   └─ Base styles

2. ANIMATIONS
   ├─ Fade animations (fadeIn, fadeInDown, fadeInUp)
   ├─ Slide animations (slideInUp, slideDown, slideInLeft)
   ├─ Special animations (imageSwap, modalSlideIn)
   └─ Utility animations (pulse, float, spin)

3. COMPONENT STYLES
   ├─ .page - Main page container
   ├─ .btn - Button styles
   ├─ .card - Card styles
   ├─ .loading - Loading state
   └─ .explain-card - Info cards

4. RESPONSIVE
   ├─ Desktop: max-width 1200px
   ├─ Tablet: Grid changes to 2 columns
   └─ Mobile: Stack to 1 column, smaller fonts

Animation Properties:

animation: name duration timing-function delay iteration-count direction;

Examples:
- animation: fadeInUp 0.5s ease-out 0s backwards
- animation: slideDown 0.3s ease
- animation: imageSwap 0.4s ease
```

---

## 10. Deployment Flow

```
Code Push to GitHub:

Local Changes
    ↓
git add .
git commit -m "message"
git push origin main
    ↓
GitHub receives push
    ↓
Vercel webhook triggered
    ↓
Vercel CI/CD Pipeline:

1. CLONE REPO
   └─ Clone repository from GitHub

2. INSTALL DEPENDENCIES
   ├─ Run: npm install
   ├─ Installs root dependencies
   └─ (Frontend deps installed during build)

3. BUILD PROJECT
   ├─ Run: npm run build
   ├─ Which runs: cd frontend && npm install && npm run build
   ├─ Vite builds React app
   ├─ Output: frontend/dist/
   └─ Build logs available in Vercel dashboard

4. CONFIGURE DEPLOYMENT
   ├─ Read vercel.json
   ├─ Set output directory: frontend/dist
   ├─ Configure SPA routing
   └─ Set environment variables

5. DEPLOY
   ├─ Upload dist folder to Vercel servers
   ├─ Configure CDN & caching
   └─ Deploy complete

6. LIVE
   ├─ Site accessible at: career-path-navigator-sobk.vercel.app
   ├─ HTTPS enabled
   ├─ All routes served from index.html (SPA routing)
   └─ API calls proxy to backend

Status:
✅ Deployment successful
✅ Site live at https://...
✅ View logs in dashboard
```

---

**Created:** January 26, 2026
**Updated:** Complete architecture documentation
