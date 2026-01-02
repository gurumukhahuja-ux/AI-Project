import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, User, CheckCircle, AlertCircle, X, Menu } from 'lucide-react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { apis, AppRoute } from '../../types';

const Topbar = ({ toggleSidebar, vendorName, vendorType, vendorAvatar }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const notificationRef = useRef(null);

    // Fetch Notifications
    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await axios.get(apis.notifications, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (Array.isArray(res.data)) {
                setNotifications(res.data);
                const unread = res.data.filter(n => !n.isRead).length;
                setUnreadCount(unread);
            }
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            // Optimistic update
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));

            await axios.put(`${apis.notifications}/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
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
                        placeholder="Search your agents..."
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white focus:border-blue-200 transition-all"
                    />
                </div>
            </div>

            {/* Right: Health, Notifications, Profile */}
            <div className="flex items-center space-x-2 sm:space-x-6">

                {/* Notifications */}
                <div className="relative ml-4" ref={notificationRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2.5 text-maintext hover:bg-gray-50 rounded-lg transition-all"
                    >
                        <Bell size={24} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-40 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900">Notifications</h3>
                                <button
                                    onClick={() => setShowNotifications(false)}
                                    className="p-1 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 text-sm">
                                        No new notifications
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-50">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification._id}
                                                className={`p-4 hover:bg-gray-50 transition-colors flex gap-3 cursor-pointer ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                                                onClick={() => !notification.isRead && markAsRead(notification._id)}
                                            >
                                                <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-green-100 text-green-600' :
                                                    notification.type === 'error' ? 'bg-red-100 text-red-600' :
                                                        'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
                                                        notification.type === 'error' ? <AlertCircle className="w-4 h-4" /> :
                                                            <Bell className="w-4 h-4" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-sm leading-relaxed ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                                        {notification.message}
                                                    </p>
                                                    <span className="text-xs text-gray-400 mt-1 block">
                                                        {new Date(notification.createdAt).toLocaleDateString()} • {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                {!notification.isRead && (
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile - Direct Link to Settings */}
                <div className="relative border-l border-gray-100 pl-2 sm:pl-6 ml-2 sm:ml-0">
                    <button
                        onClick={() => navigate('/vendor/settings')}
                        className="flex items-center space-x-3 p-1 rounded-xl hover:bg-gray-50 transition-all"
                    >
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 overflow-hidden">
                            {vendorAvatar ? (
                                <img src={vendorAvatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                vendorName ? vendorName.charAt(0).toUpperCase() : <User size={18} />
                            )}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-bold text-gray-900 leading-none">{vendorName || 'Vendor Portal'}</p>
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1 text-primary">{vendorType || 'Partner'}</p>
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
