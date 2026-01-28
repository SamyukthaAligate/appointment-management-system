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
│ - Error Boundary│    │ - Error Handling│    │ - Indexes       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow Diagram

```
Patient/Doctor ──► Login/Signup ──► JWT Token ──► Dashboard
     │                                              │
     ▼                                              ▼
Book Appointment ──► Check Availability ──► Save to DB
     │                                              │
     ▼                                              ▼
Update Status ──► Business Logic Validation ──► Update DB
     │                                              │
     ▼                                              ▼
Real-time UI Updates ◄─── WebSocket-like Updates ◄─── DB Changes
```

### Key Architectural Decisions

1. **Centralized API Service**: All HTTP requests go through a unified `api.js` service
2. **JWT Token Management**: Automatic token refresh and expiration handling
3. **Error Boundary Pattern**: Prevents app crashes with graceful fallbacks
4. **Role-Based Authorization**: Middleware-based access control
5. **Real-time Validation**: Both client-side and server-side validation

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
- **Token Expiration Handling**: Automatic logout and redirect when tokens expire
- **Improved Error Messages**: User-friendly error messages with specific guidance
- **Error Handling**: Global error boundary for better user experience
- **Database Timestamps**: Automatic createdAt and updatedAt tracking
- **Professional UI**: Enhanced status badges with color-coded states
- **Secure Environment Management**: Proper .env.example and configuration

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

## 🧪 Testing Guide

### End-to-End Test Scenarios

#### 1. Patient Registration & Login Flow
```bash
# Test Case: Valid Registration
1. Navigate to signup page
2. Enter valid email, name (min 2 chars), password (min 6 chars)
3. Select "PATIENT" role
4. Submit form → Should redirect to dashboard

# Test Case: Invalid Registration
1. Enter invalid email format → Should show "Please provide a valid email address"
2. Enter short password (< 6 chars) → Should show "Password must be at least 6 characters long"
3. Enter existing email → Should show "Email already registered"
```

#### 2. Appointment Booking Flow
```bash
# Test Case: Successful Booking
1. Login as patient
2. Select a doctor from dropdown
3. Choose a future date
4. Select available time slot
5. Submit → Should show "Appointment booked successfully!"

# Test Case: Booking Validation
1. Try to book past date → Should show "Cannot book appointments for past dates"
2. Try to book without selecting all fields → Should show "All fields are required"
3. Try to book already taken slot → Should show "This time slot is already approved"
```

#### 3. Doctor Status Management
```bash
# Test Case: Status Updates
1. Login as doctor (use provided credentials)
2. View pending appointments
3. Change status from PENDING → APPROVED
4. Try to approve overlapping appointments → Should show conflict error
5. Change status to COMPLETED or CANCELLED
```

#### 4. Patient Cancellation
```bash
# Test Case: Valid Cancellation
1. Login as patient
2. Book an appointment (PENDING status)
3. Click Cancel button → Should show confirmation dialog
4. Confirm → Should show "Appointment cancelled successfully!"

# Test Case: Invalid Cancellation
1. Try to cancel APPROVED appointment → Should show "Cannot cancel an approved appointment"
2. Try to cancel COMPLETED appointment → Should show "Cannot cancel a completed appointment"
```

#### 5. Token Expiration Testing
```bash
# Test Case: Token Expiry
1. Login to the system
2. Wait 1 hour (or modify JWT expiration to 1 minute for testing)
3. Try to perform any API call
4. Should automatically redirect to login page
5. localStorage should be cleared
```

### Error Scenario Testing

#### Network Errors
1. Turn off network connection
2. Try to book appointment
3. Should show "Unable to book appointment. Please try again later."

#### Authentication Errors
1. Clear localStorage
2. Try to access dashboard directly
3. Should redirect to login page

#### Validation Errors
1. Test all form validation scenarios
2. Verify error messages are user-friendly
3. Check that loading states work properly

### Mobile Responsiveness Testing
- Test on different screen sizes
- Verify all buttons and forms are usable on mobile
- Check that status badges display correctly

### Performance Testing
- Monitor API response times
- Check that loading states appear immediately
- Verify no memory leaks during extended use

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
