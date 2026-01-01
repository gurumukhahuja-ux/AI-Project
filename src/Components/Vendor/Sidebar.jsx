import React from 'react';
import { LayoutDashboard, Box, DollarSign, Settings, LogOut, Users, ShieldAlert } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const menuItems = [
        { name: 'Overview', icon: LayoutDashboard, path: '/vendor/overview' },
        { name: 'Apps', icon: Box, path: '/vendor/apps' },
        { name: 'Revenue & Payouts', icon: DollarSign, path: '/vendor/revenue' },
        { name: 'User Support', icon: Users, path: '/vendor/user-support' },
        { name: 'Admin Support', icon: ShieldAlert, path: '/vendor/admin-support' },
        { name: 'Settings', icon: Settings, path: '/vendor/settings' },
    ];

    const isActive = (path) => {
        if (location.pathname === path) return true;
        if (path !== '/vendor/overview' && location.pathname.startsWith(path) && path !== '/vendor/revenue') return true;
        return false;
    };

    const isGroupActive = (item) => {
        if (item.subItems) {
            return item.subItems.some(sub => location.pathname === sub.path);
        }
        return false;
    };

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`fixed inset-0 bg-gray-800 bg-opacity-50 z-20 md:hidden transition-opacity duration-200 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={toggleSidebar}
            />

            {/* Sidebar */}
            <div className={`fixed lg:sticky top-0 left-0 h-screen w-68 bg-white border-r border-gray-100 flex flex-col z-40 transition-all duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Brand Logo Section */}
                <div className="h-16 flex items-center px-8 border-b border-gray-50/50">
                    <div className="flex items-center space-x-3">
                        {/* Logo Removed as per request */}
                        <span className="text-xl font-black text-gray-900 tracking-tighter uppercase">Vendor</span>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
                    <div className="px-4 mb-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Management</p>
                    </div>
                    {menuItems.map((item) => {
                        const active = isActive(item.path);
                        const groupActive = isGroupActive(item);

                        return (
                            <div key={item.name}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all group ${active || groupActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon size={20} className={`mr-3 transition-colors ${(active || groupActive) ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                    {item.name}
                                </Link>

                                {/* Sub-menu */}
                                {item.subItems && (active || groupActive) && (
                                    <div className="ml-4 mt-1 space-y-1 pl-4 border-l-2 border-gray-100">
                                        {item.subItems.map((sub) => {
                                            const subActive = location.pathname === sub.path;
                                            return (
                                                <Link
                                                    key={sub.name}
                                                    to={sub.path}
                                                    className={`block px-4 py-2 rounded-lg text-xs font-bold transition-all ${subActive
                                                        ? 'text-blue-600 bg-blue-50'
                                                        : 'text-gray-400 hover:text-gray-600'
                                                        }`}
                                                >
                                                    {sub.name}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Bottom Section: Go to AI Mall */}
                <div className="p-4 border-t border-gray-50 space-y-2">
                    <button
                        onClick={() => navigate('/dashboard/marketplace')}
                        className="flex items-center w-full px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all group"
                    >
                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400 mr-3 group-hover:bg-red-100 group-hover:text-red-500 transition-colors">
                            <LogOut size={20} className="rotate-180" />
                        </div>
                        Go to AI Mall
                    </button>
                </div>

            </div>
        </>
    );
};

export default Sidebar;
