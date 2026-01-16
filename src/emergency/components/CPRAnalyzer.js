/**
 * CPRAnalyzer: Analyzes pose landmarks for CPR posture and compression detection
 * EMERGENCY-OPTIMIZED: Prioritizes helping over perfection
 * - Counts compressions regardless of perfect form
 * - Provides helpful guidance, not strict enforcement
 * - Forgiving thresholds for real emergency situations
 */
class CPRAnalyzer {
  constructor(onPostureUpdate, onCompressionUpdate) {
    this.onPostureUpdate = onPostureUpdate;
    this.onCompressionUpdate = onCompressionUpdate;

    // Compression tracking
    this.compressionCount = 0;
    this.lastShoulderY = null;
    this.isCompressing = false;
    this.compressionTimestamps = [];
    this.peakShoulderY = null;
    this.troughShoulderY = null;

    // Posture validation (for feedback only, not blocking)
    this.isPostureValid = false;
    this.lastSpineAngle = null;

    // Elbow state tracking with temporal smoothing
    this.elbowStateHistory = [];
    this.elbowStateHistorySize = 3; // Reduced from 5 for faster response
    this.currentElbowState = 'GOOD';

    // Smoothing filters
    this.landmarkHistory = [];
    this.historySize = 3; // Reduced from 5 for better responsiveness
    this.shoulderYHistory = [];
    this.shoulderYHistorySize = 3;

    // Audio feedback
    this.audioContext = null;
    this.lastAudioFeedbackTime = 0;
    this.audioFeedbackCooldown = 5000; // Increased to be less annoying

    // EMERGENCY-FRIENDLY THRESHOLDS
    // More forgiving for real emergency situations
    this.ELBOW_ANGLE_GOOD = 150;        // Lowered from 155 (easier to achieve)
    this.ELBOW_ANGLE_ACCEPTABLE = 120;  // Lowered from 135 (much more forgiving)
    this.SPINE_ANGLE_CHANGE_THRESHOLD = 25; // Increased from 15 (allow more movement)
    this.COMPRESSION_THRESHOLD = 0.012; // Lowered from 0.015 (detect smaller movements)
    this.MIN_COMPRESSION_DEPTH = 0.008; // Minimum depth to count (very forgiving)
    this.HAND_POSITION_TOLERANCE = 0.15; // Increased from 0.1 (more forgiving)

    this.initAudio();
  }

  initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.error('Web Audio API not supported:', error);
    }
  }

  analyzePose(landmarks) {
    const smoothedLandmarks = this.smoothLandmarks(landmarks);

    // Evaluate posture components (for feedback only)
    const armPosture = this.checkArmStraightness(smoothedLandmarks);
    const spineStability = this.checkSpineStability(smoothedLandmarks);
    const handPosition = this.checkHandPosition(smoothedLandmarks);

    // Update elbow state with temporal smoothing
    this.updateElbowState(armPosture.elbowState);

    // CRITICAL CHANGE: Always allow compression detection
    // In emergencies, imperfect CPR is better than no CPR
    // We provide guidance but NEVER block compression counting
    this.isPostureValid = true; // Always true - we're here to help, not judge

    // Build HELPFUL, ENCOURAGING feedback
    let postureFeedback = '';
    
    // Priority 1: Extreme spine bending (only truly dangerous thing)
    if (!spineStability.isStable && spineStability.angleChange > 35) {
      postureFeedback = '💡 Tip: Use your shoulders, not your back';
      // Only play audio for extreme cases
      this.playAudioFeedback();
    }
    // Priority 2: Very bent elbows (affects effectiveness)
    else if (this.currentElbowState === 'BAD' && armPosture.worstAngle < 100) {
      postureFeedback = '💡 Tip: Straighten your arms a bit more';
    }
    // Priority 3: Helpful suggestions
    else if (this.currentElbowState === 'ACCEPTABLE') {
      postureFeedback = '👍 Good job! Keep going strong';
    }
    else if (!handPosition.isCorrect) {
      postureFeedback = '👍 Doing great! Keep it up';
    }
    // Default: Encouragement
    else {
      postureFeedback = '✓ Excellent! You\'re doing CPR correctly';
    }

    // ALWAYS detect compressions - this is what matters most
    this.detectCompression(smoothedLandmarks);

    const compressionRate = this.calculateCompressionRate();

    if (this.onPostureUpdate) {
      this.onPostureUpdate(this.isPostureValid, postureFeedback);
    }

    if (this.onCompressionUpdate) {
      this.onCompressionUpdate(this.compressionCount, compressionRate);
    }
  }

  smoothLandmarks(landmarks) {
    this.landmarkHistory.push(landmarks);
    if (this.landmarkHistory.length > this.historySize) {
      this.landmarkHistory.shift();
    }

    if (this.landmarkHistory.length === 1) {
      return landmarks;
    }

    const smoothed = landmarks.map((landmark, index) => {
      let sumX = 0, sumY = 0, sumZ = 0;
      this.landmarkHistory.forEach(frame => {
        if (frame[index]) {
          sumX += frame[index].x;
          sumY += frame[index].y;
          sumZ += frame[index].z || 0;
        }
      });
      const count = this.landmarkHistory.length;
      return {
        x: sumX / count,
        y: sumY / count,
        z: sumZ / count,
        visibility: landmark.visibility
      };
    });

    return smoothed;
  }

  calculateAngle(point1, point2, point3) {
    const vector1 = {
      x: point1.x - point2.x,
      y: point1.y - point2.y
    };

    const vector2 = {
      x: point3.x - point2.x,
      y: point3.y - point2.y
    };

    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
    const magnitude1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2);
    const magnitude2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2);
    const angleRadians = Math.acos(dotProduct / (magnitude1 * magnitude2));
    const angleDegrees = (angleRadians * 180) / Math.PI;

    return angleDegrees;
  }

  /**
   * Check arm straightness with 3-tier classification
   * Returns elbow state: GOOD, ACCEPTABLE, or BAD
   */
  checkArmStraightness(landmarks) {
    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];
    const rightShoulder = landmarks[12];
    const rightElbow = landmarks[14];
    const rightWrist = landmarks[16];

    const minVisibility = 0.5;
    const leftVisible = leftShoulder?.visibility > minVisibility &&
                       leftElbow?.visibility > minVisibility &&
                       leftWrist?.visibility > minVisibility;
    const rightVisible = rightShoulder?.visibility > minVisibility &&
                        rightElbow?.visibility > minVisibility &&
                        rightWrist?.visibility > minVisibility;

    if (!leftVisible && !rightVisible) {
      return { elbowState: 'ACCEPTABLE', leftAngle: null, rightAngle: null };
    }

    let leftAngle = null;
    let rightAngle = null;

    if (leftVisible) {
      leftAngle = this.calculateAngle(leftShoulder, leftElbow, leftWrist);
    }

    if (rightVisible) {
      rightAngle = this.calculateAngle(rightShoulder, rightElbow, rightWrist);
    }

    // Use the worse of the two arms for classification
    const worstAngle = Math.min(
      leftAngle !== null ? leftAngle : 180,
      rightAngle !== null ? rightAngle : 180
    );

    // Three-tier classification
    let elbowState;
    if (worstAngle >= this.ELBOW_ANGLE_GOOD) {
      elbowState = 'GOOD';
    } else if (worstAngle >= this.ELBOW_ANGLE_ACCEPTABLE) {
      elbowState = 'ACCEPTABLE';
    } else {
      elbowState = 'BAD';
    }

    return { elbowState, leftAngle, rightAngle, worstAngle };
  }

  /**
   * Update elbow state with temporal smoothing
   * Requires 5 consecutive frames to change state
   */
  updateElbowState(newState) {
    this.elbowStateHistory.push(newState);
    
    if (this.elbowStateHistory.length > this.elbowStateHistorySize) {
      this.elbowStateHistory.shift();
    }

    // Only change state if all recent frames agree
    if (this.elbowStateHistory.length === this.elbowStateHistorySize) {
      const allSame = this.elbowStateHistory.every(state => state === newState);
      
      if (allSame) {
        this.currentElbowState = newState;
      }
    }
  }

  checkSpineStability(landmarks) {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    const minVisibility = 0.5;
    const allVisible = leftShoulder?.visibility > minVisibility &&
                      rightShoulder?.visibility > minVisibility &&
                      leftHip?.visibility > minVisibility &&
                      rightHip?.visibility > minVisibility;

    if (!allVisible) {
      return { isStable: false };
    }

    const shoulderMidpoint = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2
    };

    const hipMidpoint = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2
    };

    const deltaX = shoulderMidpoint.x - hipMidpoint.x;
    const deltaY = shoulderMidpoint.y - hipMidpoint.y;
    const spineAngle = Math.abs(Math.atan2(deltaX, deltaY) * (180 / Math.PI));

    if (this.lastSpineAngle === null) {
      this.lastSpineAngle = spineAngle;
      return { isStable: true, spineAngle };
    }

    const angleChange = Math.abs(spineAngle - this.lastSpineAngle);
    const isStable = angleChange < this.SPINE_ANGLE_CHANGE_THRESHOLD;

    this.lastSpineAngle = this.lastSpineAngle * 0.9 + spineAngle * 0.1;

    return { isStable, spineAngle, angleChange };
  }

  checkHandPosition(landmarks) {
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];

    const minVisibility = 0.5;
    const allVisible = leftWrist?.visibility > minVisibility &&
                      rightWrist?.visibility > minVisibility &&
                      leftShoulder?.visibility > minVisibility &&
                      rightShoulder?.visibility > minVisibility;

    if (!allVisible) {
      return { isCorrect: true };
    }

    const wristMidpoint = {
      x: (leftWrist.x + rightWrist.x) / 2,
      y: (leftWrist.y + rightWrist.y) / 2
    };

    const shoulderMidpoint = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2
    };

    const wristDistance = Math.abs(leftWrist.x - rightWrist.x);
    const wristsClose = wristDistance < this.HAND_POSITION_TOLERANCE;

    const horizontalAlignment = Math.abs(wristMidpoint.x - shoulderMidpoint.x);
    const isCentered = horizontalAlignment < this.HAND_POSITION_TOLERANCE;

    const isCorrect = wristsClose && isCentered;

    return { isCorrect, wristDistance, horizontalAlignment };
  }

  resetCompressionState() {
    this.isCompressing = false;
    this.peakShoulderY = null;
    this.troughShoulderY = null;
  }

  detectCompression(landmarks) {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];

    if (!leftShoulder || !rightShoulder) return;

    const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;

    this.shoulderYHistory.push(avgShoulderY);
    if (this.shoulderYHistory.length > this.shoulderYHistorySize) {
      this.shoulderYHistory.shift();
    }

    const smoothedShoulderY = this.shoulderYHistory.reduce((sum, val) => sum + val, 0) / 
                             this.shoulderYHistory.length;

    if (this.lastShoulderY === null) {
      this.lastShoulderY = smoothedShoulderY;
      this.peakShoulderY = smoothedShoulderY;
      this.troughShoulderY = smoothedShoulderY;
      return;
    }

    const deltaY = smoothedShoulderY - this.lastShoulderY;

    // Track peak (highest point - smallest Y value)
    if (smoothedShoulderY < this.peakShoulderY) {
      this.peakShoulderY = smoothedShoulderY;
    }

    // Track trough (lowest point - largest Y value)
    if (smoothedShoulderY > this.troughShoulderY) {
      this.troughShoulderY = smoothedShoulderY;
    }

    // EMERGENCY-FRIENDLY COMPRESSION DETECTION
    // Detect upward motion (compression phase)
    if (deltaY > this.COMPRESSION_THRESHOLD && !this.isCompressing) {
      this.isCompressing = true;
      this.peakShoulderY = smoothedShoulderY;
    }

    // Detect downward motion (release phase) - count the compression
    if (deltaY < -this.COMPRESSION_THRESHOLD && this.isCompressing) {
      const compressionDepth = this.troughShoulderY - this.peakShoulderY;
      
      // MUCH MORE FORGIVING: Accept any visible movement
      // In emergencies, counting compressions accurately is more important
      // than perfect depth (depth is hard to measure from 2D camera anyway)
      if (compressionDepth > this.MIN_COMPRESSION_DEPTH) {
        this.isCompressing = false;
        this.compressionCount++;
        this.compressionTimestamps.push(Date.now());

        // Keep only recent compressions for rate calculation
        const tenSecondsAgo = Date.now() - 10000;
        this.compressionTimestamps = this.compressionTimestamps.filter(
          timestamp => timestamp > tenSecondsAgo
        );

        console.log(`[CPR Analyzer] Compression detected! Count: ${this.compressionCount}, Depth: ${compressionDepth.toFixed(4)}`);

        this.troughShoulderY = smoothedShoulderY;
      } else {
        // Even if depth is minimal, still reset state
        // This prevents getting stuck in compressing state
        this.isCompressing = false;
      }
    }

    this.lastShoulderY = smoothedShoulderY;
  }

  calculateCompressionRate() {
    if (this.compressionTimestamps.length < 2) {
      return 0;
    }

    const recentCompressions = this.compressionTimestamps.slice(-10);
    const timeSpan = recentCompressions[recentCompressions.length - 1] - recentCompressions[0];

    if (timeSpan === 0) return 0;

    const rate = ((recentCompressions.length - 1) / timeSpan) * 60000;

    return Math.round(rate);
  }

  playAudioFeedback() {
    const now = Date.now();
    if (now - this.lastAudioFeedbackTime < this.audioFeedbackCooldown) {
      return;
    }

    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);

      this.lastAudioFeedbackTime = now;
    } catch (error) {
      console.error('Audio feedback error:', error);
    }
  }
}

export default CPRAnalyzer;
