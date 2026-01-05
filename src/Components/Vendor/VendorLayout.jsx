import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Outlet } from 'react-router-dom';

const VendorLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Dynamic Vendor Data
    const [vendorData, setVendorData] = useState({
        name: 'Vendor',
        type: 'Premium Partner' // Default
    });

    React.useEffect(() => {
        const updateVendorData = () => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            setVendorData({
                name: user.companyName || user.name || 'Vendor',
                type: user.companyType || 'Premium Partner',
                avatar: user.avatar || null
            });
        };

        // Initial load
        updateVendorData();

        // Listen for updates
        window.addEventListener('vendorProfileUpdate', updateVendorData);

        return () => {
            window.removeEventListener('vendorProfileUpdate', updateVendorData);
        };
    }, []);

    const appHealth = "All Good";

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="flex-1 flex flex-col min-w-0">
                <Topbar
                    toggleSidebar={toggleSidebar}
                    vendorName={vendorData.name}
                    vendorType={vendorData.type}
                    vendorAvatar={vendorData.avatar}
                    appHealth={appHealth}
                />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default VendorLayout;
