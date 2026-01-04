# 🤖 AI Lab Assistant Setup Guide

## Quick Setup (3 steps)

### 1️⃣ Get Your Free Gemini API Key

1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key (starts with `AIza...`)

### 2️⃣ Add the API Key to Your Project

Create a file named `.env.local` in the project root:

```bash
cd /home/bhaskar/Documents/hackathon/edtech-hackathon-virtual-lab-companion
nano .env.local
```

Add this line (replace with your actual key):

```env
VITE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Save and exit (Ctrl+X, then Y, then Enter)

### 3️⃣ Restart the Dev Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## ✅ How to Test

1. Open http://localhost:5173 in your browser
2. Navigate to any experiment page
3. Click the **"Ask Lab Assistant 🤖"** button (bottom-right corner)
4. Ask a question like:
   - "Why does the solution change color?"
   - "Explain step 3"
   - "What happens if I increase the voltage?"
   - "यो प्रयोगमा के हुन्छ?" (in Nepali)

## 🎯 Features

✅ **Context-Aware**: Only answers questions about the current experiment  
✅ **Bilingual**: Automatically detects and responds in English or Nepali  
✅ **Offline Support**: Shows helpful hints when internet is unavailable  
✅ **Smart Scoping**: Politely redirects off-topic questions  
✅ **Loading States**: Shows "Thinking..." while generating responses  

## 🔧 Troubleshooting

**Problem**: "AI assistant is not configured"  
**Solution**: Make sure `.env.local` exists with the correct API key

**Problem**: Chat button doesn't appear  
**Solution**: Make sure you're on an experiment page (not the library or home page)

**Problem**: "Sorry, I encountered an error"  
**Solution**: Check your API key is valid and you have internet connection

## 📁 Files Modified

- `src/components/lab/ExperimentAssistant.tsx` - Main chat component
- `src/services/aiService.ts` - AI integration with Gemini API
- `src/pages/ExperimentPage.tsx` - Added assistant to experiment pages

## 🚀 Next Steps

- The assistant currently uses Gemini 1.5 Flash (fast & free)
- You can upgrade to Gemini Pro for better responses
- Add more experiment-specific context in `aiService.ts`
- Customize the UI styling in `ExperimentAssistant.tsx`
