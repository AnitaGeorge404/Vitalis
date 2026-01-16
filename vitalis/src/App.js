import React, { useState, useCallback } from 'react';
import './App.css';
import CameraFeed from './components/CameraFeed';
import FeedbackPanel from './components/FeedbackPanel';
import RhythmAssist from './components/RhythmAssist';
import SetupGuide from './components/SetupGuide';
import SimulationMode from './components/SimulationMode';
import EmergencyChatbot from './components/EmergencyChatbot';

function App() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [postureCorrect, setPostureCorrect] = useState(null);
  const [compressionRate, setCompressionRate] = useState(0);
  const [compressionCount, setCompressionCount] = useState(0);
  const [rhythmFeedback, setRhythmFeedback] = useState('');
  const [postureFeedback, setPostureFeedback] = useState('');

  const handlePostureUpdate = useCallback((isCorrect, feedback) => {
    setPostureCorrect(isCorrect);
    setPostureFeedback(feedback);
  }, []);

  const handleCompressionUpdate = useCallback((count, rate) => {
    setCompressionCount(count);
    setCompressionRate(rate);
  }, []);

  const handleRhythmFeedback = useCallback((feedback) => {
    setRhythmFeedback(feedback);
  }, []);

  const startSession = () => {
    setIsSetupComplete(true);
    setCompressionCount(0);
    setCompressionRate(0);
  };

  const startSimulation = () => {
    setIsSimulationMode(true);
    setIsSetupComplete(true);
    setCompressionCount(0);
    setCompressionRate(0);
  };

  const resetSession = () => {
    setIsSetupComplete(false);
    setIsSimulationMode(false);
    setPostureCorrect(null);
    setCompressionCount(0);
    setCompressionRate(0);
    setRhythmFeedback('');
    setPostureFeedback('');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🫀 CPR COACH - RHYTHM ASSIST</h1>
        <p className="disclaimer">
          ⚠️ This tool provides CPR guidance only and does not replace professional medical training.
        </p>
      </header>

      {!isSetupComplete ? (
        <SetupGuide onStart={startSession} onStartSimulation={startSimulation} />
      ) : (
        <div className="main-content">
          <div className="camera-section">
            {isSimulationMode ? (
              <SimulationMode
                onPostureUpdate={handlePostureUpdate}
                onCompressionUpdate={handleCompressionUpdate}
                isActive={isSetupComplete}
              />
            ) : (
              <CameraFeed
                onPostureUpdate={handlePostureUpdate}
                onCompressionUpdate={handleCompressionUpdate}
                isActive={isSetupComplete}
              />
            )}
          </div>

          <div className="control-panel">
            <FeedbackPanel
              postureCorrect={postureCorrect}
              postureFeedback={postureFeedback}
              rhythmFeedback={rhythmFeedback}
              compressionCount={compressionCount}
              compressionRate={compressionRate}
            />

            <RhythmAssist
              postureCorrect={postureCorrect}
              compressionRate={compressionRate}
              onRhythmFeedback={handleRhythmFeedback}
              isActive={isSetupComplete}
            />

            <button className="reset-button" onClick={resetSession}>
              🔄 Reset Session
            </button>
          </div>
        </div>
      )}

      {/* Emergency Chatbot Toggle Button */}
      {!isChatbotOpen && (
        <button 
          className="chatbot-toggle-btn"
          onClick={() => setIsChatbotOpen(true)}
          aria-label="Open emergency chatbot"
        >
          🆘 Emergency Help
        </button>
      )}

      {/* Emergency Chatbot */}
      {isChatbotOpen && (
        <EmergencyChatbot onClose={() => setIsChatbotOpen(false)} />
      )}
    </div>
  );
}

export default App;
