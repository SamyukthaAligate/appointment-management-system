# Appointment Management System

A full-stack web application for managing patient and doctor appointments, built with the MERN stack (MongoDB, Express, React, Node.js) and styled with Tailwind CSS.

## 🏗️ Architecture Overview

The system follows a role-based architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (Express)     │◄──►│  (MongoDB)      │
│                 │    │                 │    │                 │
│ - User Auth     │    │ - JWT Auth      │    │ - Users         │
│ - Dashboard     │    │ - API Routes    │    │ - Appointments  │
│ - Forms         │    │ - Validation    │    │ - Timestamps    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## ✨ Features

### Core Functionality
- **Role-Based Access**: Separate authentication and authorization for patients and doctors
- **Patient Management**: Complete patient registration, appointment booking, and cancellation
- **Doctor Management**: Doctor dashboard with appointment status management
- **Real-Time Availability**: Dynamic slot availability checking to prevent double-booking
- **Smart Scheduling**: 15-minute appointment intervals with automatic lunch break enforcement

### Enhanced Features (Recently Added)
- **Patient Cancellation**: Patients can cancel pending appointments with business logic validation
- **Advanced Form Validation**: Real-time client-side validation with specific error messages
- **Loading States**: Comprehensive loading indicators and disabled button states
- **Error Handling**: Global error boundary for better user experience
- **Database Timestamps**: Automatic createdAt and updatedAt tracking
- **Professional UI**: Enhanced status badges with color-coded states

### Security & Performance
- **JWT Authentication**: Secure token-based authentication with proper header handling
- **Input Validation**: Both client-side and server-side validation
- **Error Boundaries**: Prevents app crashes with graceful error handling
- **Environment Configuration**: Secure environment variable management

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account or local MongoDB instance

### Environment Setup

1. **Copy the environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Configure your environment variables** in the `.env` file:
   ```env
   MONGO_URI=mongodb://localhost:27017/appointment-management
   JWT_SECRET=your_super_secret_key_change_this_in_production
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   ```

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Seed the database with doctor data:
   ```bash
   node seed.js
   ```

4. Start the server:
   ```bash
   node server.js
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/signup` | Register new user | Public |
| POST | `/api/auth/login` | Authenticate user | Public |

### Appointment Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/appointments` | Get user appointments | Private |
| POST | `/api/appointments` | Book new appointment | Patients |
| DELETE | `/api/appointments/:id` | Cancel appointment | Patients |
| PUT | `/api/appointments/:id/status` | Update appointment status | Doctors |
| GET | `/api/appointments/slots/:doctorId/:date` | Get available slots | Private |

### Doctor Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/doctors` | Get all doctors | Private |

## 👥 Pre-loaded Doctor Accounts

Use these credentials to test the doctor functionality. Password for all accounts: `Password123`

| Name | Email | Specialization | Working Hours |
|------|-------|----------------|---------------|
| Dr. Emily Carter | `emily.carter@example.com` | Cardiologist | 09:00 - 17:00 |
| Dr. Benjamin Lee | `benjamin.lee@example.com` | Dermatologist | 10:00 - 18:00 |
| Dr. Olivia Rodriguez | `olivia.rodriguez@example.com` | Pediatrician | 08:00 - 16:00 |

## 📖 Usage Guide

### For Patients

1. **Registration**: Create a new account with email and password
2. **Login**: Authenticate with your credentials
3. **Book Appointment**: 
   - Select a doctor from the available list
   - Choose a date (past dates are disabled)
   - Pick an available time slot
   - Confirm booking
4. **Manage Appointments**: View all appointments and cancel pending ones

### For Doctors

1. **Login**: Use provided doctor credentials
2. **View Schedule**: See all patient appointments with status
3. **Update Status**: Change appointment status (Pending → Approved → Completed/Cancelled)

## 🔧 Business Logic

### Appointment Rules
- Patients can only cancel appointments with `PENDING` status
- Approved appointments cannot be cancelled by patients
- Doctors cannot approve overlapping appointments
- Each time slot is unique per doctor per day
- Lunch break (1 PM - 2 PM) is automatically excluded

### Validation Rules
- Email must be valid format
- Password must be at least 6 characters with uppercase, lowercase, and number
- Appointment dates cannot be in the past
- All form fields are required

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Git**: Version control

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Ensure MongoDB is running
   - Check `MONGO_URI` in `.env` file
   - Verify network connectivity

2. **Authentication Issues**:
   - Clear browser localStorage
   - Check JWT_SECRET is set
   - Verify token expiration (1 hour)

3. **CORS Errors**:
   - Ensure `FRONTEND_URL` is correctly set
   - Check backend CORS configuration

4. **Port Conflicts**:
   - Change PORT in `.env` if 5000 is occupied
   - Update frontend API URL accordingly

### Development Tips

- Use the browser DevTools to monitor API calls
- Check the Network tab for failed requests
- Console logs show detailed error information
- Use MongoDB Compass to inspect database state

## 🚀 Deployment

### Environment Variables for Production
```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=<strong-random-string>
PORT=5000
FRONTEND_URL=https://your-domain.com
```

### Build Commands
```bash
# Frontend production build
cd frontend && npm run build

# Backend production start
cd backend && npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review the API documentation
- Create an issue in the repository

---

**Note**: This application is for demonstration purposes. For production use, ensure proper security measures, database indexing, and performance optimization.
