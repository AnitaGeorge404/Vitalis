# "Do I Need a Doctor?" Feature - Implementation Guide

## Overview

The "Do I Need a Doctor?" feature is a comprehensive health assessment and decision support system within the General Health Check module. It provides users with risk-based guidance to help them decide whether they should seek immediate medical attention, consult a doctor soon, monitor symptoms at home, or follow self-care guidance.

**IMPORTANT:** This feature does NOT provide medical diagnosis. It only offers guidance and decision support.

## Architecture

### File Structure

```
src/health/
├── DoctorChecklist.jsx          # Main orchestrator component
├── SymptomSelector.jsx          # Step 1: Symptom selection UI
├── VitalInputs.jsx              # Step 2: Vital signs input
├── ContextualInputs.jsx         # Step 3: Health context & risk factors
├── ResultsDisplay.jsx           # Step 4: Results & recommendations
├── TriageEngine.js              # Core triage logic & rules
└── DoctorNeed.css               # Styling for all components
```

## Core Components

### 1. TriageEngine.js

The heart of the system. Contains:

- **SYMPTOMS**: 24+ symptoms organized by category with:

  - Severity weights (mild/moderate/severe)
  - Red flag indicators
  - Explanations

- **DURATION_OPTIONS**: Time duration multipliers affecting urgency
- **TRIAGE_LEVELS**: 3 output levels (RED/YELLOW/GREEN)
- **AGE_GROUPS**: Age-based risk multipliers
- **CHRONIC_CONDITIONS**: 6+ chronic conditions with risk multipliers
- **RECENT_EVENTS**: Recent medical events affecting risk
- **VITAL_RANGES**: Normal, concerning, and critical vital ranges
- **calculateTriage()**: Main scoring algorithm

### 2. DoctorChecklist.jsx

Main orchestrator component that:

- Manages 4-step workflow (Symptoms → Vitals → Context → Results)
- Maintains state for all inputs
- Saves assessment history to localStorage
- Handles navigation between steps

### 3. SymptomSelector.jsx

Multi-select symptom interface featuring:

- 24+ symptoms organized by 8 categories
- Severity selection (mild/moderate/severe)
- Duration selection (< 24 hrs to >4 weeks)
- Red flag indicators for emergency symptoms
- Expandable UI for better usability

### 4. VitalInputs.jsx

Optional vital signs collection:

- Heart rate (bpm)
- Body temperature (°F)
- Oxygen saturation (%)
- Visual status indicators (Normal/Concerning/Critical)
- Helpful tooltips for each vital

### 5. ContextualInputs.jsx

Risk factor assessment:

- Age group selection
- Gender (optional)
- Pregnancy status (conditional)
- Chronic conditions (multi-select)
- Recent medical events (multi-select)

### 6. ResultsDisplay.jsx

Result presentation with:

- Color-coded triage level (RED/YELLOW/GREEN)
- Recommended actions
- Risk score (0-10)
- Assessment details
- Warning signs to watch
- Monitoring guidance
- Safety disclaimer
- Assessment history

## Triage Logic

### Scoring Algorithm

1. **Red Flag Check**: Immediate emergency symptoms → RED level
2. **Vital Check**: Critical vitals → RED level
3. **Symptom Scoring**: Each symptom scored by severity × duration multiplier
4. **Risk Multiplier Application**: Age, conditions, events adjust final score
5. **Threshold Decision**:
   - Score ≥ 7.5 → RED
   - Score ≥ 4 → YELLOW
   - Score < 4 → GREEN
   - Multiple symptoms (≥3) at score ≥ 3.5 → YELLOW

### Risk Multipliers

- **Age**: Children (<5) and seniors (65+) have higher multipliers (1.5-1.8x)
- **Chronic Conditions**: 1.3-1.6x multiplier per condition
- **Pregnancy**: 1.3x multiplier
- **Recent Events**: 1.2-1.5x multiplier depending on event

### Red Flag Symptoms (Immediate Emergency)

- Chest pain / pressure
- Difficulty breathing
- Loss of consciousness / fainting
- Severe headache
- Confusion / disorientation
- Severe weakness / paralysis
- Severe abdominal pain
- Persistent vomiting
- Bloody stool / blood in vomit
- Fever + stiff neck
- Significant bleeding
- Head injury with altered consciousness
- Wheezing / stridor

## Output Levels

### RED - Emergency Care Recommended 🚨

- **Title**: "Seek Emergency Care Immediately"
- **Color**: Red (#dc2626)
- **Timeframe**: Call 911 immediately
- **Actions**: Emergency response guidance
- **When triggered**: Red flag symptoms, critical vitals, severe presentations

### YELLOW - Consult a Doctor Soon ⚠️

- **Title**: "Consult a Doctor Soon"
- **Color**: Orange (#d97706)
- **Timeframe**: 24-48 hours
- **Actions**: Doctor consultation guidance
- **When triggered**: Moderate symptom combinations, prolonged symptoms, risk factors

### GREEN - Monitor at Home ✅

- **Title**: "Monitor at Home"
- **Color**: Green (#10b981)
- **Timeframe**: Self-care monitoring
- **Actions**: Self-care recommendations
- **When triggered**: Mild or recent symptoms, low risk scores

## Usage Flow

```
1. START: User opens "Do I Need a Doctor?"
   ↓
2. SYMPTOMS: Select symptoms + severity + duration
   ↓
3. VITALS: Enter vital signs (optional but recommended)
   ↓
4. CONTEXT: Enter age, conditions, recent events
   ↓
5. CALCULATE: System runs triage algorithm
   ↓
6. RESULTS: Display recommendation with full explanation
   ↓
7. OPTIONS:
   - Set follow-up reminder (for YELLOW level)
   - Restart for new assessment
   - View assessment history
```

## Data Persistence

- **Assessment History**: Saved to localStorage (last 5 assessments)
- **Follow-up Reminders**: Managed by FollowUpReminder component
- **Format**: JSON serialization with timestamps

## Safety & Ethics Features

1. **Prominent Disclaimer**: Clearly states "NOT a medical diagnosis"
2. **Conservative Scoring**: Errs on the safer side
3. **Red Flag Detection**: Quick escalation for emergencies
4. **Warning Signs**: Lists conditions requiring escalation
5. **Monitoring Guidance**: Helps users track condition changes
6. **Professional Recommendation**: Always encourages consultation when unsure

## CSS Classes & Styling

The feature uses a comprehensive CSS file with:

- Component-specific sections
- Responsive design (mobile/tablet/desktop)
- Accessibility considerations
- Smooth animations and transitions
- Color-coded severity indicators
- Collapsible sections for better UX

## Integration Points

### From App

- Route: `/health/doctor-checklist` (via HealthCheck page)
- Dependencies: SafetyBanner, FollowUpReminder components
- Data: Can integrate with vital tracking from other features

### To App

- Assessment results stored in localStorage
- Can connect to health history tracking
- Can link to doctor contact/scheduling features

## Feature Highlights

✅ **Comprehensive Symptom Library**: 24+ symptoms across 8 categories
✅ **Smart Triage**: Context-aware scoring with risk multipliers
✅ **Red Flag Detection**: Immediate emergency symptom identification
✅ **Optional Vitals**: Enhanced assessment with heart rate, temp, O2 sat
✅ **Risk Factors**: Age, chronic conditions, pregnancy, recent events
✅ **Detailed Explanations**: Users understand why recommendation given
✅ **Warning Signs**: Lists concerning symptoms requiring escalation
✅ **Follow-up Reminders**: Built-in reminder system
✅ **Assessment History**: Track past assessments
✅ **Mobile Responsive**: Works on all device sizes
✅ **Accessibility**: Keyboard navigation, clear labels, semantic HTML
✅ **Safety First**: Conservative scoring, clear disclaimers

## Testing Scenarios

### Test Case 1: Emergency (RED)

- Select: Chest pain (severe)
- Expected: RED level with immediate emergency guidance

### Test Case 2: Doctor Visit (YELLOW)

- Select: High fever (moderate) + persistent cough (moderate) for 5 days
- Add: Age 65+
- Expected: YELLOW level with 24-48 hour doctor guidance

### Test Case 3: Home Care (GREEN)

- Select: Mild headache (mild) for <24 hours
- No vitals, no risk factors
- Expected: GREEN level with home care guidance

### Test Case 4: Multiple Risk Factors (YELLOW escalation)

- Select: 3 mild symptoms for 5 days
- Add: Age >65, diabetes, recent surgery
- Expected: YELLOW level due to risk multipliers

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- LocalStorage required for history feature
- Notification API optional (for reminders)

## Future Enhancements

- Integration with health device APIs (Apple Health, Google Fit)
- Real-time vital tracking
- Symptom comparison with past assessments
- Doctor contact/scheduling integration
- Multi-language support
- Export assessment as PDF
- Advanced analytics on assessment patterns

## Performance Considerations

- Lightweight algorithm (< 50ms calculation)
- No external API calls required
- LocalStorage used for persistence
- Minimal re-renders with React state management
- CSS animations GPU-accelerated

## Notes for Developers

- Modify SYMPTOMS in TriageEngine.js to add new symptoms
- Adjust severity weights or duration multipliers for different behavior
- Add new CHRONIC_CONDITIONS as needed
- Customize TRIAGE_LEVELS output messages
- Extend VITAL_RANGES for different medical standards
- Use `calculateTriage()` function in other contexts if needed

---

**Created**: January 2026
**Status**: Production Ready
**Version**: 1.0
