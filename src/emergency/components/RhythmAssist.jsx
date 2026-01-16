import { useEffect, useRef, useState } from 'react'
import './RhythmAssist.css'

function RhythmAssist({ postureCorrect, compressionRate, onRhythmFeedback, isActive }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [beatCount, setBeatCount] = useState(0)
  const audioContextRef = useRef(null)
  const intervalRef = useRef(null)
  const lastFeedbackTimeRef = useRef(0)

  const TARGET_BPM = 110
  const BEAT_INTERVAL = (60 / TARGET_BPM) * 1000

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    const startMetronome = () => {
      if (intervalRef.current) return

      intervalRef.current = setInterval(() => {
        playBeep()
        setBeatCount(prev => prev + 1)
      }, BEAT_INTERVAL)
    }

    const stopMetronome = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    if (isPlaying && isActive) {
      startMetronome()
    } else {
      stopMetronome()
    }

    return () => stopMetronome()
  }, [isPlaying, isActive, BEAT_INTERVAL])

  useEffect(() => {
    if (!postureCorrect || compressionRate === 0) {
      return
    }

    const now = Date.now()
    if (now - lastFeedbackTimeRef.current < 3000) {
      return
    }

    let feedback = ''
    const rateDifference = compressionRate - TARGET_BPM

    if (Math.abs(rateDifference) <= 10) {
      feedback = '🎯 Good rhythm! Keep it steady'
    } else if (rateDifference > 10) {
      feedback = '🐢 Slow down - You\'re pushing too fast'
    } else {
      feedback = '🚀 Push faster - Increase your rate'
    }

    if (onRhythmFeedback) {
      onRhythmFeedback(feedback)
    }

    lastFeedbackTimeRef.current = now
  }, [compressionRate, postureCorrect, onRhythmFeedback, TARGET_BPM])

  const playBeep = () => {
    if (!audioContextRef.current) return

    try {
      const audioContext = audioContextRef.current
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 1000
      oscillator.type = 'sine'

      const now = audioContext.currentTime
      gainNode.gain.setValueAtTime(0.2, now)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1)

      oscillator.start(now)
      oscillator.stop(now + 0.1)
    } catch (error) {
      console.error('Beep playback error:', error)
    }
  }

  const toggleMetronome = () => {
    setIsPlaying(prev => !prev)
  }

  return (
    <div className="rhythm-assist">
      <h2>🎵 Rhythm Metronome</h2>

      <div className="target-display">
        <div className="target-bpm">
          <span className="label">Target:</span>
          <span className="value">{TARGET_BPM} BPM</span>
        </div>
      </div>

      <div className={`visual-pulse ${isPlaying ? 'active' : ''}`}>
        <div className="pulse-circle"></div>
        <div className="pulse-text">
          {isPlaying ? '♪' : '○'}
        </div>
      </div>

      <button 
        className={`metronome-button ${isPlaying ? 'playing' : ''}`}
        onClick={toggleMetronome}
      >
        {isPlaying ? '⏸ Pause Metronome' : '▶ Start Metronome'}
      </button>

      {isPlaying && (
        <div className="beat-counter">
          Beats: {beatCount}
        </div>
      )}
    </div>
  )
}

export default RhythmAssist
