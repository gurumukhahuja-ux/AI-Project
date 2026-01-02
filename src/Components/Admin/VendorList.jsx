import React, { useState, useEffect } from 'react';
import { Search, Loader2, Mail, Calendar, ShieldCheck, Building2 } from 'lucide-react';
import apiService from '../../services/apiService';
import { useToast } from '../../Components/Toast/ToastContext';

const VendorList = () => {
    const toast = useToast();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            // Fetch all users
            const allUsers = await apiService.getAllUsers();
            // Filter for vendors only
            const vendorUsers = allUsers.filter(u => u.role === 'vendor');
            setVendors(vendorUsers);
        } catch (err) {
            console.error("Failed to fetch vendors", err);
            toast.error("Failed to load vendors");
        } finally {
            setLoading(false);
        }
    };

    const filteredVendors = vendors.filter(vendor =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-[#1E293B]">Vendors</h2>
                    <p className="text-sm text-subtext">Manage registered vendors and their details</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-subtext" />
                    <input
                        type="text"
                        placeholder="Search vendors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-white border border-[#E0E4E8] rounded-xl text-sm outline-none w-64 focus:ring-2 focus:ring-primary/10"
                    />
                </div>
            </div>

            <div className="bg-white border border-[#E0E4E8] rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-[#F8F9FB] border-b border-[#E0E4E8] text-[11px] font-bold text-subtext uppercase tracking-wider">
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Joined Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Agents</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0E4E8]">
                        {filteredVendors.length > 0 ? (
                            filteredVendors.map((vendor) => (
                                <tr key={vendor.id} className="hover:bg-[#F8F9FB] transition-colors">
                                    <td className="px-6 py-4 font-bold text-[#1E293B]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                                {vendor.name.charAt(0)}
                                            </div>
                                            {vendor.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${vendor.role === 'vendor' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                            vendor.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                'bg-slate-50 text-slate-600 border-slate-100'
                                            }`}>
                                            {vendor.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[#64748B]">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-subtext" />
                                            {vendor.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-[#64748B]">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-subtext" />
                                            {formatDate(vendor.createdAt)} {/** Ensure backend sends createdAt */}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${vendor.isBlocked ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
                                            }`}>
                                            {vendor.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-[#1E293B]">
                                        {vendor.agents?.length || 0}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-subtext">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VendorList;
