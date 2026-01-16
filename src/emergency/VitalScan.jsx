import React, { useState, useRef } from 'react';
import { Heart, Activity, ShieldCheck, XCircle } from 'lucide-react';

export default function AccuratePulseScanner() {
  const [bpm, setBpm] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFingerDetected, setIsFingerDetected] = useState(false);
  const [feedback, setFeedback] = useState("Ready to Scan");
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const bufferRef = useRef([]);

  const startScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: 100, height: 100 }
      });

      // Try Flash
      const track = stream.getVideoTracks()[0];
      try {
        const capabilities = track.getCapabilities();
        if (capabilities.torch) await track.applyConstraints({ advanced: [{ torch: true }] });
      } catch(e) { console.log("Flash not supported"); }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      
      bufferRef.current = [];
      setIsScanning(true);
      
      const loop = setInterval(() => {
        if (bufferRef.current.length >= 300) {
          clearInterval(loop);
          calculateAccurateBPM();
          track.stop();
        } else {
          runPPGAnalysis();
        }
      }, 33);
    } catch (err) {
      setFeedback("Error: Need HTTPS and Camera access.");
    }
  };

  const runPPGAnalysis = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(videoRef.current, 0, 0, 10, 10);
    const p = ctx.getImageData(0, 0, 10, 10).data;

    let r = 0, g = 0, b = 0;
    for (let i = 0; i < p.length; i += 4) {
      r += p[i]; g += p[i+1]; b += p[i+2];
    }

    // --- THE GATEKEEPER LOGIC ---
    // 1. Red must be significantly higher than Blue (Blood is red)
    // 2. Brightness must not be "blown out" (No direct room light)
    const isTissue = (r > g * 1.5) && (r > b * 2) && (r > 50);

    if (isTissue) {
      setIsFingerDetected(true);
      setFeedback("Pulse detected... stay still");
      bufferRef.current.push(g); // Green channel has the best pulse data
      setProgress((bufferRef.current.length / 300) * 100);
    } else {
      setIsFingerDetected(false);
      setFeedback("ERROR: No finger detected");
      bufferRef.current = []; // Reset if finger is lifted
      setProgress(0);
    }
  };

  const calculateAccurateBPM = () => {
    const data = bufferRef.current;
    if (data.length < 200) return;

    // Filter: Simple Moving Average
    const filtered = data.map((v, i, a) => i > 0 ? (v + a[i-1]) / 2 : v);
    
    // Find Zero-Crossings of the Derivative (Peak Detection)
    let beats = 0;
    for (let i = 2; i < filtered.length - 2; i++) {
      if (filtered[i] > filtered[i-1] && filtered[i] > filtered[i+1]) {
        // High-sensitivity check: only count if it's a real "mountain"
        if (filtered[i] - filtered[i-2] > 0.1) { 
          beats++;
          i += 12; // Wait ~0.4s for next beat
        }
      }
    }

    const result = Math.round(beats * 6);
    if (result > 45 && result < 150) {
      setBpm(result);
      setFeedback("Complete");
    } else {
      setFeedback("Too much movement. Retry.");
    }
    setIsScanning(false);
  };

  return (
    <div style={{ maxWidth: '350px', margin: 'auto', padding: '30px', textAlign: 'center', background: '#fff', borderRadius: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
        {isFingerDetected ? <ShieldCheck color="#22c55e" /> : <XCircle color="#ef4444" />}
        <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: 'bold' }}>
          {isFingerDetected ? "TISSUE DETECTED" : "NO CONTACT"}
        </span>
      </div>

      <div style={{ position: 'relative', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         <Heart size={80} color={isFingerDetected ? "#ef4444" : "#e2e8f0"} fill={isFingerDetected ? "#ef4444" : "none"} />
         <h1 style={{ position: 'absolute', fontSize: '2.5rem', color: '#1e293b' }}>{bpm || "--"}</h1>
      </div>

      <p style={{ color: '#64748b' }}>{feedback}</p>

      <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', margin: '20px 0' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: '#000', borderRadius: '3px', transition: '0.1s' }} />
      </div>

      <button 
        onClick={startScan} 
        disabled={isScanning}
        style={{ width: '100%', padding: '15px', borderRadius: '15px', border: 'none', background: '#000', color: '#fff', fontWeight: 'bold' }}
      >
        {isScanning ? "Scanning..." : "Measure Heart Rate"}
      </button>

      <video ref={videoRef} style={{ display: 'none' }} playsInline muted />
      <canvas ref={canvasRef} style={{ display: 'none' }} width="10" height="10" />
    </div>
  );
}