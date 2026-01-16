"use client"

import { useEffect, useState, useRef } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const SAMPLE_RATE_MS = 50 // 20 Hz
const WINDOW_SECONDS = 60
const MAX_POINTS = (WINDOW_SECONDS * 1000) / SAMPLE_RATE_MS

function generateSampleData() {
  const data = []
  const now = Date.now()
  const bpm = 18
  const periodMs = 60000 / bpm
  for (let i = MAX_POINTS - 1; i >= 0; i--) {
    const t = now - i * SAMPLE_RATE_MS
    const phase = (t % periodMs) / periodMs
    const base = Math.sin(2 * Math.PI * phase)
    const noise = (Math.random() - 0.5) * 0.2
    data.push({ t, value: base + noise })
  }
  return data
}

function movingAverage(data, windowSize) {
  if (!data.length) return []
  const half = Math.floor(windowSize / 2)
  const result = []
  for (let i = 0; i < data.length; i++) {
    let sum = 0
    let count = 0
    for (let j = i - half; j <= i + half; j++) {
      if (j >= 0 && j < data.length) {
        sum += data[j].value
        count++
      }
    }
    result.push({ t: data[i].t, value: sum / count })
  }
  return result
}

function lowPassFilter(data, alpha = 0.2) {
  if (!data.length) return []
  const result = []
  let prev = data[0].value
  for (let i = 0; i < data.length; i++) {
    const v = alpha * data[i].value + (1 - alpha) * prev
    result.push({ t: data[i].t, value: v })
    prev = v
  }
  return result
}

function detectPeaks(data, minPeakDistanceMs = 1500, threshold = 0.15) {
  const peaks = []
  if (data.length < 3) return peaks
  for (let i = 1; i < data.length - 1; i++) {
    const prev = data[i - 1].value
    const curr = data[i].value
    const next = data[i + 1].value
    if (curr > prev && curr > next && curr > threshold) {
      const t = data[i].t
      if (peaks.length === 0 || t - peaks[peaks.length - 1].t >= minPeakDistanceMs) {
        peaks.push({ t, value: curr })
      }
    }
  }
  return peaks
}

function computeBPM(peaks) {
  if (peaks.length < 3) return null
  const lastN = peaks.slice(-4)
  const intervals = []
  for (let i = 1; i < lastN.length; i++) {
    const dt = lastN[i].t - lastN[i - 1].t
    intervals.push(dt / 1000)
  }
  if (!intervals.length) return null
  const avgSec = intervals.reduce((a, b) => a + b, 0) / intervals.length
  if (!avgSec || avgSec <= 0) return null
  return 60 / avgSec
}

function computeAvgBPM(allPeaks) {
  if (allPeaks.length < 6) return null
  const intervals = []
  for (let i = 1; i < allPeaks.length; i++) {
    const dt = allPeaks[i].t - allPeaks[i - 1].t
    intervals.push(dt / 1000)
  }
  const avgSec = intervals.reduce((a, b) => a + b, 0) / intervals.length
  if (!avgSec || avgSec <= 0) return null
  return 60 / avgSec
}

function formatChartData(data) {
  if (!data.length) return []
  const t0 = data[0].t
  return data.map((d) => ({
    time: Number.parseFloat(((d.t - t0) / 1000).toFixed(1)),
    raw: d.value,
  }))
}

function BreathingMonitorCard() {
  const [useSample, setUseSample] = useState(true)
  const [rawData, setRawData] = useState([])
  const [smoothedData, setSmoothedData] = useState([])
  const [bpm, setBpm] = useState(null)
  const [avgBpm, setAvgBpm] = useState(null)
  const [running, setRunning] = useState(false)
  const [sensorsEnabled, setSensorsEnabled] = useState(false)

  const motionListenerRef = useRef(null)
  const timerRef = useRef(null)

  // Process data → smooth + detect peaks + compute bpm
  useEffect(() => {
    const filtered = lowPassFilter(rawData, 0.2)
    const smoothed = movingAverage(filtered, 5)
    setSmoothedData(smoothed)
    const peaks = detectPeaks(smoothed)

    const currentBpm = computeBPM(peaks)
    setBpm(currentBpm ? currentBpm.toFixed(1) : null)

    const averageBpm = computeAvgBPM(peaks)
    setAvgBpm(averageBpm ? averageBpm.toFixed(1) : null)
  }, [rawData])

  // Sample signal mode
  useEffect(() => {
    if (!running || !useSample) return

    const sessionStartTime = Date.now()
    let currentBpm = 16
    let bpmTarget = 16

    timerRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - sessionStartTime) / 1000

      if (elapsed >= 60) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
        setRunning(false)
        return
      }

      if (elapsed < 30) {
        if (Math.random() < 0.02) {
          bpmTarget = 12 + Math.random() * 8
        }
      } else {
        if (Math.random() < 0.02) {
          bpmTarget = 20 + Math.random() * 10
        }
      }

      currentBpm = currentBpm + 0.05 * (bpmTarget - currentBpm)

      setRawData((prev) => {
        const updated = [...prev]
        while (updated.length > MAX_POINTS - 1) updated.shift()
        const last = updated[updated.length - 1] || { t: Date.now(), value: 0 }
        const nextTime = last.t + SAMPLE_RATE_MS

        const periodMs = 60000 / currentBpm
        const phaseLocal = (nextTime % periodMs) / periodMs
        const base = Math.sin(2 * Math.PI * phaseLocal)
        const noise = (Math.random() - 0.5) * 0.05

        updated.push({ t: nextTime, value: base + noise })
        return updated
      })
    }, SAMPLE_RATE_MS)

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [running, useSample])

  // Phone sensors mode
  useEffect(() => {
    if (!running || useSample || !sensorsEnabled) return

    function handleMotion(event) {
      const z = event.accelerationIncludingGravity
        ? event.accelerationIncludingGravity.z || 0
        : 0
      const t = Date.now()
      setRawData((prev) => {
        const updated = [...prev, { t, value: z }]
        while (updated.length > MAX_POINTS) updated.shift()
        return updated
      })
    }

    try {
      if (typeof window !== "undefined") {
        window.addEventListener("devicemotion", handleMotion)
        motionListenerRef.current = handleMotion
      }
    } catch (e) {
      console.error("Motion listener error", e)
    }

    return () => {
      if (motionListenerRef.current && typeof window !== "undefined") {
        window.removeEventListener("devicemotion", motionListenerRef.current)
        motionListenerRef.current = null
      }
    }
  }, [running, useSample, sensorsEnabled])

  const toggleRun = () => {
    setRunning((r) => !r)
  }

  const toggleSource = () => {
    if (!sensorsEnabled && useSample) {
      alert("Enable phone sensors first, then switch to Phone sensors.")
      return
    }
    setUseSample((s) => !s)
    if (!useSample) {
      // switching back to sample mode
      setRawData(generateSampleData())
    } else {
      // switching to sensors mode
      setRawData([])
    }
  }

  const enableSensors = async () => {
    try {
      if (
        typeof window !== "undefined" &&
        typeof window.DeviceMotionEvent !== "undefined" &&
        typeof window.DeviceMotionEvent.requestPermission === "function"
      ) {
        const res = await window.DeviceMotionEvent.requestPermission()
        if (res !== "granted") {
          alert("Motion permission not granted. Staying in demo mode.")
          setSensorsEnabled(false)
          setUseSample(true)
          return
        }
      }
      // permission granted or non‑iOS browser
      setSensorsEnabled(true)
      setUseSample(false)    // switch to phone sensors
      setRunning(true)       // start monitoring using devicemotion
      setRawData([])         // clear previous sample data

      alert(
        "Phone sensors enabled. Place the phone on your chest; monitoring is now using phone sensors."
      )
    } catch (e) {
      console.error("Sensor enable error", e)
      alert("Motion sensors not available on this device/browser. Using demo signal.")
      setSensorsEnabled(false)
      setUseSample(true)
    }
  }

  const chartData = formatChartData(smoothedData.length ? smoothedData : rawData)

  const cardStyle = {
    maxWidth: "900px",
    width: "100%",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 12px 24px rgba(15,23,42,0.2)",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    margin: "1.5rem auto",
  }

  const pillStyle = {
    borderRadius: "999px",
    padding: "4px 10px",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    border: "1px solid rgba(148,163,184,0.6)",
    color: "#9ca3af",
  }

  const buttonBase = {
    borderRadius: "999px",
    padding: "10px 16px",
    fontSize: "14px",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
  }

  return (
    <div style={cardStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div style={pillStyle}>Respi-Track MVP</div>
      </div>

      <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: 4 }}>Breathing Rate Monitor</h2>
      <p
        style={{
          fontSize: "13px",
          color: "#4b5563",
          marginBottom: 12,
        }}
      >
        Place your phone flat on the chest and breathe normally to track your resting breathing rate.
      </p>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={toggleRun}
          style={{
            ...buttonBase,
            background: running ? "#ef4444" : "#22c55e",
            color: "#f9fafb",
            flex: 1,
          }}
        >
          {running ? "Stop Monitoring" : "Start Monitoring"}
        </button>
        <button
          onClick={toggleSource}
          style={{
            ...buttonBase,
            background: "transparent",
            border: "1px solid rgba(148,163,184,0.7)",
            color: "#0f172a",
            flex: 1,
          }}
        >
          {useSample ? "Use Phone Sensors" : "Use Sample Signal"}
        </button>
        <button
          onClick={enableSensors}
          style={{
            ...buttonBase,
            background: "transparent",
            border: "1px dashed rgba(148,163,184,0.7)",
            color: "#0f172a",
            flex: 1,
            fontSize: "12px",
            padding: "8px 12px",
          }}
        >
          {sensorsEnabled ? "Sensors Enabled" : "Enable Phone Sensors"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: "250px",
            padding: 16,
            borderRadius: 12,
            background: "#f9fafb",
            border: "1px solid rgba(148,163,184,0.5)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#9ca3af",
              marginBottom: 8,
            }}
          >
            Current Rate
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: "#16a34a" }}>
              {bpm ?? "--"}
            </span>
            <span style={{ fontSize: 14, color: "#9ca3af" }}>bpm</span>
          </div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            {rawData.length < 600 ? "Warming up..." : "Live reading"}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: "200px",
            padding: 16,
            borderRadius: 12,
            background: avgBpm ? "#f0fdf4" : "#f9fafb",
            border: avgBpm ? "2px solid #22c55e" : "1px solid rgba(148,163,184,0.5)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: avgBpm ? "#22c55e" : "#9ca3af",
              marginBottom: 8,
            }}
          >
            1-Min Average
          </div>
          {avgBpm ? (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: "#15803d" }}>
                  {avgBpm}
                </span>
                <span style={{ fontSize: 12, color: "#22c55e" }}>bpm</span>
              </div>
              <div style={{ fontSize: 11, color: "#15803d", marginTop: 6 }}>
                {parseFloat(avgBpm) <= 20 ? "Normal range ✓" : "Monitor closely"}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: "#9ca3af" }}>Need ~1 min data</div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 4, fontSize: 12, fontWeight: 600 }}>
        Breathing Waveform (Last 60 Seconds)
      </div>
      <div
        style={{
          width: "100%",
          height: "320px",
          borderRadius: "12px",
          background: "#f9fafb",
          border: "1px solid rgba(148,163,184,0.3)",
          marginBottom: 16,
          padding: "8px",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="time"
              label={{ value: "Time (s)", position: "insideBottomRight", offset: -10 }}
              tick={{ fontSize: 12, fill: "#6b7280" }}
            />
            <YAxis
              label={{ value: "Amplitude", angle: -90, position: "insideLeft" }}
              tick={{ fontSize: 12, fill: "#6b7280" }}
            />
            <Tooltip
              contentStyle={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                color: "#0f172a",
              }}
              formatter={(value) => value.toFixed(3)}
              labelFormatter={(label) => `${label}s`}
            />
            <Line
              type="monotone"
              dataKey="raw"
              stroke="#22c55e"
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          marginTop: 12,
          fontSize: 11,
          lineHeight: 1.4,
          color: "#4b5563",
          borderTop: "1px solid rgba(148,163,184,0.4)",
          paddingTop: 10,
        }}
      >
        <div style={{ marginBottom: 4, fontWeight: 600 }}>How to use</div>
        <ul style={{ marginLeft: 16, paddingLeft: 0 }}>
          <li>Place phone flat at center of chest, screen facing up.</li>
          <li>Breathe normally for at least 1 minute.</li>
          <li>Use the <strong>1‑min average</strong> to judge your resting rate.</li>
        </ul>
      </div>
    </div>
  )
}

export default BreathingMonitorCard
