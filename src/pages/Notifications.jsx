import React, { useEffect, useState } from 'react';
import { Bell, Check, Trash2, Clock, ShieldAlert, BadgeInfo, BadgeCheck } from 'lucide-react';
import axios from 'axios';
import { apis } from '../types';
import { getUserData } from '../userStore/userData';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [appIcons, setAppIcons] = useState({});
    const token = getUserData()?.token;

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axios.get(apis.notifications, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    timeout: 5000 // 5 seconds timeout
                });
                setNotifications(res.data);
            } catch (err) {
                console.error('Error fetching notifications:', err);
                // On error, we still clear loading to show the demo fallback
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchNotifications();
        }
    }, [token]);

    useEffect(() => {
        // Fetch app icons for notifications with targetId
        const fetchAppIcons = async () => {
            const uniqueTargetIds = [...new Set(notifications.filter(n => n.targetId).map(n => n.targetId))];
            const icons = {};

            for (const targetId of uniqueTargetIds) {
                try {
                    const res = await axios.get(`${apis.agents}/${targetId}`);
                    if (res.data && res.data.avatar) {
                        icons[targetId] = res.data.avatar;
                    }
                } catch (err) {
                    console.error(`Failed to fetch icon for ${targetId}:`, err);
                }
            }
            setAppIcons(icons);
        };

        if (notifications.length > 0) {
            fetchAppIcons();
        }
    }, [notifications]);

    const markAsRead = async (id) => {
        try {
            await axios.put(`${apis.notifications}/read/${id}`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await axios.delete(`${apis.notifications}/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'ALERT': return <ShieldAlert className="w-6 h-6 text-red-500" />;
            case 'SUCCESS': return <BadgeCheck className="w-6 h-6 text-green-500" />;
            default: return <BadgeInfo className="w-6 h-6 text-blue-500" />;
        }
    };

    const filteredNotifications = notifications
        .filter(notif => {
            // Exclude vendor-specific notifications (approval/rejection messages)
            const isVendorNotification =
                notif.message.includes('Congratulations!') ||
                notif.message.includes('approved') ||
                notif.message.includes('rejected') ||
                notif.message.includes('good work');
            return !isVendorNotification;
        });

    return (
        <div className="p-4 md:p-8 h-full bg-secondary overflow-y-auto">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-maintext mb-2">Notifications</h1>
                <p className="text-sm md:text-base text-subtext">Stay updated with your account and subscription status.</p>
            </div>

            <div className="grid gap-4 max-w-3xl">
                {filteredNotifications.length === 0 && !loading && (
                    <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No notifications yet</p>
                        <p className="text-sm text-gray-400 mt-2">We'll notify you about new agents and subscription updates</p>
                    </div>
                )}
                {/* Real Notifications from Backend - Filter out vendor-specific notifications */}
                {filteredNotifications.map((notif) => (
                    <div
                        key={notif._id}
                        className={`bg-white p-5 rounded-2xl border transition-all flex items-start gap-4 shadow-sm hover:shadow-md ${!notif.isRead ? 'border-primary/30 ring-1 ring-primary/5' : 'border-border'
                            }`}
                    >
                        <div className={`p-3 rounded-xl ${notif.type === 'ALERT' ? 'bg-red-50' :
                            notif.type === 'SUCCESS' ? 'bg-green-50' : 'bg-blue-50'
                            }`}>
                            {appIcons[notif.targetId] ? (
                                <img src={appIcons[notif.targetId]} alt="App" className="w-6 h-6 rounded-lg object-cover" />
                            ) : (
                                getIcon(notif.type)
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className={`font-bold ${!notif.isRead ? 'text-maintext' : 'text-subtext'}`}>
                                    {notif.title}
                                </h3>
                                <span className="text-[10px] text-subtext flex items-center gap-1 bg-surface px-2 py-1 rounded-full">
                                    <Clock className="w-3 h-3" />
                                    {new Date(notif.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className={`text-sm leading-relaxed ${!notif.isRead ? 'text-subtext' : 'text-subtext/70'}`}>
                                {notif.message}
                            </p>

                            {!notif.isRead && (
                                <button
                                    onClick={() => markAsRead(notif._id)}
                                    className="mt-3 text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                                >
                                    <Check className="w-3 h-3" /> Mark as read
                                </button>
                            )}

                            <button
                                onClick={() => deleteNotification(notif._id)}
                                className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1 hover:underline"
                            >
                                <Trash2 className="w-3 h-3" /> Delete
                            </button>
                        </div>
                    </div>
                ))}

                {/* 3. Loading State (Subtle Spinner at bottom if needed) */}
                {loading && (
                    <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary/30"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
