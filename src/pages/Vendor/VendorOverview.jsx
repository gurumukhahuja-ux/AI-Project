import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VendorOverview = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || user._id || localStorage.getItem('userId');

    useEffect(() => {
        const fetchUsers = async () => {
            if (!userId) return;
            try {
                const response = await axios.get(`http://localhost:5000/api/agents/vendor-users/${userId}`);
                setUsers(response.data);
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [userId]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">User Overview</h1>
                    <p className="text-gray-500 font-medium mt-1">Review active users across your applications.</p>
                </div>
            </div>

            {/* USER LIST TABLE */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-widest">
                                <th className="px-6 py-4">User Name</th>
                                <th className="px-6 py-4">User Email</th>
                                <th className="px-6 py-4">App / Agent</th>
                                <th className="px-6 py-4">Subscription Plan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{u.name}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-500">{u.email}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-700">{u.app}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${u.plan === 'Pro' ? 'bg-purple-50 text-purple-600' :
                                                u.plan === 'Basic' ? 'bg-blue-50 text-blue-600' :
                                                    'bg-gray-100 text-gray-500'
                                            }`}>
                                            {u.plan}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {users.length === 0 && (
                    <div className="p-8 text-center text-gray-400 font-medium">
                        No active users found.
                    </div>
                )}
            </div>

        </div>
    );
};

export default VendorOverview;
