import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ActionChips from '../components/ActionChips'
import CareerRoadmap from '../components/CareerRoadmap'
import { addViewedCareer, isCareerViewed, getUserProgress } from '../utils/userProgress'
import { API_BASE } from '../utils/apiConfig'
import { BotHero } from './Onboarding'

export default function CareerDetail() {
  const { careerId } = useParams()
  const nav = useNavigate()
  const [career, setCareer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isViewed, setIsViewed] = useState(false)
  const [userProgress] = useState(getUserProgress())

  useEffect(() => {
    if (!careerId) return

    setLoading(true)
    setError(null)

    // Fetch career details - try both with and without 'career:' prefix
    const normalizedId = careerId.includes(':') ? careerId : `career:${careerId}`
    
    // Try multiple endpoints with timeout
    const fetchWithTimeout = (url, timeout = 8000) => {
      return Promise.race([
        fetch(url),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
      ])
    }
    
    // First try main API
    fetchWithTimeout(`${API_BASE}/ai/explain?career=${encodeURIComponent(normalizedId)}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data => {
        setCareer(data)
        addViewedCareer(normalizedId)
        setIsViewed(isCareerViewed(normalizedId))
        setError(null)
      })
      .catch(err => {
        console.error('Error fetching career from main API:', err)
        console.log('Attempting fallback endpoint...')
        
        // Try fallback local endpoint
        return fetch(`http://localhost:8000/ai/explain?career=${encodeURIComponent(normalizedId)}`)
          .then(r => {
            if (!r.ok) throw new Error(`Fallback HTTP ${r.status}`)
            return r.json()
          })
          .then(data => {
            setCareer(data)
            addViewedCareer(normalizedId)
            setIsViewed(isCareerViewed(normalizedId))
            setError(null)
          })
          .catch(fallbackErr => {
            console.error('Both endpoints failed:', fallbackErr)
            setError(`Failed to load career details. Please check your connection and try again.`)
            throw fallbackErr
          })
      })
      .finally(() => setLoading(false))
  }, [careerId])

  if (loading) {
    return (
      <div className="page">
        <div className="loading" style={{ animation: 'fadeIn 0.6s ease' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
            Loading career details...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <button
          onClick={() => nav(-1)}
          style={{
            marginBottom: '20px',
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = 'var(--primary)'
            e.target.style.color = 'var(--primary)'
            e.target.style.transform = 'translateX(-4px)'
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = 'var(--border)'
            e.target.style.color = 'var(--text-secondary)'
            e.target.style.transform = 'translateX(0)'
          }}>
          ← Back
        </button>

        <div
          style={{
            background: 'rgba(255, 107, 53, 0.1)',
            border: '1px solid rgba(255, 107, 53, 0.5)',
            borderRadius: '8px',
            padding: '24px',
            color: '#FF6B35',
            animation: 'slideInUp 0.5s ease'
          }}>
          <p style={{ margin: 0, fontWeight: '600', fontSize: '1.05rem' }}>⚠️ {error}</p>
        </div>
      </div>
    )
  }

  if (!career) {
    return (
      <div className="page">
        <button
          onClick={() => nav(-1)}
          style={{
            marginBottom: '20px',
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = 'var(--primary)'
            e.target.style.color = 'var(--primary)'
            e.target.style.transform = 'translateX(-4px)'
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = 'var(--border)'
            e.target.style.color = 'var(--text-secondary)'
            e.target.style.transform = 'translateX(0)'
          }}>
          ← Back
        </button>

        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            animation: 'slideInUp 0.5s ease'
          }}>
          <p style={{ color: 'var(--text-secondary)' }}>Career not found</p>
        </div>
      </div>
    )
  }

  const careerData = career.career || career
  const careerName = careerData.display_name || careerData.name || 'Career'
  const careerDescription = careerData.short_description || careerData.description || ''

  return (
    <div className="page">
      {/* Bot Hero - User Progress - Compact Corner */}
      <div style={{ 
        position: 'fixed',
        top: '80px',
        right: '20px',
        zIndex: 100,
        transform: 'scale(0.35)',
        transformOrigin: 'top right',
        animation: 'fadeIn 0.5s ease',
        pointerEvents: 'none'
      }}>
        <BotHero 
          message="Exploring! 🚀"
          interestsCount={userProgress.interests?.length || 0}
        />
      </div>

      {/* Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border)',
          animation: 'fadeInDown 0.6s ease'
        }}>
        <button
          onClick={() => nav('/')}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = 'var(--primary)'
            e.target.style.color = 'var(--primary)'
            e.target.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = 'var(--border)'
            e.target.style.color = 'var(--text-secondary)'
            e.target.style.transform = 'translateY(0)'
          }}>
          🎯 Home
        </button>
        <button
          onClick={() => nav(-1)}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid var(--primary)',
            color: 'var(--primary)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0, 217, 255, 0.3)'
          }}>
          👈 Back
        </button>
      </div>

      <button
        onClick={() => nav(-1)}
        style={{
          marginBottom: '20px',
          padding: '8px 16px',
          background: 'transparent',
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = 'var(--primary)'
          e.target.style.color = 'var(--primary)'
          e.target.style.transform = 'translateX(-4px)'
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = 'var(--border)'
          e.target.style.color = 'var(--text-secondary)'
          e.target.style.transform = 'translateX(0)'
        }}>
        ← Back
      </button>

      {/* Career Header */}
      <div
        className="explain-card"
        style={{ animation: 'slideInUp 0.5s ease', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <h1
            style={{
              color: 'var(--primary)',
              marginTop: 0,
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: 0
            }}>
            🎯 {careerName}
          </h1>
          {isViewed && (
            <span style={{
              background: 'rgba(0, 217, 255, 0.15)',
              color: 'var(--primary)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              border: '1px solid var(--primary)',
              whiteSpace: 'nowrap'
            }}>
              ✓ Viewed
            </span>
          )}
        </div>

        {careerDescription && (
          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              marginBottom: '20px',
              lineHeight: '1.6',
              animation: 'fadeIn 0.7s ease'
            }}>
            {careerDescription}
          </p>
        )}

        {/* Career Attributes */}
        {careerData.attributes && Object.keys(careerData.attributes).length > 0 && (
          <div style={{ marginBottom: '12px', animation: 'fadeIn 0.8s ease' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.entries(careerData.attributes)
                .filter(([key, value]) => {
                  // Skip nba_attributes here, show other attributes
                  return key !== 'nba_attributes' && value && typeof value !== 'object'
                })
                .map(([key, value]) => (
                  <span
                    key={key}
                    style={{
                      background: 'rgba(0, 217, 255, 0.1)',
                      border: '1px solid var(--primary)',
                      color: 'var(--primary)',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 217, 255, 0.25)'
                      e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)'
                      e.currentTarget.style.boxShadow =
                        '0 4px 12px rgba(0, 217, 255, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 217, 255, 0.1)'
                      e.currentTarget.style.transform = 'scale(1) translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}>
                    {key === 'career_type'
                      ? `💼 ${value}`
                      : key === 'nature'
                      ? `🎓 ${value}`
                      : value}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          borderBottom: '2px solid var(--border)',
          animation: 'fadeIn 0.6s ease',
          flexWrap: 'wrap'
        }}>
        {['overview', 'roadmap', 'actions'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 20px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              color:
                activeTab === tab
                  ? 'var(--primary)'
                  : 'var(--text-secondary)',
              borderBottom:
                activeTab === tab
                  ? '3px solid var(--primary)'
                  : 'none',
              transition: 'all 0.3s ease',
              marginBottom: '-2px',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab) {
                e.target.style.color = 'var(--primary)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab) {
                e.target.style.color = 'var(--text-secondary)'
              }
            }}>
            {tab === 'overview' ? '📋 Overview' : tab === 'roadmap' ? '🗺️ Roadmap' : '🚀 Next Actions'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ animation: 'fadeIn 0.6s ease' }}>
        {activeTab === 'overview' && (
          <div>
            {career.explanation && (
              <div
                className="explain-card"
                style={{
                  marginBottom: '24px',
                  animation: 'slideInUp 0.5s ease'
                }}>
                <h3
                  style={{
                    color: 'var(--primary)',
                    marginTop: 0,
                    fontSize: '1.25rem'
                  }}>
                  💡 Career Guidance
                </h3>
                <div
                  style={{
                    fontSize: '0.95rem',
                    lineHeight: '1.7',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word'
                  }}>
                  {career.explanation}
                </div>
              </div>
            )}

            {careerData.skills && careerData.skills.length > 0 && (
              <div
                className="explain-card"
                style={{
                  marginBottom: '24px',
                  animation: 'slideInUp 0.6s ease'
                }}>
                <h3
                  style={{
                    color: 'var(--primary)',
                    marginTop: 0,
                    fontSize: '1.25rem'
                  }}>
                  🛠️ Key Skills
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {careerData.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: 'rgba(255, 107, 53, 0.1)',
                        border: '1px solid rgba(255, 107, 53, 0.5)',
                        color: '#FF6B35',
                        padding: '8px 14px',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        animation: `fadeInUp 0.${5 + (idx % 3)}s ease`,
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 107, 53, 0.2)'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 107, 53, 0.1)'
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'roadmap' && (
          <div
            className="explain-card"
            style={{
              animation: 'slideInUp 0.5s ease'
            }}>
            <CareerRoadmap
              careerId={careerId}
              careerName={careerName}
              nbaAttributes={careerData.nba_attributes || careerData.attributes?.nba_attributes || {}}
              roadmapData={careerData.roadmap || career.roadmap}
              careerAttributes={careerData.attributes}
              keyMilestones={careerData.key_milestones || career.key_milestones}
              tipsForSuccess={careerData.tips_for_success || career.tips_for_success}
            />
          </div>
        )}

        {activeTab === 'actions' && (
          <div
            className="explain-card"
            style={{
              animation: 'slideInUp 0.5s ease'
            }}>
            <h3
              style={{
                color: 'var(--primary)',
                marginTop: 0,
                fontSize: '1.25rem',
                marginBottom: '20px'
              }}>
              🚀 Next Best Actions
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Discover actionable next steps personalized for the {careerName} career path.
            </p>
            <ActionChips careerId={careerId} />
          </div>
        )}
      </div>
    </div>
  )
}
