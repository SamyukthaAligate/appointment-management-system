# Appointment Management System

This is a full-stack web application for managing patient and doctor appointments, built with the MERN stack (MongoDB, Express, React, Node.js) and styled with Tailwind CSS.

## Features

-   **Role-Based Access**: Separate login and signup flows for patients and doctors.
-   **Patient Signup**: New patients can create an account.
-   **Doctor Seeding**: The database comes pre-loaded with sample doctor accounts for easy testing.
-   **Modern UI**: A responsive, glassmorphism-themed interface built with Tailwind CSS.

## Getting Started

### Prerequisites

-   Node.js
-   npm
-   MongoDB Atlas account (or a local MongoDB instance)

### Backend Setup

1.  Navigate to the `backend` directory.
2.  Install dependencies: `npm install`
3.  Create a `.env` file (or edit `server.js` and `seed.js`) with your MongoDB Atlas connection string.
4.  **Seed the database with doctor data**: `npm run seed`
5.  Start the server: `npm start`

### Frontend Setup

1.  Navigate to the `frontend` directory.
2.  Install dependencies: `npm install`
3.  Start the development server: `npm start`

## Pre-loaded Doctor Accounts

You can use the following credentials to log in as a doctor. The password for all accounts is `Password123`.

| Name                 | Email                        |
| -------------------- | ---------------------------- |
| Dr. Emily Carter     | `emily.carter@example.com`   |
| Dr. Benjamin Lee     | `benjamin.lee@example.com`   |
| Dr. Olivia Rodriguez | `olivia.rodriguez@example.com` |
