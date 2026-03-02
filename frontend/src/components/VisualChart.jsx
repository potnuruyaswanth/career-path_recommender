import React, {useEffect, useState, useMemo} from 'react'
import { API_BASE } from '../utils/apiConfig'

function groupNodesByType(nodes){
  const groups = {education:[], stream:[], stream_variant:[], course:[], career:[]}
  Object.values(nodes).forEach(n => {
    const t = n.type
    if(t === 'education_level') groups.education.push(n)
    else if(t === 'stream') groups.stream.push(n)
    else if(t === 'stream_variant') groups.stream_variant.push(n)
    else if(t === 'course') groups.course.push(n)
    else if(t === 'career') groups.career.push(n)
  })
  return groups
}

export default function VisualChart({onSelect, onCareerClick}){
  const [graph, setGraph] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    setLoading(true)
    setError(null)
    console.log('VisualChart: Fetching graph from', API_BASE)
    fetch(`${API_BASE}/graph`)
      .then(r=>{
        console.log('Graph response:', r.ok, r.status)
        if(!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data=>{
        console.log('Graph data received:', data)
        setGraph(data)
      })
      .catch(err=>{
        console.error('Graph fetch error:', err)
        setError(err.message)
      })
      .finally(()=>setLoading(false))
  },[])

  const layout = useMemo(()=>{
    if(!graph) return null
    const groups = groupNodesByType(graph.nodes)
    const cols = [groups.education, groups.stream, groups.stream_variant, groups.course, groups.career]
    const colX = cols.map((c,i)=> 160 + i*220)
    const positions = {}
    cols.forEach((col,i)=>{
      const gap = Math.max(60, Math.floor(480 / (col.length+1)))
      col.forEach((node,j)=>{
        const x = colX[i]
        const y = 80 + j * gap
        positions[node.id] = {x,y, node}
      })
    })
    return {positions, edges: graph.edges}
  },[graph])

  if(loading) {
    return <div className="loading"><div className="spinner"></div><p>Loading graph data...</p></div>
  }
  if(error) {
    return <div className="loading"><p style={{color: '#ff6b6b'}}>Error: {error}</p></div>
  }
  if(!layout) return <div className="loading"><p>No chart data available</p></div>

  const width = 1200
  const height = 700

  const getNodeColor = (type) => {
    const colors = {
      education_level: '#00d9ff',
      stream: '#a78bfa',
      stream_variant: '#ff006e',
      course: '#fbbf24',
      career: '#10b981'
    }
    return colors[type] || '#00d9ff'
  }

  const getNodeGradient = (type) => {
    const gradients = {
      education_level: 'url(#gradient-cyan)',
      stream: 'url(#gradient-purple)',
      stream_variant: 'url(#gradient-pink)',
      course: 'url(#gradient-yellow)',
      career: 'url(#gradient-green)'
    }
    return gradients[type] || 'url(#gradient-cyan)'
  }

  return (
    <div className="visual-chart">
      <svg viewBox={`0 0 ${width} ${height}`} style={{width:'100%',height:height, minHeight:height}}>
        <defs>
          <linearGradient id="gradient-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:'#00d9ff',stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#00a8cc',stopOpacity:1}} />
          </linearGradient>
          <linearGradient id="gradient-purple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:'#a78bfa',stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#8b5cf6',stopOpacity:1}} />
          </linearGradient>
          <linearGradient id="gradient-pink" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:'#ff006e',stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#c41e3a',stopOpacity:1}} />
          </linearGradient>
          <linearGradient id="gradient-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:'#fbbf24',stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#f59e0b',stopOpacity:1}} />
          </linearGradient>
          <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:'#10b981',stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#059669',stopOpacity:1}} />
          </linearGradient>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#00d9ff" opacity="0.6" />
          </marker>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* edges */}
        {layout.edges.map((e,idx)=>{
          const from = layout.positions[e.from]
          const to = layout.positions[e.to]
          if(!from || !to) return null
          const sx = from.x + 80
          const sy = from.y + 16
          const tx = to.x - 16
          const ty = to.y + 16
          const path = `M ${sx} ${sy} C ${(sx+tx)/2} ${sy}, ${(sx+tx)/2} ${ty}, ${tx} ${ty}`
          return <path key={idx} d={path} stroke="#00d9ff" strokeWidth="2" fill="none" markerEnd="url(#arrow)" opacity="0.4" />
        })}

        {/* nodes */}
        {Object.values(layout.positions).map((p)=> (
          <g key={p.node.id} transform={`translate(${p.x},${p.y})`} style={{cursor:'pointer'}} onClick={()=>{
            onSelect && onSelect(p.node)
            if(p.node.type === 'career' && onCareerClick) {
              onCareerClick(p.node)
            }
          }}>
            <rect x={0} y={0} width={160} height={40} rx={10} fill={getNodeGradient(p.node.type)} stroke={getNodeColor(p.node.type)} strokeWidth="2" filter="url(#glow)" opacity="0.8" style={{transition:'all 0.3s ease', cursor: p.node.type === 'career' ? 'pointer' : 'default'}} />
            <text x={12} y={24} fontSize={12} fill="#ffffff" fontWeight="600" style={{pointerEvents:'none'}}>{p.node.display_name}</text>
            <rect x={0} y={0} width={160} height={40} rx={10} fill="none" stroke={getNodeColor(p.node.type)} strokeWidth="2" opacity="0" style={{animation:'pulse-border 2s ease-in-out infinite'}} />
          </g>
        ))}
      </svg>
    </div>
  )
}
