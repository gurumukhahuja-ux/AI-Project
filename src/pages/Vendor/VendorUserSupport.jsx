import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Clock, AlertCircle } from 'lucide-react';

const VendorUserSupport = () => {
    const [userEmails, setUserEmails] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || user._id || localStorage.getItem('userId');

    useEffect(() => {
        const fetchTickets = async () => {
            if (!userId) return;
            try {
                const response = await axios.get(`http://localhost:5000/api/agents/vendor/${userId}/support?type=UserSupport`);

                // Map API data to UI format
                const mapped = response.data.map(t => ({
                    id: t._id,
                    user: t.senderEmail,
                    app: t.appName || 'General',
                    subject: t.subject,
                    status: t.status,
                    date: new Date(t.createdAt).toLocaleDateString() + ' ' + new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
                setUserEmails(mapped);
            } catch (error) {
                console.error("Failed to fetch tickets", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, [userId]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

            {/* Header / Info Banner */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">User Support (Email)</h1>
                        <p className="text-gray-500 text-sm max-w-2xl">
                            Manage user inquiries here. Replies are sent via email.
                        </p>
                    </div>
                    <a
                        href="mailto:?subject=Support%20Reply"
                        className="flex items-center space-x-2 bg-blue-600 px-4 py-2 rounded-xl text-white text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors"
                    >
                        <Mail size={18} />
                        <span>Compose Email</span>
                    </a>
                </div>

                <div className="mt-6 flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <AlertCircle size={20} className="text-gray-400 mr-3 flex-shrink-0" />
                    <p className="text-xs text-gray-500 font-medium">
                        <strong>Note:</strong> All replies are sent directly to the user's registered email address via your connected SMTP server.
                        Please ensure your <span className="underline decoration-dotted cursor-pointer hover:text-gray-800">SMTP settings</span> are configured correctly.
                    </p>
                </div>
            </div>

            {/* Email List Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Mail size={18} />
                        </div>
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Inbox</h2>
                    </div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Showing {userEmails.length} Tickets</span>
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
                                <tr key={email.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                                    <td className="px-6 py-4 font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{email.user}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{email.app}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{email.subject}</td>
                                    <td className="px-6 py-4 text-xs text-gray-400 font-medium uppercase tracking-wider">{email.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${email.status === 'Open' ? 'bg-red-50 text-red-600 border border-red-100' :
                                            email.status === 'Responded' ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' :
                                                'bg-gray-100 text-gray-500 border border-gray-200'
                                            }`}>
                                            {email.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {userEmails.length === 0 && (
                    <div className="p-12 text-center">
                        <p className="text-gray-400 font-medium">No support tickets found.</p>
                    </div>
                )}
            </div>

            {/* How Support Works Info */}
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
                <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">How User Support Works</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-2 mr-3 flex-shrink-0"></span>
                                <p className="text-sm text-gray-600">
                                    <span className="font-bold text-gray-900">Users email you</span> directly at your support address (e.g., support@yourcompany.com).
                                </p>
                            </li>
                            <li className="flex items-start">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-2 mr-3 flex-shrink-0"></span>
                                <p className="text-sm text-gray-600">
                                    <span className="font-bold text-gray-900">You receive inquiries here</span> and in your external inbox instantly.
                                </p>
                            </li>
                            <li className="flex items-start">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-2 mr-3 flex-shrink-0"></span>
                                <p className="text-sm text-gray-600">
                                    <span className="font-bold text-gray-900">You reply via email</span> (or using the 'Compose' button above), and the user receives your response directly in their registered email.
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorUserSupport;
