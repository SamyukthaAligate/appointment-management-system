
const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: String,
  timeSlot: String,
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "COMPLETED", "CANCELLED"],
    default: "PENDING"
  }
});

AppointmentSchema.index({ doctor: 1, date: 1, timeSlot: 1 }, { unique: true });
AppointmentSchema.index({ patient: 1 });
AppointmentSchema.index({ doctor: 1 });

module.exports = mongoose.model("Appointment", AppointmentSchema);
