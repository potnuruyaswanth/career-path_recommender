

## 1️⃣ How to Use in Different Components

### Example 1: Load Saved Interests on Mount
```jsx
import { useEffect, useState } from 'react'
import { getUserProgress } from '../utils/userProgress'

export function MyComponent() {
  const [interests, setInterests] = useState([])

  useEffect(() => {
    // Load saved interests on component mount
    const saved = getUserProgress()
    if (saved.interests.length > 0) {
      setInterests(saved.interests)
      console.log('Loaded interests:', saved.interests)
    }
  }, [])

  return (
    <div>
      {interests.map(interest => (
        <div key={interest}>{interest}</div>
      ))}
    </div>
  )
}
```

### Example 2: Auto-Save on Selection Change
```jsx
import { saveInterests } from '../utils/userProgress'

function InterestToggle({ interest }) {
  const [selected, setSelected] = useState(false)

  const handleToggle = () => {
    setSelected(!selected)
    // Auto-save after toggle
    saveInterests([interest])
  }

  return (
    <button onClick={handleToggle}>
      {selected ? '✓' : '○'} {interest}
    </button>
  )
}
```

### Example 3: Track Career View
```jsx
import { useEffect } from 'react'
import { addViewedCareer, isCareerViewed } from '../utils/userProgress'

export function CareerCard({ careerId, careerName }) {
  const [isViewed, setIsViewed] = useState(false)

  useEffect(() => {
    // Track that user viewed this career
    addViewedCareer(careerId)
    
    // Check if previously viewed
    setIsViewed(isCareerViewed(careerId))
  }, [careerId])

  return (
    <div>
      <h2>{careerName} {isViewed && '✓ Viewed'}</h2>
    </div>
  )
}
```

### Example 4: Show Resume Message
```jsx
import { useEffect, useState } from 'react'
import { getResumeMessage } from '../utils/userProgress'

export function ExplorePage() {
  const [resumeMsg, setResumeMsg] = useState(null)

  useEffect(() => {
    const msg = getResumeMessage()
    if (msg) {
      setResumeMsg(msg)
      // Auto-hide after 5 seconds
      setTimeout(() => setResumeMsg(null), 5000)
    }
  }, [])

  return (
    <div>
      {resumeMsg && (
        <div style={{ padding: '12px', background: 'cyan' }}>
          {resumeMsg}
          <button onClick={() => setResumeMsg(null)}>✕</button>
        </div>
      )}
    </div>
  )
}
```

### Example 5: Display Stats
```jsx
import { useEffect, useState } from 'react'
import { getUserStats } from '../utils/userProgress'

export function StatsDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const userStats = getUserStats()
    setStats(userStats)
  }, [])

  if (!stats) return null

  return (
    <div>
      <h3>📊 Your Progress</h3>
      <p>Interests: {stats.totalInterests}</p>
      <p>Careers Viewed: {stats.careersViewed}</p>
      <p>Last Active: {stats.lastActive}</p>
    </div>
  )
}
```

### Example 6: Reset with Confirmation
```jsx
import { resetAllProgress } from '../utils/userProgress'

export function ResetButton() {
  const handleReset = () => {
    // resetAllProgress includes confirmation dialog
    if (resetAllProgress()) {
      console.log('Progress reset!')
      // Optional: Reload page
      window.location.reload()
    }
  }

  return (
    <button onClick={handleReset}>
      🔄 Reset All Progress
    </button>
  )
}
```

---

## 2️⃣ Complete Function Reference

### getUserProgress()
```jsx
// Get all saved data
const progress = getUserProgress()

console.log(progress)
// {
//   interests: ['Technology', 'Biology'],
//   viewedCareers: ['software_engineer', 'doctor'],
//   lastStream: 'science',
//   board: 'CBSE',
//   lastUpdated: '2026-01-16T10:30:00Z'
// }
```

### saveUserProgress(data)
```jsx
// Merge any data into saved progress
saveUserProgress({
  interests: ['Tech', 'Science'],
  lastStream: 'commerce'
})

// Auto-adds lastUpdated timestamp
// Merges with existing data
```

### saveInterests(list)
```jsx
// Save interest list
saveInterests(['Technology', 'Biology'])
saveInterests(['Business']) // Replaces previous

// Auto-saves timestamp
```

### saveBoard(board)
```jsx
// Save board selection
saveBoard('CBSE')
saveBoard('ICSE')
saveBoard('STATE')

// Persists for next visit
```

### addViewedCareer(careerId)
```jsx
// Track career view
addViewedCareer('software_engineer')
addViewedCareer('doctor')
addViewedCareer('ca')

// Automatically:
// - Normalizes ID (removes 'career:' prefix)
// - Prevents duplicates
// - Updates timestamp
```

### saveLastStream(streamId)
```jsx
// Save which stream user is exploring
saveLastStream('science')
saveLastStream('commerce')
saveLastStream('arts')

// Normalizes ID (removes 'stream:' prefix)
```

### getResumeMessage()
```jsx
// Get personalized welcome message
const msg = getResumeMessage()

// Returns:
// "👋 Welcome back! Continue exploring science careers?"
// OR
// "👋 Welcome back! Let's continue with your interests..."
// OR
// null (if no saved progress)
```

### getRecentlyViewed(limit)
```jsx
// Get recently viewed careers
const recent = getRecentlyViewed(5)

// Returns last 5 viewed:
// ['software_engineer', 'doctor', 'ca', 'teacher', 'lawyer']

// Optional limit parameter
const last3 = getRecentlyViewed(3)
// ['teacher', 'lawyer', 'engineer']
```

### isCareerViewed(careerId)
```jsx
// Check if career was viewed before
if (isCareerViewed('software_engineer')) {
  console.log('User has viewed this before')
}

// Returns true/false
```

### getUserStats()
```jsx
// Get aggregated user stats
const stats = getUserStats()

console.log(stats)
// {
//   totalInterests: 3,
//   careersViewed: 8,
//   lastActive: '2026-01-16T10:30:00Z',
//   hasExploredStream: true,
//   completedOnboarding: true
// }
```

### resetAllProgress()
```jsx
// Clear all saved data (with confirmation)
const success = resetAllProgress()

if (success) {
  console.log('Data cleared!')
  window.location.reload() // Optional
}

// Shows dialog: "Are you sure?"
// User must confirm
// Returns true if confirmed, false if cancelled
```

### exportProgress()
```jsx
// Get progress as JSON string (for debugging)
const json = exportProgress()

console.log(json)
// Formatted JSON string for export
// Useful for debugging or backup
```

---

## 3️⃣ Real Component Examples

### Complete Onboarding Integration
```jsx
import React, { useEffect, useState } from 'react'
import { 
  getUserProgress, 
  saveInterests, 
  saveBoard 
} from '../utils/userProgress'

export function Onboarding() {
  const [step, setStep] = useState(1)
  const [board, setBoard] = useState('CBSE')
  const [interests, setInterests] = useState([])

  // Load saved data on mount
  useEffect(() => {
    const saved = getUserProgress()
    if (saved.board) setBoard(saved.board)
    if (saved.interests.length > 0) setInterests(saved.interests)
  }, [])

  const handleBoardChange = (newBoard) => {
    setBoard(newBoard)
    saveBoard(newBoard) // Auto-save
  }

  const handleInterestToggle = (interest) => {
    let updated
    if (interests.includes(interest)) {
      updated = interests.filter(i => i !== interest)
    } else {
      updated = [...interests, interest]
    }
    setInterests(updated)
    saveInterests(updated) // Auto-save
  }

  const handleSubmit = () => {
    saveBoard(board)
    saveInterests(interests)
    // Proceed to next step
    setStep(2)
  }

  return (
    <div>
      <h2>Step {step}: Onboarding</h2>
      
      {step === 1 && (
        <div>
          <h3>Select Board</h3>
          {['CBSE', 'ICSE', 'STATE'].map(b => (
            <button
              key={b}
              onClick={() => handleBoardChange(b)}
              style={{
                background: board === b ? 'blue' : 'gray',
                color: 'white',
                margin: '4px'
              }}>
              {b}
            </button>
          ))}
          <button onClick={() => setStep(2)}>Next</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3>Select Interests</h3>
          {['Technology', 'Biology', 'Business'].map(int => (
            <label key={int}>
              <input
                type="checkbox"
                checked={interests.includes(int)}
                onChange={() => handleInterestToggle(int)}
              />
              {int}
            </label>
          ))}
          <button onClick={handleSubmit}>Submit</button>
        </div>
      )}
    </div>
  )
}
```

### Complete Explore Integration
```jsx
import React, { useEffect, useState } from 'react'
import { 
  saveLastStream, 
  getResumeMessage 
} from '../utils/userProgress'

export function Explore() {
  const [streams, setStreams] = useState([])
  const [resumeMsg, setResumeMsg] = useState(null)

  useEffect(() => {
    // Show resume message
    const msg = getResumeMessage()
    if (msg) {
      setResumeMsg(msg)
      setTimeout(() => setResumeMsg(null), 5000)
    }

    // Load streams
    fetch('/api/streams')
      .then(r => r.json())
      .then(data => setStreams(data.streams))
  }, [])

  const handleStreamClick = (streamId) => {
    saveLastStream(streamId) // Auto-save
    // Navigate to stream detail
  }

  return (
    <div>
      {resumeMsg && (
        <div style={{
          background: 'lightblue',
          padding: '12px',
          marginBottom: '16px',
          borderRadius: '8px'
        }}>
          {resumeMsg}
          <button onClick={() => setResumeMsg(null)}>✕</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {streams.map(stream => (
          <button
            key={stream.id}
            onClick={() => handleStreamClick(stream.id)}>
            {stream.display_name}
          </button>
        ))}
      </div>
    </div>
  )
}
```

### Complete Career Detail Integration
```jsx
import React, { useEffect, useState } from 'react'
import { 
  addViewedCareer, 
  isCareerViewed 
} from '../utils/userProgress'

export function CareerDetail({ careerId }) {
  const [career, setCareer] = useState(null)
  const [isViewed, setIsViewed] = useState(false)

  useEffect(() => {
    // Track view
    addViewedCareer(careerId)
    setIsViewed(isCareerViewed(careerId))

    // Load career data
    fetch(`/api/career/${careerId}`)
      .then(r => r.json())
      .then(data => setCareer(data))
  }, [careerId])

  if (!career) return <div>Loading...</div>

  return (
    <div>
      <h1>
        {career.name}
        {isViewed && (
          <span style={{
            marginLeft: '8px',
            background: 'lightcyan',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.8em'
          }}>
            ✓ Viewed
          </span>
        )}
      </h1>
      
      <p>{career.description}</p>
    </div>
  )
}
```

### Complete Dashboard Integration
```jsx
import React, { useState } from 'react'
import { 
  getUserStats, 
  resetAllProgress 
} from '../utils/userProgress'

export function Dashboard() {
  const stats = getUserStats()

  const handleReset = () => {
    if (resetAllProgress()) {
      window.location.reload()
    }
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '16px'
    }}>
      {/* Stats Card */}
      {stats.completedOnboarding && (
        <div style={{ border: '1px solid blue', padding: '16px' }}>
          <h3>📊 Your Progress</h3>
          <p>Interests: {stats.totalInterests}</p>
          <p>Careers Explored: {stats.careersViewed}</p>
          <p>Last Active: {stats.lastActive}</p>
        </div>
      )}

      {/* Settings Card */}
      <div style={{ border: '1px solid blue', padding: '16px' }}>
        <h3>⚙️ Settings</h3>
        <button 
          onClick={handleReset}
          style={{
            background: 'red',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
          🔄 Reset Progress
        </button>
      </div>
    </div>
  )
}
```

---

## 4️⃣ Error Handling Examples

### Handle localStorage Unavailable
```jsx
try {
  const progress = getUserProgress()
  console.log('Loaded:', progress)
} catch (error) {
  console.error('localStorage not available:', error)
  // App still works, just without persistence
}
```

### Handle Missing Data
```jsx
const stats = getUserStats()

if (!stats.completedOnboarding) {
  // First time user - show onboarding
  return <Onboarding />
}

// Returning user - show dashboard
return <Dashboard stats={stats} />
```

### Handle Reset Cancellation
```jsx
const handleReset = () => {
  // Returns false if user cancels
  const cleared = resetAllProgress()
  
  if (!cleared) {
    console.log('Reset cancelled by user')
    return
  }
  
  console.log('All data cleared!')
  window.location.reload()
}
```

---

## 5️⃣ Advanced Patterns

### Pattern 1: Conditional Rendering Based on Progress
```jsx
export function App() {
  const stats = getUserStats()

  if (stats.completedOnboarding) {
    // Show dashboard with stats
    return <Dashboard stats={stats} />
  }

  if (stats.careersViewed > 0) {
    // Returning user - show quick resume
    return <ExplorePage />
  }

  // First-time user - show onboarding
  return <Onboarding />
}
```

### Pattern 2: Progress-Based Content
```jsx
export function RecommendedCareers() {
  const progress = getUserProgress()

  // Show careers similar to ones they've viewed
  const recommendations = careers.filter(career => {
    const hasViewedSimilar = progress.viewedCareers.some(
      viewed => getCareerCategory(viewed) === getCareerCategory(career.id)
    )
    return hasViewedSimilar && !progress.viewedCareers.includes(career.id)
  })

  return <div>{recommendations.map(...)</div>
}
```

### Pattern 3: Activity Tracking
```jsx
export function ActivityLog() {
  const stats = getUserStats()
  const recent = getRecentlyViewed(10)

  return (
    <div>
      <h2>Your Recent Activity</h2>
      <p>Last active: {new Date(stats.lastActive).toLocaleDateString()}</p>
      <h3>Recently Viewed:</h3>
      {recent.map(careerId => (
        <div key={careerId}>{careerId}</div>
      ))}
    </div>
  )
}
```

---

## 6️⃣ Testing Examples

### Test: Save & Load
```jsx
// Test 1: Save interests
saveInterests(['Technology', 'Biology'])

// Verify
const progress = getUserProgress()
console.assert(
  progress.interests.includes('Technology'),
  'Interest not saved!'
)
```

### Test: View Tracking
```jsx
// Test 2: Track career views
addViewedCareer('software_engineer')
addViewedCareer('doctor')

// Verify
const stats = getUserStats()
console.assert(stats.careersViewed === 2, 'Career not tracked!')
```

### Test: Resume Message
```jsx
// Test 3: Resume message
const msg = getResumeMessage()
console.assert(msg !== null, 'Resume message not generated!')
console.assert(msg.includes('Welcome back'), 'Wrong message!')
```

### Test: Reset
```jsx
// Test 4: Reset (in test environment)
// Note: In real use, resetAllProgress() shows confirmation dialog
localStorage.removeItem('career_user_progress')
const progress = getUserProgress()
console.assert(
  Object.keys(progress).length === 5,
  'Reset failed!'
)
```

---

## 🎉 Summary

You now have:
- ✅ 6 basic implementation examples
- ✅ Complete function reference
- ✅ 5 real component integrations
- ✅ Error handling patterns
- ✅ Advanced usage patterns
- ✅ Testing examples

**Copy, paste, adapt, and go!** 🚀
