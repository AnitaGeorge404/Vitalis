import React from 'react';
import './SetupGuide.css';

function SetupGuide({ onStart, onStartSimulation }) {
  return (
    <div className="setup-guide">
      <div className="setup-content">
        <h2>📹 Camera Setup Instructions</h2>
        
        <div className="setup-steps">
          <div className="setup-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Position Camera Sideways</h3>
              <p>Place your camera to capture a clear <strong>side view</strong> of the rescuer performing CPR.</p>
            </div>
          </div>

          <div className="setup-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Ensure Full Body Visibility</h3>
              <p>Make sure the following body parts are clearly visible:</p>
              <ul>
                <li>Shoulders</li>
                <li>Elbows</li>
                <li>Wrists</li>
                <li>Hips</li>
              </ul>
            </div>
          </div>

          <div className="setup-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Lighting & Positioning</h3>
              <p>Ensure good lighting and that the rescuer is centered in the frame.</p>
            </div>
          </div>

          <div className="setup-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Grant Camera Permission</h3>
              <p>When prompted, allow camera access for pose detection to work.</p>
            </div>
          </div>
        </div>

        <div className="setup-diagram">
          <div className="diagram-box">
            <div className="camera-icon">📷</div>
            <div className="person-side-view">
              <div className="body-part shoulder">●</div>
              <div className="body-part elbow">●</div>
              <div className="body-part wrist">●</div>
              <div className="body-part hip">●</div>
            </div>
            <p className="diagram-label">Side View Setup</p>
          </div>
        </div>

        <button className="start-button" onClick={onStart}>
          ▶️ Start with Live Camera
        </button>

        <div className="or-divider">
          <span>OR</span>
        </div>

        <button className="simulation-button" onClick={onStartSimulation}>
          🧪 Start Simulation Mode (No Camera)
        </button>

        <div className="setup-warning">
          <strong>Important:</strong> This tool is for training and guidance purposes only. 
          It does not diagnose medical conditions or replace professional CPR certification.
        </div>
      </div>
    </div>
  );
}

export default SetupGuide;
