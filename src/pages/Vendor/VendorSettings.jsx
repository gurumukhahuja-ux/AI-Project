import React, { useState, useEffect } from 'react';
import { User, Mail, Building2, Save, Camera, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router';

const VendorSettings = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        companyName: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setFormData({
            name: user.name || '',
            email: user.email || '',
            companyName: user.companyName || ''
        });
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        setIsLoading(true);
        setTimeout(() => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const updatedUser = { ...user, ...formData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setIsLoading(false);
            // alert('Settings saved. Refresh to see changes in header.'); // Replaced with nicer visual feedback if possible, or keep simple
        }, 800);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
                {/* Visual Header Background */}
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                    <div className="absolute inset-0 bg-white/10 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                </div>

                <div className="px-8 pb-8">
                    {/* Avatar Section */}
                    <div className="relative -mt-12 mb-8 flex items-end">
                        <div className="relative group">
                            <div className="w-24 h-24 bg-white rounded-2xl p-1 shadow-lg">
                                <div className="w-full h-full bg-indigo-50 rounded-xl flex items-center justify-center text-3xl font-bold text-indigo-600 border border-indigo-100">
                                    {formData.name ? formData.name.charAt(0).toUpperCase() : <User size={32} />}
                                </div>
                            </div>
                            <button className="absolute bottom-2 -right-2 p-2 bg-gray-900 text-white rounded-lg shadow-lg hover:bg-black transition-colors cursor-pointer" title="Change Avatar">
                                <Camera size={14} />
                            </button>
                        </div>
                        <div className="ml-4 mb-2">
                            <h2 className="text-xl font-bold text-gray-900">{formData.name || 'Vendor Name'}</h2>
                            <div className="flex items-center text-sm text-gray-500 font-medium mt-0.5">
                                <ShieldCheck size={14} className="text-green-500 mr-1" />
                                Verified Partner
                            </div>
                        </div>
                    </div>

                    {/* Form Section */}
                    <form className="max-w-2xl space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Details */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Vendor Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400"
                                            placeholder="admin@company.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Company Details */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Company Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Building2 className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400"
                                            placeholder="Company Ltd."
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-400 font-medium ml-1">Displayed in dashboard header</p>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                            <p className="text-sm text-gray-500">All changes are saved locally.</p>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isLoading}
                                className="bg-gray-900 text-white px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-900/20 active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Saving...' : (
                                    <>
                                        <Save size={18} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VendorSettings;
