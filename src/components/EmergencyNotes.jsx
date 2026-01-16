import { useState, useEffect } from 'react';
import './EmergencyNotes.css';

/**
 * Smart Emergency Notes
 * Quick notes saved locally during emergency
 */
function EmergencyNotes({ sessionId = 'default' }) {
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem(`emergency_notes_${sessionId}`);
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, [sessionId]);

  // Auto-save notes
  useEffect(() => {
    if (notes) {
      const timer = setTimeout(() => {
        localStorage.setItem(`emergency_notes_${sessionId}`, notes);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [notes, sessionId]);

  const handleClear = () => {
    if (window.confirm('Clear all notes?')) {
      setNotes('');
      localStorage.removeItem(`emergency_notes_${sessionId}`);
    }
  };

  return (
    <div className="emergency-notes">
      <div className="notes-header">
        <label htmlFor="emergency-notes-input">📝 Quick Notes</label>
        {saved && <span className="save-indicator">✓ Saved</span>}
      </div>
      
      <textarea
        id="emergency-notes-input"
        className="notes-input"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add notes: symptoms, timeline, medications, allergies..."
        rows={4}
      />
      
      <div className="notes-footer">
        <span className="notes-hint">Saved locally • Available in session summary</span>
        {notes && (
          <button className="clear-notes-btn" onClick={handleClear}>
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

export default EmergencyNotes;
