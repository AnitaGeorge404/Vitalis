# CPR Coach Feature

## Overview
Advanced CPR training tool with real-time AI-powered pose detection and rhythm guidance.

## Features

### 🎯 Real-Time Posture Analysis
- **Arm Straightness Detection**: Monitors elbow angles to ensure arms stay locked
- **Spine Stability Check**: Detects excessive back bending to promote shoulder-driven compressions
- **Hand Position Verification**: Ensures proper hand placement at center of chest

### 📊 Live Feedback System
- **Posture Status**: Visual indicators for correct/incorrect form
- **Compression Counter**: Tracks total compressions performed
- **Rate Monitor**: Displays current compression rate in BPM

### 🎵 Rhythm Metronome
- **110 BPM Target**: Industry-standard CPR compression rate
- **Audio Beats**: Audible metronome to maintain rhythm
- **Visual Pulse**: Animated circle synced with target rhythm
- **Adaptive Feedback**: Compares your rate to target and provides guidance

### 📹 Camera-Based Detection
- **MediaPipe Pose**: Uses Google's MediaPipe for accurate body landmark detection
- **Side-View Positioning**: Optimized for side-on camera angle
- **Real-Time Processing**: Instant feedback with minimal latency
- **Visual Skeleton Overlay**: See your detected pose overlaid on video

## How It Works

### 1. Setup Phase
- Position camera for side view
- Ensure full visibility of shoulders, elbows, wrists, and hips
- Use CPR mannequin or firm surface for practice

### 2. Training Session
- System analyzes your posture in real-time
- Compressions only counted when posture is correct
- Audio feedback alerts you to posture issues
- Metronome helps maintain proper rhythm

### 3. Feedback Loop
- **Green indicators**: Posture is correct
- **Red indicators**: Posture needs adjustment
- **Rate guidance**: Speed up or slow down prompts
- **Real-time stats**: Live compression count and rate

## Technical Implementation

### Components
- **CPRCoach.jsx**: Main container component
- **CameraFeed.jsx**: Video capture and display
- **CPRAnalyzer.js**: Pose analysis and biomechanics validation
- **PoseDetector.js**: MediaPipe wrapper for landmark detection
- **FeedbackPanel.jsx**: Visual feedback display
- **RhythmAssist.jsx**: Metronome and rhythm guidance
- **SetupGuide.jsx**: Initial setup instructions

### AI/ML Features
- **Landmark Smoothing**: Moving average filter reduces jitter
- **Angle Calculations**: Vector math for elbow and spine angles
- **Compression Detection**: Shoulder Y-position tracking with peak/trough analysis
- **Rate Calculation**: Time-based analysis of recent compressions

### Validation Thresholds
- Elbow Angle: ≥160° (straight arms)
- Spine Stability: <15° change (minimal bending)
- Compression Depth: ≥1.5% of frame height
- Hand Position: Within 10% of chest center

## Safety Notes

⚠️ **Important**
- This is a **training tool only**
- Never practice on real people
- Use only on CPR mannequins or firm surfaces
- Seek professional CPR certification
- Not for use in actual emergencies

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 14.5+)
- Camera permission required

## Performance

- Pose detection: ~30 FPS
- Analysis latency: <50ms
- Smooth operation on modern devices
- Optimized for laptop/desktop use

---

Built with React + MediaPipe Pose + Web Audio API
