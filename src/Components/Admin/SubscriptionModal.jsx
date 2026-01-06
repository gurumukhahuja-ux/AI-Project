import React, { useState } from 'react';
import { X, Check, Globe, Zap, Crown, Info, ChevronDown } from 'lucide-react';

const SubscriptionModal = ({ isOpen, onClose, onConfirm, initialData }) => {
    const [selectedPlan, setSelectedPlan] = useState(initialData?.plan || 'Basic');
    const [currency, setCurrency] = useState(initialData?.currency || 'United States (USD)');
    const [billingCycle, setBillingCycle] = useState(initialData?.billingCycle || 'Monthly');
    const [price, setPrice] = useState(initialData?.price || '0.00');

    if (!isOpen) return null;

    const plans = [
        { id: 'Free', icon: Zap, info: 'Perfect for starters. 1k messages • Community support.' },
        { id: 'Basic', icon: Zap, info: '10k messages • Basic support. Need more? Get Pro.' },
        { id: 'Pro', icon: Crown, info: 'Unlimited messages • Premium 24/7 support • API Access.' }
    ];

    const currencies = [
        { label: 'India (INR)', value: 'INR' },
        { label: 'United States (USD)', value: 'USD' },
        { label: 'Europe (EUR)', value: 'EUR' },
        { label: 'United Kingdom (GBP)', value: 'GBP' }
    ];

    const recommendedPrices = [99, 199, 299, 399, 499, 999];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-xl">
            <div className="bg-white w-full max-w-[500px] rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-[#1E293B]">Configure Subscription</h2>
                        <p className="text-[12px] text-[#64748B] font-medium">Set up your agent's pricing tiers</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-8 py-6 space-y-8 overflow-y-auto max-h-[70vh]">
                    {/* Plan Selection */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-[#1E293B] uppercase tracking-wider">Select Subscription Plan(s)</label>
                        <div className="grid grid-cols-3 gap-3">
                            {plans.map((plan) => (
                                <button
                                    key={plan.id}
                                    onClick={() => setSelectedPlan(plan.id)}
                                    type="button"
                                    className={`h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border ${selectedPlan === plan.id
                                        ? 'bg-primary/5 border-primary text-primary shadow-sm shadow-primary/10'
                                        : 'bg-[#F8FAFC] border-[#F1F5F9] text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    {plan.id}
                                    {selectedPlan === plan.id && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>

                        {/* Plan Info Box */}
                        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex gap-3">
                            <Info className="w-5 h-5 text-amber-500 shrink-0" />
                            <p className="text-[12px] text-amber-900 leading-relaxed font-medium">
                                <span className="uppercase font-bold mr-1">{selectedPlan}</span>
                                {plans.find(p => p.id === selectedPlan)?.info}
                            </p>
                        </div>
                    </div>

                    {/* Currency Selection */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-[#1E293B] uppercase tracking-wider">Select Currency</label>
                        <div className="relative group">
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl px-5 py-4 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all appearance-none cursor-pointer pr-12 font-medium text-[#1E293B]"
                            >
                                {currencies.map(c => (
                                    <option key={c.value} value={c.label}>{c.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-5 h-5 absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Billing Details */}
                    {selectedPlan !== 'Free' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                                    <span className="text-sm font-bold text-[#1E293B]">{selectedPlan} Plan</span>
                                </div>
                                <div className="bg-[#F1F5F9] rounded-lg p-1 flex">
                                    {['Monthly', 'Yearly'].map((cycle) => (
                                        <button
                                            key={cycle}
                                            type="button"
                                            onClick={() => setBillingCycle(cycle)}
                                            className={`px-3 py-1 rounded-md text-[9px] font-extrabold transition-all ${billingCycle === cycle
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'text-slate-400'
                                                }`}
                                        >
                                            {cycle.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold">$</div>
                                    <input
                                        type="text"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl px-10 py-5 text-lg font-bold text-[#1E293B] outline-none focus:border-primary transition-all"
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                                        <button onClick={() => setPrice((prev) => (parseFloat(prev) + 1).toFixed(2))} className="text-slate-300 hover:text-primary transition-colors"><ChevronDown className="w-3 h-3 rotate-180" /></button>
                                        <button onClick={() => setPrice((prev) => Math.max(0, parseFloat(prev) - 1).toFixed(2))} className="text-slate-300 hover:text-primary transition-colors"><ChevronDown className="w-3 h-3" /></button>
                                    </div>
                                </div>

                                {/* Recommended Prices */}
                                <div className="space-y-2">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Recommended Prices</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {recommendedPrices.map(rp => (
                                            <button
                                                key={rp}
                                                type="button"
                                                onClick={() => setPrice(rp.toFixed(2))}
                                                className="h-10 rounded-lg text-sm font-bold text-slate-600 bg-white border border-[#F1F5F9] hover:border-primary/30 hover:bg-slate-50 transition-all active:scale-95"
                                            >
                                                {rp}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-slate-50 flex items-center justify-between">
                    <button onClick={onClose} className="text-sm font-bold text-[#64748B] hover:text-[#1E293B] transition-colors">Cancel</button>
                    <button
                        onClick={() => onConfirm({
                            plan: selectedPlan,
                            currency,
                            billingCycle,
                            price: selectedPlan === 'Free' ? '0.00' : price
                        })}
                        className="bg-primary text-white px-6 h-12 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        Confirm Subscription Pricing
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionModal;
