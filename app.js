/**
 * HEALIO - Hands-free Hospital Appointment Booking System
 * Main Application Controller (Kannada Only UI, State Management, Dwell Gaze, Gesture, Keyboard, Mock Data)
 */

(function () {
  'use strict';

  // -------------------------------------------------------------
  // 1. Data Models & Constants (All UI Text is Strictly Kannada)
  // -------------------------------------------------------------

  const DEPARTMENTS = [
    {
      id: 'cardiology',
      kannadaName: 'ಹೃದಯ ವಿಭಾಗ',
      doctorName: 'ಡಾ. ರಮೇಶ್ ಕುಮಾರ್',
      icon: '❤️',
      description: 'ಎದೆ ನೋವು, ರಕ್ತದೊತ್ತಡ ಮತ್ತು ಹೃದಯ ತಪಾಸಣೆ',
      phonetic: 'Hrudaya Vibhaaga',
      englishMeaning: 'Cardiology (Heart Care)'
    },
    {
      id: 'paediatrics',
      kannadaName: 'ಮಕ್ಕಳ ವಿಭಾಗ',
      doctorName: 'ಡಾ. ಅನಿತಾ ರಾವ್',
      icon: '👶',
      description: 'ಮಕ್ಕಳ ಜ್ವರ, ರೋಗನಿರೋಧಕ ಲಸಿಕೆ ಮತ್ತು ಆರೈಕೆ',
      phonetic: 'Makkala Vibhaaga',
      englishMeaning: 'Paediatrics (Child Care)'
    },
    {
      id: 'orthopaedics',
      kannadaName: 'ಮೂಳೆ ವಿಭಾಗ',
      doctorName: 'ಡಾ. ಸುರೇಶ್ ಗೌಡ',
      icon: '🦴',
      description: 'ಕೀಲು ನೋವು, ಮೂಳೆ ಮುರಿತ ಮತ್ತು ಸಂಧಿವಾತ',
      phonetic: 'Moole Vibhaaga',
      englishMeaning: 'Orthopaedics (Bone & Joint)'
    },
    {
      id: 'ophthalmology',
      kannadaName: 'ಕಣ್ಣು ವಿಭಾಗ',
      doctorName: 'ಡಾ. ಪ್ರಿಯಾ ಶರ್ಮ',
      icon: '👁️',
      description: 'ದೃಷ್ಟಿ ಪರೀಕ್ಷೆ, ಕಣ್ಣಿನ ಪೊರೆ ಮತ್ತು ಕನ್ನಡಕ',
      phonetic: 'Kannu Vibhaaga',
      englishMeaning: 'Ophthalmology (Eye Care)'
    },
    {
      id: 'general_medicine',
      kannadaName: 'ಸಾಮಾನ್ಯ ವೈದ್ಯ',
      doctorName: 'ಡಾ. ಮಂಜುನಾಥ್ ಕೆ.',
      icon: '🩺',
      description: 'ಜ್ವರ, ಶೀತ, ಮಧುಮೇಹ ಮತ್ತು ಸಾಮಾನ್ಯ ತಪಾಸಣೆ',
      phonetic: 'Saamaanya Vaidya',
      englishMeaning: 'General Medicine (Physician)'
    }
  ];

  const KANNADA_WEEKDAYS = ['ಭಾನುವಾರ', 'ಸೋಮವಾರ', 'ಮಂಗಳವಾರ', 'ಬುಧವಾರ', 'ಗುರುವಾರ', 'ಶುಕ್ರವಾರ', 'ಶನಿವಾರ'];
  const KANNADA_MONTHS = ['ಜನವರಿ', 'ಫೆಬ್ರವರಿ', 'ಮಾರ್ಚ್', 'ಏಪ್ರಿಲ್', 'ಮೇ', 'ಜೂನ್', 'ಜುಲೈ', 'ಆಗಸ್ಟ್', 'ಸೆಪ್ಟೆಂಬರ್', 'ಅಕ್ಟೋಬರ್', 'ನವೆಂಬರ್', 'ಡಿಸೆಂಬರ್'];

  const DEFAULT_SLOTS = {
    morning: [
      { id: 'm1', timeKannada: '೧೦:೦೦ ಬೆಳಿಗ್ಗೆ', timeLabel: '10:00 AM' },
      { id: 'm2', timeKannada: '೧೧:೦೦ ಬೆಳಿಗ್ಗೆ', timeLabel: '11:00 AM' },
      { id: 'm3', timeKannada: '೧೧:೩೦ ಬೆಳಿಗ್ಗೆ', timeLabel: '11:30 AM' }
    ],
    afternoon: [
      { id: 'a1', timeKannada: '೦೨:೦೦ ಮಧ್ಯಾಹ್ನ', timeLabel: '02:00 PM' },
      { id: 'a2', timeKannada: '೦೩:೦೦ ಮಧ್ಯಾಹ್ನ', timeLabel: '03:00 PM' },
      { id: 'a3', timeKannada: '೦೪:೦೦ ಮಧ್ಯಾಹ್ನ', timeLabel: '04:00 PM' }
    ]
  };

  // Screen speech prompts in Kannada
  const SCREEN_PROMPTS = {
    welcome: 'ಹೀಲಿಯೋಗೆ ಸುಸ್ವಾಗತ. ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಲು ಮಾತನಾಡಿ ಅಥವಾ ಬಟನ್ ಒತ್ತಿರಿ.',
    input_mode: 'ನಿಮ್ಮ ಅನುಕೂಲಕರ ಇನ್ಪುಟ ವಿಧಾನವನ್ನು ಆರಿಸಿ: ಧ್ವನಿ ಅಥವಾ ಬಟನ್.',
    identity: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರನ್ನು ಧ್ವನಿ ಮೂಲಕ ಹೇಳಿ ಅಥವಾ ನಮೂದಿಸಿ. ನಂತರ ನಿಮ್ಮ ವಯಸ್ಸನ್ನು ತಿಳಿಸಿ.',
    department: 'ನೀವು ಭೇಟಿ ನೀಡಲು ಬಯಸುವ ವಿಭಾಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    datetime: 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಾಗಿ ಅನುಕೂಲಕರ ದಿನಾಂಕ ಮತ್ತು ಸಮಯದ ಸ್ಲಾಟ್ ಆಯ್ಕೆಮಾಡಿ.',
    confirm: 'ನಿಮ್ಮ ಬುಕಿಂಗ್ ವಿವರಗಳನ್ನು ದೃಢೀಕರಿಸಲಾಗಿದೆ. ಉಲ್ಲೇಖ ಸಂಖ್ಯೆಯನ್ನು ಗಮನಿಸಿ.',
    my_bookings: 'ಇಲ್ಲಿ ನಿಮ್ಮ ಎಲ್ಲಾ ಬುಕಿಂಗ್ ವಿವರಗಳಿವೆ. ನೀವು ಬದಲಿಸಬಹುದು ಅಥವಾ ರದ್ದು ಮಾಡಬಹುದು.',
    emergency: 'ತುರ್ತು ಪರಿಸ್ಥಿತಿ! ದಯವಿಟ್ಟು ತಕ್ಷಣವೇ ೧೦೮ ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗೆ ಕರೆ ಮಾಡಿ.'
  };

  // -------------------------------------------------------------
  // 2. Application State
  // -------------------------------------------------------------

  const state = {
    currentScreen: 'welcome',
    previousScreen: null,
    inputMode: 'button', // 'voice' | 'button'
    selectedDepartment: null,
    selectedDate: null,
    selectedSlot: null,
    patientName: 'ರಮೇಶ್ ಕುಮಾರ್',
    patientAge: '೩೫',
    demoCode: generateDemoCode(),
    bookings: [],
    reschedulingBookingId: null,
    isListeningForName: false,
    isListeningForAge: false,
    useBackendApi: false,
    learningHelperEnabled: false,
    learnPhrasesData: null,
    selectedLearnCategoryId: null,
    activePracticePhrase: null,
    slotAvailability: {} // Tracks booked slot IDs: { "dept_dateStr_slotId": true }
  };

  // Helper to generate 4-digit demo code
  function generateDemoCode() {
    const num = Math.floor(1000 + Math.random() * 9000);
    return KannadaNLP.asciiToKannadaDigits(String(num));
  }

  // Helper to generate random booking reference HL-XXXX
  function generateBookingRef() {
    const num = Math.floor(1000 + Math.random() * 9000);
    return 'HL-' + KannadaNLP.asciiToKannadaDigits(String(num));
  }

  // -------------------------------------------------------------
  // 3. Storage & Backend API Synchronization
  // -------------------------------------------------------------

  async function checkBackendAvailability() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        state.useBackendApi = true;
        console.log('Connected to HEALIO backend API.');
        await loadBookingsFromBackend();
        return true;
      }
    } catch (e) {
      state.useBackendApi = false;
      console.log('Running in local standalone mode.');
    }
    return false;
  }

  async function loadBookingsFromBackend() {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        if (data.bookings && Array.isArray(data.bookings)) {
          state.bookings = data.bookings;
          if (state.currentScreen === 'my_bookings') {
            renderMyBookingsScreen();
          }
        }
      }
    } catch (e) {
      console.warn('Backend fetch failed, using local store:', e);
    }
  }

  function loadSavedData() {
    try {
      const savedBookings = localStorage.getItem('healio_kannada_bookings');
      if (savedBookings) {
        state.bookings = JSON.parse(savedBookings);
      }
      const savedAvailability = localStorage.getItem('healio_slot_availability');
      if (savedAvailability) {
        state.slotAvailability = JSON.parse(savedAvailability);
      }
    } catch (e) {
      console.warn('LocalStorage unavailable. Using in-memory store.');
    }

    // Pre-seed some slots as already booked if empty (to showcase availability filtering)
    if (Object.keys(state.slotAvailability).length === 0) {
      seedMockBookedSlots();
    }
  }

  function saveBookings() {
    try {
      localStorage.setItem('healio_kannada_bookings', JSON.stringify(state.bookings));
      localStorage.setItem('healio_slot_availability', JSON.stringify(state.slotAvailability));
    } catch (e) {
      // Storage unavailable or quota exceeded; memory store persists for session
    }
  }

  function seedMockBookedSlots() {
    // Generate dates for next 7 days
    const next7Days = getNext7Days();
    if (next7Days.length > 0) {
      // Book morning slot 1 for cardiology on Day 1
      const key1 = `cardiology_${next7Days[0].isoDate}_m1`;
      // Book afternoon slot 2 for paediatrics on Day 2
      const key2 = `paediatrics_${next7Days[1].isoDate}_a2`;
      state.slotAvailability[key1] = true;
      state.slotAvailability[key2] = true;
    }
  }

  function getNext7Days() {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const dayIndex = d.getDay();
      const dateNum = d.getDate();
      const monthIndex = d.getMonth();

      const isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const weekdayKannada = KANNADA_WEEKDAYS[dayIndex];
      const dateKannada = KannadaNLP.asciiToKannadaDigits(String(dateNum));
      const monthKannada = KANNADA_MONTHS[monthIndex];

      let label = weekdayKannada;
      if (i === 0) label = 'ಇಂದು (' + weekdayKannada + ')';
      if (i === 1) label = 'ನಾಳೆ (' + weekdayKannada + ')';
      if (i === 2) label = 'ನಾಡಿದ್ದು (' + weekdayKannada + ')';

      days.push({
        dateObj: d,
        isoDate: isoDate,
        weekdayKannada: weekdayKannada,
        dateKannada: dateKannada,
        monthKannada: monthKannada,
        fullKannadaLabel: `${dateKannada} ${monthKannada}, ${weekdayKannada}`,
        chipLabel: label
      });
    }
    return days;
  }

  // -------------------------------------------------------------
  // 4. UI Screen Navigation & Prompts
  // -------------------------------------------------------------

  function setScreen(screenName, options = { speakPrompt: true }) {
    if (screenName === state.currentScreen && !options.force) return;

    // Emergency overlay is handled independently
    if (screenName === 'emergency') {
      showEmergencyModal();
      return;
    }

    state.previousScreen = state.currentScreen;
    state.currentScreen = screenName;

    // Update screen panels
    const allScreens = document.querySelectorAll('.screen-panel');
    allScreens.forEach(panel => {
      panel.classList.remove('active');
    });

    const activePanel = document.getElementById(`screen-${screenName}`);
    if (activePanel) {
      activePanel.classList.add('active');
    }

    // Update step tracker
    updateStepTracker(screenName);

    // Dynamic renderers based on screen
    if (screenName === 'department') {
      renderDepartments();
    } else if (screenName === 'datetime') {
      renderDateTimeScreen();
    } else if (screenName === 'confirm') {
      renderConfirmScreen();
    } else if (screenName === 'my_bookings') {
      renderMyBookingsScreen();
    } else if (screenName === 'identity') {
      renderIdentityScreen();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Speak prompt if enabled and not emergency
    if (options.speakPrompt && SCREEN_PROMPTS[screenName]) {
      speakCurrentPrompt();
    }

    // Refresh Dwell Listeners for newly rendered elements
    setupDwellHandlers();
  }

  function updateStepTracker(screenName) {
    const stepsMap = {
      welcome: 0,
      input_mode: 1,
      identity: 2,
      department: 3,
      datetime: 4,
      confirm: 5,
      my_bookings: 0
    };

    const currentStepIndex = stepsMap[screenName] || 0;
    const stepItems = document.querySelectorAll('.step-item');
    stepItems.forEach(item => {
      const stepNum = parseInt(item.getAttribute('data-step') || '0', 10);
      item.classList.remove('active', 'completed');
      if (stepNum === currentStepIndex) {
        item.classList.add('active');
      } else if (stepNum < currentStepIndex && currentStepIndex > 0) {
        item.classList.add('completed');
      }
    });

    // Hide step tracker on welcome and my_bookings
    const stepTrackerEl = document.getElementById('step-tracker');
    if (stepTrackerEl) {
      if (screenName === 'welcome' || screenName === 'my_bookings') {
        stepTrackerEl.style.display = 'none';
      } else {
        stepTrackerEl.style.display = 'flex';
      }
    }
  }

  function speakCurrentPrompt() {
    const prompt = SCREEN_PROMPTS[state.currentScreen];
    if (prompt) {
      HealioSpeech.speak(prompt);
    }
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-msg ${type}`;
    toast.setAttribute('role', 'status');
    toast.innerHTML = `<span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 4000);
  }

  // -------------------------------------------------------------
  // 5. Emergency Screen Handler
  // -------------------------------------------------------------

  function showEmergencyModal() {
    const modal = document.getElementById('emergency-modal');
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    }
    HealioSpeech.stopSpeaking();
    HealioSpeech.playChime('alert');
    HealioSpeech.speak('ತುರ್ತು ಪರಿಸ್ಥಿತಿ! ತಕ್ಷಣ ೧೦೮ ಗೆ ಕರೆ ಮಾಡಿ.');
  }

  function hideEmergencyModal() {
    const modal = document.getElementById('emergency-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
    HealioSpeech.stopSpeaking();
    // Return to previous screen
    setScreen(state.previousScreen || 'welcome', { speakPrompt: true });
  }

  // -------------------------------------------------------------
  // 6. Screen Renderers
  // -------------------------------------------------------------

  // Render Identity Screen
  function renderIdentityScreen() {
    const codeDisplay = document.getElementById('demo-code-display');
    if (codeDisplay) {
      codeDisplay.textContent = state.demoCode;
    }
    const nameInput = document.getElementById('patient-name-input');
    if (nameInput) {
      nameInput.value = state.patientName;
    }
    const ageInput = document.getElementById('patient-age-input');
    if (ageInput) {
      ageInput.value = state.patientAge || '೩೫';
    }
  }

  // Render Departments Screen
  function renderDepartments() {
    const container = document.getElementById('departments-grid');
    if (!container) return;

    container.innerHTML = '';
    DEPARTMENTS.forEach(dept => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `selectable-card dwell-btn ${state.selectedDepartment && state.selectedDepartment.id === dept.id ? 'selected' : ''}`;
      card.setAttribute('aria-label', `${dept.kannadaName}, ವೈದ್ಯರು ${dept.doctorName}`);
      card.dataset.deptId = dept.id;

      const learnHintHtml = state.learningHelperEnabled
        ? `<div class="kannada-learn-hint">💡 ಉಚ್ಚಾರಣೆ: ${dept.phonetic} (${dept.englishMeaning})</div>`
        : '';

      card.innerHTML = `
        <div class="card-icon-badge">${dept.icon}</div>
        <div class="card-title">${dept.kannadaName}</div>
        ${learnHintHtml}
        <div class="card-subtitle" style="font-weight:700; color:var(--color-primary);">${dept.doctorName}</div>
        <div class="card-subtitle">${dept.description}</div>
      `;

      card.addEventListener('click', () => {
        selectDepartment(dept);
      });

      container.appendChild(card);
    });
  }

  function selectDepartment(dept) {
    state.selectedDepartment = dept;
    HealioSpeech.playChime('dwell_complete');
    showToast(`${dept.kannadaName} ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ`, 'success');
    setScreen('datetime');
  }

  // Render Date & Time Screen
  function renderDateTimeScreen() {
    const daysContainer = document.getElementById('days-cards-container');
    const slotsContainer = document.getElementById('slots-grid-container');
    const deptSummary = document.getElementById('datetime-dept-summary');

    if (deptSummary && state.selectedDepartment) {
      deptSummary.textContent = `${state.selectedDepartment.kannadaName} (${state.selectedDepartment.doctorName})`;
    }

    const next7Days = getNext7Days();

    // Default to today if no date selected
    if (!state.selectedDate) {
      state.selectedDate = next7Days[0];
    }

    // 1. Render Days
    if (daysContainer) {
      daysContainer.innerHTML = '';
      next7Days.forEach(day => {
        const isSelected = state.selectedDate && state.selectedDate.isoDate === day.isoDate;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `date-pill-card dwell-btn ${isSelected ? 'selected' : ''}`;
        btn.setAttribute('aria-label', `${day.fullKannadaLabel}`);
        btn.dataset.isoDate = day.isoDate;

        btn.innerHTML = `
          <div class="card-weekday">${day.chipLabel}</div>
          <div class="card-daynum">${day.dateKannada}</div>
          <div class="card-weekday" style="font-size:13px;">${day.monthKannada}</div>
        `;

        btn.addEventListener('click', () => {
          state.selectedDate = day;
          HealioSpeech.playChime('dwell_complete');
          renderDateTimeScreen();
        });

        daysContainer.appendChild(btn);
      });
    }

    // 2. Render Slots for selected department and date
    if (slotsContainer && state.selectedDepartment && state.selectedDate) {
      slotsContainer.innerHTML = '';

      // Morning Slots
      const morningWrap = document.createElement('div');
      morningWrap.className = 'slots-group';
      morningWrap.innerHTML = `<div class="slots-group-title">☀️ ಬೆಳಿಗ್ಗೆ (ಮುಂಜಾನೆ)</div>`;
      const morningGrid = document.createElement('div');
      morningGrid.className = 'slots-grid';

      DEFAULT_SLOTS.morning.forEach(slot => {
        const slotKey = `${state.selectedDepartment.id}_${state.selectedDate.isoDate}_${slot.id}`;
        const isBooked = state.slotAvailability[slotKey] === true;
        const isSelected = state.selectedSlot && state.selectedSlot.id === slot.id;

        const learnSlotHint = state.learningHelperEnabled
          ? `<span style="font-size:11px; color:#0369a1; font-weight:700;">[${slot.timeLabel}]</span>`
          : '';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `slot-btn dwell-btn ${isSelected ? 'selected' : ''}`;
        btn.disabled = isBooked;
        btn.setAttribute('aria-label', `${slot.timeKannada} ${isBooked ? 'ಲಭ್ಯವಿಲ್ಲ' : 'ಲಭ್ಯವಿದೆ'}`);
        btn.innerHTML = `
          <span>${slot.timeKannada}</span>
          ${learnSlotHint}
          <span style="font-size:12px; margin-top:2px;">${isBooked ? '🚫 ಭರ್ತಿಯಾಗಿದೆ' : '✓ ಲಭ್ಯವಿದೆ'}</span>
        `;

        if (!isBooked) {
          btn.addEventListener('click', () => {
            selectSlot(slot);
          });
        }
        morningGrid.appendChild(btn);
      });
      morningWrap.appendChild(morningGrid);
      slotsContainer.appendChild(morningWrap);

      // Afternoon Slots
      const afternoonWrap = document.createElement('div');
      afternoonWrap.className = 'slots-group';
      afternoonWrap.innerHTML = `<div class="slots-group-title">🌤️ ಮಧ್ಯಾಹ್ನ (ಅಪರಾಹ್ನ)</div>`;
      const afternoonGrid = document.createElement('div');
      afternoonGrid.className = 'slots-grid';

      DEFAULT_SLOTS.afternoon.forEach(slot => {
        const slotKey = `${state.selectedDepartment.id}_${state.selectedDate.isoDate}_${slot.id}`;
        const isBooked = state.slotAvailability[slotKey] === true;
        const isSelected = state.selectedSlot && state.selectedSlot.id === slot.id;

        const learnSlotHint = state.learningHelperEnabled
          ? `<span style="font-size:11px; color:#0369a1; font-weight:700;">[${slot.timeLabel}]</span>`
          : '';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `slot-btn dwell-btn ${isSelected ? 'selected' : ''}`;
        btn.disabled = isBooked;
        btn.setAttribute('aria-label', `${slot.timeKannada} ${isBooked ? 'ಲಭ್ಯವಿಲ್ಲ' : 'ಲಭ್ಯವಿದೆ'}`);
        btn.innerHTML = `
          <span>${slot.timeKannada}</span>
          ${learnSlotHint}
          <span style="font-size:12px; margin-top:2px;">${isBooked ? '🚫 ಭರ್ತಿಯಾಗಿದೆ' : '✓ ಲಭ್ಯವಿದೆ'}</span>
        `;

        if (!isBooked) {
          btn.addEventListener('click', () => {
            selectSlot(slot);
          });
        }
        afternoonGrid.appendChild(btn);
      });
      afternoonWrap.appendChild(afternoonGrid);
      slotsContainer.appendChild(afternoonWrap);
    }
  }

  function selectSlot(slot) {
    state.selectedSlot = slot;
    HealioSpeech.playChime('dwell_complete');

    // If we are rescheduling, update existing booking directly
    if (state.reschedulingBookingId) {
      applyReschedule();
    } else {
      // Proceed to confirm screen
      finalizeBooking();
    }
  }

  // Finalize booking creation
  async function finalizeBooking() {
    const bookingPayload = {
      patientName: state.patientName,
      patientAge: state.patientAge || '೩೫',
      department: state.selectedDepartment,
      date: state.selectedDate,
      slot: state.selectedSlot
    };

    if (state.useBackendApi) {
      try {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingPayload)
        });
        if (res.ok) {
          const result = await res.json();
          state.latestBooking = result.booking;
          state.bookings.unshift(result.booking);
          HealioSpeech.playChime('success');
          setScreen('confirm');
          return;
        } else {
          const errData = await res.json();
          showToast(errData.error || 'ಬುಕಿಂಗ್ ವಿಫಲವಾಗಿದೆ', 'error');
        }
      } catch (err) {
        console.warn('Backend booking failed, falling back to local creation:', err);
      }
    }

    // Local fallback
    const bookingRef = generateBookingRef();
    const newBooking = {
      id: 'BK_' + Date.now(),
      refCode: bookingRef,
      patientName: state.patientName,
      patientAge: state.patientAge || '೩೫',
      department: state.selectedDepartment,
      date: state.selectedDate,
      slot: state.selectedSlot,
      createdAt: new Date().toISOString()
    };

    // Mark slot as booked
    const slotKey = `${state.selectedDepartment.id}_${state.selectedDate.isoDate}_${state.selectedSlot.id}`;
    state.slotAvailability[slotKey] = true;

    state.bookings.unshift(newBooking);
    saveBookings();

    state.latestBooking = newBooking;
    HealioSpeech.playChime('success');
    setScreen('confirm');
  }

  async function applyReschedule() {
    const booking = state.bookings.find(b => b.id === state.reschedulingBookingId);
    if (!booking) return;

    if (state.useBackendApi) {
      try {
        const res = await fetch(`/api/bookings/${booking.id}/reschedule`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            department: state.selectedDepartment,
            date: state.selectedDate,
            slot: state.selectedSlot
          })
        });
        if (res.ok) {
          const result = await res.json();
          booking.department = state.selectedDepartment;
          booking.date = state.selectedDate;
          booking.slot = state.selectedSlot;
          state.latestBooking = booking;
          state.reschedulingBookingId = null;
          HealioSpeech.playChime('success');
          showToast('ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಯಶಸ್ವಿಯಾಗಿ ಬದಲಿಸಲಾಗಿದೆ!', 'success');
          setScreen('confirm');
          return;
        }
      } catch (err) {
        console.warn('Backend reschedule failed, using local fallback:', err);
      }
    }

    // Local fallback
    const oldSlotKey = `${booking.department.id}_${booking.date.isoDate}_${booking.slot.id}`;
    delete state.slotAvailability[oldSlotKey];

    // Assign new date and slot
    booking.department = state.selectedDepartment;
    booking.date = state.selectedDate;
    booking.slot = state.selectedSlot;

    // Mark new slot
    const newSlotKey = `${state.selectedDepartment.id}_${state.selectedDate.isoDate}_${state.selectedSlot.id}`;
    state.slotAvailability[newSlotKey] = true;

    saveBookings();
    state.latestBooking = booking;
    state.reschedulingBookingId = null;

    HealioSpeech.playChime('success');
    showToast('ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಯಶಸ್ವಿಯಾಗಿ ಬದಲಿಸಲಾಗಿದೆ!', 'success');
    setScreen('confirm');
  }

  // Render Confirmation Screen & SMS preview
  function renderConfirmScreen() {
    const booking = state.latestBooking || state.bookings[0];
    if (!booking) return;

    const refEl = document.getElementById('confirm-ref-code');
    const nameEl = document.getElementById('confirm-patient-name');
    const ageEl = document.getElementById('confirm-patient-age');
    const deptEl = document.getElementById('confirm-department');
    const doctorEl = document.getElementById('confirm-doctor');
    const dateEl = document.getElementById('confirm-date');
    const timeEl = document.getElementById('confirm-time');
    const smsBubbleEl = document.getElementById('confirm-sms-text');

    if (refEl) refEl.textContent = booking.refCode;
    if (nameEl) nameEl.textContent = booking.patientName;
    if (ageEl) ageEl.textContent = `${booking.patientAge || '೩೫'} ವರ್ಷ`;
    if (deptEl) deptEl.textContent = booking.department.kannadaName;
    if (doctorEl) doctorEl.textContent = booking.department.doctorName;
    if (dateEl) dateEl.textContent = booking.date.fullKannadaLabel;
    if (timeEl) timeEl.textContent = booking.slot.timeKannada;

    // SMS Message text strictly in Kannada
    const smsText = `ಆಸ್ಪತ್ರೆ ಸಂದೇಶ: ಗೌರವಾನ್ವಿತ ${booking.patientName} (ವಯಸ್ಸು: ${booking.patientAge || '೩೫'} ವರ್ಷ), ನಿಮ್ಮ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಯಶಸ್ವಿಯಾಗಿ ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ. ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ: ${booking.refCode}. ದಿನಾಂಕ: ${booking.date.fullKannadaLabel}, ಸಮಯ: ${booking.slot.timeKannada}, ವಿಭಾಗ: ${booking.department.kannadaName} (${booking.department.doctorName}). ದಯವಿಟ್ಟು ೧೫ ನಿಮಿಷ ಮುಂಚಿತವಾಗಿ ತಲುಪಿ. ಸಹಾಯವಾಣಿ: ೧೦೮.`;
    if (smsBubbleEl) {
      smsBubbleEl.textContent = smsText;
    }
  }

  // Render My Bookings Screen
  function renderMyBookingsScreen() {
    const listContainer = document.getElementById('my-bookings-list');
    const emptyNotice = document.getElementById('no-bookings-notice');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (state.bookings.length === 0) {
      if (emptyNotice) emptyNotice.style.display = 'block';
      return;
    } else {
      if (emptyNotice) emptyNotice.style.display = 'none';
    }

    state.bookings.forEach(b => {
      const card = document.createElement('div');
      card.className = 'booking-item-card';

      card.innerHTML = `
        <div class="booking-card-header">
          <div>
            <span class="ref-code-badge" style="font-size:16px;">${b.refCode}</span>
            <span style="font-weight:800; font-size:18px; margin-left:10px; color:var(--color-primary-dark);">${b.department.kannadaName}</span>
          </div>
          <div style="font-weight:700; color:var(--color-primary);">${b.department.doctorName}</div>
        </div>
        <div style="font-size:17px; color:var(--color-text);">
          📅 ದಿನಾಂಕ: <strong>${b.date.fullKannadaLabel}</strong> &nbsp;|&nbsp; ⏰ ಸಮಯ: <strong>${b.slot.timeKannada}</strong>
        </div>
        <div style="font-size:16px; color:var(--color-text-muted);">
          👤 ರೋಗಿ: ${b.patientName} (ವಯಸ್ಸು: ${b.patientAge || b.patientDob || '೩೫'} ವರ್ಷ)
        </div>
        <div class="booking-actions-row">
          <button type="button" class="btn-secondary dwell-btn reschedule-btn" style="min-height:50px; padding:8px 18px;" data-id="${b.id}" aria-label="ಬುಕಿಂಗ್ ಬದಲಿಸಿ ${b.refCode}">
            🔄 ಬದಲಿಸಿ (ದಿನಾಂಕ / ಸಮಯ)
          </button>
          <button type="button" class="btn-danger dwell-btn cancel-btn" style="min-height:50px; padding:8px 18px;" data-id="${b.id}" aria-label="ಬುಕಿಂಗ್ ರದ್ದು ಮಾಡಿ ${b.refCode}">
            ❌ ರದ್ದು ಮಾಡಿ
          </button>
        </div>
      `;

      // Reschedule handler
      const reschedBtn = card.querySelector('.reschedule-btn');
      reschedBtn.addEventListener('click', () => {
        state.reschedulingBookingId = b.id;
        state.selectedDepartment = b.department;
        state.selectedDate = b.date;
        HealioSpeech.playChime('dwell_complete');
        showToast('ದಯವಿಟ್ಟು ಹೊಸ ದಿನಾಂಕ ಮತ್ತು ಸಮಯವನ್ನು ಆರಿಸಿ', 'info');
        setScreen('datetime');
      });

      // Cancel handler
      const cancelBtn = card.querySelector('.cancel-btn');
      cancelBtn.addEventListener('click', () => {
        cancelBooking(b.id);
      });

      listContainer.appendChild(card);
    });
  }

  async function cancelBooking(bookingId) {
    if (state.useBackendApi) {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' });
        if (res.ok) {
          const result = await res.json();
          const idx = state.bookings.findIndex(b => b.id === bookingId);
          if (idx !== -1) {
            state.bookings.splice(idx, 1);
          }
          HealioSpeech.playChime('alert');
          showToast(result.message || 'ಬುಕಿಂಗ್ ಯಶಸ್ವಿಯಾಗಿ ರದ್ದುಗೊಂಡಿದೆ', 'info');
          renderMyBookingsScreen();
          return;
        }
      } catch (err) {
        console.warn('Backend cancel failed, falling back to local:', err);
      }
    }

    const index = state.bookings.findIndex(b => b.id === bookingId);
    if (index !== -1) {
      const b = state.bookings[index];
      // Free slot availability
      const slotKey = `${b.department.id}_${b.date.isoDate}_${b.slot.id}`;
      delete state.slotAvailability[slotKey];

      state.bookings.splice(index, 1);
      saveBookings();

      HealioSpeech.playChime('alert');
      showToast(`ಬುಕಿಂಗ್ ${b.refCode} ಯಶಸ್ವಿಯಾಗಿ ರದ್ದುಗೊಂಡಿದೆ`, 'info');
      renderMyBookingsScreen();
    }
  }

  // -------------------------------------------------------------
  // 7. Input Mode Engine (Voice & Large Button Only)
  // -------------------------------------------------------------

  function setupDwellHandlers() {
    // Gaze/dwell mode removed; touch/click only
  }

  function cancelDwell() {
    // No-op
  }

  // -------------------------------------------------------------
  // 8. Voice Interaction Engine & NLP Dispatcher
  // -------------------------------------------------------------

  function setupSpeechHandlers() {
    const support = HealioSpeech.checkSupport();

    const voiceNotice = document.getElementById('voice-support-notice');
    const voiceModeBtn = document.getElementById('btn-mode-voice');

    if (!support.recognitionSupported) {
      if (voiceNotice) voiceNotice.style.display = 'block';
      if (voiceModeBtn) {
        voiceModeBtn.disabled = true;
        voiceModeBtn.style.opacity = '0.5';
      }
    }

    HealioSpeech.setHandlers({
      onResult: handleSpeechResult,
      onInterim: handleSpeechInterim,
      onStateChange: handleSpeechStateChange,
      onError: handleSpeechError
    });

    // Voice Start / Stop Toggle Button
    const voiceToggleBtn = document.getElementById('voice-toggle-btn');
    if (voiceToggleBtn) {
      voiceToggleBtn.addEventListener('click', () => {
        if (HealioSpeech.isListening()) {
          HealioSpeech.stopListening();
        } else {
          HealioSpeech.startListening();
        }
      });
    }

    // Stop Listening Big Button
    const stopListenBtn = document.getElementById('stop-listen-btn');
    if (stopListenBtn) {
      stopListenBtn.addEventListener('click', () => {
        HealioSpeech.stopListening();
      });
    }

    // Replay Prompt Button
    const replayPromptBtn = document.getElementById('replay-prompt-btn');
    if (replayPromptBtn) {
      replayPromptBtn.addEventListener('click', () => {
        speakCurrentPrompt();
      });
    }
  }

  function handleSpeechStateChange(isListening) {
    const waveEl = document.getElementById('speech-wave-indicator');
    const labelEl = document.getElementById('speech-status-label');
    const toggleBtn = document.getElementById('voice-toggle-btn');

    if (isListening) {
      if (waveEl) waveEl.style.display = 'flex';
      if (labelEl) labelEl.textContent = 'ಕೇಳುತ್ತಿದ್ದೇನೆ...';
      if (toggleBtn) {
        toggleBtn.textContent = '🛑 ಧ್ವನಿ ನಿಲ್ಲಿಸಿ';
        toggleBtn.classList.add('active');
      }
    } else {
      if (waveEl) waveEl.style.display = 'none';
      if (labelEl) labelEl.textContent = 'ಧ್ವನಿ ಸಿದ್ಧವಾಗಿದೆ';
      if (toggleBtn) {
        toggleBtn.textContent = '🎤 ಮಾತನಾಡಿ';
        toggleBtn.classList.remove('active');
      }
    }
  }

  function handleSpeechInterim(text) {
    const transcriptEl = document.getElementById('speech-transcript-text');
    if (transcriptEl) {
      transcriptEl.textContent = text;
    }
  }

  function handleSpeechError(error) {
    console.warn('Speech recognition error:', error);
  }

  function startVoiceNameInput() {
    state.isListeningForName = true;
    state.isListeningForAge = false;

    const statusEl = document.getElementById('voice-name-status');
    if (statusEl) statusEl.style.display = 'block';
    const ageStatusEl = document.getElementById('voice-age-status');
    if (ageStatusEl) ageStatusEl.style.display = 'none';

    HealioSpeech.stopSpeaking();
    HealioSpeech.speak('ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಹೇಳಿ.', () => {
      HealioSpeech.startListening();
    });
    showToast('ನಿಮ್ಮ ಹೆಸರನ್ನು ಹೇಳಿ...', 'info');
  }

  function startVoiceAgeInput() {
    state.isListeningForAge = true;
    state.isListeningForName = false;

    const statusEl = document.getElementById('voice-age-status');
    if (statusEl) statusEl.style.display = 'block';
    const nameStatusEl = document.getElementById('voice-name-status');
    if (nameStatusEl) nameStatusEl.style.display = 'none';

    HealioSpeech.stopSpeaking();
    HealioSpeech.speak('ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಯಸ್ಸನ್ನು ಹೇಳಿ.', () => {
      HealioSpeech.startListening();
    });
    showToast('ನಿಮ್ಮ ವಯಸ್ಸನ್ನು ಹೇಳಿ...', 'info');
  }

  function handleSpeechResult(rawText) {
    const transcriptEl = document.getElementById('speech-transcript-text');
    if (transcriptEl) {
      transcriptEl.textContent = rawText;
    }

    // Contextual parse with expectingName and expectingAge
    const isExpectingName = state.isListeningForName || (state.currentScreen === 'identity');
    const isExpectingAge = Boolean(state.isListeningForAge);
    const parsed = KannadaNLP.parse(rawText, {
      referenceDate: new Date(),
      expectingName: isExpectingName,
      expectingAge: isExpectingAge
    });

    // 1. Emergency Check (Highest Priority)
    if (parsed.isEmergency) {
      showEmergencyModal();
      return;
    }

    // 1b. Learning Center: Voice Phrase Practice Evaluation
    if (state.activePracticePhrase) {
      evaluatePracticeSpeech(rawText);
      return;
    }

    // 2. Global Navigation Intents
    if (parsed.intent === 'back') {
      goBack();
      return;
    }
    if (parsed.intent === 'help') {
      HealioSpeech.speak('ಹೀಲಿಯೋದಲ್ಲಿ ನೀವು ನಿಮ್ಮ ಧ್ವನಿಯಿಂದಲೇ ಹೆಸರು, ವಿಭಾಗ, ದಿನಾಂಕ ಮತ್ತು ಸಮಯವನ್ನು ಹೇಳಿ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಕಾಯ್ದಿರಿಸಬಹುದು.');
      return;
    }
    if (parsed.intent === 'cancel') {
      if (state.currentScreen === 'confirm') {
        if (state.latestBooking) {
          cancelBooking(state.latestBooking.id);
        }
        setScreen('welcome');
      } else {
        setScreen('welcome');
      }
      return;
    }

    // Voice Name Input handling
    if (state.isListeningForName || (state.currentScreen === 'identity' && (parsed.entities.name || rawText.includes('ಹೆಸರು')))) {
      const extractedName = parsed.entities.name || KannadaNLP.extractName(rawText, true);
      if (extractedName && extractedName.length >= 2) {
        state.patientName = extractedName;
        const nameInput = document.getElementById('patient-name-input');
        if (nameInput) {
          nameInput.value = extractedName;
        }
        state.isListeningForName = false;
        const statusEl = document.getElementById('voice-name-status');
        if (statusEl) statusEl.style.display = 'none';

        HealioSpeech.playChime('dwell_complete');
        showToast(`ಹೆಸರು: "${extractedName}" ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ`, 'success');
        HealioSpeech.speak(`ಧನ್ಯವಾದಗಳು, ನಿಮ್ಮ ಹೆಸರು ${extractedName} ಎಂದು ದಾಖಲಾಗಿದೆ. ಮುಂದಿನದಾಗಿ ನಿಮ್ಮ ವಯಸ್ಸನ್ನು ತಿಳಿಸಿ.`);
        return;
      }
    }

    // Voice Age Input handling
    if (state.isListeningForAge || (state.currentScreen === 'identity' && (parsed.entities.age || rawText.includes('ವಯಸ್ಸು') || rawText.includes('ವರ್ಷ')))) {
      const extractedAge = parsed.entities.age || KannadaNLP.extractAge(rawText, Boolean(state.isListeningForAge));
      if (extractedAge) {
        state.patientAge = extractedAge;
        const ageInput = document.getElementById('patient-age-input');
        if (ageInput) {
          ageInput.value = extractedAge;
        }
        state.isListeningForAge = false;
        const ageStatusEl = document.getElementById('voice-age-status');
        if (ageStatusEl) ageStatusEl.style.display = 'none';

        HealioSpeech.playChime('dwell_complete');
        showToast(`ವಯಸ್ಸು: "${extractedAge}" ವರ್ಷ ದಾಖಲಾಗಿದೆ`, 'success');
        HealioSpeech.speak(`ನಿಮ್ಮ ವಯಸ್ಸು ${extractedAge} ವರ್ಷ ಎಂದು ದಾಖಲಾಗಿದೆ. ಮುಂದುವರಿಯಲು ಸರಿ ಎಂದು ಹೇಳಿ ಅಥವಾ ಬಟನ್ ಒತ್ತಿ.`);
        return;
      }
    }

    // 3. Screen-Specific Dispatches
    if (state.currentScreen === 'welcome') {
      if (parsed.intent === 'book' || parsed.intent === 'yes') {
        setScreen('input_mode');
        return;
      }
    }

    if (state.currentScreen === 'input_mode') {
      if (rawText.includes('ಧ್ವನಿ')) {
        setInputMode('voice');
        setScreen('identity');
        return;
      } else if (rawText.includes('ಬಟನ್')) {
        setInputMode('button');
        setScreen('identity');
        return;
      }
    }

    if (state.currentScreen === 'identity') {
      // Direct name speaking without prefix on identity screen
      const directName = KannadaNLP.extractName(rawText, true);
      if (directName && directName.length >= 2 && (!parsed.entities.numbers || !parsed.entities.numbers.length)) {
        state.patientName = directName;
        const nameInput = document.getElementById('patient-name-input');
        if (nameInput) {
          nameInput.value = directName;
        }
        HealioSpeech.playChime('dwell_complete');
        showToast(`ಹೆಸರು: "${directName}" ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ`, 'success');
        HealioSpeech.speak(`ಧನ್ಯವಾದಗಳು, ನಿಮ್ಮ ಹೆಸರು ${directName} ಎಂದು ದಾಖಲಾಗಿದೆ. ಮುಂದುವರಿಯಲು ಸರಿ ಎಂದು ಹೇಳಿ ಅಥವಾ ಬಟನ್ ಒತ್ತಿ.`);
        return;
      }

      // Check if user confirmed demo code or said yes
      const hasNumberMatch = parsed.entities.numbers && parsed.entities.numbers.some(n => {
        return n.kannadaDigits === state.demoCode || n.digits === KannadaNLP.kannadaDigitsToAscii(state.demoCode);
      });

      if (hasNumberMatch || parsed.intent === 'yes' || parsed.intent === 'book') {
        HealioSpeech.playChime('success');
        showToast('ಗುರುತು ಯಶಸ್ವಿಯಾಗಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ!', 'success');
        setScreen('department');
        return;
      }
    }

    if (state.currentScreen === 'department') {
      if (parsed.entities.department) {
        const matchedDept = DEPARTMENTS.find(d => d.id === parsed.entities.department.departmentId);
        if (matchedDept) {
          selectDepartment(matchedDept);
          return;
        }
      }
    }

    if (state.currentScreen === 'datetime') {
      let acted = false;
      // Date entity
      if (parsed.entities.date) {
        const next7 = getNext7Days();
        let targetIndex = parsed.entities.date.offsetDays;
        if (targetIndex >= 0 && targetIndex < next7.length) {
          state.selectedDate = next7[targetIndex];
          renderDateTimeScreen();
          acted = true;
        }
      }
      // Time Slot entity
      if (parsed.entities.timeSlot) {
        // Pick first available slot in that period
        const period = parsed.entities.timeSlot.slotId === 'afternoon' ? 'afternoon' : 'morning';
        const candidateSlot = DEFAULT_SLOTS[period].find(s => {
          const key = `${state.selectedDepartment.id}_${state.selectedDate.isoDate}_${s.id}`;
          return state.slotAvailability[key] !== true;
        });

        if (candidateSlot) {
          selectSlot(candidateSlot);
          acted = true;
          return;
        }
      }
      if (acted) return;
    }

    if (state.currentScreen === 'confirm') {
      if (parsed.intent === 'yes' || parsed.intent === 'book') {
        setScreen('my_bookings');
        return;
      }
    }

    // Fallback: If not understood, speak Kannada retry message and emphasize buttons
    HealioSpeech.playChime('alert');
    HealioSpeech.speak('ಕ್ಷಮಿಸಿ, ಮತ್ತೊಮ್ಮೆ ಹೇಳಿ.');
    showToast('ಕ್ಷಮಿಸಿ, ಮತ್ತೊಮ್ಮೆ ಹೇಳಿ ಅಥವಾ ಬಟನ್ ಬಳಸಿ', 'info');
  }

  function goBack() {
    const backMap = {
      input_mode: 'welcome',
      identity: 'input_mode',
      department: 'identity',
      datetime: 'department',
      confirm: 'datetime',
      my_bookings: 'welcome'
    };
    const prev = backMap[state.currentScreen] || 'welcome';
    setScreen(prev);
  }

  function setInputMode(mode) {
    state.inputMode = mode === 'voice' ? 'voice' : 'button';
    const modeButtons = document.querySelectorAll('.mode-select-btn');
    modeButtons.forEach(btn => {
      btn.classList.remove('selected');
      if (btn.dataset.mode === state.inputMode) {
        btn.classList.add('selected');
      }
    });

    if (state.inputMode === 'voice') {
      HealioSpeech.startListening();
      showToast('ಧ್ವನಿ ವಿಧಾನ ಸಕ್ರಿಯಗೊಂಡಿದೆ', 'success');
    } else {
      HealioSpeech.stopListening();
      showToast('ಬಟನ್ ವಿಧಾನ ಸಕ್ರಿಯಗೊಂಡಿದೆ', 'success');
    }
  }

  // -------------------------------------------------------------
  // 9. Keyboard Accessibility Navigation
  // -------------------------------------------------------------

  function setupKeyboardNavigation() {
    window.addEventListener('keydown', (e) => {
      // Escape closes emergency or learn modal if open
      if (e.key === 'Escape') {
        const learnModal = document.getElementById('learn-kannada-modal');
        if (learnModal && learnModal.style.display !== 'none') {
          hideLearnKannadaModal();
          return;
        }
        const modal = document.getElementById('emergency-modal');
        if (modal && modal.classList.contains('active')) {
          hideEmergencyModal();
          return;
        }
      }

      // Arrow keys navigation between sibling selectable cards / buttons
      if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        const activeEl = document.activeElement;
        if (!activeEl) return;

        const container = activeEl.closest('.grid-cards-3, .grid-cards-5, .dates-scroll-container, .slots-grid, .quick-chips-row');
        if (container) {
          const focusables = Array.from(container.querySelectorAll('button:not(:disabled), [tabindex="0"]'));
          const idx = focusables.indexOf(activeEl);
          if (idx !== -1) {
            e.preventDefault();
            let nextIdx = idx;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
              nextIdx = (idx + 1) % focusables.length;
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
              nextIdx = (idx - 1 + focusables.length) % focusables.length;
            }
            focusables[nextIdx].focus();
          }
        }
      }
    });
  }

  // -------------------------------------------------------------
  // 10. Everyday Kannada Learning Center (ದೈನಂದಿನ ಜೀವನದಲ್ಲಿ ಕನ್ನಡ)
  // -------------------------------------------------------------

  const FALLBACK_LEARN_DATA = {
    categories: [
      {
        id: "healthcare",
        nameKannada: "ಆರೋಗ್ಯ ಮತ್ತು ಆಸ್ಪತ್ರೆ",
        nameEnglish: "Healthcare",
        icon: "🏥",
        phrases: [
          {
            id: "hc_1",
            kannada: "ನನಗೆ ಜ್ವರ ಮತ್ತು ತಲೆನೋವು ಇದೆ",
            phonetic: "Nanage jwara mattu talenovu ide",
            english: "I have fever and headache",
            context: "ವೈದ್ಯರಿಗೆ ರೋಗ ಲಕ್ಷಣ ತಿಳಿಸುವಾಗ"
          },
          {
            id: "hc_2",
            kannada: "ವೈದ್ಯರ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ",
            phonetic: "Vaidyara appointment book maadi",
            english: "Book a doctor's appointment",
            context: "ಆಸ್ಪತ್ರೆಯ ಕೌಂಟರ್‌ನಲ್ಲಿ"
          },
          {
            id: "hc_3",
            kannada: "ಡಾಕ್ಟರ್ ಯಾವಾಗ ಬರುತ್ತಾರೆ?",
            phonetic: "Doctor yaavaaga baruttaare?",
            english: "When will the doctor arrive?",
            context: "ವೈದ್ಯರ ಸಮಯ ವಿಚಾರಿಸಲು"
          },
          {
            id: "hc_4",
            kannada: "ಔಷಧಿ ಚೀಟಿ ಕೊಡಿ",
            phonetic: "Aushadhi cheeti kodi",
            english: "Please give the prescription",
            context: "ವೈದ್ಯರಿಂದ ಔಷಧಿಯ ವಿವರ ಕೇಳುವಾಗ"
          }
        ]
      },
      {
        id: "transportation",
        nameKannada: "ಪ್ರಯಾಣ ಮತ್ತು ಸಾರಿಗೆ",
        nameEnglish: "Travel & Transport",
        icon: "🚌",
        phrases: [
          {
            id: "tr_1",
            kannada: "ಆಸ್ಪತ್ರೆಗೆ ಹೋಗಲು ಬಸ್ ಯಾವುದು?",
            phonetic: "Aaspathrege hogalu bus yaavudu?",
            english: "Which bus goes to the hospital?",
            context: "ಬಸ್ ನಿಲ್ದಾಣದಲ್ಲಿ ಕೇಳುವಾಗ"
          },
          {
            id: "tr_2",
            kannada: "ಮೆಟ್ರೋ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?",
            phonetic: "Metro nildaana ellide?",
            english: "Where is the metro station?",
            context: "ದಾರಿ ವಿಚಾರಿಸುವಾಗ"
          },
          {
            id: "tr_3",
            kannada: "ಆಟೋ ಮೀಟರ್ ಹಾಕಿ",
            phonetic: "Auto meter haaki",
            english: "Please turn on the auto meter",
            context: "ಆಟೋ ಹತ್ತಿದಾಗ"
          }
        ]
      },
      {
        id: "pharmacy",
        nameKannada: "ಔಷಧಾಲಯ ಮತ್ತು ಶಾಪಿಂಗ್",
        nameEnglish: "Pharmacy & Shopping",
        icon: "💊",
        phrases: [
          {
            id: "ph_1",
            kannada: "ಈ ಮಾತ್ರೆಗಳು ಲಭ್ಯವಿದೆಯೇ?",
            phonetic: "Ee maatregalu labhyavideye?",
            english: "Are these tablets available?",
            context: "ಔಷಧಿ ಅಂಗಡಿಯಲ್ಲಿ"
          },
          {
            id: "ph_2",
            kannada: "ಇದರ ಬೆಲೆ ಎಷ್ಟು?",
            phonetic: "Idara bele eshtu?",
            english: "How much does this cost?",
            context: "ಬೆಲೆ ಕೇಳುವಾಗ"
          },
          {
            id: "ph_3",
            kannada: "ಆನ್‌ಲೈನ್ ಪಾವತಿ ಮಾಡಬಹುದೇ?",
            phonetic: "Online paavati maadabahude?",
            english: "Can I pay online (UPI)?",
            context: "ಪಾವತಿ ಮಾಡುವಾಗ"
          }
        ]
      },
      {
        id: "workplace",
        nameKannada: "ದೈನಂದಿನ ಕೆಲಸ ಮತ್ತು ಮಾತುಕತೆ",
        nameEnglish: "Workplace & Daily Life",
        icon: "🏢",
        phrases: [
          {
            id: "wp_1",
            kannada: "ನಮಸ್ಕಾರ, ನೀವು ಹೇಗಿದ್ದೀರಿ?",
            phonetic: "Namaskara, neevu hegiddeeri?",
            english: "Hello, how are you?",
            context: "ಶುಭಾಶಯ ಕೋರುವಾಗ"
          },
          {
            id: "wp_2",
            kannada: "ದಯವಿಟ್ಟು ನನಗೆ ಸ್ವಲ್ಪ ಸಹಾಯ ಮಾಡಿ",
            phonetic: "Dayavittu nanage swalpa sahaaya maadi",
            english: "Please help me a little",
            context: "ಸಹಾಯ ಕೋರುವಾಗ"
          },
          {
            id: "wp_3",
            kannada: "ತುಂಬಾ ಧನ್ಯವಾದಗಳು",
            phonetic: "Tumba dhanyavaadagalu",
            english: "Thank you very much",
            context: "ಕೃತಜ್ಞತೆ ಹೇಳುವಾಗ"
          }
        ]
      },
      {
        id: "emergency",
        nameKannada: "ತುರ್ತು ಪರಿಸ್ಥಿತಿ",
        nameEnglish: "Emergency",
        icon: "🚨",
        phrases: [
          {
            id: "em_1",
            kannada: "ತಕ್ಷಣ ೧೦೮ ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗೆ ಕರೆ ಮಾಡಿ",
            phonetic: "Takshana 108 ambulance-ge kare maadi",
            english: "Call 108 ambulance immediately",
            context: "ತುರ್ತು ವೈದ್ಯಕೀಯ ಸಂದರ್ಭದಲ್ಲಿ"
          },
          {
            id: "em_2",
            kannada: "ಇಲ್ಲಿ ಅಪಘಾತವಾಗಿದೆ, ಸಹಾಯ ಬೇಕು",
            phonetic: "Illi apaghaatavaagide, sahaaya beku",
            english: "An accident has occurred here, need help",
            context: "ರಸ್ತೆ ಅಪಘಾತದ ಸಮಯದಲ್ಲಿ"
          }
        ]
      }
    ]
  };

  async function loadLearnPhrases() {
    if (state.useBackendApi) {
      try {
        const res = await fetch('/api/learn-phrases');
        if (res.ok) {
          const data = await res.json();
          if (data && data.categories && data.categories.length > 0) {
            state.learnPhrasesData = data;
            return data;
          }
        }
      } catch (e) {
        console.warn('Failed to load learn phrases from backend:', e);
      }
    }
    state.learnPhrasesData = FALLBACK_LEARN_DATA;
    return FALLBACK_LEARN_DATA;
  }

  async function showLearnKannadaModal() {
    const modal = document.getElementById('learn-kannada-modal');
    if (!modal) return;

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');

    if (!state.learnPhrasesData) {
      await loadLearnPhrases();
    }

    renderLearnCategories();
    HealioSpeech.playChime('dwell_complete');
    HealioSpeech.speak('ದೈನಂದಿನ ಜೀವನದಲ್ಲಿ ಕನ್ನಡ ಕಲಿಕೆ ಕೇಂದ್ರಕ್ಕೆ ಸುಸ್ವಾಗತ.');
  }

  function hideLearnKannadaModal() {
    const modal = document.getElementById('learn-kannada-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    }
    state.activePracticePhrase = null;
    const fb = document.getElementById('voice-practice-feedback');
    if (fb) fb.style.display = 'none';
  }

  function renderLearnCategories() {
    const tabsContainer = document.getElementById('learn-categories-tabs');
    if (!tabsContainer || !state.learnPhrasesData) return;

    tabsContainer.innerHTML = '';
    const categories = state.learnPhrasesData.categories || [];

    if (!state.selectedLearnCategoryId && categories.length > 0) {
      state.selectedLearnCategoryId = categories[0].id;
    }

    categories.forEach(cat => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = `learn-category-tab dwell-btn ${state.selectedLearnCategoryId === cat.id ? 'active' : ''}`;
      tab.innerHTML = `<span>${cat.icon}</span> <span>${cat.nameKannada}</span> <span style="font-size:12px; opacity:0.85;">(${cat.nameEnglish})</span>`;
      tab.addEventListener('click', () => {
        state.selectedLearnCategoryId = cat.id;
        renderLearnCategories();
        renderLearnPhrases(cat);
      });
      tabsContainer.appendChild(tab);
    });

    const activeCat = categories.find(c => c.id === state.selectedLearnCategoryId) || categories[0];
    if (activeCat) {
      renderLearnPhrases(activeCat);
    }
  }

  function renderLearnPhrases(category) {
    const container = document.getElementById('learn-phrases-container');
    if (!container) return;

    container.innerHTML = '';
    const phrases = category.phrases || [];

    phrases.forEach(phrase => {
      const card = document.createElement('div');
      card.className = 'learn-phrase-card';

      card.innerHTML = `
        <div class="learn-kannada-text">${phrase.kannada}</div>
        <div class="learn-phonetic-text">🗣️ ಉಚ್ಚಾರಣೆ (Pronunciation): ${phrase.phonetic}</div>
        <div class="learn-english-text">📖 ಅರ್ಥ (Meaning): ${phrase.english}</div>
        <div class="learn-context-text">💡 ಸಂದರ್ಭ (Context): ${phrase.context}</div>
        <div class="learn-phrase-actions">
          <button type="button" class="btn-secondary phrase-action-btn dwell-btn listen-phrase-btn" aria-label="ಕನ್ನಡ ಉಚ್ಚಾರಣೆ ಕೇಳಿ: ${phrase.kannada}">
            🔊 ಉಚ್ಚಾರಣೆ ಕೇಳಿ (Listen)
          </button>
          <button type="button" class="btn-primary phrase-action-btn dwell-btn practice-phrase-btn" style="background:#0d9488;" aria-label="ಧ್ವನಿ ಅಭ್ಯಾಸ ಮಾಡಿ: ${phrase.kannada}">
            🎙️ ಮಾತನಾಡಿ ಅಭ್ಯಾಸ ಮಾಡಿ (Practice)
          </button>
        </div>
      `;

      // Listen action
      const listenBtn = card.querySelector('.listen-phrase-btn');
      listenBtn.addEventListener('click', () => {
        HealioSpeech.stopSpeaking();
        HealioSpeech.speak(phrase.kannada);
      });

      // Voice Practice action
      const practiceBtn = card.querySelector('.practice-phrase-btn');
      practiceBtn.addEventListener('click', () => {
        startPhrasePractice(phrase);
      });

      container.appendChild(card);
    });

    setupDwellHandlers();
  }

  function startPhrasePractice(phrase) {
    state.activePracticePhrase = phrase;

    const fb = document.getElementById('voice-practice-feedback');
    const spokenEl = document.getElementById('voice-practice-spoken-text');
    const resultEl = document.getElementById('voice-practice-result-text');

    if (fb) fb.style.display = 'block';
    if (spokenEl) spokenEl.textContent = `ಅಭ್ಯಾಸ ವಾಕ್ಯ: "${phrase.kannada}"`;
    if (resultEl) resultEl.innerHTML = `🎙️ ಈಗ ನಿಮ್ಮ ಸರದಿ! ದಯವಿಟ್ಟು ಮೇಲಿನ ವಾಕ್ಯವನ್ನು ಕನ್ನಡದಲ್ಲಿ ಗಟ್ಟಿಯಾಗಿ ಹೇಳಿ...`;

    HealioSpeech.stopSpeaking();
    HealioSpeech.speak('ದಯವಿಟ್ಟು ಈ ವಾಕ್ಯವನ್ನು ಗಟ್ಟಿಯಾಗಿ ಹೇಳಿ: ' + phrase.kannada, () => {
      HealioSpeech.startListening();
    });
  }

  function evaluatePracticeSpeech(spokenText) {
    if (!state.activePracticePhrase) return false;

    const target = state.activePracticePhrase.kannada;
    const cleanSpoken = KannadaNLP.normalizeText(spokenText);
    const cleanTarget = KannadaNLP.normalizeText(target);

    const dist = KannadaNLP.levenshteinDistance(cleanSpoken, cleanTarget);
    const maxLen = Math.max(cleanSpoken.length, cleanTarget.length);
    const similarity = maxLen > 0 ? (1 - dist / maxLen) : 0;

    const spokenEl = document.getElementById('voice-practice-spoken-text');
    const resultEl = document.getElementById('voice-practice-result-text');

    if (spokenEl) {
      spokenEl.innerHTML = `ನೀವು ಹೇಳಿದ್ದು: <strong style="color:var(--color-primary-dark);">"${cleanSpoken}"</strong>`;
    }

    if (cleanSpoken.includes(cleanTarget) || cleanTarget.includes(cleanSpoken) || similarity >= 0.6) {
      if (resultEl) {
        resultEl.innerHTML = `🌟 <span style="color:var(--color-success); font-weight:800;">ಅದ್ಭುತ! ಅತ್ಯುತ್ತಮ ಉಚ್ಚಾರಣೆ 👏 (Accurate Pronunciation!)</span>`;
      }
      HealioSpeech.playChime('success');
      HealioSpeech.speak('ಅದ್ಭುತ! ಸರಿಯಾದ ಉಚ್ಚಾರಣೆ.');
      state.activePracticePhrase = null;
      return true;
    } else {
      if (resultEl) {
        resultEl.innerHTML = `👍 <span style="color:#b45309; font-weight:700;">ಉತ್ತಮ ಪ್ರಯತ್ನ! (Good attempt) ಮತ್ತೊಮ್ಮೆ ಆಲಿಸಿ ಪ್ರಯತ್ನಿಸಿ.</span>`;
      }
      HealioSpeech.playChime('alert');
      HealioSpeech.speak('ಉತ್ತಮ ಪ್ರಯತ್ನ. ಮತ್ತೊಮ್ಮೆ ಕೇಳಿ ಪ್ರಯತ್ನಿಸಿ.');
      return false;
    }
  }

  function toggleLearningHelper() {
    state.learningHelperEnabled = !state.learningHelperEnabled;
    const btn = document.getElementById('learning-helper-toggle-btn');
    if (btn) {
      if (state.learningHelperEnabled) {
        btn.textContent = '💡 ಕಲಿಕೆ ಸಹಾಯಕ: ಆನ್ (Helper: ON)';
        btn.classList.add('active');
        btn.style.background = '#fef3c7';
        btn.style.borderColor = '#f59e0b';
        btn.style.color = '#92400e';
        showToast('ಕನ್ನಡ ಕಲಿಕೆ ಸಹಾಯಕ ಸಕ್ರಿಯಗೊಂಡಿದೆ! ಬಟನ್‌ಗಳ ಉಚ್ಚಾರಣೆ ಮತ್ತು ಅರ್ಥ ಗೋಚರಿಸುತ್ತದೆ.', 'success');
      } else {
        btn.textContent = '💡 ಕಲಿಕೆ ಸಹಾಯಕ: ಆಫ್';
        btn.classList.remove('active');
        btn.style.background = '';
        btn.style.borderColor = '#14b8a6';
        btn.style.color = '#0f766e';
        showToast('ಕನ್ನಡ ಕಲಿಕೆ ಸಹಾಯಕ ನಿಷ್ಕ್ರಿಯಗೊಂಡಿದೆ.', 'info');
      }
    }

    if (state.currentScreen === 'department') {
      renderDepartments();
    } else if (state.currentScreen === 'datetime') {
      renderDateTimeScreen();
    }
  }

  // -------------------------------------------------------------
  // 11. Automated Smoke Test (Runs Full Kannada Booking Flow)
  // -------------------------------------------------------------

  async function runSmokeTest() {
    showToast('ಸ್ವಯಂಚಾಲಿತ ಪರೀಕ್ಷೆ ಪ್ರಾರಂಭವಾಗುತ್ತಿದೆ...', 'info');
    HealioSpeech.speak('ಸ್ವಯಂಚಾಲಿತ ಪರೀಕ್ಷೆ ಶುರುವಾಗುತ್ತಿದೆ.');

    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    try {
      // Step 1: Welcome Screen
      setScreen('welcome');
      await delay(1200);

      // Step 2: Choose Mode
      setScreen('input_mode');
      setInputMode('button');
      await delay(1200);

      // Step 3: Identity Screen
      setScreen('identity');
      await delay(1200);

      // Step 4: Department Selection (Cardiology)
      setScreen('department');
      await delay(1200);
      selectDepartment(DEPARTMENTS[0]); // Cardiology
      await delay(1200);

      // Step 5: Date & Slot Selection
      const next7 = getNext7Days();
      state.selectedDate = next7[1]; // Tomorrow
      renderDateTimeScreen();
      await delay(1000);

      // Select first morning slot
      selectSlot(DEFAULT_SLOTS.morning[0]);
      await delay(1500);

      // Step 6: Confirmation Screen Reached
      showToast('ಬುಕಿಂಗ್ ಯಶಸ್ವಿಯಾಗಿದೆ! ನನ್ನ ಬುಕಿಂಗ್‌ಗಳಿಗೆ ಹೋಗಲಾಗುತ್ತಿದೆ...', 'success');
      await delay(2000);

      // Step 7: View Bookings
      setScreen('my_bookings');
      await delay(2000);

      // Step 8: Cancel the newly created booking to clean up
      if (state.bookings.length > 0) {
        const lastCreatedId = state.bookings[0].id;
        cancelBooking(lastCreatedId);
        showToast('ಪರೀಕ್ಷಾ ಬುಕಿಂಗ್ ಯಶಸ್ವಿಯಾಗಿ ರದ್ದುಗೊಂಡಿದೆ!', 'success');
      }

      await delay(1200);
      setScreen('welcome');
      HealioSpeech.playChime('success');
      showToast('ಸ್ವಯಂಚಾಲಿತ ಪರೀಕ್ಷೆ ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿದೆ! (ಎಲ್ಲಾ ಹಂತಗಳು ಸರಿ)', 'success');
      HealioSpeech.speak('ಪರೀಕ್ಷೆ ಯಶಸ್ವಿಯಾಗಿ ಮುಗಿದಿದೆ.');
    } catch (err) {
      console.error('Smoke test error:', err);
      showToast('ಪರೀಕ್ಷೆಯಲ್ಲಿ ದೋಷ ಕಂಡುಬಂದಿದೆ', 'error');
    }
  }

  // -------------------------------------------------------------
  // 11. App Initialization & Event Bindings
  // -------------------------------------------------------------

  function initApp() {
    loadSavedData();
    checkBackendAvailability();

    // 1. Initialize 3D Background
    const bgContainer = document.getElementById('scene-background');
    if (bgContainer && window.Healio3D) {
      Healio3D.init(bgContainer);
    }

    // 2. Setup Speech
    setupSpeechHandlers();

    // 3. Setup Keyboard Navigation
    setupKeyboardNavigation();

    // 4. Setup Voice Name & Age Buttons
    const voiceEnterNameBtn = document.getElementById('voice-enter-name-btn');
    if (voiceEnterNameBtn) {
      voiceEnterNameBtn.addEventListener('click', () => {
        startVoiceNameInput();
      });
    }

    const voiceEnterAgeBtn = document.getElementById('voice-enter-age-btn');
    if (voiceEnterAgeBtn) {
      voiceEnterAgeBtn.addEventListener('click', () => {
        startVoiceAgeInput();
      });
    }

    // 5. Bind Welcome Screen Buttons
    const speakAndBookBtn = document.getElementById('btn-welcome-speak');
    if (speakAndBookBtn) {
      speakAndBookBtn.addEventListener('click', () => {
        setInputMode('voice');
        setScreen('input_mode');
      });
    }

    const startManualBookingBtn = document.getElementById('btn-welcome-start');
    if (startManualBookingBtn) {
      startManualBookingBtn.addEventListener('click', () => {
        setScreen('input_mode');
      });
    }

    const myBookingsNavBtn = document.getElementById('nav-my-bookings-btn');
    if (myBookingsNavBtn) {
      myBookingsNavBtn.addEventListener('click', () => {
        setScreen('my_bookings');
      });
    }

    const backToHomeBtn = document.getElementById('nav-home-btn');
    if (backToHomeBtn) {
      backToHomeBtn.addEventListener('click', () => {
        setScreen('welcome');
      });
    }

    // Mode Buttons on screen-input_mode (Voice and Button only)
    const modeVoiceBtn = document.getElementById('btn-mode-voice');
    if (modeVoiceBtn) {
      modeVoiceBtn.addEventListener('click', () => {
        setInputMode('voice');
        setScreen('identity');
      });
    }
    const modeButtonBtn = document.getElementById('btn-mode-button');
    if (modeButtonBtn) {
      modeButtonBtn.addEventListener('click', () => {
        setInputMode('button');
        setScreen('identity');
      });
    }

    // Identity Screen Form Handlers
    const confirmIdentityBtn = document.getElementById('btn-confirm-identity');
    if (confirmIdentityBtn) {
      confirmIdentityBtn.addEventListener('click', () => {
        const nameInput = document.getElementById('patient-name-input');
        const ageInput = document.getElementById('patient-age-input');
        if (nameInput && nameInput.value.trim()) {
          state.patientName = nameInput.value.trim();
        }
        if (ageInput && ageInput.value.trim()) {
          state.patientAge = ageInput.value.trim();
        }
        HealioSpeech.playChime('dwell_complete');
        setScreen('department');
      });
    }

    // Quick Patient Name preset chips
    const nameChips = document.querySelectorAll('.name-chip-btn');
    nameChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.getAttribute('data-val');
        const input = document.getElementById('patient-name-input');
        if (input && val) {
          input.value = val;
          state.patientName = val;
          HealioSpeech.playChime('dwell_complete');
        }
      });
    });

    // Quick Patient Age preset chips
    const ageChips = document.querySelectorAll('.age-chip-btn');
    ageChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.getAttribute('data-val');
        const input = document.getElementById('patient-age-input');
        if (input && val) {
          input.value = val;
          state.patientAge = val;
          HealioSpeech.playChime('dwell_complete');
        }
      });
    });

    // Back buttons
    const backButtons = document.querySelectorAll('.btn-screen-back');
    backButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        goBack();
      });
    });

    // Confirm screen: New Booking & View Bookings
    const newBookingBtn = document.getElementById('btn-new-booking');
    if (newBookingBtn) {
      newBookingBtn.addEventListener('click', () => {
        state.selectedDepartment = null;
        state.selectedDate = null;
        state.selectedSlot = null;
        state.demoCode = generateDemoCode();
        setScreen('welcome');
      });
    }

    const viewMyBookingsBtn = document.getElementById('btn-view-my-bookings');
    if (viewMyBookingsBtn) {
      viewMyBookingsBtn.addEventListener('click', () => {
        setScreen('my_bookings');
      });
    }

    // Emergency Buttons (Header + Triggers)
    const emergencyTopBtn = document.getElementById('emergency-top-btn');
    if (emergencyTopBtn) {
      emergencyTopBtn.addEventListener('click', () => {
        showEmergencyModal();
      });
    }

    const closeEmergencyBtn = document.getElementById('emergency-close-btn');
    if (closeEmergencyBtn) {
      closeEmergencyBtn.addEventListener('click', () => {
        hideEmergencyModal();
      });
    }

    // Smoke Test Button
    const smokeTestBtn = document.getElementById('smoke-test-run-btn');
    if (smokeTestBtn) {
      smokeTestBtn.addEventListener('click', () => {
        runSmokeTest();
      });
    }

    // Learn Kannada Center Buttons
    const navLearnBtn = document.getElementById('nav-learn-kannada-btn');
    if (navLearnBtn) {
      navLearnBtn.addEventListener('click', () => {
        showLearnKannadaModal();
      });
    }

    const learnCloseBtn = document.getElementById('learn-modal-close-btn');
    if (learnCloseBtn) {
      learnCloseBtn.addEventListener('click', () => {
        hideLearnKannadaModal();
      });
    }

    const learnHelperToggleBtn = document.getElementById('learning-helper-toggle-btn');
    if (learnHelperToggleBtn) {
      learnHelperToggleBtn.addEventListener('click', () => {
        toggleLearningHelper();
      });
    }

    const closePracticeFbBtn = document.getElementById('close-practice-feedback-btn');
    if (closePracticeFbBtn) {
      closePracticeFbBtn.addEventListener('click', () => {
        const fb = document.getElementById('voice-practice-feedback');
        if (fb) fb.style.display = 'none';
        state.activePracticePhrase = null;
      });
    }

    // Initialize on Welcome Screen
    setScreen('welcome', { speakPrompt: false });
  }

  // Export globally for testing and inspection
  window.HealioApp = {
    init: initApp,
    state: state,
    setScreen: setScreen,
    runSmokeTest: runSmokeTest,
    cancelBooking: cancelBooking,
    showLearnKannadaModal: showLearnKannadaModal,
    hideLearnKannadaModal: hideLearnKannadaModal,
    toggleLearningHelper: toggleLearningHelper
  };

  // Launch on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
