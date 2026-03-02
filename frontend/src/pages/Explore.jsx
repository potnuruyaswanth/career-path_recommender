import React, {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import VisualChart from '../components/VisualChart'
import { saveLastStream, getResumeMessage } from '../utils/userProgress'
import { API_BASE } from '../utils/apiConfig'

export default function Explore(){
  const [streams, setStreams] = useState([])
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()
  const [viewChart, setViewChart] = useState(false)
  const [selectedNode, setSelectedNode] = useState(null)
  const [resumeMessage, setResumeMessage] = useState(null)

  useEffect(()=>{
    // Show resume message if user has explored before
    const message = getResumeMessage()
    if (message) {
      setResumeMessage(message)
      // Auto-hide after 5 seconds
      setTimeout(() => setResumeMessage(null), 5000)
    }
    
    fetch(`${API_BASE}/streams?class=10`).then(r=>r.json()).then(data=>{
      setStreams(data.streams || [])
    }).catch(err=>{
      console.error(err)
    }).finally(()=>setLoading(false))
  },[])

  return (
    <div className="page">
      {/* Navigation */}
      <div style={{display: 'flex', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)'}}>
        <button onClick={()=>nav('/')} style={{padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '6px'}}
          onMouseEnter={(e) => {e.target.style.borderColor = 'var(--primary)'; e.target.style.color = 'var(--primary)'; e.target.style.transform = 'translateY(-2px)'}}
          onMouseLeave={(e) => {e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)'; e.target.style.transform = 'translateY(0)'}}>
          🎯 Onboarding
        </button>
        <button onClick={()=>nav('/explore')} style={{padding: '8px 16px', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(0, 217, 255, 0.3)'}}>
          🗺️ Explore
        </button>
      </div>
      
      <div className="control-bar" style={{animation: 'fadeInDown 0.6s ease'}}>
        <div>
          <h2 style={{fontSize: '1.875rem', fontWeight: 'bold', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>🎯 Explore Your Career Path</h2>
          <p className="muted" style={{marginTop: '4px'}}>Select a stream to discover your potential careers</p>
        </div>
        <button type="button" className="btn" onClick={()=>setViewChart(v=>!v)} style={{transition: 'all 0.3s ease'}}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05) translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
          {viewChart? '📊 Card View':'🗺️ Chart View'}
        </button>
      </div>
      
      {resumeMessage && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.1), rgba(0, 217, 255, 0.05))',
          border: '1px solid var(--primary)',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
          animation: 'slideInDown 0.3s ease',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{color: 'var(--primary)', fontWeight: '500'}}>{resumeMessage}</span>
          <button onClick={() => setResumeMessage(null)} style={{background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '1.2rem'}}>✕</button>
        </div>
      )}
      
      {loading && (
        <div className="loading" style={{animation: 'fadeIn 0.6s ease'}}>
          <div className="spinner"></div>
          <p style={{marginTop: '16px', color: 'var(--text-secondary)'}}>Loading streams...</p>
        </div>
      )}

      {!viewChart && (
        <div className="grid" style={{animation: 'fadeIn 0.8s ease'}}>
          {streams.map((s, idx) => (
            <button type="button" key={s.id} className="card" onClick={()=>{
              saveLastStream(s.id)
              nav(`/explore/${s.id.replace('stream:','')}`)
            }}
              style={{
                animation: `fadeInUp 0.${5 + (idx % 3)}s ease`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 217, 255, 0.3)'
                e.currentTarget.style.borderColor = 'var(--primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}>
              <div>
                <h3 style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{s.display_name}</h3>
                <p style={{marginTop: '8px', fontSize: '0.95rem', lineHeight: '1.5'}}>{s.short_description}</p>
              </div>
              <div style={{marginTop: '12px', color: 'var(--primary)', fontSize: '1rem', fontWeight: '600', transition: 'all 0.3s ease', transform: 'translateX(0)'}}>
                Explore →
              </div>
            </button>
          ))}
        </div>
      )}

      {viewChart && (
        <div className="split">
          <div className="split-left">
            <p className="muted">💡 Interactive explorer — Click any node to inspect details or navigate</p>
            <div style={{height: 700, marginTop: '12px'}}>
              <VisualChart 
                onSelect={(node)=> setSelectedNode(node)}
                onCareerClick={(node)=> {
                  const careerId = node.id.replace('career:', '')
                  nav(`/career/${careerId}`)
                }}
              />
            </div>
          </div>
          <div className="split-right">
            <h3 style={{color: 'var(--primary)'}}>Node Details</h3>
            {selectedNode ? (
              <div className="explain-card">
                <h4>{selectedNode.display_name}</h4>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', marginTop: '12px'}}>
                  <span style={{background: 'var(--primary)', color: 'var(--bg-darker)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', textTransform: 'capitalize'}}>
                    {selectedNode.type}
                  </span>
                </div>
                {selectedNode.short_description && <p>{selectedNode.short_description}</p>}
                {selectedNode.subjects && <p><strong>📚 Subjects:</strong> {selectedNode.subjects.join(', ')}</p>}
                {selectedNode.attributes && (
                  <div style={{marginTop: '12px'}}>
                    <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600'}}>ℹ️ Details:</p>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                      {Object.entries(selectedNode.attributes).map(([key, value]) => {
                        const formattedKey = key
                          .replace(/_/g, ' ')
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, str => str.toUpperCase())
                          .trim()
                        
                        let displayValue = value
                        if (Array.isArray(value)) {
                          displayValue = value.map(v => v.replace(/^[^:]*:/, '').replace(/_/g, ' ')).join(', ')
                        } else if (typeof value === 'string') {
                          displayValue = value.replace(/^[^:]*:/, '').replace(/_/g, ' ')
                        }
                        
                        return (
                          <div key={key} style={{padding: '8px', background: 'rgba(0, 217, 255, 0.05)', borderLeft: '2px solid var(--primary)', borderRadius: '4px'}}>
                            <p style={{margin: '0 0 4px 0', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600'}}>{formattedKey}</p>
                            <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{displayValue}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="explain-card" style={{textAlign: 'center', padding: '40px 20px', border: '2px dashed var(--border)'}}>
                <div style={{fontSize: '2rem', marginBottom: '8px'}}>🔍</div>
                <p className="muted">Select a node to see details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
