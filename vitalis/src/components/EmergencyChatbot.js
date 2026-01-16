import React, { useState, useRef, useEffect } from 'react';
import './EmergencyChatbot.css';
import { identifyScenario, getInitialResponse, processAnswers } from '../utils/emergencyTriage';

function EmergencyChatbot({ onClose }) {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'I\'m here to help you through this emergency. Stay calm.',
      timestamp: new Date()
    },
    {
      type: 'bot',
      text: 'Can you describe what\'s happening?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [currentScenario, setCurrentScenario] = useState(null);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addMessage = (type, text, actions = null, urgency = null) => {
    setMessages(prev => [...prev, {
      type,
      text,
      actions,
      urgency,
      timestamp: new Date()
    }]);
  };

  const handleInitialInput = (input) => {
    const scenario = identifyScenario(input);
    setCurrentScenario(scenario);

    const response = getInitialResponse(scenario);
    
    addMessage('bot', response.message);

    if (response.questions && response.questions.length > 0) {
      setCurrentQuestions(response.questions);
      setQuestionIndex(0);
      addMessage('bot', response.questions[0].text);
    } else if (response.actions) {
      addMessage('bot', 'Here\'s what to do:', response.actions);
    }
  };

  const handleQuestionAnswer = (answer) => {
    const currentQuestion = currentQuestions[questionIndex];
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);

    // Move to next question or process final response
    if (questionIndex < currentQuestions.length - 1) {
      setQuestionIndex(questionIndex + 1);
      addMessage('bot', currentQuestions[questionIndex + 1].text);
    } else {
      // All questions answered - provide guidance
      setIsProcessing(true);
      setTimeout(() => {
        const guidance = processAnswers(currentScenario, newAnswers);
        
        addMessage('bot', guidance.message, guidance.actions, guidance.urgency);
        
        // Add follow-up based on urgency
        if (guidance.urgency === 'CRITICAL') {
          setTimeout(() => {
            addMessage('bot', '🚨 If you haven\'t already, CALL 911 NOW.');
          }, 1000);
        }
        
        setIsProcessing(false);
        setCurrentQuestions([]);
        setQuestionIndex(0);
      }, 500);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    // Add user message
    addMessage('user', inputValue);
    const userInput = inputValue;
    setInputValue('');

    // Process based on current state
    setTimeout(() => {
      if (currentQuestions.length === 0) {
        // Initial input - identify scenario
        handleInitialInput(userInput);
      } else {
        // Answer to current question
        handleQuestionAnswer(userInput.toLowerCase());
      }
    }, 300);
  };

  const handleQuickResponse = (answer) => {
    addMessage('user', answer === 'yes' ? 'Yes' : 'No');
    handleQuestionAnswer(answer);
  };

  const handleStartCPR = () => {
    addMessage('bot', 'Opening CPR Coach...');
    // Navigate to CPR Coach or trigger it
    window.location.hash = '#cpr-coach';
  };

  const handleCall911 = () => {
    addMessage('bot', '📞 Dialing emergency services...');
    window.location.href = 'tel:911';
  };

  const urgencyColors = {
    CRITICAL: '#ff0000',
    HIGH: '#ff6600',
    MEDIUM: '#ffa500',
    LOW: '#4444ff'
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-header-content">
          <h2>🚨 Emergency Assistant</h2>
          <p className="header-subtitle">I'm here to help - stay calm</p>
        </div>
        <button className="close-btn" onClick={onClose} aria-label="Close chat">
          ✕
        </button>
      </div>

      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            <div className="message-content">
              {msg.urgency && (
                <div 
                  className="urgency-badge"
                  style={{ backgroundColor: urgencyColors[msg.urgency] }}
                >
                  {msg.urgency}
                </div>
              )}
              <p>{msg.text}</p>
              {msg.actions && (
                <div className="action-list">
                  {msg.actions.map((action, i) => (
                    <div key={i} className="action-item">
                      <span className="action-bullet">•</span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className="message-time">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        
        {isProcessing && (
          <div className="message bot">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {currentQuestions.length > 0 && questionIndex < currentQuestions.length && (
        <div className="quick-responses">
          <button 
            className="quick-btn quick-yes"
            onClick={() => handleQuickResponse('yes')}
            disabled={isProcessing}
          >
            ✓ Yes
          </button>
          <button 
            className="quick-btn quick-no"
            onClick={() => handleQuickResponse('no')}
            disabled={isProcessing}
          >
            ✗ No
          </button>
        </div>
      )}

      <form className="chatbot-input-form" onSubmit={handleSendMessage}>
        <input
          ref={inputRef}
          type="text"
          className="chatbot-input"
          placeholder="Type your response..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isProcessing}
        />
        <button 
          type="submit" 
          className="send-btn"
          disabled={!inputValue.trim() || isProcessing}
        >
          Send
        </button>
      </form>

      <div className="chatbot-footer">
        <p className="disclaimer-text">
          ⚠️ This is guidance only, not medical diagnosis. Always call 911 for life-threatening emergencies.
        </p>
      </div>
    </div>
  );
}

export default EmergencyChatbot;
