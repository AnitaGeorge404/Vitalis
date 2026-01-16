# 🚀 QUICK START - CPR-COACH

## Start the App
```bash
cd /home/user/Downloads/vitalis
npm start
# Opens at http://localhost:3000
```

## Test Without Camera (RECOMMENDED)
1. Click **"🧪 Start Simulation Mode"**
2. Try each scenario button:
   - ✅ Correct CPR → Counts compressions
   - ❌ Bent Arms → Shows warning, no count
   - ❌ Bending Back → Detects bad technique
   - ⚡ Wrong Rhythm → Provides rhythm feedback
   - 🤚 Wrong Hand Position → Position warning

## Demo in 60 Seconds
1. Open app → Explain medical problem
2. Start simulation → Show "Correct CPR" scenario
3. Switch to "Bent Arms" → Point out validation
4. Explain: "We enforce actual CPR biomechanics"
5. Show code in CPRAnalyzer.js → Impress judges

## Key Files
- `src/components/CPRAnalyzer.js` → Core logic (show judges)
- `src/components/MockPoseGenerator.js` → Simulation data
- `UPGRADE_NOTES.md` → Technical deep-dive
- `SIMULATION_GUIDE.md` → Complete documentation

## Judge Questions - Quick Answers

**"Why simulation mode?"**
→ "For reliable testing and hardware-independent demos. Uses same analysis logic as live camera."

**"How do you prevent false positives?"**
→ "3-layer validation: arm angles, spine stability, compression depth. Only counts when ALL pass."

**"Why not measure depth?"**
→ "Single RGB camera can't measure absolute depth accurately. We focus on teachable technique."

**"What makes this different?"**
→ "Most teams detect movement. We validate biomechanically correct CPR technique."

## Win Conditions
✅ Working demo (simulation mode)
✅ Medical accuracy (enforces AHA guidelines)
✅ Technical depth (multi-layer validation)
✅ Engineering maturity (clean code, testing)
✅ Confidence in explanation

## If Something Breaks
1. Refresh browser
2. Click "Reset Session"
3. Try simulation mode instead of camera
4. Show code - judges love seeing the logic

## Remember
- You're solving a REAL problem (CPR training access)
- You have JUDGE-SAFE testing (simulation mode)
- You can EXPLAIN everything (documented code)
- You're READY! 💪

**GO WIN THIS! 🏆**
