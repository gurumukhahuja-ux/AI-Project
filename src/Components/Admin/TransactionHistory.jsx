import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, Loader2, Eye, X, User, DollarSign, Calendar } from 'lucide-react';
import apiService from '../../services/apiService';

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const data = await apiService.getAdminTransactions();
            setTransactions(data);
        } catch (err) {
            console.error("Failed to fetch transactions:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleViewDetails = (transaction) => {
        setSelectedTransaction(transaction);
        setShowDetailsModal(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-[#1E293B]">Transaction History</h1>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-subtext group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search transaction..."
                            className="bg-white border border-[#E0E4E8] rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none min-w-[280px]"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E0E4E8] rounded-xl text-sm font-bold text-subtext hover:bg-slate-50 transition-all">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                </div>
            </div>

            <div className="bg-white border border-[#E0E4E8] rounded-[32px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#F8F9FB] border-b border-[#E0E4E8]">
                            <tr>
                                <th className="px-8 py-4 text-[10px] font-bold text-subtext uppercase tracking-[1.5px]">Transaction ID</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-subtext uppercase tracking-[1.5px]">Date</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-subtext uppercase tracking-[1.5px]">Type</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-subtext uppercase tracking-[1.5px]">App / Details</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-subtext uppercase tracking-[1.5px]">Amount</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-subtext uppercase tracking-[1.5px]">Status</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-subtext uppercase tracking-[1.5px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                            <p className="mt-4 text-sm font-bold text-subtext">Loading history...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : transactions.length > 0 ? (
                                transactions.map((t) => (
                                    <tr key={t.id} className="border-b border-[#F1F5F9] hover:bg-slate-50 transition-colors last:border-0 group">
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-bold text-[#1E293B]">#{t.id.substring(t.id.length - 8).toUpperCase()}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-medium text-[#64748B]">{formatDate(t.date)}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                <span className="text-[11px] font-bold text-[#1E293B] uppercase tracking-wide">{t.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-bold text-[#1E293B] group-hover:text-primary transition-colors">{t.appName}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-black text-[#1E293B]">${t.amount.toFixed(2)}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0FDF4] text-[#166534] rounded-full border border-[#DCFCE7] text-[10px] font-black uppercase tracking-wider">
                                                <div className="w-1.5 h-1.5 bg-[#22C55E] rounded-full" />
                                                {t.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={() => handleViewDetails(t)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-[#1E293B] rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                                                title="View Transaction Details"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                                                <Clock className="w-8 h-8 text-slate-200" />
                                            </div>
                                            <p className="text-[#64748B] text-sm font-medium">No transactions found yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Transaction Details Modal */}
            {showDetailsModal && selectedTransaction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-[#1E293B]">Transaction Details</h2>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Transaction ID & Date */}
                                <div className="bg-[#F8F9FB] rounded-2xl p-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-bold text-subtext uppercase mb-2">Transaction ID</p>
                                            <p className="text-sm font-bold text-[#1E293B]">#{selectedTransaction.id.substring(selectedTransaction.id.length - 12).toUpperCase()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-subtext uppercase mb-2">Date</p>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-subtext" />
                                                <p className="text-sm font-medium text-[#1E293B]">{formatDate(selectedTransaction.date)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* App Details */}
                                <div>
                                    <p className="text-xs font-bold text-subtext uppercase mb-3">App / Product</p>
                                    <div className="bg-white border border-[#E0E4E8] rounded-2xl p-4">
                                        <p className="text-lg font-bold text-[#1E293B]">{selectedTransaction.appName}</p>
                                        <p className="text-xs text-subtext mt-1">{selectedTransaction.type}</p>
                                    </div>
                                </div>

                                {/* Amount Breakdown */}
                                <div>
                                    <p className="text-xs font-bold text-subtext uppercase mb-3">Amount Breakdown</p>
                                    <div className="bg-white border border-[#E0E4E8] rounded-2xl p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-subtext" />
                                                <span className="text-sm font-medium text-subtext">Gross Amount</span>
                                            </div>
                                            <span className="text-sm font-bold text-[#1E293B]">${selectedTransaction.amount.toFixed(2)}</span>
                                        </div>
                                        <div className="border-t border-[#E0E4E8] pt-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-subtext">Platform Fee (50%)</span>
                                                <span className="text-sm font-bold text-amber-600">-${(selectedTransaction.amount * 0.5).toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="border-t border-[#E0E4E8] pt-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-[#1E293B]">Vendor Earnings</span>
                                                <span className="text-lg font-black text-green-600">${(selectedTransaction.amount * 0.5).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status */}
                                <div>
                                    <p className="text-xs font-bold text-subtext uppercase mb-3">Status</p>
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F0FDF4] text-[#166534] rounded-xl border border-[#DCFCE7]">
                                        <div className="w-2 h-2 bg-[#22C55E] rounded-full" />
                                        <span className="text-sm font-bold uppercase">{selectedTransaction.status}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;
