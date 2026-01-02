import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Search, Filter } from 'lucide-react';

const VendorTransactions = () => {
    // Mock transaction data
    const transactions = [
        { id: 'TRX-98765', date: 'Jan 12, 2026', type: 'Payout', amount: '4,500.00', status: 'Processing' },
        { id: 'TRX-98764', date: 'Jan 10, 2026', type: 'Sale', amount: '50.00', status: 'Completed', app: 'AI Writer' },
        { id: 'TRX-98763', date: 'Jan 09, 2026', type: 'Sale', amount: '25.00', status: 'Completed', app: 'Code Helper' },
        { id: 'TRX-98762', date: 'Jan 05, 2026', type: 'Sale', amount: '50.00', status: 'Completed', app: 'AI Writer' },
        { id: 'TRX-98761', date: 'Jan 01, 2026', type: 'Payout', amount: '6,750.00', status: 'Paid' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
                <div className="flex space-x-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search transaction..."
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button className="flex items-center px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                        <Filter className="w-4 h-4 mr-2" /> Filter
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider">App / Details</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.map((trx) => (
                                <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{trx.id}</td>
                                    <td className="px-6 py-4 text-gray-500">{trx.date}</td>
                                    <td className="px-6 py-4">
                                        <div className={`flex items-center space-x-2 ${trx.type === 'Payout' ? 'text-green-600' : 'text-blue-600'}`}>
                                            {trx.type === 'Payout' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                            <span className="font-medium">{trx.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{trx.app || 'Platform Payout'}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">${trx.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${trx.status === 'Completed' || trx.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                trx.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {trx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VendorTransactions;
