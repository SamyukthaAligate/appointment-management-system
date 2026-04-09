import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../components/ToastContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PATIENT");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const login = async () => {
    if (!email || !password) {
      showToast("Please enter an email and password", "error");
      return;
    }
    
    setIsLoading(true);
    try {
      const { token, user } = await api.post('/api/auth/login', { email, password, role });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      showToast(`Welcome back, ${user.name}!`, "success");
      navigate('/dashboard');
    } catch (error) {
      console.error("Login error:", error);
      showToast(`Login failed: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 flex items-center justify-center p-4">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md p-10 space-y-8 glass-panel relative z-10 transition-all duration-500 hover:shadow-2xl hover:shadow-lg">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold premium-gradient-text tracking-tight">Welcome Back</h2>
          <p className="text-gray-500 mt-2 font-medium">Please enter your details to sign in.</p>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); login(); }} className="space-y-5">
          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-semibold text-gray-700 uppercase tracking-wide">Email</label>
            <input 
              id="email"
              name="email"
              type="email" 
              autoComplete="email"
              placeholder="you@example.com" 
              onChange={e => setEmail(e.target.value)} 
              value={email}
              className="w-full px-4 py-3 bg-white bg-opacity-50 border border-purple-100 rounded-xl focus:ring-4 focus:ring-purple-500 ring-opacity-20 focus:border-purple-500 transition-all shadow-sm outline-none placeholder:text-gray-400 font-medium"
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-1 text-sm font-semibold text-gray-700 uppercase tracking-wide">Password</label>
            <input 
              id="password"
              name="password"
              type="password" 
              autoComplete="current-password"
              placeholder="••••••••" 
              onChange={e => setPassword(e.target.value)} 
              value={password}
              className="w-full px-4 py-3 bg-white bg-opacity-50 border border-purple-100 rounded-xl focus:ring-4 focus:ring-purple-500 ring-opacity-20 focus:border-purple-500 transition-all shadow-sm outline-none placeholder:text-gray-400 font-medium"
            />
          </div>
          <div>
            <label htmlFor="role" className="block mb-1 text-sm font-semibold text-gray-700 uppercase tracking-wide">Account Type</label>
            <div className="relative">
              <select 
                id="role"
                name="role"
                value={role}
                onChange={e => setRole(e.target.value)} 
                className="w-full px-4 py-3 bg-white bg-opacity-50 border border-purple-100 rounded-xl appearance-none focus:ring-4 focus:ring-purple-500 ring-opacity-20 focus:border-purple-500 transition-all shadow-sm outline-none font-medium cursor-pointer"
              >
                <option value="PATIENT">Patient</option>
                <option value="DOCTOR">Doctor</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full px-4 py-3 font-bold text-white premium-gradient rounded-xl hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-purple-500 ring-opacity-30 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0 mt-4"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <p className="text-sm text-center text-gray-600 font-medium">
          Don't have an account?{" "}
          <Link to="/signup" className="font-bold text-purple-600 hover:text-purple-800 transition-colors">Sign up here</Link>
        </p>
      </div>
    </div>
  );
}
