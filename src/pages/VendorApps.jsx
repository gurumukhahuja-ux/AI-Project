import React, { useState, useEffect } from 'react';
import { Activity, Loader2, Edit2, EyeOff, Plus } from 'lucide-react';
import apiService from '../services/apiService';
import CreateAppModal from '../Components/Admin/CreateAppModal';
import AppDetails from '../Components/Admin/AppDetails';

const VendorApps = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [newAppName, setNewAppName] = useState('');
    const [selectedApp, setSelectedApp] = useState(null);

    const fetchApps = async () => {
        try {
            const data = await apiService.getCreatedAgents();
            setApps(data);
        } catch (err) {
            console.error("Failed to fetch custom apps:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApps();
    }, []);

    const handleCreateApp = async (formData) => {
        try {
            // Map agentUrl to url for backend compatibility
            const payload = {
                ...formData,
                url: formData.agentUrl
            };
            delete payload.agentUrl;

            await apiService.createAgent(payload);
            setNewAppName(formData.agentName);
            setShowSuccess(true);

            // Auto hide success message after 5 seconds
            setTimeout(() => setShowSuccess(false), 5000);

            await fetchApps(); // Refresh list
        } catch (error) {
            console.error("Error creating agent:", error);
            alert("Failed to create app. Please check the console for details.");
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (selectedApp) {
        return (
            <AppDetails
                app={selectedApp}
                onBack={() => setSelectedApp(null)}
                onDelete={() => {
                    fetchApps();
                    setSelectedApp(null);
                }}
                onUpdate={() => fetchApps()}
                isAdmin={false}
            />
        );
    }

    return (
        <div className="space-y-10 pb-12">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-maintext">My Apps</h1>
                    <p className="text-subtext text-sm mt-1">Manage and publish your AI agents</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                    <Plus className="w-4 h-4" /> New App
                </button>
            </div>

            {/* Success Message */}
            {showSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 flex items-center justify-between animate-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-green-700 dark:text-green-400">Success!</h3>
                            <p className="text-green-600 dark:text-green-300">App "{newAppName}" has been created successfully.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowSuccess(false)}
                        className="text-green-700 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200 font-bold text-sm"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Apps List */}
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-secondary text-[10px] text-subtext font-bold uppercase tracking-wider">
                            <th className="px-8 py-5">App Name</th>
                            <th className="px-8 py-5">Pricing</th>
                            <th className="px-8 py-5 text-center">Review Status</th>
                            <th className="px-8 py-5 text-center">Status</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {apps.length > 0 ? (
                            apps.map((app) => (
                                <tr
                                    key={app._id || app.id}
                                    onClick={() => setSelectedApp(app)}
                                    className="hover:bg-secondary transition-colors group cursor-pointer"
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-maintext">{app.agentName || app.name || 'Unnamed App'}</span>
                                            <span className="text-[10px] text-subtext mt-0.5">ID: {(app._id || app.id)?.substring(0, 8)}...</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-medium text-subtext">{app.pricing || 'Free'}</td>
                                    <td className="px-8 py-5 text-center">
                                        {/* Review Status Badge */}
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${app.reviewStatus === 'Approved' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                            app.reviewStatus === 'Rejected' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                                                app.reviewStatus === 'Pending Review' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                                    'bg-secondary text-subtext border-border'
                                            }`}>
                                            {app.reviewStatus || 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${app.status === 'Live' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                            'bg-secondary text-subtext border-border'
                                            }`}>
                                            {app.status || 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-secondary rounded-lg text-subtext hover:text-primary transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                                            <Activity className="w-6 h-6 text-subtext/50" />
                                        </div>
                                        <p className="text-sm text-subtext italic">You haven't created any apps yet.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <CreateAppModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateApp}
            />
        </div>
    );
};

export default VendorApps;
