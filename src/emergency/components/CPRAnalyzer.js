/**
 * CPRAnalyzer: Analyzes pose landmarks for CPR posture and compression detection
 * Enforces correct CPR biomechanics with real-time feedback
 * OPTIMIZED: Better compression counting accuracy
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
    this.compressionStartY = null;
    this.compressionMinY = null; // Lowest point (most compressed)
    this.compressionMaxY = null; // Highest point (least compressed)
    this.lastCompressionTime = 0;
    this.minTimeBetweenCompressions = 300; // Minimum 300ms between compressions

    // Posture validation
    this.isPostureValid = false;
    this.lastSpineAngle = null;

    // Elbow state tracking with temporal smoothing
    this.elbowStateHistory = [];
    this.elbowStateHistorySize = 5; // Require 5 consecutive frames for state change
    this.currentElbowState = 'GOOD';

    // Smoothing filters
    this.landmarkHistory = [];
    this.historySize = 5;
    this.shoulderYHistory = [];
    this.shoulderYHistorySize = 3;

    // Audio feedback
    this.audioContext = null;
    this.lastAudioFeedbackTime = 0;
    this.audioFeedbackCooldown = 3000;

    // Thresholds - OPTIMIZED for better compression detection
    this.ELBOW_ANGLE_GOOD = 155;        // Excellent form
    this.ELBOW_ANGLE_ACCEPTABLE = 135;  // Still valid CPR
    this.SPINE_ANGLE_CHANGE_THRESHOLD = 15;
    this.COMPRESSION_DEPTH_MIN = 0.008; // Minimum depth to count as valid compression (lowered)
    this.COMPRESSION_VELOCITY_THRESHOLD = 0.003; // Minimum movement speed to detect motion
    this.HAND_POSITION_TOLERANCE = 0.1;

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

    // Evaluate posture components
    const armPosture = this.checkArmStraightness(smoothedLandmarks);
    const spineStability = this.checkSpineStability(smoothedLandmarks);
    const handPosition = this.checkHandPosition(smoothedLandmarks);

    // Update elbow state with temporal smoothing
    this.updateElbowState(armPosture.elbowState);

    // Spine stability is HARD GATE (biomechanically critical)
    // Elbow is SOFT GUIDANCE (quality indicator)
    const spineValid = spineStability.isStable;
    const elbowAllowsCompression = this.currentElbowState !== 'BAD';

    // Compression detection requires stable spine + acceptable elbow state
    this.isPostureValid = spineValid && elbowAllowsCompression;

    // Build comprehensive feedback
    let postureFeedback = '';
    if (!spineStability.isStable) {
      postureFeedback = '⚠ Keep your back straight - Use shoulders only!';
    } else if (this.currentElbowState === 'BAD') {
      postureFeedback = '⚠ Straighten your arms - Lock elbows!';
    } else if (this.currentElbowState === 'ACCEPTABLE') {
      postureFeedback = '⚡ Good! Try to lock elbows more';
    } else if (!handPosition.isCorrect) {
      postureFeedback = '⚡ Adjust hands to center of chest';
    } else {
      postureFeedback = '✓ Excellent form - Keep it up!';
    }

    // Compression detection (shoulder-driven only)
    if (spineValid) {
      this.detectCompression(smoothedLandmarks);
    } else {
      this.resetCompressionState();
    }

    const compressionRate = this.calculateCompressionRate();

    if (this.onPostureUpdate) {
      this.onPostureUpdate(this.isPostureValid, postureFeedback);
    }

    if (this.onCompressionUpdate) {
      this.onCompressionUpdate(this.compressionCount, compressionRate);
    }

    // Audio feedback only for critical errors (spine bending)
    if (!spineStability.isStable) {
      this.playAudioFeedback();
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
    this.compressionStartY = null;
    this.compressionMinY = null;
    this.compressionMaxY = null;
  }

  /**
   * IMPROVED COMPRESSION DETECTION
   * Camera coordinates: Y increases downward (0 at top, 1 at bottom)
   * During CPR compression:
   * - Shoulders move DOWN (Y increases) - this is the compression phase
   * - Shoulders move UP (Y decreases) - this is the release/recoil phase
   * 
   * Count compression at the END of compression phase (when starting to come back up)
   */
  detectCompression(landmarks) {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];

    if (!leftShoulder || !rightShoulder) return;

    const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;

    // Apply smoothing
    this.shoulderYHistory.push(avgShoulderY);
    if (this.shoulderYHistory.length > this.shoulderYHistorySize) {
      this.shoulderYHistory.shift();
    }

    const smoothedShoulderY = this.shoulderYHistory.reduce((sum, val) => sum + val, 0) / 
                             this.shoulderYHistory.length;

    // Initialize tracking variables
    if (this.lastShoulderY === null) {
      this.lastShoulderY = smoothedShoulderY;
      this.compressionMinY = smoothedShoulderY;
      this.compressionMaxY = smoothedShoulderY;
      return;
    }

    const deltaY = smoothedShoulderY - this.lastShoulderY;
    const velocity = Math.abs(deltaY);

    // Track min and max positions
    if (smoothedShoulderY > this.compressionMaxY) {
      this.compressionMaxY = smoothedShoulderY; // Shoulders moved down (more compressed)
    }
    if (smoothedShoulderY < this.compressionMinY) {
      this.compressionMinY = smoothedShoulderY; // Shoulders moved up (less compressed)
    }

    const now = Date.now();
    const timeSinceLastCompression = now - this.lastCompressionTime;

    // STATE 1: Not currently compressing - detect start of downward motion (compression)
    if (!this.isCompressing && deltaY > this.COMPRESSION_VELOCITY_THRESHOLD) {
      // Shoulders moving DOWN (Y increasing) - start of compression
      this.isCompressing = true;
      this.compressionStartY = smoothedShoulderY;
      this.compressionMaxY = smoothedShoulderY; // Reset max to current position
      console.log('[CPR] Compression started - shoulders moving down');
    }

    // STATE 2: Currently compressing - detect end of compression (upward motion)
    if (this.isCompressing && deltaY < -this.COMPRESSION_VELOCITY_THRESHOLD) {
      // Shoulders moving UP (Y decreasing) - compression complete, coming back up
      const compressionDepth = this.compressionMaxY - this.compressionMinY;
      
      // Validate compression depth and timing
      if (compressionDepth >= this.COMPRESSION_DEPTH_MIN && 
          timeSinceLastCompression >= this.minTimeBetweenCompressions) {
        
        this.isCompressing = false;
        this.compressionCount++;
        this.lastCompressionTime = now;
        this.compressionTimestamps.push(now);

        // Keep only last 10 seconds of timestamps for rate calculation
        const tenSecondsAgo = now - 10000;
        this.compressionTimestamps = this.compressionTimestamps.filter(
          timestamp => timestamp > tenSecondsAgo
        );

        console.log(`[CPR] ✓ Compression #${this.compressionCount} counted! Depth: ${(compressionDepth * 100).toFixed(2)}% of screen`);

        // Reset for next compression
        this.compressionMinY = smoothedShoulderY;
      } else if (compressionDepth < this.COMPRESSION_DEPTH_MIN) {
        console.log(`[CPR] × Compression too shallow (${(compressionDepth * 100).toFixed(2)}%), not counted`);
        this.isCompressing = false;
      } else {
        console.log('[CPR] × Compression too soon, not counted');
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
