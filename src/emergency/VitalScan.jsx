import React, { useState, useRef } from 'react';
import { Heart, Activity, Zap } from 'lucide-react';

const DURATION_SECONDS = 10;
const FPS = 30;
const TOTAL_SAMPLES = DURATION_SECONDS * FPS;

export default function MobilePulseScanner() {
  const [bpm, setBpm] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState("Tap to Start");
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const bufferRef = useRef([]);

  const startMobileScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: "environment" },
          width: { ideal: 128 },
          height: { ideal: 128 },
          frameRate: { ideal: 30 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        bufferRef.current = [];
        setBpm(0);
        setIsScanning(true);
        setFeedback("Cover lens & hold to light");
        
        // Use a standard interval for consistent mobile timing
        const interval = setInterval(() => {
          if (bufferRef.current.length >= TOTAL_SAMPLES) {
            clearInterval(interval);
            calculateMobileBPM();
            stopStream(stream);
          } else {
            captureFrame();
          }
        }, 1000 / FPS);
      }
    } catch (err) {
      setFeedback("Camera Error. Use HTTPS.");
    }
  };

  const captureFrame = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let redSum = 0;
    for (let i = 0; i < data.length; i += 4) {
      redSum += data[i]; // Blood volume changes are most visible in the red channel
    }
    
    const avgRed = redSum / (data.length / 4);
    bufferRef.current.push(avgRed);
    setProgress((bufferRef.current.length / TOTAL_SAMPLES) * 100);
  };

  const calculateMobileBPM = () => {
    const data = bufferRef.current;
    if (data.length < TOTAL_SAMPLES) return;

    // 1. Simple High-Pass Filter (remove the "drift" from hand shaking)
    const filtered = [];
    for (let i = 1; i < data.length; i++) {
      filtered.push(data[i] - data[i - 1]);
    }

    // 2. Find Peaks (counting the heart beats)
    let peaks = 0;
    for (let i = 1; i < filtered.length - 1; i++) {
      if (filtered[i] > filtered[i - 1] && filtered[i] > filtered[i + 1] && filtered[i] > 0) {
        peaks++;
        i += 10; // "Refractory period" to prevent double-counting 1 beat
      }
    }

    const result = Math.round(peaks * (60 / DURATION_SECONDS));
    
    if (result > 45 && result < 160) {
      setBpm(result);
      setFeedback("Success!");
    } else {
      setFeedback("Weak signal. Try again.");
    }
    setIsScanning(false);
  };

  const stopStream = (stream) => {
    stream.getTracks().forEach(track => track.stop());
  };

  return (
    <div style={{ maxWidth: '350px', margin: '30px auto', padding: '25px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '24px', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', fontFamily: 'system-ui' }}>
      <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Phone Pulse Check</h2>
      
      <div style={{ width: '140px', height: '140px', borderRadius: '50%', backgroundColor: isScanning ? '#fff1f2' : '#f8fafc', margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '4px solid #f1f5f9', transition: 'all 0.3s' }}>
        {isScanning ? (
          <Activity size={40} color="#ef4444" style={{ animation: 'pulse 0.8s infinite' }} />
        ) : (
          <>
            <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e293b' }}>{bpm || '--'}</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>BPM</span>
          </>
        )}
      </div>

      <p style={{ color: '#475569', fontSize: '0.9rem', margin: '20px 0' }}>{feedback}</p>

      <div style={{ height: '8px', width: '100%', backgroundColor: '#f1f5f9', borderRadius: '4px', marginBottom: '25px', overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#ef4444', transition: 'width 0.2s linear' }} />
      </div>

      <button 
        onClick={startMobileScan}
        disabled={isScanning}
        style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', backgroundColor: '#1e293b', color: '#fff', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', opacity: isScanning ? 0.7 : 1 }}
      >
        {isScanning ? "Scanning..." : "Start Assessment"}
      </button>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff9db', borderRadius: '12px', fontSize: '0.75rem', textAlign: 'left', color: '#856404', display: 'flex', gap: '10px' }}>
        <Zap size={24} />
        <span><strong>IMPORTANT:</strong> Hold your phone up to a <strong>bright lamp</strong> or window so light shines <em>through</em> your finger into the camera.</span>
      </div>

      <video ref={videoRef} style={{ display: 'none' }} playsInline muted />
      <canvas ref={canvasRef} width="20" height="20" style={{ display: 'none' }} />
    </div>
  );
}