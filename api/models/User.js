
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["PATIENT", "DOCTOR"], required: true },
  specialization: { type: String, default: null },
  workingHours: {
    start: { type: String, default: "09:00" }, // e.g., "09:00"
    end: { type: String, default: "17:00" },   // e.g., "17:00"
  },
  availableTimings: { type: [String], default: [] }
});

UserSchema.index({ role: 1 });

module.exports = mongoose.model("User", UserSchema);
