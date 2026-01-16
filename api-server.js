import express from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import cors from 'cors'

const app = express()
const PORT = 4000

// Middleware
app.use(cors())
app.use(express.json())

// Initialize Gemini with your API key (SECURE - not exposed to frontend)
const genAI = new GoogleGenerativeAI('AIzaSyB3CkQ1JoqxbQS9W9AADsXJH1zhHQhYBT4')

// Emergency AI endpoint
app.post('/api/emergency-ai', async (req, res) => {
  try {
    const { question } = req.body

    if (!question) {
      return res.status(400).json({ error: 'Question is required' })
    }

    // Use Gemini 2.0 Flash model (fastest and latest)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // FAST & TO THE POINT prompt - no fluff!
    const prompt = `You are an emergency medical AI. Give FAST, CRITICAL, TO-THE-POINT guidance ONLY. No introductions, no explanations, just ACTION STEPS.

RULES:
1. Start with "🚨 CALL 911 NOW" for serious emergencies
2. Use numbered steps (1️⃣, 2️⃣, 3️⃣) - MAX 5 steps
3. Each step: ONE sentence, ONE action
4. Add "⚠️ DON'T:" with 2-3 critical warnings
5. TOTAL: Under 150 words
6. NO fluff, NO background info, NO "stay calm" talk
7. ONLY critical actions that save lives

Emergency: ${question}

Give IMMEDIATE actions NOW:`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    res.json({ response: text })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Failed to get AI response' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Emergency AI API is running' })
})

app.listen(PORT, () => {
  console.log(`✅ Emergency AI API running on http://localhost:${PORT}`)
  console.log(`🚨 Ready to provide FAST emergency guidance!`)
})
