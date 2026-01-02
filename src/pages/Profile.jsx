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
    LogOut,
    Camera
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { AppRoute } from '../types';
import { getUserData, clearUser, setUserData } from '../userStore/userData';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const Profile = () => {
    const navigate = useNavigate();
    const user = getUserData() || { name: 'Gauhar', email: 'gauhar@example.com' };



    const handleLogout = () => {
        clearUser();
        navigate(AppRoute.LANDING);
    };

    const { language, setLanguage, t, languages } = useLanguage();
    const { theme, setTheme } = useTheme();

    const [preferences, setPreferences] = React.useState({
        timezone: 'India (GMT+5:30)',
        currency: 'INR (₹)'
    });



    const [activeSection, setActiveSection] = React.useState(null);

    const timezones = [
        "UTC (GMT+0:00)",
        "New York (GMT-4:00)",
        "Los Angeles (GMT-7:00)",
        "London (GMT+1:00)",
        "Paris (GMT+2:00)",
        "India (GMT+5:30)",
        "Tokyo (GMT+9:00)",
        "Sydney (GMT+10:00)",
        "Dubai (GMT+4:00)"
    ];

    const currencies = [
        "USD ($)",
        "EUR (€)",
        "GBP (£)",
        "INR (₹)",
        "JPY (¥)",
        "CNY (¥)",
        "AUD (A$)",
        "CAD (C$)"
    ];

    const handlePreferenceClick = (key) => {
        setActiveSection(activeSection === key ? null : key);
    };

    const selectLanguage = (lang) => {
        setLanguage(lang);
        setActiveSection(null);
    };

    const selectTimezone = (tz) => {
        setPreferences(prev => ({ ...prev, timezone: tz }));
        setActiveSection(null);
    };

    const selectCurrency = (curr) => {
        setPreferences(prev => ({ ...prev, currency: curr }));
        setActiveSection(null);
    };

    const stats = [
        {
            label: t('totalSessions'),
            value: '128',
            icon: Clock,
            color: 'bg-blue-500/10 text-blue-600',
        },
        {
            label: t('proFeatures'),
            value: 'Active',
            icon: Star,
            color: 'bg-amber-500/10 text-amber-600',
        },
        {
            label: t('accountSettings'),
            value: 'Configured',
            icon: Settings,
            color: 'bg-purple-500/10 text-purple-600',
        },
        {
            label: t('credits'),
            value: <Infinity className="w-5 h-5" />,
            icon: Shield,
            color: 'bg-green-500/10 text-green-600',
        }
    ];

    const preferenceItems = [
        { key: 'language', label: t('displayLanguage'), value: language },
        { key: 'timezone', label: t('timezone'), value: preferences.timezone },
        { key: 'currency', label: t('currency'), value: preferences.currency }
    ];

    const [profileImage, setProfileImage] = React.useState(user.avatar || null);
    const fileInputRef = React.useRef(null);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setProfileImage(base64String);

                // Update persistent storage
                const updatedUser = { ...user, avatar: base64String };
                setUserData(updatedUser);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="h-full flex flex-col bg-secondary p-4 md:p-8 overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto w-full space-y-8 pb-12">

                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center gap-6 bg-card border border-border p-8 rounded-[32px] shadow-sm relative overflow-hidden">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20 shadow-inner overflow-hidden">
                            {profileImage ? (
                                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <CircleUser className="w-12 h-12" />
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl cursor-pointer"
                        >
                            <Camera className="w-8 h-8 text-white" />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    <div className="text-center md:text-left space-y-1">
                        <h1 className="text-3xl font-black text-maintext">{user.name}</h1>
                        <p className="text-subtext font-medium">{user.email}</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                            {t.joined}
                        </div>
                    </div>
                    <div className="md:ml-auto flex gap-3">
                        <button
                            onClick={() => navigate(AppRoute.SECURITY)}
                            className="px-6 py-3 bg-card border border-border rounded-xl text-sm font-bold text-maintext hover:bg-surface transition-all flex items-center gap-2"
                        >
                            <Shield className="w-4 h-4 text-primary" />
                            {t.securityBtn}
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
                            className="bg-card border border-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group cursor-default"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    <div className="bg-card border border-border rounded-[32px] p-8 space-y-6">
                        <h2 className="text-xl font-bold text-maintext flex items-center gap-2">
                            <Settings className="w-5 h-5 text-primary" />
                            {t.accountPreferences}
                        </h2>
                        <div className="space-y-4">
                            {preferenceItems.map((item) => (
                                <div key={item.key} className={`relative ${activeSection === item.key ? 'z-20' : 'z-0'}`}>
                                    <div
                                        onClick={() => handlePreferenceClick(item.key)}
                                        className="flex justify-between items-center py-3 border-b border-border/50 last:border-0 hover:bg-secondary/30 px-2 rounded-lg transition-colors cursor-pointer group select-none"
                                    >
                                        <span className="text-sm font-medium text-subtext">{item.label}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-maintext">{item.value}</span>
                                            {item.key !== 'theme' && (
                                                <ChevronRight className={`w-4 h-4 text-subtext group-hover:text-primary transition-colors ${activeSection === item.key ? 'rotate-90' : ''}`} />
                                            )}
                                        </div>
                                    </div>

                                    {/* Language Dropdown */}
                                    {item.key === 'language' && activeSection === 'language' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute md:absolute z-50 top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto w-full md:w-auto md:min-w-[200px] md:right-0 md:left-auto"
                                        >
                                            {languages.map(lang => (
                                                <button
                                                    key={lang}
                                                    onClick={() => selectLanguage(lang)}
                                                    className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-primary/5 hover:text-primary transition-colors flex justify-between items-center ${language === lang ? 'bg-primary/5 text-primary' : 'text-maintext'}`}
                                                >
                                                    {lang}
                                                    {language === lang && <Star className="w-3 h-3 fill-primary" />}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}

                                    {/* Timezone Dropdown */}
                                    {item.key === 'timezone' && activeSection === 'timezone' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute md:absolute z-50 top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto w-full md:w-auto md:min-w-[250px] md:right-0 md:left-auto"
                                        >
                                            {timezones.map(tz => (
                                                <button
                                                    key={tz}
                                                    onClick={() => selectTimezone(tz)}
                                                    className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-primary/5 hover:text-primary transition-colors flex justify-between items-center ${preferences.timezone === tz ? 'bg-primary/5 text-primary' : 'text-maintext'}`}
                                                >
                                                    {tz}
                                                    {preferences.timezone === tz && <Star className="w-3 h-3 fill-primary" />}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}

                                    {/* Currency Dropdown */}
                                    {item.key === 'currency' && activeSection === 'currency' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute md:absolute z-50 top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto w-full md:w-auto md:min-w-[200px] md:right-0 md:left-auto"
                                        >
                                            {currencies.map(curr => (
                                                <button
                                                    key={curr}
                                                    onClick={() => selectCurrency(curr)}
                                                    className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-primary/5 hover:text-primary transition-colors flex justify-between items-center ${preferences.currency === curr ? 'bg-primary/5 text-primary' : 'text-maintext'}`}
                                                >
                                                    {curr}
                                                    {preferences.currency === curr && <Star className="w-3 h-3 fill-primary" />}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-[32px] p-8 flex flex-col justify-between">
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-maintext flex items-center gap-2">
                                <Shield className="w-5 h-5 text-green-500" />
                                {t.securityStatus}
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-green-500/5 border border-green-500/10 rounded-2xl">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <p className="text-sm font-bold text-green-700">{t.accountSecure}</p>
                                </div>
                                <div className="p-4 bg-secondary/50 rounded-2xl border border-border">
                                    <p className="text-xs text-subtext mb-2">{t.twoFactor}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-maintext">{t.enabled}</span>
                                        <button className="text-primary text-xs font-bold hover:underline">{t.manage}</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="mt-8 w-full py-4 bg-red-500/5 text-red-500 border border-red-500/10 rounded-2xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            {t.signOut}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
