import React, {useEffect, useState} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import { API_BASE } from '../utils/apiConfig'

export default function VariantPaths(){
  const {streamId} = useParams()
  const [variants, setVariants] = useState([])
  const [paths, setPaths] = useState(null)
  const [loading, setLoading] = useState(true)
  const [allStreams, setAllStreams] = useState([])
  const [error, setError] = useState(null)
  const nav = useNavigate()

  useEffect(()=>{
    // Load all available streams
    fetch(`${API_BASE}/streams?class=10`).then(r=>r.json()).then(data=>{
      setAllStreams(data.streams || [])
    }).catch(err=> console.error(err))
  }, [])

  useEffect(()=>{
    setLoading(true)
    fetch(`${API_BASE}/variants?stream=${streamId}`).then(r=>r.json()).then(data=>{
      setVariants(data.variants || [])
    }).catch(err=>{
      console.error(err)
    }).finally(()=>setLoading(false))
  },[streamId])

  function showPaths(variantId){
    console.log('showPaths called with variantId:', variantId)
    setPaths(null)
    setError(null)
    setLoading(true)
    const url = `${API_BASE}/paths?variant=${variantId}`
    console.log('Fetching paths from:', url)
    fetch(url).then(r=>{
      console.log('Paths response:', r.ok, r.status)
      if(!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    }).then(data=>{
      console.log('Paths data received:', data)
      setPaths(data)
      setError(null)
    }).catch(err=>{
      console.error('Paths fetch error:', err)
      setError(`Failed to load paths: ${err.message}`)
    }).finally(()=>setLoading(false))
  }

  const [explanation, setExplanation] = useState(null)
  const [explaining, setExplaining] = useState(false)
  const [interests, setInterests] = useState(['Technology'])
  const [ranked, setRanked] = useState(null)
  const [ranking, setRanking] = useState(false)

  function showExplanationForCourse(courseEntry){
    console.log('showExplanationForCourse called with:', courseEntry)
    if(!courseEntry) {
      console.error('courseEntry is null or undefined')
      return
    }
    if(!courseEntry.careers || courseEntry.careers.length === 0) {
      console.error('No careers found in courseEntry:', courseEntry)
      console.error('Full courseEntry:', JSON.stringify(courseEntry, null, 2))
      return
    }
    const careerId = courseEntry.careers[0].id
    console.log('Fetching explanation for career:', careerId)
    setExplaining(true)
    setExplanation(null)
    const id = careerId.includes(':') ? careerId : `career:${careerId}`
    console.log('Final career ID being fetched:', id)
    fetch(`${API_BASE}/ai/explain?career=${encodeURIComponent(id)}`)
      .then(r=>{
        console.log('Explain response status:', r.status)
        if(!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data=> {
        console.log('Explanation received:', data)
        setExplanation(data)
      })
      .catch(err=> {
        console.error('Explanation fetch error:', err)
        setExplanation({error: err.message})
      })
      .finally(()=> setExplaining(false))
  }

  function toggleInterest(tag){
    setInterests(prev => prev.includes(tag) ? prev.filter(x=>x!==tag) : [...prev, tag])
  }

  function rankPaths(){
    if(!paths) return
    setRanking(true)
    setRanked(null)
    const user_profile = {current_level: 'class_10', interests}
    fetch(`${API_BASE}/ai/rank`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({user_profile, valid_paths: paths.paths})
    }).then(r=>r.json()).then(data=>{
      setRanked(data.ranked || data)
    }).catch(err=>console.error(err)).finally(()=>setRanking(false))
  }

  const interestTags = ['Technology','Biology','Business','Creativity','Defense','Science','Arts']

  return (
    <div className="page">
      <button type="button" className="back" onClick={()=>nav('/explore')} style={{transition: 'all 0.3s ease'}}
        onMouseEnter={(e) => {e.target.style.color = 'var(--primary)'; e.target.style.transform = 'translateX(-4px)'}}
        onMouseLeave={(e) => {e.target.style.color = 'var(--text-secondary)'; e.target.style.transform = 'translateX(0)'}}>
        ← Back to Streams
      </button>
      
      {/* Stream Navigation */}
      {allStreams.length > 0 && (
        <div style={{display: 'flex', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', animation: 'fadeInDown 0.6s ease'}}>
          {allStreams.map((stream, idx) => (
            <button 
              key={stream.id}
              onClick={() => nav(`/explore/${stream.id.replace('stream:','')}`)}
              style={{
                padding: '8px 16px',
                background: streamId === stream.id.replace('stream:','') ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent',
                border: `1px solid ${streamId === stream.id.replace('stream:','') ? 'var(--primary)' : 'var(--border)'}`,
                color: streamId === stream.id.replace('stream:','') ? 'var(--bg-darker)' : 'var(--text-secondary)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                animation: `fadeInUp 0.${5 + (idx % 3)}s ease`,
                transform: streamId === stream.id.replace('stream:','') ? 'scale(1.05)' : 'scale(1)',
                boxShadow: streamId === stream.id.replace('stream:','') ? '0 4px 12px rgba(0, 217, 255, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (streamId !== stream.id.replace('stream:','')) {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.color = 'var(--primary)';
                  e.target.style.transform = 'scale(1.05) translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (streamId !== stream.id.replace('stream:','')) {
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.color = 'var(--text-secondary)';
                  e.target.style.transform = 'scale(1)';
                }
              }}
            >
              {stream.display_name}
            </button>
          ))}
        </div>
      )}
      
      <h2 style={{fontSize: '1.875rem', fontWeight: 'bold', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'fadeInDown 0.6s ease'}}>🎓 Stream Variants for {streamId}</h2>
      
      {error && (
        <div style={{background: 'rgba(255, 107, 107, 0.1)', border: '1px solid #ff6b6b', borderRadius: '8px', padding: '16px', marginBottom: '20px', animation: 'slideInUp 0.5s ease'}}>
          <p style={{color: '#ff6b6b', margin: 0}}>⚠️ {error}</p>
        </div>
      )}
      
      {loading && !paths && (
        <div className="loading" style={{animation: 'fadeIn 0.6s ease'}}>
          <div className="spinner"></div>
          <p style={{marginTop: '16px', color: 'var(--text-secondary)'}}>Loading...</p>
        </div>
      )}

      <div className="grid" style={{animation: 'fadeIn 0.8s ease'}}>
        {variants.filter(v => v.display_name || v.name || v.full_name).map((v, idx)=> {
          const displayName = v.display_name || v.full_name || v.name
          const subjectsText = v.subjects 
            ? v.subjects.join(' • ') 
            : (v.description ? v.description.substring(0, 100) + '...' : '')
          
          return (
            <div key={v.id} className="card-variant" style={{animation: `fadeInUp 0.${5 + (idx % 3)}s ease`, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'}}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 217, 255, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }}>
              <div>
                <h3>📚 {displayName}</h3>
                {subjectsText && <p style={{fontSize: '0.9rem', lineHeight: '1.4'}}>{subjectsText}</p>}
              </div>
              <button type="button" className="btn" style={{width: '100%', marginTop: 'auto', transition: 'all 0.3s ease'}} 
                onClick={()=>showPaths(v.id.replace('variant:',''))}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
                🔍 Explore Paths →
              </button>
            </div>
          )
        })}
      </div>

      {paths && (
        <div className="split" style={{animation: 'slideInUp 0.5s ease'}}>
          <div className="split-left">
            <h3 style={{fontSize: '1.25rem'}}>🎯 Recommended Career Paths</h3>
            
            <div style={{background: 'rgba(45, 53, 97, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0, 217, 255, 0.2)', borderRadius: '12px', padding: '16px', marginBottom: '24px'}}>
              <p style={{marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '1rem'}}>🎯 <strong>Select Your Interests</strong></p>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px'}}>
                {interestTags.map(t=> (
                  <button 
                    key={t} 
                    type="button"
                    onClick={() => toggleInterest(t)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: `2px solid ${interests.includes(t) ? 'var(--primary)' : 'var(--border)'}`,
                      background: interests.includes(t) ? 'rgba(0, 217, 255, 0.2)' : 'transparent',
                      color: interests.includes(t) ? 'var(--primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      fontFamily: 'Inter, sans-serif',
                      position: 'relative',
                      zIndex: 10
                    }}
                    onMouseEnter={(e) => {
                      if (!interests.includes(t)) {
                        e.target.style.borderColor = 'var(--primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!interests.includes(t)) {
                        e.target.style.borderColor = 'var(--border)';
                      }
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button type="button" className="btn" style={{width: '100%'}} onClick={rankPaths} disabled={ranking}>
                {ranking ? '⏳ Analyzing...' : '🚀 AI Rank Paths'}
              </button>
            </div>

            {ranked ? (
              ranked.map((r, idx) => (
                <button
                  type="button"
                  key={r.career_id || idx} 
                  className="rank-item" 
                  onClick={() => {
                    console.log('Clicked ranked item:', r)
                    showExplanationForCourse({careers:[{id:r.career_id, display_name:r.career_name}]})
                  }}
                  style={{cursor: 'pointer', width: '100%', textAlign: 'left', display: 'flex', border: 'none', background: 'transparent', padding: '0'}}
                >
                  <div className="rank-badge">#{idx+1}</div>
                  <div style={{flex: 1}}>
                    <strong style={{color: 'var(--primary)', fontSize: '1.05rem'}}>{r.career_name}</strong>
                    <div className="muted" style={{marginTop: '4px'}}>{r.reason || 'High-match career path'}</div>
                    {r.score && <div style={{marginTop: '4px', fontSize: '0.85rem', color: 'var(--success)'}}>Match Score: {r.score}%</div>}
                  </div>
                </button>
              ))
            ) : paths && paths.paths ? (
              paths.paths.map((p, idx)=> (
                <button
                  type="button"
                  key={p.course.id} 
                  className="rank-item" 
                  onClick={() => {
                    console.log('Clicked path item:', p)
                    showExplanationForCourse(p)
                  }}
                  style={{cursor: 'pointer', width: '100%', textAlign: 'left', display: 'flex', border: 'none', background: 'transparent', padding: '0'}}
                >
                  <div className="rank-badge">#{idx+1}</div>
                  <div style={{flex: 1}}>
                    <strong style={{color: 'var(--primary)', fontSize: '1.05rem'}}>{p.course.display_name}</strong>
                    <div className="muted" style={{marginTop: '4px'}}>
                      {p.course.attributes && p.course.attributes.entry_exams ? '📝 Exam-based entry' : '✓ General admission'}
                    </div>
                  </div>
                </button>
              ))
            ) : null}
          </div>

          <div className="split-right">
            <h3 style={{color: 'var(--primary)', marginBottom: '16px'}}>Career Intelligence</h3>
            
            {explaining ? (
              <div className="explain-card" style={{textAlign: 'center', padding: '40px 20px'}}>
                <div className="spinner" style={{margin: '0 auto 12px'}}></div>
                <p className="muted">Generating AI insights...</p>
              </div>
            ) : !explanation ? (
              <div className="explain-card" style={{textAlign: 'center', padding: '40px 20px', border: '2px dashed var(--border)'}}>
                <div style={{fontSize: '2.5rem', marginBottom: '12px'}}>🤖</div>
                <p style={{fontWeight: '600', color: 'var(--primary)', marginBottom: '8px'}}>AI Career Guide</p>
                <p className="muted">Select a career path to get AI-powered insights</p>
              </div>
            ) : explanation.error ? (
              <div className="explain-card" style={{background: 'rgba(255, 107, 107, 0.1)', border: '1px solid #ff6b6b'}}>
                <p style={{color: '#ff6b6b', fontWeight: '600'}}>⚠️ Error loading career info</p>
                <p className="muted" style={{fontSize: '0.8rem', marginTop: '8px'}}>{explanation.error}</p>
              </div>
            ) : (
              <div className="explain-card">
                <div style={{background: 'rgba(0, 217, 255, 0.1)', border: '1px solid rgba(0, 217, 255, 0.3)', borderRadius: '8px', padding: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <h4 style={{margin: 0, wordWrap: 'break-word', overflowWrap: 'break-word', flex: 1}}>{explanation.career_id?.replace(/^career:/, '').replace(/_/g, ' ')}</h4>
                  <button 
                    type="button"
                    className="btn"
                    style={{marginLeft: '8px', whiteSpace: 'nowrap'}}
                    onClick={() => {
                      const careerId = explanation.career_id?.replace(/^career:/, '') || explanation.career_id
                      nav(`/career/${careerId}`)
                    }}>
                    View Full →
                  </button>
                </div>
                {explanation.why && (
                  <div style={{marginBottom: '12px'}}>
                    <p><strong>💡 Why this path?</strong></p>
                    <p className="muted">{explanation.why}</p>
                  </div>
                )}
                {explanation.what_to_study && (
                  <div style={{marginBottom: '12px'}}>
                    <p><strong>📚 What to study?</strong></p>
                    <p className="muted">{explanation.what_to_study}</p>
                  </div>
                )}
                {explanation.skills && (
                  <div style={{marginBottom: '12px'}}>
                    <p><strong>🎯 Key Skills:</strong></p>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px'}}>
                      {explanation.skills.map((s, i) => (
                        <span 
                          key={i}
                          style={{
                            background: 'rgba(0, 217, 255, 0.2)',
                            border: '1px solid rgba(0, 217, 255, 0.4)',
                            borderRadius: '12px',
                            padding: '4px 10px',
                            fontSize: '0.85rem',
                            color: 'var(--primary)',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            display: 'inline-block',
                            maxWidth: '100%'
                          }}
                        >
                          {s.replace(/^skill:/, '').replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {explanation.note && <p className="muted" style={{fontSize: '0.85rem', marginTop: '12px'}}>ℹ️ {explanation.note}</p>}
              </div>
            )}

            <h4 style={{marginTop: '20px', marginBottom: '12px', color: 'var(--primary)'}}>🗺️ Your Roadmap</h4>
            <div className="explain-card">
              <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                <div style={{borderLeft: '3px solid var(--primary)', paddingLeft: '12px'}}>
                  <p style={{margin: '0 0 4px 0', fontWeight: '600', color: 'var(--success)'}}>📚 Short Term</p>
                  <p className="muted" style={{margin: 0, fontSize: '0.9rem'}}>Select subjects & prepare for exams</p>
                </div>
                <div style={{borderLeft: '3px solid var(--secondary)', paddingLeft: '12px'}}>
                  <p style={{margin: '0 0 4px 0', fontWeight: '600', color: 'var(--secondary)'}}>🎓 Mid Term</p>
                  <p className="muted" style={{margin: 0, fontSize: '0.9rem'}}>Complete degree/diploma programs</p>
                </div>
                <div style={{borderLeft: '3px solid var(--accent)', paddingLeft: '12px'}}>
                  <p style={{margin: '0 0 4px 0', fontWeight: '600', color: 'var(--accent)'}}>🚀 Long Term</p>
                  <p className="muted" style={{margin: 0, fontSize: '0.9rem'}}>Build career & advance further</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
