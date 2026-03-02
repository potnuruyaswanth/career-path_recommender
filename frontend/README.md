# Career Path Frontend

Modern React + Vite frontend with 25 careers, versioned data support, and engaging UI.

## Status
✅ Production Ready | Version 2.0.0 | January 18, 2026

## Overview

The frontend provides:
- **25 Career Paths**: Science, Commerce, Arts, Vocational
- **Interactive Exploration**: Streams, variants, courses, exams
- **Versioned Data**: Automatically uses backend's active version (v1/v2)
- **Fast Performance**: Vite build + React 18
- **Modern UI**: Tailwind CSS + smooth animations

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18+ | UI components & state management |
| Vite | 5+ | Build tool & dev server |
| Tailwind CSS | 3+ | Utility-first styling |
| React Router | 6+ | Client-side routing |
| Custom CSS | Latest | Keyframe animations & effects |

## Quick Start

### Installation
```bash
cd frontend/
npm install
```

### Development Server
```bash
npm run dev
```

- Opens at http://localhost:5173 (or next available port)
- Default backend: http://127.0.0.1:8000
- Hot reload enabled via Vite HMR

### Production Build
```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── App.jsx              # Main router & app layout
│   ├── main.jsx             # React entry point
│   ├── index.css            # Global styles & animations
│   ├── components/
│   │   └── VisualChart.jsx  # Career graph visualization
│   └── pages/
│       ├── Onboarding.jsx   # Career recommendation flow
│       ├── Explore.jsx      # Stream exploration grid
│       ├── StreamDetail.jsx # Variant details & courses
│       └── VariantPaths.jsx # Path recommendations
├── public/
│   └── index.html           # HTML template
├── package.json             # Dependencies & scripts
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # CSS processing
├── vite.config.js           # Vite configuration
└── README.md                # This file
```

## Pages & Features

### 1. Onboarding Page (`/`)
**Purpose**: Multi-step career recommendation engine

**Features**:
- Step-based flow with progress indicators
- Interest selection with icons and hover animations
- Filter tabs (Best/Good/Others) for result organization
- Real-time ranking based on AI backend
- 2-column responsive grid for results
- Smooth animations: slideInUp, fadeInDown, pulse effects

**Flow**:
1. **Step 1 - Class Selection**: Choose education level (Class 10, 12)
2. **Step 2 - Board Selection**: Select educational board
3. **Step 3 - Interest Selection**: Multi-select from 12+ interest categories
4. **Step 4 - Results**: View ranked career recommendations with explanations

**Animations**:
- Step transitions: slideInUp (0.6s ease-out)
- Result cards: staggered fadeInUp (0.4s each)
- Filter buttons: scale & color transitions
- Interest toggles: smooth checkbox animations

**Key Components**:
```jsx
const INTERESTS = [
  { id: "Technology", label: "Technology", icon: "⚙️" },
  { id: "Science", label: "Science", icon: "🧪" },
  // ... 10+ more interests
];
```

### 2. Explore Page (`/explore`)
**Purpose**: Interactive stream exploration and discovery

**Features**:
- Stream cards with gradient backgrounds
- Dual-view toggle: Chart or Card layout
- Animated stream navigation
- Hover effects with scale and shadow transforms
- Staggered card animations on load
- Responsive grid layout (1-4 columns)

**Animations**:
- Card entry: fadeInUp with stagger (0.1s delay per card)
- Card hover: scale (1.05), shadow enhancement
- Navigation transitions: smooth color changes
- View toggle: instant layout switch

**Key Data**:
Retrieves streams via `/streams?class=10` endpoint and displays:
- Stream name, description, variant count
- Direct links to variant exploration
- Visual stream categorization

### 3. Stream Detail Page (`/explore/:streamId`)
**Purpose**: Detailed stream information with variant paths

**Features**:
- Stream overview with animated heading
- Subject requirements with pulse animations
- Variant cards showing course paths
- Interactive career exploration
- Animated navigation between variants
- Hover effects on subject tags

**Animations**:
- Page entry: slideInUp (0.6s)
- Subject tags: pulse on hover (1s infinite)
- Variant cards: scale and glow effects
- Tag hover: color transitions

**Key Data**:
- Stream description and purpose
- Subject combinations (e.g., Physics, Chemistry, Mathematics)
- Available variants with course mappings
- Career paths for each variant

### 4. Variant Paths Page (`/explore/:streamId/:variantId`)
**Purpose**: Show course-to-career paths for specific variant

**Features**:
- Stream navigation tabs with gradient active state
- Course cards with animated layouts
- Career options per course
- Staggered animation for path cards
- Glow effects on active selections
- Career detail modal with full roadmap

**Animations**:
- Path cards: staggered fadeInUp (0.05s delay)
- Active tab: gradient color transition
- Card hover: glow effect (box-shadow pulse)
- Modal entry: scale & fade animation

**Key Data**:
Retrieves paths via `/paths?variant=variant:mpc` endpoint:
- All courses available for variant
- Career options per course
- Career roadmap (4 phases)
- Skill requirements and timeline

## Animation System

### CSS Keyframes (index.css)
```css
@keyframes fadeIn          /* Opacity 0→1 */
@keyframes fadeInDown      /* Slide down + fade in */
@keyframes fadeInUp        /* Slide up + fade in */
@keyframes slideInUp       /* Vertical slide up */
@keyframes pulse           /* Scale 1→1.05→1 */
@keyframes shake           /* Horizontal oscillation */
@keyframes spin            /* Full rotation */
@keyframes stagger         /* Cascading delay */
```

### Animation Classes
```css
.animate-fadeIn       { animation: fadeIn 0.6s ease-out; }
.animate-fadeInDown   { animation: fadeInDown 0.6s ease-out; }
.animate-fadeInUp     { animation: fadeInUp 0.4s ease-out; }
.animate-slideInUp    { animation: slideInUp 0.6s ease-out; }
.animate-pulse        { animation: pulse 2s infinite; }
.animate-spin         { animation: spin 1s linear infinite; }
```

### Stagger Pattern
```jsx
// Cards appear in sequence with 100ms delay between each
{results.map((item, i) => (
  <div 
    key={i}
    style={{ animation: `fadeInUp 0.4s ease-out ${i * 0.1}s both` }}
  >
    {/* Content */}
  </div>
))}
```

### Hover Effects
```css
/* Cards */
.hover:scale-105      /* Enlarge 5% on hover */
.hover:shadow-2xl     /* Enhanced shadow */
.transition-all       /* Smooth 300ms transition */

/* Tags & Buttons */
.hover:text-accent    /* Color change on hover */
.hover:animate-pulse  /* Start animation on hover */
```

## Component Details

### App.jsx
**Router Configuration**:
- `/` → Onboarding component
- `/home` → Legacy landing page
- `/explore` → Explore component
- `/explore/:streamId` → StreamDetail component
- `/explore/:streamId/:variantId` → VariantPaths component

**Layout**:
- Top navigation with logo
- Dynamic page rendering based on route
- Responsive mobile/tablet/desktop layouts

### VisualChart.jsx
**Purpose**: Interactive graph visualization of career paths

**Features**:
- Node-link diagram of streams, variants, courses, careers
- Pan and zoom controls
- Hover-highlight connected nodes
- Color-coded node types
- Force-directed layout (if using D3/Cytoscape)

**Data Source**: `/graph` endpoint

### Pages/Onboarding.jsx
**State Management**:
```jsx
const [step, setStep] = useState(1);
const [selectedClass, setSelectedClass] = useState(null);
const [selectedBoard, setSelectedBoard] = useState(null);
const [interests, setInterests] = useState([]);
const [results, setResults] = useState([]);
const [filterScore, setFilterScore] = useState("all"); // "best", "good", "all"
```

**Key Functions**:
- `goToStep(n)`: Navigate between steps with animation
- `handleInterestToggle(id)`: Multi-select interests
- `fetchResults()`: Call `/ai/rank` endpoint with selected options
- `filterResults()`: Filter by score range based on tab selection

### Pages/Explore.jsx
**State Management**:
```jsx
const [streams, setStreams] = useState([]);
const [viewMode, setViewMode] = useState("card"); // "card" or "chart"
const [loading, setLoading] = useState(false);
```

**Features**:
- Fetches streams on component mount
- Toggles between card and chart views
- Click on stream navigates to StreamDetail

### Pages/StreamDetail.jsx
**State Management**:
```jsx
const [stream, setStream] = useState(null);
const [variants, setVariants] = useState([]);
const [selectedVariant, setSelectedVariant] = useState(null);
```

**Data Flow**:
1. Fetch stream details from backend
2. Fetch available variants
3. Display subject requirements
4. Show variant cards with links

### Pages/VariantPaths.jsx
**State Management**:
```jsx
const [paths, setPaths] = useState([]);
const [selectedCareer, setSelectedCareer] = useState(null);
const [careerDetails, setCareerDetails] = useState(null);
```

**Features**:
- Fetch paths via `/paths?variant=variant:mpc` endpoint
- Display course-to-career mappings
- Show career details in modal
- 4-phase roadmap visualization

## Configuration

### Environment Variables
Create a `.env.local` file in the `frontend/` directory:

```bash
# Backend API Configuration
VITE_API_BASE=http://127.0.0.1:8000

# Optional: Feature flags
VITE_ENABLE_CHARTS=true
VITE_ENABLE_ANIMATIONS=true
```

### Tailwind Configuration (tailwind.config.js)
```js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",    // Indigo
        secondary: "#ec4899",  // Pink
        accent: "#06b6d4",     // Cyan
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
```

### PostCSS Configuration (postcss.config.js)
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

## Styling Approach

### Tailwind Utilities
```jsx
<div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
  {/* Uses Tailwind spacing, colors, borders */}
</div>
```

### Custom CSS Classes (index.css)
```css
.gradient-heading {
  background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
  -webkit-background-clip: text;
  color: transparent;
}

.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.glow-effect {
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
}
```

### Responsive Design
```jsx
{/* 1 column on mobile, 2 on tablet, 3+ on desktop */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Items */}
</div>
```

## API Integration

### Base URL
All requests target: `${import.meta.env.VITE_API_BASE}`

### Fetch Patterns
```jsx
// Streams
const res = await fetch(`${API_BASE}/streams?class=10`);

// Variants
const res = await fetch(`${API_BASE}/variants?stream=science`);

// Paths
const res = await fetch(`${API_BASE}/paths?variant=variant:mpc`);

// Career explanation
const res = await fetch(`${API_BASE}/ai/explain?career=software_engineer`);

// Ranking (POST)
const res = await fetch(`${API_BASE}/ai/rank`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    user_profile: { ... },
    valid_paths: [ ... ]
  })
});
```

## Performance Optimization

### Build Optimization
```bash
# Check bundle size
npm run build  # Vite optimizes automatically

# Analyze with source maps
npm run build -- --sourcemap
```

### Runtime Performance
- **Code Splitting**: Automatic per-route via Vite
- **Lazy Loading**: React.lazy() for heavy components
- **Memoization**: useMemo() for expensive computations
- **Debouncing**: Search and filter inputs debounced

### Best Practices
- Keep components under 300 lines
- Use keys in lists for React reconciliation
- Avoid inline functions in render
- Lazy-load large data via API calls

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5173 busy | Vite auto-picks next port, check terminal |
| API 404 errors | Verify backend runs on http://127.0.0.1:8000 |
| CORS errors | Check backend CORS config allows localhost:5173 |
| Animations not visible | Verify index.css @keyframes are loaded |
| Images/assets 404 | Ensure assets in public/ folder |
| Tailwind not applying | Run `npm install` and `npm run dev` |
| Module not found | Clear node_modules: `rm -rf node_modules && npm install` |

## Development Workflow

### Adding a New Page
1. Create component in `src/pages/`
2. Add route in `App.jsx`
3. Import in App.jsx
4. Test navigation

### Adding Animations
1. Define @keyframes in `src/index.css`
2. Create animation class: `.animate-newName { animation: newName 0.6s; }`
3. Apply to elements: `style={{ animation: "newName 0.6s ease-out" }}`
4. Test in browser

### Styling New Components
1. Use Tailwind utilities first (spacing, colors, etc.)
2. Add custom CSS in index.css if needed
3. Use CSS variables for consistent theming
4. Test on mobile (375px), tablet (768px), desktop (1280px)

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint code (if eslint configured) |

## Dependencies

See `package.json` for full dependency list. Key packages:
- **react**: UI library
- **react-dom**: React rendering
- **react-router-dom**: Client-side routing
- **vite**: Build tool & dev server

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 12+, Chrome Android latest

## Deployment

### Static Hosting (Netlify, Vercel)
```bash
npm run build
# Deploy dist/ folder
```

### Environment
```bash
# Production .env.local
VITE_API_BASE=https://api.careerpaths.com
```

## Development Roadmap

- [ ] Add dark mode toggle
- [ ] Implement user profile persistence
- [ ] Add bookmark/save feature
- [ ] Integrate career salary data visualization
- [ ] Add PDF export for career roadmaps
- [ ] Implement advanced filtering & search
- [ ] Add mobile-optimized bottom sheet navigation
- [ ] Integrate user feedback ratings

## Contributing

To contribute improvements:
1. Create a feature branch
2. Make changes to components or styling
3. Test animations across browsers
4. Verify API integration works
5. Submit PR with before/after screenshots

## License

This project is part of Career Navigator application.

## Support

For frontend issues:
- Check Vite docs: https://vitejs.dev
- Review Tailwind docs: https://tailwindcss.com
- Inspect browser console for errors
- Test API endpoints in Swagger UI: http://127.0.0.1:8000/docs
