import React, { useState } from "react";
import { useLocation, useNavigate, Link, Outlet } from "react-router";
import {
    Activity,
    ShoppingBag,
    DollarSign,
    ChevronDown,
    ChevronUp,
    Settings,
    LogOut,
    Bell,
    Search
} from "lucide-react";

const VendorDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isRevenueExpanded, setIsRevenueExpanded] = useState(true);

    const menuItems = {
        management: [
            { id: "overview", label: "Overview", icon: Activity, path: "/vendor/overview" },
            { id: "apps", label: "Apps", icon: ShoppingBag, path: "/vendor/apps" },
        ],
        support: [
            { id: "user-support", label: "User Support", icon: Activity, path: "/vendor/support/user" },
            { id: "admin-support", label: "Admin Support", icon: Activity, path: "/vendor/support/admin" },
            { id: "settings", label: "Settings", icon: Settings, path: "/vendor/settings" },
        ]
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="h-screen flex bg-[#F8F9FB] text-[#2C3E50] overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-68 border-r border-[#E0E4E8] bg-white flex flex-col shrink-0">
                <div className="p-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
                        M
                    </div>
                    <span className="font-bold text-xl tracking-tight text-[#1E293B]">VENDOR</span>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8">
                    <div>
                        <p className="text-[10px] font-bold text-subtext uppercase tracking-[2px] mb-4 px-4 opacity-50">Management</p>
                        <div className="space-y-1">
                            {menuItems.management.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${isActive(item.path)
                                            ? "bg-primary/5 text-primary"
                                            : "text-subtext hover:bg-slate-50 hover:text-maintext"
                                        }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </button>
                            ))}

                            {/* Revenue & Payouts Collapsible */}
                            <div className="space-y-1">
                                <button
                                    onClick={() => setIsRevenueExpanded(!isRevenueExpanded)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-bold ${location.pathname.includes('/revenue')
                                            ? "bg-primary/5 text-primary"
                                            : "text-subtext hover:bg-slate-50 hover:text-maintext"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <DollarSign className="w-4 h-4" />
                                        <span>Revenue & Payouts</span>
                                    </div>
                                    {isRevenueExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>

                                {isRevenueExpanded && (
                                    <div className="pl-11 space-y-1">
                                        <button
                                            onClick={() => navigate("/vendor/revenue/overview")}
                                            className={`w-full text-left px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${isActive("/vendor/revenue/overview")
                                                    ? "text-primary bg-primary/5"
                                                    : "text-subtext hover:text-maintext hover:bg-slate-50"
                                                }`}
                                        >
                                            Overview
                                        </button>
                                        <button
                                            onClick={() => navigate("/vendor/revenue/transactions")}
                                            className={`w-full text-left px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${isActive("/vendor/revenue/transactions")
                                                    ? "text-primary bg-primary/5"
                                                    : "text-subtext hover:text-maintext hover:bg-slate-50"
                                                }`}
                                        >
                                            Transaction History
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="space-y-1">
                            {menuItems.support.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${isActive(item.path)
                                            ? "bg-primary/5 text-primary"
                                            : "text-subtext hover:bg-slate-50 hover:text-maintext"
                                        }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-[#E0E4E8]">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-subtext hover:text-red-500 transition-colors text-sm font-bold">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-[80px] bg-white border-b border-[#E0E4E8] flex items-center justify-between px-10 shrink-0">
                    <div className="flex-1 max-w-xl">
                        <div className="relative group">
                            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-subtext group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search your apps..."
                                className="w-full bg-[#F8F9FB] border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#F0FDF4] text-[#166534] rounded-full border border-[#DCFCE7] text-[11px] font-extrabold tracking-wider">
                            <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            SYSTEMS NOMINAL
                        </div>

                        <button className="relative p-2 text-subtext hover:text-primary transition-colors">
                            <Bell className="w-5 h-5" />
                        </button>

                        <div className="w-[1px] h-10 bg-[#E0E4E8]" />

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-[#1E293B]">Devnsh</p>
                                <p className="text-[10px] text-subtext font-bold uppercase tracking-[1px] opacity-70">PREMIUM PARTNER</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shadow-sm border border-primary/5">
                                D
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-10 bg-[#F8F9FB]">
                    <div className="max-w-[1400px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default VendorDashboard;
