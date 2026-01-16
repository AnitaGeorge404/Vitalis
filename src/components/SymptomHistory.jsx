import { useState, useEffect } from 'react';
import './SymptomHistory.css';

/**
 * Symptom History Log
 * Store and display previous health checks locally
 */
function SymptomHistory({ currentCheck = null, maxItems = 10 }) {
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('symptom_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    // Save current check to history if provided
    if (currentCheck) {
      const newEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...currentCheck
      };

      const updatedHistory = [newEntry, ...history].slice(0, maxItems);
      setHistory(updatedHistory);
      localStorage.setItem('symptom_history', JSON.stringify(updatedHistory));
    }
  }, [currentCheck, maxItems]);

  const clearHistory = () => {
    if (window.confirm('Clear all symptom history?')) {
      setHistory([]);
      localStorage.removeItem('symptom_history');
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="symptom-history">
      <button 
        className="history-toggle"
        onClick={() => setShowHistory(!showHistory)}
      >
        <span className="history-icon">📋</span>
        <span>Symptom History ({history.length})</span>
        <span className="toggle-arrow">{showHistory ? '▼' : '▶'}</span>
      </button>

      {showHistory && (
        <div className="history-content">
          <div className="history-header">
            <h4>Previous Checks</h4>
            <button className="clear-history-btn" onClick={clearHistory}>
              Clear All
            </button>
          </div>

          <div className="history-timeline">
            {history.map((entry) => (
              <div key={entry.id} className="history-entry">
                <div className="entry-marker" />
                <div className="entry-content">
                  <div className="entry-header">
                    <span className="entry-time">{formatDate(entry.timestamp)}</span>
                    {entry.severity && (
                      <span className={`entry-severity ${entry.severity}`}>
                        {entry.severity}
                      </span>
                    )}
                  </div>
                  
                  {entry.symptoms && (
                    <div className="entry-symptoms">
                      {Array.isArray(entry.symptoms) 
                        ? entry.symptoms.join(', ')
                        : entry.symptoms
                      }
                    </div>
                  )}

                  {entry.notes && (
                    <div className="entry-notes">{entry.notes}</div>
                  )}

                  {entry.painLevel !== undefined && (
                    <div className="entry-pain">
                      Pain: {entry.painLevel}/10
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SymptomHistory;
