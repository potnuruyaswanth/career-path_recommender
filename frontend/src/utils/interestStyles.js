// Shared styling for interest buttons used across all pages
export const INTERESTS = [
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

export const getInterestButtonStyle = (interest, isSelected, color) => ({
  padding: '16px 28px',
  borderRadius: '28px',
  border: `3px solid ${isSelected ? color : 'var(--border)'}`,
  background: isSelected ? `linear-gradient(135deg, ${color}20, ${color}40)` : 'rgba(255, 255, 255, 0.05)',
  color: isSelected ? color : 'var(--text-secondary)',
  cursor: 'pointer',
  fontSize: '1.15rem',
  fontWeight: '700',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  fontFamily: 'Inter, sans-serif',
  position: 'relative',
  zIndex: 10,
  transform: isSelected ? 'scale(1.08)' : 'scale(1)',
  boxShadow: isSelected ? `0 6px 20px ${color}60` : 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
})

export const getInterestHoverStyle = (color, isSelected) => ({
  onMouseEnter: (e) => {
    e.target.style.transform = 'scale(1.12) translateY(-3px)'
    e.target.style.borderColor = color
    e.target.style.color = color
    e.target.style.boxShadow = `0 8px 24px ${color}60`
  },
  onMouseLeave: (e) => {
    e.target.style.transform = isSelected ? 'scale(1.08)' : 'scale(1)'
    e.target.style.borderColor = isSelected ? color : 'var(--border)'
    e.target.style.color = isSelected ? color : 'var(--text-secondary)'
    e.target.style.boxShadow = isSelected ? `0 6px 20px ${color}60` : 'none'
  }
})
