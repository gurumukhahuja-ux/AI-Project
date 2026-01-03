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
    Camera,
    Pencil,
    Check,
    Bell,
    Lock,
    Trash2,
    Eye,
    EyeOff,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { AppRoute } from '../types';
import { getUserData, clearUser, setUserData } from '../userStore/userData';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const Profile = () => {
    const navigate = useNavigate();
    const user = getUserData() || { name: 'Gauhar', email: 'gauhar@example.com' };

    // Settings State
    const [userSettings, setUserSettings] = React.useState(() => {
        const saved = localStorage.getItem('user_settings');
        return saved ? JSON.parse(saved) : {
            emailNotif: true,
            pushNotif: false,
            publicProfile: true,
            twoFactor: true
        };
    });

    // Password Modal State
    const [showPasswordModal, setShowPasswordModal] = React.useState(false);
    const [passwordForm, setPasswordForm] = React.useState({ current: '', new: '', confirm: '' });
    const [showPassword, setShowPassword] = React.useState(false);

    const toggleSetting = (key) => {
        setUserSettings(prev => {
            const newState = { ...prev, [key]: !prev[key] };
            localStorage.setItem('user_settings', JSON.stringify(newState));

            // Show feedback
            const value = newState[key] ? "Enabled" : "Disabled";
            const labelMap = {
                emailNotif: "Email Notifications",
                pushNotif: "Push Notifications",
                publicProfile: "Public Profile",
                twoFactor: "Two-Factor Authentication"
            };
            toast.success(`${labelMap[key]} ${value}`);
            return newState;
        });
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (passwordForm.new !== passwordForm.confirm) {
            toast.error("New passwords do not match!");
            return;
        }
        if (passwordForm.new.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }

        // Simulate API call
        const loadingToast = toast.loading("Updating password...");
        setTimeout(() => {
            toast.dismiss(loadingToast);
            toast.success("Password updated successfully!");
            setShowPasswordModal(false);
            setPasswordForm({ current: '', new: '', confirm: '' });
        }, 1500);
    };



    const handleLogout = () => {
        clearUser();
        navigate(AppRoute.LANDING);
    };

    const { language, setLanguage, t, languages } = useLanguage();
    const { theme, setTheme } = useTheme();

    const [profileImage, setProfileImage] = React.useState(user.avatar || null);

    // Edit Profile Logic
    const [isEditing, setIsEditing] = React.useState(false);
    const [editForm, setEditForm] = React.useState({
        name: user.name,
        email: user.email
    });

    const handleSaveProfile = () => {
        const updatedUser = { ...user, name: editForm.name }; // Only update name
        setUserData(updatedUser);
        setIsEditing(false);
        // Force refresh or update local user variable if needed, 
        // but since we read from getUserData() at top which might not react, 
        // better to use state or window reload if standard react state flow isn't used for user.
        // For now, let's assume the user variable needs update. 
        // Ideally 'user' should be a state or useRecoilValue.
        // Assuming user is just a const at top, we might need to refresh page or use setProfileImage trick to re-render?
        // Let's just reload for simplicity if state mgmt is basic, OR update a local state version of user.
        window.location.reload();
    };
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



    return (
        <div className="h-full flex flex-col bg-secondary p-4 md:p-8 overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto w-full space-y-8 pb-12">

                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center gap-6 bg-card border border-border p-8 rounded-[32px] shadow-sm relative overflow-hidden">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20 shadow-inner overflow-hidden">
                            {user.avatar ? (
                                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <CircleUser className="w-12 h-12" />
                            )}
                        </div>
                    </div>

                    <div className="text-center md:text-left space-y-1 flex-1">
                        {isEditing ? (
                            <div className="space-y-3 max-w-md">
                                <div>
                                    <label className="text-xs font-bold text-subtext uppercase ml-1">Name</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full text-2xl font-bold bg-secondary/50 border border-border rounded-xl px-4 py-2 focus:outline-none focus:border-primary text-maintext"
                                    />
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={handleSaveProfile}
                                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
                                    >
                                        <Check className="w-4 h-4" /> Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditForm({ name: user.name, email: user.email });
                                        }}
                                        className="px-4 py-2 bg-surface text-maintext border border-border rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-secondary transition-colors"
                                    >
                                        <X className="w-4 h-4" /> Cancel
                                    </button>
                                </div>
                                {/* Static Email Display during Edit Mode */}
                                <div>
                                    <p className="text-subtext font-medium">{user.email}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="group relative inline-block">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-black text-maintext">{user.name}</h1>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="p-1.5 text-subtext hover:text-primary hover:bg-primary/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        title="Edit Profile"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-subtext font-medium">{user.email}</p>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-xs font-bold uppercase tracking-wider mt-2">
                                    {t.joined}
                                </div>
                            </div>
                        )}
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
                    <div className="bg-card border border-border rounded-[32px] p-8 space-y-8">
                        {/* General Preferences */}
                        <div className="space-y-6">
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

                        {/* Notifications */}
                        <div className="space-y-6 pt-6 border-t border-border">
                            <h2 className="text-xl font-bold text-maintext flex items-center gap-2">
                                <Bell className="w-5 h-5 text-blue-500" />
                                Notifications
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-maintext">Email Notifications</p>
                                        <p className="text-xs text-subtext">Receive updates via email</p>
                                    </div>
                                    <button
                                        onClick={() => toggleSetting('emailNotif')}
                                        className={`w-11 h-6 rounded-full p-1 transition-all duration-300 ${userSettings.emailNotif ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${userSettings.emailNotif ? 'translate-x-5' : ''}`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-maintext">Push Notifications</p>
                                        <p className="text-xs text-subtext">Receive updates on device</p>
                                    </div>
                                    <button
                                        onClick={() => toggleSetting('pushNotif')}
                                        className={`w-11 h-6 rounded-full p-1 transition-all duration-300 ${userSettings.pushNotif ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${userSettings.pushNotif ? 'translate-x-5' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Privacy */}
                        <div className="space-y-6 pt-6 border-t border-border">
                            <h2 className="text-xl font-bold text-maintext flex items-center gap-2">
                                <Shield className="w-5 h-5 text-purple-500" />
                                Privacy
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-maintext">Public Profile</p>
                                        <p className="text-xs text-subtext">Allow others to see your profile</p>
                                    </div>
                                    <button
                                        onClick={() => toggleSetting('publicProfile')}
                                        className={`w-11 h-6 rounded-full p-1 transition-all duration-300 ${userSettings.publicProfile ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${userSettings.publicProfile ? 'translate-x-5' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="bg-card border border-border rounded-[32px] p-8 flex flex-col justify-between">
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-maintext flex items-center gap-2">
                                <Lock className="w-5 h-5 text-green-500" />
                                {t.securityStatus}
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-green-500/5 border border-green-500/10 rounded-2xl">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <p className="text-sm font-bold text-green-700">{t.accountSecure}</p>
                                </div>

                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="w-full p-4 bg-secondary/50 rounded-2xl border border-border hover:bg-secondary transition-colors text-left group"
                                >
                                    <p className="text-xs text-subtext mb-1">Password</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-maintext">Change Password</span>
                                        <ChevronRight className="w-4 h-4 text-subtext group-hover:text-primary transition-colors" />
                                    </div>
                                </button>

                                <div className="p-4 bg-secondary/50 rounded-2xl border border-border">
                                    <p className="text-xs text-subtext mb-2">{t.twoFactor}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-maintext">{userSettings.twoFactor ? t.enabled : "Disabled"}</span>
                                        <button
                                            onClick={() => toggleSetting('twoFactor')}
                                            className="text-primary text-xs font-bold hover:underline"
                                        >
                                            {userSettings.twoFactor ? "Disable" : "Enable"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleLogout}
                                className="mt-8 w-full py-4 bg-secondary text-maintext border border-border rounded-2xl font-bold text-sm hover:bg-secondary/80 transition-all flex items-center justify-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign out from device
                            </button>

                            <button
                                onClick={() => {
                                    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                                        clearUser();
                                        navigate(AppRoute.LANDING);
                                    }
                                }}
                                className="w-full py-4 bg-red-500/5 text-red-600 border border-red-500/10 rounded-2xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>

                {/* Password Change Modal */}
                {showPasswordModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-card w-full max-w-md rounded-3xl p-6 border border-border shadow-2xl relative"
                        >
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-subtext" />
                            </button>

                            <h2 className="text-xl font-bold text-maintext mb-6">Change Password</h2>

                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-subtext uppercase ml-1 mb-1 block">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-maintext focus:border-primary focus:outline-none"
                                        value={passwordForm.current}
                                        onChange={e => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                                    />
                                </div>
                                <div className="relative">
                                    <label className="text-xs font-bold text-subtext uppercase ml-1 mb-1 block">New Password</label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-maintext focus:border-primary focus:outline-none"
                                        value={passwordForm.new}
                                        onChange={e => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-8 text-subtext hover:text-primary"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-subtext uppercase ml-1 mb-1 block">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-maintext focus:border-primary focus:outline-none"
                                        value={passwordForm.confirm}
                                        onChange={e => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordModal(false)}
                                        className="flex-1 py-3 bg-secondary text-maintext font-bold rounded-xl hover:bg-secondary/80 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
