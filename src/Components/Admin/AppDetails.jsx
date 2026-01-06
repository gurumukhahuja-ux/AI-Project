import React, { useState } from 'react';
import { Shield, Check, Info, ArrowLeft, Trash2, Globe, Loader2, X, Edit2, User } from 'lucide-react';
import apiService from '../../services/apiService';

import { getUserData } from '../../userStore/userData';
const AppDetails = ({ app, onBack, onDelete, onUpdate, isAdmin: propsIsAdmin }) => {
    const [status, setStatus] = useState(app ? (app.status || 'Inactive') : 'Inactive');
    const [reviewStatus, setReviewStatus] = useState(app ? (app.reviewStatus || 'Draft') : 'Draft');
    const [deletionStatus, setDeletionStatus] = useState(app ? (app.deletionStatus || 'None') : 'None');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const userData = getUserData();
    const isAdmin = propsIsAdmin !== undefined ? propsIsAdmin : (userData?.role === 'admin');

    const [isEditingUrl, setIsEditingUrl] = useState(false);
    const [tempUrl, setTempUrl] = useState(app ? (app.url || '') : '');
    const [isSavingUrl, setIsSavingUrl] = useState(false);

    const firstPlan = app.pricing?.plans?.[0] || {};
    const priceValue = parseFloat(firstPlan.price || 0);
    const usageCount = app.usageCount || 0;

    // Safely format currency to avoid RangeError
    let estRevenue = '';
    try {
        const rawCurrency = firstPlan.currency || 'USD';
        // Extract 3-letter code if it's in "Name (ISO)" format
        const currencyCode = rawCurrency.includes('(')
            ? rawCurrency.match(/\(([^)]+)\)/)?.[1]
            : rawCurrency;

        estRevenue = (priceValue * usageCount).toLocaleString(undefined, {
            style: 'currency',
            currency: (currencyCode && currencyCode.length === 3) ? currencyCode.toUpperCase() : 'USD'
        });
    } catch (e) {
        // Fallback for invalid currency codes
        estRevenue = `${firstPlan.currency || '$'} ${(priceValue * usageCount).toFixed(2)}`;
    }

    const formatPricing = (pricing) => {
        if (!pricing) return 'Free';
        if (typeof pricing === 'string') return pricing;
        if (pricing.type === 'Free' || !pricing.plans || pricing.plans.length === 0) return 'Free';

        const plan = pricing.plans[0];
        const currencySymbol = plan.currency?.match(/\(([^)]+)\)/)?.[1] || plan.currency || '$';
        return `${currencySymbol} ${plan.price} / ${plan.billingCycle || 'mo'}`;
    };

    const isPaid = app && app.pricing && app.pricing.type === 'Paid' && app.pricing.plans && app.pricing.plans.length > 0;

    if (!app) return null;

    const handleGoLive = async () => {
        try {
            setIsUpdating(true);
            await apiService.updateAgent(app._id || app.id, { status: 'active' });
            setStatus('active');
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to go live:", error);
            alert("Failed to update status.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSubmitForReview = async () => {
        try {
            setIsUpdating(true);
            const updated = await apiService.submitForReview(app._id || app.id);
            setReviewStatus('Pending Review');
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to submit review:", error);
            alert("Failed to submit for review.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this app? This action cannot be undone.")) return;

        try {
            setIsDeleting(true);
            const agentId = app._id || app.id;
            const res = await apiService.deleteAgent(agentId);

            // If response indicates pending status, update local state instead of closing
            if (res && res.deletionStatus === 'Pending') {
                setDeletionStatus('Pending');
                alert("Deletion request sent to Admin for approval.");
            } else {
                if (onDelete) onDelete();
            }
        } catch (error) {
            console.error("Failed to delete app:", error);
            alert("Failed to delete app.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleUpdateUrl = async () => {
        if (!tempUrl.trim()) return;
        try {
            setIsSavingUrl(true);
            await apiService.updateAgent(app._id || app.id, { url: tempUrl });
            // Update local app object prop if possible or just rely on parent refresh
            app.url = tempUrl;
            setIsEditingUrl(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to update URL:", error);
            alert("Failed to update URL.");
        } finally {
            setIsSavingUrl(false);
        }
    };

    return (
        <div className="bg-[#F8F9FB] min-h-screen">
            {/* Main Header / Top Bar Area */}
            <div className="bg-white border-b border-[#E0E4E8] py-4 px-8 mb-6">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        {/* Agent Logo / Shield Icon */}
                        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center border border-[#E0E4E8] shadow-sm overflow-hidden">
                            {app.avatar ? (
                                <img src={app.avatar} alt={app.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-10 h-10 bg-[#3B82F6] rounded-lg flex items-center justify-center text-white">
                                    <Shield className="w-6 h-6" />
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <h1 className="text-3xl font-bold text-[#1E293B] uppercase tracking-tight">
                                    {app.name || app.agentName}
                                </h1>
                            </div>
                            <div className="flex items-center gap-2">
                                {(status === 'Live' || status === 'active' || status === 'Active') ? (
                                    <span className="bg-[#F0FDF4] text-[#166534] px-3 py-1 rounded-full text-xs font-bold border border-[#DCFCE7]">
                                        Live
                                    </span>
                                ) : (
                                    reviewStatus === 'Approved' ? (
                                        <span className="bg-[#F0FDF4] text-[#166534] px-3 py-1 rounded-full text-xs font-bold border border-[#DCFCE7]">
                                            Approved
                                        </span>
                                    ) : reviewStatus === 'Pending Review' ? (
                                        <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold border border-amber-100">
                                            Pending Review
                                        </span>
                                    ) : reviewStatus === 'Rejected' ? (
                                        <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100">
                                            Rejected
                                        </span>
                                    ) : (
                                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">
                                            Draft
                                        </span>
                                    )
                                )}
                                {deletionStatus === 'Pending' && (
                                    <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100 animate-pulse">
                                        Deletion Pending
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="bg-white border border-[#E0E4E8] text-[#64748B] px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all font-sans flex items-center gap-2 active:scale-95"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to List
                        </button>

                        {/* Vendor Action: Submit for Review */}
                        {!isAdmin && (reviewStatus === 'Draft' || reviewStatus === 'Rejected') ? (
                            <button
                                onClick={handleSubmitForReview}
                                disabled={isUpdating}
                                className="bg-primary text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 font-sans"
                            >
                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                                Submit Review
                            </button>
                        ) : null}

                        {/* Admin Action: Force Live / Go Live */}
                        {isAdmin && status !== 'Live' && status !== 'active' && status !== 'Active' ? (
                            <button
                                onClick={handleGoLive}
                                disabled={isUpdating}
                                className="bg-[#22C55E] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#16A34A] transition-all flex items-center gap-2 shadow-sm font-sans active:scale-95"
                            >
                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Go Live
                            </button>
                        ) : null}

                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-[#EF4444] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#DC2626] transition-all flex items-center gap-2 shadow-sm font-sans active:scale-95"
                        >
                            {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                            {deletionStatus === 'Pending' ? 'Deletion Pending' : 'Delete App'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-[1400px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Main Content Column */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Rejection Alert */}
                    {reviewStatus === 'Rejected' && app.rejectionReason && (
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-4">
                            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white shrink-0">
                                <Info className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-red-900 font-bold mb-1">Feedback from Admin</h4>
                                <p className="text-red-700 text-sm italic">"{app.rejectionReason}"</p>
                                <p className="text-red-600 text-xs mt-3 font-medium">Please address these points and submit for review again.</p>
                            </div>
                        </div>
                    )}

                    {/* About Section */}
                    <div className="bg-white border border-[#E0E4E8] rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center gap-2 text-[#64748B] mb-4">
                            <Info className="w-4 h-4" />
                            <h3 className="text-[11px] font-bold uppercase tracking-[1px]">About this App</h3>
                        </div>
                        <div className="bg-[#F8F9FB] rounded-xl p-6 border border-[#F1F5F9]">
                            <p className="text-[#1E293B] text-lg font-medium leading-relaxed">
                                {app.description || 'No description provided.'}
                            </p>
                        </div>
                    </div>

                    {/* App Configuration Card */}
                    <div className="bg-white border border-[#E0E4E8] rounded-2xl p-8 shadow-sm scale-in-center">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2.5 text-[#64748B]">
                                <Globe className="w-5 h-5 text-blue-500" />
                                <h3 className="text-[11px] font-bold uppercase tracking-[1.5px]">App Configuration</h3>
                            </div>
                            {!isEditingUrl && (
                                <button
                                    onClick={() => {
                                        setTempUrl(app.url || '');
                                        setIsEditingUrl(true);
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg hover:bg-blue-100 transition-all uppercase tracking-wider active:scale-95 shadow-sm"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    Edit URL
                                </button>
                            )}
                        </div>

                        <div className="bg-[#F8F9FB] rounded-2xl p-6 border border-[#F1F5F9]">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                        Deployment URL
                                    </p>
                                    {isEditingUrl ? (
                                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <input
                                                type="text"
                                                value={tempUrl}
                                                onChange={(e) => setTempUrl(e.target.value)}
                                                placeholder="https://yourapp.com"
                                                className="flex-1 bg-white border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-medium text-[#1E293B] shadow-sm"
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleUpdateUrl}
                                                disabled={isSavingUrl}
                                                className="p-2.5 bg-[#22C55E] text-white rounded-xl hover:bg-[#16A34A] transition-all disabled:opacity-50 shadow-md shadow-green-100 active:scale-95"
                                                title="Save changes"
                                            >
                                                {isSavingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => setIsEditingUrl(false)}
                                                disabled={isSavingUrl}
                                                className="p-2.5 bg-white border border-[#E2E8F0] text-slate-500 rounded-xl hover:bg-slate-50 transition-all active:scale-95"
                                                title="Cancel"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-blue-600 font-bold text-xl hover:underline cursor-pointer break-all tracking-tight pl-3">
                                            {app.url || 'No URL configured'}
                                        </p>
                                    )}
                                </div>

                                <div className="bg-blue-50/50 border border-blue-100/50 rounded-xl p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                        <Info className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <p className="text-[12px] font-medium text-blue-700 leading-snug">
                                        This URL is where users will be redirected when using your agent in the marketplace.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Usage Summary Card */}
                    <div className="bg-white border border-[#E0E4E8] rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center gap-2.5 text-[#64748B] mb-8">
                            <User className="w-5 h-5 text-blue-500" />
                            <h3 className="text-[11px] font-bold uppercase tracking-[1.5px]">User Performance</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-[#F8F9FB] rounded-2xl p-6 border border-[#F1F5F9] flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Active Installs</p>
                                    <p className="text-4xl font-bold text-[#3B82F6]">{app.usageCount || 0}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-blue-500" />
                                </div>
                            </div>

                            <div className="bg-[#F8F9FB] rounded-2xl p-6 border border-[#F1F5F9] flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Est. Revenue</p>
                                    <p className="text-3xl font-bold text-[#22C55E]">{isPaid ? estRevenue : '$0.00'}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                                    <Shield className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">

                    {/* Plan Distribution Card */}
                    <div className="bg-white border border-[#E0E4E8] rounded-2xl p-8 shadow-sm">
                        <h3 className="text-[11px] font-bold text-[#64748B] uppercase tracking-[1px] mb-8">Plan Distribution</h3>

                        <div className="space-y-4">
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between group hover:border-blue-100 transition-colors">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Tier Type</span>
                                    <span className="text-sm font-bold text-[#1E293B]">{isPaid ? 'Paid Tier' : 'Free Tier'}</span>
                                </div>
                                <div className="flex flex-col items-end gap-0.5">
                                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Usage</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xl font-bold text-blue-600">
                                            {app.usageCount || 0}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-400">Users</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#F8F9FB] rounded-xl p-4 border border-[#F1F5F9] flex items-center justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Plan Details</span>
                                    <span className="text-sm font-medium text-[#1E293B]">
                                        {firstPlan.name || 'Standard Plan'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                                        {firstPlan.interval || 'Monthly'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick App Info Card */}
                    <div className="bg-white border border-[#E0E4E8] rounded-2xl p-8 shadow-sm">
                        <h3 className="text-[11px] font-bold text-[#64748B] uppercase tracking-[1.5px] mb-8">Quick App Info</h3>

                        <div className="bg-[#F8F9FB] rounded-2xl p-6 border border-[#F1F5F9] space-y-6">
                            <div className="flex items-start justify-between py-1 border-b border-slate-200/50">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Model</span>
                                    <span className="text-sm font-bold text-[#1E293B]">{isPaid ? 'Fixed Price' : 'Free'}</span>
                                </div>
                            </div>

                            <div className="flex items-start justify-between py-1 border-b border-slate-200/50">
                                <div className="flex flex-col gap-0.5 w-full">
                                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Current Price</span>
                                    <span className="text-sm font-bold text-blue-600 break-words line-clamp-2">
                                        {formatPricing(app.pricing)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start justify-between py-1">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Visibility</span>
                                    <span className={`text-sm font-bold ${(status === 'Live' || status === 'active' || status === 'Active') ? 'text-[#22C55E]' : 'text-amber-500'}`}>
                                        {(status === 'Live' || status === 'active' || status === 'Active') ? 'Public Marketplace' : 'Private Draft'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AppDetails;
