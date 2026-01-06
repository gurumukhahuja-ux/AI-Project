import React, { useState, useEffect } from 'react';
import { Activity, Loader2, Edit2, EyeOff } from 'lucide-react';
import apiService from '../../services/apiService';
import CreateAppModal from './CreateAppModal';
import AppDetails from './AppDetails';

const AgentManagement = () => {
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [newAppName, setNewAppName] = useState('');
    const [selectedApp, setSelectedApp] = useState(null);

    const fetchStats = async () => {
        try {
            const data = await apiService.getAdminOverviewStats();
            setStatsData(data);
        } catch (err) {
            console.error("Failed to fetch admin overview stats/inventory:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const formatPricing = (pricing) => {
        if (!pricing) return 'Free';
        if (typeof pricing === 'string') return pricing;
        if (pricing.type === 'Free' || !pricing.plans || pricing.plans.length === 0) return 'Free';

        const plan = pricing.plans[0];
        const currencySymbol = plan.currency?.match(/\(([^)]+)\)/)?.[1] || plan.currency || '$';
        return `${currencySymbol} ${plan.price} / ${plan.billingCycle || 'mo'}`;
    };

    const handleCreateApp = async (formData) => {
        try {
            // Prepare payload for backend
            const payload = {
                agentName: formData.agentName,
                description: formData.description,
                category: formData.category,
                url: formData.agentUrl,
                avatar: formData.icon || "/AGENTS_IMG/default.png",
                pricing: formData.subscription ? {
                    type: formData.subscription.plan === 'Free' ? 'Free' : 'Paid',
                    plans: [{
                        plan: formData.subscription.plan,
                        price: formData.subscription.price,
                        currency: formData.subscription.currency,
                        billingCycle: formData.subscription.billingCycle
                    }]
                } : { type: 'Free', plans: [] }
            };

            await apiService.createAgent(payload);
            setNewAppName(formData.agentName);
            setShowSuccess(true);

            // Auto hide success message after 5 seconds
            setTimeout(() => setShowSuccess(false), 5000);

            await fetchStats(); // Refresh list to show the new agent
        } catch (error) {
            console.error("Error creating agent:", error);
            const errorMsg = error.response?.data?.error || error.message || "Failed to create agent.";
            alert(`⚠️ Error: ${errorMsg}\n\nPlease ensure you are logged in and the backend is running.`);
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
                    fetchStats();
                    setSelectedApp(null);
                }}
                onUpdate={() => fetchStats()}
                isAdmin={true}
            />
        );
    }

    return (
        <div className="space-y-10 pb-12">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-[#1E293B]">My Agents</h1>
            </div>

            {/* Success Message */}
            {showSuccess && (
                <div className="bg-green-50 border border-green-100 rounded-2xl p-6 flex items-center justify-between animate-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-green-900">Success!</h3>
                            <p className="text-green-700">Agent "{newAppName}" has been created successfully and added to your inventory.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowSuccess(false)}
                        className="text-green-700 hover:text-green-900 font-bold text-sm"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Your Apps Card */}
            <div className="bg-white border border-[#E0E4E8] rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-[#E0E4E8] flex items-center justify-between">
                    <h4 className="text-xl font-bold text-[#1E293B]">Your Agents</h4>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <span className="text-lg leading-none">+</span> Create Agents
                    </button>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-[#E0E4E8]">
                    {statsData?.inventory?.length > 0 ? (
                        statsData.inventory.map((app) => (
                            <div
                                key={app.id}
                                onClick={() => setSelectedApp(app)}
                                className="p-6 hover:bg-[#F8F9FB] transition-colors active:bg-slate-50 cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-[#1E293B]">{app.name || 'Unnamed Agent'}</span>
                                        <span className="text-[10px] text-subtext mt-0.5">ID: {app.id?.substring(0, 8)}...</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${app.status === 'Live' || app.status === 'active' || app.status === 'Active'
                                        ? 'bg-green-50 text-green-600 border-green-100'
                                        : 'bg-slate-50 text-slate-500 border-slate-100'
                                        }`}>
                                        {app.status || 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-subtext font-medium">{formatPricing(app.pricing)}</span>
                                        {app.reviewStatus && app.reviewStatus !== 'Approved' && (
                                            <span className={`text-[10px] font-bold uppercase ${app.reviewStatus === 'Pending Review' ? 'text-amber-600' : 'text-slate-400'}`}>
                                                {app.reviewStatus}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 bg-slate-50 rounded-lg text-subtext"><Edit2 className="w-4 h-4" /></button>
                                        <button className="p-2 bg-slate-50 rounded-lg text-subtext"><EyeOff className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center">
                            <p className="text-sm text-subtext italic">No agents found.</p>
                        </div>
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#F8F9FB] text-[10px] text-subtext font-bold uppercase tracking-wider">
                                <th className="px-8 py-5">Agent Name</th>
                                <th className="px-8 py-5">Pricing</th>
                                <th className="px-8 py-5 text-center">Status</th>
                                <th className="px-8 py-5 text-right">Quick Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E0E4E8]">
                            {statsData?.inventory?.length > 0 ? (
                                statsData.inventory.map((app) => (
                                    <tr
                                        key={app.id}
                                        onClick={() => setSelectedApp(app)}
                                        className="hover:bg-[#F8F9FB] transition-colors group cursor-pointer"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-[#1E293B]">{app.name || 'Unnamed Agent'}</span>
                                                <span className="text-[10px] text-subtext mt-0.5">ID: {app.id?.substring(0, 8)}...</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-medium text-subtext">
                                            <div className="flex flex-col gap-1">
                                                <span>{formatPricing(app.pricing)}</span>
                                                {app.reviewStatus && app.reviewStatus !== 'Approved' && (
                                                    <span className={`text-[10px] font-bold uppercase ${app.reviewStatus === 'Pending Review' ? 'text-amber-600' : 'text-slate-400'}`}>
                                                        {app.reviewStatus}
                                                    </span>
                                                )}
                                                {app.deletionStatus === 'Pending' && (
                                                    <span className="text-[10px] font-bold uppercase text-red-500 animate-pulse">
                                                        Deletion Pending
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${app.status === 'Live' || app.status === 'active' || app.status === 'Active'
                                                ? 'bg-green-50 text-green-600 border-green-100'
                                                : 'bg-slate-50 text-slate-500 border-slate-100'
                                                }`}>
                                                {app.status || 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); }}
                                                    className="p-2 hover:bg-surface rounded-lg text-subtext hover:text-primary transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); }}
                                                    className="p-2 hover:bg-surface rounded-lg text-subtext hover:text-red-500 transition-colors"
                                                >
                                                    <EyeOff className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                                                <Activity className="w-6 h-6 text-slate-300" />
                                            </div>
                                            <p className="text-sm text-subtext italic">No agents found in inventory.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CreateAppModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateApp}
            />
        </div>
    );
};

export default AgentManagement;
