# CPR Coach - Rhythm Assist

A real-time CPR guidance web application that uses computer vision to monitor posture and provide rhythm assistance during CPR training.

## ⚠️ Disclaimer

**This tool provides CPR guidance only and does not replace professional medical training.** It is designed for training purposes and does not diagnose medical conditions or measure vital signs.

## 🎯 Features

### Computer Vision Pose Detection
- Real-time human pose tracking using MediaPipe Pose
- Tracks shoulders, elbows, wrists, and hips
- Fully browser-based (no backend required)

### Posture Analysis
- **Arm Straightness Detection**: Monitors elbow angles to ensure proper CPR posture (≥160°)
- Visual feedback with green/red indicators
- Audio alerts when posture is incorrect
- Smooth landmark filtering to reduce noise

### Compression Detection
- Tracks vertical shoulder movement to count compressions
- Real-time compression counting
- Does NOT attempt depth measurement (follows medical best practices)

### Rhythm-Assist Metronome
- 110 BPM metronome with audio beeps
- Visual pulse animation synchronized with the beat
- Compares user's actual compression rate with target BPM
- Provides feedback: "Push faster", "Slow down", or "Good rhythm"

### Intelligent Feedback System
- **Priority-based feedback**: Posture corrections take precedence over rhythm guidance
- High-contrast emergency-friendly UI
- Large buttons and clear status indicators
- Real-time stats display

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ and npm
- Modern web browser with camera access
- Good lighting conditions

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Camera Setup

1. Position your camera sideways to capture a **side view** of the rescuer
2. Ensure shoulders, elbows, wrists, and hips are visible in the frame
3. Grant camera permissions when prompted
4. Ensure adequate lighting

## 🏗️ Project Structure

```
src/
├── components/
│   ├── CameraFeed.js         # Camera access and video display
│   ├── CameraFeed.css
│   ├── PoseDetector.js       # MediaPipe Pose integration
│   ├── CPRAnalyzer.js        # Posture and compression analysis
│   ├── FeedbackPanel.js      # Real-time feedback display
│   ├── FeedbackPanel.css
│   ├── RhythmAssist.js       # 110 BPM metronome
│   ├── RhythmAssist.css
│   ├── SetupGuide.js         # Initial setup instructions
│   └── SetupGuide.css
├── App.js                     # Main application component
├── App.css
├── index.js
└── index.css
```

## 🔬 Technical Implementation

### Pose Detection
- Uses MediaPipe Pose (Web) library
- Tracks 8 key landmarks: shoulders (11,12), elbows (13,14), wrists (15,16), hips (23,24)
- 30-60 FPS performance
- Moving average filter with 5-frame history for smoothing

### Geometry Calculations
```javascript
// Elbow angle calculation using vector geometry
angle = arccos((v1 · v2) / (|v1| × |v2|))

// Where:
// v1 = vector from elbow to shoulder
// v2 = vector from elbow to wrist
```

### Compression Detection
- Monitors vertical (Y-axis) position of shoulders
- Detects down-up motion cycles
- 2% frame height movement threshold
- Tracks last 10 compressions for rate calculation

### Audio Feedback
- Web Audio API for all audio generation
- Posture warning: 800Hz sine wave with 3-second cooldown
- Metronome beep: 1000Hz sine wave at 110 BPM (0.545s intervals)

## 🎨 UI/UX Design

- Emergency-themed color scheme (reds, oranges, golds)
- High contrast for visibility in various lighting
- Responsive design for desktop and tablet
- Clear visual hierarchy with priority-based feedback
- Accessibility considerations with large touch targets

## 🔧 Performance Optimizations

1. **Video Resolution**: Optimized to 640x480 for balance between quality and performance
2. **Pose Complexity**: Medium complexity setting for MediaPipe
3. **Landmark Smoothing**: 5-frame moving average filter
4. **Efficient Rendering**: RequestAnimationFrame for smooth updates
5. **Compression Tracking**: Only stores last 10 seconds of data

## 📱 Browser Compatibility

- Chrome 90+ (Recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

**Note**: Requires browser support for:
- MediaPipe
- Web Audio API
- getUserMedia API
- Canvas API

## 🔒 Privacy

- All processing happens locally in the browser
- No video or data is transmitted to any server
- No backend dependencies
- Camera access can be revoked at any time

## 🛠️ Development

### Available Scripts

- `npm start` - Run development server
- `npm run build` - Create production build
- `npm test` - Run tests

### Key Dependencies

- React 18.2.0
- @mediapipe/pose 0.5.x
- @mediapipe/camera_utils 0.3.x
- @mediapipe/drawing_utils 0.3.x

## 📋 Future Enhancements

- Multi-person detection support
- Session recording and playback
- Training mode with guided exercises
- Export compression statistics
- Voice feedback option
- Dark/Light theme toggle

## 🤝 Contributing

This is a training tool. Contributions should focus on:
- Improving accuracy of pose detection
- Enhancing user feedback mechanisms
- Performance optimizations
- Accessibility improvements

## 📄 License

MIT License - See LICENSE file for details

## 👥 Credits

- MediaPipe by Google for pose detection
- React.js for UI framework
- Web Audio API for sound generation

---

**Remember**: This tool is for training and guidance purposes only. Always seek proper CPR certification from recognized medical organizations.
