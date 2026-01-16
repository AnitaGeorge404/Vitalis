import React, { useState, useRef } from 'react';
import { Heart, Activity, CheckCircle, ShieldAlert, Thermometer } from 'lucide-react';

export default function CalibratedScanner() {
  const [bpm, setBpm] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState("Tap to Initialize");
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const bufferRef = useRef([]);

  const startCalibration = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: 128, height: 128 }
      });

      // Android/Chrome Flash Support
      const track = stream.getVideoTracks()[0];
      try {
        const caps = track.getCapabilities();
        if (caps.torch) await track.applyConstraints({ advanced: [{ torch: true }] });
      } catch (e) { console.log("Manual light needed"); }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      
      setIsCalibrating(true);
      setFeedback("Calibrating... Align finger with light");
      
      let stableFrames = 0;
      const calibrationLoop = setInterval(() => {
        const signal = getRawSignal();
        
        // CALIBRATION LOGIC:
        // 1. Must be bright (r > 100)
        // 2. Must be red-dominant (r/g > 1.8)
        if (signal && signal.r > 100 && (signal.r / (signal.g + 1)) > 1.8) {
          stableFrames++;
          setFeedback(`Signal found... Keep still (${Math.round((stableFrames/30)*100)}%)`);
        } else {
          stableFrames = 0;
          setFeedback("Adjust finger: Need more light / Better seal");
        }

        if (stableFrames > 30) { // 1 second of stable "Red" light
          clearInterval(calibrationLoop);
          setIsCalibrating(false);
          runActualScan(track);
        }
      }, 33);

    } catch (err) {
      setFeedback("Camera Error. Check Permissions/HTTPS.");
    }
  };

  const runActualScan = (track) => {
    bufferRef.current = [];
    setIsScanning(true);
    setFeedback("Recording Pulse...");

    const scanInterval = setInterval(() => {
      if (bufferRef.current.length >= 300) {
        clearInterval(scanInterval);
        processMedicalBPM();
        track.stop();
      } else {
        const sig = getRawSignal();
        if (sig) bufferRef.current.push(sig.g);
        setProgress((bufferRef.current.length / 300) * 100);
      }
    }, 33);
  };

  const getRawSignal = () => {
    if (!videoRef.current) return null;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(videoRef.current, 0, 0, 10, 10);
    const p = ctx.getImageData(0, 0, 10, 10).data;
    let r = 0, g = 0, b = 0;
    for (let i = 0; i < p.length; i += 4) {
      r += p[i]; g += p[i+1]; b += p[i+2];
    }
    return { r: r/25, g: g/25, b: b/25 };
  };

  const processMedicalBPM = () => {
    const data = bufferRef.current;
    
    // 1. Remove Trend (High-pass filter)
    const filtered = [];
    for (let i = 1; i < data.length; i++) {
      filtered.push(data[i] - data[i-1]);
    }

    // 2. Adaptive Peak Detection
    const stdDev = Math.sqrt(filtered.map(x => Math.pow(x, 2)).reduce((a, b) => a + b) / filtered.length);
    let beats = 0;
    let lastBeat = 0;

    for (let i = 1; i < filtered.length - 1; i++) {
      // Only count if peak is higher than surrounding noise (stdDev)
      if (filtered[i] > filtered[i-1] && filtered[i] > filtered[i+1] && filtered[i] > (stdDev * 0.5)) {
        if (i - lastBeat > 15) { // Max 120 BPM limit for noise reduction
          beats++;
          lastBeat = i;
        }
      }
    }

    const finalBpm = Math.round(beats * 6);
    
    // VALIDATION: If BPM is 40-50, it's usually noise unless you're a pro athlete
    if (finalBpm > 55 && finalBpm < 140) {
      setBpm(finalBpm);
      setFeedback("Success");
    } else {
      setBpm("Low");
      setFeedback("Signal Unreliable: Use brighter light and touch lightly");
    }
    setIsScanning(false);
  };

  return (
    <div style={{ maxWidth: '350px', margin: '30px auto', padding: '25px', textAlign: 'center', background: '#fff', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
        {isScanning || isCalibrating ? <Activity color="#ef4444" className="animate-pulse" /> : <CheckCircle color="#10b981" />}
      </div>

      <div style={{ position: 'relative', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', margin: 0, color: '#1e293b' }}>{bpm || "--"}</h1>
        {bpm && <span style={{ position: 'absolute', bottom: 0, fontSize: '0.8rem', color: '#64748b' }}>BPM</span>}
      </div>

      <p style={{ fontSize: '14px', margin: '20px 0', color: isCalibrating ? '#f59e0b' : '#475569', fontWeight: 'bold' }}>{feedback}</p>

      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '25px' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: '#ef4444', transition: 'width 0.3s ease' }} />
      </div>

      <button onClick={startCalibration} disabled={isScanning || isCalibrating} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: '#0f172a', color: '#fff', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
        {isScanning ? "Scanning..." : isCalibrating ? "Calibrating..." : "Start Accurate Scan"}
      </button>

      <div style={{ marginTop: '20px', padding: '12px', background: '#fffbeb', borderRadius: '10px', fontSize: '11px', color: '#92400e', display: 'flex', gap: '8px' }}>
        <ShieldAlert size={24} />
        <span><strong>CRITICAL:</strong> Light must be visible through your finger. Hold your phone up to a <strong>light bulb</strong> or <strong>bright window</strong> for accuracy.</span>
      </div>

      <video ref={videoRef} style={{ display: 'none' }} playsInline muted />
      <canvas ref={canvasRef} width="10" height="10" style={{ display: 'none' }} />
    </div>
  );
}