import { useState, useRef, useEffect } from 'react'
import './EmergencyChatbot.css'

/**
 * Emergency AI Assistant Chatbot
 * Provides real-time emergency guidance through conversational interface
 */
function EmergencyChatbot() {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: '🚨 Emergency AI Assistant activated. I can help you with:\n\n• CPR guidance\n• Choking response\n• Bleeding control\n• Shock management\n• Burn treatment\n• Emergency assessment\n\nWhat emergency situation do you need help with?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Emergency response knowledge base
  const emergencyResponses = {
    cpr: {
      keywords: ['cpr', 'not breathing', 'unconscious', 'cardiac', 'heart stopped', 'pulse'],
      response: `🫀 **CPR EMERGENCY PROTOCOL**

**IMMEDIATE STEPS:**

1️⃣ **Call 911 NOW** - Get emergency services coming
2️⃣ **Check responsiveness** - Tap shoulders, shout "Are you okay?"
3️⃣ **Check breathing** - Look for chest rise (10 seconds max)

**IF NO BREATHING:**

**HAND POSITION:**
• Center of chest, between nipples
• Place heel of one hand, other hand on top
• Interlock fingers, keep arms straight

**COMPRESSIONS:**
• Push HARD and FAST (2 inches deep)
• Rate: 100-120 per minute
• Allow full chest recoil
• Minimize interruptions

**RHYTHM:** 
30 compressions : 2 rescue breaths (if trained)
OR continuous compressions if untrained

**DO NOT STOP** until:
✅ Person shows signs of life
✅ AED arrives
✅ Paramedics take over

💡 Use our CPR Coach feature for real-time guidance!`
    },
    choking: {
      keywords: ['choking', 'can\'t breathe', 'airway blocked', 'heimlich'],
      response: `🫁 **CHOKING EMERGENCY PROTOCOL**

**ASSESS SEVERITY:**

**MILD (Can cough/speak):**
• Encourage continuous coughing
• Stay with person, monitor
• DO NOT slap back

**SEVERE (Cannot cough/speak/breathe):**

**CONSCIOUS ADULT:**
1️⃣ Stand behind person
2️⃣ Make fist above navel
3️⃣ Grasp fist with other hand
4️⃣ Quick, upward thrusts
5️⃣ Repeat until object expelled

**IF BECOMES UNCONSCIOUS:**
• Lower to ground carefully
• Call 911 immediately
• Begin CPR starting with compressions

**PREGNANT/OBESE:**
• Chest thrusts instead of abdominal

**INFANT (<1 year):**
• 5 back blows between shoulder blades
• 5 chest thrusts with 2 fingers
• Alternate until object expelled

⚠️ **CALL 911** if object not expelled quickly!`
    },
    bleeding: {
      keywords: ['bleeding', 'cut', 'wound', 'blood', 'hemorrhage'],
      response: `🩹 **SEVERE BLEEDING CONTROL**

**IMMEDIATE ACTION:**

1️⃣ **DIRECT PRESSURE**
• Place clean cloth on wound
• Press FIRMLY and continuously
• DO NOT peek - maintain pressure
• Add more cloths if soaked (don't remove)

2️⃣ **CALL 911** if:
• Blood spurting/pulsing
• Won't stop after 10 minutes
• Large or deep wound

3️⃣ **ELEVATE** (if no broken bones)
• Raise injured area above heart
• Continue pressure while elevating

4️⃣ **PRESSURE POINTS** (if still bleeding)
• Arm: Brachial artery (inner upper arm)
• Leg: Femoral artery (groin crease)

**TOURNIQUET (Life-threatening bleeding ONLY):**
• 2-3 inches above wound
• Tighten until bleeding stops
• Note time applied
• DO NOT REMOVE - let EMS do it

**DO NOT:**
❌ Remove embedded objects
❌ Use tourniquet for minor bleeding
❌ Apply ice directly to wound

🩺 Monitor for shock: pale, cold, rapid pulse`
    },
    shock: {
      keywords: ['shock', 'pale', 'cold', 'clammy', 'weak pulse', 'dizzy'],
      response: `⚡ **SHOCK MANAGEMENT**

**RECOGNIZE SHOCK:**
• Pale, cold, clammy skin
• Rapid, weak pulse
• Rapid, shallow breathing
• Confusion, anxiety
• Weakness, dizziness
• Nausea

**IMMEDIATE ACTIONS:**

1️⃣ **CALL 911** - Shock is life-threatening

2️⃣ **POSITION**
• Lay person flat on back
• Elevate legs 12 inches (if no injuries)
• Keep head flat

3️⃣ **MAINTAIN BODY TEMPERATURE**
• Cover with blanket
• DO NOT overheat
• Protect from cold ground

4️⃣ **DO NOT GIVE:**
❌ Food or water
❌ Anything by mouth
❌ Medications

5️⃣ **MONITOR:**
• Keep airway open
• Check breathing every 2 minutes
• Be ready to perform CPR

**TYPES OF SHOCK:**
• Blood loss (injury)
• Heart problems
• Severe infection
• Allergic reaction (anaphylaxis)

⚠️ **KEEP PERSON CALM** - reassure help is coming`
    },
    burn: {
      keywords: ['burn', 'burned', 'scalded', 'fire', 'heat'],
      response: `🔥 **BURN EMERGENCY TREATMENT**

**IMMEDIATE STEPS:**

1️⃣ **STOP THE BURNING**
• Remove from heat source
• Remove hot/burning clothing (unless stuck)
• Remove jewelry/tight items

2️⃣ **COOL THE BURN**
• Run cool (NOT ice cold) water 10-20 minutes
• Or apply cool, wet compress
• DO NOT use ice

3️⃣ **ASSESS SEVERITY**

**MINOR (First-degree):**
• Red, no blisters
• Treat at home: cool water, aloe, loose bandage

**MODERATE (Second-degree):**
• Blisters, very painful
• Cool, cover with sterile bandage
• Seek medical care if large area

**SEVERE (Third-degree):**
• White/charred/leathery skin
• May have little pain (nerve damage)
• **CALL 911 IMMEDIATELY**

**DO NOT:**
❌ Apply ice
❌ Use butter, oils, ointments
❌ Break blisters
❌ Remove stuck clothing

**CHEMICAL BURN:**
• Brush off dry chemical
• Flush with water 20+ minutes
• Remove contaminated clothing
• Call 911

🚨 Seek immediate medical help for:
• Burns on face, hands, feet, genitals
• Electrical/chemical burns
• Difficulty breathing
• Burns larger than 3 inches`
    },
    general: {
      keywords: ['help', 'emergency', 'what do i do', 'injury', 'accident'],
      response: `🆘 **GENERAL EMERGENCY ASSESSMENT**

**STAY CALM - Follow these steps:**

1️⃣ **ENSURE SAFETY**
• Check for dangers (fire, traffic, violence)
• Move to safety if needed
• Do NOT move injured person unless necessary

2️⃣ **CALL 911 IF:**
• Person unconscious/unresponsive
• Severe bleeding
• Difficulty breathing
• Chest pain
• Suspected broken bones
• Head/neck/spine injury
• Seizures
• Poisoning

3️⃣ **CHECK PERSON:**
• Are they conscious?
• Are they breathing normally?
• Any severe bleeding?
• Any obvious injuries?

4️⃣ **PROVIDE CARE:**
• Keep person calm and still
• Monitor breathing
• Control bleeding if present
• Treat for shock if needed
• DO NOT give food/water

5️⃣ **GATHER INFORMATION:**
• What happened?
• When did it happen?
• Known medical conditions?
• Medications?
• Allergies?

📍 **Tell me more about the specific situation:**
• CPR needed?
• Bleeding?
• Choking?
• Burn?
• Shock symptoms?

I'll provide specific guidance for your situation.`
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const findBestResponse = (userInput) => {
    const input = userInput.toLowerCase()
    
    // Find matching emergency type
    for (const [key, value] of Object.entries(emergencyResponses)) {
      if (value.keywords.some(keyword => input.includes(keyword))) {
        return value.response
      }
    }
    
    // Default response
    return emergencyResponses.general.response
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    // Add user message
    const userMsg = {
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMsg])
    setInputMessage('')
    setIsTyping(true)

    // Simulate AI thinking and respond
    setTimeout(() => {
      const response = findBestResponse(inputMessage)
      const botMsg = {
        type: 'bot',
        text: response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMsg])
      setIsTyping(false)
    }, 1000)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickActions = [
    { label: 'CPR Help', query: 'How do I perform CPR?' },
    { label: 'Choking', query: 'Someone is choking' },
    { label: 'Severe Bleeding', query: 'How to stop severe bleeding?' },
    { label: 'Burn Treatment', query: 'Burn first aid' }
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
          <p className="chatbot-subtitle">Real-time emergency guidance - Available 24/7</p>
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

        <div className="input-container">
          <textarea
            ref={inputRef}
            className="message-input"
            placeholder="Describe the emergency situation..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows="2"
          />
          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
          >
            Send →
          </button>
        </div>
      </div>

      <div className="chatbot-disclaimer">
        <p>
          ⚠️ <strong>Medical Disclaimer:</strong> This AI assistant provides general emergency guidance only.
          It is NOT a substitute for professional medical care. Always call 911 for emergencies.
          For CPR certification and advanced training, contact your local Red Cross or medical training center.
        </p>
      </div>
    </div>
  )
}

export default EmergencyChatbot
