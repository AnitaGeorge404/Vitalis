import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

/**
 * PoseDetector: Handles MediaPipe Pose detection and rendering
 */
class PoseDetector {
  constructor(videoElement, canvasElement, onResults) {
    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.onResults = onResults;
    this.camera = null;
    this.pose = null;
    this.canvasCtx = null;

    this.initialize();
  }

  initialize() {
    // Initialize MediaPipe Pose
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

    // Set up canvas context
    if (this.canvasElement) {
      this.canvasCtx = this.canvasElement.getContext('2d');
    }

    // Handle pose results
    this.pose.onResults((results) => {
      this.drawResults(results);
      if (this.onResults) {
        this.onResults(results);
      }
    });
  }

  start() {
    if (this.videoElement && this.pose) {
      this.camera = new Camera(this.videoElement, {
        onFrame: async () => {
          await this.pose.send({ image: this.videoElement });
        },
        width: 640,
        height: 480
      });
      this.camera.start();
    }
  }

  stop() {
    if (this.camera) {
      this.camera.stop();
    }
  }

  drawResults(results) {
    if (!this.canvasCtx || !this.canvasElement) return;

    // Match canvas size to video
    this.canvasElement.width = this.videoElement.videoWidth;
    this.canvasElement.height = this.videoElement.videoHeight;

    // Clear canvas
    this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

    if (results.poseLandmarks) {
      this.drawLandmarks(results.poseLandmarks);
      this.drawConnections(results.poseLandmarks);
    }
  }

  drawLandmarks(landmarks) {
    // Draw only the landmarks we care about: shoulders, elbows, wrists, hips
    const relevantIndices = [11, 12, 13, 14, 15, 16, 23, 24];
    
    relevantIndices.forEach(index => {
      const landmark = landmarks[index];
      if (landmark) {
        const x = landmark.x * this.canvasElement.width;
        const y = landmark.y * this.canvasElement.height;

        this.canvasCtx.beginPath();
        this.canvasCtx.arc(x, y, 8, 0, 2 * Math.PI);
        this.canvasCtx.fillStyle = '#00ff00';
        this.canvasCtx.fill();
        this.canvasCtx.strokeStyle = '#ffffff';
        this.canvasCtx.lineWidth = 2;
        this.canvasCtx.stroke();
      }
    });
  }

  drawConnections(landmarks) {
    // Draw connections between relevant landmarks
    const connections = [
      [11, 13], // Left shoulder to left elbow
      [13, 15], // Left elbow to left wrist
      [12, 14], // Right shoulder to right elbow
      [14, 16], // Right elbow to right wrist
      [11, 23], // Left shoulder to left hip
      [12, 24], // Right shoulder to right hip
      [11, 12], // Shoulders
      [23, 24]  // Hips
    ];

    this.canvasCtx.strokeStyle = '#00ffff';
    this.canvasCtx.lineWidth = 3;

    connections.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];

      if (start && end) {
        const startX = start.x * this.canvasElement.width;
        const startY = start.y * this.canvasElement.height;
        const endX = end.x * this.canvasElement.width;
        const endY = end.y * this.canvasElement.height;

        this.canvasCtx.beginPath();
        this.canvasCtx.moveTo(startX, startY);
        this.canvasCtx.lineTo(endX, endY);
        this.canvasCtx.stroke();
      }
    });
  }
}

export default PoseDetector;
