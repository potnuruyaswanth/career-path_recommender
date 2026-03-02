import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserProgress, saveInterests, saveBoard } from '../utils/userProgress'
import { API_BASE } from '../utils/apiConfig'

const BOARDS = ['CBSE','ICSE','STATE']
const INTERESTS = [
  { name: 'Technology', icon: '💻', color: '#00d9ff' },
  { name: 'Biology', icon: '🧬', color: '#4ade80' },
  { name: 'Business', icon: '💼', color: '#f59e0b' },
  { name: 'Creativity', icon: '🎨', color: '#ec4899' },
  { name: 'Defense', icon: '🛡️', color: '#8b5cf6' },
  { name: 'Science', icon: '🔬', color: '#06b6d4' },
  { name: 'Arts', icon: '🎭', color: '#f97316' },
  { name: 'Leadership', icon: '👔', color: '#3b82f6' },
  { name: 'Research', icon: '📚', color: '#10b981' }
]

const STEPS = [
  { num: 1, label: 'Class', icon: '📚', helper: 'Pick your current class' },
  { num: 2, label: 'Board', icon: '🏫', helper: 'Choose your education board' },
  { num: 3, label: 'Interests', icon: '❤️', helper: 'Select what excites you' },
  { num: 4, label: 'Results', icon: '🎯', helper: 'Review matched paths' }
]

export const BotHero = ({ step, interestsCount, message = "Hi there! 👋", stepLabel = "steps" }) => (
  <div className="bot-hero" aria-hidden>
    <div className="bot-hero-blob" />
    <svg
      className="bot-hero-svg"
      viewBox="0 0 260 260"
      role="presentation"
    >
      <circle className="bot-halo" cx="130" cy="125" r="92" />
      <rect className="bot-body" x="78" y="110" width="104" height="90" rx="18" />
      <rect className="bot-screen" x="90" y="122" width="80" height="48" rx="10" />
      <path className="bot-face" d="M112 148 q8 10 16 0 q8 10 16 0" />
      <rect className="bot-neck" x="118" y="196" width="24" height="16" rx="6" />
      <rect className="bot-base" x="100" y="210" width="60" height="18" rx="10" />
      <rect className="bot-ear left" x="70" y="134" width="12" height="32" rx="6" />
      <rect className="bot-ear right" x="178" y="134" width="12" height="32" rx="6" />
      <circle className="bot-light" cx="136" cy="136" r="6" />
      <path className="bot-arm left" d="M78 150 q-18 18 -10 36" />
      <path className="bot-arm right" d="M182 150 q18 18 10 36" />
      <circle className="bot-node" cx="62" cy="186" r="6" />
      <circle className="bot-node" cx="198" cy="186" r="6" />
    </svg>
    <div className="bot-bubble bubble-main">
      <span>{message}</span>
      <div className="bubble-dot" />
      <div className="bubble-dot" />
      <div className="bubble-dot" />
    </div>
    {step && <div className="bot-bubble bubble-progress">{step}/4 {stepLabel}</div>}
    {interestsCount !== undefined && <div className="bot-bubble bubble-pill">{interestsCount} interests set</div>}
  </div>
)

const CareerDecisionHero = () => (
  <div className="career-decision-card">
    <div className="cd-window">
      <div className="cd-blind" />
      <div className="cd-blind" />
      <div className="cd-wall" />
    </div>
    <div className="cd-person">
      <div className="cd-head" />
      <div className="cd-body" />
      <div className="cd-arm" />
      <div className="cd-bag" />
    </div>
    <div className="cd-desk">
      <div className="cd-monitor" />
      <div className="cd-chair" />
      <div className="cd-box-stack" />
    </div>
    <div className="cd-label">Career decision moment</div>
  </div>
)

const DataAnalysisHero = () => (
  <div className="data-hero-card">
    <div className="data-dash">
      <div className="data-tab">DATA</div>
      <div className="data-tile tall" />
      <div className="data-tile" />
      <div className="data-tile small" />
      <div className="data-chart" />
      <div className="data-gear" />
    </div>
    <div className="data-plant" />
    <div className="data-person" />
    <div className="data-loop" />
    <div className="data-label">Data analysis in action</div>
  </div>
)

const CareerDecisionsHero = () => (
  <div className="career-choices-card">
    <div className="cc-ring" />
    <div className="cc-path-arrow" />
    <div className="cc-signpost">
      <div className="cc-sign top" />
      <div className="cc-sign mid" />
      <div className="cc-sign bottom" />
      <div className="cc-post" />
    </div>
    <div className="cc-chess" />
    <div className="cc-coins" />
    <div className="cc-briefcase" />
    <div className="cc-question" />
    <div className="cc-label">Career decisions</div>
  </div>
)

export default function Onboarding(){
  const nav = useNavigate()
  const [step, setStep] = useState(1)
  const [board, setBoard] = useState(BOARDS[0])
  const [interests, setInterests] = useState(['Technology'])
  const [loading, setLoading] = useState(false)
  const [ranked, setRanked] = useState(null)
  const [error, setError] = useState('')
  const [filterScore, setFilterScore] = useState('all') // all, high, medium, any
  const [isAnimating, setIsAnimating] = useState(false)

  // Test API connection on mount and load saved progress
  useEffect(() => {
    console.log('API_BASE is:', API_BASE)
    
    // Load saved progress
    const savedProgress = getUserProgress()
    if (savedProgress.board) {
      setBoard(savedProgress.board)
    }
    if (savedProgress.interests && savedProgress.interests.length > 0) {
      setInterests(savedProgress.interests.map(name => 
        INTERESTS.find(i => i.name === name) || name
      ))
    }
    
    fetch(`${API_BASE}/streams?class=10`)
      .then(r => {
        console.log('API connection test:', r.ok ? 'SUCCESS' : 'FAILED', r.status)
        return r.json()
      })
      .then(data => console.log('Streams available:', data))
      .catch(err => console.error('API connection error:', err))
  }, [])

  const userProfile = useMemo(()=>({
    current_level: 'class_10',
    board,
    interests: interests.map(i => typeof i === 'string' ? i : i.name),
  }),[board, interests])

  function toggleInterest(interestObj){
    const name = typeof interestObj === 'string' ? interestObj : interestObj.name
    setInterests(prev => {
      const prevNames = prev.map(p => typeof p === 'string' ? p : p.name)
      let updated
      if (prevNames.includes(name)) {
        updated = prev.filter(x => (typeof x === 'string' ? x : x.name) !== name)
      } else {
        const fullObj = INTERESTS.find(i => i.name === name)
        updated = [...prev, fullObj || name]
      }
      // Auto-save interests after change
      saveInterests(updated)
      return updated
    })
  }

  function goToStep(newStep) {
    setIsAnimating(true)
    setTimeout(() => {
      setStep(newStep)
      setIsAnimating(false)
    }, 300)
  }

  async function fetchAllPaths(){
    try {
      console.log('Fetching paths from API_BASE:', API_BASE)

      // 1) Get streams for class 10
      const streamsResp = await fetch(`${API_BASE}/streams?class=10`)
      if(!streamsResp.ok){
        console.error('Failed to load streams', streamsResp.status)
        return []
      }
      const streamsData = await streamsResp.json()
      const streams = streamsData.streams || []
      console.log('Streams:', streams.map(s=>s.id))

      // 2) For each stream, load variants dynamically
      const variants = (await Promise.all(streams.map(async s => {
        try {
          const vResp = await fetch(`${API_BASE}/variants?stream=${s.id}`)
          if(!vResp.ok) {
            console.warn('No variants for stream', s.id, vResp.status)
            return []
          }
          const vData = await vResp.json()
          const vs = (vData.variants || []).map(v => v.id || v)
          console.log('Variants for', s.id, vs)
          return vs
        } catch(err){
          console.error('Variant fetch error for stream', s.id, err)
          return []
        }
      }))).flat()

      if(variants.length === 0){
        console.error('No variants discovered; cannot fetch paths')
        return []
      }

      // 3) Fetch paths for each discovered variant
      const results = await Promise.all(variants.map(async v => {
        try {
          const url = `${API_BASE}/paths?variant=${encodeURIComponent(v)}`
          console.log('Fetching:', url)
          const r = await fetch(url)
          console.log(`Response for ${v}:`, r.status, r.ok)
          if(!r.ok) {
            const errorText = await r.text()
            console.error(`Error response for ${v}:`, errorText)
            return {paths: []}
          }
          const data = await r.json()
          console.log(`Paths for ${v}:`, data.paths?.length || 0)
          return data
        } catch(err) {
          console.error(`Error fetching paths for variant ${v}:`, err)
          return {paths: []}
        }
      }))
      
      // 4) Flatten paths arrays
      const valid_paths = results.flatMap(r => r.paths || [])
      console.log('Total valid paths collected:', valid_paths.length)
      if(valid_paths.length > 0) {
        console.log('Sample path:', valid_paths[0])
      }
      return valid_paths
    } catch(err){
      console.error('fetchAllPaths error:', err)
      return []
    }
  }

  async function submit(){
    setError('')
    setLoading(true)
    setRanked(null)
    try{
      // Save user selections to progress
      saveBoard(board)
      saveInterests(interests)
      
      console.log('=== Starting Career Path Ranking ===')
      console.log('API_BASE:', API_BASE)
      console.log('User Profile:', userProfile)
      
      const valid_paths = await fetchAllPaths()
      console.log('Total paths collected:', valid_paths.length)
      
      if(!valid_paths || valid_paths.length === 0){
        console.error('No career paths available after fetch')
        setError('No career paths available. Please check your internet connection and try again.')
        setLoading(false)
        return
      }
      console.log('Submitting with user_profile:', userProfile)
      console.log('And valid_paths:', valid_paths)
      
      console.log('Calling /ai/rank endpoint...')
      const resp = await fetch(`${API_BASE}/ai/rank`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ user_profile: userProfile, valid_paths })
      })
      
      if(!resp.ok) {
        const errText = await resp.text()
        console.error('Ranking API error:', resp.status, errText)
        throw new Error(`Ranking API returned ${resp.status}: ${errText}`)
      }
      
      const data = await resp.json()
      console.log('Ranked response:', data)
      
      if(!data.ranked || data.ranked.length === 0) {
        throw new Error('No ranked careers returned from API')
      }
      
      setRanked(data.ranked || data)
      setStep(4)
    }catch(e){
      console.error('Submit error:', e)
      setError(`Error: ${e.message || 'Something went wrong. Please check console for details.'}`)
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="onboarding-shell">
      <div className="tab-row">
        <button className="tab-pill is-active">🎯 Onboarding</button>
        <button className="tab-pill" onClick={() => nav('/explore')}>
          🗺️ Explore
        </button>
      </div>

      <div className="onboarding-hero glass-panel">
        <div className="hero-copy">
          <div className="brand-mark">
            <img src="/cpn-logo.svg" alt="Career Path Navigator logo" />
            <div className="brand-name">Career Path Navigator</div>
          </div>
          <p className="eyebrow">Guided setup</p>
          <h1>Career Onboarding</h1>
          <p className="supporting-text">Take a quick, four-step walkthrough so we can tailor streams, variants, and actions to you.</p>
          <div className="hero-actions">
            <button className="btn" onClick={() => goToStep(Math.min(step + 1, 4))}>
              Continue setup →
            </button>
            <button className="btn btn-ghost" onClick={() => nav('/home')}>
              Go to home
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <BotHero step={step} interestsCount={interests.length} />
          <div className="hero-stats glass-panel">
            <p className="muted">Progress</p>
            <div className="hero-progress">
              <span className="hero-step">{step}</span>
              <span className="muted">of 4 steps</span>
            </div>
            <div className="chip-row">
              <span className="tag">Board: {board}</span>
              <span className="tag">{interests.length} interests</span>
            </div>
          </div>
          <div className="hero-cards-grid">
            <CareerDecisionHero />
            <DataAnalysisHero />
            <CareerDecisionsHero />
          </div>
        </div>
      </div>

      <div className="stepper">
        {STEPS.map(({ num, label, icon, helper }) => (
          <div key={num} className={`stepper-item ${step >= num ? 'is-active' : ''}`}>
            <div className="stepper-badge">{step > num ? '✓' : icon}</div>
            <div className="stepper-copy">
              <span className="muted">Step {num}</span>
              <div className="stepper-label">{label}</div>
              <div className="stepper-helper">{helper}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="step-panels">
        {step===1 && (
          <section className={`panel glass-panel ${isAnimating ? 'is-fading' : ''}`}>
            <div className="panel-header">
              <div className="eyebrow">Step 1</div>
              <h2>Choose your class</h2>
              <p className="supporting-text">Currently supported: Class 10. More grades coming soon.</p>
            </div>
            <div className="class-card">
              <div>
                <p className="muted">Available now</p>
                <h3>Class 10</h3>
                <p className="supporting-text">We will use this to pull the right streams, variants, and next-best actions.</p>
              </div>
              <span className="tag">Pre-selected</span>
            </div>
            <div className="panel-actions">
              <button type="button" className="btn" onClick={()=>goToStep(2)}>
                Next →
              </button>
            </div>
          </section>
        )}

        {step===2 && (
          <section className={`panel glass-panel ${isAnimating ? 'is-fading' : ''}`}>
            <div className="panel-header">
              <div className="eyebrow">Step 2</div>
              <h2>Choose your board</h2>
              <p className="supporting-text">Pick the board that matches your curriculum so eligibility and paths stay accurate.</p>
            </div>
            <div className="option-grid">
              {BOARDS.map(b => {
                const isActive = board === b
                return (
                  <button
                    key={b}
                    onClick={() => setBoard(b)}
                    className={`select-card ${isActive ? 'is-active' : ''}`}
                  >
                    <span className="select-title">{b}</span>
                    <span className="muted">{isActive ? 'Selected' : 'Tap to select'}</span>
                  </button>
                )
              })}
            </div>
            <div className="panel-actions">
              <button type="button" className="btn btn-ghost" onClick={()=>goToStep(1)}>
                ← Back
              </button>
              <button type="button" className="btn" onClick={()=>goToStep(3)}>
                Next →
              </button>
            </div>
          </section>
        )}

        {step===3 && (
          <section className={`panel glass-panel ${isAnimating ? 'is-fading' : ''}`}>
            <div className="panel-header">
              <div className="eyebrow">Step 3</div>
              <h2>Select your interests</h2>
              <p className="supporting-text">Pick 2–4 interests. They only inform ranking and are never used for eligibility filters.</p>
            </div>
            <div className="interest-grid">
              {INTERESTS.map((interest) => {
                const name = interest.name
                const icon = interest.icon
                const color = interest.color
                const isSelected = interests.some(i => (typeof i === 'string' ? i : i.name) === name)
                return (
                  <button
                    key={name}
                    type="button"
                    className={`interest-chip ${isSelected ? 'is-active' : ''}`}
                    style={{
                      borderColor: isSelected ? color : 'var(--border)',
                      background: isSelected ? `linear-gradient(135deg, ${color}22, ${color}33)` : 'rgba(255,255,255,0.04)',
                      color: isSelected ? color : 'var(--text-secondary)'
                    }}
                    onClick={() => toggleInterest(interest)}
                  >
                    <span className="interest-icon">{icon}</span>
                    <span className="interest-name">{name}</span>
                    {isSelected && <span className="interest-check">✓</span>}
                  </button>
                )
              })}
            </div>
            <div className="panel-actions">
              <button type="button" className="btn btn-ghost" onClick={() => goToStep(2)}>
                ← Back
              </button>
              <button
                type="button"
                className="btn"
                onClick={submit}
                disabled={loading}
              >
                {loading ? 'Ranking…' : '✨ Submit & Rank Paths'}
              </button>
              {error && <span className="error-text">{error}</span>}
            </div>
          </section>
        )}

        {step===4 && (
          <section className={`panel glass-panel ${isAnimating ? 'is-fading' : ''}`}>
            <div className="panel-header">
              <div className="eyebrow">Step 4</div>
              <h2>Recommended career paths</h2>
              <p className="supporting-text">Based on your interests: <span className="text-highlight">{interests.map(i => typeof i === 'string' ? i : i.name).join(', ')}</span></p>
            </div>
            {!ranked && <div className="muted">No results yet</div>}
            {ranked && (
              <>
                <div className="filter-row">
                  <button 
                    onClick={() => setFilterScore('all')} 
                    className={`filter-chip ${filterScore === 'all' ? 'is-active' : ''}`}
                  >
                    📊 All ({ranked.length})
                  </button>
                  <button 
                    onClick={() => setFilterScore('high')} 
                    className={`filter-chip ${filterScore === 'high' ? 'is-active' : ''}`}
                  >
                    ⭐ Best ({ranked.filter(r => r.score >= 5).length})
                  </button>
                  <button 
                    onClick={() => setFilterScore('medium')} 
                    className={`filter-chip ${filterScore === 'medium' ? 'is-active' : ''}`}
                  >
                    ✨ Good ({ranked.filter(r => r.score >= 2 && r.score < 5).length})
                  </button>
                  <button 
                    onClick={() => setFilterScore('any')} 
                    className={`filter-chip ${filterScore === 'any' ? 'is-active' : ''}`}
                  >
                    💡 Others ({ranked.filter(r => r.score > 0 && r.score < 2).length})
                  </button>
                </div>

                <div className="results-grid">
                  {ranked
                    .filter(r => {
                      if (filterScore === 'all') return true
                      if (filterScore === 'high') return r.score >= 5
                      if (filterScore === 'medium') return r.score >= 2 && r.score < 5
                      if (filterScore === 'any') return r.score > 0 && r.score < 2
                      return true
                    })
                    .map((r, idx) => (
                      <div 
                        key={r.career_id || idx}
                        className="result-card"
                        style={{animation: `fadeInUp 0.${5 + idx}s ease`}}
                      >
                        <div className="result-title">🎯 {r.career_name}</div>
                        <div className="result-sub">{r.reason || 'Available career path'}</div>
                        {r.score > 0 && (
                          <div className="result-score">
                            <div className="score-dots">
                              {Array.from({length: Math.min(5, Math.ceil(r.score/2))}).map((_, i) => (
                                <span key={i} className="score-dot"></span>
                              ))}
                            </div>
                            <span className="score-label">{r.score} pts</span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
                <p className="supporting-text">{filterScore === 'all' ? `Showing all ${ranked.length} results` : 'Filtered results • Switch tabs to view more'}</p>
              </>
            )}
            <div className="panel-actions">
              <button 
                type="button" 
                className="btn btn-ghost" 
                onClick={() => { goToStep(3); setRanked(null); setFilterScore('all'); }}
              >
                ← Adjust interests
              </button>
              <button 
                type="button" 
                className="btn" 
                onClick={() => nav('/explore')}
              >
                🗺️ Explore career map
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
