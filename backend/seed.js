const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const doctors = [
  {
    name: "Dr. Emily Carter",
    email: "emily.carter@example.com",
    password: "Password123",
    role: "DOCTOR",
  },
  {
    name: "Dr. Benjamin Lee",
    email: "benjamin.lee@example.com",
    password: "Password123",
    role: "DOCTOR",
  },
  {
    name: "Dr. Olivia Rodriguez",
    email: "olivia.rodriguez@example.com",
    password: "Password123",
    role: "DOCTOR",
  },
];

const seedDatabase = async () => {
  try {
    // Connect to the database
    await mongoose.connect("mongodb+srv://samyukthaaligate_db_user:your_password_here@cluster0.4lebjsf.mongodb.net/?appName=Cluster0");

    // Clear existing doctors to prevent duplicates
    await User.deleteMany({ role: "DOCTOR" });
    console.log("Cleared existing doctor data.");

    // Hash passwords and create new doctor users
    const createdDoctors = await Promise.all(
      doctors.map(async (doctor) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(doctor.password, salt);
        return new User({ ...doctor, password: hashedPassword });
      })
    );

    // Save new doctors to the database
    await User.insertMany(createdDoctors);
    console.log("Database seeded with doctor data!");

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Disconnect from the database
    mongoose.connection.close();
  }
};

seedDatabase();
