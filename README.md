# Appointment Management System

This is a full-stack web application for managing patient and doctor appointments, built with the MERN stack (MongoDB, Express, React, Node.js) and styled with Tailwind CSS.

## Features

-   **Role-Based Access**: Separate login and signup flows for patients and doctors.
-   **Patient Signup**: New patients can create an account and book appointments.
-   **Doctor Seeding**: The database comes pre-loaded with sample doctor accounts for easy testing.
-   **Dynamic Time Slots**: Patients can book appointments in 15-minute intervals based on doctors' working hours.
-   **Automatic Lunch Break**: A lunch break from 1 PM to 2 PM is automatically enforced for all doctors.
-   **Real-Time Availability**: The system checks for existing appointments and only shows slots that are genuinely available, preventing double-booking.
-   **Doctor Dashboard**: Doctors can view their scheduled appointments and update their status (Pending, Approved, Completed, Cancelled).
-   **Patient Dashboard**: Patients can view their booked appointments and their current status.
-   **Modern UI**: A responsive, glassmorphism-themed interface built with Tailwind CSS.

## Getting Started

### Prerequisites

-   Node.js
-   npm
-   MongoDB Atlas account (or a local MongoDB instance)

### Backend Setup

1.  Navigate to the `backend` directory.
2.  Install dependencies: `npm install`
3.  Create a `.env` file in the `backend` directory with your MongoDB Atlas connection string:
    ```env
    MONGO_URI="mongodb+srv://<username>:<password>@<cluster-hostname>/<database-name>?retryWrites=true&w=majority"
    ```
4.  **Seed the database with doctor data**: `node seed.js`
5.  Start the server: `node server.js`

### Frontend Setup

1.  Navigate to the `frontend` directory.
2.  Install dependencies: `npm install`
3.  Start the development server: `npm start`

## Pre-loaded Doctor Accounts

You can use the following credentials to log in as a doctor. The password for all accounts is `Password123`.

| Name                 | Email                        | Specialization   | Working Hours |
| -------------------- | ---------------------------- | ---------------- | ------------- |
| Dr. Emily Carter     | `emily.carter@example.com`   | Cardiologist     | 09:00 - 17:00 |
| Dr. Benjamin Lee     | `benjamin.lee@example.com`   | Dermatologist    | 10:00 - 18:00 |
| Dr. Olivia Rodriguez | `olivia.rodriguez@example.com` | Pediatrician | 08:00 - 16:00 |

## How to Use

1.  **For Patients**:
    -   Sign up for a new account or log in.
    -   On the dashboard, select a doctor, a date, and an available time slot to book an appointment.
    -   View your upcoming appointments and their status.

2.  **For Doctors**:
    -   Log in with one of the provided doctor accounts.
    -   On the dashboard, view your scheduled appointments.
    -   Update the status of appointments as needed (e.g., from Pending to Approved).

## Technology Stack

-   **Frontend**: React, Tailwind CSS
-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB
-   **Authentication**: JWT (JSON Web Tokens)
