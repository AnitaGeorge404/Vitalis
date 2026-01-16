import { useRef, useEffect, useState } from 'react'
import './CameraFeed.css'
import PoseDetector from './PoseDetector'
import CPRAnalyzer from './CPRAnalyzer'

function CameraFeed({ onPostureUpdate, onCompressionUpdate, isActive }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [cameraError, setCameraError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const poseDetectorRef = useRef(null)
  const cprAnalyzerRef = useRef(null)
  const animationFrameRef = useRef(null)

  useEffect(() => {
    if (!isActive) return

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
            setIsLoading(false)
            initializePoseDetection()
          }
        }
      } catch (error) {
        console.error('Camera access error:', error)
        setCameraError('Unable to access camera. Please grant camera permissions.')
        setIsLoading(false)
      }
    }

    const initializePoseDetection = () => {
      cprAnalyzerRef.current = new CPRAnalyzer(onPostureUpdate, onCompressionUpdate)

      poseDetectorRef.current = new PoseDetector(
        videoRef.current,
        canvasRef.current,
        (results) => {
          if (cprAnalyzerRef.current && results.poseLandmarks) {
            cprAnalyzerRef.current.analyzePose(results.poseLandmarks)
          }
        }
      )

      poseDetectorRef.current.start()
    }

    initCamera()

    return () => {
      const animationFrame = animationFrameRef.current
      const poseDetector = poseDetectorRef.current
      const video = videoRef.current

      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
      if (poseDetector) {
        poseDetector.stop()
      }
      if (video && video.srcObject) {
        const tracks = video.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [isActive, onPostureUpdate, onCompressionUpdate])

  return (
    <div className="camera-feed">
      <div className="video-container">
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Loading camera...</p>
          </div>
        )}
        {cameraError && (
          <div className="error-overlay">
            <p>❌ {cameraError}</p>
          </div>
        )}
        <video
          ref={videoRef}
          className="video-element"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="canvas-overlay"
        />
      </div>
      <div className="camera-instructions">
        <p>📍 Position yourself side-on with shoulders, elbows, wrists, and hips visible</p>
      </div>
    </div>
  )
}

export default CameraFeed
