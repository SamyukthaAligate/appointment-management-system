
const router = require("express").Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User"); // Needed for role checks

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

// @route   GET /api/appointments/slots/:doctorId/:date
// @desc    Get available time slots for a doctor on a specific date
// @access  Private
router.get("/slots/:doctorId/:date", async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    // Find the doctor to get working hours
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'DOCTOR') {
      return res.status(404).json({ message: "Doctor not found." });
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
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching available slots.", error });
  }
});

// @route   POST /api/appointments
// @desc    Book a new appointment
// @access  Private (Patients only)
router.post("/", async (req, res) => {
  // Patients can only book appointments for themselves
  if (req.user.role !== "PATIENT") {
    return res.status(403).json({ message: "Forbidden: Only patients can book appointments." });
  }

  try {
    const { doctor, date, timeSlot } = req.body;

    // Prevent booking if an appointment is already approved for this slot
    const existingAppointment = await Appointment.findOne({
      doctor,
      date,
      timeSlot,
      status: 'APPROVED',
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is no longer available. Please select another time.' });
    }

    const newAppointment = new Appointment({
      patient: req.user.id, // Set patient from authenticated user
      doctor,
      date,
      timeSlot,
    });

    const savedAppointment = await newAppointment.save();
    res.status(201).json(savedAppointment);
  } catch (error) {
    if (error.code === 11000) { // Handle duplicate key error for unique index
      return res.status(400).json({ message: "This time slot is already booked for the selected doctor." });
    }
    res.status(500).json({ message: "Server error while booking appointment.", error });
  }
});

// @route   GET /api/appointments
// @desc    Get appointments for the logged-in user
// @access  Private
router.get("/", async (req, res) => {
  try {
    let appointments;
    if (req.user.role === "DOCTOR") {
      appointments = await Appointment.find({ doctor: req.user.id }).populate("patient", "name email");
    } else if (req.user.role === "PATIENT") {
      appointments = await Appointment.find({ patient: req.user.id }).populate("doctor", "name email");
    } else {
      return res.status(403).json({ message: "Forbidden: Invalid role." });
    }
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching appointments.", error });
  }
});

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status
// @access  Private (Doctors only)
router.put("/:id/status", async (req, res) => {
  if (req.user.role !== "DOCTOR") {
    return res.status(403).json({ message: "Forbidden: Only doctors can update appointment status." });
  }

  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    // Ensure the doctor updating the appointment is the one assigned to it
    if (appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: You are not authorized to update this appointment." });
    }

    // Business rule: Patients cannot cancel an appointment once it is Approved.
    // This check is implicitly handled by role check, but an explicit check is good practice.
    if (appointment.status === "APPROVED" && status === "CANCELLED") {
        // A patient might try to call this endpoint, but the role check prevents it.
        // This logic is more for a patient-facing cancel route, but we keep it here for robustness.
        return res.status(400).json({ message: "Cannot cancel an already approved appointment." });
    }

    // Business rule: Doctors cannot approve overlapping appointments
    if (status === "APPROVED") {
      const conflictingAppointment = await Appointment.findOne({
        doctor: appointment.doctor,
        date: appointment.date,
        timeSlot: appointment.timeSlot,
        status: "APPROVED",
        _id: { $ne: appointment._id } // Exclude the current appointment from the check
      });

      if (conflictingAppointment) {
        return res.status(400).json({ message: "Cannot approve this appointment as it conflicts with another approved appointment at the same time." });
      }
    }

    appointment.status = status;
    const updatedAppointment = await appointment.save();
    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: "Server error while updating appointment status.", error });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Cancel an appointment (Patients only)
// @access  Private (Patients only)
router.delete("/:id", async (req, res) => {
  // Only patients can cancel their own appointments
  if (req.user.role !== "PATIENT") {
    return res.status(403).json({ message: "Forbidden: Only patients can cancel appointments." });
  }

  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    // Ensure the patient cancelling the appointment is the one who booked it
    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: You can only cancel your own appointments." });
    }

    // Business rule: Patients cannot cancel an appointment once it is Approved
    if (appointment.status === "APPROVED") {
      return res.status(400).json({ message: "Cannot cancel an already approved appointment. Please contact the doctor." });
    }

    // Business rule: Cannot cancel completed appointments
    if (appointment.status === "COMPLETED") {
      return res.status(400).json({ message: "Cannot cancel a completed appointment." });
    }

    appointment.status = "CANCELLED";
    const cancelledAppointment = await appointment.save();
    res.json({ message: "Appointment cancelled successfully.", appointment: cancelledAppointment });
  } catch (error) {
    res.status(500).json({ message: "Server error while cancelling appointment.", error });
  }
});

module.exports = router;
