const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const User = require('./models/User');

// Connect to MongoDB
let cached = global.mongo;
if (!cached) {
  cached = global.mongo = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  
  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    
    cached.promise = mongoose.connect(process.env.MONGO_URI, opts);
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}

// JWT middleware
const jwt = require('jsonwebtoken');
const JWT_SECRET = "your_super_secret_key_change_this";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

// Helper function to generate time slots
const generateTimeSlots = (workingHours, date) => {
  const slots = [];
  const { start, end } = workingHours;
  
  const startTime = new Date(`${date}T${start}:00`);
  const endTime = new Date(`${date}T${end}:00`);
  
  // Define lunch break
  const lunchStart = new Date(`${date}T13:00:00`);
  const lunchEnd = new Date(`${date}T14:00:00`);

  let currentTime = new Date(startTime);

  while (currentTime < endTime) {
    // Skip lunch break
    if (currentTime >= lunchStart && currentTime < lunchEnd) {
      currentTime.setMinutes(currentTime.getMinutes() + 15);
      continue;
    }
    
    slots.push(new Date(currentTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    currentTime.setMinutes(currentTime.getMinutes() + 15);
  }

  return slots;
};

module.exports = async (req, res) => {
  await connectToDatabase();
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    // Apply authentication middleware
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;

    const { path } = req;
    
    // GET /api/appointments/slots/:doctorId/:date
    if (req.method === 'GET' && path.includes('/slots/')) {
      const pathParts = path.split('/');
      const doctorId = pathParts[3];
      const date = pathParts[4];

      // Find the doctor to get working hours
      const doctor = await User.findById(doctorId);
      if (!doctor || doctor.role !== 'DOCTOR') {
        return res.status(404).json({ message: "Doctor not found. Please select a valid doctor." });
      }

      // Validate date format and ensure it's not in the past
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isNaN(selectedDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format. Please select a valid date." });
      }
      
      if (selectedDate < today) {
        return res.status(400).json({ message: "Cannot book appointments for past dates. Please select a future date." });
      }

      // Generate all possible slots for the day
      const allSlots = generateTimeSlots(doctor.workingHours, date);

      // Find all booked appointments for that doctor and date
      const bookedAppointments = await Appointment.find({
        doctor: doctorId,
        date,
        status: { $in: ['PENDING', 'APPROVED'] }
      }).select('timeSlot');

      const bookedSlots = bookedAppointments.map(appt => appt.timeSlot);

      // Filter out booked slots
      const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

      res.json(availableSlots);
    }
    
    // GET /api/appointments
    else if (req.method === 'GET' && path === '/api/appointments') {
      let appointments;
      if (req.user.role === "DOCTOR") {
        appointments = await Appointment.find({ doctor: req.user.id }).populate("patient", "name email");
      } else if (req.user.role === "PATIENT") {
        appointments = await Appointment.find({ patient: req.user.id }).populate("doctor", "name email");
      } else {
        return res.status(403).json({ message: "Forbidden: Invalid role." });
      }
      res.json(appointments);
    }
    
    // POST /api/appointments
    else if (req.method === 'POST' && path === '/api/appointments') {
      if (req.user.role !== "PATIENT") {
        return res.status(403).json({ message: "Forbidden: Only patients can book appointments." });
      }

      const { doctor, date, timeSlot } = req.body;

      // Validate input
      if (!doctor || !date || !timeSlot) {
        return res.status(400).json({ message: "All fields are required: doctor, date, and time slot." });
      }

      // Validate date format and ensure it's not in the past
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isNaN(selectedDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format. Please select a valid date." });
      }
      
      if (selectedDate < today) {
        return res.status(400).json({ message: "Cannot book appointments for past dates. Please select a future date." });
      }

      // Verify doctor exists
      const doctorExists = await User.findById(doctor);
      if (!doctorExists || doctorExists.role !== 'DOCTOR') {
        return res.status(400).json({ message: "Invalid doctor selected. Please choose a valid doctor." });
      }

      // Prevent booking if an appointment is already approved for this slot
      const existingAppointment = await Appointment.findOne({
        doctor,
        date,
        timeSlot,
        status: 'APPROVED',
      });

      if (existingAppointment) {
        return res.status(400).json({ message: 'This time slot is already approved and booked. Please select another time.' });
      }

      const newAppointment = new Appointment({
        patient: req.user.id,
        doctor,
        date,
        timeSlot,
      });

      const savedAppointment = await newAppointment.save();
      res.status(201).json(savedAppointment);
    }
    
    // PUT /api/appointments/:id/status
    else if (req.method === 'PUT' && path.includes('/status')) {
      if (req.user.role !== "DOCTOR") {
        return res.status(403).json({ message: "Forbidden: Only doctors can update appointment status." });
      }

      const appointmentId = path.split('/')[2];
      const { status } = req.body;
      
      const appointment = await Appointment.findById(appointmentId);

      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found." });
      }

      // Ensure the doctor updating the appointment is the one assigned to it
      if (appointment.doctor.toString() !== req.user.id) {
        return res.status(403).json({ message: "You are not authorized to update this appointment. Only the assigned doctor can make changes." });
      }

      appointment.status = status;
      const updatedAppointment = await appointment.save();
      res.json(updatedAppointment);
    }
    
    // DELETE /api/appointments/:id
    else if (req.method === 'DELETE') {
      if (req.user.role !== "PATIENT") {
        return res.status(403).json({ message: "Forbidden: Only patients can cancel appointments." });
      }

      const appointmentId = path.split('/')[2];
      const appointment = await Appointment.findById(appointmentId);

      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found." });
      }

      // Ensure the patient cancelling the appointment is the one who booked it
      if (appointment.patient.toString() !== req.user.id) {
        return res.status(403).json({ message: "You can only cancel your own appointments." });
      }

      // Business rule: Patients cannot cancel an appointment once it is Approved
      if (appointment.status === "APPROVED") {
        return res.status(400).json({ message: "Cannot cancel an approved appointment. Please contact the doctor directly." });
      }

      // Business rule: Cannot cancel completed appointments
      if (appointment.status === "COMPLETED") {
        return res.status(400).json({ message: "Cannot cancel a completed appointment." });
      }

      appointment.status = "CANCELLED";
      const cancelledAppointment = await appointment.save();
      res.json({ message: "Appointment cancelled successfully.", appointment: cancelledAppointment });
    }
    
  } catch (error) {
    console.error('Appointment error:', error);
    res.status(500).json({ message: "Unable to process appointment request. Please try again later." });
  }
};
