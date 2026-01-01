import React, { useState } from 'react';
import { Bell, Search, User, LogOut, ChevronDown, Activity, Menu } from 'lucide-react';
import { useNavigate } from 'react-router';
import StatusBadge from './StatusBadge';

const Topbar = ({ toggleSidebar, vendorName }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shadow-sm shadow-gray-50/50">
            {/* Left: Mobile Menu & Search */}
            <div className="flex items-center flex-1 max-w-xl space-x-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2 -ml-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 md:hidden transition-colors"
                >
                    <Menu size={24} />
                </button>

                <div className="flex-1 relative group max-w-md hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search your apps..."
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white focus:border-blue-200 transition-all"
                    />
                </div>
            </div>

            {/* Right: Health, Notifications, Profile */}
            <div className="flex items-center space-x-2 sm:space-x-6">
                {/* App Health Badge */}
                <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-full">
                    <Activity size={14} className="text-green-600" />
                    <span className="text-[11px] font-bold text-green-700 uppercase tracking-tight">Systems Nominal</span>
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative border-l border-gray-100 pl-2 sm:pl-6 ml-2 sm:ml-0">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center space-x-3 p-1 rounded-xl hover:bg-gray-50 transition-all"
                    >
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                            {vendorName ? vendorName.charAt(0).toUpperCase() : <User size={18} />}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-bold text-gray-900 leading-none">{vendorName || 'Vendor Portal'}</p>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">Premium Partner</p>
                        </div>

                    </button>

                    {isProfileOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                <div className="px-4 py-3 mb-1">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Account</p>
                                    <p className="text-sm font-semibold text-gray-900 truncate">{vendorName}</p>
                                </div>
                                {/* Removed Profile Settings and Logout as per new requirements */}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Topbar;
