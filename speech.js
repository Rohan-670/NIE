/**
 * HEALIO - Hands-free Hospital Appointment Booking System
 * Voice Controller Module: Web Speech Recognition, Kannada Speech Synthesis,
 * and Web Audio Chimes
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.HealioSpeech = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // State
  let recognition = null;
  let isListening = false;
  let speechSynth = window.speechSynthesis || null;
  let currentUtterance = null;
  let audioCtx = null;
  let recognitionSupported = false;
  let synthesisSupported = false;

  // Callbacks
  let onResultCallback = null;
  let onInterimCallback = null;
  let onListeningStateChange = null;
  let onErrorCallback = null;

  /**
   * Check feature support safely
   */
  function checkSupport() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    recognitionSupported = Boolean(SpeechRecognition);
    synthesisSupported = Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance);

    return {
      recognitionSupported,
      synthesisSupported,
      isFullySupported: recognitionSupported && synthesisSupported
    };
  }

  /**
   * Initialize Web Audio Context for pleasant tactile chimes
   */
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext || null;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  /**
   * Play a clean, gentle feedback chime using Web Audio API synthesis
   * types: 'dwell_complete' | 'listen_start' | 'success' | 'alert'
   */
  function playChime(type = 'dwell_complete') {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'dwell_complete') {
        // High, crisp affirmative chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.12); // A5
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'listen_start') {
        // Gentle double ping
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'success') {
        // Melodic major chord arpeggio
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.48);
      } else if (type === 'alert') {
        // Warning dual pulse
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.36);
      }
    } catch (e) {
      // Audio playback fails silently if blocked by browser policy
    }
  }

  /**
   * Find best matching Kannada voice for SpeechSynthesis
   */
  function getKannadaVoice() {
    if (!speechSynth) return null;
    const voices = speechSynth.getVoices() || [];
    // 1. Look for explicit kn-IN or kn language
    const knVoice = voices.find(v => v.lang && (v.lang.toLowerCase() === 'kn-in' || v.lang.toLowerCase().startsWith('kn')));
    if (knVoice) return knVoice;

    // 2. Look for Indian English voice as natural accent fallback
    const inVoice = voices.find(v => v.lang && (v.lang.toLowerCase() === 'en-in' || v.lang.toLowerCase().includes('india')));
    if (inVoice) return inVoice;

    // 3. Fallback to default
    return voices.find(v => v.default) || voices[0] || null;
  }

  /**
   * Speak a Kannada sentence aloud using SpeechSynthesis
   */
  function speak(text, onEnd = null) {
    if (!synthesisSupported || !speechSynth) {
      if (typeof onEnd === 'function') onEnd();
      return;
    }

    try {
      // Cancel previous ongoing speech
      speechSynth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'kn-IN';
      utterance.rate = 0.92; // Slightly measured pace for utmost clarity
      utterance.pitch = 1.0;

      const voice = getKannadaVoice();
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = function () {
        currentUtterance = null;
        if (typeof onEnd === 'function') onEnd();
      };

      utterance.onerror = function (err) {
        currentUtterance = null;
        if (typeof onEnd === 'function') onEnd();
      };

      currentUtterance = utterance;
      speechSynth.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      if (typeof onEnd === 'function') onEnd();
    }
  }

  /**
   * Stop ongoing speech
   */
  function stopSpeaking() {
    if (speechSynth) {
      speechSynth.cancel();
    }
    currentUtterance = null;
  }

  /**
   * Initialize speech recognition with kn-IN language
   */
  function initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    if (!SpeechRecognition) {
      recognitionSupported = false;
      return false;
    }

    try {
      recognition = new SpeechRecognition();
      recognition.lang = 'kn-IN';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;

      recognition.onstart = function () {
        isListening = true;
        if (typeof onListeningStateChange === 'function') {
          onListeningStateChange(true);
        }
      };

      recognition.onresult = function (event) {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const transcriptText = result[0].transcript;
          if (result.isFinal) {
            finalTranscript += transcriptText;
          } else {
            interimTranscript += transcriptText;
          }
        }

        if (interimTranscript && typeof onInterimCallback === 'function') {
          onInterimCallback(interimTranscript);
        }

        if (finalTranscript && typeof onResultCallback === 'function') {
          onResultCallback(finalTranscript.trim());
        }
      };

      recognition.onerror = function (event) {
        // Handle common errors like 'no-speech' gracefully without stopping continuous mode
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          if (typeof onErrorCallback === 'function') {
            onErrorCallback(event.error);
          }
        }
      };

      recognition.onend = function () {
        // If we were supposed to be listening, attempt soft restart
        if (isListening) {
          try {
            recognition.start();
          } catch (e) {
            isListening = false;
            if (typeof onListeningStateChange === 'function') {
              onListeningStateChange(false);
            }
          }
        } else {
          isListening = false;
          if (typeof onListeningStateChange === 'function') {
            onListeningStateChange(false);
          }
        }
      };

      recognitionSupported = true;
      return true;
    } catch (e) {
      console.warn('SpeechRecognition initialization error:', e);
      recognitionSupported = false;
      return false;
    }
  }

  /**
   * Start listening in Kannada
   */
  function startListening() {
    if (!recognition && !initRecognition()) {
      return false;
    }

    try {
      // Pause speech synthesis so it doesn't feed back into mic
      stopSpeaking();
      playChime('listen_start');
      isListening = true;
      recognition.start();
      return true;
    } catch (e) {
      // If already started, ignore error
      if (e.name === 'InvalidStateError') {
        isListening = true;
        return true;
      }
      isListening = false;
      if (typeof onListeningStateChange === 'function') {
        onListeningStateChange(false);
      }
      return false;
    }
  }

  /**
   * Stop listening
   */
  function stopListening() {
    isListening = false;
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {}
    }
    if (typeof onListeningStateChange === 'function') {
      onListeningStateChange(false);
    }
  }

  /**
   * Set callback handlers
   */
  function setHandlers(handlers = {}) {
    if (handlers.onResult) onResultCallback = handlers.onResult;
    if (handlers.onInterim) onInterimCallback = handlers.onInterim;
    if (handlers.onStateChange) onListeningStateChange = handlers.onStateChange;
    if (handlers.onError) onErrorCallback = handlers.onError;
  }

  // Pre-load voices if speech synthesis is present
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = function () {
      getKannadaVoice();
    };
  }

  return {
    checkSupport,
    initRecognition,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    playChime,
    setHandlers,
    isListening: () => isListening,
    isSupported: () => checkSupport().isFullySupported
  };
});
