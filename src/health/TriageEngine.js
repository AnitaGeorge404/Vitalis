/**
 * Triage Engine - Medical Decision Support System
 * 
 * This module provides rule-based triage logic for the "Do I Need a Doctor?" feature.
 * It analyzes symptoms, severity, duration, and risk factors to recommend:
 * - RED: Emergency care recommended
 * - YELLOW: Doctor consultation advised (24-48 hours)
 * - GREEN: Home care / monitoring
 * 
 * DISCLAIMER: This is NOT a medical diagnosis tool. It provides risk-based guidance only.
 */

// ============================================================================
// SYMPTOM DEFINITIONS
// ============================================================================

export const SYMPTOM_CATEGORIES = {
  CARDIOVASCULAR: 'cardiovascular',
  RESPIRATORY: 'respiratory',
  NEUROLOGICAL: 'neurological',
  GASTROINTESTINAL: 'gastrointestinal',
  INFECTIOUS: 'infectious',
  INTEGUMENTARY: 'integumentary',
  SENSORY: 'sensory',
  TRAUMA: 'trauma'
};

export const SYMPTOMS = [
  // Cardiovascular
  { 
    id: 'chest_pain', 
    label: 'Chest Pain / Pressure', 
    category: SYMPTOM_CATEGORIES.CARDIOVASCULAR,
    severityWeight: { mild: 8, moderate: 9, severe: 10 },
    isRedFlag: true,
    explanation: 'Chest pain can indicate cardiac issues requiring urgent evaluation.'
  },
  { 
    id: 'palpitations', 
    label: 'Heart Palpitations / Irregular Heartbeat', 
    category: SYMPTOM_CATEGORIES.CARDIOVASCULAR,
    severityWeight: { mild: 4, moderate: 6, severe: 9 },
    isRedFlag: false,
    explanation: 'Irregular heartbeat may require cardiac assessment.'
  },

  // Respiratory
  { 
    id: 'difficulty_breathing', 
    label: 'Difficulty Breathing / Shortness of Breath', 
    category: SYMPTOM_CATEGORIES.RESPIRATORY,
    severityWeight: { mild: 6, moderate: 8, severe: 10 },
    isRedFlag: true,
    explanation: 'Breathing difficulties can indicate respiratory emergencies.'
  },
  { 
    id: 'persistent_cough', 
    label: 'Persistent Cough', 
    category: SYMPTOM_CATEGORIES.RESPIRATORY,
    severityWeight: { mild: 1, moderate: 3, severe: 5 },
    isRedFlag: false,
    explanation: 'Cough may indicate infection or respiratory condition.'
  },
  { 
    id: 'wheezing', 
    label: 'Wheezing / Stridor', 
    category: SYMPTOM_CATEGORIES.RESPIRATORY,
    severityWeight: { mild: 5, moderate: 7, severe: 9 },
    isRedFlag: true,
    explanation: 'Wheezing suggests airway obstruction or asthma.'
  },

  // Neurological
  { 
    id: 'loss_of_consciousness', 
    label: 'Loss of Consciousness / Fainting', 
    category: SYMPTOM_CATEGORIES.NEUROLOGICAL,
    severityWeight: { mild: 9, moderate: 10, severe: 10 },
    isRedFlag: true,
    explanation: 'Loss of consciousness requires immediate emergency evaluation.'
  },
  { 
    id: 'severe_headache', 
    label: 'Severe Headache / Worst Headache of Life', 
    category: SYMPTOM_CATEGORIES.NEUROLOGICAL,
    severityWeight: { mild: 5, moderate: 8, severe: 10 },
    isRedFlag: true,
    explanation: 'Severe headache can indicate serious neurological conditions.'
  },
  { 
    id: 'confusion', 
    label: 'Confusion / Disorientation', 
    category: SYMPTOM_CATEGORIES.NEUROLOGICAL,
    severityWeight: { mild: 6, moderate: 8, severe: 10 },
    isRedFlag: true,
    explanation: 'Confusion requires urgent evaluation.'
  },
  { 
    id: 'dizziness', 
    label: 'Dizziness / Vertigo', 
    category: SYMPTOM_CATEGORIES.NEUROLOGICAL,
    severityWeight: { mild: 2, moderate: 4, severe: 7 },
    isRedFlag: false,
    explanation: 'Dizziness can have multiple causes and may need evaluation.'
  },
  { 
    id: 'severe_weakness', 
    label: 'Severe Weakness / Paralysis', 
    category: SYMPTOM_CATEGORIES.NEUROLOGICAL,
    severityWeight: { mild: 6, moderate: 9, severe: 10 },
    isRedFlag: true,
    explanation: 'Sudden weakness or paralysis requires urgent evaluation.'
  },

  // Gastrointestinal
  { 
    id: 'severe_abdominal_pain', 
    label: 'Severe Abdominal Pain', 
    category: SYMPTOM_CATEGORIES.GASTROINTESTINAL,
    severityWeight: { mild: 3, moderate: 6, severe: 9 },
    isRedFlag: true,
    explanation: 'Severe abdominal pain may indicate acute conditions.'
  },
  { 
    id: 'persistent_vomiting', 
    label: 'Persistent Vomiting / Unable to Keep Fluids Down', 
    category: SYMPTOM_CATEGORIES.GASTROINTESTINAL,
    severityWeight: { mild: 2, moderate: 5, severe: 8 },
    isRedFlag: true,
    explanation: 'Persistent vomiting risks dehydration and requires evaluation.'
  },
  { 
    id: 'bloody_stool', 
    label: 'Bloody Stool / Blood in Vomit', 
    category: SYMPTOM_CATEGORIES.GASTROINTESTINAL,
    severityWeight: { mild: 7, moderate: 9, severe: 10 },
    isRedFlag: true,
    explanation: 'Bleeding in GI tract requires urgent medical attention.'
  },

  // Infectious
  { 
    id: 'high_fever', 
    label: 'High Fever (>102°F / 39°C)', 
    category: SYMPTOM_CATEGORIES.INFECTIOUS,
    severityWeight: { mild: 4, moderate: 6, severe: 8 },
    isRedFlag: false,
    explanation: 'High fever may indicate infection and needs monitoring.'
  },
  { 
    id: 'fever_with_stiff_neck', 
    label: 'Fever + Stiff Neck / Sensitivity to Light', 
    category: SYMPTOM_CATEGORIES.INFECTIOUS,
    severityWeight: { mild: 9, moderate: 10, severe: 10 },
    isRedFlag: true,
    explanation: 'Fever with stiff neck suggests meningitis - emergency condition.'
  },
  { 
    id: 'chills_sweating', 
    label: 'Chills & Night Sweats', 
    category: SYMPTOM_CATEGORIES.INFECTIOUS,
    severityWeight: { mild: 2, moderate: 3, severe: 5 },
    isRedFlag: false,
    explanation: 'May indicate infection or other conditions.'
  },

  // Integumentary
  { 
    id: 'skin_rash', 
    label: 'Skin Rash (Unexplained / Spreading)', 
    category: SYMPTOM_CATEGORIES.INTEGUMENTARY,
    severityWeight: { mild: 2, moderate: 4, severe: 7 },
    isRedFlag: false,
    explanation: 'Unexplained rash may indicate allergic reaction or infection.'
  },
  { 
    id: 'significant_bleeding', 
    label: 'Significant Bleeding / Cannot Stop', 
    category: SYMPTOM_CATEGORIES.INTEGUMENTARY,
    severityWeight: { mild: 8, moderate: 9, severe: 10 },
    isRedFlag: true,
    explanation: 'Uncontrolled bleeding requires emergency care.'
  },
  { 
    id: 'wound_signs_infection', 
    label: 'Wound Signs of Infection (Red / Swollen / Pus)', 
    category: SYMPTOM_CATEGORIES.INTEGUMENTARY,
    severityWeight: { mild: 3, moderate: 5, severe: 7 },
    isRedFlag: false,
    explanation: 'Signs of wound infection need prompt medical attention.'
  },

  // Sensory
  { 
    id: 'vision_loss', 
    label: 'Vision Loss / Blurred Vision', 
    category: SYMPTOM_CATEGORIES.SENSORY,
    severityWeight: { mild: 4, moderate: 6, severe: 9 },
    isRedFlag: false,
    explanation: 'Vision changes may indicate retinal or neurological issues.'
  },
  { 
    id: 'eye_pain_redness', 
    label: 'Eye Pain / Severe Redness', 
    category: SYMPTOM_CATEGORIES.SENSORY,
    severityWeight: { mild: 3, moderate: 5, severe: 8 },
    isRedFlag: false,
    explanation: 'Eye pain may indicate infection or glaucoma.'
  },

  // Trauma
  { 
    id: 'head_injury_symptoms', 
    label: 'Head Injury (Loss of Consciousness / Confusion)', 
    category: SYMPTOM_CATEGORIES.TRAUMA,
    severityWeight: { mild: 7, moderate: 9, severe: 10 },
    isRedFlag: true,
    explanation: 'Head injury with altered consciousness requires urgent evaluation.'
  },
  { 
    id: 'severe_pain_after_trauma', 
    label: 'Severe Pain After Injury / Fall', 
    category: SYMPTOM_CATEGORIES.TRAUMA,
    severityWeight: { mild: 4, moderate: 6, severe: 8 },
    isRedFlag: false,
    explanation: 'Severe trauma-related pain may indicate fractures or internal injury.'
  },
];

// ============================================================================
// SYMPTOM DURATION MULTIPLIERS
// ============================================================================

export const DURATION_OPTIONS = [
  { value: 'hours_less_24', label: 'Less than 24 hours', multiplier: 0.8 },
  { value: 'days_1_7', label: '1-7 days', multiplier: 1.0 },
  { value: 'days_8_14', label: '8-14 days', multiplier: 1.3 },
  { value: 'weeks_3_4', label: '3-4 weeks', multiplier: 1.6 },
  { value: 'weeks_more_4', label: 'More than 4 weeks', multiplier: 2.0 }
];

// ============================================================================
// TRIAGE SEVERITY LEVELS
// ============================================================================

export const TRIAGE_LEVELS = {
  RED: {
    level: 'RED',
    title: '🚨 Seek Emergency Care Immediately',
    color: '#dc2626',
    bgColor: '#fee2e2',
    textColor: '#991b1b',
    recommendation: 'You should seek medical help immediately',
    urgency: 'URGENT',
    timeframe: 'Call 911 or go to emergency room now',
    actions: [
      'Call 911 (or emergency services) immediately',
      'Do not drive yourself if possible - call an ambulance',
      'Keep a list of your current medications ready',
      'Tell them your main symptoms and severity'
    ]
  },
  YELLOW: {
    level: 'YELLOW',
    title: '⚠️ Consult a Doctor Soon',
    color: '#d97706',
    bgColor: '#fef3c7',
    textColor: '#92400e',
    recommendation: 'Consult a doctor within 24-48 hours',
    urgency: 'IMPORTANT',
    timeframe: 'Schedule an appointment within 24-48 hours',
    actions: [
      'Contact your primary care doctor or clinic',
      'Request an appointment within 24-48 hours',
      'Monitor your symptoms carefully',
      'Note any changes to report to your doctor',
      'Stay hydrated and rest as needed'
    ]
  },
  GREEN: {
    level: 'GREEN',
    title: '✅ Monitor at Home',
    color: '#10b981',
    bgColor: '#d1fae5',
    textColor: '#065f46',
    recommendation: 'You can monitor at home for now',
    urgency: 'LOW',
    timeframe: 'Self-care at home with monitoring',
    actions: [
      'Get adequate rest',
      'Stay hydrated (drink water regularly)',
      'Use over-the-counter pain relief if needed',
      'Monitor symptoms over the next 3-7 days',
      'Contact a doctor if symptoms worsen or persist'
    ]
  }
};

// ============================================================================
// RISK FACTORS
// ============================================================================

export const AGE_GROUPS = [
  { value: 'under_5', label: 'Under 5 years', riskMultiplier: 1.5 },
  { value: 'ages_5_17', label: '5-17 years', riskMultiplier: 1.0 },
  { value: 'ages_18_65', label: '18-65 years', riskMultiplier: 1.0 },
  { value: 'ages_65_plus', label: '65+ years', riskMultiplier: 1.8 }
];

export const CHRONIC_CONDITIONS = [
  { id: 'asthma', label: 'Asthma', riskMultiplier: 1.4 },
  { id: 'diabetes', label: 'Diabetes', riskMultiplier: 1.3 },
  { id: 'heart_disease', label: 'Heart Disease / Hypertension', riskMultiplier: 1.5 },
  { id: 'lung_disease', label: 'Chronic Lung Disease (COPD)', riskMultiplier: 1.5 },
  { id: 'kidney_disease', label: 'Kidney Disease', riskMultiplier: 1.4 },
  { id: 'immunocompromised', label: 'Immunocompromised / Cancer Treatment', riskMultiplier: 1.6 }
];

export const RECENT_EVENTS = [
  { id: 'surgery_recent', label: 'Recent Surgery (within 4 weeks)', riskMultiplier: 1.4 },
  { id: 'hospitalization', label: 'Recent Hospitalization', riskMultiplier: 1.3 },
  { id: 'severe_fall', label: 'Severe Fall or Accident', riskMultiplier: 1.5 },
  { id: 'infection_exposure', label: 'Exposure to Infection', riskMultiplier: 1.2 },
  { id: 'severe_allergic_reaction', label: 'History of Severe Allergies', riskMultiplier: 1.3 }
];

// ============================================================================
// CRITICAL VITAL RANGES
// ============================================================================

export const VITAL_RANGES = {
  heart_rate: {
    normal: { min: 60, max: 100 },
    concerning: { min: 40, max: 120 },
    critical_low: 40,
    critical_high: 120
  },
  temperature: {
    normal: { min: 97, max: 99 },
    concerning: { min: 95, max: 103.1 },
    critical_low: 95,
    critical_high: 103.1
  },
  oxygen_saturation: {
    normal: { min: 95, max: 100 },
    concerning: { min: 90, max: 95 },
    critical_low: 90
  }
};

// ============================================================================
// MAIN TRIAGE ENGINE FUNCTION
// ============================================================================

/**
 * Calculate triage level based on all inputs
 * @param {Object} assessment - Assessment data
 * @returns {Object} Triage result with level, explanation, and warnings
 */
export function calculateTriage(assessment) {
  const {
    symptoms = [],
    vitals = {},
    ageGroup = null,
    chronicConditions = [],
    recentEvents = [],
    pregnancyStatus = false,
    otherContexts = []
  } = assessment;

  let triageScore = 0;
  const contributingFactors = [];

  // ========== RED FLAG CHECK: Immediate Emergency Symptoms ==========
  const hasRedFlagSymptom = symptoms.some(sym => {
    const symptomData = SYMPTOMS.find(s => s.id === sym.id);
    return symptomData?.isRedFlag;
  });

  if (hasRedFlagSymptom) {
    return {
      ...TRIAGE_LEVELS.RED,
      score: 10,
      contributingFactors: [
        'Red flag emergency symptom detected',
        ...getContributingFactorsList(symptoms, assessment)
      ],
      warningSignsToWatch: getWarningSignsList(symptoms),
      nextSteps: 'CALL 911 IMMEDIATELY',
      shouldMonitor: false
    };
  }

  // ========== RED FLAG CHECK: Critical Vitals ==========
  const vitalWarnings = checkCriticalVitals(vitals);
  if (vitalWarnings.hasCriticalVital) {
    return {
      ...TRIAGE_LEVELS.RED,
      score: 9,
      contributingFactors: vitalWarnings.warnings,
      warningSignsToWatch: getWarningSignsList(symptoms),
      nextSteps: 'CALL 911 IMMEDIATELY - CRITICAL VITAL SIGN(S)',
      shouldMonitor: false
    };
  }

  // ========== SYMPTOM SCORING ==========
  symptoms.forEach(symptom => {
    const symptomData = SYMPTOMS.find(s => s.id === symptom.id);
    if (!symptomData) return;

    const severity = symptom.severity || 'moderate';
    const severityScore = symptomData.severityWeight[severity] || 5;

    const duration = symptom.duration || 'days_1_7';
    const durationData = DURATION_OPTIONS.find(d => d.value === duration);
    const durationMultiplier = durationData?.multiplier || 1.0;

    const contributionScore = severityScore * durationMultiplier;
    triageScore += contributionScore;

    contributingFactors.push({
      symptom: symptomData.label,
      contribution: contributionScore.toFixed(1),
      severity,
      duration,
      explanation: symptomData.explanation
    });
  });

  // ========== AVERAGE SYMPTOM SCORE ==========
  if (symptoms.length > 0) {
    triageScore = triageScore / Math.max(symptoms.length, 1);
  }

  // ========== CONCERNING VITAL SIGNS (non-critical but important) ==========
  const concerningVitals = checkConcerningVitals(vitals);
  if (concerningVitals.length > 0) {
    triageScore += concerningVitals.length * 0.5;
    contributingFactors.push({
      type: 'vital_concern',
      details: concerningVitals.join(', ')
    });
  }

  // ========== RISK FACTOR MULTIPLIERS ==========
  let riskMultiplier = 1.0;

  // Age multiplier
  if (ageGroup) {
    const ageData = AGE_GROUPS.find(ag => ag.value === ageGroup);
    if (ageData) {
      riskMultiplier *= ageData.riskMultiplier;
      if (ageData.riskMultiplier > 1.0) {
        contributingFactors.push({
          type: 'age_risk',
          detail: `Age group ${ageData.label} increases risk`
        });
      }
    }
  }

  // Chronic conditions multiplier
  if (chronicConditions.length > 0) {
    chronicConditions.forEach(condId => {
      const condData = CHRONIC_CONDITIONS.find(c => c.id === condId);
      if (condData) {
        riskMultiplier *= 1 + (condData.riskMultiplier - 1) * 0.3; // Compound effect
        contributingFactors.push({
          type: 'chronic_condition',
          detail: condData.label
        });
      }
    });
  }

  // Pregnancy consideration
  if (pregnancyStatus) {
    riskMultiplier *= 1.3;
    contributingFactors.push({
      type: 'pregnancy',
      detail: 'Pregnancy status increases risk assessment'
    });
  }

  // Recent events multiplier
  if (recentEvents.length > 0) {
    recentEvents.forEach(eventId => {
      const eventData = RECENT_EVENTS.find(e => e.id === eventId);
      if (eventData) {
        riskMultiplier *= 1 + (eventData.riskMultiplier - 1) * 0.2;
        contributingFactors.push({
          type: 'recent_event',
          detail: eventData.label
        });
      }
    });
  }

  // Apply risk multiplier to final score
  triageScore *= riskMultiplier;

  // ========== DETERMINE TRIAGE LEVEL ==========
  let level;
  if (triageScore >= 7.5) {
    level = TRIAGE_LEVELS.YELLOW;
  } else if (triageScore >= 4) {
    level = TRIAGE_LEVELS.YELLOW;
  } else {
    level = TRIAGE_LEVELS.GREEN;
  }

  // Adjust for multiple concerning symptoms
  if (symptoms.length >= 3 && triageScore >= 3.5) {
    level = TRIAGE_LEVELS.YELLOW;
  }

  return {
    ...level,
    score: triageScore.toFixed(1),
    contributingFactors,
    warningSignsToWatch: getWarningSignsList(symptoms),
    nextSteps: level.timeframe,
    shouldMonitor: level.level === 'GREEN' || level.level === 'YELLOW',
    assessmentTimestamp: new Date().toISOString(),
    riskMultiplier: riskMultiplier.toFixed(2)
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check for critical vital signs
 */
function checkCriticalVitals(vitals) {
  const warnings = [];
  let hasCriticalVital = false;

  if (vitals.heartRate) {
    if (vitals.heartRate < VITAL_RANGES.heart_rate.critical_low || 
        vitals.heartRate > VITAL_RANGES.heart_rate.critical_high) {
      warnings.push(`Critical heart rate: ${vitals.heartRate} bpm`);
      hasCriticalVital = true;
    }
  }

  if (vitals.temperature) {
    if (vitals.temperature < VITAL_RANGES.temperature.critical_low || 
        vitals.temperature > VITAL_RANGES.temperature.critical_high) {
      warnings.push(`Critical temperature: ${vitals.temperature}°F`);
      hasCriticalVital = true;
    }
  }

  if (vitals.oxygenSaturation !== undefined) {
    if (vitals.oxygenSaturation < VITAL_RANGES.oxygen_saturation.critical_low) {
      warnings.push(`Critical oxygen saturation: ${vitals.oxygenSaturation}%`);
      hasCriticalVital = true;
    }
  }

  return { warnings, hasCriticalVital };
}

/**
 * Check for concerning (but not critical) vital signs
 */
function checkConcerningVitals(vitals) {
  const concerns = [];

  if (vitals.heartRate) {
    if (vitals.heartRate < VITAL_RANGES.heart_rate.concerning.min || 
        vitals.heartRate > VITAL_RANGES.heart_rate.concerning.max) {
      concerns.push(`Elevated heart rate: ${vitals.heartRate} bpm`);
    }
  }

  if (vitals.temperature) {
    if (vitals.temperature < VITAL_RANGES.temperature.concerning.min || 
        vitals.temperature > VITAL_RANGES.temperature.concerning.max) {
      concerns.push(`Elevated temperature: ${vitals.temperature}°F`);
    }
  }

  if (vitals.oxygenSaturation !== undefined) {
    if (vitals.oxygenSaturation < VITAL_RANGES.oxygen_saturation.concerning.min) {
      concerns.push(`Low oxygen saturation: ${vitals.oxygenSaturation}%`);
    }
  }

  return concerns;
}

/**
 * Get list of factors contributing to the decision
 */
function getContributingFactorsList(symptoms, assessment) {
  const factors = [];

  if (symptoms.length >= 2) {
    factors.push(`Multiple symptoms reported (${symptoms.length} total)`);
  }

  const severeCount = symptoms.filter(s => s.severity === 'severe').length;
  if (severeCount > 0) {
    factors.push(`${severeCount} severe symptom(s) reported`);
  }

  return factors;
}

/**
 * Get warning signs that indicate escalation needed
 */
function getWarningSignsList(symptoms) {
  const warningSymptomIds = symptoms
    .map(sym => SYMPTOMS.find(s => s.id === sym.id))
    .filter(s => s && s.isRedFlag)
    .map(s => s.label);

  return {
    alreadyPresent: warningSymptomIds,
    escalationSigns: [
      'Worsening breathing difficulty',
      'Persistent chest pain or pressure',
      'Loss of consciousness or severe confusion',
      'Inability to stop bleeding',
      'Severe pain not relieved by rest',
      'Fever above 103°F (39.4°C)',
      'New or worsening symptoms'
    ]
  };
}

/**
 * Get explanation for why a specific triage level was recommended
 */
export function getTriageExplanation(assessment, triageResult) {
  const explanations = [];

  if (assessment.symptoms.length > 0) {
    explanations.push(`You reported ${assessment.symptoms.length} symptom(s).`);
  }

  const severeCount = assessment.symptoms.filter(s => s.severity === 'severe').length;
  if (severeCount > 0) {
    explanations.push(`${severeCount} of these is/are severe.`);
  }

  if (triageResult.riskMultiplier > 1) {
    explanations.push(
      `Your risk factors (age, existing conditions, recent events) increase the urgency.`
    );
  }

  return explanations.join(' ');
}

export default {
  calculateTriage,
  SYMPTOMS,
  DURATION_OPTIONS,
  TRIAGE_LEVELS,
  AGE_GROUPS,
  CHRONIC_CONDITIONS,
  RECENT_EVENTS,
  VITAL_RANGES,
  SYMPTOM_CATEGORIES
};
