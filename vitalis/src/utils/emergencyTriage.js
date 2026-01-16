/**
 * Emergency Triage Engine - Rule-Based Decision System
 * Fast, trauma-informed, no diagnosis
 */

export const emergencyTriage = {
  // Life-threatening scenarios (RED - immediate action)
  critical: {
    unconscious: {
      questions: [
        { id: 'breathing', text: 'Is the person breathing?', type: 'yesno' }
      ],
      responses: {
        breathing_no: {
          urgency: 'CRITICAL',
          actions: [
            'Call emergency services immediately (911)',
            'Start CPR if trained',
            'Use our CPR-Coach for guidance'
          ],
          message: 'This is a medical emergency. Stay calm and act quickly.'
        },
        breathing_yes: {
          urgency: 'HIGH',
          actions: [
            'Call emergency services (911)',
            'Place person on their side (recovery position)',
            'Stay with them and monitor breathing'
          ],
          message: 'Medical help is needed urgently.'
        }
      }
    },
    
    chestPain: {
      questions: [
        { id: 'severity', text: 'Is the chest pain severe or crushing?', type: 'yesno' },
        { id: 'breathing', text: 'Is there difficulty breathing?', type: 'yesno' },
        { id: 'spreading', text: 'Does the pain spread to arm, jaw, or back?', type: 'yesno' }
      ],
      responses: {
        severity_yes: {
          urgency: 'CRITICAL',
          actions: [
            'Call 911 immediately',
            'Have person sit down and rest',
            'Loosen tight clothing',
            'If prescribed, help take nitroglycerin',
            'Be prepared to do CPR if needed'
          ],
          message: 'This could be a heart emergency. Act quickly but stay calm.'
        },
        breathing_yes: {
          urgency: 'HIGH',
          actions: [
            'Call emergency services now',
            'Help person sit upright',
            'Loosen clothing',
            'Stay with them'
          ],
          message: 'Medical evaluation is needed urgently.'
        },
        default: {
          urgency: 'MEDIUM',
          actions: [
            'Seek medical evaluation today',
            'Rest and avoid exertion',
            'Monitor for worsening symptoms'
          ],
          message: 'Chest discomfort should be evaluated by a doctor.'
        }
      }
    },

    severeBleed: {
      questions: [
        { id: 'spurting', text: 'Is blood spurting or flowing heavily?', type: 'yesno' },
        { id: 'consciousness', text: 'Is the person alert and conscious?', type: 'yesno' }
      ],
      responses: {
        spurting_yes: {
          urgency: 'CRITICAL',
          actions: [
            'Call 911 immediately',
            'Apply direct pressure with clean cloth',
            'Do NOT remove cloth if blood soaks through - add more on top',
            'If limb: elevate above heart level',
            'Stay with person and keep them warm'
          ],
          message: 'This is a medical emergency. Quick action can save a life.'
        },
        consciousness_no: {
          urgency: 'CRITICAL',
          actions: [
            'Call 911 now',
            'Apply pressure to wound',
            'Check breathing',
            'Do NOT give anything to eat or drink'
          ],
          message: 'Emergency medical help is needed immediately.'
        },
        default: {
          urgency: 'HIGH',
          actions: [
            'Apply firm pressure for 10-15 minutes',
            'If bleeding doesn\'t stop, seek medical care',
            'Keep area clean',
            'Watch for signs of infection'
          ],
          message: 'Continue pressure and monitor closely.'
        }
      }
    },

    breathingDifficulty: {
      questions: [
        { id: 'speaking', text: 'Can the person speak in full sentences?', type: 'yesno' },
        { id: 'bluish', text: 'Are lips or face turning bluish?', type: 'yesno' },
        { id: 'choking', text: 'Are they choking on something?', type: 'yesno' }
      ],
      responses: {
        bluish_yes: {
          urgency: 'CRITICAL',
          actions: [
            'Call 911 immediately',
            'Help person sit upright',
            'Loosen tight clothing',
            'If choking: perform Heimlich maneuver',
            'Be ready to do CPR'
          ],
          message: 'This is a life-threatening emergency.'
        },
        choking_yes: {
          urgency: 'CRITICAL',
          actions: [
            'Call 911',
            'Perform Heimlich maneuver (abdominal thrusts)',
            'If person becomes unconscious, start CPR',
            'Do NOT give liquids'
          ],
          message: 'Act immediately - choking is a medical emergency.'
        },
        speaking_no: {
          urgency: 'HIGH',
          actions: [
            'Call emergency services',
            'Help person sit upright or lean forward',
            'Stay calm and keep person calm',
            'If known asthma: help use inhaler'
          ],
          message: 'Medical attention is needed now.'
        },
        default: {
          urgency: 'MEDIUM',
          actions: [
            'Help person rest in comfortable position',
            'Open window for fresh air',
            'If symptoms worsen, call for help',
            'Consider medical evaluation'
          ],
          message: 'Monitor breathing closely.'
        }
      }
    },

    stroke: {
      questions: [
        { id: 'face', text: 'Is one side of the face drooping?', type: 'yesno' },
        { id: 'arm', text: 'Can they raise both arms evenly?', type: 'yesno' },
        { id: 'speech', text: 'Is speech slurred or confused?', type: 'yesno' }
      ],
      responses: {
        any_yes: {
          urgency: 'CRITICAL',
          actions: [
            'Call 911 IMMEDIATELY - time is critical',
            'Note the time symptoms started',
            'Have person lie down with head slightly elevated',
            'Do NOT give food, drink, or medication',
            'Stay with person'
          ],
          message: 'This could be a stroke. Every second counts - get emergency help now.'
        }
      }
    },

    seizure: {
      questions: [
        { id: 'active', text: 'Is the person currently having a seizure?', type: 'yesno' },
        { id: 'first', text: 'Is this their first seizure ever?', type: 'yesno' }
      ],
      responses: {
        active_yes: {
          urgency: 'HIGH',
          actions: [
            'Clear area of hard/sharp objects',
            'Cushion head with something soft',
            'Turn person on their side',
            'Time the seizure',
            'Do NOT hold person down or put anything in mouth',
            'Call 911 if seizure lasts over 5 minutes'
          ],
          message: 'Stay calm. Most seizures stop on their own.'
        },
        first_yes: {
          urgency: 'HIGH',
          actions: [
            'Call emergency services',
            'Stay with person',
            'Time how long it lasted',
            'Check for medical alert bracelet'
          ],
          message: 'First-time seizures require immediate medical evaluation.'
        }
      }
    },

    allergicReaction: {
      questions: [
        { id: 'breathing', text: 'Is there difficulty breathing or swallowing?', type: 'yesno' },
        { id: 'swelling', text: 'Is there swelling of face, lips, or tongue?', type: 'yesno' },
        { id: 'epipen', text: 'Do they have an EpiPen?', type: 'yesno' }
      ],
      responses: {
        breathing_yes: {
          urgency: 'CRITICAL',
          actions: [
            'Call 911 immediately',
            'Use EpiPen if available',
            'Help person lie down (unless vomiting)',
            'If they stop breathing, start CPR'
          ],
          message: 'This is anaphylaxis - a life-threatening emergency.'
        },
        swelling_yes: {
          urgency: 'CRITICAL',
          actions: [
            'Call emergency services now',
            'Use EpiPen if available',
            'Monitor breathing closely',
            'Keep person calm'
          ],
          message: 'Severe allergic reaction requires immediate help.'
        },
        epipen_yes: {
          urgency: 'HIGH',
          actions: [
            'Use EpiPen now',
            'Call 911 after using EpiPen',
            'Second dose may be needed after 5-15 minutes',
            'Stay with person'
          ],
          message: 'Use the EpiPen and get emergency help.'
        }
      }
    },

    headInjury: {
      questions: [
        { id: 'unconscious', text: 'Was the person unconscious at any point?', type: 'yesno' },
        { id: 'vomiting', text: 'Are they vomiting or very drowsy?', type: 'yesno' },
        { id: 'confusion', text: 'Are they confused or having trouble speaking?', type: 'yesno' }
      ],
      responses: {
        unconscious_yes: {
          urgency: 'CRITICAL',
          actions: [
            'Call 911 immediately',
            'Do NOT move person unless necessary',
            'Keep neck and head still',
            'Monitor breathing',
            'Watch for vomiting'
          ],
          message: 'Head injuries with unconsciousness need emergency care.'
        },
        vomiting_yes: {
          urgency: 'HIGH',
          actions: [
            'Call emergency services',
            'Keep person still',
            'Turn head to side if vomiting',
            'Do NOT give food or drink'
          ],
          message: 'These symptoms require immediate medical evaluation.'
        },
        confusion_yes: {
          urgency: 'HIGH',
          actions: [
            'Seek emergency medical care',
            'Keep person awake and still',
            'Apply ice pack to swelling',
            'Monitor closely'
          ],
          message: 'Confusion after head injury needs medical attention.'
        }
      }
    }
  },

  // Non-critical but urgent (YELLOW)
  urgent: {
    burn: {
      questions: [
        { id: 'size', text: 'Is the burn larger than your palm?', type: 'yesno' },
        { id: 'location', text: 'Is it on face, hands, feet, or genitals?', type: 'yesno' },
        { id: 'charred', text: 'Does the skin look white, charred, or numb?', type: 'yesno' }
      ],
      responses: {
        charred_yes: {
          urgency: 'HIGH',
          actions: [
            'Call emergency services',
            'Do NOT apply ice or ointments',
            'Cover loosely with clean cloth',
            'Do NOT break blisters',
            'Keep person warm'
          ],
          message: 'Severe burns require emergency medical care.'
        },
        size_yes: {
          urgency: 'MEDIUM',
          actions: [
            'Seek medical evaluation today',
            'Cool with running water for 10-20 minutes',
            'Cover with clean, dry cloth',
            'Do NOT use ice or butter'
          ],
          message: 'Large burns should be evaluated by medical professionals.'
        }
      }
    }
  },

  // General guidance
  general: {
    panic: {
      message: 'I hear you. Let\'s slow down together.',
      actions: [
        'Take slow, deep breaths',
        'You\'re safe right now',
        'Focus on one thing at a time',
        'It\'s okay to feel scared'
      ],
      questions: [
        'Can you describe what\'s happening right now?',
        'Are you or someone else hurt?',
        'Do you feel physically safe where you are?'
      ]
    }
  }
};

/**
 * Match user input to emergency scenario
 */
export function identifyScenario(userInput) {
  const input = userInput.toLowerCase();
  
  // Critical keywords
  if (input.includes('not breathing') || input.includes('stopped breathing')) {
    return { category: 'critical', type: 'unconscious' };
  }
  
  if (input.includes('unconscious') || input.includes('unresponsive') || input.includes('won\'t wake')) {
    return { category: 'critical', type: 'unconscious' };
  }
  
  if (input.includes('chest pain') || input.includes('heart')) {
    return { category: 'critical', type: 'chestPain' };
  }
  
  if (input.includes('bleeding') || input.includes('blood')) {
    return { category: 'critical', type: 'severeBleed' };
  }
  
  if (input.includes('can\'t breathe') || input.includes('breathing') || input.includes('choking')) {
    return { category: 'critical', type: 'breathingDifficulty' };
  }
  
  if (input.includes('stroke') || input.includes('face droop') || input.includes('can\'t move arm')) {
    return { category: 'critical', type: 'stroke' };
  }
  
  if (input.includes('seizure') || input.includes('convulsion') || input.includes('shaking')) {
    return { category: 'critical', type: 'seizure' };
  }
  
  if (input.includes('allergic') || input.includes('swelling') || input.includes('hives')) {
    return { category: 'critical', type: 'allergicReaction' };
  }
  
  if (input.includes('head') && (input.includes('hit') || input.includes('fell') || input.includes('injury'))) {
    return { category: 'critical', type: 'headInjury' };
  }
  
  if (input.includes('burn') || input.includes('burned') || input.includes('scalded')) {
    return { category: 'urgent', type: 'burn' };
  }
  
  if (input.includes('help') || input.includes('panic') || input.includes('scared') || input.includes('emergency')) {
    return { category: 'general', type: 'panic' };
  }
  
  return null;
}

/**
 * Get initial response for scenario
 */
export function getInitialResponse(scenario) {
  if (!scenario) {
    return {
      message: 'I\'m here to help. Can you tell me what\'s happening?',
      questions: [
        { id: 'situation', text: 'Is someone hurt or in distress?', type: 'yesno' }
      ]
    };
  }
  
  const triageData = emergencyTriage[scenario.category]?.[scenario.type];
  
  if (!triageData) {
    return {
      message: 'I understand. Let\'s figure this out together.',
      questions: [
        { id: 'severity', text: 'Is this a life-threatening emergency?', type: 'yesno' }
      ]
    };
  }
  
  return {
    message: 'I hear you. Let\'s take this step by step.',
    questions: triageData.questions || [],
    scenario: scenario
  };
}

/**
 * Process answers and get guidance
 */
export function processAnswers(scenario, answers) {
  const triageData = emergencyTriage[scenario.category]?.[scenario.type];
  
  if (!triageData || !triageData.responses) {
    return {
      urgency: 'MEDIUM',
      message: 'Based on what you\'ve told me, it\'s best to seek medical evaluation.',
      actions: ['Contact a healthcare provider', 'Monitor symptoms', 'Call 911 if condition worsens']
    };
  }
  
  // Find matching response based on answers
  for (const [key, response] of Object.entries(triageData.responses)) {
    if (key === 'default') continue;
    
    const [questionId, expectedAnswer] = key.split('_');
    if (answers[questionId] === expectedAnswer) {
      return response;
    }
    
    // Special case for stroke - any yes is critical
    if (key === 'any_yes' && Object.values(answers).includes('yes')) {
      return response;
    }
  }
  
  // Return default response if available
  return triageData.responses.default || {
    urgency: 'MEDIUM',
    message: 'Please seek medical evaluation to be safe.',
    actions: ['Contact a healthcare provider', 'Monitor symptoms closely']
  };
}
