import React, { useState, useRef, useEffect } from 'react';
import { Heart, Activity, Camera, AlertCircle } from 'lucide-react';

const BUFFER_SIZE = 300; // ~10 seconds of data
const MS_BETWEEN_SAMPLES = 30; 

export default function BackCameraPPG() {
  const [bpm, setBpm] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState("Ready to scan");
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const bufferRef = useRef([]);
  const timerRef = useRef(null);

  const startScan = async () => {
    try {
      // "environment" tells the browser to use the back camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { exact: "environment" },
          width: { ideal: 128 },
          height: { ideal: 128 }
        }
      }).catch(() => {
        // Fallback to any camera if "exact: environment" fails (e.g., on desktop)
        return navigator.mediaDevices.getUserMedia({ video: true });
      });

      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        bufferRef.current = [];
        setProgress(0);
        setIsScanning(true);
        processFrame();
      };
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const processFrame = () => {
    if (!videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let r = 0, g = 0;
    for (let i = 0; i < imageData.length; i += 4) {
      r += imageData[i];
      g += imageData[i + 1];
    }

    // Ratio calculation is more stable than absolute brightness
    // It helps ignore global lighting changes
    const signal = r / (g + 1); 

    // Quality check: Fingertip should make the screen look very red
    if (r / imageData.length > 30) { 
      bufferRef.current.push(signal);
      setProgress((prev) => Math.min(prev + (100 / BUFFER_SIZE), 100));
      setFeedback("Scanning... Hold VERY still");
    } else {
      setFeedback("Cover the back camera lens completely");
    }

    if (bufferRef.current.length >= BUFFER_SIZE) {
      analyzeSignal(bufferRef.current);
      stopScan();
    } else if (isScanning) {
      timerRef.current = setTimeout(processFrame, MS_BETWEEN_SAMPLES);
    }
  };

  const analyzeSignal = (data) => {
    // 1. Simple Moving Average to smooth the noise
    const smoothed = [];
    const windowSize = 5;
    for (let i = windowSize; i < data.length - windowSize; i++) {
      const avg = data.slice(i - windowSize, i + windowSize).reduce((a, b) => a + b) / (windowSize * 2);
      smoothed.push(avg);
    }

    // 2. Count Zero Crossings (how many times the signal crosses its own average)
    const mean = smoothed.reduce((a, b) => a + b) / smoothed.length;
    let crossings = 0;
    for (let i = 1; i < smoothed.length; i++) {
      if ((smoothed[i] > mean && smoothed[i-1] <= mean) || (smoothed[i] < mean && smoothed[i-1] >= mean)) {
        crossings++;
      }
    }

    // Since a pulse has one "up" and one "down", 2 crossings = 1 beat
    const beats = crossings / 2;
    const durationInMinutes = (BUFFER_SIZE * MS_BETWEEN_SAMPLES) / 60000;
    const finalBpm = Math.round(beats / durationInMinutes);

    setBpm(finalBpm > 45 && finalBpm < 150 ? finalBpm : "Retry");
    setFeedback(finalBpm > 45 && finalBpm < 150 ? "Scan Complete" : "Signal too noisy");
  };

  const stopScan = () => {
    setIsScanning(false);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    clearTimeout(timerRef.current);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', textAlign: 'center', background: '#fff', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#1e293b' }}>Back-Cam Pulse</h2>
      
      <div style={{ position: 'relative', width: '160px', height: '160px', borderRadius: '50%', background: isScanning ? '#fee2e2' : '#f1f5f9', margin: '30px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }}>
        <video ref={videoRef} style={{ display: 'none' }} playsInline />
        <canvas ref={canvasRef} width="20" height="20" style={{ display: 'none' }} />
        
        {isScanning ? (
          <Activity size={48} color="#ef4444" style={{ animation: 'pulse 1s infinite' }} />
        ) : (
          <>
            <h1 style={{ fontSize: '42px', margin: 0, color: '#0f172a' }}>{bpm || "--"}</h1>
            <p style={{ margin: 0, color: '#64748b', fontWeight: 'bold' }}>BPM</p>
          </>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ height: '6px', width: '100%', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#ef4444', transition: 'width 0.1s' }} />
        </div>
        <p style={{ fontSize: '13px', color: '#475569', marginTop: '10px' }}>{feedback}</p>
      </div>

      <button 
        onClick={isScanning ? stopScan : startScan}
        style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: 'white', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
      >
        {isScanning ? "Stop" : "Begin Assessment"}
      </button>
    </div>
  );
}