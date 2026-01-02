import React from 'react';
import { motion } from 'framer-motion';
import {
    CircleUser,
    Settings,
    Shield,
    Clock,
    Star,
    Infinity,
    ChevronRight,
    LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { AppRoute } from '../types';
import { getUserData, clearUser } from '../userStore/userData';

const Profile = () => {
    const navigate = useNavigate();
    const user = getUserData() || { name: 'Gauhar', email: 'gauhar@example.com' };

    const stats = [
        {
            label: 'Total Sessions',
            value: '128',
            icon: Clock,
            color: 'bg-blue-500/10 text-blue-600',
        },
        {
            label: 'Pro Features',
            value: 'Active',
            icon: Star,
            color: 'bg-amber-500/10 text-amber-600',
        },
        {
            label: 'Account Settings',
            value: 'Configured',
            icon: Settings,
            color: 'bg-purple-500/10 text-purple-600',
        },
        {
            label: 'Credits',
            value: <Infinity className="w-5 h-5" />,
            icon: Shield,
            color: 'bg-green-500/10 text-green-600',
        }
    ];

    const handleLogout = () => {
        clearUser();
        navigate(AppRoute.LANDING);
    };

    return (
        <div className="h-full flex flex-col bg-secondary p-4 md:p-8 overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto w-full space-y-8 pb-12">

                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center gap-6 bg-white border border-border p-8 rounded-[32px] shadow-sm">
                    <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20 shadow-inner">
                        <CircleUser className="w-12 h-12" />
                    </div>
                    <div className="text-center md:text-left space-y-1">
                        <h1 className="text-3xl font-black text-maintext">{user.name}</h1>
                        <p className="text-subtext font-medium">{user.email}</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                            Joined December 2025
                        </div>
                    </div>
                    <div className="md:ml-auto flex gap-3">
                        <button
                            onClick={() => navigate(AppRoute.SECURITY)}
                            className="px-6 py-3 bg-white border border-border rounded-xl text-sm font-bold text-maintext hover:bg-surface transition-all flex items-center gap-2"
                        >
                            <Shield className="w-4 h-4 text-primary" />
                            Security & Guidelines
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white border border-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group cursor-default"
                        >
                            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-bold text-subtext uppercase tracking-widest mb-1">{stat.label}</p>
                            <div className="text-xl font-black text-maintext flex items-center">
                                {stat.value}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Account Details & Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-border rounded-[32px] p-8 space-y-6">
                        <h2 className="text-xl font-bold text-maintext flex items-center gap-2">
                            <Settings className="w-5 h-5 text-primary" />
                            Account Preferences
                        </h2>
                        <div className="space-y-4">
                            {[
                                { label: 'Display Language', value: 'English (US)' },
                                { label: 'Timezone', value: 'Asia/Kolkata (GMT+5:30)' },
                                { label: 'Currency', value: 'INR (₹)' },
                                { label: 'Theme', value: 'System Default' }
                            ].map((item) => (
                                <div key={item.label} className="flex justify-between items-center py-3 border-b border-border/50 last:border-0 hover:bg-secondary/30 px-2 rounded-lg transition-colors cursor-pointer group">
                                    <span className="text-sm font-medium text-subtext">{item.label}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-maintext">{item.value}</span>
                                        <ChevronRight className="w-4 h-4 text-subtext group-hover:text-primary transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-border rounded-[32px] p-8 flex flex-col justify-between">
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-maintext flex items-center gap-2">
                                <Shield className="w-5 h-5 text-green-500" />
                                Security Status
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-green-500/5 border border-green-500/10 rounded-2xl">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <p className="text-sm font-bold text-green-700">Account fully secure</p>
                                </div>
                                <div className="p-4 bg-secondary/50 rounded-2xl border border-border">
                                    <p className="text-xs text-subtext mb-2">Two-Factor Authentication</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-maintext">Enabled</span>
                                        <button className="text-primary text-xs font-bold hover:underline">Manage</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="mt-8 w-full py-4 bg-red-500/5 text-red-500 border border-red-500/10 rounded-2xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out from Device
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
