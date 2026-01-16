import React, { useState, useRef } from 'react';
import { Heart, Activity, ShieldCheck, XCircle, Zap } from 'lucide-react';

export default function SteadyPulseScanner() {
  const [bpm, setBpm] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFingerDetected, setIsFingerDetected] = useState(false);
  const [feedback, setFeedback] = useState("Ready");
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const bufferRef = useRef([]);

  const startScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 160 }, height: { ideal: 160 } }
      });

      // Try to force Flash/Torch (Crucial for "Movement" errors)
      const track = stream.getVideoTracks()[0];
      try {
        const capabilities = track.getCapabilities();
        if (capabilities.torch) await track.applyConstraints({ advanced: [{ torch: true }] });
      } catch(e) { console.warn("Torch not available"); }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      
      bufferRef.current = [];
      setIsScanning(true);
      
      const loop = setInterval(() => {
        if (bufferRef.current.length >= 300) { // 10 seconds
          clearInterval(loop);
          processRobustBPM();
          track.stop();
        } else {
          const signal = captureSignal();
          if (signal) bufferRef.current.push(signal);
        }
      }, 33);
    } catch (err) {
      setFeedback("Camera Access Required");
    }
  };

  const captureSignal = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(videoRef.current, 0, 0, 10, 10);
    const p = ctx.getImageData(0, 0, 10, 10).data;

    let r = 0, g = 0, b = 0;
    for (let i = 0; i < p.length; i += 4) {
      r += p[i]; g += p[i+1]; b += p[i+2];
    }

    const redness = r / (g + 1);
    const isTissue = redness > 1.6 && r > 50;

    if (isTissue) {
      setIsFingerDetected(true);
      setFeedback("Scanning... Hold VERY still");
      setProgress((bufferRef.current.length / 300) * 100);
      return g; // Return green channel for pulse detection
    } else {
      setIsFingerDetected(false);
      setFeedback("Place finger over LENS and FLASH");
      bufferRef.current = []; 
      return null;
    }
  };

  const processRobustBPM = () => {
    const rawData = bufferRef.current;
    if (rawData.length < 250) return;

    // 1. SMOOTHING: Simple Moving Average (Low-pass filter)
    const smoothed = [];
    for (let i = 2; i < rawData.length - 2; i++) {
      smoothed.push((rawData[i-2] + rawData[i-1] + rawData[i] + rawData[i+1] + rawData[i+2]) / 5);
    }

    // 2. FIND PEAKS with a dynamic threshold
    const mean = smoothed.reduce((a, b) => a + b) / smoothed.length;
    let beats = 0;
    let lastBeatIndex = 0;

    for (let i = 1; i < smoothed.length - 1; i++) {
      // Check if it's a local maximum and above the average
      if (smoothed[i] > smoothed[i-1] && smoothed[i] > smoothed[i+1] && smoothed[i] > mean) {
        // Ensure beats aren't too close (min 0.4s between beats = max 150 BPM)
        if (i - lastBeatIndex > 12) { 
          beats++;
          lastBeatIndex = i;
        }
      }
    }

    const finalBpm = Math.round(beats * 6);
    if (finalBpm > 40 && finalBpm < 160) {
      setBpm(finalBpm);
      setFeedback("Measurement Successful");
    } else {
      setFeedback("Signal Unclear - Use more light");
    }
    setIsScanning(false);
  };

  return (
    <div style={{ maxWidth: '350px', margin: '40px auto', padding: '30px', textAlign: 'center', background: '#fff', borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
        {isFingerDetected ? <ShieldCheck size={20} color="#10b981" /> : <XCircle size={20} color="#f43f5e" />}
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>
          {isFingerDetected ? "STABLE CONTACT" : "WAITING FOR FINGER"}
        </span>
      </div>

      <div style={{ padding: '30px', background: isScanning ? '#fff1f2' : '#f8fafc', borderRadius: '50%', width: '120px', height: '120px', margin: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Heart size={32} color="#ef4444" fill={isScanning ? "#ef4444" : "none"} style={{ margin: 'auto', animation: isScanning ? 'pulse 1s infinite' : 'none' }} />
        <h1 style={{ margin: 0, fontSize: '2.5rem' }}>{bpm || "--"}</h1>
      </div>

      <p style={{ margin: '20px 0', fontSize: '14px', color: '#475569', minHeight: '40px' }}>{feedback}</p>

      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: '#1e293b', transition: 'width 0.2s linear' }} />
      </div>

      <button onClick={startScan} disabled={isScanning} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: 'none', background: '#0f172a', color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>
        {isScanning ? "Processing..." : "Start Heart Rate Scan"}
      </button>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', background: '#eff6ff', padding: '12px', borderRadius: '12px', textAlign: 'left' }}>
        <Zap size={24} color="#3b82f6" />
        <span style={{ fontSize: '11px', color: '#1e40af' }}>
          <strong>PRO TIP:</strong> Cover both the <strong>Camera Lens</strong> and the <strong>Flash</strong> with your finger. Light pressure is best!
        </span>
      </div>

      <video ref={videoRef} style={{ display: 'none' }} playsInline muted />
      <canvas ref={canvasRef} style={{ display: 'none' }} width="10" height="10" />
    </div>
  );
}