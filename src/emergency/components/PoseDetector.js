/**
 * PoseDetector: Wraps MediaPipe Pose detection
 * Detects body landmarks for CPR posture analysis
 */
class PoseDetector {
  constructor(videoElement, canvasElement, onResults) {
    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.onResults = onResults;
    this.pose = null;
    this.camera = null;
    this.canvasCtx = canvasElement.getContext('2d');
    this.isRunning = false;
  }

  async start() {
    if (this.isRunning) return;

    try {
      // Dynamically import MediaPipe Pose
      const { Pose } = await import('@mediapipe/pose');
      const { Camera } = await import('@mediapipe/camera_utils');

      // Initialize Pose
      this.pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      this.pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.pose.onResults((results) => {
        this.drawResults(results);
        if (this.onResults) {
          this.onResults(results);
        }
      });

      // Initialize Camera
      this.camera = new Camera(this.videoElement, {
        onFrame: async () => {
          if (this.pose && this.isRunning) {
            await this.pose.send({ image: this.videoElement });
          }
        },
        width: 640,
        height: 480
      });

      this.isRunning = true;
      await this.camera.start();
    } catch (error) {
      console.error('PoseDetector initialization error:', error);
      // Fallback: Continue without pose detection
      this.isRunning = false;
    }
  }

  drawResults(results) {
    if (!this.canvasCtx || !results) return;

    const canvas = this.canvasElement;
    const ctx = this.canvasCtx;

    // Match canvas size to video
    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw pose landmarks
    if (results.poseLandmarks) {
      this.drawLandmarks(results.poseLandmarks);
      this.drawConnections(results.poseLandmarks);
    }
  }

  drawLandmarks(landmarks) {
    const ctx = this.canvasCtx;
    const canvas = this.canvasElement;

    landmarks.forEach((landmark) => {
      if (landmark.visibility > 0.5) {
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#00ff00';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  }

  drawConnections(landmarks) {
    const ctx = this.canvasCtx;
    const canvas = this.canvasElement;

    // Define pose connections (simplified)
    const connections = [
      [11, 13], [13, 15], // Left arm
      [12, 14], [14, 16], // Right arm
      [11, 12], // Shoulders
      [11, 23], [12, 24], // Torso
      [23, 24] // Hips
    ];

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;

    connections.forEach(([start, end]) => {
      const startLandmark = landmarks[start];
      const endLandmark = landmarks[end];

      if (startLandmark && endLandmark &&
          startLandmark.visibility > 0.5 && endLandmark.visibility > 0.5) {
        const startX = startLandmark.x * canvas.width;
        const startY = startLandmark.y * canvas.height;
        const endX = endLandmark.x * canvas.width;
        const endY = endLandmark.y * canvas.height;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    });
  }

  stop() {
    this.isRunning = false;
    if (this.camera) {
      this.camera.stop();
    }
    if (this.pose) {
      this.pose.close();
    }
  }
}

export default PoseDetector;
