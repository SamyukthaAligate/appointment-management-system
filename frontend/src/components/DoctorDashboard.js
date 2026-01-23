import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function DoctorDashboard({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/appointments');
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await api.put(`/api/appointments/${appointmentId}/status`, { status: newStatus });
      // Refresh the list to show the updated status
      fetchAppointments();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading appointments...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Your Scheduled Appointments</h3>
        {appointments.length === 0 ? (
          <p>You have no appointments scheduled.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {appointments.map(appt => (
              <li key={appt._id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">Patient: {appt.patient.name}</p>
                  <p className="text-sm text-gray-600">Date: {new Date(appt.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">Time: {appt.timeSlot}</p>
                </div>
                <div>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${appt.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {appt.status}
                  </span>
                  <select 
                    value={appt.status}
                    onChange={(e) => handleStatusUpdate(appt._id, e.target.value)}
                    className="ml-4 p-1 border border-gray-300 rounded-md"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
