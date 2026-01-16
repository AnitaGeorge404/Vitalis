import React, { useState, useRef, useEffect } from 'react';
import { Heart, Activity, AlertCircle } from 'lucide-react';

const BUFFER_SIZE = 300; 
const MS_BETWEEN_SAMPLES = 30; 

export default function WaveformPPG() {
  const [bpm, setBpm] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState("Ready");
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const graphCanvasRef = useRef(null);
  const bufferRef = useRef([]);
  const timerRef = useRef(null);

  // Helper to draw the real-time wave
  const drawGraph = (data) => {
    const canvas = graphCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const slice = data.slice(-50); // Show last 50 points
    const min = Math.min(...slice);
    const max = Math.max(...slice);
    const range = max - min || 1;

    slice.forEach((val, i) => {
      const x = (i / 50) * canvas.width;
      const y = canvas.height - ((val - min) / range) * canvas.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  };

  const startScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: 128, height: 128 }
      });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      bufferRef.current = [];
      setIsScanning(true);
      requestAnimationFrame(processFrame);
    } catch (err) {
      setFeedback("Camera Error: " + err.message);
    }
  };

  const processFrame = () => {
    if (!isScanning || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let r = 0, g = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      r += pixels[i];
      g += pixels[i+1];
    }
    
    // The "Pulse" signal: Green is most sensitive to blood volume
    const signal = g / (pixels.length / 4); 
    bufferRef.current.push(signal);
    drawGraph(bufferRef.current);

    // Quality check: Fingertip should be red/dark, not showing a room
    if (r / (g + 1) > 1.5) { 
      setProgress((bufferRef.current.length / BUFFER_SIZE) * 100);
      setFeedback("Pulse detected... Keep still");
    } else {
      setFeedback("Cover lens & use bright light");
    }

    if (bufferRef.current.length >= BUFFER_SIZE) {
      analyzePulse(bufferRef.current);
      stopScan();
    } else {
      timerRef.current = setTimeout(processFrame, MS_BETWEEN_SAMPLES);
    }
  };

  const analyzePulse = (data) => {
    // Basic smoothing
    const smooth = data.map((v, i, a) => i > 0 ? (v + a[i-1]) / 2 : v);
    const mean = smooth.reduce((a, b) => a + b) / smooth.length;
    
    let peaks = 0;
    for (let i = 2; i < smooth.length - 2; i++) {
      if (smooth[i] > mean && smooth[i] > smooth[i-1] && smooth[i] > smooth[i+1]) {
        peaks++;
        i += 10; // Debounce
      }
    }

    const calculatedBpm = Math.round(peaks * (60000 / (BUFFER_SIZE * MS_BETWEEN_SAMPLES)));
    setBpm(calculatedBpm > 40 && calculatedBpm < 160 ? calculatedBpm : "Retry");
    setFeedback(calculatedBpm > 40 ? "Done!" : "Weak signal");
  };

  const stopScan = () => {
    setIsScanning(false);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    clearTimeout(timerRef.current);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', padding: '20px', textAlign: 'center', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <h3>Bio-Scan (Waveform)</h3>
      
      <canvas ref={graphCanvasRef} width="300" height="100" style={{ background: '#f8fafc', borderRadius: '8px', marginBottom: '10px', width: '100%' }} />
      
      <div style={{ padding: '20px', borderRadius: '50%', background: '#f1f5f9', width: '100px', height: '100px', margin: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ margin: 0 }}>{bpm || "--"}</h1>
      </div>

      <p style={{ color: '#64748b' }}>{feedback}</p>
      
      <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', margin: '15px 0', overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: '#ef4444' }} />
      </div>

      <button onClick={isScanning ? stopScan : startScan} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#000', color: '#fff', border: 'none', fontWeight: 'bold' }}>
        {isScanning ? "Stop" : "Start Scan"}
      </button>

      <video ref={videoRef} style={{ display: 'none' }} playsInline />
      <canvas ref={canvasRef} width="20" height="20" style={{ display: 'none' }} />
    </div>
  );
}