import React, { useState, useEffect } from 'react';

import PatientDashboard from '../components/PatientDashboard';
import DoctorDashboard from '../components/DoctorDashboard';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve user data from local storage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/'; // Redirect to login
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // This should ideally be handled by a protected route, but as a fallback:
    window.location.href = '/';
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Appointment System</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-gray-600">Welcome, {user.name} ({user.role})</span>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="p-8">
        {user.role === 'PATIENT' ? <PatientDashboard user={user} /> : <DoctorDashboard user={user} />}
      </main>
    </div>
  );
}
