import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AppointmentForm = ({ doctors, onBookingSuccess }) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');

  // Fetch available slots when doctor and date are selected
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedDoctorId || !date) {
        setAvailableSlots([]);
        return;
      }

      setLoadingSlots(true);
      try {
        const slots = await api.get(`/api/appointments/slots/${selectedDoctorId}/${date}`);
        setAvailableSlots(slots);
      } catch (err) {
        console.error("Failed to fetch slots:", err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDoctorId, date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedDoctorId || !date || !timeSlot) {
      setError('All fields are required.');
      return;
    }

    try {
      await api.post('/api/appointments', { doctor: selectedDoctorId, date, timeSlot });
      alert('Appointment booked successfully!');
      onBookingSuccess();
      setSelectedDoctorId('');
      setDate('');
      setTimeSlot('');
      setAvailableSlots([]);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label htmlFor="doctor" className="block text-sm font-medium text-gray-700">Doctor</label>
        <select id="doctor" value={selectedDoctorId} onChange={(e) => setSelectedDoctorId(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
          <option value="">Select a Doctor</option>
          {doctors.map(doc => <option key={doc._id} value={doc._id}>{doc.name} - {doc.specialization}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
        <input 
          type="date" 
          id="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          min={new Date().toISOString().split('T')[0]} // Prevent past dates
        />
      </div>
      <div>
        <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700">Time Slot</label>
        <select id="timeSlot" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" disabled={!selectedDoctorId || !date || loadingSlots}>
          <option value="">{loadingSlots ? 'Loading...' : 'Select a Time Slot'}</option>
          {availableSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
        </select>
        {selectedDoctorId && date && !loadingSlots && availableSlots.length === 0 && (
          <p className="text-sm text-gray-500 mt-1">No available slots for the selected date.</p>
        )}
      </div>
      <button type="submit" className="w-full px-4 py-2 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600" disabled={!selectedDoctorId || !date || !timeSlot}>
        Book Now
      </button>
    </form>
  );
};

export default function PatientDashboard({ user }) {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = useCallback(async () => {
    try {
      const data = await api.get('/api/appointments');
      setAppointments(data);
    } catch (err) {
      // Don't overwrite a more important initial load error
      if (!error) setError(err.message);
    }
  }, [error]);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [doctorsData, appointmentsData] = await Promise.all([
        api.get('/api/doctors'),
        api.get('/api/appointments')
      ]);
      setDoctors(doctorsData);
      setAppointments(appointmentsData);
    } catch (err) {
      setError('Failed to fetch initial data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Patient Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Book an Appointment</h3>
          <AppointmentForm doctors={doctors} onBookingSuccess={fetchAppointments} />
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md mt-8">
        <h3 className="text-xl font-semibold mb-4">Your Appointments</h3>
        {appointments.length === 0 ? (
          <p>You have no appointments scheduled.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {appointments.map(appt => (
              <li key={appt._id} className="py-4">
                <p className="font-semibold">Dr. {appt.doctor.name}</p>
                <p className="text-sm text-gray-600">Date: {new Date(appt.date).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">Time: {appt.timeSlot}</p>
                <p className="text-sm">
                  Status: <span className={`font-semibold ${appt.status === 'APPROVED' ? 'text-green-600' : 'text-yellow-600'}`}>{appt.status}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
