/**
 * HEALIO - Hands-free Hospital Appointment Booking System
 * Backend Server (Node.js REST API & Static File Server)
 * 
 * Features:
 * - RESTful Endpoints:
 *   - GET  /api/health
 *   - GET  /api/departments
 *   - GET  /api/slots?departmentId=...&date=...
 *   - GET  /api/bookings
 *   - POST /api/bookings
 *   - DELETE /api/bookings/:id
 *   - PUT  /api/bookings/:id/reschedule
 * - JSON File Persistence in `data/` directory
 * - Static file serving for HTML, CSS, JS with correct MIME types
 * - Zero external dependencies (uses standard Node.js modules)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const AVAILABILITY_FILE = path.join(DATA_DIR, 'availability.json');
const LEARN_PHRASES_FILE = path.join(DATA_DIR, 'learn_phrases.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// -------------------------------------------------------------
// Initial Seed Data (Kannada Departments & Doctors)
// -------------------------------------------------------------
const DEPARTMENTS = [
  {
    id: 'cardiology',
    kannadaName: 'ಹೃದಯ ವಿಭಾಗ',
    doctorName: 'ಡಾ. ರಮೇಶ್ ಕುಮಾರ್',
    icon: '❤️',
    description: 'ಎದೆ ನೋವು, ರಕ್ತದೊತ್ತಡ ಮತ್ತು ಹೃದಯ ತಪಾಸಣೆ'
  },
  {
    id: 'paediatrics',
    kannadaName: 'ಮಕ್ಕಳ ವಿಭಾಗ',
    doctorName: 'ಡಾ. ಅನಿತಾ ರಾವ್',
    icon: '👶',
    description: 'ಮಕ್ಕಳ ಜ್ವರ, ರೋಗನಿರೋಧಕ ಲಸಿಕೆ ಮತ್ತು ಆರೈಕೆ'
  },
  {
    id: 'orthopaedics',
    kannadaName: 'ಮೂಳೆ ವಿಭಾಗ',
    doctorName: 'ಡಾ. ಸುರೇಶ್ ಗೌಡ',
    icon: '🦴',
    description: 'ಕೀಲು ನೋವು, ಮೂಳೆ ಮುರಿತ ಮತ್ತು ಸಂಧಿವಾತ'
  },
  {
    id: 'ophthalmology',
    kannadaName: 'ಕಣ್ಣು ವಿಭಾಗ',
    doctorName: 'ಡಾ. ಪ್ರಿಯಾ ಶರ್ಮ',
    icon: '👁️',
    description: 'ದೃಷ್ಟಿ ಪರೀಕ್ಷೆ, ಕಣ್ಣಿನ ಪೊರೆ ಮತ್ತು ಕನ್ನಡಕ'
  },
  {
    id: 'general_medicine',
    kannadaName: 'ಸಾಮಾನ್ಯ ವೈದ್ಯ',
    doctorName: 'ಡಾ. ಮಂಜುನಾಥ್ ಕೆ.',
    icon: '🩺',
    description: 'ಜ್ವರ, ಶೀತ, ಮಧುಮೇಹ ಮತ್ತು ಸಾಮಾನ್ಯ ತಪಾಸಣೆ'
  }
];

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

// Kannada digits converter
const REVERSE_KANNADA_DIGIT_MAP = {
  '0': '೦', '1': '೧', '2': '೨', '3': '೩', '4': '೪',
  '5': '೫', '6': '೬', '7': '೭', '8': '೮', '9': '೯'
};

function asciiToKannadaDigits(str) {
  if (str === null || str === undefined) return '';
  return String(str).split('').map(ch => REVERSE_KANNADA_DIGIT_MAP[ch] || ch).join('');
}

function generateBookingRef() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return 'HL-' + asciiToKannadaDigits(String(num));
}

// -------------------------------------------------------------
// Database Helper Functions
// -------------------------------------------------------------
function readBookings() {
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const data = fs.readFileSync(BOOKINGS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading bookings file:', err);
  }
  return [];
}

function writeBookings(bookings) {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing bookings file:', err);
    return false;
  }
}

function readAvailability() {
  try {
    if (fs.existsSync(AVAILABILITY_FILE)) {
      const data = fs.readFileSync(AVAILABILITY_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading availability file:', err);
  }
  return {};
}

function writeAvailability(availability) {
  try {
    fs.writeFileSync(AVAILABILITY_FILE, JSON.stringify(availability, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing availability file:', err);
    return false;
  }
}

// Seed initial availability if empty
function initializeSeedData() {
  const availability = readAvailability();
  if (Object.keys(availability).length === 0) {
    // Pre-book a couple of slots to show availability filtering
    const today = new Date();
    const d1 = new Date(today);
    d1.setDate(today.getDate() + 1);
    const iso1 = `${d1.getFullYear()}-${String(d1.getMonth() + 1).padStart(2, '0')}-${String(d1.getDate()).padStart(2, '0')}`;
    
    availability[`cardiology_${iso1}_m1`] = true;
    availability[`paediatrics_${iso1}_a2`] = true;
    writeAvailability(availability);
  }

  // Pre-seed mock booking if empty
  const bookings = readBookings();
  if (bookings.length === 0) {
    const today = new Date();
    const d1 = new Date(today);
    d1.setDate(today.getDate() + 1);
    const iso1 = `${d1.getFullYear()}-${String(d1.getMonth() + 1).padStart(2, '0')}-${String(d1.getDate()).padStart(2, '0')}`;
    
    bookings.push({
      id: 'BK_1700000000000',
      refCode: 'HL-೪೨೮೫',
      patientName: 'ರಮೇಶ್ ಕುಮಾರ್',
      patientAge: '೩೫',
      department: DEPARTMENTS[0],
      date: {
        isoDate: iso1,
        weekdayKannada: 'ಸೋಮವಾರ',
        dateKannada: '೧೬',
        monthKannada: 'ಅಕ್ಟೋಬರ್',
        fullKannadaLabel: '೧೬ ಅಕ್ಟೋಬರ್, ಸೋಮವಾರ'
      },
      slot: DEFAULT_SLOTS.morning[0],
      createdAt: new Date().toISOString()
    });
    writeBookings(bookings);
  }
}

initializeSeedData();

// -------------------------------------------------------------
// MIME Types Dictionary
// -------------------------------------------------------------
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// -------------------------------------------------------------
// Request Helpers
// -------------------------------------------------------------
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) { // 1MB limit
        req.connection.destroy();
        reject(new Error('Request entity too large'));
      }
    });
    req.on('end', () => {
      try {
        if (!body) return resolve({});
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
  });
}

// -------------------------------------------------------------
// HTTP Request Handler
// -------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // -----------------------------------------------------------
  // REST API Endpoints
  // -----------------------------------------------------------

  // 1. GET /api/health
  if (method === 'GET' && pathname === '/api/health') {
    const bookings = readBookings();
    return sendJson(res, 200, {
      status: 'ok',
      service: 'HEALIO Kannada Hands-Free Booking API',
      timestamp: new Date().toISOString(),
      totalBookings: bookings.length
    });
  }

  // 2. GET /api/departments
  if (method === 'GET' && pathname === '/api/departments') {
    return sendJson(res, 200, {
      departments: DEPARTMENTS
    });
  }

  // 2b. GET /api/learn-phrases (Everyday Life Kannada Learning Center)
  if (method === 'GET' && pathname === '/api/learn-phrases') {
    try {
      if (fs.existsSync(LEARN_PHRASES_FILE)) {
        const raw = fs.readFileSync(LEARN_PHRASES_FILE, 'utf8');
        return sendJson(res, 200, JSON.parse(raw));
      }
    } catch (err) {
      console.error('Error reading learn phrases:', err);
    }
    return sendJson(res, 200, { categories: [] });
  }

  // 3. GET /api/slots?departmentId=...&date=...
  if (method === 'GET' && pathname === '/api/slots') {
    const departmentId = parsedUrl.query.departmentId;
    const isoDate = parsedUrl.query.date;

    if (!departmentId || !isoDate) {
      return sendJson(res, 400, { error: 'departmentId and date query parameters are required' });
    }

    const availability = readAvailability();

    const morning = DEFAULT_SLOTS.morning.map(slot => {
      const key = `${departmentId}_${isoDate}_${slot.id}`;
      return {
        ...slot,
        isBooked: Boolean(availability[key])
      };
    });

    const afternoon = DEFAULT_SLOTS.afternoon.map(slot => {
      const key = `${departmentId}_${isoDate}_${slot.id}`;
      return {
        ...slot,
        isBooked: Boolean(availability[key])
      };
    });

    return sendJson(res, 200, {
      departmentId,
      date: isoDate,
      slots: {
        morning,
        afternoon
      }
    });
  }

  // 4. GET /api/bookings
  if (method === 'GET' && pathname === '/api/bookings') {
    const bookings = readBookings();
    return sendJson(res, 200, { bookings });
  }

  // 5. POST /api/bookings (Create new appointment)
  if (method === 'POST' && pathname === '/api/bookings') {
    try {
      const body = await parseJsonBody(req);
      const { patientName, patientAge, patientDob, department, date, slot } = body;

      if (!patientName || !department || !date || !slot) {
        return sendJson(res, 400, { error: 'Missing required booking fields (patientName, department, date, slot)' });
      }

      const slotKey = `${department.id}_${date.isoDate}_${slot.id}`;
      const availability = readAvailability();

      // Check if slot already booked
      if (availability[slotKey]) {
        return sendJson(res, 409, { error: 'ಆಯ್ಕೆಮಾಡಿದ ಸಮಯದ ಸ್ಲಾಟ್ ಈಗಾಗಲೇ ಭರ್ತಿಯಾಗಿದೆ (Slot is already booked)' });
      }

      // Generate reference code
      const refCode = generateBookingRef();
      const newBooking = {
        id: 'BK_' + Date.now(),
        refCode,
        patientName: patientName.trim(),
        patientAge: (patientAge || patientDob || '೩೫').trim(),
        department,
        date,
        slot,
        createdAt: new Date().toISOString()
      };

      // Mark slot as booked
      availability[slotKey] = true;
      writeAvailability(availability);

      // Save booking
      const bookings = readBookings();
      bookings.unshift(newBooking);
      writeBookings(bookings);

      return sendJson(res, 201, {
        success: true,
        message: 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಯಶಸ್ವಿಯಾಗಿ ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ',
        booking: newBooking
      });
    } catch (err) {
      console.error('Error in POST /api/bookings:', err);
      return sendJson(res, 500, { error: 'ಬುಕಿಂಗ್ ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ (Server error creating booking)' });
    }
  }

  // 6. DELETE /api/bookings/:id (Cancel an appointment)
  if (method === 'DELETE' && pathname.startsWith('/api/bookings/')) {
    const bookingId = pathname.replace('/api/bookings/', '').trim();
    if (!bookingId) {
      return sendJson(res, 400, { error: 'Booking ID required' });
    }

    const bookings = readBookings();
    const index = bookings.findIndex(b => b.id === bookingId);

    if (index === -1) {
      return sendJson(res, 404, { error: 'ಬುಕಿಂಗ್ ಕಂಡುಬಂದಿಲ್ಲ (Booking not found)' });
    }

    const removed = bookings.splice(index, 1)[0];
    writeBookings(bookings);

    // Free up slot availability
    const slotKey = `${removed.department.id}_${removed.date.isoDate}_${removed.slot.id}`;
    const availability = readAvailability();
    delete availability[slotKey];
    writeAvailability(availability);

    return sendJson(res, 200, {
      success: true,
      message: `ಬುಕಿಂಗ್ ${removed.refCode} ಯಶಸ್ವಿಯಾಗಿ ರದ್ದುಗೊಂಡಿದೆ`,
      cancelledBooking: removed
    });
  }

  // 7. PUT /api/bookings/:id/reschedule (Reschedule an appointment)
  if (method === 'PUT' && pathname.includes('/reschedule')) {
    const match = pathname.match(/^\/api\/bookings\/([^\/]+)\/reschedule$/);
    if (!match) {
      return sendJson(res, 400, { error: 'Invalid reschedule route' });
    }

    const bookingId = match[1];
    try {
      const body = await parseJsonBody(req);
      const { department, date, slot } = body;

      if (!department || !date || !slot) {
        return sendJson(res, 400, { error: 'New department, date, and slot required' });
      }

      const bookings = readBookings();
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) {
        return sendJson(res, 404, { error: 'ಬುಕಿಂಗ್ ಕಂಡುಬಂದಿಲ್ಲ (Booking not found)' });
      }

      const availability = readAvailability();
      const newSlotKey = `${department.id}_${date.isoDate}_${slot.id}`;

      // If choosing a different slot, check if new slot is taken
      const oldSlotKey = `${booking.department.id}_${booking.date.isoDate}_${booking.slot.id}`;
      if (newSlotKey !== oldSlotKey && availability[newSlotKey]) {
        return sendJson(res, 409, { error: 'ಹೊಸ ಸ್ಲಾಟ್ ಈಗಾಗಲೇ ಭರ್ತಿಯಾಗಿದೆ (New slot is already booked)' });
      }

      // Free old slot
      delete availability[oldSlotKey];
      // Claim new slot
      availability[newSlotKey] = true;
      writeAvailability(availability);

      // Update booking object
      booking.department = department;
      booking.date = date;
      booking.slot = slot;
      booking.rescheduledAt = new Date().toISOString();
      writeBookings(bookings);

      return sendJson(res, 200, {
        success: true,
        message: 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಯಶಸ್ವಿಯಾಗಿ ಬದಲಿಸಲಾಗಿದೆ',
        booking
      });
    } catch (err) {
      console.error('Error in PUT /reschedule:', err);
      return sendJson(res, 500, { error: 'Server error rescheduling booking' });
    }
  }

  // -----------------------------------------------------------
  // Static File Server
  // -----------------------------------------------------------
  let safePath = pathname === '/' ? '/index.html' : pathname;
  // Prevent directory traversal attacks
  safePath = path.normalize(safePath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('೪೦೪: ಪುಟ ಅಥವಾ ಫೈಲ್ ಕಂಡುಬಂದಿಲ್ಲ (404 Not Found)');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🏥 HEALIO Backend Server Running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📁 Static files: Serving from ${__dirname}`);
  console.log(`💾 Data stored: ${DATA_DIR}`);
  console.log(`=======================================================`);
});
