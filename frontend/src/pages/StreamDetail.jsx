import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { API_BASE } from '../utils/apiConfig'

export default function StreamDetail() {
  const { streamId } = useParams()
  const nav = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/stream/${streamId}`)
      .then(r => r.json())
      .then(data => setData(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [streamId])

  if (loading) {
    return (
      <div className="page">
        <div className="loading" style={{animation: 'fadeIn 0.6s ease'}}>
          <div className="spinner"></div>
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center', padding: '40px', animation: 'slideInUp 0.5s ease' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Stream not found</p>
          <button onClick={() => nav('/explore')} className="btn" style={{ marginTop: '16px', transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05) translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
            ← Back to Explore
          </button>
        </div>
      </div>
    )
  }

  const stream = data.stream || data

  return (
    <div className="page">
      {/* Navigation */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)', animation: 'fadeInDown 0.6s ease' }}>
        <button onClick={() => nav('/')} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'all 0.3s ease' }}
          onMouseEnter={(e) => {e.target.style.borderColor = 'var(--primary)'; e.target.style.color = 'var(--primary)'; e.target.style.transform = 'translateY(-2px)'}}
          onMouseLeave={(e) => {e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)'; e.target.style.transform = 'translateY(0)'}}>
          🎯 Onboarding
        </button>
        <button onClick={() => nav('/explore')} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(0, 217, 255, 0.3)' }}>
          🗺️ Explore
        </button>
      </div>

      <button onClick={() => nav('/explore')} style={{ marginBottom: '20px', padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease' }}
        onMouseEnter={(e) => {e.target.style.borderColor = 'var(--primary)'; e.target.style.color = 'var(--primary)'; e.target.style.transform = 'translateX(-4px)'}}
        onMouseLeave={(e) => {e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)'; e.target.style.transform = 'translateX(0)'}}>
        ← Back
      </button>

      <div className="explain-card" style={{animation: 'slideInUp 0.5s ease'}}>
        <h2 style={{ color: 'var(--primary)', marginTop: 0, fontSize: '2.25rem', fontWeight: 'bold' }}>🎯 {stream.display_name}</h2>
        
        {stream.short_description && (
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '20px', animation: 'fadeIn 0.7s ease' }}>
            {stream.short_description}
          </p>
        )}

        {stream.subjects && stream.subjects.length > 0 && (
          <div style={{ marginBottom: '20px', animation: 'fadeIn 0.8s ease' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '12px', fontSize: '1.25rem' }}>📚 Subjects</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {stream.subjects.map((subject, idx) => (
                <span key={idx} style={{ background: 'rgba(0, 217, 255, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '600', animation: `fadeInUp 0.${6 + (idx % 3)}s ease`, transition: 'all 0.3s ease', cursor: 'pointer' }}
                  onMouseEnter={(e) => {e.target.style.background = 'rgba(0, 217, 255, 0.25)'; e.target.style.transform = 'scale(1.05) translateY(-2px)'; e.target.style.boxShadow = '0 4px 12px rgba(0, 217, 255, 0.3)'}}
                  onMouseLeave={(e) => {e.target.style.background = 'rgba(0, 217, 255, 0.1)'; e.target.style.transform = 'scale(1) translateY(0)'; e.target.style.boxShadow = 'none'}}>
                  {subject}
                </span>
              ))}
            </div>
          </div>
        )}

        {stream.attributes && (
          <div style={{ marginBottom: '20px', animation: 'fadeIn 0.9s ease' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '12px', fontSize: '1.25rem' }}>ℹ️ Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(stream.attributes).map(([key, value]) => {
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
                  <div key={key} style={{ padding: '12px', background: 'rgba(0, 217, 255, 0.05)', borderLeft: '3px solid var(--primary)', borderRadius: '4px' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>{formattedKey}</p>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{displayValue}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {stream.why_path && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '8px' }}>🎯 Why This Path?</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{stream.why_path}</p>
          </div>
        )}

        {stream.what_to_study && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '8px' }}>📖 What to Study</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{stream.what_to_study}</p>
          </div>
        )}

        {stream.roadmap && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '12px' }}>🗺️ Roadmap</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stream.roadmap.short_term && (
                <div style={{ padding: '12px', background: 'rgba(0, 217, 255, 0.05)', borderLeft: '3px solid var(--primary)', borderRadius: '4px' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>Short Term</p>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{stream.roadmap.short_term}</p>
                </div>
              )}
              {stream.roadmap.mid_term && (
                <div style={{ padding: '12px', background: 'rgba(0, 217, 255, 0.05)', borderLeft: '3px solid var(--primary)', borderRadius: '4px' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>Mid Term</p>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{stream.roadmap.mid_term}</p>
                </div>
              )}
              {stream.roadmap.long_term && (
                <div style={{ padding: '12px', background: 'rgba(0, 217, 255, 0.05)', borderLeft: '3px solid var(--primary)', borderRadius: '4px' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600' }}>Long Term</p>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{stream.roadmap.long_term}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {stream.skills && stream.skills.length > 0 && (
          <div>
            <h3 style={{ color: 'var(--primary)', marginBottom: '12px' }}>💡 Key Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {stream.skills.map((skill, idx) => (
                <span key={idx} style={{ background: 'rgba(255, 107, 107, 0.1)', border: '1px solid rgb(255, 107, 107)', color: 'rgb(255, 107, 107)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '600' }}>
                  {skill.replace(/^[^:]*:/, '').replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: '30px', display: 'flex', gap: '12px' }}>
          <button onClick={() => nav(`/explore/${streamId}/variants`)} className="btn">
            Explore Variants →
          </button>
          <button onClick={() => nav('/explore')} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
            ← Back
          </button>
        </div>
      </div>
    </div>
  )
}
