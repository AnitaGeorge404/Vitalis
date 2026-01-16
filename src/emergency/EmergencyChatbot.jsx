import { useState, useRef, useEffect } from 'react'
import './EmergencyChatbot.css'

/**
 * Emergency AI Assistant - Backend API Integration
 * Fast, concise, to-the-point emergency guidance
 */
function EmergencyChatbot() {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: '🚨 Emergency AI ready. Ask ANY emergency question - get INSTANT, CRITICAL-ONLY guidance.\n\nExamples:\n• "Gunshot wound abdomen"\n• "Child swallowed bleach"\n• "Seizure happening now"\n• "Severe bleeding won\'t stop"\n\nFast, concise answers. No fluff.',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    // Add user message
    const userMsg = {
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMsg])
    const currentQuery = inputMessage
    setInputMessage('')
    setIsTyping(true)

    try {
      // Call backend API (API key is secure on server)
      const response = await fetch('http://localhost:4000/api/emergency-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: currentQuery })
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const data = await response.json()

      const botMsg = {
        type: 'bot',
        text: data.response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMsg])
      setIsTyping(false)
    } catch (error) {
      console.error('Error getting response:', error)
      
      const botMsg = {
        type: 'bot',
        text: '⚠️ Error connecting to AI service. Make sure the backend is running (node api-server.js). For immediate emergencies, call 911.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMsg])
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickActions = [
    { label: '🫀 CPR Help', query: 'Person not breathing, how do I perform CPR?' },
    { label: '🩸 Gunshot/Stab', query: 'A bullet went through person\'s abdomen, what to do?' },
    { label: '🫁 Choking', query: 'Someone is choking and can\'t breathe' },
    { label: '🔥 Severe Burn', query: 'Person has severe burns, what immediate actions?' },
    { label: '⚡ Seizure', query: 'Someone is having a seizure right now' },
    { label: '☠️ Poisoning', query: 'Child swallowed household chemical' }
  ]

  const handleQuickAction = (query) => {
    setInputMessage(query)
    inputRef.current?.focus()
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="header-content">
          <h1>🤖 Emergency AI Assistant</h1>
          <p className="chatbot-subtitle">
            ⚡ FAST & CONCISE - Critical info only, no fluff
          </p>
        </div>
        <div className="emergency-banner">
          ⚠️ For life-threatening emergencies, CALL 911 FIRST, then use this assistant
        </div>
      </div>

      <div className="chatbot-main">
        <div className="messages-container">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.type === 'user' ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-avatar">
                {message.type === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                <div className="message-text">
                  {message.text.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message bot-message">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="quick-actions">
          <p className="quick-actions-label">🚨 Quick Emergency Help:</p>
          <div className="quick-actions-buttons">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="quick-action-btn"
                onClick={() => handleQuickAction(action.query)}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="input-container">
          <textarea
            ref={inputRef}
            className="message-input"
            placeholder="Describe ANY emergency situation..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows="2"
            disabled={isTyping}
          />
          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
          >
            {isTyping ? 'Getting help...' : 'Send →'}
          </button>
        </div>
      </div>

      <div className="chatbot-disclaimer">
        <p>
          ⚠️ <strong>Medical Disclaimer:</strong> This AI assistant provides general emergency guidance only.
          It is NOT a substitute for professional medical care. Always call 911 for emergencies.
          <span> 🤖 <strong>Powered by Google Gemini AI</strong> - Fast, concise, critical-only guidance.</span>
        </p>
      </div>
    </div>
  )
}

export default EmergencyChatbot
