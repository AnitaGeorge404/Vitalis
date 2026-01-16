/**
 * Mock Pose Data Generator for CPR Simulation
 * Generates realistic MediaPipe Pose landmarks for testing without a camera
 */

class MockPoseGenerator {
  constructor() {
    this.startTime = Date.now();
    this.targetBPM = 110;
    this.scenario = 'correct'; // 'correct', 'bentArms', 'bendingBack', 'wrongRhythm', 'wrongHandPosition'
    
    // Base positions for landmarks (normalized 0-1 coordinates)
    this.baseLandmarks = {
      leftShoulder: { x: 0.45, y: 0.35, z: 0 },
      rightShoulder: { x: 0.55, y: 0.35, z: 0 },
      leftElbow: { x: 0.43, y: 0.50, z: 0 },
      rightElbow: { x: 0.57, y: 0.50, z: 0 },
      leftWrist: { x: 0.48, y: 0.60, z: 0 },
      rightWrist: { x: 0.52, y: 0.60, z: 0 },
      leftHip: { x: 0.45, y: 0.70, z: 0 },
      rightHip: { x: 0.55, y: 0.70, z: 0 }
    };
    
    // Compression parameters
    this.compressionAmplitude = 0.05; // 5% of frame
    this.noiseAmplitude = 0.002; // Small noise for realism
  }

  /**
   * Set the simulation scenario
   */
  setScenario(scenario) {
    this.scenario = scenario;
    console.log(`Simulation scenario: ${scenario}`);
  }

  /**
   * Generate a complete pose frame based on elapsed time
   */
  generateFrame() {
    const elapsedSeconds = (Date.now() - this.startTime) / 1000;
    
    // Calculate compression phase based on scenario
    let frequency = (this.targetBPM / 60); // Hz
    
    if (this.scenario === 'wrongRhythm') {
      frequency = frequency * 1.5; // Too fast
    }
    
    const phase = Math.sin(2 * Math.PI * frequency * elapsedSeconds);
    
    // Add small random noise for realism
    const noise = () => (Math.random() - 0.5) * this.noiseAmplitude;
    
    // Generate landmarks based on scenario
    const landmarks = new Array(33).fill(null).map(() => ({
      x: 0.5,
      y: 0.5,
      z: 0,
      visibility: 0.1
    }));
    
    // Calculate shoulder movement (compression motion)
    let shoulderYOffset = 0;
    if (phase > 0) {
      // Compression phase (moving down)
      shoulderYOffset = this.compressionAmplitude * phase;
    }
    
    // Scenario-specific modifications
    let elbowBend = 0;
    let spineBend = 0;
    let handOffset = 0;
    
    switch (this.scenario) {
      case 'bentArms':
        // Simulate bent elbows (angle < 160°)
        elbowBend = 0.08; // Move elbows inward
        break;
        
      case 'bendingBack':
        // Simulate bending at waist instead of shoulders
        spineBend = shoulderYOffset * 0.5;
        shoulderYOffset = shoulderYOffset * 0.3; // Less shoulder movement
        break;
        
      case 'wrongHandPosition':
        // Hands too far apart or off-center
        handOffset = 0.1;
        break;
        
      case 'correct':
      default:
        // Perfect CPR form
        break;
    }
    
    // LEFT SHOULDER (11)
    landmarks[11] = {
      x: this.baseLandmarks.leftShoulder.x + noise(),
      y: this.baseLandmarks.leftShoulder.y + shoulderYOffset + noise(),
      z: this.baseLandmarks.leftShoulder.z,
      visibility: 0.99
    };
    
    // RIGHT SHOULDER (12)
    landmarks[12] = {
      x: this.baseLandmarks.rightShoulder.x + noise(),
      y: this.baseLandmarks.rightShoulder.y + shoulderYOffset + noise(),
      z: this.baseLandmarks.rightShoulder.z,
      visibility: 0.99
    };
    
    // LEFT ELBOW (13)
    landmarks[13] = {
      x: this.baseLandmarks.leftElbow.x + elbowBend + noise(),
      y: this.baseLandmarks.leftElbow.y + shoulderYOffset * 0.7 + noise(),
      z: this.baseLandmarks.leftElbow.z,
      visibility: 0.99
    };
    
    // RIGHT ELBOW (14)
    landmarks[14] = {
      x: this.baseLandmarks.rightElbow.x - elbowBend + noise(),
      y: this.baseLandmarks.rightElbow.y + shoulderYOffset * 0.7 + noise(),
      z: this.baseLandmarks.rightElbow.z,
      visibility: 0.99
    };
    
    // LEFT WRIST (15)
    landmarks[15] = {
      x: this.baseLandmarks.leftWrist.x + handOffset + noise(),
      y: this.baseLandmarks.leftWrist.y + shoulderYOffset * 0.5 + noise(),
      z: this.baseLandmarks.leftWrist.z,
      visibility: 0.99
    };
    
    // RIGHT WRIST (16)
    landmarks[16] = {
      x: this.baseLandmarks.rightWrist.x - handOffset + noise(),
      y: this.baseLandmarks.rightWrist.y + shoulderYOffset * 0.5 + noise(),
      z: this.baseLandmarks.rightWrist.z,
      visibility: 0.99
    };
    
    // LEFT HIP (23)
    landmarks[23] = {
      x: this.baseLandmarks.leftHip.x + noise(),
      y: this.baseLandmarks.leftHip.y + spineBend + noise(),
      z: this.baseLandmarks.leftHip.z,
      visibility: 0.99
    };
    
    // RIGHT HIP (24)
    landmarks[24] = {
      x: this.baseLandmarks.rightHip.x + noise(),
      y: this.baseLandmarks.rightHip.y + spineBend + noise(),
      z: this.baseLandmarks.rightHip.z,
      visibility: 0.99
    };
    
    return {
      poseLandmarks: landmarks
    };
  }

  /**
   * Reset simulation timer
   */
  reset() {
    this.startTime = Date.now();
  }
}

export default MockPoseGenerator;
