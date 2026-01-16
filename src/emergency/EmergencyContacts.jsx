import React, { useState, useEffect } from "react";
import { Phone, UserPlus, Trash2, ShieldAlert, Navigation, Send, User } from "lucide-react";

function EmergencyContacts() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSetupDone, setIsSetupDone] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const savedContacts = JSON.parse(localStorage.getItem("emergencyContacts"));
    if (savedContacts && savedContacts.length > 0) {
      setContacts(savedContacts);
      setIsSetupDone(true);
    }
  }, []);

  const saveSetup = () => {
    if (contacts.length === 0) return alert("Please add at least one responder.");
    localStorage.setItem("emergencyContacts", JSON.stringify(contacts));
    setIsSetupDone(true);
    setIsEditing(false);
  };

  const addContact = () => {
    if (!name || !phone) return;
    setContacts([...contacts, { name, phone }]);
    setName("");
    setPhone("");
  };

  const removeContact = (index) => {
    const updated = contacts.filter((_, i) => i !== index);
    setContacts(updated);
  };

  const triggerSOS = () => {
    if (contacts.length === 0) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
      const message = `🚨 VITALIS SOS ALERT\nEmergency help needed.\nLocation: ${mapLink}`;
      contacts.forEach((contact) => {
        window.open(`https://wa.me/${contact.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, "_blank");
      });
      window.location.href = "tel:112";
    });
  };

  return (
    <div className="vital-scan-container" style={{ background: '#f8fafc', padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Compact Header */}
      <div className="vital-scan-header" style={{ textAlign: 'left', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.6rem', color: '#1e293b', marginBottom: '4px' }}>Emergency Network</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage your responders and SOS protocols.</p>
      </div>

      <div className="vital-scan-main" style={{ 
        display: 'grid', 
        gridTemplateColumns: window.innerWidth > 800 ? '1fr 1fr' : '1fr', 
        gap: '20px',
        alignItems: 'start' 
      }}>
        
        {/* LEFT COLUMN: Setup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="emergency-disclaimer" style={{ background: '#fff1f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 16px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <ShieldAlert size={18} color="#e11d48" />
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#9f1239', fontWeight: '500' }}>
                SOS Protocol Active
              </p>
            </div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <h2 style={{ fontSize: '1rem', marginBottom: '16px', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={18} /> {isSetupDone && !isEditing ? "System Armed" : "Responder Setup"}
            </h2>
            
            {!isSetupDone || isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                  <input
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '10px 10px 10px 34px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                  <input
                    placeholder="WhatsApp No."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '10px 10px 10px 34px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
                <button onClick={addContact} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                  + Add Responder
                </button>
                <button onClick={saveSetup} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}>
                  Save Network
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px', borderRadius: '50%', marginBottom: '12px', display: 'inline-block' }}>
                  <Navigation size={24} />
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px' }}>GPS location sharing is ready.</p>
                <button onClick={() => setIsEditing(true)} style={{ color: '#3b82f6', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>
                  Edit Responders
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Action & List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Smaller Compact SOS Button */}
          <div 
            onClick={triggerSOS}
            style={{ 
              cursor: 'pointer', 
              background: 'linear-gradient(135deg, #ef4444, #d62727)', 
              borderRadius: '16px', 
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.2)',
            }}
          >
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}>
              <Send size={28} color="white" />
            </div>
            <div>
              <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>SEND SOS</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.8rem' }}>Alert {contacts.length} people</p>
            </div>
          </div>

          {/* Compact Responder List */}
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Active Responders</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {contacts.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', fontStyle: 'italic' }}>No contacts added.</p>
              ) : (
                contacts.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '10px', border: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ background: '#e0f2fe', color: '#0ea5e9', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Phone size={14} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.85rem' }}>{c.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.phone}</div>
                      </div>
                    </div>
                    {(isEditing || !isSetupDone) && (
                      <button onClick={() => removeContact(i)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
export default EmergencyContacts;