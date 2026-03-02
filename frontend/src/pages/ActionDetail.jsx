import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getUserProgress } from '../utils/userProgress'
import { API_BASE } from '../utils/apiConfig'
import { BotHero } from './Onboarding'

// Map action IDs to detailed metadata
const ACTION_METADATA = {
  'eligibility_checklist': {
    title: 'Eligibility Checklist',
    icon: '✓',
    category: 'universal',
    color: '#00D9FF',
    fullDescription: 'Verify if you meet all the requirements and prerequisites for this career path.',
    keyPoints: [
      'Educational qualifications needed',
      'Age and experience requirements',
      'Certification or licensing needs',
      'Specific skill prerequisites'
    ],
    resources: [
      { name: 'Official Guidelines', type: 'document' },
      { name: 'Eligibility Calculator', type: 'tool' }
    ],
    timeline: 'Check before applying',
    difficulty: 'Easy',
    importance: 'Critical'
  },
  'compare_similar': {
    title: 'Compare Similar Careers',
    icon: '⚖',
    category: 'universal',
    color: '#00D9FF',
    fullDescription: 'Discover how this career compares to related options. Understand the differences in salary, job market, growth potential, and lifestyle.',
    keyPoints: [
      'Salary comparison',
      'Job market demand',
      'Growth potential',
      'Work-life balance',
      'Required skills overlap'
    ],
    resources: [
      { name: 'Career Comparison Tool', type: 'tool' },
      { name: 'Market Analysis Report', type: 'document' },
      { name: 'Salary Data', type: 'data' }
    ],
    timeline: 'Before final decision',
    difficulty: 'Easy',
    importance: 'High'
  },
  'failure_recovery': {
    title: 'What If I Fail?',
    icon: '🔄',
    category: 'universal',
    color: '#00D9FF',
    fullDescription: 'Explore backup options and recovery paths if your primary exam or entrance attempt doesn\'t succeed.',
    keyPoints: [
      'Repeat attempt strategies',
      'Alternative exam options',
      'Related career pivots',
      'Gap year planning',
      'Skill building options'
    ],
    resources: [
      { name: 'Backup Plan Template', type: 'tool' },
      { name: 'Recovery Strategies Guide', type: 'document' },
      { name: 'Coaching Centers', type: 'directory' }
    ],
    timeline: 'Plan before attempting',
    difficulty: 'Medium',
    importance: 'Very High'
  },
  'alternate_paths': {
    title: 'Alternate Paths to This Career',
    icon: '🛤',
    category: 'universal',
    color: '#00D9FF',
    fullDescription: 'Explore different routes and strategies to reach the same career goal. Not all paths are the same!',
    keyPoints: [
      'Direct entry route',
      'Lateral entry options',
      'Indirect career paths',
      'International routes',
      'Self-taught alternatives'
    ],
    resources: [
      { name: 'Career Pathway Map', type: 'diagram' },
      { name: 'Route Comparison Guide', type: 'document' },
      { name: 'Success Stories', type: 'video' }
    ],
    timeline: 'During decision-making',
    difficulty: 'Medium',
    importance: 'High'
  },
  'exam_eligibility': {
    title: 'Exam Eligibility & Attempts',
    icon: '📋',
    category: 'exam_based',
    color: '#FF6B35',
    fullDescription: 'Understand the eligibility criteria, number of attempts, age limits, and registration requirements for this entrance exam.',
    keyPoints: [
      'Minimum educational qualification',
      'Age eligibility range',
      'Number of allowed attempts',
      'Validity period of score',
      'Registration process and fees'
    ],
    resources: [
      { name: 'Official Notification', type: 'document' },
      { name: 'Application Portal', type: 'website' },
      { name: 'FAQ Guide', type: 'document' },
      { name: 'Eligibility Checker', type: 'tool' }
    ],
    timeline: 'Check before registration',
    difficulty: 'Easy',
    importance: 'Critical'
  },
  'syllabus_timeline': {
    title: 'Syllabus & Prep Timeline',
    icon: '📚',
    category: 'exam_based',
    color: '#FF6B35',
    fullDescription: 'Get detailed information about the exam syllabus, important topics, and recommended preparation timeline.',
    keyPoints: [
      'Topics covered in each section',
      'Weightage of different topics',
      'Recommended prep duration',
      'Study materials and resources',
      'Success rate and cutoff trends'
    ],
    resources: [
      { name: 'Official Syllabus PDF', type: 'document' },
      { name: 'Topic-wise Guide', type: 'document' },
      { name: 'Recommended Books', type: 'list' },
      { name: 'Online Courses', type: 'course' },
      { name: 'Practice Tests', type: 'tool' }
    ],
    timeline: '6-12 months before exam',
    difficulty: 'High',
    importance: 'Critical'
  },
  'alternate_exams': {
    title: 'Alternate Exams Available',
    icon: '🔀',
    category: 'exam_based',
    color: '#FF6B35',
    fullDescription: 'Discover other entrance exams that can lead to similar or related careers.',
    keyPoints: [
      'Alternative exam options',
      'Different difficulty levels',
      'Unique features of each exam',
      'Colleges accepting each exam',
      'Outcome comparison'
    ],
    resources: [
      { name: 'Exam Comparison Tool', type: 'tool' },
      { name: 'List of Accepting Colleges', type: 'directory' },
      { name: 'Career Mapping Chart', type: 'diagram' }
    ],
    timeline: 'Before finalizing exam choice',
    difficulty: 'Medium',
    importance: 'High'
  },
  'degree_structure': {
    title: 'Degree Duration & Structure',
    icon: '🎓',
    category: 'degree_based',
    color: '#4ECDC4',
    fullDescription: 'Learn about the academic structure, duration, specializations, and course offerings.',
    keyPoints: [
      'Total duration (3/4/5 years)',
      'Semester-wise breakdown',
      'Core vs elective courses',
      'Specialization options',
      'Internship requirements',
      'Final project/thesis'
    ],
    resources: [
      { name: 'Course Curriculum PDF', type: 'document' },
      { name: 'Syllabus by Year', type: 'document' },
      { name: 'College Comparison Tool', type: 'tool' },
      { name: 'Specialization Guide', type: 'document' }
    ],
    timeline: 'Before admission',
    difficulty: 'Easy',
    importance: 'High'
  },
  'career_roles': {
    title: 'Career Roles After Graduation',
    icon: '💼',
    category: 'degree_based',
    color: '#4ECDC4',
    fullDescription: 'Explore the types of jobs and roles available after completing this degree.',
    keyPoints: [
      'Job titles and roles',
      'Industry sectors hiring',
      'Starting salary ranges',
      'Career growth path',
      'Top recruiters',
      'Skills demanded'
    ],
    resources: [
      { name: 'Job Market Report', type: 'document' },
      { name: 'Alumni Network', type: 'directory' },
      { name: 'Internship Database', type: 'tool' },
      { name: 'Salary Survey', type: 'data' },
      { name: 'Success Stories', type: 'video' }
    ],
    timeline: 'During final year',
    difficulty: 'Easy',
    importance: 'High'
  },
  'higher_studies': {
    title: 'Higher Studies & Specialization',
    icon: '🎯',
    category: 'degree_based',
    color: '#4ECDC4',
    fullDescription: 'Discover master\'s programs, PhD options, and specialized certifications after your undergraduate degree.',
    keyPoints: [
      'Available masters programs',
      'PhD and research options',
      'Specialization tracks',
      'International opportunities',
      'Funding and scholarships',
      'Admission requirements'
    ],
    resources: [
      { name: 'Masters Program Directory', type: 'directory' },
      { name: 'Research Opportunities', type: 'list' },
      { name: 'Scholarship Database', type: 'tool' },
      { name: 'University Rankings', type: 'data' }
    ],
    timeline: 'Final year onwards',
    difficulty: 'Medium',
    importance: 'High'
  },
  'exit_options': {
    title: 'Exit Options During Degree',
    icon: '🚪',
    category: 'degree_based',
    color: '#4ECDC4',
    fullDescription: 'Learn if you can pause or exit early from your degree, and what credentials you\'d receive.',
    keyPoints: [
      'Exit after year 1 or 2',
      'Intermediate credentials available',
      'Job market value of early exit',
      'Readmission possibilities',
      'Career options with partial degree'
    ],
    resources: [
      { name: 'College Exit Policy', type: 'document' },
      { name: 'Credential Equivalence Guide', type: 'document' },
      { name: 'Career Options Guide', type: 'document' }
    ],
    timeline: 'Before enrollment',
    difficulty: 'Easy',
    importance: 'Medium'
  },
  'required_skills': {
    title: 'Required Technical Skills',
    icon: '🛠',
    category: 'skill_based',
    color: '#FFD460',
    fullDescription: 'Identify the essential technical and soft skills needed to succeed in this career.',
    keyPoints: [
      'Core technical skills',
      'Programming languages',
      'Tools and platforms',
      'Soft skills needed',
      'Nice-to-have skills',
      'Skill development timeline'
    ],
    resources: [
      { name: 'Skill Development Roadmap', type: 'document' },
      { name: 'Online Courses', type: 'course' },
      { name: 'Practice Projects', type: 'tool' },
      { name: 'Certification Path', type: 'document' },
      { name: 'Skill Assessment Tool', type: 'tool' }
    ],
    timeline: 'Start learning immediately',
    difficulty: 'High',
    importance: 'Critical'
  },
  'entry_jobs': {
    title: 'Entry-Level Job Positions',
    icon: '🚀',
    category: 'skill_based',
    color: '#FFD460',
    fullDescription: 'Discover typical first jobs and entry-level positions in this career field.',
    keyPoints: [
      'Common first job titles',
      'Typical salary ranges',
      'Companies actively hiring',
      'Required experience',
      'Job location trends',
      'Growth to next level'
    ],
    resources: [
      { name: 'Job Search Portals', type: 'website' },
      { name: 'Company List', type: 'directory' },
      { name: 'Resume Template', type: 'document' },
      { name: 'Interview Guide', type: 'document' },
      { name: 'Salary Data', type: 'data' }
    ],
    timeline: 'Final month of preparation',
    difficulty: 'Medium',
    importance: 'High'
  },
  'certifications': {
    title: 'Recommended Certifications',
    icon: '📜',
    category: 'skill_based',
    color: '#FFD460',
    fullDescription: 'Explore certifications that boost your resume and increase your market value.',
    keyPoints: [
      'Essential certifications',
      'Value-added certifications',
      'Difficulty and duration',
      'Cost and availability',
      'Job market relevance',
      'Renewal requirements'
    ],
    resources: [
      { name: 'Certification Roadmap', type: 'diagram' },
      { name: 'Training Providers', type: 'directory' },
      { name: 'Cost Comparison', type: 'data' },
      { name: 'Preparation Guide', type: 'document' },
      { name: 'Community Discussion', type: 'forum' }
    ],
    timeline: 'During and after college',
    difficulty: 'Medium',
    importance: 'High'
  },
  'freelance_vs_job': {
    title: 'Career Flexibility & Options',
    icon: '💻',
    category: 'skill_based',
    color: '#FFD460',
    fullDescription: 'Understand whether this career supports freelance work, entrepreneurship, or traditional employment.',
    keyPoints: [
      'Full-time employment options',
      'Freelance/contract work potential',
      'Entrepreneurship opportunities',
      'Hybrid work possibilities',
      'Income stability comparison',
      'Pros and cons of each'
    ],
    resources: [
      { name: 'Career Model Analysis', type: 'document' },
      { name: 'Freelance Platform Guide', type: 'document' },
      { name: 'Startup Success Stories', type: 'video' },
      { name: 'Income Comparison', type: 'data' }
    ],
    timeline: 'Before job search',
    difficulty: 'Easy',
    importance: 'High'
  },
  'service_hierarchy': {
    title: 'Government Service Hierarchy',
    icon: '🏛',
    category: 'govt_based',
    color: '#6A4C93',
    fullDescription: 'Understand the rank structure, promotional pathways, and career progression in government service.',
    keyPoints: [
      'Ranks and positions',
      'Salary progression',
      'Promotion timelines',
      'Posting locations',
      'Training and development',
      'Seniority benefits'
    ],
    resources: [
      { name: 'Official Career Handbook', type: 'document' },
      { name: 'Rank Structure Chart', type: 'diagram' },
      { name: 'Salary Scale Information', type: 'data' },
      { name: 'Training Institutions', type: 'directory' }
    ],
    timeline: 'Before application',
    difficulty: 'Easy',
    importance: 'Critical'
  },
  'posting_growth': {
    title: 'Posting & Career Growth',
    icon: '📈',
    category: 'govt_based',
    color: '#6A4C93',
    fullDescription: 'Learn about postings, transfers, and the career growth trajectory in government jobs.',
    keyPoints: [
      'Geographic posting patterns',
      'Transfer policies',
      'Promotion timelines',
      'Premium postings (metro vs rural)',
      'Departmental preferences',
      'Long-term growth path'
    ],
    resources: [
      { name: 'Posting Guidelines', type: 'document' },
      { name: 'Transfer Rules', type: 'document' },
      { name: 'Posting Data by Year', type: 'data' },
      { name: 'Career Stories from Officers', type: 'video' }
    ],
    timeline: 'Understand before joining',
    difficulty: 'Medium',
    importance: 'High'
  },
  'other_govt_exams': {
    title: 'Related Government Exams',
    icon: '📝',
    category: 'govt_based',
    color: '#6A4C93',
    fullDescription: 'Explore other government exams you could attempt with similar qualifications.',
    keyPoints: [
      'State vs Central exams',
      'Different service types',
      'Eligibility overlap',
      'Preparation overlap',
      'Career outcomes comparison',
      'Combined strategy'
    ],
    resources: [
      { name: 'Government Exam Comparison', type: 'tool' },
      { name: 'Eligibility Mapping', type: 'document' },
      { name: 'Preparation Strategy', type: 'document' },
      { name: 'Success Rate Data', type: 'data' }
    ],
    timeline: 'Plan career strategy early',
    difficulty: 'High',
    importance: 'High'
  }
}

export default function ActionDetail() {
  const { actionId } = useParams()
  const nav = useNavigate()
  const [metadata, setMetadata] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userProgress] = useState(getUserProgress())

  useEffect(() => {
    if (!actionId) return

    setLoading(true)
    
    // Get metadata from local mapping
    const actionMeta = ACTION_METADATA[actionId]
    
    if (actionMeta) {
      setMetadata(actionMeta)
      setLoading(false)
    } else {
      // If not found, show generic message
      setMetadata({
        title: 'Action Details',
        icon: '→',
        category: 'unknown',
        color: '#00D9FF',
        fullDescription: 'This action will take you to detailed information about your career path.',
        keyPoints: [],
        resources: [],
        timeline: 'See endpoint for details',
        difficulty: 'Unknown',
        importance: 'Unknown'
      })
      setLoading(false)
    }
  }, [actionId])

  if (loading) {
    return (
      <div className="page">
        <div className="loading" style={{ animation: 'fadeIn 0.6s ease' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
            Loading action details...
          </p>
        </div>
      </div>
    )
  }

  if (!metadata) {
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
          <p style={{ color: 'var(--text-secondary)' }}>Action not found</p>
        </div>
      </div>
    )
  }

  const categoryEmoji = {
    'universal': '🎯',
    'exam_based': '📝',
    'degree_based': '🎓',
    'diploma_based': '📜',
    'govt_based': '🏛️',
    'medical_based': '⚕️',
    'skill_based': '🛠️',
    'finance_based': '💼'
  }

  return (
    <div className="page">
      {/* Bot Hero - Action Progress - Compact Corner */}
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
          message="Action! ✅"
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

      {/* Action Header */}
      <div
        className="explain-card"
        style={{
          animation: 'slideInUp 0.5s ease',
          marginBottom: '24px',
          borderLeft: `5px solid ${metadata.color}`
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '2.5rem' }}>{metadata.icon}</span>
          <div>
            <h1
              style={{
                color: 'var(--primary)',
                marginTop: 0,
                marginBottom: '4px',
                fontSize: '2rem',
                fontWeight: 'bold'
              }}>
              {metadata.title}
            </h1>
            <span
              style={{
                background: `${metadata.color}20`,
                border: `1px solid ${metadata.color}`,
                color: metadata.color,
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: '600',
                display: 'inline-block'
              }}>
              {categoryEmoji[metadata.category]} {metadata.category.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <p
          style={{
            fontSize: '1.05rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            marginBottom: '20px',
            animation: 'fadeIn 0.7s ease'
          }}>
          {metadata.fullDescription}
        </p>

        {/* Key Details */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            animation: 'fadeIn 0.8s ease'
          }}>
          <div
            style={{
              background: 'rgba(0, 217, 255, 0.1)',
              border: '1px solid rgba(0, 217, 255, 0.2)',
              borderRadius: '8px',
              padding: '12px'
            }}>
            <p style={{ margin: '0 0 4px 0', color: 'var(--primary)', fontWeight: '600', fontSize: '0.85rem' }}>
              DIFFICULTY
            </p>
            <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>
              {metadata.difficulty}
            </p>
          </div>
          <div
            style={{
              background: 'rgba(255, 107, 53, 0.1)',
              border: '1px solid rgba(255, 107, 53, 0.2)',
              borderRadius: '8px',
              padding: '12px'
            }}>
            <p style={{ margin: '0 0 4px 0', color: '#FF6B35', fontWeight: '600', fontSize: '0.85rem' }}>
              IMPORTANCE
            </p>
            <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>
              {metadata.importance}
            </p>
          </div>
          <div
            style={{
              background: 'rgba(78, 205, 196, 0.1)',
              border: '1px solid rgba(78, 205, 196, 0.2)',
              borderRadius: '8px',
              padding: '12px'
            }}>
            <p style={{ margin: '0 0 4px 0', color: '#4ECDC4', fontWeight: '600', fontSize: '0.85rem' }}>
              TIMELINE
            </p>
            <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>
              {metadata.timeline}
            </p>
          </div>
        </div>
      </div>

      {/* Key Points */}
      {metadata.keyPoints && metadata.keyPoints.length > 0 && (
        <div
          className="explain-card"
          style={{
            animation: 'slideInUp 0.6s ease',
            marginBottom: '24px'
          }}>
          <h3
            style={{
              color: 'var(--primary)',
              marginTop: 0,
              fontSize: '1.25rem'
            }}>
            📌 Key Points to Know
          </h3>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
            {metadata.keyPoints.map((point, idx) => (
              <li
                key={idx}
                style={{
                  background: `linear-gradient(135deg, ${metadata.color}10, ${metadata.color}05)`,
                  border: `1px solid ${metadata.color}20`,
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  animation: `fadeInUp 0.${6 + (idx % 3)}s ease`,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${metadata.color}15`
                  e.currentTarget.style.transform = 'translateX(4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${metadata.color}10, ${metadata.color}05)`
                  e.currentTarget.style.transform = 'translateX(0)'
                }}>
                <span style={{ color: metadata.color, fontWeight: 'bold' }}>✓</span>
                <span style={{ color: 'var(--text-secondary)' }}>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Resources */}
      {metadata.resources && metadata.resources.length > 0 && (
        <div
          className="explain-card"
          style={{
            animation: 'slideInUp 0.7s ease',
            marginBottom: '24px'
          }}>
          <h3
            style={{
              color: 'var(--primary)',
              marginTop: 0,
              fontSize: '1.25rem'
            }}>
            🎓 Resources & Tools
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '12px'
            }}>
            {metadata.resources.map((resource, idx) => {
              const typeIcons = {
                'document': '📄',
                'tool': '🔧',
                'website': '🌐',
                'course': '📚',
                'video': '📹',
                'data': '📊',
                'directory': '📖',
                'diagram': '📐',
                'list': '📋',
                'forum': '💬'
              }
              return (
                <div
                  key={idx}
                  style={{
                    background: `${metadata.color}10`,
                    border: `1px solid ${metadata.color}40`,
                    borderRadius: '12px',
                    padding: '16px',
                    animation: `fadeInUp 0.${6 + (idx % 3)}s ease`,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${metadata.color}20`
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = `0 8px 16px ${metadata.color}30`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `${metadata.color}10`
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
                    {typeIcons[resource.type] || '→'}
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '4px'
                    }}>
                    {resource.name}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)'
                    }}>
                    {resource.type}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div
        className="explain-card"
        style={{
          animation: 'slideInUp 0.8s ease',
          background: `linear-gradient(135deg, ${metadata.color}15, ${metadata.color}05)`,
          border: `2px solid ${metadata.color}`
        }}>
        <h3
          style={{
            color: 'var(--primary)',
            marginTop: 0,
            fontSize: '1.25rem'
          }}>
          🎯 Next Steps
        </h3>
        <ol
          style={{
            margin: 0,
            paddingLeft: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
          <li style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Review the key points above to understand what this action entails
          </li>
          <li style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Explore the recommended resources to gather more information
          </li>
          <li style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Take action during the recommended timeline for best results
          </li>
          <li style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Track your progress and revisit this action as needed
          </li>
        </ol>
      </div>

      {/* Back button at bottom */}
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <button
          onClick={() => nav(-1)}
          className="btn"
          style={{
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05) translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
          ← Back to Career Details
        </button>
      </div>
    </div>
  )
}
