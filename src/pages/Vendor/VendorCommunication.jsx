import React from 'react';
import { Mail, Shield } from 'lucide-react';

const VendorCommunication = () => {
    // Mock Data for User Support
    const userEmails = [
        { id: 1, user: 'david@client.com', app: 'AI Content Writer', subject: 'Billing question for Pro plan', status: 'Open', date: '2 hours ago' },
        { id: 2, user: 'sarah@startup.io', app: 'Code Helper Pro', subject: 'Feature request: Python 3.12 support', status: 'Replied', date: '1 day ago' },
        { id: 3, user: 'mike@test.org', app: 'Code Helper Pro', subject: 'Login issues', status: 'Closed', date: '3 days ago' },
    ];

    // Mock Data for Admin Support
    const adminMessages = [
        { id: 1, sender: 'Admin', subject: 'Platform Policy Update: Q1 2026', status: 'Unread', date: 'Dec 28, 2025' },
        { id: 2, sender: 'Admin', subject: 'Payout Confirmation #9821', status: 'Read', date: 'Dec 24, 2025' },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
            <h1 className="text-2xl font-bold text-gray-900">Communication Center</h1>

            {/* A) USER SUPPORT */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Mail size={18} />
                        </div>
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">User Support (Email)</h2>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">User Email</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">App</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {userEmails.map((email) => (
                                <tr key={email.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{email.user}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{email.app}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{email.subject}</td>
                                    <td className="px-6 py-4 text-xs text-gray-400 font-medium uppercase tracking-wider">{email.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${email.status === 'Open' ? 'bg-red-50 text-red-600' :
                                                email.status === 'Replied' ? 'bg-yellow-50 text-yellow-600' :
                                                    'bg-gray-100 text-gray-500'
                                            }`}>
                                            {email.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* B) ADMIN SUPPORT */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Shield size={18} />
                        </div>
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Admin Support (Email)</h2>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">From</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Date received</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {adminMessages.map((msg) => (
                                <tr key={msg.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900">{msg.sender}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{msg.subject}</td>
                                    <td className="px-6 py-4 text-xs text-gray-400 font-medium uppercase tracking-wider">{msg.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${msg.status === 'Unread' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {msg.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default VendorCommunication;
