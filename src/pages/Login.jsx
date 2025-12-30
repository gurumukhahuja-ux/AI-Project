import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { Cpu, Mail, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { apiService } from '../services/apiService';
import axios from 'axios';
import { apis, AppRoute } from '../types';
import { setUserData } from '../userStore/userData';
import { logo } from '../constants';


const Login = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const payload = { email, password }
  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("")
    setLoading(true)
    axios.post(apis.logIn, payload).then((res) => {
      setError(false)
      setMessage(res.data.message)
      const from = location.state?.from?.pathname || AppRoute.DASHBOARD;
      navigate(from, { replace: true });
      setUserData(res.data)
      localStorage.setItem("userId", res.data.id)
      localStorage.setItem("token", res.data.token)

    }).catch((err) => {
      console.log(err.response.data.error);
      setError(true)
      setMessage(err.response.data.error || "Somthing went Wrong")
    }).finally(() => {
      setLoading(false)

    })

  };


  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 bg-surface">
      <div className="relative z-10 w-full max-w-md">

        {/* Header */}
        <div className=" text-center">
          <div className="inline-block rounded-full  w-25">
            <img src={logo} alt="" />
          </div>
          <h2 className="text-3xl font-bold text-maintext mb-2">Welcome Back</h2>
          <p className="text-subtext">Sign in to continue to AI Mall</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-border p-8 rounded-3xl shadow-xl">

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              {message}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-maintext ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-subtext" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-maintext placeholder-subtext focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-maintext ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-subtext" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-maintext placeholder-subtext focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary rounded-xl font-bold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Signup Redirect */}
          <div className="mt-8 text-center text-sm text-subtext">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Create Account
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <Link
          to="/"
          className="mt-8 flex items-center justify-center gap-2 text-subtext hover:text-maintext transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

      </div>
    </div>
  );
};

export default Login;