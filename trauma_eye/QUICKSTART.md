# 🚀 Quick Start Guide - Trauma Eye

Get the Trauma Eye wound analysis system running in 5 minutes!

## Step 1: Install Python Dependencies

```bash
cd server
pip install opencv-python==4.8.1.78 numpy==1.24.3
```

## Step 2: Install Backend Dependencies

```bash
# Still in server directory
npm install
```

## Step 3: Start Backend Server

```bash
npm start
```

✅ Backend should be running on `http://localhost:5000`

## Step 4: Install Frontend Dependencies (New Terminal)

```bash
cd client
npm install
```

## Step 5: Start Frontend

```bash
npm start
```

✅ React app should open automatically at `http://localhost:3000`

## 🎯 Testing the Application

1. **Click "Take Photo"** or **"Upload Image"**
2. Select an image with red-colored areas (to simulate a wound)
3. Click **"Analyze Wound"**
4. Wait 2-5 seconds for analysis
5. View results with risk level, measurements, and treatment recommendations

## 📸 Tips for Best Results

- Use images with clear red/pink areas
- Ensure good lighting (not too dark or bright)
- Keep images in focus (not blurry)
- Minimum resolution: 400x400 pixels
- Maximum file size: 10MB

## ⚠️ Troubleshooting

### "Python not found" error
- Windows: Install Python from python.org
- Mac/Linux: Use `python3` instead of `python` in server.js line 53

### Backend won't start
- Check if port 5000 is available
- Try a different port by changing `PORT` in server.js

### Frontend won't connect to backend
- Verify backend is running on port 5000
- Check `.env` file has correct `REACT_APP_API_URL`

### OpenCV installation issues
```bash
pip install --upgrade pip
pip install opencv-python --no-cache-dir
```

## 🎉 You're Ready!

Your Trauma Eye application is now running. Try analyzing some wound images!

For detailed documentation, see [README.md](README.md)
