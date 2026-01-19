
const router = require("express").Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User"); // Needed for role checks

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

module.exports = router;
