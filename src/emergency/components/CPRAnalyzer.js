/**
 * CPRAnalyzer: Analyzes pose landmarks for CPR posture and compression detection
 * Enforces correct CPR biomechanics with real-time feedback
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

    // Posture validation
    this.isPostureValid = false;
    this.lastSpineAngle = null;

    // Smoothing filters
    this.landmarkHistory = [];
    this.historySize = 5;
    this.shoulderYHistory = [];
    this.shoulderYHistorySize = 3;

    // Audio feedback
    this.audioContext = null;
    this.lastAudioFeedbackTime = 0;
    this.audioFeedbackCooldown = 3000;

    // Thresholds
    this.ELBOW_ANGLE_THRESHOLD = 160;
    this.SPINE_ANGLE_CHANGE_THRESHOLD = 15;
    this.COMPRESSION_THRESHOLD = 0.015;
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

    const armPosture = this.checkArmStraightness(smoothedLandmarks);
    const spineStability = this.checkSpineStability(smoothedLandmarks);
    const handPosition = this.checkHandPosition(smoothedLandmarks);

    this.isPostureValid = armPosture.isCorrect && spineStability.isStable;

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

    if (this.isPostureValid) {
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

    if (!this.isPostureValid) {
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
      return { isCorrect: false, feedback: 'Position arms in view' };
    }

    let leftAngle = null;
    let rightAngle = null;

    if (leftVisible) {
      leftAngle = this.calculateAngle(leftShoulder, leftElbow, leftWrist);
    }

    if (rightVisible) {
      rightAngle = this.calculateAngle(rightShoulder, rightElbow, rightWrist);
    }

    const leftStraight = leftAngle === null || leftAngle >= this.ELBOW_ANGLE_THRESHOLD;
    const rightStraight = rightAngle === null || rightAngle >= this.ELBOW_ANGLE_THRESHOLD;
    const isCorrect = leftStraight && rightStraight;

    return { isCorrect, leftAngle, rightAngle };
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

    if (smoothedShoulderY < this.peakShoulderY) {
      this.peakShoulderY = smoothedShoulderY;
    }

    if (smoothedShoulderY > this.troughShoulderY) {
      this.troughShoulderY = smoothedShoulderY;
    }

    if (deltaY > this.COMPRESSION_THRESHOLD && !this.isCompressing) {
      this.isCompressing = true;
      this.peakShoulderY = smoothedShoulderY;
    }

    if (deltaY < -this.COMPRESSION_THRESHOLD && this.isCompressing) {
      const compressionDepth = this.troughShoulderY - this.peakShoulderY;
      
      if (compressionDepth > this.COMPRESSION_THRESHOLD) {
        this.isCompressing = false;
        this.compressionCount++;
        this.compressionTimestamps.push(Date.now());

        const tenSecondsAgo = Date.now() - 10000;
        this.compressionTimestamps = this.compressionTimestamps.filter(
          timestamp => timestamp > tenSecondsAgo
        );

        this.troughShoulderY = smoothedShoulderY;
      } else {
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
