import React, { useState, useRef, useEffect } from 'react'
import { API_BASE } from '../utils/apiConfig'

export default function CareerChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm your Career Assistant. I can help with:

📚 **Search & Info:**
• Search careers, streams, exams, courses
• Get details on any career path
• Find entrance exam information

🎯 **Guidance:**
• Career eligibility requirements
• Step-by-step career paths  
• Stream recommendations (Class 10/12)
• Career roadmaps & alternatives

Try asking:
• 'Tell me about CA'
• 'What streams are available?'
• 'Search for engineering careers'
• 'What exams do I need for MBBS?'
• 'Am I eligible for civil services?'

Or use our Onboarding Tool for personalized recommendations! ✓`
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      console.log('Sending request to:', `${API_BASE}/chatbot/ask`)
      const response = await fetch(`${API_BASE}/chatbot/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage })
      })

      console.log('Response status:', response.status)
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error(`Failed to get response: ${response.status}`)
      }

      const data = await response.json()
      console.log('Received data:', data)
      
      // Enhanced response with metadata
      const answerContent = data.answer || 'Sorry, I couldn\'t process that request.'
      
      // Add verified badge if response is from verified data
      const verifiedBadge = data.verified ? ' ✓' : ''
      const gptEnhanced = data.metadata?.gpt_enhanced ? ' 🤖' : ''
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: answerContent,
        verified: data.verified,
        type: data.type,
        intent: data.intent,
        badges: verifiedBadge + gptEnhanced
      }])
    } catch (error) {
      console.error('Chatbot error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I\'m having trouble connecting. Please try again later.' 
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chatbot-toggle"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          border: 'none',
          color: 'white',
          fontSize: '28px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          animation: 'bounce-subtle 2s ease-in-out infinite'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.15)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)'
          e.currentTarget.style.animation = 'none'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'
          e.currentTarget.style.animation = 'bounce-subtle 2s ease-in-out infinite'
        }}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="chatbot-window"
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '24px',
            width: '380px',
            height: '500px',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'chatbotEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), chatbotPulse 2s ease-in-out infinite',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              padding: '16px 20px',
              color: 'white',
              fontWeight: '600',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span style={{ 
              display: 'inline-block',
              animation: 'robotWave 1s ease-in-out 3'
            }}>🤖</span>
            Career Assistant
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: msg.role === 'user' 
                    ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
                    : msg.verified 
                      ? 'rgba(34, 197, 94, 0.15)'  // Green tint for verified
                      : 'rgba(255,255,255,0.1)',
                  border: msg.verified ? '1px solid rgba(34, 197, 94, 0.3)' : 'none',
                  color: 'white',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  wordWrap: 'break-word',
                  animation: `messageSlideIn 0.4s ease ${idx * 0.05}s backwards`,
                  whiteSpace: 'pre-wrap'
                }}
              >
                {msg.content}
                {msg.badges && (
                  <span style={{ fontSize: '12px', marginLeft: '6px', opacity: 0.8 }}>
                    {msg.badges}
                  </span>
                )}
              </div>
            ))}
            {loading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                <span className="typing-indicator">●●●</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: '16px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              gap: '8px'
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about careers..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                padding: '10px 20px',
                borderRadius: '20px',
                border: 'none',
                background: input.trim() && !loading
                  ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
                  : 'rgba(255,255,255,0.1)',
                color: 'white',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}
