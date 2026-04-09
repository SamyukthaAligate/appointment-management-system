import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AppointmentForm = ({ doctors, onBookingSuccess }) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const { showToast } = useToast();

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

    if (!selectedDoctorId || !date || !timeSlot) {
      showToast('All fields are required.', 'error');
      return;
    }

    try {
      await api.post('/api/appointments', { doctor: selectedDoctorId, date, timeSlot });
      showToast('Appointment booked successfully!', 'success');
      onBookingSuccess();
      setSelectedDoctorId('');
      setDate('');
      setTimeSlot('');
      setAvailableSlots([]);
    } catch (err) {
      showToast(err.message || 'Error booking appointment', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="doctor" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Doctor</label>
        <select 
          id="doctor" 
          value={selectedDoctorId} 
          onChange={(e) => setSelectedDoctorId(e.target.value)} 
          className="mt-2 block w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500 ring-opacity-20 focus:border-indigo-500 transition-all shadow-sm outline-none font-medium cursor-pointer"
        >
          <option value="">Select a Doctor</option>
          {doctors.map(doc => <option key={doc._id} value={doc._id}>{doc.name} - {doc.specialization}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="date" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Date</label>
        <input 
          type="date" 
          id="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          className="mt-2 block w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500 ring-opacity-20 focus:border-indigo-500 transition-all shadow-sm outline-none font-medium"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>
      <div>
        <label htmlFor="timeSlot" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Time Slot</label>
        <select 
          id="timeSlot" 
          value={timeSlot} 
          onChange={(e) => setTimeSlot(e.target.value)} 
          className="mt-2 block w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500 ring-opacity-20 focus:border-indigo-500 transition-all shadow-sm outline-none font-medium cursor-pointer disabled:opacity-50" 
          disabled={!selectedDoctorId || !date || loadingSlots}
        >
          <option value="">{loadingSlots ? 'Loading slots...' : 'Select a Time Slot'}</option>
          {availableSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
        </select>
        {selectedDoctorId && date && !loadingSlots && availableSlots.length === 0 && (
          <p className="text-sm font-medium text-yellow-500 mt-2 py-2 px-3 bg-yellow-50 rounded-lg">No available slots for the selected date.</p>
        )}
      </div>
      <button 
        type="submit" 
        disabled={!selectedDoctorId || !date || !timeSlot}
        className="w-full px-4 py-3 font-bold text-white premium-gradient rounded-xl hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-purple-500 ring-opacity-30 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 disabled:hover:translate-y-0 mt-4"
      >
        Book Appointment
      </button>
    </form>
  );
};

export default function PatientDashboard({ user }) {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchAppointments = useCallback(async () => {
    try {
      const data = await api.get('/api/appointments');
      setAppointments(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleCancelAppointment = async (appointmentId) => {
    // We should ideally replace window.confirm with a custom modal, 
    // but for scope simplicity, we'll keep the confirm and upgrade the feedback.
    if (!window.confirm('Are you certain you want to cancel this appointment? This cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/api/appointments/${appointmentId}`);
      showToast('Appointment cancelled successfully!', 'success');
      fetchAppointments();
    } catch (err) {
      showToast(err.message || 'Failed to cancel appointment', 'error');
    }
  };

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
      showToast('Failed to load dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Patient Dashboard</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl shadow-md border border-gray-100 overflow-hidden relative">
            <div className="h-2 w-full premium-gradient absolute top-0 left-0"></div>
            <div className="p-6 sm:p-8">
              <h3 className="text-xl font-bold mb-6 text-gray-800">Book Session</h3>
              <AppointmentForm doctors={doctors} onBookingSuccess={fetchAppointments} />
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl shadow-md border border-gray-100 overflow-hidden relative">
            <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-indigo-500 absolute top-0 left-0"></div>
            <div className="p-6 sm:p-8">
              <h3 className="text-xl font-bold mb-6 text-gray-800">Your Appointments</h3>
              
              {appointments.length === 0 ? (
                <div className="text-center py-12 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg font-medium text-gray-600">No appointments scheduled.</p>
                  <p className="text-gray-500 mt-1">Book a session from the panel to get started.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {appointments.map(appt => (
                    <li key={appt._id} className="bg-white border text-left border-gray-100 p-5 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition-shadow">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                            {appt.doctor?.name ? appt.doctor.name.charAt(0) : 'D'}
                          </div>
                          <div>
                            <p className="font-bold text-lg text-gray-800">{appt.doctor?.name || 'Unknown Doctor'}</p>
                            <p className="text-sm font-medium text-indigo-600">{appt.doctor?.specialization || 'Specialist'}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-sm text-gray-600 font-medium">
                          <span className="flex items-center gap-1.5 bg-gray-50 py-1 px-3 rounded-lg border border-gray-200">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            {new Date(appt.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1.5 bg-gray-50 py-1 px-3 rounded-lg border border-gray-200">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {appt.timeSlot}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-3">
                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${
                          appt.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' : 
                          appt.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                          appt.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                          {appt.status}
                        </span>
                        
                        {appt.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancelAppointment(appt._id)}
                            className="text-sm font-semibold text-red-500 hover:text-white bg-red-50 hover:bg-red-500 px-4 py-2 rounded-lg transition-colors border border-red-100 hover:border-red-500"
                          >
                            Cancel Session
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
