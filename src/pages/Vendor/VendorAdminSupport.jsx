import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Calendar, CheckCircle2 } from 'lucide-react';

const VendorAdminSupport = () => {
    const [adminMessages, setAdminMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || user._id || localStorage.getItem('userId');

    useEffect(() => {
        const fetchMessages = async () => {
            if (!userId) return;
            try {
                const response = await axios.get(`http://localhost:5000/api/agents/vendor/${userId}/support?type=AdminSupport`);

                // Map API data to UI format
                const mapped = response.data.map(t => ({
                    id: t._id,
                    from: t.senderId === 'Admin' ? 'Admin' : 'System',
                    subject: t.subject,
                    date: new Date(t.createdAt).toLocaleDateString(),
                    status: t.status
                }));
                setAdminMessages(mapped);
            } catch (error) {
                console.error("Failed to fetch admin messages", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, [userId]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

            {/* Header / Info Banner */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Support</h1>
                        <p className="text-gray-500 text-sm max-w-2xl">
                            Official channel for AI-Mall administration updates and inquiries.
                        </p>
                    </div>
                    <a
                        href="mailto:admin@aimall.com?subject=Vendor%20Inquiry"
                        className="flex items-center space-x-2 bg-indigo-600 px-4 py-2 rounded-xl text-white text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
                    >
                        <ShieldAlert size={18} />
                        <span>Contact Admin</span>
                    </a>
                </div>
            </div>

            {/* Admin Messages Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <ShieldAlert size={18} />
                        </div>
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Admin Messages</h2>
                    </div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Showing {adminMessages.length} Messages</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">From</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Date Received</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {adminMessages.map((msg) => (
                                <tr key={msg.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                                    <td className="px-6 py-4 font-bold text-gray-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black">A</div>
                                        {msg.from}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{msg.subject}</td>
                                    <td className="px-6 py-4 text-xs text-gray-400 font-medium uppercase tracking-wider">{msg.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${msg.status === 'Open' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                            msg.status === 'Responded' ? 'bg-green-50 text-green-600 border border-green-100' :
                                                'bg-gray-100 text-gray-500 border border-gray-200'
                                            }`}>
                                            {msg.status === 'Responded' && <CheckCircle2 size={12} className="mr-1" />}
                                            {msg.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {adminMessages.length === 0 && (
                    <div className="p-12 text-center">
                        <p className="text-gray-400 font-medium">No admin messages.</p>
                    </div>
                )}
            </div>

            {/* How Support Works Info */}
            <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-6">
                <div className="flex items-start space-x-4">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">How Admin Support Works</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-2 mr-3 flex-shrink-0"></span>
                                <p className="text-sm text-gray-600">
                                    <span className="font-bold text-gray-900">Send an inquiry</span> using the <span className="font-bold text-indigo-700">"Contact Admin"</span> button above.
                                </p>
                            </li>
                            <li className="flex items-start">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-2 mr-3 flex-shrink-0"></span>
                                <p className="text-sm text-gray-600">
                                    <span className="font-bold text-gray-900">Our team receives it instantly</span> and prioritizes vendor tickets.
                                </p>
                            </li>
                            <li className="flex items-start">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-2 mr-3 flex-shrink-0"></span>
                                <p className="text-sm text-gray-600">
                                    <span className="font-bold text-gray-900">You receive a reply</span> directly to your registered vendor email address.
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorAdminSupport;
