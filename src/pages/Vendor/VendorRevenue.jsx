import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, CreditCard, Calendar, Clock, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router';

const VendorRevenue = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    const [stats, setStats] = useState({
        grossRevenue: 0,
        platformFees: 0,
        payouts: 0,
        netEarnings: 0,
        pending: 0
    });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || user._id || localStorage.getItem('userId');

    useEffect(() => {
        const fetchRevenue = async () => {
            if (!userId) return;
            try {
                const response = await axios.get(`http://localhost:5000/api/agents/vendor/${userId}/transactions`);
                setStats(response.data.summary);
                setTransactions(response.data.transactions);
            } catch (error) {
                console.error("Failed to fetch revenue", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRevenue();
    }, [userId]);

    // Format helpers
    const fmt = (num) => (num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Real Data Mapped
    const overall = {
        grossRevenue: fmt(stats.grossRevenue),
        platformFees: fmt(stats.platformFees),
        payouts: fmt(stats.payouts),
        netEarnings: fmt(stats.netEarnings),
        pending: fmt(stats.pending)
    };

    // Derived App Breakdown (Simple grouping from transactions for demo, or empty if backend doesn't group yet)
    // For now, we'll leave appBreakdown empty or derived if possible, but backend didn't return it explicitly.
    // Let's rely on an empty list or derived logic if user insists.
    const appBreakdown = [];

    // Map transactions to history format
    const transactionList = transactions.map(t => ({
        id: t._id,
        name: t.description, // Using description as name/app for now
        date: new Date(t.date).toLocaleDateString(),
        amount: fmt(t.amount),
        status: t.status
    }));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Revenue & Payouts</h1>

                {/* Tabs */}
                <div className="flex p-1 bg-gray-100 rounded-xl">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'overview'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'history'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Transaction History
                    </button>
                </div>
            </div>

            {activeTab === 'overview' ? (
                /* OVERVIEW TAB */
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Financial Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Gross Revenue */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <TrendingUp size={64} className="text-blue-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Gross Revenue</h3>
                            <div className="flex items-baseline space-x-1">
                                <span className="text-3xl font-black text-gray-900">${overall.grossRevenue}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Before platform fees</p>
                        </div>

                        {/* Total Payouts */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <CreditCard size={64} className="text-green-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Payouts Received</h3>
                            <div className="flex items-baseline space-x-1">
                                <span className="text-3xl font-black text-green-600">${overall.payouts}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Deposited to bank account</p>
                        </div>

                        {/* Net Earnings */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <DollarSign size={64} className="text-blue-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Net Earnings</h3>
                            <div className="flex items-baseline space-x-1">
                                <span className="text-3xl font-black text-blue-600">${overall.netEarnings}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Gross Revenue - Platform Fees</p>
                        </div>
                    </div>

                    {/* App-wise Breakdown */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900">App-wise Net Earnings</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">App Name</th>
                                        <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Net Earnings</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {appBreakdown.map((app) => (
                                        <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-900 bg-gray-50/30">{app.name}</td>
                                            <td className="px-6 py-4 font-bold text-green-600 text-right text-lg">${app.net}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                /* TRANSACTION HISTORY TAB */
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Transaction History</h3>
                            <p className="text-sm text-gray-500 mt-1">Detailed revenue breakdown by period</p>
                        </div>
                        <div className="flex gap-2">
                            {/* Optional Filter Placeholder */}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <BarChart3 size={14} />
                                            Description
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Calendar size={14} />
                                            Date
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Clock size={14} />
                                            Status
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <CreditCard size={14} />
                                            Amount
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactionList.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 font-bold text-gray-900 bg-gray-50/30 group-hover:bg-gray-100/50 transition-colors">
                                            {item.name}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-semibold text-gray-700">{item.date}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${item.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                    item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                }`}>{item.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-blue-600 text-lg">${item.amount}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorRevenue;
