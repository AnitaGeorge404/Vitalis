# 🚀 Quick Setup: Enable Gemini AI (2 Minutes)

## Step 1: Get Your FREE API Key 🔑

**Click this link:** https://makersuite.google.com/app/apikey

1. Sign in with your Google account
2. Click **"Create API Key"** or **"Get API Key"**
3. Click **"Create API key in new project"** (if prompted)
4. Copy the API key (it starts with `AIzaSy...`)

---

## Step 2: Add API Key to Your Project 💾

### Option A: Using Terminal (Easiest)
```bash
# Open the .env file
nano .env

# Replace this line:
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# With your actual key:
VITE_GEMINI_API_KEY=AIzaSyDxxx...your_actual_key_here

# Save and exit (Ctrl+O, Enter, Ctrl+X)
```

### Option B: Using VS Code
1. Open file: `/home/user/Vitalis/.env`
2. Find line: `VITE_GEMINI_API_KEY=your_gemini_api_key_here`
3. Replace with: `VITE_GEMINI_API_KEY=AIzaSyDxxx...your_actual_key_here`
4. Save file (Ctrl+S)

---

## Step 3: Restart Dev Server 🔄

In your terminal where dev server is running:
```bash
# Press Ctrl+C to stop the server

# Then restart it:
npm run dev
```

---

## Step 4: Test It! ✅

1. Open: http://localhost:5176/emergency/chatbot

2. Look for the **purple badge** at the top:
   ```
   ✨ Powered by Gemini AI
   ```

3. Try asking a question:
   ```
   "Person fell off ladder and can't move their leg. What should I do?"
   ```

4. Watch Gemini AI generate a personalized response!

---

## 🎯 What to Expect

### Before (Yellow Badge):
```
📚 Offline Knowledge Base (Add API key for AI)
```
- Uses predefined responses
- Fast but limited

### After (Purple Badge):
```
✨ Powered by Gemini AI
```
- AI-generated responses
- Handles ANY scenario
- Context-aware
- Natural language

---

## 🐛 Troubleshooting

### Still showing "Offline Knowledge Base"?
1. Check API key starts with `AIzaSy`
2. No extra spaces before/after the key
3. Dev server was restarted
4. Clear browser cache (Ctrl+Shift+R)

### API Key Invalid Error?
1. Make sure you copied the complete key
2. Try creating a new API key
3. Check Google AI Studio for key status

### Need Help?
- API Key Page: https://makersuite.google.com/app/apikey
- Gemini Docs: https://ai.google.dev/docs

---

## 🎉 Success Indicators

You'll know it's working when you see:
- ✅ Purple badge "✨ Powered by Gemini AI"
- ✅ Responses take 2-3 seconds (AI thinking)
- ✅ Personalized answers to your questions
- ✅ Natural, context-aware guidance

---

**Ready? Let's set it up!** 🚀

The API key page should open automatically. If not, visit:
👉 **https://makersuite.google.com/app/apikey**
