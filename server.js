import express from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import cors from 'cors'

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())

// Initialize Gemini with API key (stored securely on server)
const API_KEY = process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE'
const genAI = new GoogleGenerativeAI(API_KEY)

// Emergency AI endpoint
app.post('/api/emergency', async (req, res) => {
  try {
    const { question } = req.body

    if (!question) {
      return res.status(400).json({ error: 'Question is required' })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    // Ultra-concise emergency prompt - NO FLUFF
    const prompt = `You are an emergency medical AI. Give ULTRA-CONCISE, CRITICAL-ONLY guidance. NO introductions, NO elaboration, NO fluff.

RULES:
1. Start with "🚨 CALL 911" for life-threatening (gunshot, severe bleeding, not breathing, poisoning, severe burns, chest pain, seizures)
2. Use ONLY numbered steps (1️⃣, 2️⃣, 3️⃣) - max 5 steps
3. Each step: ONE action, 5-8 words MAX
4. Add ⚠️ DO NOT section ONLY if critical (2-3 points max)
5. NO explanations, NO details unless life-critical
6. Total response: 100-150 words MAX
7. Format: Action → What → Why (only if critical)

Emergency: ${question}

Give IMMEDIATE, CRITICAL-ONLY guidance:`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    res.json({ 
      response: response,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Gemini API Error:', error)
    res.status(500).json({ 
      error: 'Failed to get response',
      message: error.message 
    })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Emergency AI API is running' })
})

app.listen(PORT, () => {
  console.log(`🚀 Emergency AI API running on http://localhost:${PORT}`)
  console.log(`✅ Gemini API Key: ${API_KEY ? 'Configured' : 'Missing'}`)
})
