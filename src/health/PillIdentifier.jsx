import React, { useState, useEffect } from "react";
import { Pill, AlertTriangle, CheckCircle2, Search, Plus, Info, Trash2, ShieldCheck } from "lucide-react";

function PillInteractionChecker() {
  const [currentMeds, setCurrentMeds] = useState(["Aspirin", "Lisinopril"]);
  const [newMed, setNewMed] = useState("");
  const [interactionResult, setInteractionResult] = useState(null);

  // Logic to simulate drug-to-drug interaction database
  const checkInteractions = () => {
    if (!newMed) return;
    
    const meds = [...currentMeds, newMed].map(m => m.toLowerCase().trim());
    
    // Example Logic: High-risk combinations
    if (meds.includes("aspirin") && meds.includes("ibuprofen")) {
      setInteractionResult({
        status: "danger",
        title: "High Risk: NSAID Conflict",
        message: "Taking Aspirin and Ibuprofen together can increase the risk of stomach ulcers and interfere with heart protection."
      });
    } else if (meds.includes("lisinopril") && meds.includes("spironolactone")) {
      setInteractionResult({
        status: "warning",
        title: "Moderate Risk: Potassium Alert",
        message: "This combination may significantly increase potassium levels. Periodic blood tests are recommended."
      });
    } else {
      setInteractionResult({
        status: "safe",
        title: "No Common Interactions",
        message: "No major conflicts found between these medications in our database. Always confirm with your pharmacist."
      });
    }
  };

  return (
    <div className="vital-scan-container" style={{ background: '#f8fafc', padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Small Header */}
      <div style={{ marginBottom: '20px', borderLeft: '4px solid #3b82f6', paddingLeft: '15px' }}>
        <h1 style={{ fontSize: '1.4rem', color: '#1e293b', margin: 0 }}>Interaction Guard</h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Verify safety before taking new medication.</p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: window.innerWidth > 800 ? '320px 1fr' : '1fr', 
        gap: '20px',
        alignItems: 'start' 
      }}>
        
        {/* LEFT: Current Medications Card */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontSize: '0.9rem', marginBottom: '16px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.025em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="#3b82f6" /> My Active Meds
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentMeds.map((med, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>{med}</span>
                <Trash2 size={14} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => setCurrentMeds(currentMeds.filter((_, idx) => idx !== i))} />
              </div>
            ))}
            
            <div style={{ position: 'relative', marginTop: '8px' }}>
              <Plus size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
              <input 
                placeholder="Add current medicine..." 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    setCurrentMeds([...currentMeds, e.target.value]);
                    e.target.value = "";
                  }
                }}
                style={{ width: '100%', padding: '8px 8px 8px 30px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT: The Checker Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '16px' }}>Check New Medication</h3>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                <input
                  placeholder="e.g. Ibuprofen, Warfarin..."
                  value={newMed}
                  onChange={(e) => setNewMed(e.target.value)}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
              <button 
                onClick={checkInteractions} 
                style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', transition: '0.2s opacity' }}
                onMouseOver={(e) => e.target.style.opacity = '0.9'}
                onMouseOut={(e) => e.target.style.opacity = '1'}
              >
                Check
              </button>
            </div>

            {interactionResult && (
              <div style={{ 
                padding: '16px', 
                borderRadius: '12px', 
                background: interactionResult.status === 'danger' ? '#fff1f2' : (interactionResult.status === 'warning' ? '#fffbeb' : '#f0fdf4'),
                border: `1px solid ${interactionResult.status === 'danger' ? '#fecaca' : (interactionResult.status === 'warning' ? '#fef3c7' : '#bbf7d0')}`
              }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '6px' }}>
                  {interactionResult.status === 'danger' ? <AlertTriangle size={20} color="#e11d48" /> : 
                   interactionResult.status === 'warning' ? <Info size={20} color="#d97706" /> : 
                   <CheckCircle2 size={20} color="#16a34a" />}
                  <strong style={{ color: interactionResult.status === 'danger' ? '#9f1239' : (interactionResult.status === 'warning' ? '#92400e' : '#166534'), fontSize: '0.9rem' }}>
                    {interactionResult.title}
                  </strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: interactionResult.status === 'danger' ? '#be123c' : (interactionResult.status === 'warning' ? '#b45309' : '#15803d'), lineHeight: '1.5' }}>
                  {interactionResult.message}
                </p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', padding: '14px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #dbeafe' }}>
            <Info size={16} color="#3b82f6" style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#1e40af', lineHeight: '1.4' }}>
              <strong>Disclaimer:</strong> This database is not exhaustive. Always consult a healthcare professional. In case of emergency, use the <strong>SOS</strong> feature immediately.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PillInteractionChecker;