/**
 * CPRAnalyzer: Analyzes pose landmarks for CPR posture and compression detection
 * Enforces correct CPR biomechanics:
 * 1. Arms must remain straight (elbow angle >= 160°)
 * 2. Back must remain relatively straight (no excessive bending)
 * 3. Compressions detected via shoulder vertical movement only
 * 4. Hand position must be centered
 */
class CPRAnalyzer {
  constructor(onPostureUpdate, onCompressionUpdate) {
    this.onPostureUpdate = onPostureUpdate;
    this.onCompressionUpdate = onCompressionUpdate;

    // Compression tracking
    this.compressionCount = 0;
    this.lastShoulderY = null;
    this.isCompressing = false;
    this.compressionStartTime = Date.now();
    this.compressionTimestamps = [];
    this.peakShoulderY = null; // Track compression peak for cycle detection
    this.troughShoulderY = null; // Track compression trough

    // Posture validation state
    this.isPostureValid = false;
    this.lastSpineAngle = null;

    // Smoothing filter for landmarks (moving average)
    this.landmarkHistory = [];
    this.historySize = 5;

    // Smoothing for shoulder Y position
    this.shoulderYHistory = [];
    this.shoulderYHistorySize = 3;

    // Audio feedback
    this.audioContext = null;
    this.lastAudioFeedbackTime = 0;
    this.audioFeedbackCooldown = 3000; // 3 seconds between audio warnings

    // Thresholds
    this.ELBOW_ANGLE_THRESHOLD = 160; // Degrees
    this.SPINE_ANGLE_CHANGE_THRESHOLD = 15; // Degrees
    this.COMPRESSION_THRESHOLD = 0.015; // 1.5% of frame height
    this.HAND_POSITION_TOLERANCE = 0.1; // 10% of frame width

    this.initAudio();
  }

  initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.error('Web Audio API not supported:', error);
    }
  }

  /**
   * Main analysis function called on each pose detection frame
   */
  analyzePose(landmarks) {
    // Apply smoothing filter
    const smoothedLandmarks = this.smoothLandmarks(landmarks);

    // POSTURE VALIDATION LAYER (Highest Priority)
    const armPosture = this.checkArmStraightness(smoothedLandmarks);
    const spineStability = this.checkSpineStability(smoothedLandmarks);
    const handPosition = this.checkHandPosition(smoothedLandmarks);

    // Combine posture checks
    this.isPostureValid = armPosture.isCorrect && spineStability.isStable;

    // Build comprehensive feedback
    let postureFeedback = '';
    if (!armPosture.isCorrect) {
      postureFeedback = '⚠ Lock your elbows - Keep arms straight!';
    } else if (!spineStability.isStable) {
      postureFeedback = '⚠ Use your shoulders, not your back!';
    } else if (!handPosition.isCorrect) {
      postureFeedback = '⚠ Place both hands at center of chest';
    } else {
      postureFeedback = '✓ Perfect posture - Keep it up!';
    }

    // COMPRESSION DETECTION (Only if posture is valid)
    if (this.isPostureValid) {
      this.detectCompression(smoothedLandmarks);
    } else {
      // Reset compression state when posture is invalid
      this.resetCompressionState();
    }

    // Calculate compression rate
    const compressionRate = this.calculateCompressionRate();

    // Update callbacks
    if (this.onPostureUpdate) {
      this.onPostureUpdate(this.isPostureValid, postureFeedback);
    }

    if (this.onCompressionUpdate) {
      this.onCompressionUpdate(this.compressionCount, compressionRate);
    }

    // Audio feedback for incorrect posture
    if (!this.isPostureValid) {
      this.playAudioFeedback();
    }
  }

  /**
   * Smooth landmark data using moving average filter
   */
  smoothLandmarks(landmarks) {
    this.landmarkHistory.push(landmarks);
    if (this.landmarkHistory.length > this.historySize) {
      this.landmarkHistory.shift();
    }

    if (this.landmarkHistory.length === 1) {
      return landmarks;
    }

    // Average across history
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

  /**
   * Calculate angle between three points (for elbow angle calculation)
   */
  calculateAngle(point1, point2, point3) {
    // Vector from point2 to point1
    const vector1 = {
      x: point1.x - point2.x,
      y: point1.y - point2.y
    };

    // Vector from point2 to point3
    const vector2 = {
      x: point3.x - point2.x,
      y: point3.y - point2.y
    };

    // Calculate dot product
    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;

    // Calculate magnitudes
    const magnitude1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2);
    const magnitude2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2);

    // Calculate angle in radians, then convert to degrees
    const angleRadians = Math.acos(dotProduct / (magnitude1 * magnitude2));
    const angleDegrees = (angleRadians * 180) / Math.PI;

    return angleDegrees;
  }

  /**
   * Check if arms are straight (elbow angle >= 160°)
   * This ensures compressions are driven by shoulders, not arm bending
   */
  checkArmStraightness(landmarks) {
    // Left arm: shoulder(11), elbow(13), wrist(15)
    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];

    // Right arm: shoulder(12), elbow(14), wrist(16)
    const rightShoulder = landmarks[12];
    const rightElbow = landmarks[14];
    const rightWrist = landmarks[16];

    // Check visibility
    const minVisibility = 0.5;
    const leftVisible = leftShoulder?.visibility > minVisibility &&
                       leftElbow?.visibility > minVisibility &&
                       leftWrist?.visibility > minVisibility;
    const rightVisible = rightShoulder?.visibility > minVisibility &&
                        rightElbow?.visibility > minVisibility &&
                        rightWrist?.visibility > minVisibility;

    if (!leftVisible && !rightVisible) {
      return {
        isCorrect: false,
        feedback: 'Position yourself so arms are visible'
      };
    }

    // Calculate elbow angles
    let leftAngle = null;
    let rightAngle = null;

    if (leftVisible) {
      leftAngle = this.calculateAngle(leftShoulder, leftElbow, leftWrist);
    }

    if (rightVisible) {
      rightAngle = this.calculateAngle(rightShoulder, rightElbow, rightWrist);
    }

    // Check if BOTH arms are straight
    const leftStraight = leftAngle === null || leftAngle >= this.ELBOW_ANGLE_THRESHOLD;
    const rightStraight = rightAngle === null || rightAngle >= this.ELBOW_ANGLE_THRESHOLD;

    const isCorrect = leftStraight && rightStraight;

    return {
      isCorrect,
      leftAngle,
      rightAngle
    };
  }

  /**
   * Check spine stability - detect excessive torso bending
   * CPR compressions should come from shoulders, not from bending the back
   */
  checkSpineStability(landmarks) {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    // Check visibility
    const minVisibility = 0.5;
    const allVisible = leftShoulder?.visibility > minVisibility &&
                      rightShoulder?.visibility > minVisibility &&
                      leftHip?.visibility > minVisibility &&
                      rightHip?.visibility > minVisibility;

    if (!allVisible) {
      return { isStable: false };
    }

    // Calculate midpoints
    const shoulderMidpoint = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2
    };

    const hipMidpoint = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2
    };

    // Calculate angle of spine relative to vertical
    // Vertical = 90° (straight down)
    const deltaX = shoulderMidpoint.x - hipMidpoint.x;
    const deltaY = shoulderMidpoint.y - hipMidpoint.y;
    
    // Angle from vertical (in degrees)
    const spineAngle = Math.abs(Math.atan2(deltaX, deltaY) * (180 / Math.PI));

    // Initialize baseline
    if (this.lastSpineAngle === null) {
      this.lastSpineAngle = spineAngle;
      return { isStable: true, spineAngle };
    }

    // Check if spine angle has changed significantly (indicating bending)
    const angleChange = Math.abs(spineAngle - this.lastSpineAngle);
    const isStable = angleChange < this.SPINE_ANGLE_CHANGE_THRESHOLD;

    // Update baseline with smoothing
    this.lastSpineAngle = this.lastSpineAngle * 0.9 + spineAngle * 0.1;

    return {
      isStable,
      spineAngle,
      angleChange
    };
  }

  /**
   * Check hand position - ensure hands are together at center
   * We check if wrists are close together and centered below shoulders
   */
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
      return { isCorrect: true }; // Don't penalize if not visible
    }

    // Calculate wrist midpoint
    const wristMidpoint = {
      x: (leftWrist.x + rightWrist.x) / 2,
      y: (leftWrist.y + rightWrist.y) / 2
    };

    // Calculate shoulder midpoint
    const shoulderMidpoint = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2
    };

    // Check if wrists are close together (horizontal distance)
    const wristDistance = Math.abs(leftWrist.x - rightWrist.x);
    const wristsClose = wristDistance < this.HAND_POSITION_TOLERANCE;

    // Check if wrist midpoint is roughly below shoulder midpoint (centered)
    const horizontalAlignment = Math.abs(wristMidpoint.x - shoulderMidpoint.x);
    const isCentered = horizontalAlignment < this.HAND_POSITION_TOLERANCE;

    const isCorrect = wristsClose && isCentered;

    return {
      isCorrect,
      wristDistance,
      horizontalAlignment
    };
  }

  /**
   * Reset compression state when posture becomes invalid
   */
  resetCompressionState() {
    this.isCompressing = false;
    this.peakShoulderY = null;
    this.troughShoulderY = null;
  }

  /**
   * Detect compressions based on shoulder vertical movement ONLY
   * CRITICAL: Uses only shoulder Y-position, not torso or full-body movement
   * Implements proper compression cycle detection with peak/trough tracking
   */
  detectCompression(landmarks) {
    // Use average of both shoulders for Y-position
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];

    if (!leftShoulder || !rightShoulder) return;

    // Calculate average shoulder Y position (lower Y = higher on screen)
    const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;

    // Apply smoothing to shoulder Y position
    this.shoulderYHistory.push(avgShoulderY);
    if (this.shoulderYHistory.length > this.shoulderYHistorySize) {
      this.shoulderYHistory.shift();
    }

    // Calculate smoothed shoulder Y
    const smoothedShoulderY = this.shoulderYHistory.reduce((sum, val) => sum + val, 0) / 
                             this.shoulderYHistory.length;

    // Initialize tracking
    if (this.lastShoulderY === null) {
      this.lastShoulderY = smoothedShoulderY;
      this.peakShoulderY = smoothedShoulderY;
      this.troughShoulderY = smoothedShoulderY;
      return;
    }

    const deltaY = smoothedShoulderY - this.lastShoulderY;

    // Track peaks (highest position = lowest Y value)
    if (smoothedShoulderY < this.peakShoulderY) {
      this.peakShoulderY = smoothedShoulderY;
    }

    // Track troughs (lowest position = highest Y value)
    if (smoothedShoulderY > this.troughShoulderY) {
      this.troughShoulderY = smoothedShoulderY;
    }

    // Downward movement - entering compression phase
    if (deltaY > this.COMPRESSION_THRESHOLD && !this.isCompressing) {
      this.isCompressing = true;
      this.peakShoulderY = smoothedShoulderY; // Reset peak for this cycle
    }

    // Upward movement - completing compression cycle
    if (deltaY < -this.COMPRESSION_THRESHOLD && this.isCompressing) {
      // Verify this was a significant compression
      const compressionDepth = this.troughShoulderY - this.peakShoulderY;
      
      // Only count if compression was significant enough (at least 1.5% of frame)
      if (compressionDepth > this.COMPRESSION_THRESHOLD) {
        this.isCompressing = false;
        this.compressionCount++;
        this.compressionTimestamps.push(Date.now());

        // Keep only recent compressions (last 10 seconds)
        const tenSecondsAgo = Date.now() - 10000;
        this.compressionTimestamps = this.compressionTimestamps.filter(
          timestamp => timestamp > tenSecondsAgo
        );

        // Reset trough for next cycle
        this.troughShoulderY = smoothedShoulderY;
      } else {
        // Too small, likely noise - reset state
        this.isCompressing = false;
      }
    }

    this.lastShoulderY = smoothedShoulderY;
  }

  /**
   * Calculate compression rate in BPM
   */
  calculateCompressionRate() {
    if (this.compressionTimestamps.length < 2) {
      return 0;
    }

    // Calculate rate based on last 10 compressions or all available
    const recentCompressions = this.compressionTimestamps.slice(-10);
    const timeSpan = recentCompressions[recentCompressions.length - 1] - recentCompressions[0];

    if (timeSpan === 0) return 0;

    // Compressions per millisecond * 60000 = compressions per minute
    const rate = ((recentCompressions.length - 1) / timeSpan) * 60000;

    return Math.round(rate);
  }

  /**
   * Play audio feedback for incorrect posture
   */
  playAudioFeedback() {
    const now = Date.now();
    if (now - this.lastAudioFeedbackTime < this.audioFeedbackCooldown) {
      return; // Cooldown active
    }

    if (!this.audioContext) return;

    try {
      // Create a simple beep
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = 800; // Hz
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
