import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { API_BASE } from '../utils/apiConfig'

// Map action categories to colors for better visual hierarchy
const CATEGORY_COLORS = {
  'universal': '#00D9FF',        // cyan
  'exam_based': '#FF6B35',       // orange
  'degree_based': '#4ECDC4',     // teal
  'diploma_based': '#95E1D3',    // mint
  'govt_based': '#6A4C93',       // purple
  'medical_based': '#EE5A6F',    // red
  'skill_based': '#FFD460',      // yellow
  'finance_based': '#A8D8EA'     // light blue
}

export default function ActionChips({ careerId }) {
  const [actions, setActions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedCategory, setExpandedCategory] = useState(null)
  const nav = useNavigate()

  useEffect(() => {
    if (!careerId) return

    setLoading(true)
    setError(null)

    // Normalize career ID (remove 'career:' prefix if present)
    const normalizedId = careerId.includes(':') ? careerId.split(':')[1] : careerId

    fetch(`${API_BASE}/career/${normalizedId}/next-actions`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data => {
        setActions(data)
        setError(null)
      })
      .catch(err => {
        console.error('Error fetching actions:', err)
        setError(`Failed to load actions: ${err.message}`)
      })
      .finally(() => setLoading(false))
  }, [careerId])

  if (loading) {
    return (
      <div style={{ animation: 'fadeIn 0.6s ease' }}>
        <div className="spinner" style={{ width: '32px', height: '32px' }}></div>
        <p style={{ marginTop: '12px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Loading actions...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        background: 'rgba(255, 107, 53, 0.1)',
        border: '1px solid rgba(255, 107, 53, 0.5)',
        borderRadius: '8px',
        padding: '16px',
        color: '#FF6B35',
        animation: 'fadeIn 0.6s ease'
      }}>
        <p style={{ margin: 0, fontWeight: '600' }}>⚠️ {error}</p>
      </div>
    )
  }

  if (!actions || !actions.available) {
    return (
      <div style={{
        background: 'rgba(100, 200, 255, 0.1)',
        border: '1px solid rgba(0, 217, 255, 0.3)',
        borderRadius: '8px',
        padding: '16px',
        color: 'var(--text-secondary)',
        animation: 'fadeIn 0.6s ease'
      }}>
        <p style={{ margin: 0 }}>No actions available for this career.</p>
      </div>
    )
  }

  const { action_categories = {}, nba_attributes = {} } = actions
  const categoryList = Object.entries(action_categories).filter(([_, chips]) => chips && chips.length > 0)

  return (
    <div style={{ animation: 'fadeIn 0.6s ease' }}>
      {/* Category List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {categoryList.map(([category, chips], idx) => {
          const isExpanded = expandedCategory === category
          const color = CATEGORY_COLORS[category] || 'var(--primary)'
          
          // Format category name for display
          const displayName = category
            .replace(/_/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/^./, str => str.toUpperCase())

          return (
            <div
              key={category}
              style={{
                border: `1px solid ${color}40`,
                borderRadius: '12px',
                overflow: 'hidden',
                animation: `fadeInUp 0.${5 + (idx % 3)}s ease`,
                transition: 'all 0.3s ease'
              }}
            >
              {/* Category Header */}
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: `${color}15`,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s ease',
                  color: color,
                  fontWeight: '600'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${color}25`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `${color}15`
                }}
              >
                <span>
                  {category === 'universal' && '🎯'}
                  {category === 'exam_based' && '📝'}
                  {category === 'degree_based' && '🎓'}
                  {category === 'diploma_based' && '📜'}
                  {category === 'govt_based' && '🏛️'}
                  {category === 'medical_based' && '⚕️'}
                  {category === 'skill_based' && '🛠️'}
                  {category === 'finance_based' && '💼'}
                  {' '}{displayName} ({chips.length})
                </span>
                <span style={{
                  fontSize: '1.2rem',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}>
                  ▼
                </span>
              </button>

              {/* Category Chips */}
              {isExpanded && (
                <div style={{
                  padding: '16px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  background: `${color}08`,
                  borderTop: `1px solid ${color}40`,
                  animation: 'slideDown 0.3s ease'
                }}>
                  {chips.map((chip, chipIdx) => (
                    <ActionChip
                      key={`${category}-${chipIdx}`}
                      chip={chip}
                      color={color}
                      careerId={careerId}
                      actionId={chip.id}
                      delay={chipIdx * 0.05}
                      onNavigate={() => {
                        if (chip.id) {
                          // Navigate to action detail page using React Router
                          nav(`/action/${chip.id}`)
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Attributes Info */}
      {Object.keys(nba_attributes).length > 0 && (
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(0, 217, 255, 0.08)',
          border: '1px solid rgba(0, 217, 255, 0.2)',
          borderRadius: '8px',
          animation: 'fadeIn 0.8s ease'
        }}>
          <h4 style={{ color: 'var(--primary)', marginTop: 0, marginBottom: '12px' }}>
            📊 Career Attributes
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(nba_attributes)
              .filter(([key, value]) => {
                // Only show boolean attributes and exam_types array
                return typeof value === 'boolean' || key === 'exam_types'
              })
              .map(([key, value]) => {
                if (typeof value === 'boolean') {
                  return value ? (
                    <span
                      key={key}
                      style={{
                        background: 'rgba(0, 217, 255, 0.2)',
                        border: '1px solid rgba(0, 217, 255, 0.4)',
                        color: 'var(--primary)',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 217, 255, 0.3)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 217, 255, 0.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 217, 255, 0.2)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      ✓ {key.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')}
                    </span>
                  ) : null
                } else if (key === 'exam_types' && Array.isArray(value)) {
                  return (
                    <span key={key} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Exams: {value.map(e => e.replace(/_/g, ' ')).join(', ')}
                    </span>
                  )
                }
                return null
              })}
          </div>
        </div>
      )}
    </div>
  )
}

// Individual action chip component - Direct navigation to action detail
function ActionChip({ chip, color, onNavigate, delay = 0 }) {
  return (
    <button
      onClick={onNavigate}
      style={{
        background: 'var(--bg-darker)',
        border: `1.5px solid ${color}`,
        color: 'var(--text-primary)',
        padding: '8px 14px',
        borderRadius: '20px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        whiteSpace: 'nowrap',
        animation: `fadeInUp 0.5s ease-out ${delay}s backwards`
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = color
        e.currentTarget.style.color = 'var(--bg-darker)'
        e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)'
        e.currentTarget.style.boxShadow = `0 6px 16px ${color}50`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--bg-darker)'
        e.currentTarget.style.color = 'var(--text-primary)'
        e.currentTarget.style.transform = 'translateY(0) scale(1)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <span style={{ fontSize: '1.1em' }}>{chip.icon || '→'}</span>
      <span>{chip.title || chip.name || 'Action'}</span>
      <span style={{ marginLeft: '2px' }}>→</span>
    </button>
  )
}
