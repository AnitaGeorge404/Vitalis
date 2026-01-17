#!/bin/bash

# Gemini AI Setup Helper Script

echo "🤖 Vitalis - Gemini AI Setup"
echo "=============================="
echo ""
echo "📝 Step 1: Get Your FREE Gemini API Key"
echo "----------------------------------------"
echo "1. Open this URL in your browser:"
echo "   👉 https://makersuite.google.com/app/apikey"
echo ""
echo "2. Sign in with your Google account"
echo "3. Click 'Create API Key' button"
echo "4. Copy the API key (starts with 'AIzaSy...')"
echo ""
echo "⌨️  Step 2: Enter Your API Key"
echo "----------------------------------------"
read -p "Paste your Gemini API key here: " api_key

if [ -z "$api_key" ]; then
    echo "❌ No API key provided. Exiting..."
    exit 1
fi

# Validate API key format (basic check)
if [[ ! $api_key =~ ^AIzaSy ]]; then
    echo "⚠️  Warning: API key doesn't start with 'AIzaSy'. Are you sure it's correct?"
    read -p "Continue anyway? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        exit 1
    fi
fi

# Update .env file
echo ""
echo "💾 Step 3: Updating .env file..."
echo "----------------------------------------"

if [ -f .env ]; then
    # Replace the VITE_GEMINI_API_KEY line
    if grep -q "VITE_GEMINI_API_KEY" .env; then
        sed -i "s|VITE_GEMINI_API_KEY=.*|VITE_GEMINI_API_KEY=$api_key|" .env
        echo "✅ .env file updated successfully!"
    else
        echo "" >> .env
        echo "VITE_GEMINI_API_KEY=$api_key" >> .env
        echo "✅ API key added to .env file!"
    fi
else
    echo "❌ .env file not found!"
    exit 1
fi

echo ""
echo "🎉 Setup Complete!"
echo "=============================="
echo ""
echo "📋 Next Steps:"
echo "1. Restart your dev server:"
echo "   • Press Ctrl+C in the terminal running 'npm run dev'"
echo "   • Then run: npm run dev"
echo ""
echo "2. Open the chatbot:"
echo "   👉 http://localhost:5176/emergency/chatbot"
echo ""
echo "3. Look for the purple badge: '✨ Powered by Gemini AI'"
echo ""
echo "4. Try asking: 'Someone fell and hit their head, now confused'"
echo ""
echo "✨ You're all set! Enjoy AI-powered emergency guidance!"
