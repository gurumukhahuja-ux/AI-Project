import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Cpu, Mail, Lock, User, Building, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { apis } from '../types';
import { logo } from '../constants';

const VendorRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        companyName: ''
    });
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError(false);

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError(true);
            setMessage('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError(true);
            setMessage('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: 'vendor',
                companyName: formData.companyName
            };

            const res = await axios.post(apis.signUp, payload);

            setError(false);
            setMessage('Vendor account created successfully! Redirecting...');

            // Store user data
            localStorage.setItem('user', JSON.stringify({
                _id: res.data.id,
                name: res.data.name,
                email: res.data.email,
                role: 'vendor'
            }));
            localStorage.setItem('token', res.data.token);

            // Redirect to vendor dashboard
            setTimeout(() => {
                navigate('/vendor/overview');
            }, 1500);

        } catch (err) {
            console.error('Vendor Registration Error:', err);
            setError(true);
            const detailedError = err.response?.data?.details || '';
            const errorMessage = err.response?.data?.error || err.message || 'Registration failed. Please try again.';
            setMessage(detailedError ? `${errorMessage} (${detailedError})` : errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-start justify-center relative overflow-y-auto px-4 py-8 bg-gradient-to-br from-indigo-50 via-white to-blue-50">

            {/* Background Decoration */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[100px] opacity-50" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[100px] opacity-50" />

            <div className="relative z-10 w-full max-w-md mt-8">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block rounded-full w-25 mb-4">
                        <img src={logo} alt="AI-Mall Logo" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Become a Vendor</h2>
                    <p className="text-gray-600">Join AI-Mall and start selling your AI agents</p>
                </div>

                {/* Card */}
                <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-xl">

                    {/* Success/Error Message */}
                    {message && (
                        <div className={`mb-6 p-3 rounded-xl flex items-center gap-2 text-sm ${error
                            ? 'bg-red-50 border border-red-100 text-red-600'
                            : 'bg-green-50 border border-green-100 text-green-600'
                            }`}>
                            {error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            {message}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Company Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">Company Name</label>
                            <div className="relative">
                                <Building className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    placeholder="TechCorp Inc."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="vendor@example.com"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-blue-600 rounded-xl font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Account...' : 'Create Vendor Account'}
                        </button>
                    </form>

                    {/* Login Redirect */}
                    <div className="mt-8 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 hover:underline font-medium">
                            Sign In
                        </Link>
                    </div>
                </div>

                {/* Back to Home */}
                <Link
                    to="/"
                    className="mt-8 flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

            </div>
        </div>
    );
};

export default VendorRegister;
