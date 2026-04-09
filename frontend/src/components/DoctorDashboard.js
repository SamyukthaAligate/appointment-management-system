import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

export default function DoctorDashboard({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/appointments');
      setAppointments(data);
    } catch (err) {
      showToast(err.message || 'Failed to fetch appointments', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await api.put(`/api/appointments/${appointmentId}/status`, { status: newStatus });
      showToast('Status updated successfully', 'success');
      fetchAppointments();
    } catch (err) {
      showToast(err.message || "Failed to update status", 'error');
    }
  };
  
  const checkOverlap = (appt) => {
    return appointments.some(other => 
      other._id !== appt._id && 
      other.date === appt.date && 
      other.timeSlot === appt.timeSlot && 
      other.status === 'APPROVED'
    );
  };

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
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Doctor Dashboard</h2>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl shadow-md border border-gray-100 overflow-hidden relative">
        <div className="h-2 w-full premium-gradient absolute top-0 left-0"></div>
        <div className="p-6 sm:p-8">
          <h3 className="text-xl font-bold mb-6 text-gray-800">Your Scheduled Patients</h3>
          
          {appointments.length === 0 ? (
            <div className="text-center py-12 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-lg font-medium text-gray-600">No patients scheduled.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appointments.map(appt => {
                const isOverlapping = checkOverlap(appt);
                return (
                <li key={appt._id} className="bg-white border border-gray-100 p-6 rounded-xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-full premium-gradient flex items-center justify-center text-white font-bold text-xl shadow-md border-2 border-white">
                        {appt.patient?.name ? appt.patient.name.charAt(0) : 'P'}
                      </div>
                      <div>
                        <p className="font-bold text-lg text-gray-800">{appt.patient?.name || 'Unknown Patient'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 font-medium">Date</span>
                        <span className="font-bold text-gray-800">{new Date(appt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 font-medium">Time</span>
                        <span className="font-bold text-gray-800">{appt.timeSlot}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <span className={`self-start px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md border ${
                      appt.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' : 
                      appt.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                      appt.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                      Current: {appt.status}
                    </span>
                    
                    <select 
                      value={appt.status}
                      onChange={(e) => handleStatusUpdate(appt._id, e.target.value)}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-indigo-500 ring-opacity-20 focus:border-indigo-500 transition-all font-medium text-gray-700 shadow-sm outline-none cursor-pointer"
                    >
                      <option value="PENDING">Mark as Pending</option>
                      <option value="APPROVED" disabled={isOverlapping && appt.status !== 'APPROVED'}>
                        {isOverlapping && appt.status !== 'APPROVED' ? 'Conflict: Slot Taken' : 'Approve'}
                      </option>
                      <option value="COMPLETED">Mark as Completed</option>
                      <option value="CANCELLED">Cancel Appointment</option>
                    </select>
                  </div>
                </li>
              )})}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
