import React, { useState, useRef } from 'react';
import { Heart, Activity, AlertTriangle, Lightbulb } from 'lucide-react';

export default function RealPulseScanner() {
  const [bpm, setBpm] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [signalQuality, setSignalQuality] = useState(0); // 0 to 100
  const [feedback, setFeedback] = useState("Ready");
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const bufferRef = useRef([]);

  const startScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { exact: "environment" },
          width: { ideal: 128 },
          height: { ideal: 128 }
        }
      });

      // ATTEMPT TO TURN ON FLASH (Works on Android/Chrome)
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      if (capabilities.torch) {
        await track.applyConstraints({ advanced: [{ torch: true }] });
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      
      bufferRef.current = [];
      setIsScanning(true);
      setFeedback("Scanning...");
      
      const scanLoop = setInterval(() => {
        if (bufferRef.current.length >= 300) { // 10 seconds @ 30fps
          clearInterval(scanLoop);
          processFinalBPM();
          track.stop();
        } else {
          analyzeFrame();
        }
      }, 33);
    } catch (err) {
      setFeedback("Use Back Camera + HTTPS");
    }
  };

  const analyzeFrame = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, 20, 20);
    const pixels = ctx.getImageData(0, 0, 20, 20).data;

    let r = 0, g = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      r += pixels[i];
      g += pixels[i+1];
    }

    // VALIDATION: If it's not red enough, the user isn't covering the lens
    const redness = r / (g + 1);
    if (redness < 1.8) {
      setSignalQuality(0);
      setFeedback("Cover lens completely!");
      return; 
    }

    setSignalQuality(Math.min(100, redness * 20));
    bufferRef.current.push(r); // Storing the Red intensity
    setProgress((bufferRef.current.length / 300) * 100);
  };

  const processFinalBPM = () => {
    const data = bufferRef.current;
    if (data.length < 100) return;

    // Remove DC offset (the "drift")
    const mean = data.reduce((a, b) => a + b) / data.length;
    const centered = data.map(v => v - mean);

    // Count peaks using a simple "Slope Change" detection
    let peaks = 0;
    for (let i = 1; i < centered.length - 1; i++) {
      if (centered[i] > centered[i-1] && centered[i] > centered[i+1] && centered[i] > 0) {
        peaks++;
        i += 10; // Ignore noise for next 10 frames (~0.3s)
      }
    }

    const calculated = Math.round(peaks * 6); // 10 seconds * 6 = 60 seconds
    if (calculated > 45 && calculated < 180) {
      setBpm(calculated);
      setFeedback("Scan Complete");
    } else {
      setBpm("??");
      setFeedback("Signal too noisy. Hold still.");
    }
    setIsScanning(false);
  };

  return (
    <div style={{ maxWidth: '350px', margin: '40px auto', padding: '25px', textAlign: 'center', background: '#fff', borderRadius: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
      <Heart color={isScanning ? "#ef4444" : "#cbd5e1"} fill={isScanning ? "#ef4444" : "none"} size={48} style={{ transition: '0.3s' }} />
      
      <h1 style={{ fontSize: '3rem', margin: '10px 0', color: '#1e293b' }}>{bpm || "--"}</h1>
      <p style={{ color: '#64748b', marginTop: -10 }}>Beats Per Minute</p>

      <div style={{ margin: '20px 0', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
          <span>Signal Quality</span>
          <span>{Math.round(signalQuality)}%</span>
        </div>
        <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px' }}>
          <div style={{ width: `${signalQuality}%`, height: '100%', background: signalQuality > 70 ? '#22c55e' : '#eab308', borderRadius: '3px', transition: '0.3s' }} />
        </div>
      </div>

      <p style={{ fontSize: '14px', color: signalQuality < 50 && isScanning ? '#ef4444' : '#475569', fontWeight: 'bold' }}>
        {feedback}
      </p>

      <button 
        onClick={startScan} 
        disabled={isScanning}
        style={{ width: '100%', padding: '15px', borderRadius: '15px', border: 'none', background: '#0f172a', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
      >
        {isScanning ? `${Math.round(progress)}%` : "Start Pulse Scan"}
      </button>

      {!isScanning && (
        <div style={{ marginTop: '20px', fontSize: '12px', color: '#94a3b8', background: '#f8fafc', padding: '10px', borderRadius: '10px' }}>
          <Lightbulb size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
          If flash doesn't turn on, <strong>hold finger against a bright lamp.</strong>
        </div>
      )}

      <video ref={videoRef} style={{ display: 'none' }} playsInline muted />
      <canvas ref={canvasRef} width="20" height="20" style={{ display: 'none' }} />
    </div>
  );
}