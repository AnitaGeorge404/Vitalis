import { useState, useRef, useEffect } from 'react'
import { Bot, User, Send, AlertCircle, Sparkles } from 'lucide-react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import './EmergencyChatbot.css'

/**
 * Emergency AI Assistant - Powered by Google Gemini
 * Direct API integration without backend
 */
function EmergencyChatbot() {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: '🚨 Emergency AI Assistant Ready (Powered by Google Gemini)\n\nI can provide immediate guidance for:\n\n• CPR & Breathing emergencies\n• Severe bleeding & trauma\n• Choking\n• Burns\n• Poisoning\n• Seizures\n• Heart attack & Stroke\n• Broken bones\n• Allergic reactions\n\nAsk your emergency question now.\n\n⚠️ For life-threatening emergencies, CALL 911 FIRST, then use this for guidance while waiting.',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [apiConfigured, setApiConfigured] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const genAI = useRef(null)

  // Initialize Gemini AI
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      genAI.current = new GoogleGenerativeAI(apiKey)
      setApiConfigured(true)
    } else {
      console.warn('Gemini API key not configured. Using fallback knowledge base.')
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Emergency knowledge base for client-side responses
  const getEmergencyResponse = (query) => {
    const lowerQuery = query.toLowerCase()
    
    // CPR
    if (lowerQuery.includes('cpr') || lowerQuery.includes('not breathing') || lowerQuery.includes('no pulse')) {
      return "🚨 CPR PROTOCOL:\n\n1. CALL 911 IMMEDIATELY\n2. Check responsiveness - tap shoulders, shout\n3. If no response:\n   • Tilt head back, lift chin\n   • Check breathing (5-10 seconds)\n4. NO BREATHING = START CPR:\n   • Place heel of hand on center of chest\n   • Other hand on top, fingers interlaced\n   • Arms straight, shoulders over hands\n   • Push HARD and FAST:\n     - Depth: 2 inches (5cm)\n     - Rate: 100-120 per minute\n     - Rhythm: \"Stayin' Alive\" beat\n   • 30 compressions, then 2 rescue breaths\n   • Continue until help arrives\n\n⚠️ Don't stop compressions for >10 seconds\n⚠️ Let chest fully recoil between compressions"
    }
    
    // Gunshot/Stab wounds
    if (lowerQuery.includes('gunshot') || lowerQuery.includes('bullet') || lowerQuery.includes('stab') || lowerQuery.includes('knife')) {
      return "🚨 PENETRATING TRAUMA:\n\n1. CALL 911 - Give exact location\n2. DO NOT REMOVE OBJECT if still embedded\n3. CONTROL BLEEDING:\n   • Apply FIRM direct pressure\n   • Use clean cloth/shirt\n   • Don't remove first cloth if soaked - add more on top\n4. Abdomen wound:\n   • Cover with moist clean cloth\n   • DO NOT push organs back in\n   • Keep victim lying flat\n5. Chest wound:\n   • Seal wound with plastic/cloth\n   • Tape on 3 sides only (one side open)\n   • Allows air out but not in\n6. Monitor for shock:\n   • Pale, cold, sweaty skin\n   • Rapid weak pulse\n   • Lay flat, elevate legs\n\n⚠️ Time is CRITICAL - constant pressure on wound"
    }
    
    // Choking
    if (lowerQuery.includes('chok') || lowerQuery.includes('can\'t breathe') || lowerQuery.includes('airway')) {
      return "🚨 CHOKING EMERGENCY:\n\nCONSCIOUS ADULT:\n1. Ask \"Are you choking?\" (if can't speak = YES)\n2. Stand behind person\n3. Make fist, place above navel\n4. Grab fist with other hand\n5. Quick UPWARD thrusts into abdomen\n6. Repeat until object clears\n\nUNCONSCIOUS:\n1. Lower to ground carefully\n2. START CPR (compressions may dislodge object)\n3. Before rescue breaths, look in mouth\n4. Remove visible object only if you can see it\n\nINFANT (<1 year):\n1. Face down on forearm\n2. 5 back blows between shoulder blades\n3. Turn face up\n4. 5 chest thrusts (2 fingers)\n5. Alternate until clear\n\n⚠️ NEVER blind finger sweep - can push deeper"
    }
    
    // Burns
    if (lowerQuery.includes('burn') || lowerQuery.includes('fire') || lowerQuery.includes('scald')) {
      return "🚨 BURN TREATMENT:\n\n1st DEGREE (red, painful):\n• Cool water 10-20 minutes\n• Aloe vera gel\n• Ibuprofen for pain\n\n2nd DEGREE (blisters):\n• Cool water (NOT ice)\n• DO NOT pop blisters\n• Cover with sterile gauze\n• Seek medical care\n\n3rd DEGREE (white/charred):\n🚨 CALL 911:\n• DO NOT remove clothing stuck to burn\n• Cover with clean, dry cloth\n• DO NOT apply water/ointments\n• Treat for shock\n• Keep person lying flat\n\nCHEMICAL BURNS:\n• Remove contaminated clothing\n• Flush with water 20+ minutes\n• Call Poison Control: 1-800-222-1222\n\n⚠️ Burns >3 inches or on face/hands/genitals = Hospital"
    }
    
    // Seizure
    if (lowerQuery.includes('seizure') || lowerQuery.includes('convuls') || lowerQuery.includes('shaking')) {
      return "🚨 SEIZURE RESPONSE:\n\nDURING SEIZURE:\n1. Stay calm, time the seizure\n2. Clear area - remove dangerous objects\n3. Cushion head with something soft\n4. Turn person on SIDE (recovery position)\n5. DO NOT:\n   • Put anything in mouth\n   • Restrain movements\n   • Give food/water\n\nCALL 911 IF:\n• Seizure lasts >5 minutes\n• Second seizure follows immediately\n• Person injured during seizure\n• First-time seizure\n• Pregnant\n• Happens in water\n• Breathing difficulties after\n\nAFTER SEIZURE:\n• Stay with person\n• Speak calmly and reassuringly\n• Check for injuries\n• Let them rest\n• Don't give anything by mouth until fully alert\n\n⚠️ Most seizures stop on their own in 1-2 minutes"
    }
    
    // Poisoning
    if (lowerQuery.includes('poison') || lowerQuery.includes('swallow') || lowerQuery.includes('chemical') || lowerQuery.includes('bleach')) {
      return "🚨 POISONING EMERGENCY:\n\n1. CALL POISON CONTROL IMMEDIATELY:\n   📞 1-800-222-1222 (US)\n   Available 24/7, free, confidential\n\n2. Have ready:\n   • Person's age and weight\n   • Name of substance\n   • Amount swallowed\n   • When it happened\n\n3. DO NOT:\n   • Make person vomit (unless told to)\n   • Give activated charcoal\n   • Give food/drink\n   • Wait for symptoms\n\n4. IF SKIN CONTACT:\n   • Remove clothing\n   • Flush with water 15-20 minutes\n\n5. IF INHALED:\n   • Get to fresh air immediately\n   • Open windows/doors\n\n6. IF EYES:\n   • Flush with water 15 minutes\n   • Remove contact lenses\n\n⚠️ Bring poison container to hospital if safe\n⚠️ If unconscious/not breathing = Call 911 first"
    }
    
    // Bleeding
    if (lowerQuery.includes('bleed') || lowerQuery.includes('blood') || lowerQuery.includes('cut')) {
      return "🚨 SEVERE BLEEDING:\n\n1. CALL 911 if:\n   • Spurting blood\n   • Won't stop after 10 min pressure\n   • Large/deep wound\n\n2. DIRECT PRESSURE:\n   • Use clean cloth/gauze\n   • Press FIRMLY on wound\n   • Don't lift cloth to check\n   • Add more cloths on top if soaked\n\n3. If direct pressure fails:\n   • Apply pressure to artery:\n     - Arm: Inside of upper arm\n     - Leg: Groin crease\n\n4. TOURNIQUETS (last resort):\n   • Only for life-threatening limb bleeding\n   • 2-3 inches above wound\n   • Tighten until bleeding stops\n   • Note time applied\n   • DO NOT remove\n\n5. TREAT FOR SHOCK:\n   • Lay person flat\n   • Elevate legs if no spine injury\n   • Keep warm\n\n⚠️ Average adult can lose 1 pint safely\n⚠️ Loss of 2+ pints = shock/death risk"
    }
    
    // Heart attack
    if (lowerQuery.includes('heart attack') || lowerQuery.includes('chest pain') || lowerQuery.includes('heart')) {
      return "🚨 HEART ATTACK:\n\nSYMPTOMS:\n• Chest pressure/pain (center/left)\n• Pain spreading to arm, jaw, back\n• Shortness of breath\n• Sweating, nausea\n• Feeling of doom\n\nACTION:\n1. CALL 911 immediately\n2. Sit person down, keep calm\n3. Give ASPIRIN if available:\n   • 325mg regular OR\n   • 4 × 81mg baby aspirin\n   • Chew, don't swallow whole\n4. Loosen tight clothing\n5. If person has nitroglycerin - help them take it\n6. Monitor breathing\n7. Be ready to perform CPR\n\nDO NOT:\n• Let them drive themselves\n• Give aspirin if allergic\n• Give food or drink\n• Leave them alone\n\n⚠️ EVERY MINUTE COUNTS\n⚠️ Women may have different symptoms (back pain, fatigue)"
    }
    
    // Stroke
    if (lowerQuery.includes('stroke') || lowerQuery.includes('face droop') || lowerQuery.includes('slurred')) {
      return "🚨 STROKE - ACT F.A.S.T.:\n\nF = FACE\n• Ask to smile\n• Does one side droop?\n\nA = ARMS\n• Raise both arms\n• Does one drift down?\n\nS = SPEECH\n• Repeat simple sentence\n• Slurred or strange?\n\nT = TIME\n• If ANY sign = CALL 911\n• Note when symptoms started\n\nOTHER SIGNS:\n• Sudden severe headache\n• Vision problems\n• Dizziness\n• Loss of balance\n• Confusion\n\nACTIONS:\n1. CALL 911 - Don't drive to hospital\n2. Note time symptoms started\n3. Keep person calm and still\n4. Nothing by mouth (no food/drink)\n5. If unconscious - recovery position (on side)\n6. Monitor breathing\n\n⚠️ Treatment works best within 3 HOURS\n⚠️ NEVER give aspirin for stroke (only heart attack)"
    }
    
    // Allergic reaction
    if (lowerQuery.includes('allergic') || lowerQuery.includes('anaphyl') || lowerQuery.includes('epipen')) {
      return "🚨 SEVERE ALLERGIC REACTION:\n\nANAPHYLAXIS SIGNS:\n• Difficulty breathing/wheezing\n• Swelling of face/throat/tongue\n• Rapid pulse\n• Dizziness/fainting\n• Hives all over body\n• Nausea/vomiting\n\nACTION:\n1. CALL 911 immediately\n2. USE EPIPEN if available:\n   • Remove safety cap\n   • Press firmly into outer thigh\n   • Hold 3 seconds\n   • Massage area 10 seconds\n3. Help person lie down:\n   • Legs elevated 12 inches\n   • If vomiting/breathing issues - side position\n4. Give antihistamine (Benadryl) if conscious\n5. Monitor breathing\n6. Second EpiPen dose if no improvement in 5-15 min\n\nDO NOT:\n• Give anything by mouth if breathing problems\n• Let person stand/walk\n• Assume they're getting better\n\n⚠️ Symptoms can return - stay with person\n⚠️ Always go to ER even if EpiPen used"
    }
    
    // Fracture
    if (lowerQuery.includes('broken') || lowerQuery.includes('fracture') || lowerQuery.includes('bone')) {
      return "🚨 SUSPECTED FRACTURE:\n\nSIGNS:\n• Severe pain\n• Swelling\n• Deformity/odd angle\n• Cannot bear weight\n• Numbness/tingling\n\nACTION:\n1. Call 911 for:\n   • Spine, neck, skull, hip, pelvis injury\n   • Bone protruding through skin\n   • Heavy bleeding\n   • Limb cold/blue\n\n2. DO NOT move person if:\n   • Neck/back/head injury suspected\n   • Hip/pelvis fracture\n\n3. IMMOBILIZE:\n   • Don't try to straighten\n   • Splint in position found\n   • Splint joint above AND below fracture\n   • Use pillows, magazines, sticks\n\n4. Apply ICE:\n   • 20 minutes on, 20 off\n   • Use cloth barrier\n\n5. ELEVATE if possible\n\n6. Check circulation:\n   • Can they wiggle toes/fingers?\n   • Is limb warm?\n   • Normal color?\n\n⚠️ Don't give food/drink (may need surgery)\n⚠️ Watch for shock"
    }
    
    // Default response
    return "🚨 GENERAL EMERGENCY GUIDANCE:\n\nFor ANY life-threatening emergency:\n1. **CALL 911 FIRST** - Give exact location\n2. Stay on line with dispatcher\n3. Follow their instructions\n\n**CRITICAL SIGNS** (need 911):\n• Not breathing or gasping\n• No pulse\n• Severe bleeding that won't stop\n• Severe burns\n• Possible poisoning\n• Severe allergic reaction\n• Chest pain\n• Stroke symptoms (face droop, arm weakness, speech problems)\n• Seizure lasting >5 minutes\n• Severe trauma\n\n**While waiting for help:**\n• Keep person calm and still\n• Monitor breathing and pulse\n• Control any bleeding\n• Treat for shock (lay flat, elevate legs)\n• Don't give food or drink\n• Gather medical history if possible\n\n❓ **Ask me specifically about:**\n- CPR help\n- Choking\n- Severe bleeding\n- Burns\n- Poisoning\n- Seizures\n- Heart attack\n- Stroke\n- Broken bones\n- Allergic reactions\n\n⚠️ This is guidance only - always call 911 for emergencies"
  }

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
      let responseText

      // Try Gemini AI if configured
      if (apiConfigured && genAI.current) {
        const model = genAI.current.getGenerativeModel({ model: 'gemini-2.5-flash' })
        
        const prompt = `You are an emergency medical guidance AI assistant. Provide CONCISE, ACTIONABLE emergency medical guidance for the following situation. Focus on immediate life-saving steps.

CRITICAL RULES:
1. Start with "🚨 CALL 911 IMMEDIATELY" for life-threatening situations
2. Use clear numbered steps
3. Include what NOT to do (marked with ⚠️)
4. Keep response under 300 words
5. Use bullet points for clarity
6. Emphasize time-critical actions

Emergency situation: ${currentQuery}

Provide immediate, actionable guidance:`

        const result = await model.generateContent(prompt)
        const response = await result.response
        responseText = response.text()
      } else {
        // Fallback to knowledge base if Gemini not configured
        responseText = getEmergencyResponse(currentQuery)
      }

      const botMsg = {
        type: 'bot',
        text: responseText,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMsg])
      setIsTyping(false)
    } catch (error) {
      console.error('Error getting AI response:', error)
      
      // Fallback to knowledge base on error
      const fallbackResponse = getEmergencyResponse(currentQuery)
      
      const botMsg = {
        type: 'bot',
        text: `${apiConfigured ? '⚠️ AI connection error. Using offline guidance:\n\n' : ''}${fallbackResponse}`,
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
    { label: 'CPR Help', query: 'Person not breathing, how do I perform CPR?' },
    { label: 'Gunshot/Stab', query: 'A bullet went through person\'s abdomen, what to do?' },
    { label: 'Choking', query: 'Someone is choking and can\'t breathe' },
    { label: 'Severe Burn', query: 'Person has severe burns, what immediate actions?' },
    { label: 'Seizure', query: 'Someone is having a seizure right now' },
    { label: 'Poisoning', query: 'Child swallowed household chemical' }
  ]

  const handleQuickAction = (query) => {
    setInputMessage(query)
    inputRef.current?.focus()
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="header-content">
          <h1>Emergency AI Assistant</h1>
          <p className="chatbot-subtitle">
            Fast & Concise - Critical info only
          </p>
        </div>
        <div className="emergency-banner">
          <AlertCircle size={18} /> For life-threatening emergencies, CALL 911 FIRST
        </div>
        {apiConfigured ? (
          <div className="ai-status-badge gemini-active">
            <Sparkles size={14} /> Powered by Gemini AI
          </div>
        ) : (
          <div className="ai-status-badge fallback-mode">
            📚 Offline Knowledge Base (Add API key for AI)
          </div>
        )}
      </div>

      <div className="chatbot-main">
        <div className="messages-container">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.type === 'user' ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-avatar">
                {message.type === 'user' ? <User size={20} /> : <Bot size={20} />}
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
              <div className="message-avatar"><Bot size={20} /></div>
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

        <div className="input-container">
          <textarea
            ref={inputRef}
            className="message-input"
            placeholder="Describe emergency situation..."
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
            {isTyping ? 'Getting help...' : (
              <>
                <Send size={18} /> Send
              </>
            )}
          </button>
        </div>

        <div className="quick-actions">
          <p className="quick-actions-label">Quick Emergency Help:</p>
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
      </div>

      <div className="chatbot-disclaimer">
        <p>
          <AlertCircle size={16} /> <strong>Medical Disclaimer:</strong> This AI assistant provides general emergency guidance only.
          It is NOT a substitute for professional medical care. Always call 911 for emergencies.
          <span> <strong>Powered by Google Gemini AI</strong> - Fast, concise, critical-only guidance.</span>
        </p>
      </div>
    </div>
  )
}

export default EmergencyChatbot
