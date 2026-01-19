import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PATIENT");

    const navigate = useNavigate();

  const signup = async () => {
    try {
      await api.post('/api/auth/signup', { name, email, password, role });
      alert("Signup successful! You can now log in.");
      navigate('/'); // Redirect to login page
    } catch (error) {
      console.error("Signup error:", error);
      alert(`Signup failed: ${error.message}`);
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }}
    >
      <div className="w-full max-w-md p-8 space-y-6 bg-white bg-opacity-20 backdrop-blur-lg rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-800">Create Account</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">Full Name</label>
            <input 
              id="name"
              type="text" 
              placeholder="John Doe" 
              onChange={e => setName(e.target.value)} 
              className="w-full px-4 py-2 text-gray-700 bg-white bg-opacity-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">Email Address</label>
            <input 
              id="email"
              type="email" 
              placeholder="your.email@example.com" 
              onChange={e => setEmail(e.target.value)} 
              className="w-full px-4 py-2 text-gray-700 bg-white bg-opacity-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">Password</label>
            <input 
              id="password"
              type="password" 
              placeholder="••••••••" 
              onChange={e => setPassword(e.target.value)} 
              className="w-full px-4 py-2 text-gray-700 bg-white bg-opacity-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-700">I am a...</label>
            <select 
              id="role"
              onChange={e => setRole(e.target.value)} 
              className="w-full px-4 py-2 text-gray-700 bg-white bg-opacity-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
            </select>
          </div>
        </div>
        <button 
          onClick={signup} 
          className="w-full px-4 py-2 font-semibold text-white bg-blue-500 bg-opacity-70 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
        >
          Sign Up
        </button>
        <p className="text-sm text-center text-gray-700">
          Already have an account?{" "}
          <Link to="/" className="font-medium text-blue-600 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
