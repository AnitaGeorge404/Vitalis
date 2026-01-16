import { useState } from 'react';
import './BurnHelp.css';

function BurnHelp() {
  const [selectedDegree, setSelectedDegree] = useState(null);
  const [burnSize, setBurnSize] = useState('');
  const [burnLocation, setBurnLocation] = useState('');

  const burnDegrees = [
    {
      degree: 'First Degree',
      severity: 'Superficial',
      color: '#fbbf24',
      symptoms: [
        'Redness (erythema)',
        'Pain and tenderness',
        'Minor swelling',
        'Dry surface - no blisters',
        'Usually heals within 3-7 days'
      ],
      examples: ['Sunburn', 'Brief contact with hot objects', 'Minor scalds'],
      treatment: [
        '🚰 Cool the burn with cool (not ice-cold) running water for 10-20 minutes',
        '🧴 Apply aloe vera gel or moisturizer',
        '💊 Take over-the-counter pain relievers if needed',
        '🧊 Avoid ice directly on the burn',
        '☀️ Protect from sun exposure',
        '💧 Stay hydrated'
      ],
      warning: 'Seek medical help if burn covers large area or shows signs of infection'
    },
    {
      degree: 'Second Degree',
      severity: 'Partial Thickness',
      color: '#f97316',
      symptoms: [
        'Deep redness with blotchy appearance',
        'Blisters (fluid-filled)',
        'Severe pain and swelling',
        'Wet, shiny surface',
        'May take 2-3 weeks to heal',
        'Risk of scarring'
      ],
      examples: ['Severe sunburns', 'Hot liquid scalds', 'Flash burns', 'Contact with flames'],
      treatment: [
        '🚨 Seek medical attention immediately',
        '🚰 Cool with running water for 20 minutes',
        '🧼 Gently clean with mild soap',
        '💉 DO NOT pop blisters',
        '🩹 Cover with sterile, non-stick dressing',
        '💊 Take prescribed pain medication',
        '🏥 Follow up with healthcare provider',
        '💉 May require tetanus shot'
      ],
      warning: 'URGENT: Seek immediate medical care. Risk of infection and scarring is high.'
    },
    {
      degree: 'Third Degree',
      severity: 'Full Thickness',
      color: '#dc2626',
      symptoms: [
        'White, brown, or charred appearance',
        'Leathery texture',
        'Little to no pain (nerve damage)',
        'Destroyed tissue layers',
        'Will NOT heal on its own',
        'Requires surgery/skin grafts'
      ],
      examples: ['Prolonged fire exposure', 'Electrical burns', 'Chemical burns', 'Boiling water immersion'],
      treatment: [
        '🚑 CALL 911 IMMEDIATELY',
        '⚠️ DO NOT remove clothing stuck to burn',
        '🚰 Do not immerse in water',
        '🧊 Cover with clean, dry cloth',
        '💔 Monitor for shock',
        '🚫 DO NOT apply ointments or home remedies',
        '🏥 Keep person warm and still',
        '⏰ Wait for emergency services'
      ],
      warning: '⚠️ LIFE-THREATENING: Requires immediate emergency medical treatment. Call 911 now!'
    }
  ];

  const criticalLocations = ['Face', 'Hands', 'Feet', 'Genitals', 'Major joints', 'Circumferential (around limb/body)'];

  const calculatePalmSize = () => {
    return (
      <div className="palm-size-info">
        <p><strong>Rule of Palm:</strong> The size of the patient's palm (including fingers) = approximately 1% of body surface area</p>
      </div>
    );
  };

  const handleDegreeSelect = (degree) => {
    setSelectedDegree(degree);
  };

  return (
    <div className="burn-help-container">
      <div className="burn-header">
        <h1>🔥 Emergency Burn Help</h1>
        <p className="burn-subtitle">Rapid burn assessment and immediate first aid guidance</p>
        
        <div className="critical-warning">
          <span className="warning-icon">⚠️</span>
          <div className="warning-text">
            <strong>When to Call 911:</strong>
            <ul>
              <li>Third-degree burns of any size</li>
              <li>Second-degree burns larger than 3 inches</li>
              <li>Burns on face, hands, feet, genitals, or major joints</li>
              <li>Chemical or electrical burns</li>
              <li>Difficulty breathing or burns in mouth/throat</li>
              <li>Child or elderly victim</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="burn-degrees-grid">
        {burnDegrees.map((burn, index) => (
          <div
            key={index}
            className={`burn-degree-card ${selectedDegree?.degree === burn.degree ? 'selected' : ''}`}
            onClick={() => handleDegreeSelect(burn)}
            style={{ borderLeftColor: burn.color }}
          >
            <div className="degree-header" style={{ backgroundColor: burn.color }}>
              <h2>{burn.degree}</h2>
              <span className="severity-badge">{burn.severity}</span>
            </div>

            <div className="degree-content">
              <div className="symptoms-section">
                <h3>🔍 Symptoms</h3>
                <ul>
                  {burn.symptoms.map((symptom, idx) => (
                    <li key={idx}>{symptom}</li>
                  ))}
                </ul>
              </div>

              <div className="examples-section">
                <h3>📋 Common Causes</h3>
                <ul>
                  {burn.examples.map((example, idx) => (
                    <li key={idx}>{example}</li>
                  ))}
                </ul>
              </div>

              <div className="treatment-section">
                <h3>🩹 Immediate Treatment</h3>
                <ol className="treatment-steps">
                  {burn.treatment.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>

              {burn.warning && (
                <div className="burn-warning" style={{ borderColor: burn.color, backgroundColor: `${burn.color}15` }}>
                  <strong>⚠️ {burn.warning}</strong>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="burn-assessment-tools">
        <h2>📊 Burn Assessment Tools</h2>
        
        <div className="assessment-grid">
          <div className="assessment-card">
            <h3>🖐️ Size Assessment</h3>
            {calculatePalmSize()}
            <div className="size-input">
              <label>Estimated burn size (% of body):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={burnSize}
                onChange={(e) => setBurnSize(e.target.value)}
                placeholder="e.g., 5"
              />
              {burnSize >= 10 && (
                <p className="size-warning">⚠️ Burns covering {burnSize}% or more require immediate medical attention!</p>
              )}
            </div>
          </div>

          <div className="assessment-card">
            <h3>📍 Location Assessment</h3>
            <select value={burnLocation} onChange={(e) => setBurnLocation(e.target.value)}>
              <option value="">Select burn location</option>
              <option value="arm">Arm</option>
              <option value="leg">Leg</option>
              <option value="torso">Torso</option>
              <option value="back">Back</option>
              <option value="face">Face ⚠️ CRITICAL</option>
              <option value="hands">Hands ⚠️ CRITICAL</option>
              <option value="feet">Feet ⚠️ CRITICAL</option>
              <option value="genitals">Genitals ⚠️ CRITICAL</option>
              <option value="joints">Major Joints ⚠️ CRITICAL</option>
            </select>
            {criticalLocations.some(loc => burnLocation.toLowerCase().includes(loc.toLowerCase())) && (
              <div className="location-critical">
                <p>🚨 <strong>CRITICAL LOCATION</strong></p>
                <p>Burns on {burnLocation} require immediate medical evaluation!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="general-burn-care">
        <h2>🩹 General Burn Care Guidelines</h2>
        
        <div className="care-grid">
          <div className="care-do">
            <h3 className="do-header">✅ DO</h3>
            <ul>
              <li>Cool the burn with running water for 10-20 minutes</li>
              <li>Remove jewelry and tight clothing before swelling starts</li>
              <li>Cover with sterile, non-stick bandage</li>
              <li>Take over-the-counter pain relievers</li>
              <li>Keep burn elevated above heart level if possible</li>
              <li>Watch for signs of infection (increased pain, redness, swelling, pus)</li>
              <li>Seek medical attention for serious burns</li>
            </ul>
          </div>

          <div className="care-dont">
            <h3 className="dont-header">❌ DON'T</h3>
            <ul>
              <li>Apply ice directly to burn</li>
              <li>Pop blisters</li>
              <li>Apply butter, oil, or home remedies</li>
              <li>Use fluffy cotton balls or material</li>
              <li>Remove clothing stuck to burn</li>
              <li>Touch burn with dirty hands</li>
              <li>Break sterile conditions</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="special-burns">
        <h2>⚡ Special Burn Types</h2>
        
        <div className="special-burn-card electrical">
          <h3>⚡ Electrical Burns</h3>
          <p><strong>🚑 ALWAYS call 911</strong></p>
          <ul>
            <li>Can cause internal damage not visible on skin</li>
            <li>Risk of cardiac arrest</li>
            <li>May have entry and exit wounds</li>
            <li>Monitor heart rhythm</li>
          </ul>
        </div>

        <div className="special-burn-card chemical">
          <h3>🧪 Chemical Burns</h3>
          <p><strong>🚑 Call Poison Control: 1-800-222-1222</strong></p>
          <ul>
            <li>Remove contaminated clothing</li>
            <li>Brush off dry chemicals before rinsing</li>
            <li>Rinse with water for 20+ minutes</li>
            <li>Do not neutralize - may cause more damage</li>
            <li>Bring chemical container/info to hospital</li>
          </ul>
        </div>
      </div>

      <div className="burn-disclaimer">
        <p>
          <strong>⚠️ Medical Disclaimer:</strong> This tool provides general burn first aid guidance only. 
          It is not a substitute for professional medical advice, diagnosis, or treatment. 
          When in doubt, always seek immediate medical attention. For emergencies, call 911.
        </p>
      </div>
    </div>
  );
}

export default BurnHelp;
