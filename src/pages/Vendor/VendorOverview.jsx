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
                    <h1 className="text-3xl font-black text-maintext tracking-tight">User Overview</h1>
                    <p className="text-subtext font-medium mt-1">Review active users across your applications.</p>
                </div>
            </div>

            {/* USER LIST TABLE */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-secondary/30 border-b border-border text-xs font-black text-subtext uppercase tracking-widest">
                                <th className="px-6 py-4">User Name</th>
                                <th className="px-6 py-4">User Email</th>
                                <th className="px-6 py-4">App / Agent</th>
                                <th className="px-6 py-4">Subscription Plan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-secondary/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-maintext">{u.name}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-subtext">{u.email}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-maintext">{u.app}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${u.plan === 'Pro' ? 'bg-purple-500/10 text-purple-500' :
                                            u.plan === 'Basic' ? 'bg-blue-500/10 text-blue-500' :
                                                'bg-secondary text-subtext'
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
                    <div className="p-8 text-center text-subtext font-medium">
                        No active users found.
                    </div>
                )}
            </div>

        </div>
    );
};

export default VendorOverview;
