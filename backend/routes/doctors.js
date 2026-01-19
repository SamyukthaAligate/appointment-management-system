
const router = require("express").Router();
const User = require("../models/User");

router.get("/", async (req, res) => {
  const doctors = await User.find({ role: "DOCTOR" }).select("_id name email");
  res.json(doctors);
});

module.exports = router;
