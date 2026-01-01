import React, { useEffect, useState } from 'react';
import AppListTable from '../../Components/Vendor/AppListTable';
import vendorService from '../../services/vendorService';
import { Loader2 } from 'lucide-react';

const VendorApps = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const vendorId = user._id || user.id;

    const fetchApps = async () => {
        if (!vendorId) {
            setLoading(false);
            return;
        }
        try {
            const data = await vendorService.getVendorApps(vendorId);
            setApps(data);
        } catch (err) {
            console.error('Failed to fetch apps:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApps();
    }, [vendorId]);

    const handleAppCreated = (newApp) => {
        // Refresh the apps list
        fetchApps();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">My Apps</h1>
            </div>
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            ) : (
                <AppListTable apps={apps} onAppCreated={handleAppCreated} />
            )}
        </div>
    );
};

export default VendorApps;
