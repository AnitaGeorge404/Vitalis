import React, { useState } from "react";
import { Pill, AlertTriangle, CheckCircle2, Search, Plus, Info, Trash2, ShieldCheck, HelpCircle } from "lucide-react";

function PillInteractionChecker() {
  const [currentMeds, setCurrentMeds] = useState(["Aspirin", "Lisinopril"]);
  const [newMed, setNewMed] = useState("");
  const [interactionResult, setInteractionResult] = useState(null);

  // Expanded Knowledge Base of Common Interactions
  const INTERACTION_MAP = [
    {
      pair: ["aspirin", "ibuprofen"],
      status: "danger",
      title: "NSAID Conflict",
      message: "Taking Aspirin and Ibuprofen together increases the risk of stomach bleeding and can reduce Aspirin's heart-protective benefits."
    },
    {
      pair: ["warfarin", "aspirin"],
      status: "danger",
      title: "Severe Bleeding Risk",
      message: "Combining two potent blood thinners significantly increases the risk of internal bleeding. Do not combine unless specifically directed by a specialist."
    },
    {
      pair: ["lisinopril", "spironolactone"],
      status: "warning",
      title: "Potassium Warning",
      message: "Both drugs can raise potassium levels. This combination requires blood monitoring to avoid heart rhythm issues."
    },
    {
      pair: ["sertraline", "tramadol"],
      status: "danger",
      title: "Serotonin Syndrome Risk",
      message: "High risk of a dangerous chemical imbalance. Can cause confusion, rapid heart rate, and muscle stiffness."
    },
    {
      pair: ["simvastatin", "amlodipine"],
      status: "warning",
      title: "Statin Concentration Alert",
      message: "Amlodipine can increase levels of Simvastatin in the body, increasing the risk of muscle pain (myopathy)."
    },
    {
      pair: ["metformin", "alcohol"],
      status: "danger",
      title: "Lactic Acidosis Risk",
      message: "Combining Metformin with excessive alcohol can cause a dangerous buildup of lactic acid in the blood."
    },
    {
      pair: ["amoxicillin", "methotrexate"],
      status: "warning",
      title: "Elimination Delay",
      message: "Amoxicillin can slow the clearance of Methotrexate, potentially increasing its toxicity."
    },
    {
      pair: ["citalopram", "ibuprofen"],
      status: "warning",
      title: "Gastrointestinal Risk",
      message: "SSRIs combined with NSAIDs like Ibuprofen can increase the risk of upper GI bleeding."
    }
  ];

  const checkInteractions = () => {
    if (!newMed) return;
    
    const searchName = newMed.toLowerCase().trim();
    const activeMeds = currentMeds.map(m => m.toLowerCase().trim());
    
    // Search for any pair in the database that matches the newMed and ANY currentMed
    const found = INTERACTION_MAP.find(item => 
      item.pair.includes(searchName) && item.pair.some(med => activeMeds.includes(med))
    );

    if (found) {
      setInteractionResult(found);
    } else {
      // Handle "Not Found" or "Safe" case
      setInteractionResult({
        status: "unknown",
        title: "No Common Interaction Found",
        message: `We don't have a documented conflict for "${newMed}" with your current list. However, this is not a guarantee of safety. Consult your pharmacist for a full clinical review.`
      });
    }
  };

  return (
    <div className="vital-scan-container" style={{ background: '#f8fafc', padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      
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
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '0.8rem', marginBottom: '16px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="#3b82f6" /> My Active Meds
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentMeds.map((med, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>{med}</span>
                <Trash2 size={14} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => setCurrentMeds(currentMeds.filter((_, idx) => idx !== i))} />
              </div>
            ))}
            
            <input 
              placeholder="+ Add current medicine..." 
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value) {
                  setCurrentMeds([...currentMeds, e.target.value]);
                  e.target.value = "";
                }
              }}
              style={{ width: '100%', padding: '8px', marginTop: '8px', borderRadius: '8px', border: '1px dashed #cbd5e1', fontSize: '0.8rem' }}
            />
          </div>
        </div>

        {/* RIGHT: The Checker Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '16px' }}>Check New Medication</h3>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input
                placeholder="e.g. Ibuprofen, Warfarin..."
                value={newMed}
                onChange={(e) => setNewMed(e.target.value)}
                style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
              />
              <button onClick={checkInteractions} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                Check
              </button>
            </div>

            {interactionResult && (
              <div style={{ 
                padding: '16px', 
                borderRadius: '12px', 
                background: interactionResult.status === 'danger' ? '#fff1f2' : (interactionResult.status === 'warning' ? '#fffbeb' : '#f8fafc'),
                border: `1px solid ${interactionResult.status === 'danger' ? '#fecaca' : (interactionResult.status === 'warning' ? '#fef3c7' : '#e2e8f0')}`
              }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '6px' }}>
                  {interactionResult.status === 'danger' ? <AlertTriangle size={20} color="#e11d48" /> : 
                   interactionResult.status === 'warning' ? <Info size={20} color="#d97706" /> : 
                   <HelpCircle size={20} color="#64748b" />}
                  <strong style={{ color: interactionResult.status === 'danger' ? '#9f1239' : (interactionResult.status === 'warning' ? '#92400e' : '#334155'), fontSize: '0.9rem' }}>
                    {interactionResult.title}
                  </strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
                  {interactionResult.message}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PillInteractionChecker;