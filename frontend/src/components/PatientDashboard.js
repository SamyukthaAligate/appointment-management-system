import React, { useState, useEffect } from 'react';

const AppointmentForm = ({ doctors, onBookingSuccess }) => {
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedDoctor || !date || !timeSlot) {
      setError('All fields are required.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ doctor: selectedDoctor, date, timeSlot }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to book appointment.');
      }

      alert('Appointment booked successfully!');
      onBookingSuccess(); // Callback to refresh the appointments list
      // Reset form
      setSelectedDoctor('');
      setDate('');
      setTimeSlot('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Example time slots
  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label htmlFor="doctor" className="block text-sm font-medium text-gray-700">Doctor</label>
        <select id="doctor" value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
          <option value="">Select a Doctor</option>
          {doctors.map(doc => <option key={doc._id} value={doc._id}>{doc.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
        <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
      </div>
      <div>
        <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700">Time Slot</label>
        <select id="timeSlot" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
          <option value="">Select a Time Slot</option>
          {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
        </select>
      </div>
      <button type="submit" className="w-full px-4 py-2 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600">Book Now</button>
    </form>
  );
};

export default function PatientDashboard({ user }) {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/appointments', {
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) throw new Error('Failed to fetch appointments');
      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        // Fetch doctors
        const doctorsRes = await fetch('http://localhost:5000/api/doctors', {
          headers: { 'x-auth-token': token },
        });
        if (!doctorsRes.ok) throw new Error('Failed to fetch doctors');
        const doctorsData = await doctorsRes.json();
        setDoctors(doctorsData);

        // Fetch initial appointments
        await fetchAppointments();

      } catch (err) {
        setError('Failed to fetch initial data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

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
