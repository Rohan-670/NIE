# ಕನ್ನಡ ದೈನಂದಿನ ಜೀವನದಲ್ಲಿ — Kannada in Everyday Life
### Hands-Free Hospital Appointment Booking & Real-World Kannada Learning System
**Project Objective:** *Solution that helps people learn and use Kannada in real-world settings such as travel, shopping, education, healthcare, transportation and workplaces.*

HEALIO is an accessible, voice- and button-driven hospital appointment booking web application built in **100% Kannada** with an integrated **"ದೈನಂದಿನ ಜೀವನದಲ್ಲಿ ಕನ್ನಡ (Kannada in Everyday Life)" Learning Companion** and a complete **Node.js REST backend**. While retaining the full hospital booking workflow (voice name & age input, department selection, scheduling, and 108 emergency handling), it enables learners and non-native speakers to understand, pronounce, and practice everyday Kannada phrases across healthcare, transit, shopping, workplaces, and education.

---

## 📁 File Structure

```text
d:\kannada\
├── server.js          # Node.js REST API & static file server (Zero external dependencies)
├── package.json       # Node.js project manifest & startup scripts
├── data/              # Persistent JSON database
│   ├── bookings.json  # Stored appointments and reference records
│   ├── availability.json # Real-time booked and available time slots
│   └── learn_phrases.json # Everyday life Kannada phrases (travel, hospital, shopping, work)
├── index.html         # Main single-page application (100% Kannada UI, all screens & flows)
├── style.css          # Mobile-first accessible styling, high contrast, WCAG AAA, dwell ring
├── nlp.js             # Rule-based Kannada NLP parser (intents, entities, voice name parsing)
├── speech.js          # Web Speech API (kn-IN recognition & synthesis), Web Audio chimes
├── scene3d.js         # Three.js (r128 pinned) 3D rotating medical cross & WebGL fallback
├── app.js             # Application controller, backend API sync, voice name input, dwell gaze
├── tests.html         # Standalone unit test suite (35 automated Kannada NLP test cases)
└── README.md          # Comprehensive documentation, run steps, and developer guide
```

---

## 🚀 How to Run the Project

### Option A: With the Node.js Backend Server (Recommended)
1. Open PowerShell or Terminal in the project directory:
   ```powershell
   cd d:\kannada
   node server.js
   # or
   npm start
   ```
2. Open your browser to:
   ```text
   http://localhost:3000
   ```
3. The application will connect directly to the REST backend, syncing appointments and slot availability in real time with `data/bookings.json`.

### Option B: Standalone File Mode (Zero Server / Offline)
* You can also simply double-click or open `index.html` directly in **Google Chrome** or **Microsoft Edge**.
* HEALIO automatically detects the absence of a server and falls back to local in-memory and `localStorage` persistence, ensuring the app remains 100% runnable without any server setup.

---

## 🛠️ Backend Architecture (`server.js`)

The backend is built with native Node.js (`http`, `fs`, `path`, `url`), requiring **zero `npm install`** and no external dependencies:
* **Static File Serving:** Serves `index.html`, `style.css`, `app.js`, `nlp.js`, `speech.js`, `scene3d.js`, and `tests.html` with correct MIME types and UTF-8 encoding.
* **REST API Endpoints:**
  * `GET  /api/health`: Health status, uptime, and database count.
  * `GET  /api/departments`: Returns list of the 5 hospital departments and specialist doctors.
  * `GET  /api/slots?departmentId=...&date=...`: Returns real-time morning and afternoon slot availability.
  * `GET  /api/bookings`: Returns all active appointments stored in `data/bookings.json`.
  * `POST /api/bookings`: Creates and validates a new appointment, generates a reference code (e.g. `HL-೪೨೮೫`), reserves the slot in `data/availability.json`, and saves the record.
  * `DELETE /api/bookings/:id`: Cancels an appointment, deletes the record, and automatically frees the time slot.
  * `PUT  /api/bookings/:id/reschedule`: Updates appointment date/slot, frees the previous slot, and reserves the new slot.

---

## 🎙️ Voice Patient Name & Age Entry (ಧ್ವನಿ ಮೂಲಕ ಹೆಸರು ಮತ್ತು ವಯಸ್ಸು)

Entering the patient's name and age is fully voice-enabled without requiring manual typing:
1. **Direct Spoken Name:** On the Identity verification screen (`ಗುರುತು ದೃಢೀಕರಣ`), a prominent Kannada banner instructs the user:
   * *"ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರನ್ನು ಧ್ವನಿ ಮೂಲಕ ಹೇಳಿ ಅಥವಾ ಕೆಳಗೆ ನಮೂದಿಸಿ"*
   * Patients can speak their name naturally:
     * *"ನನ್ನ ಹೆಸರು ರಮೇಶ್ ಕುಮಾರ್"* (My name is Ramesh Kumar)
     * *"ಹೆಸರು ಅನಿತಾ ಗೌಡ"* (Name is Anita Gowda)
     * *"ರೋಗಿಯ ಹೆಸರು ಸುರೇಶ್ ಹೆಗಡೆ"* (Patient name is Suresh Hegde)
     * Or simply speak their name: *"ಪ್ರವೀಣ್ ರಾವ್"*
2. **Dedicated Voice Name Button:** Patients can click **🎙️ ಧ್ವನಿ ಮೂಲಕ ಹೆಸರು ಹೇಳಿ** to activate voice capture:
   * The system prompts in Kannada: *"ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಹೇಳಿ."*
   * As soon as the patient speaks, the name appears instantly in the input field.
   * Text-to-speech acknowledges aloud: *"ಧನ್ಯವಾದಗಳು, ನಿಮ್ಮ ಹೆಸರು [ಹೆಸರು] ಎಂದು ದಾಖಲಾಗಿದೆ."*
3. **Voice Patient Age Entry (ವಯಸ್ಸು):**
   * Replaced Date of Birth with clear, simple **Age (ವಯಸ್ಸು)**.
   * Click **🎙️ ಧ್ವನಿ ಮೂಲಕ ವಯಸ್ಸು ಹೇಳಿ** or speak naturally:
     * *"ನನ್ನ ವಯಸ್ಸು ೪೫"* (My age is 45)
     * *"ವಯಸ್ಸು ೩೨ ವರ್ಷ"* (Age 32 years)
     * *"೩೫ ವರ್ಷ"* (35 years)
     * Spoken digits/numbers in context: *"೨೮"*
   * Includes quick one-tap age chips: **೨೦ ವರ್ಷ**, **೨೮ ವರ್ಷ**, **೩೫ ವರ್ಷ**, **೪೫ ವರ್ಷ**, **೬೦ ವರ್ಷ**.

---

## 🎯 Accessible Interaction Modes

To ensure the fastest, most reliable, and privacy-respecting user experience, HEALIO provides two dedicated interaction modes (complex eye gaze and camera tracking have been removed):

* **ಧ್ವನಿ (Voice Mode):**
  * Powered by the Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) configured with language `kn-IN`.
  * Real-time audio wave indicator, live transcript display, and an immediate **🛑 ನಿಲ್ಲಿಸಿ (Stop)** button.
  * Speech prompts speak aloud on every step with a **🔊 ಮತ್ತೆ ಕೇಳಿ (Listen Again)** replay button.
  * Understands natural Kannada commands for name, age, departments, dates, times, confirmation, rescheduling, and cancellation.
* **ಬಟನ್ (Big Button / Tap Mode):**
  * Extra-large, high-contrast touch targets (minimum 56px height, spacious padding) adhering to WCAG AA/AAA guidelines.
  * One-tap preset chips for quick patient name and age selection.
  * Ideal for senior citizens, patients with hand tremors, or noisy environments.
* **ಕೀಬೋರ್ಡ್ (Keyboard Accessibility):**
  * Full support for `Tab`, `Shift + Tab`, `Enter`, `Space`, and `Arrow Keys` (Left, Right, Up, Down).

---

## 🏥 5 Hospital Departments & Doctors

1. **ಹೃದಯ ವಿಭಾಗ (Cardiology):** ಡಾ. ರಮೇಶ್ ಕುಮಾರ್ (ಎದೆ ನೋವು, ರಕ್ತದೊತ್ತಡ ಮತ್ತು ಹೃದಯ ತಪಾಸಣೆ)
2. **ಮಕ್ಕಳ ವಿಭಾಗ (Paediatrics):** ಡಾ. ಅನಿತಾ ರಾವ್ (ಮಕ್ಕಳ ಜ್ವರ, ರೋಗನಿರೋಧಕ ಲಸಿಕೆ ಮತ್ತು ಆರೈಕೆ)
3. **ಮೂಳೆ ವಿಭಾಗ (Orthopaedics):** ಡಾ. ಸುರೇಶ್ ಗೌಡ (ಕೀಲು ನೋವು, ಮೂಳೆ ಮುರಿತ ಮತ್ತು ಸಂಧಿವಾತ)
4. **ಕಣ್ಣು ವಿಭಾಗ (Ophthalmology):** ಡಾ. ಪ್ರಿಯಾ ಶರ್ಮ (ದೃಷ್ಟಿ ಪರೀಕ್ಷೆ, ಕಣ್ಣಿನ ಪೊರೆ ಮತ್ತು ಕನ್ನಡಕ)
5. **ಸಾಮಾನ್ಯ ವೈದ್ಯ (General Medicine):** ಡಾ. ಮಂಜುನಾಥ್ ಕೆ. (ಜ್ವರ, ಶೀತ, ಮಧುಮೇಹ ಮತ್ತು ಸಾಮಾನ್ಯ ತಪಾಸಣೆ)

---

## 🚨 Emergency Protocol (ತುರ್ತು ಸಹಾಯ - ೧೦೮)

* Persistent high-visibility red button **🚨 ತುರ್ತು ಸಹಾಯ (೧೦೮)** in the header.
* Instant emergency detection: if speech or input contains emergency words such as:
  * **ಎದೆ ನೋವು** (chest pain)
  * **ಉಸಿರಾಡಲು ಕಷ್ಟ** (breathing difficulty)
  * **ರಕ್ತಸ್ರಾವ** (bleeding)
  * **ಹೃದಯಾಘಾತ** (heart attack)
  * **ಪ್ರಜ್ಞೆ ತಪ್ಪಿದೆ** (unconscious)
* The application immediately halts all booking flows, sounds an alert chime, and launches the full-screen emergency modal with a direct **📞 ೧೦೮ ಗೆ ಕರೆ ಮಾಡಿ** dialer link.

---

## 🧪 Testing

### 1. Automated Unit Test Suite (`tests.html`)
Open `tests.html` in Chrome, Edge, or Firefox to view the visual test runner. It executes **39 automated test cases** covering:
* All intents (`book`, `cancel`, `reschedule`, `yes`, `no`, `back`, `help`, `emergency`)
* Emergency medical keyword triggers (chest pain, breathing difficulty, bleeding, etc.)
* 5 medical department entities and synonyms
* Relative dates (`ಇಂದು`, `ನಾಳೆ`, `ನಾಡಿದ್ದು`) and weekday names
* Morning and afternoon time slots
* Kannada digits and spoken number words
* **Voice patient name extraction** (explicit prefixes, patient prefixes, dedicated context)
* **Voice patient age extraction** (explicit prefixes, year suffixes, direct numbers)
* Everyday Kannada phrases for health, travel, and public life
* Levenshtein distance typo resilience

Run tests headlessly in Node.js:
```powershell
node -e "
const NLP = require('./nlp.js');
console.log(NLP.parse('ನನ್ನ ಹೆಸರು ರಮೇಶ್ ಕುಮಾರ್ ವಯಸ್ಸು ೪೫'));
"
```

### 2. End-to-End Kannada Smoke Test
Inside `index.html`, click the **⚡ ಸ್ವಯಂಚಾಲಿತ ಪರೀಕ್ಷೆ (ಸ್ಮೋಕ್ ಟೆಸ್ಟ್)** button on the welcome screen (or call `window.HealioApp.runSmokeTest()` from the browser console).
This automatically steps through the entire user journey:
`ಸ್ವಾಗತ` ➔ `ಇನ್ಪುಟ ವಿಧಾನ` ➔ `ಗುರುತು ದೃಢೀಕರಣ (ಧ್ವನಿ ಹೆಸರು ಮತ್ತು ವಯಸ್ಸು)` ➔ `ವಿಭಾಗ (ಹೃದಯ)` ➔ `ದಿನಾಂಕ ಮತ್ತು ಸಮಯ` ➔ `ದೃಢೀಕರಣ` ➔ `ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು` ➔ `ರದ್ದು ಮಾಡಿ` ➔ `ಮುಕ್ತಾಯ`.

---

## 🌐 Browser Support & Performance

| Feature | Chrome / Edge | Firefox | Safari | Fallback / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Kannada UI & Buttons** | ✅ Full | ✅ Full | ✅ Full | Standard HTML5/CSS3 |
| **Node.js REST Backend** | ✅ Full | ✅ Full | ✅ Full | `node server.js` on port 3000 |
| **Voice Name & Age Input**| ✅ Full | ⚠️ Buttons fallback | ⚠️ Buttons fallback | Quick preset chips & text input |
| **Speech Recognition (`kn-IN`)**| ✅ Supported | ⚠️ Buttons fallback | ⚠️ Buttons fallback | Clean notice, buttons work 100% |
| **Speech Synthesis (`kn-IN`)** | ✅ Supported | ✅ Supported | ✅ Supported | Browser Kannada/Indian voice |
| **Everyday Kannada Learning Center** | ✅ Full | ✅ Full | ✅ Full | Audio pronunciation & voice practice |
| **Three.js 3D Background** | ✅ WebGL | ✅ WebGL | ✅ WebGL | Flat CSS gradient if WebGL disabled |

---

## ⚠️ Known Limitations

1. **Web Speech API in Firefox/Brave:** The Web Speech API `SpeechRecognition` implementation in desktop Firefox or Brave is disabled by default. In these browsers, HEALIO gracefully alerts the user in Kannada and transitions seamlessly to preset button / dwell selection.
2. **Offline Speech Recognition:** Chrome uses Google's cloud speech engine for `kn-IN` recognition. If internet connectivity is interrupted, speech recognition will pause, while buttons, dwell hover, and the Node.js backend continue working offline.
