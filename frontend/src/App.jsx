import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { getUserStats, resetAllProgress } from './utils/userProgress'

export default function App(){
  const [stats] = useState(getUserStats())
  const [showStats, setShowStats] = useState(false)

  const handleResetProgress = () => {
    if (resetAllProgress()) {
      window.location.reload()
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <img src="/cpn-logo.svg" alt="Career Path Navigator" style={{ width: '56px', height: '56px', borderRadius: '12px' }} />
          <div>
            <h1 style={{ margin: '0 0 4px 0' }}>Career Path Navigator</h1>
            <p style={{ margin: 0, fontSize: '0.9em', color: 'rgba(255,255,255,0.7)' }}>AI-Powered Career Guidance</p>
          </div>
        </div>
        <p>Explore your future with AI-powered career path guidance. Discover streams, courses, and careers aligned with your aspirations.</p>
        <Link to="/explore" className="btn">Start Exploring →</Link>
      </header>

      {/* User Stats & Settings */}
      <div style={{
        maxWidth: '1000px',
        margin: '40px auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        {/* Stats Card */}
        {stats.completedOnboarding && (
          <div style={{
            background: 'rgba(0, 217, 255, 0.05)',
            border: '1px solid rgba(0, 217, 255, 0.2)',
            borderRadius: '12px',
            padding: '20px',
            transition: 'all 0.3s ease'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)'
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 217, 255, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.2)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}>
            <h3 style={{ color: 'var(--primary)', marginTop: 0 }}>📊 Your Progress</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Interests Selected</p>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalInterests}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Careers Explored</p>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.careersViewed}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Last Active</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {stats.lastActive ? new Date(stats.lastActive).toLocaleDateString() : 'Today'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div style={{
          background: 'rgba(0, 217, 255, 0.05)',
          border: '1px solid rgba(0, 217, 255, 0.2)',
          borderRadius: '12px',
          padding: '20px',
          transition: 'all 0.3s ease'
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)'
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 217, 255, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.2)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}>
          <h3 style={{ color: 'var(--primary)', marginTop: 0 }}>🚀 Quick Links</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link to="/onboarding" style={{
              color: 'var(--primary)',
              textDecoration: 'none',
              padding: '8px 12px',
              background: 'rgba(0, 217, 255, 0.1)',
              borderRadius: '6px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              border: '1px solid transparent'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 217, 255, 0.2)'
                e.currentTarget.style.borderColor = 'var(--primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 217, 255, 0.1)'
                e.currentTarget.style.borderColor = 'transparent'
              }}>
              → Onboarding
            </Link>
            <Link to="/explore" style={{
              color: 'var(--primary)',
              textDecoration: 'none',
              padding: '8px 12px',
              background: 'rgba(0, 217, 255, 0.1)',
              borderRadius: '6px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              border: '1px solid transparent'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 217, 255, 0.2)'
                e.currentTarget.style.borderColor = 'var(--primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 217, 255, 0.1)'
                e.currentTarget.style.borderColor = 'transparent'
              }}>
              → Explore Careers
            </Link>
          </div>
        </div>

        {/* Settings */}
        <div style={{
          background: 'rgba(0, 217, 255, 0.05)',
          border: '1px solid rgba(0, 217, 255, 0.2)',
          borderRadius: '12px',
          padding: '20px',
          transition: 'all 0.3s ease'
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)'
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 217, 255, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.2)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}>
          <h3 style={{ color: 'var(--primary)', marginTop: 0 }}>⚙️ Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => setShowStats(!showStats)} style={{
              background: 'transparent',
              border: '1px solid var(--primary)',
              color: 'var(--primary)',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 217, 255, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}>
              {showStats ? '✕ Hide Stats' : '📈 Show Stats'}
            </button>
            <button onClick={handleResetProgress} style={{
              background: 'rgba(255, 107, 53, 0.1)',
              border: '1px solid rgba(255, 107, 53, 0.5)',
              color: '#FF6B35',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 107, 53, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 107, 53, 0.1)'
              }}>
              🔄 Reset Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
