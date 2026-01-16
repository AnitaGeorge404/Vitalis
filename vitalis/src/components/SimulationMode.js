import React, { useRef, useEffect, useState } from 'react';
import './SimulationMode.css';
import MockPoseGenerator from './MockPoseGenerator';
import CPRAnalyzer from './CPRAnalyzer';

function SimulationMode({ onPostureUpdate, onCompressionUpdate, isActive }) {
  const canvasRef = useRef(null);
  const [scenario, setScenario] = useState('correct');
  const mockGeneratorRef = useRef(null);
  const cprAnalyzerRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    // Initialize Mock Generator and CPR Analyzer
    mockGeneratorRef.current = new MockPoseGenerator();
    cprAnalyzerRef.current = new CPRAnalyzer(onPostureUpdate, onCompressionUpdate);

    // Start simulation loop
    const simulationLoop = () => {
      if (!mockGeneratorRef.current || !cprAnalyzerRef.current) return;

      // Generate mock pose data
      const poseResults = mockGeneratorRef.current.generateFrame();

      // Analyze using the SAME logic as real camera
      if (poseResults.poseLandmarks) {
        cprAnalyzerRef.current.analyzePose(poseResults.poseLandmarks);
        drawPoseOnCanvas(poseResults.poseLandmarks);
      }

      animationFrameRef.current = requestAnimationFrame(simulationLoop);
    };

    simulationLoop();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, onPostureUpdate, onCompressionUpdate]);

  // Update scenario when user selects different option
  useEffect(() => {
    if (mockGeneratorRef.current) {
      mockGeneratorRef.current.setScenario(scenario);
      mockGeneratorRef.current.reset();
    }
  }, [scenario]);

  const drawPoseOnCanvas = (landmarks) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, width, height);

    // Draw landmarks
    const relevantIndices = [11, 12, 13, 14, 15, 16, 23, 24];
    
    relevantIndices.forEach(index => {
      const landmark = landmarks[index];
      if (landmark && landmark.visibility > 0.5) {
        const x = landmark.x * width;
        const y = landmark.y * height;

        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#00ff00';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Draw connections
    const connections = [
      [11, 13], [13, 15], // Left arm
      [12, 14], [14, 16], // Right arm
      [11, 23], [12, 24], // Torso
      [11, 12], [23, 24]  // Shoulders and hips
    ];

    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;

    connections.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];

      if (start && end && start.visibility > 0.5 && end.visibility > 0.5) {
        ctx.beginPath();
        ctx.moveTo(start.x * width, start.y * height);
        ctx.lineTo(end.x * width, end.y * height);
        ctx.stroke();
      }
    });

    // Draw scenario label
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`Scenario: ${scenario}`, 20, 30);
  };

  return (
    <div className="simulation-mode">
      <div className="simulation-header">
        <h3>🧪 SIMULATION MODE - Testing & Demo</h3>
        <p className="simulation-note">Using synthetic pose data to validate CPR logic</p>
      </div>

      <div className="simulation-canvas-container">
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="simulation-canvas"
        />
      </div>

      <div className="scenario-selector">
        <h4>Select CPR Scenario:</h4>
        <div className="scenario-buttons">
          <button
            className={`scenario-btn ${scenario === 'correct' ? 'active' : ''}`}
            onClick={() => setScenario('correct')}
          >
            ✅ Correct CPR
          </button>
          <button
            className={`scenario-btn ${scenario === 'bentArms' ? 'active' : ''}`}
            onClick={() => setScenario('bentArms')}
          >
            ❌ Bent Arms
          </button>
          <button
            className={`scenario-btn ${scenario === 'bendingBack' ? 'active' : ''}`}
            onClick={() => setScenario('bendingBack')}
          >
            ❌ Bending Back
          </button>
          <button
            className={`scenario-btn ${scenario === 'wrongRhythm' ? 'active' : ''}`}
            onClick={() => setScenario('wrongRhythm')}
          >
            ⚡ Wrong Rhythm
          </button>
          <button
            className={`scenario-btn ${scenario === 'wrongHandPosition' ? 'active' : ''}`}
            onClick={() => setScenario('wrongHandPosition')}
          >
            🤚 Wrong Hand Position
          </button>
        </div>
      </div>

      <div className="simulation-info">
        <p>💡 <strong>Note:</strong> This mode uses the same CPR analysis logic as live camera mode.</p>
        <p>🎯 Use this to verify compression counting, posture validation, and rhythm detection.</p>
      </div>
    </div>
  );
}

export default SimulationMode;
