/**
 * HEALIO - Hands-free Hospital Appointment Booking System
 * Kannada Rule-Based NLP Intent & Entity Parser
 * 
 * Features:
 * - Text normalization (Unicode NFC, punctuation stripping, whitespace)
 * - Kannada numeral to digit mapping & spoken number parsing
 * - Levenshtein distance fuzzy matching (threshold 1-2)
 * - Intent classification: book, cancel, reschedule, yes, no, back, help, emergency
 * - Entity extraction: department, date, time slot, patient numbers/codes
 * - Zero external AI API dependencies
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.KannadaNLP = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Kannada numerals map
  const KANNADA_DIGIT_MAP = {
    '೦': '0', '೧': '1', '೨': '2', '೩': '3', '೪': '4',
    '೫': '5', '೬': '6', '೭': '7', '೮': '8', '೯': '9'
  };

  const REVERSE_KANNADA_DIGIT_MAP = {
    '0': '೦', '1': '೧', '2': '೨', '3': '೩', '4': '೪',
    '5': '೫', '6': '೬', '7': '೭', '8': '೮', '9': '೯'
  };

  // Spoken Kannada number words to digits
  const SPOKEN_NUMBER_WORDS = {
    'ಶೂನ್ಯ': 0, 'ಸೊನ್ನೆ': 0,
    'ಒಂದು': 1, 'ಒಂದನೆ': 1,
    'ಎರಡು': 2, 'ಎರಡನೆ': 2,
    'ಮೂರು': 3, 'ಮೂರನೆ': 3,
    'ನಾಲ್ಕು': 4, 'ನಾಲ್ಕನೆ': 4,
    'ಐದು': 5, 'ಐದನೆ': 5,
    'ಆರು': 6, 'ಆರನೆ': 6,
    'ಏಳು': 7, 'ಏಳನೆ': 7,
    'ಎಂಟು': 8, 'ಎಂಟನೆ': 8,
    'ಒಂಬತ್ತು': 9, 'ಒಂಭತ್ತು': 9, 'ಒಂಬತ್ತನೆ': 9,
    'ಹತ್ತು': 10,
    'ಹನ್ನೊಂದು': 11, 'ಹನ್ನೆರಡು': 12, 'ಹದಿಮೂರು': 13, 'ಹದಿನಾಲ್ಕು': 14,
    'ಹದಿನೈದು': 15, 'ಹದಿನಾರು': 16, 'ಹದಿನೇಳು': 17, 'ಹದಿನೆಂಟು': 18,
    'ಹತ್ತೊಂಬತ್ತು': 19, 'ಇಪ್ಪತ್ತು': 20, 'ಮೂವತ್ತು': 30
  };

  // Emergency trigger phrases and keywords
  const EMERGENCY_KEYWORDS = [
    'ಎದೆ ನೋವು', 'ಎದೆನೋವು', 'ಹಾರ್ಟ್ ಅಟ್ಯಾಕ್', 'ಹೃದಯಾಘಾತ',
    'ಉಸಿರಾಡಲು ಕಷ್ಟ', 'ಉಸಿರು ಕಟ್ಟಿದೆ', 'ಉಸಿರಾಟದ ತೊಂದರೆ', 'ಉಸಿರು ಬರುತ್ತಿಲ್ಲ',
    'ರಕ್ತಸ್ರಾವ', 'ರಕ್ತ ಸುರಿಯುತ್ತಿದೆ', 'ರಕ್ತ ಬರುತ್ತಿದೆ',
    'ಪ್ರಜ್ಞೆ ತಪ್ಪಿದೆ', 'ಮೂರ್ಛೆ', 'ಅಪಘಾತ', 'ಗಂಭೀರ ಗಾಯ',
    'ವಿಷ ಸೇವನೆ', 'ತುರ್ತು', 'ಆಪತ್ತು', '೧೦೮', 'ಆಂಬ್ಯುಲೆನ್ಸ್'
  ];

  // Intents and their Kannada trigger patterns
  const INTENT_PATTERNS = {
    emergency: EMERGENCY_KEYWORDS,
    book: [
      'ಬುಕ್ ಮಾಡಿ', 'ಬುಕ್ ಮಾಡು', 'ಬುಕಿಂಗ್', 'ಕಾಯ್ದಿರಿಸಿ', 'ಕಾಯ್ದಿರಿಸು',
      'ಅಪಾಯಿಂಟ್ಮೆಂಟ್', 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್', 'ನೋಂದಣಿ ಮಾಡಿ', 'ವೈದ್ಯರನ್ನು ನೋಡಿ',
      'ತೋರಿಸಿ', 'ಹೊಸ ಬುಕಿಂಗ್', 'ಮುಂಗಡ ಕಾಯ್ದಿರಿಸಿ', 'ಬುಕ್'
    ],
    cancel: [
      'ರದ್ದು ಮಾಡಿ', 'ರದ್ದು ಮಾಡು', 'ರದ್ದುಗೊಳಿಸಿ', 'ರದ್ದುಪಡಿಸಿ', 'ಕ್ಯಾನ್ಸಲ್',
      'ಕ್ಯಾನ್ಸಲ್ ಮಾಡಿ', 'ತೆಗೆದುಹಾಕಿ', 'ಬೇಡವೇ ಬೇಡ', 'ಬುಕಿಂಗ್ ರದ್ದು'
    ],
    reschedule: [
      'ಬದಲಿಸಿ', 'ಬದಲಾವಣೆ', 'ಮರುಹೊಂದಿಸಿ', 'ದಿನ ಬದಲಿಸಿ', 'ಸಮಯ ಬದಲಿಸಿ',
      'ಮುಂದೂಡಿ', 'ಮುಂದಿನ ದಿನಕ್ಕೆ ಹಾಕಿ', 'ದಿನಾಂಕ ಬದಲಾಯಿಸಿ', 'ರೀಶೆಡ್ಯೂಲ್'
    ],
    yes: [
      'ಹೌದು', 'ಹೌಧು', 'ಹೌದೂ', 'ಸರಿ', 'ಖಂಡಿತ', 'ಖಂಡಿತವಾಗಿ', 'ಆಗಲಿ',
      'ಒಪ್ಪಿಗೆ', 'ಮುಂದುವರಿಯಿರಿ', 'ಮುಂದೆ', 'ದೃಢೀಕರಿಸಿ', 'ಸರಿಯಾಗಿದೆ'
    ],
    no: [
      'ಇಲ್ಲ', 'ಇಲ್ಲವೇ ಇಲ್ಲ', 'ಬೇಡ', 'ತಪ್ಪು', 'ಅಲ್ಲ', 'ತಪ್ಪಾಗಿದೆ'
    ],
    back: [
      'ಹಿಂದೆ', 'ಹಿಂದಕ್ಕೆ', 'ಹಿಂದಿನ ಪುಟ', 'ವಾಪಸ್', 'ಹಿಂದಕ್ಕೆ ಹೋಗಿ', 'ಹಿಂದಿನ'
    ],
    help: [
      'ಸಹಾಯ', 'ಮಾರ್ಗದರ್ಶನ', 'ಏನು ಮಾಡಬೇಕು', 'ತಿಳಿಸಿ', 'ಹೇಗೆ ಮಾಡುವುದು', 'ಹೆಲ್ಪ್'
    ]
  };

  // Department entity mappings
  const DEPARTMENT_ENTITIES = {
    cardiology: {
      canonicalId: 'cardiology',
      kannadaName: 'ಹೃದಯ ವಿಭಾಗ',
      doctorName: 'ಡಾ. ರಮೇಶ್ ಕುಮಾರ್',
      keywords: [
        'ಹೃದಯ ವಿಭಾಗ', 'ಹೃದಯ', 'ಹಾರ್ಟ್', 'ಕಾರ್ಡಿಯಾಲಜಿ', 'ಕಾರ್ಡಿಯಾಕ್',
        'ಎದೆ ಬಡಿತ', 'ಹೃದಯ ತಜ್ಞರು', 'ಹೃದಯ ರೋಗ'
      ]
    },
    paediatrics: {
      canonicalId: 'paediatrics',
      kannadaName: 'ಮಕ್ಕಳ ವಿಭಾಗ',
      doctorName: 'ಡಾ. ಅನಿತಾ ರಾವ್',
      keywords: [
        'ಮಕ್ಕಳ ವಿಭಾಗ', 'ಮಕ್ಕಳು', 'ಮಕ್ಕಳ', 'ಮಗು', 'ಶಿಶು', 'ಚಿಕ್ಕ ಮಕ್ಕಳು',
        'ಪೀಡಿಯಾಟ್ರಿಕ್', 'ಪೀಡಿಯಾಟ್ರಿಕ್ಸ್', 'ಬಾಲ ರೋಗ'
      ]
    },
    orthopaedics: {
      canonicalId: 'orthopaedics',
      kannadaName: 'ಮೂಳೆ ವಿಭಾಗ',
      doctorName: 'ಡಾ. ಸುರೇಶ್ ಗೌಡ',
      keywords: [
        'ಮೂಳೆ ವಿಭಾಗ', 'ಮೂಳೆ', 'ಆರ್ಥೋಪೆಡಿಕ್', 'ಕೀಲು', 'ಕಾಲು ನೋವು',
        'ಕೈ ನೋವು', 'ಬೆನ್ನು ನೋವು', 'ಮೂಳೆ ಮುರಿತ', 'ಕೀಲು ನೋವು'
      ]
    },
    ophthalmology: {
      canonicalId: 'ophthalmology',
      kannadaName: 'ಕಣ್ಣು ವಿಭಾಗ',
      doctorName: 'ಡಾ. ಪ್ರಿಯಾ ಶರ್ಮ',
      keywords: [
        'ಕಣ್ಣು ವಿಭಾಗ', 'ಕಣ್ಣು', 'ಕಣ್ಣಿನ', 'ದೃಷ್ಟಿ', 'ಆಪ್ತಾಲ್ಮಾಲಜಿ',
        'ಕಣ್ಣಿನ ಡಾಕ್ಟರ್', 'ಕಣ್ಣಿನ ತಜ್ಞರು', 'ಕಣ್ಣಿನ ಪರೀಕ್ಷೆ'
      ]
    },
    general_medicine: {
      canonicalId: 'general_medicine',
      kannadaName: 'ಸಾಮಾನ್ಯ ವೈದ್ಯ',
      doctorName: 'ಡಾ. ಮಂಜುನಾಥ್ ಕೆ.',
      keywords: [
        'ಸಾಮಾನ್ಯ ವೈದ್ಯ', 'ಸಾಮಾನ್ಯ ವಿಭಾಗ', 'ಜನರಲ್ ಮೆಡಿಸಿನ್', 'ಜನರಲ್ ಫಿಸಿಶಿಯನ್',
        'ಜ್ವರ', 'ಶೀತ', 'ಕೆಮ್ಮು', 'ತಲೆನೋವು', 'ಸಾಮಾನ್ಯ ತಪಾಸಣೆ', 'ವೈದ್ಯರು'
      ]
    }
  };

  // Weekday and date entity mapping
  const WEEKDAY_NAMES = [
    { dayIndex: 0, kannada: 'ಭಾನುವಾರ', keywords: ['ಭಾನುವಾರ', 'ಆದಿತ್ಯವಾರ'] },
    { dayIndex: 1, kannada: 'ಸೋಮವಾರ', keywords: ['ಸೋಮವಾರ'] },
    { dayIndex: 2, kannada: 'ಮಂಗಳವಾರ', keywords: ['ಮಂಗಳವಾರ'] },
    { dayIndex: 3, kannada: 'ಬುಧವಾರ', keywords: ['ಬುಧವಾರ'] },
    { dayIndex: 4, kannada: 'ಗುರುವಾರ', keywords: ['ಗುರುವಾರ', 'ಬೃಹಸ್ಪತಿವಾರ'] },
    { dayIndex: 5, kannada: 'ಶುಕ್ರವಾರ', keywords: ['ಶುಕ್ರವಾರ'] },
    { dayIndex: 6, kannada: 'ಶನಿವಾರ', keywords: ['ಶನಿವಾರ'] }
  ];

  // Time slot entities
  const TIME_SLOT_ENTITIES = {
    morning: {
      id: 'morning',
      kannada: 'ಬೆಳಿಗ್ಗೆ',
      keywords: ['ಬೆಳಿಗ್ಗೆ', 'ಮುಂಜಾನೆ', 'ಬೆಳಗ್ಗೆ', 'ಮಾರ್ನಿಂಗ್', 'ಮೊದಲಾವಧಿ', '೧೦ ಗಂಟೆ', '೧೧ ಗಂಟೆ', 'ಹತ್ತು ಗಂಟೆ']
    },
    afternoon: {
      id: 'afternoon',
      kannada: 'ಮಧ್ಯಾಹ್ನ',
      keywords: ['ಮಧ್ಯಾಹ್ನ', 'ಸಂಜೆ', 'ಆಫ್ಟರ್‌ನೂನ್', 'ಎರಡನೇ ಅವಧಿ', '೨ ಗಂಟೆ', '೩ ಗಂಟೆ', '೪ ಗಂಟೆ', 'ಎರಡು ಗಂಟೆ']
    }
  };

  /**
   * Calculate Levenshtein distance between two strings
   */
  function levenshteinDistance(a, b) {
    if (!a || !b) return (a || b).length;
    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(
            dp[i - 1][j],     // deletion
            dp[i][j - 1],     // insertion
            dp[i - 1][j - 1]  // substitution
          );
        }
      }
    }
    return dp[m][n];
  }

  /**
   * Normalize Kannada text
   * - Strips punctuation and symbols
   * - Normalizes spaces
   * - Preserves Kannada script characters and digits
   */
  function normalizeText(input) {
    if (!input || typeof input !== 'string') return '';
    // Unicode normalization form C
    let text = input.normalize('NFC');
    // Remove typical punctuation and special characters
    text = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'।॥]/g, ' ');
    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  }

  /**
   * Convert Kannada numerals in string to standard ASCII digits
   */
  function kannadaDigitsToAscii(str) {
    if (!str) return '';
    return str.split('').map(ch => KANNADA_DIGIT_MAP[ch] || ch).join('');
  }

  /**
   * Convert ASCII digits to Kannada numerals
   */
  function asciiToKannadaDigits(str) {
    if (str === null || str === undefined) return '';
    return String(str).split('').map(ch => REVERSE_KANNADA_DIGIT_MAP[ch] || ch).join('');
  }

  /**
   * Extract numeric sequences from text (both Kannada digits, ASCII digits, and spoken Kannada number words)
   */
  function extractNumbers(text) {
    const normalized = normalizeText(text);
    const converted = kannadaDigitsToAscii(normalized);
    const words = converted.split(' ');
    const extracted = [];

    // Look for continuous digit runs
    const digitMatches = converted.match(/\d+/g);
    if (digitMatches) {
      digitMatches.forEach(numStr => {
        extracted.push({
          value: parseInt(numStr, 10),
          digits: numStr,
          kannadaDigits: asciiToKannadaDigits(numStr),
          type: 'digits'
        });
      });
    }

    // Look for spoken number words
    for (const word of words) {
      if (SPOKEN_NUMBER_WORDS.hasOwnProperty(word)) {
        const val = SPOKEN_NUMBER_WORDS[word];
        extracted.push({
          value: val,
          digits: String(val),
          kannadaDigits: asciiToKannadaDigits(val),
          type: 'spoken_word',
          word: word
        });
      }
    }

    return extracted;
  }

  /**
   * Match string against keyword list with exact containment or Levenshtein distance <= maxDistance
   */
  function fuzzyMatch(text, keywords, maxDistance = 1) {
    if (!text) return null;
    const cleanText = normalizeText(text);

    // 1. Direct substring match (highest confidence)
    for (const kw of keywords) {
      if (cleanText.includes(kw)) {
        return { matchedKeyword: kw, distance: 0, confidence: 1.0 };
      }
    }

    // 2. Token-level fuzzy match
    const tokens = cleanText.split(' ');
    for (const kw of keywords) {
      const kwTokens = kw.split(' ');

      // If single-word keyword, check distance to each token
      if (kwTokens.length === 1) {
        for (const token of tokens) {
          // Allow maxDistance 1 for short words (length <= 5), maxDistance 2 for longer words
          const allowedDist = kw.length > 5 ? Math.min(2, maxDistance) : 1;
          const dist = levenshteinDistance(token, kw);
          if (dist <= allowedDist) {
            return {
              matchedKeyword: kw,
              distance: dist,
              confidence: Math.max(0.7, 1 - (dist / Math.max(kw.length, token.length)))
            };
          }
        }
      } else {
        // Multi-word keyword: check sliding window of tokens
        const windowSize = kwTokens.length;
        for (let i = 0; i <= tokens.length - windowSize; i++) {
          const windowPhrase = tokens.slice(i, i + windowSize).join(' ');
          const dist = levenshteinDistance(windowPhrase, kw);
          if (dist <= maxDistance) {
            return {
              matchedKeyword: kw,
              distance: dist,
              confidence: Math.max(0.75, 1 - (dist / kw.length))
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Detect intent from text
   */
  function detectIntent(text) {
    const normalized = normalizeText(text);
    if (!normalized) {
      return { intent: 'unknown', confidence: 0, raw: text };
    }

    // Priority 1: Check emergency FIRST
    const emergencyMatch = fuzzyMatch(normalized, INTENT_PATTERNS.emergency, 1);
    if (emergencyMatch) {
      return {
        intent: 'emergency',
        confidence: emergencyMatch.confidence,
        keyword: emergencyMatch.matchedKeyword,
        raw: text
      };
    }

    const INTENT_PRIORITY = {
      emergency: 100,
      cancel: 90,
      reschedule: 85,
      book: 60,
      yes: 50,
      no: 50,
      back: 50,
      help: 50
    };

    // Check all other intents
    const intentScores = [];
    for (const [intentName, keywords] of Object.entries(INTENT_PATTERNS)) {
      if (intentName === 'emergency') continue;
      const match = fuzzyMatch(normalized, keywords, 1);
      if (match) {
        intentScores.push({
          intent: intentName,
          confidence: match.confidence,
          keyword: match.matchedKeyword,
          distance: match.distance,
          priority: INTENT_PRIORITY[intentName] || 50,
          keywordLength: match.matchedKeyword ? match.matchedKeyword.length : 0
        });
      }
    }

    if (intentScores.length > 0) {
      // Sort: higher priority intent first (e.g. cancel over book), then longer keyword match, then confidence, then lowest distance
      intentScores.sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        if (b.keywordLength !== a.keywordLength) return b.keywordLength - a.keywordLength;
        if (b.confidence !== a.confidence) return b.confidence - a.confidence;
        return a.distance - b.distance;
      });
      return {
        ...intentScores[0],
        raw: text
      };
    }

    return { intent: 'unknown', confidence: 0, raw: text };
  }

  /**
   * Extract Department entity
   */
  function extractDepartment(text) {
    const normalized = normalizeText(text);
    for (const [deptKey, deptData] of Object.entries(DEPARTMENT_ENTITIES)) {
      const match = fuzzyMatch(normalized, deptData.keywords, 1);
      if (match) {
        return {
          departmentId: deptData.canonicalId,
          kannadaName: deptData.kannadaName,
          doctorName: deptData.doctorName,
          matchedKeyword: match.matchedKeyword,
          confidence: match.confidence
        };
      }
    }
    return null;
  }

  /**
   * Extract Date entity (relative terms or weekday)
   */
  function extractDate(text, referenceDate = new Date()) {
    const normalized = normalizeText(text);

    // Relative dates: ಇಂದು, ನಾಳೆ, ನಾಡಿದ್ದು
    if (fuzzyMatch(normalized, ['ಇಂದು', 'ಇವತ್ತು'], 1)) {
      const d = new Date(referenceDate);
      return {
        type: 'relative',
        key: 'today',
        kannada: 'ಇಂದು',
        offsetDays: 0,
        targetDate: d
      };
    }
    if (fuzzyMatch(normalized, ['ನಾಳೆ'], 1)) {
      const d = new Date(referenceDate);
      d.setDate(d.getDate() + 1);
      return {
        type: 'relative',
        key: 'tomorrow',
        kannada: 'ನಾಳೆ',
        offsetDays: 1,
        targetDate: d
      };
    }
    if (fuzzyMatch(normalized, ['ನಾಡಿದ್ದು'], 1)) {
      const d = new Date(referenceDate);
      d.setDate(d.getDate() + 2);
      return {
        type: 'relative',
        key: 'day_after_tomorrow',
        kannada: 'ನಾಡಿದ್ದು',
        offsetDays: 2,
        targetDate: d
      };
    }

    // Check for "ಮುಂದಿನ" (next) prefix
    const isNextWeek = normalized.includes('ಮುಂದಿನ');

    // Weekday match
    for (const wd of WEEKDAY_NAMES) {
      const match = fuzzyMatch(normalized, wd.keywords, 1);
      if (match) {
        const currentDay = referenceDate.getDay();
        let targetDay = wd.dayIndex;
        let diff = (targetDay - currentDay + 7) % 7;
        if (diff === 0 && isNextWeek) {
          diff = 7;
        } else if (diff === 0) {
          // If weekday mentioned is today, assume today
          diff = 0;
        }
        if (isNextWeek && diff < 7) {
          diff += 7;
        }

        const d = new Date(referenceDate);
        d.setDate(d.getDate() + diff);

        return {
          type: 'weekday',
          dayIndex: wd.dayIndex,
          kannada: wd.kannada,
          isNextWeek: isNextWeek,
          offsetDays: diff,
          targetDate: d
        };
      }
    }

    return null;
  }

  /**
   * Extract Time Slot entity
   */
  function extractTimeSlot(text) {
    const normalized = normalizeText(text);
    for (const [slotKey, slotData] of Object.entries(TIME_SLOT_ENTITIES)) {
      const match = fuzzyMatch(normalized, slotData.keywords, 1);
      if (match) {
        return {
          slotId: slotData.id,
          kannada: slotData.kannada,
          matchedKeyword: match.matchedKeyword,
          confidence: match.confidence
        };
      }
    }
    return null;
  }

  /**
   * Extract Patient Name from Kannada speech
   * Handles patterns like:
   * - "ನನ್ನ ಹೆಸರು ರಮೇಶ್ ಕುಮಾರ್"
   * - "ರೋಗಿಯ ಹೆಸರು ಅನಿತಾ ಗೌಡ"
   * - "ಹೆಸರು ಸುರೇಶ್ ಹೆಗಡೆ"
   * - Direct spoken name when in dedicated name input mode
   */
  function extractName(text, isNamePromptActive = false) {
    if (!text || typeof text !== 'string') return null;
    const normalized = normalizeText(text);

    // 1. Check explicit name declarations
    const namePrefixRegexes = [
      /^(?:ನನ್ನ\s+)?ರೋಗಿಯ\s+ಹೆಸರು\s+(.+)$/,
      /^ನನ್ನ\s+ಹೆಸರು\s+(.+)$/,
      /^ಹೆಸರು\s+(.+)$/
    ];

    for (const rx of namePrefixRegexes) {
      const match = normalized.match(rx);
      if (match && match[1]) {
        let nameCandidate = match[1].trim();
        // Remove trailing suffixes like "ಅಂತ", "ಆಗಿದೆ", "ಇದೆ", "ಎಂದು", "ಹಾಕಿ"
        nameCandidate = nameCandidate.replace(/\s+(ಅಂತ|ಆಗಿದೆ|ಇದೆ|ಎಂದು|ಹಾಕಿ|ಬರೆಯಿರಿ)$/, '').trim();
        if (nameCandidate.length >= 2) {
          return nameCandidate;
        }
      }
    }

    // 2. If in dedicated name-prompt mode (e.g. user clicked "ಧ್ವನಿ ಮೂಲಕ ಹೆಸರು ಹೇಳಿ")
    if (isNamePromptActive) {
      // Don't treat navigation keywords (ಹಿಂದೆ, ರದ್ದು, ಸಹಾಯ, etc.) or pure numbers as name
      const intentRes = detectIntent(normalized);
      if (['emergency', 'back', 'help', 'cancel'].includes(intentRes.intent)) {
        return null;
      }

      let cleanName = normalized.replace(/\s+(ಅಂತ|ಆಗಿದೆ|ಇದೆ|ಎಂದು|ಹಾಕಿ|ಬರೆಯಿರಿ)$/, '').trim();
      cleanName = cleanName.replace(/^(?:ನನ್ನ\s+)?ಹೆಸರು\s+/, '').trim();

      const asciiDigits = kannadaDigitsToAscii(cleanName);
      if (cleanName.length >= 2 && !/^\d+$/.test(asciiDigits)) {
        return cleanName;
      }
    }

    return null;
  }

  /**
   * Extract Patient Age from Kannada speech
   * Examples:
   * - "ನನ್ನ ವಯಸ್ಸು ೪೫" -> "೪೫"
   * - "ವಯಸ್ಸು ೩೨ ವರ್ಷ" -> "೩೨"
   * - "೩೫ ವರ್ಷ" -> "೩೫"
   * - "ಮೂವತ್ತೈದು ವರ್ಷ" -> "೩೫"
   * - Direct spoken number in age context -> "೪೨"
   */
  function extractAge(text, isAgePromptActive = false) {
    if (!text || typeof text !== 'string') return null;
    const normalized = normalizeText(text);
    const converted = kannadaDigitsToAscii(normalized);

    // 1. Patterns with "ವಯಸ್ಸು" or "ವರ್ಷ"
    const agePrefixMatch = converted.match(/(?:ವಯಸ್ಸು\s*|ನನ್ನ\s+ವಯಸ್ಸು\s*)(\d{1,3})/);
    if (agePrefixMatch) {
      const num = parseInt(agePrefixMatch[1], 10);
      if (num > 0 && num <= 125) {
        return asciiToKannadaDigits(String(num));
      }
    }

    const ageSuffixMatch = converted.match(/(\d{1,3})\s*(?:ವರ್ಷ|ವರ್ಶ)/);
    if (ageSuffixMatch) {
      const num = parseInt(ageSuffixMatch[1], 10);
      if (num > 0 && num <= 125) {
        return asciiToKannadaDigits(String(num));
      }
    }

    // Spoken number words with ವರ್ಷ or ವಯಸ್ಸು
    const numbers = extractNumbers(normalized);
    if (normalized.includes('ವರ್ಷ') || normalized.includes('ವಯಸ್ಸು')) {
      if (numbers.length > 0) {
        const candidate = numbers[0].value;
        if (candidate > 0 && candidate <= 125) {
          return asciiToKannadaDigits(String(candidate));
        }
      }
    }

    // 2. Dedicated age prompt mode
    if (isAgePromptActive) {
      const digitMatch = converted.match(/\b(\d{1,3})\b/);
      if (digitMatch) {
        const num = parseInt(digitMatch[1], 10);
        if (num > 0 && num <= 125) {
          return asciiToKannadaDigits(String(num));
        }
      }
      if (numbers.length > 0) {
        const candidate = numbers[0].value;
        if (candidate > 0 && candidate <= 125) {
          return asciiToKannadaDigits(String(candidate));
        }
      }
    }

    return null;
  }

  /**
   * Extract Date of Birth from Kannada speech
   */
  function extractDob(text) {
    if (!text || typeof text !== 'string') return null;
    const normalized = normalizeText(text);

    const asciiText = kannadaDigitsToAscii(normalized);
    const dateSlashMatch = asciiText.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
    if (dateSlashMatch) {
      const day = asciiToKannadaDigits(dateSlashMatch[1].padStart(2, '0'));
      const month = asciiToKannadaDigits(dateSlashMatch[2].padStart(2, '0'));
      const year = asciiToKannadaDigits(dateSlashMatch[3]);
      return `${day}/${month}/${year}`;
    }

    return null;
  }

  /**
   * Master Parse Function:
   * Parses arbitrary Kannada spoken/typed input into structured intent and entities
   */
  function parse(text, context = {}) {
    if (!text || typeof text !== 'string') {
      return {
        text: '',
        intent: 'unknown',
        confidence: 0,
        entities: {},
        isEmergency: false,
        raw: text
      };
    }

    const intentResult = detectIntent(text);
    const departmentEntity = extractDepartment(text);
    const dateEntity = extractDate(text, context.referenceDate || new Date());
    const timeSlotEntity = extractTimeSlot(text);
    const numbers = extractNumbers(text);
    const nameEntity = extractName(text, Boolean(context.expectingName));
    const ageEntity = extractAge(text, Boolean(context.expectingAge));
    const dobEntity = extractDob(text);

    const isEmergency = intentResult.intent === 'emergency';

    return {
      text: text,
      normalizedText: normalizeText(text),
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      matchedKeyword: intentResult.keyword || null,
      isEmergency: isEmergency,
      entities: {
        department: departmentEntity,
        date: dateEntity,
        timeSlot: timeSlotEntity,
        numbers: numbers,
        name: nameEntity,
        age: ageEntity,
        dob: dobEntity
      }
    };
  }

  // Public API
  return {
    parse,
    detectIntent,
    extractDepartment,
    extractDate,
    extractTimeSlot,
    extractNumbers,
    extractName,
    extractAge,
    extractDob,
    normalizeText,
    kannadaDigitsToAscii,
    asciiToKannadaDigits,
    levenshteinDistance,
    fuzzyMatch,
    constants: {
      DEPARTMENT_ENTITIES,
      WEEKDAY_NAMES,
      TIME_SLOT_ENTITIES,
      EMERGENCY_KEYWORDS
    }
  };
});
