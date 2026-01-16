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
  CARDIOVASCULAR: "cardiovascular",
  RESPIRATORY: "respiratory",
  NEUROLOGICAL: "neurological",
  GASTROINTESTINAL: "gastrointestinal",
  INFECTIOUS: "infectious",
  INTEGUMENTARY: "integumentary",
  SENSORY: "sensory",
  TRAUMA: "trauma",
};

export const SYMPTOMS = [
  // Cardiovascular
  {
    id: "chest_pain",
    label: "Chest Pain / Pressure",
    category: SYMPTOM_CATEGORIES.CARDIOVASCULAR,
    severityWeight: { mild: 8, moderate: 9, severe: 10 },
    isRedFlag: true,
    explanation:
      "Chest pain can indicate cardiac issues requiring urgent evaluation.",
  },
  {
    id: "palpitations",
    label: "Heart Palpitations / Irregular Heartbeat",
    category: SYMPTOM_CATEGORIES.CARDIOVASCULAR,
    severityWeight: { mild: 4, moderate: 6, severe: 9 },
    isRedFlag: false,
    explanation: "Irregular heartbeat may require cardiac assessment.",
  },

  // Respiratory
  {
    id: "difficulty_breathing",
    label: "Difficulty Breathing / Shortness of Breath",
    category: SYMPTOM_CATEGORIES.RESPIRATORY,
    severityWeight: { mild: 6, moderate: 8, severe: 10 },
    isRedFlag: true,
    explanation: "Breathing difficulties can indicate respiratory emergencies.",
  },
  {
    id: "persistent_cough",
    label: "Persistent Cough",
    category: SYMPTOM_CATEGORIES.RESPIRATORY,
    severityWeight: { mild: 1, moderate: 3, severe: 5 },
    isRedFlag: false,
    explanation: "Cough may indicate infection or respiratory condition.",
  },
  {
    id: "wheezing",
    label: "Wheezing / Stridor",
    category: SYMPTOM_CATEGORIES.RESPIRATORY,
    severityWeight: { mild: 5, moderate: 7, severe: 9 },
    isRedFlag: true,
    explanation: "Wheezing suggests airway obstruction or asthma.",
  },

  // Neurological
  {
    id: "loss_of_consciousness",
    label: "Loss of Consciousness / Fainting",
    category: SYMPTOM_CATEGORIES.NEUROLOGICAL,
    severityWeight: { mild: 9, moderate: 10, severe: 10 },
    isRedFlag: true,
    explanation:
      "Loss of consciousness requires immediate emergency evaluation.",
  },
  {
    id: "severe_headache",
    label: "Severe Headache / Worst Headache of Life",
    category: SYMPTOM_CATEGORIES.NEUROLOGICAL,
    severityWeight: { mild: 5, moderate: 8, severe: 10 },
    isRedFlag: true,
    explanation:
      "Severe headache can indicate serious neurological conditions.",
  },
  {
    id: "confusion",
    label: "Confusion / Disorientation",
    category: SYMPTOM_CATEGORIES.NEUROLOGICAL,
    severityWeight: { mild: 6, moderate: 8, severe: 10 },
    isRedFlag: true,
    explanation: "Confusion requires urgent evaluation.",
  },
  {
    id: "dizziness",
    label: "Dizziness / Vertigo",
    category: SYMPTOM_CATEGORIES.NEUROLOGICAL,
    severityWeight: { mild: 2, moderate: 4, severe: 7 },
    isRedFlag: false,
    explanation: "Dizziness can have multiple causes and may need evaluation.",
  },
  {
    id: "severe_weakness",
    label: "Severe Weakness / Paralysis",
    category: SYMPTOM_CATEGORIES.NEUROLOGICAL,
    severityWeight: { mild: 6, moderate: 9, severe: 10 },
    isRedFlag: true,
    explanation: "Sudden weakness or paralysis requires urgent evaluation.",
  },

  // Gastrointestinal
  {
    id: "severe_abdominal_pain",
    label: "Severe Abdominal Pain",
    category: SYMPTOM_CATEGORIES.GASTROINTESTINAL,
    severityWeight: { mild: 3, moderate: 6, severe: 9 },
    isRedFlag: true,
    explanation: "Severe abdominal pain may indicate acute conditions.",
  },
  {
    id: "persistent_vomiting",
    label: "Persistent Vomiting / Unable to Keep Fluids Down",
    category: SYMPTOM_CATEGORIES.GASTROINTESTINAL,
    severityWeight: { mild: 2, moderate: 5, severe: 8 },
    isRedFlag: true,
    explanation:
      "Persistent vomiting risks dehydration and requires evaluation.",
  },
  {
    id: "bloody_stool",
    label: "Bloody Stool / Blood in Vomit",
    category: SYMPTOM_CATEGORIES.GASTROINTESTINAL,
    severityWeight: { mild: 7, moderate: 9, severe: 10 },
    isRedFlag: true,
    explanation: "Bleeding in GI tract requires urgent medical attention.",
  },

  // Infectious
  {
    id: "high_fever",
    label: "High Fever (>102°F / 39°C)",
    category: SYMPTOM_CATEGORIES.INFECTIOUS,
    severityWeight: { mild: 4, moderate: 6, severe: 8 },
    isRedFlag: false,
    explanation: "High fever may indicate infection and needs monitoring.",
  },
  {
    id: "fever_with_stiff_neck",
    label: "Fever + Stiff Neck / Sensitivity to Light",
    category: SYMPTOM_CATEGORIES.INFECTIOUS,
    severityWeight: { mild: 9, moderate: 10, severe: 10 },
    isRedFlag: true,
    explanation:
      "Fever with stiff neck suggests meningitis - emergency condition.",
  },
  {
    id: "chills_sweating",
    label: "Chills & Night Sweats",
    category: SYMPTOM_CATEGORIES.INFECTIOUS,
    severityWeight: { mild: 2, moderate: 3, severe: 5 },
    isRedFlag: false,
    explanation: "May indicate infection or other conditions.",
  },

  // Integumentary
  {
    id: "skin_rash",
    label: "Skin Rash (Unexplained / Spreading)",
    category: SYMPTOM_CATEGORIES.INTEGUMENTARY,
    severityWeight: { mild: 2, moderate: 4, severe: 7 },
    isRedFlag: false,
    explanation:
      "Unexplained rash may indicate allergic reaction or infection.",
  },
  {
    id: "significant_bleeding",
    label: "Significant Bleeding / Cannot Stop",
    category: SYMPTOM_CATEGORIES.INTEGUMENTARY,
    severityWeight: { mild: 8, moderate: 9, severe: 10 },
    isRedFlag: true,
    explanation: "Uncontrolled bleeding requires emergency care.",
  },
  {
    id: "wound_signs_infection",
    label: "Wound Signs of Infection (Red / Swollen / Pus)",
    category: SYMPTOM_CATEGORIES.INTEGUMENTARY,
    severityWeight: { mild: 3, moderate: 5, severe: 7 },
    isRedFlag: false,
    explanation: "Signs of wound infection need prompt medical attention.",
  },

  // Sensory
  {
    id: "vision_loss",
    label: "Vision Loss / Blurred Vision",
    category: SYMPTOM_CATEGORIES.SENSORY,
    severityWeight: { mild: 4, moderate: 6, severe: 9 },
    isRedFlag: false,
    explanation: "Vision changes may indicate retinal or neurological issues.",
  },
  {
    id: "eye_pain_redness",
    label: "Eye Pain / Severe Redness",
    category: SYMPTOM_CATEGORIES.SENSORY,
    severityWeight: { mild: 3, moderate: 5, severe: 8 },
    isRedFlag: false,
    explanation: "Eye pain may indicate infection or glaucoma.",
  },

  // Trauma
  {
    id: "head_injury_symptoms",
    label: "Head Injury (Loss of Consciousness / Confusion)",
    category: SYMPTOM_CATEGORIES.TRAUMA,
    severityWeight: { mild: 7, moderate: 9, severe: 10 },
    isRedFlag: true,
    explanation:
      "Head injury with altered consciousness requires urgent evaluation.",
  },
  {
    id: "severe_pain_after_trauma",
    label: "Severe Pain After Injury / Fall",
    category: SYMPTOM_CATEGORIES.TRAUMA,
    severityWeight: { mild: 4, moderate: 6, severe: 8 },
    isRedFlag: false,
    explanation:
      "Severe trauma-related pain may indicate fractures or internal injury.",
  },
];

// ============================================================================
// SYMPTOM DURATION MULTIPLIERS
// ============================================================================

export const DURATION_OPTIONS = [
  { value: "hours_less_24", label: "Less than 24 hours", multiplier: 0.8 },
  { value: "days_1_7", label: "1-7 days", multiplier: 1.0 },
  { value: "days_8_14", label: "8-14 days", multiplier: 1.3 },
  { value: "weeks_3_4", label: "3-4 weeks", multiplier: 1.6 },
  { value: "weeks_more_4", label: "More than 4 weeks", multiplier: 2.0 },
];

// ============================================================================
// TRIAGE SEVERITY LEVELS
// ============================================================================

export const TRIAGE_LEVELS = {
  RED: {
    level: "RED",
    title: "🚨 Seek Emergency Care Immediately",
    color: "#dc2626",
    bgColor: "#fee2e2",
    textColor: "#991b1b",
    recommendation: "You should seek medical help immediately",
    urgency: "URGENT",
    timeframe: "Call 911 or go to emergency room now",
    actions: [
      "Call 911 (or emergency services) immediately",
      "Do not drive yourself if possible - call an ambulance",
      "Keep a list of your current medications ready",
      "Tell them your main symptoms and severity",
    ],
  },
  YELLOW: {
    level: "YELLOW",
    title: "⚠️ Consult a Doctor Soon",
    color: "#d97706",
    bgColor: "#fef3c7",
    textColor: "#92400e",
    recommendation: "Consult a doctor within 24-48 hours",
    urgency: "IMPORTANT",
    timeframe: "Schedule an appointment within 24-48 hours",
    actions: [
      "Contact your primary care doctor or clinic",
      "Request an appointment within 24-48 hours",
      "Monitor your symptoms carefully",
      "Note any changes to report to your doctor",
      "Stay hydrated and rest as needed",
    ],
  },
  GREEN: {
    level: "GREEN",
    title: "✅ Monitor at Home",
    color: "#10b981",
    bgColor: "#d1fae5",
    textColor: "#065f46",
    recommendation: "You can monitor at home for now",
    urgency: "LOW",
    timeframe: "Self-care at home with monitoring",
    actions: [
      "Get adequate rest",
      "Stay hydrated (drink water regularly)",
      "Use over-the-counter pain relief if needed",
      "Monitor symptoms over the next 3-7 days",
      "Contact a doctor if symptoms worsen or persist",
    ],
  },
};

// ============================================================================
// RISK FACTORS
// ============================================================================

// ============================================================================
// SYMPTOM RISK CLASSIFICATION
// ============================================================================

export const SYMPTOM_RISK_LEVELS = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

/**
 * Classify symptoms by inherent risk level
 * This determines baseline escalation potential
 */
export const SYMPTOM_RISK_CLASSIFICATION = {
  // HIGH RISK: Can lead to emergency with severity + duration
  high: [
    "chest_pain",
    "difficulty_breathing",
    "loss_of_consciousness",
    "severe_headache",
    "confusion",
    "severe_weakness",
    "severe_abdominal_pain",
    "persistent_vomiting",
    "bloody_stool",
    "fever_with_stiff_neck",
    "significant_bleeding",
    "head_injury_symptoms",
    "wheezing",
  ],
  // MEDIUM RISK: Typically doctor consultation
  medium: [
    "palpitations",
    "high_fever",
    "vision_loss",
    "skin_rash",
    "wound_signs_infection",
    "eye_pain_redness",
    "severe_pain_after_trauma",
    "dizziness",
  ],
  // LOW RISK: Home care primary
  low: ["persistent_cough", "chills_sweating"],
};

// ============================================================================
// AGE GROUPS - UPDATED LOGIC
// ============================================================================

export const AGE_GROUPS = [
  {
    value: "under_5",
    label: "Under 5 years",
    riskModifier: "high",
    baselineMultiplier: 1.4,
  },
  {
    value: "ages_5_17",
    label: "5-17 years",
    riskModifier: "low",
    baselineMultiplier: 1.0,
  },
  {
    value: "ages_18_35",
    label: "18-35 years",
    riskModifier: "low",
    baselineMultiplier: 1.0,
  },
  {
    value: "ages_35_50",
    label: "35-50 years",
    riskModifier: "moderate",
    baselineMultiplier: 1.1,
  },
  {
    value: "ages_50_65",
    label: "50-65 years",
    riskModifier: "moderate",
    baselineMultiplier: 1.15,
  },
  {
    value: "ages_65_plus",
    label: "65+ years",
    riskModifier: "high",
    baselineMultiplier: 1.4,
  },
];

export const CHRONIC_CONDITIONS = [
  { id: "asthma", label: "Asthma", riskMultiplier: 1.3 },
  { id: "diabetes", label: "Diabetes", riskMultiplier: 1.2 },
  {
    id: "heart_disease",
    label: "Heart Disease / Hypertension",
    riskMultiplier: 1.4,
  },
  {
    id: "lung_disease",
    label: "Chronic Lung Disease (COPD)",
    riskMultiplier: 1.4,
  },
  { id: "kidney_disease", label: "Kidney Disease", riskMultiplier: 1.3 },
  {
    id: "immunocompromised",
    label: "Immunocompromised / Cancer Treatment",
    riskMultiplier: 1.5,
  },
];

export const RECENT_EVENTS = [
  {
    id: "surgery_recent",
    label: "Recent Surgery (within 4 weeks)",
    riskMultiplier: 1.4,
  },
  {
    id: "hospitalization",
    label: "Recent Hospitalization",
    riskMultiplier: 1.3,
  },
  { id: "severe_fall", label: "Severe Fall or Accident", riskMultiplier: 1.5 },
  {
    id: "infection_exposure",
    label: "Exposure to Infection",
    riskMultiplier: 1.2,
  },
  {
    id: "severe_allergic_reaction",
    label: "History of Severe Allergies",
    riskMultiplier: 1.3,
  },
];

// ============================================================================
// CRITICAL VITAL RANGES
// ============================================================================

export const VITAL_RANGES = {
  heart_rate: {
    normal: { min: 60, max: 100 },
    concerning: { min: 40, max: 120 },
    critical_low: 40,
    critical_high: 120,
  },
  temperature: {
    normal: { min: 97, max: 99 },
    concerning: { min: 95, max: 103.1 },
    critical_low: 95,
    critical_high: 103.1,
  },
  oxygen_saturation: {
    normal: { min: 95, max: 100 },
    concerning: { min: 90, max: 95 },
    critical_low: 90,
  },
};

// ============================================================================
// MAIN TRIAGE ENGINE FUNCTION
// ============================================================================

/**
 * Calculate triage level based on all inputs - REFINED LOGIC
 *
 * NEW RULES:
 * - Age acts as risk modifier only, never direct emergency trigger
 * - Low-risk symptoms → home care
 * - Medium-risk symptoms → doctor consultation
 * - High-risk symptoms → requires severity + duration to escalate
 * - Duration significantly influences escalation
 * - Emergency output ONLY when: high-risk + severe + score crosses threshold
 *
 * @param {Object} assessment - Assessment data
 * @returns {Object} Triage result with personalized explanation and recommendations
 */
export function calculateTriage(assessment) {
  const {
    symptoms = [],
    vitals = {},
    ageGroup = null,
    chronicConditions = [],
    recentEvents = [],
    pregnancyStatus = false,
  } = assessment;

  const result = {
    contributingFactors: [],
    symptomInfluencers: [],
    escalationTriggers: [],
    riskFactorsApplied: [],
  };

  // ========== STAGE 1: CRITICAL VITAL CHECK (Can force RED but not from symptoms) ==========
  const vitalWarnings = checkCriticalVitals(vitals);
  if (vitalWarnings.hasCriticalVital) {
    return {
      ...TRIAGE_LEVELS.RED,
      score: 9,
      contributingFactors: vitalWarnings.warnings,
      symptomInfluencers: [],
      riskFactorsApplied: [],
      escalationTriggers: ["Critical vital sign(s) detected"],
      warningSignsToWatch: getWarningSignsList(symptoms),
      explanation: `Your vital signs require immediate medical attention. ${vitalWarnings.warnings.join(
        ", "
      )}.`,
      changePrompt:
        "If vital signs stabilize or normalize, reassess in 1 hour.",
      nextSteps: "CALL 911 IMMEDIATELY",
      shouldMonitor: false,
      assessmentTimestamp: new Date().toISOString(),
    };
  }

  // ========== STAGE 2: CLASSIFY SYMPTOMS BY RISK & SEVERITY ==========
  const highRiskSymptoms = [];
  const mediumRiskSymptoms = [];
  const lowRiskSymptoms = [];

  symptoms.forEach((sym) => {
    const riskLevel = getSymptomRiskLevel(sym.id);
    const symptomData = SYMPTOMS.find((s) => s.id === sym.id);

    if (riskLevel === "high") {
      highRiskSymptoms.push({ ...sym, label: symptomData?.label });
    } else if (riskLevel === "medium") {
      mediumRiskSymptoms.push({ ...sym, label: symptomData?.label });
    } else {
      lowRiskSymptoms.push({ ...sym, label: symptomData?.label });
    }
  });

  // ========== STAGE 3: EMERGENCY CHECK (Strict Rules) ==========
  // Emergency output ONLY if:
  // 1. High-risk symptom present
  // 2. Severity is 'severe'
  // 3. Duration suggests persistence (not brand new)
  const hasHighRiskSevere = highRiskSymptoms.some(
    (s) => s.severity === "severe" && s.duration !== "hours_less_24"
  );

  if (hasHighRiskSevere) {
    // Only escalate to RED if risk score crosses VERY HIGH threshold
    const riskMultiplier = calculateRiskMultiplier(
      ageGroup,
      chronicConditions,
      pregnancyStatus,
      recentEvents
    );
    const severityScore =
      highRiskSymptoms
        .filter((s) => s.severity === "severe")
        .reduce((sum, s) => {
          const data = SYMPTOMS.find((d) => d.id === s.id);
          return sum + (data?.severityWeight.severe || 10);
        }, 0) / highRiskSymptoms.length;

    // Calculate duration penalty (longer = more serious)
    const durationMultiplier =
      DURATION_OPTIONS.find((d) => d.value === highRiskSymptoms[0].duration)
        ?.multiplier || 1.0;

    const emergencyScore = severityScore * durationMultiplier * riskMultiplier;

    if (emergencyScore >= 8.5) {
      result.escalationTriggers.push(
        `High-risk symptom (${highRiskSymptoms[0].label}) with severe severity and persistent duration`
      );

      return {
        ...TRIAGE_LEVELS.RED,
        score: emergencyScore.toFixed(1),
        contributingFactors: highRiskSymptoms.map((s) => ({
          symptom: s.label,
          severity: s.severity,
          riskLevel: "high",
        })),
        symptomInfluencers: [highRiskSymptoms[0].label],
        riskFactorsApplied: getRiskFactorsList(
          ageGroup,
          chronicConditions,
          pregnancyStatus,
          recentEvents
        ),
        escalationTriggers: result.escalationTriggers,
        warningSignsToWatch: getWarningSignsList(symptoms),
        explanation: generateTriageExplanation(
          "RED",
          highRiskSymptoms,
          ageGroup,
          chronicConditions
        ),
        changePrompt: `Immediate medical attention needed. Seek help sooner if: ${highRiskSymptoms[0].label} worsens or additional severe symptoms appear.`,
        nextSteps: "CALL 911 or go to nearest emergency room immediately",
        shouldMonitor: false,
        assessmentTimestamp: new Date().toISOString(),
        riskMultiplier: riskMultiplier.toFixed(2),
      };
    }
  }

  // ========== STAGE 4: MEDIUM/HIGH RISK → DOCTOR CONSULTATION (YELLOW) ==========
  if (highRiskSymptoms.length > 0 && !hasHighRiskSevere) {
    // High-risk but not severe enough for RED → YELLOW
    const riskMultiplier = calculateRiskMultiplier(
      ageGroup,
      chronicConditions,
      pregnancyStatus,
      recentEvents
    );

    return {
      ...TRIAGE_LEVELS.YELLOW,
      score: (7.0 * riskMultiplier).toFixed(1),
      contributingFactors: highRiskSymptoms.map((s) => ({
        symptom: s.label,
        severity: s.severity,
        riskLevel: "high",
      })),
      symptomInfluencers: [highRiskSymptoms[0].label],
      riskFactorsApplied: getRiskFactorsList(
        ageGroup,
        chronicConditions,
        pregnancyStatus,
        recentEvents
      ),
      escalationTriggers: [
        `Potentially serious symptom: ${highRiskSymptoms[0].label}`,
      ],
      warningSignsToWatch: getWarningSignsList(symptoms),
      explanation: generateTriageExplanation(
        "YELLOW",
        highRiskSymptoms,
        ageGroup,
        chronicConditions
      ),
      changePrompt: `Seek immediate medical help if: symptom becomes severe, new symptoms appear, or condition worsens.`,
      nextSteps: "Contact doctor within 24 hours or seek urgent care",
      shouldMonitor: true,
      assessmentTimestamp: new Date().toISOString(),
      riskMultiplier: riskMultiplier.toFixed(2),
    };
  }

  // ========== STAGE 5: MEDIUM RISK → DOCTOR CONSULTATION (YELLOW) ==========
  if (mediumRiskSymptoms.length > 0) {
    const riskMultiplier = calculateRiskMultiplier(
      ageGroup,
      chronicConditions,
      pregnancyStatus,
      recentEvents
    );

    // Medium symptoms with persistent duration escalate to YELLOW
    const hasPersistentMedium = mediumRiskSymptoms.some(
      (s) =>
        s.severity === "moderate" ||
        (s.severity === "mild" && s.duration !== "hours_less_24")
    );

    if (hasPersistentMedium) {
      return {
        ...TRIAGE_LEVELS.YELLOW,
        score: (5.5 * riskMultiplier).toFixed(1),
        contributingFactors: mediumRiskSymptoms.map((s) => ({
          symptom: s.label,
          severity: s.severity,
          riskLevel: "medium",
        })),
        symptomInfluencers: [mediumRiskSymptoms[0].label],
        riskFactorsApplied: getRiskFactorsList(
          ageGroup,
          chronicConditions,
          pregnancyStatus,
          recentEvents
        ),
        escalationTriggers:
          mediumRiskSymptoms.length > 1
            ? [
                `Multiple symptoms reported: ${mediumRiskSymptoms
                  .map((s) => s.label)
                  .join(", ")}`,
              ]
            : [`Symptom requires evaluation: ${mediumRiskSymptoms[0].label}`],
        warningSignsToWatch: getWarningSignsList(symptoms),
        explanation: generateTriageExplanation(
          "YELLOW",
          mediumRiskSymptoms,
          ageGroup,
          chronicConditions
        ),
        changePrompt: `Seek medical help sooner if: symptoms worsen, fever develops (if not already present), or you cannot manage at home.`,
        nextSteps: "Contact doctor within 24-48 hours",
        shouldMonitor: true,
        assessmentTimestamp: new Date().toISOString(),
        riskMultiplier: riskMultiplier.toFixed(2),
      };
    }
  }

  // ========== STAGE 6: LOW RISK → HOME CARE (GREEN) ==========
  return {
    ...TRIAGE_LEVELS.GREEN,
    score: "2.0",
    contributingFactors:
      lowRiskSymptoms.length > 0
        ? lowRiskSymptoms.map((s) => ({
            symptom: s.label,
            severity: s.severity,
            riskLevel: "low",
          }))
        : [{ detail: "Symptoms assessed as non-urgent" }],
    symptomInfluencers: lowRiskSymptoms.map((s) => s.label),
    riskFactorsApplied: getRiskFactorsList(
      ageGroup,
      chronicConditions,
      pregnancyStatus,
      recentEvents,
      false
    ),
    escalationTriggers: [],
    warningSignsToWatch: getWarningSignsList(symptoms),
    explanation: generateTriageExplanation(
      "GREEN",
      lowRiskSymptoms,
      ageGroup,
      chronicConditions
    ),
    changePrompt: `Seek medical attention if: symptoms worsen significantly, new concerning symptoms develop, or symptoms persist beyond 7 days.`,
    nextSteps: "Self-care at home with monitoring",
    shouldMonitor: true,
    assessmentTimestamp: new Date().toISOString(),
    riskMultiplier: "1.0",
  };
}

/**
 * Calculate risk multiplier based on user factors
 */
function calculateRiskMultiplier(
  ageGroup,
  chronicConditions,
  pregnancyStatus,
  recentEvents
) {
  let multiplier = 1.0;

  // Age acts as modifier only
  if (ageGroup) {
    const ageData = AGE_GROUPS.find((ag) => ag.value === ageGroup);
    if (ageData) {
      multiplier *= ageData.baselineMultiplier;
    }
  }

  // Chronic conditions
  if (chronicConditions?.length > 0) {
    chronicConditions.forEach((condId) => {
      const condData = CHRONIC_CONDITIONS.find((c) => c.id === condId);
      if (condData) {
        multiplier *= 1 + (condData.riskMultiplier - 1) * 0.25;
      }
    });
  }

  // Pregnancy
  if (pregnancyStatus) {
    multiplier *= 1.2;
  }

  // Recent events
  if (recentEvents?.length > 0) {
    recentEvents.forEach((eventId) => {
      const eventData = RECENT_EVENTS.find((e) => e.id === eventId);
      if (eventData) {
        multiplier *= 1 + (eventData.riskMultiplier - 1) * 0.15;
      }
    });
  }

  return Math.min(multiplier, 2.0); // Cap at 2x
}

/**
 * Get list of risk factors applied
 */
function getRiskFactorsList(
  ageGroup,
  chronicConditions,
  pregnancyStatus,
  recentEvents,
  showAll = true
) {
  const factors = [];

  if (ageGroup) {
    const ageData = AGE_GROUPS.find((ag) => ag.value === ageGroup);
    if (ageData?.riskModifier !== "low" && showAll) {
      factors.push(`Age group: ${ageData.label}`);
    }
  }

  if (chronicConditions?.length > 0) {
    chronicConditions.forEach((condId) => {
      const condData = CHRONIC_CONDITIONS.find((c) => c.id === condId);
      if (condData) factors.push(`Condition: ${condData.label}`);
    });
  }

  if (pregnancyStatus) {
    factors.push("Pregnancy status");
  }

  if (recentEvents?.length > 0) {
    recentEvents.forEach((eventId) => {
      const eventData = RECENT_EVENTS.find((e) => e.id === eventId);
      if (eventData) factors.push(`Recent: ${eventData.label}`);
    });
  }

  return factors;
}

/**
 * Generate personalized explanation based on triage level and symptoms
 */
function generateTriageExplanation(
  level,
  relevantSymptoms,
  ageGroup,
  chronicConditions
) {
  if (!relevantSymptoms || relevantSymptoms.length === 0) {
    return "Your symptoms have been assessed and a recommendation provided below.";
  }

  const mainSymptom = relevantSymptoms[0]?.label;
  const severity = relevantSymptoms[0]?.severity;

  if (level === "RED") {
    return `You reported ${mainSymptom} with severe intensity. This requires immediate emergency evaluation.`;
  }

  if (level === "YELLOW") {
    if (relevantSymptoms.length > 1) {
      return `You have multiple symptoms (${relevantSymptoms
        .map((s) => s.label)
        .join(", ")}). A doctor should evaluate these within 24-48 hours.`;
    }

    if (severity === "moderate") {
      return `${mainSymptom} at moderate severity warrants a doctor's evaluation to rule out underlying issues.`;
    }

    if (severity === "mild") {
      return `Although ${mainSymptom} started mildly, its persistence suggests medical evaluation would be helpful.`;
    }

    return `${mainSymptom} should be evaluated by a healthcare provider.`;
  }

  if (level === "GREEN") {
    if (relevantSymptoms.length === 0) {
      return "Your symptoms appear mild and appropriate for home care with monitoring.";
    }

    const duration = relevantSymptoms[0]?.duration;
    if (duration === "hours_less_24") {
      return `${mainSymptom} is recent and mild. Home care is appropriate for now.`;
    }

    return `${mainSymptom} is mild. You can safely monitor at home.`;
  }

  return "Your symptoms have been assessed.";
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Classify a symptom's risk level
 */
function getSymptomRiskLevel(symptomId) {
  if (SYMPTOM_RISK_CLASSIFICATION.high.includes(symptomId)) return "high";
  if (SYMPTOM_RISK_CLASSIFICATION.medium.includes(symptomId)) return "medium";
  if (SYMPTOM_RISK_CLASSIFICATION.low.includes(symptomId)) return "low";
  return "medium"; // Default to medium
}

/**
 * Check for critical vital signs
 */
function checkCriticalVitals(vitals) {
  const warnings = [];
  let hasCriticalVital = false;

  if (vitals.heartRate) {
    if (
      vitals.heartRate < VITAL_RANGES.heart_rate.critical_low ||
      vitals.heartRate > VITAL_RANGES.heart_rate.critical_high
    ) {
      warnings.push(`Critical heart rate: ${vitals.heartRate} bpm`);
      hasCriticalVital = true;
    }
  }

  if (vitals.temperature) {
    if (
      vitals.temperature < VITAL_RANGES.temperature.critical_low ||
      vitals.temperature > VITAL_RANGES.temperature.critical_high
    ) {
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
    if (
      vitals.heartRate < VITAL_RANGES.heart_rate.concerning.min ||
      vitals.heartRate > VITAL_RANGES.heart_rate.concerning.max
    ) {
      concerns.push(`Elevated heart rate: ${vitals.heartRate} bpm`);
    }
  }

  if (vitals.temperature) {
    if (
      vitals.temperature < VITAL_RANGES.temperature.concerning.min ||
      vitals.temperature > VITAL_RANGES.temperature.concerning.max
    ) {
      concerns.push(`Elevated temperature: ${vitals.temperature}°F`);
    }
  }

  if (vitals.oxygenSaturation !== undefined) {
    if (
      vitals.oxygenSaturation < VITAL_RANGES.oxygen_saturation.concerning.min
    ) {
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

  const severeCount = symptoms.filter((s) => s.severity === "severe").length;
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
    .map((sym) => SYMPTOMS.find((s) => s.id === sym.id))
    .filter((s) => s && s.isRedFlag)
    .map((s) => s.label);

  return {
    alreadyPresent: warningSymptomIds,
    escalationSigns: [
      "Worsening breathing difficulty",
      "Persistent chest pain or pressure",
      "Loss of consciousness or severe confusion",
      "Inability to stop bleeding",
      "Severe pain not relieved by rest",
      "Fever above 103°F (39.4°C)",
      "New or worsening symptoms",
    ],
  };
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
  SYMPTOM_CATEGORIES,
  SYMPTOM_RISK_CLASSIFICATION,
};
