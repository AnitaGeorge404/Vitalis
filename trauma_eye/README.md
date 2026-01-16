# 🏥 Trauma Eye - Emergency Wound Analysis System

AI-powered wound detection and treatment recommendation system using computer vision (OpenCV) and React.

## 🌟 Features

### Core Functionality
- **📸 Camera Capture & Upload**: Take photos or upload existing images of wounds
- **🔍 Wound Detection**: HSV-based red detection with morphological operations
- **🏷️ Wound Classification**: Identifies burns (1st/2nd/3rd degree), lacerations, abrasions, punctures
- **🦠 Infection Detection**: Detects pus, necrosis, and inflammation signs
- **📏 Size Measurement**: Estimates wound dimensions in pixels and centimeters
- **⚠️ Risk Assessment**: CRITICAL/MODERATE/LOW risk levels with confidence scores
- **💊 Treatment Recommendations**: Step-by-step first aid instructions based on severity
- **📊 Wound Comparison**: Track healing progress over time
- **📱 Photo Quality Feedback**: Validates brightness, blur, and resolution

### User Experience
- **Mobile-first responsive design**
- **Real-time image preview**
- **Loading states during analysis**
- **Color-coded risk badges** (Red=Critical, Yellow=Moderate, Green=Low)
- **Emergency call button** for critical wounds
- **Wound history tracking** with localStorage
- **Export/print reports**
- **Accessible UI** with ARIA labels and keyboard navigation

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Local Storage** for wound history

### Backend
- **Node.js** with Express
- **Python 3** with OpenCV and NumPy
- **Child process** communication between Node.js and Python

### Image Processing
- **OpenCV (cv2)** - Computer vision operations
- **NumPy** - Numerical operations
- **HSV color space** - Red wound detection
- **Morphological operations** - Mask cleaning
- **Contour detection** - Boundary identification

## 📁 Project Structure

```
hackher1/
├── client/                          # React frontend
│   ├── public/
│   │   └── index.html              # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   └── TraumaEye/
│   │   │       ├── TraumaEye.tsx        # Main component
│   │   │       ├── CameraCapture.tsx    # Photo capture/upload
│   │   │       ├── ResultsDisplay.tsx   # Analysis results UI
│   │   │       ├── TreatmentSteps.tsx   # Treatment recommendations
│   │   │       └── WoundHistory.tsx     # History tracking
│   │   ├── types/
│   │   │   └── trauma.ts           # TypeScript interfaces
│   │   ├── App.tsx                 # Root component
│   │   ├── index.tsx               # Entry point
│   │   └── index.css               # Tailwind styles
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── .env.example
│
└── server/                          # Node.js + Python backend
    ├── server.js                    # Express API
    ├── trauma_eye.py                # Python wound analysis
    ├── package.json
    └── requirements.txt             # Python dependencies
```

## 🚀 Setup & Installation

### Prerequisites
- **Node.js** 16+ and npm
- **Python** 3.8+
- **pip** (Python package manager)

### Backend Setup

1. **Install Python dependencies:**
```bash
cd server
pip install -r requirements.txt
```

2. **Install Node.js dependencies:**
```bash
npm install
```

3. **Start the server:**
```bash
npm start
```
Server will run on `http://localhost:5000`

### Frontend Setup

1. **Install dependencies:**
```bash
cd client
npm install
```

2. **Create environment file:**
```bash
cp .env.example .env
```

3. **Start the development server:**
```bash
npm start
```
App will open at `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

**Client (.env)**
```
REACT_APP_API_URL=http://localhost:5000
```

**Server**
```
PORT=5000  # Optional, defaults to 5000
NODE_ENV=development
```

### Python Configuration

On Unix systems, you may need to change the Python command in `server/server.js`:
```javascript
const pythonPath = 'python3'; // Instead of 'python'
```

## 📡 API Documentation

### POST /api/analyze-wound

Analyzes a wound image and returns comprehensive results.

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,...",
  "previous_wound_data": {
    "measurements": {
      "area_pixels": 12500
    }
  }
}
```

**Response:**
```json
{
  "risk": "MODERATE",
  "confidence": 0.75,
  "visual_overlay": "data:image/jpeg;base64,...",
  "message": "Wound detected: Laceration (cut with jagged edges). Medical attention recommended.",
  "wound_types": ["Laceration (cut with jagged edges)"],
  "infection_analysis": {
    "risk_level": "LOW",
    "signs": ["No obvious signs of infection"],
    "risk_factors": 0
  },
  "measurements": {
    "length_pixels": 245,
    "width_pixels": 180,
    "area_pixels": 12500,
    "estimated_cm": "~2.5cm",
    "size_category": "Medium (1-3cm)",
    "bounding_box": {"x": 150, "y": 200, "w": 180, "h": 245}
  },
  "treatment_recommendations": {
    "urgency": "URGENT",
    "steps": [
      "Seek medical attention within 2-4 hours",
      "Stop any bleeding by applying direct pressure with clean cloth",
      "Clean wound gently with clean water or saline solution",
      "Apply antibiotic ointment (like Neosporin) if not allergic",
      "Cover with sterile bandage or gauze"
    ],
    "seek_emergency_if": [
      "Bleeding doesn't stop after 10 minutes of pressure",
      "Wound edges gap open or won't stay closed"
    ]
  },
  "photo_quality": {
    "is_acceptable": true,
    "quality_score": 85,
    "issues": [],
    "brightness": 127.5,
    "sharpness": 245.8
  },
  "wound_comparison": {
    "healing_status": "Improving",
    "comparison": "Wound decreased by 15.2% - healing well ✓",
    "area_change_percent": -15.2,
    "previous_area_pixels": 14700,
    "current_area_pixels": 12500
  },
  "timestamp": "2026-01-16T14:30:00.000Z"
}
```

**Error Response:**
```json
{
  "error": true,
  "message": "Photo quality is insufficient for analysis. Please retake the photo.",
  "photo_quality": {
    "is_acceptable": false,
    "quality_score": 30,
    "issues": ["Image too dark. Use better lighting."]
  }
}
```

## 🧪 Testing

### Test with Sample Images

1. **Create test images** with red-colored areas to simulate wounds
2. **Test scenarios:**
   - Small cut (< 1cm)
   - Medium laceration (1-3cm)
   - Large burn (> 3cm)
   - Poor quality image (blurry/dark)
   - No wound visible

### Manual Testing Checklist

- [ ] Camera capture works on mobile devices
- [ ] File upload accepts JPEG/PNG
- [ ] Large files (>10MB) are rejected
- [ ] Poor quality images show feedback
- [ ] Wound detection draws bounding boxes
- [ ] Risk badges display correct colors
- [ ] Treatment steps render properly
- [ ] Wound history saves to localStorage
- [ ] Export report downloads .txt file
- [ ] Emergency call button triggers tel:911
- [ ] Mobile responsive design works
- [ ] Print functionality works

## 🎨 UI/UX Design

### Color Coding
- **🔴 Red (CRITICAL)**: Immediate emergency care needed
- **🟡 Yellow (MODERATE)**: Medical attention recommended
- **🟢 Green (LOW)**: Monitor and follow first aid

### Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation support
- High contrast for critical alerts
- Touch targets minimum 44px
- Screen reader friendly

### Mobile-First Design
- Responsive layouts for all screen sizes
- Touch-optimized controls
- Camera integration for mobile devices
- Swipe gestures for history

## ⚠️ Medical Disclaimer

**IMPORTANT**: This tool provides preliminary wound assessment only and is NOT a substitute for professional medical advice.

- Always consult a healthcare professional for any injury
- In case of emergency, call 911 immediately
- The AI analysis may not be 100% accurate
- Use this tool as a supplementary reference only

## 🔒 Privacy & Data

- **No server-side storage**: Images are processed in real-time and not saved
- **Local storage only**: Wound history stored in browser localStorage
- **No data transmission**: Analysis happens on your server
- **HIPAA considerations**: For production use, ensure compliance with medical data regulations

## 🐛 Troubleshooting

### Python script fails to run
- Ensure Python is installed: `python --version` or `python3 --version`
- Check OpenCV installation: `pip list | grep opencv`
- Verify script path in server.js is correct

### Image analysis returns errors
- Check image format (JPEG/PNG supported)
- Verify image size is under 10MB
- Ensure good lighting and focus
- Try different wound images

### Port already in use
```bash
# Change port in server.js
const PORT = process.env.PORT || 5001;
```

### CORS errors
- Ensure CORS is enabled in server.js
- Check API_URL in client .env matches server URL

## 🚢 Production Deployment

### Frontend (Client)
```bash
cd client
npm run build
# Deploy 'build' folder to hosting service (Vercel, Netlify, etc.)
```

### Backend (Server)
1. Set `NODE_ENV=production`
2. Use process manager (PM2):
```bash
npm install -g pm2
pm2 start server.js --name trauma-eye-api
```

### Environment Variables
- Set `REACT_APP_API_URL` to production API URL
- Configure CORS for production domain

## 📈 Future Enhancements

- [ ] Multi-language support
- [ ] Advanced ML models (TensorFlow/PyTorch)
- [ ] Integration with medical databases
- [ ] Telemedicine consultation booking
- [ ] Cloud storage for wound history
- [ ] Comparison with medical reference images
- [ ] Real-time wound healing prediction
- [ ] Integration with wearable devices

## 👥 Contributing

This is a hackathon project. For production use:
1. Consult medical professionals for validation
2. Conduct clinical trials
3. Obtain necessary medical certifications
4. Implement HIPAA compliance
5. Add comprehensive error handling
6. Improve ML accuracy with larger datasets

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- OpenCV community for computer vision tools
- Medical professionals for wound care guidance
- React and Node.js communities

---

**Built with ❤️ for HackHer hackathon**

For questions or issues, please open a GitHub issue or contact the development team.
