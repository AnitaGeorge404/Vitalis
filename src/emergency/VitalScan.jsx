import React, { useState, useRef, useEffect } from 'react';
import { Heart, Activity, Camera, AlertCircle, RefreshCw } from 'lucide-react';

const BUFFER_SIZE = 300; // 10 seconds at 30fps
const MS_BETWEEN_SAMPLES = 33; // ~30fps

export default function FingerPPG() {
  const [bpm, setBpm] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState("Place finger over camera");
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const bufferRef = useRef([]);
  const timerRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 100, height: 100 }
      });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      processFrame();
    } catch (err) {
      alert("Camera access denied.");
    }
  };

  const processFrame = () => {
    if (!isScanning) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, 10, 10);
    const imageData = ctx.getImageData(0, 0, 10, 10).data;

    // Calculate average Red and Green values
    let r = 0, g = 0;
    for (let i = 0; i < imageData.length; i += 4) {
      r += imageData[i];
      g += imageData[i + 1];
    }
    const avgR = r / (imageData.length / 4);
    const avgG = g / (imageData.length / 4);

    // Simple Finger Detection: Is it red enough?
    if (avgR > 150 && avgG < 100) {
      bufferRef.current.push(avgR);
      setProgress((prev) => Math.min(prev + (100 / BUFFER_SIZE), 100));
      setFeedback("Scanning... Keep still");
    } else {
      setFeedback("Place finger FIRMLY over lens");
    }

    if (bufferRef.current.length >= BUFFER_SIZE) {
      calculateBPM(bufferRef.current);
      stopScan();
    } else {
      timerRef.current = setTimeout(processFrame, MS_BETWEEN_SAMPLES);
    }
  };

  const calculateBPM = (data) => {
    // 1. Simple Peak Detection
    let peaks = 0;
    const threshold = data.reduce((a, b) => a + b) / data.length;
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > threshold && data[i] > data[i - 1] && data[i] > data[i + 1]) {
        peaks++;
        i += 5; // Skip nearby points to avoid double counting noise
      }
    }

    // 2. Convert peaks over 10 seconds to 60 seconds
    const resultBpm = Math.round(peaks * 6);
    setBpm(resultBpm > 40 && resultBpm < 180 ? resultBpm : "Error - Retake");
  };

  const startScan = () => {
    bufferRef.current = [];
    setProgress(0);
    setIsScanning(true);
    startCamera();
  };

  const stopScan = () => {
    setIsScanning(false);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    clearTimeout(timerRef.current);
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2>Bio-Scan Lite</h2>
      
      <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: '50%', border: '5px solid #eee', margin: '20px auto', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <video ref={videoRef} style={{ display: 'none' }} />
        <canvas ref={canvasRef} width="10" height="10" style={{ display: 'none' }} />
        
        {isScanning ? (
           <div style={{ color: '#ef4444' }}>
              <Activity size={48} className="animate-pulse" />
              <p>{Math.round(progress)}%</p>
           </div>
        ) : (
          <div>
            <Heart size={48} color={bpm > 0 ? "#ef4444" : "#cbd5e1"} />
            <h1>{bpm || "--"}</h1>
            <p>BPM</p>
          </div>
        )}
      </div>

      <p style={{ color: '#64748b', fontSize: '14px' }}>{feedback}</p>

      <button 
        onClick={isScanning ? stopScan : startScan}
        style={{ width: '100%', padding: '15px', borderRadius: '10px', border: 'none', backgroundColor: isScanning ? '#64748b' : '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
      >
        {isScanning ? "Cancel Scan" : "Start 10s Scan"}
      </button>

      <div style={{ marginTop: '20px', fontSize: '11px', color: '#94a3b8', background: '#f8fafc', padding: '10px', borderRadius: '5px' }}>
        <AlertCircle size={12} /> <strong>HOW IT WORKS:</strong> This code uses <strong>Photoplethysmography</strong> to detect blood volume pulses in your fingertip by analyzing red channel pixel variance.
      </div>
    </div>
  );
}