import React, { useState, useRef } from 'react';
import { X, Sparkles, Upload, ChevronDown, Wand2, Check } from 'lucide-react';
import SubscriptionModal from './SubscriptionModal';

const CreateAppModal = ({ isOpen, onClose, onSubmit }) => {
    const fileInputRef = useRef(null);
    const initialFormData = {
        agentName: '',
        description: '',
        agentUrl: '',
        category: 'Business OS',
        pricing: 'Free',
        icon: null
    };

    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [iconPreview, setIconPreview] = useState(null);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [touched, setTouched] = useState(false);

    if (!isOpen) return null;

    const resetForm = () => {
        setFormData(initialFormData);
        setIconPreview(null);
        setSubscriptionData(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched(true);
        if (!formData.icon && !iconPreview) {
            return; // Don't submit if no icon
        }
        setIsSubmitting(true);
        try {
            await onSubmit({ ...formData, icon: iconPreview || formData.icon, subscription: subscriptionData });
            resetForm();
            setTouched(false);
            onClose();
        } catch (error) {
            console.error("Failed to create agent:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubscriptionConfirm = (data) => {
        setSubscriptionData(data);
        setShowSubscriptionModal(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, icon: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setIconPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-xl">
            <div className="bg-white w-full max-w-[500px] rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-[#F0F7FF] rounded-xl flex items-center justify-center border border-blue-50">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                                <Sparkles className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#1E293B] tracking-tight">Create New Agent</h2>
                            <p className="text-[12px] text-[#64748B] font-medium">Add a new AI agent to marketplace</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-50 rounded-full transition-all text-slate-400"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
                    {/* Agent Name Section */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#1E293B] uppercase tracking-wider">Agent Name</label>
                        <input
                            type="text"
                            name="agentName"
                            required
                            placeholder="e.g. AIBIZ"
                            value={formData.agentName}
                            onChange={handleChange}
                            className="w-full bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all placeholder:text-[#CBD5E1] font-medium text-[#1E293B]"
                        />
                    </div>

                    {/* Description Section */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#1E293B] uppercase tracking-wider">Description</label>
                        <textarea
                            name="description"
                            required
                            rows={3}
                            placeholder="Describe what your AI agent does..."
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all resize-none placeholder:text-[#CBD5E1] font-medium text-[#1E293B]"
                        />
                    </div>

                    {/* URL and Icon Grid */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-3 space-y-2">
                            <label className="text-[10px] font-bold text-[#1E293B] uppercase tracking-wider block">Agent Live URL</label>
                            <input
                                type="text"
                                name="agentUrl"
                                placeholder="https://yourapp.com"
                                value={formData.agentUrl}
                                onChange={handleChange}
                                className="w-full bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl px-4 py-3.5 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all placeholder:text-[#CBD5E1] font-medium text-[#1E293B]"
                            />
                        </div>
                        <div className="col-span-1 space-y-2">
                            <label className="text-[10px] font-bold text-[#1E293B] uppercase tracking-wider text-center block w-full">Icon</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`h-[52px] bg-[#F8FAFC] border rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all overflow-hidden group ${touched && !iconPreview ? 'border-red-500 bg-red-50/50' : 'border-[#F1F5F9] hover:border-primary/30'
                                    }`}
                            >
                                {iconPreview ? (
                                    <img src={iconPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <Upload className={`w-3.5 h-3.5 ${touched ? 'text-red-400' : 'text-[#94A3B8]'} group-hover:text-primary transition-colors`} />
                                        <span className={`text-[7px] font-bold uppercase tracking-tighter ${touched ? 'text-red-400' : 'text-[#94A3B8]'}`}>
                                            {touched ? 'Required' : 'Upload'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>
                    </div>

                    {/* Category and Pricing */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#1E293B] uppercase tracking-wider">Category</label>
                            <div className="relative group">
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full h-[52px] bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl px-4 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all appearance-none cursor-pointer pr-10 font-medium text-[#1E293B]"
                                >
                                    <option>Business OS</option>
                                    <option>Data & Intelligence</option>
                                    <option>Sales & Marketing</option>
                                    <option>HR & Finance</option>
                                    <option>Design & Creative</option>
                                    <option>Medical & Health AI</option>
                                    <option>General</option>
                                </select>
                                <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#1E293B] uppercase tracking-wider">Pricing Model</label>
                            <button
                                type="button"
                                onClick={() => setShowSubscriptionModal(true)}
                                className={`w-full h-[52px] rounded-xl flex items-center gap-2.5 px-3.5 text-left transition-all border ${subscriptionData
                                    ? 'bg-primary/5 border-primary text-primary'
                                    : 'bg-primary border-transparent text-white'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${subscriptionData ? 'bg-primary text-white' : 'bg-white/15 text-white'
                                    }`}>
                                    {subscriptionData ? <Check className="w-3.5 h-3.5" /> : <Wand2 className="w-3.5 h-3.5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`font-bold text-[11px] leading-tight truncate ${subscriptionData ? 'text-primary' : 'text-white'}`}>
                                        {subscriptionData ? `${subscriptionData.plan} Plan` : 'Subscription'}
                                    </p>
                                    <p className={`text-[8px] font-medium truncate ${subscriptionData ? 'text-primary/60' : 'text-white/60'}`}>
                                        {subscriptionData ? `${subscriptionData.currency.split('(')[1].replace(')', '')} ${subscriptionData.price} / ${subscriptionData.billingCycle}` : 'Monthly/yearly'}
                                    </p>
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 shrink-0 ${subscriptionData ? 'text-primary/40' : 'text-white/40'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-primary text-white h-[56px] rounded-2xl text-base font-bold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                        >
                            {isSubmitting ? "Creating..." : "Create Agent"}
                        </button>
                    </div>
                </form>

                <SubscriptionModal
                    isOpen={showSubscriptionModal}
                    onClose={() => setShowSubscriptionModal(false)}
                    onConfirm={handleSubscriptionConfirm}
                    initialData={subscriptionData}
                />
            </div>
        </div>
    );
};

export default CreateAppModal;
