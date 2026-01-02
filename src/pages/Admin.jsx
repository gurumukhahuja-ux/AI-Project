import React, { useState } from "react";
import {
  Activity,
  Users,
  ShoppingBag,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle,
  Settings,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Menu,
  X
} from "lucide-react";

// Sub-Components
import AdminOverview from "../components/Admin/AdminOverview";
import Approvals from "../components/Admin/Approvals";
import UserManagement from "../components/Admin/UserManagement";
import VendorManagement from "../components/Admin/VendorManagement";
import AgentManagement from "../components/Admin/AgentManagement";
import Financials from "../components/Admin/Financials";
import TransactionHistory from "../components/Admin/TransactionHistory";
import Complaints from "../components/Admin/Complaints";
import AccessControl from "../components/Admin/AccessControl";
import PlatformSettings from "../components/Admin/PlatformSettings";
import AdminSupport from "../components/Admin/Support";
import VendorList from "../components/Admin/VendorList";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSubTab, setActiveSubTab] = useState("overview");
  const [isRevenueExpanded, setIsRevenueExpanded] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ... (navigation remains same)
  const navigation = {
    management: [
      { id: "overview", label: "Overview", icon: Activity },
      { id: "agents", label: "My Agents", icon: ShoppingBag },
      {
        id: "finance",
        label: "Revenue & Payouts",
        icon: DollarSign,
        hasSub: true,
        subItems: [
          { id: "overview", label: "Overview" },
          { id: "transactions", label: "Transaction History" }
        ]
      },
      { id: "complaints", label: "User Support", icon: AlertTriangle },
      { id: "users", label: "User Management", icon: Users },
      { id: "vendors", label: "Vendor Support", icon: UserCheck },
    ],
    governance: [
      { id: "approvals", label: "Approvals", icon: CheckCircle },
      { id: "roles", label: "Vendors", icon: Shield },
      { id: "settings", label: "Settings", icon: Settings },
    ]
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return <AdminOverview />;
      case "approvals": return <Approvals />;
      case "users": return <UserManagement />;
      case "vendors": return <VendorManagement />;
      case "agents": return <AgentManagement />;
      case "finance":
        return activeSubTab === "transactions" ? <TransactionHistory /> : <Financials />;
      case "complaints": return <AdminSupport />;
      case "roles": return <VendorList />;
      case "settings": return <PlatformSettings />;
      default: return <AdminOverview />;
    }
  };

  const NavItem = ({ item }) => {
    const isMainActive = activeTab === item.id;

    return (
      <div className="space-y-1">
        <button
          onClick={() => {
            setActiveTab(item.id);
            if (!item.hasSub) setSidebarOpen(false); // Close sidebar on mobile after selection
            if (item.hasSub) {
              setIsRevenueExpanded(!isRevenueExpanded);
            }
          }}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-bold ${isMainActive
            ? "bg-primary/5 text-primary"
            : "text-subtext hover:bg-slate-50 hover:text-maintext"
            }`}
        >
          <div className="flex items-center gap-3">
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </div>
          {item.hasSub && (isRevenueExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
        </button>

        {item.hasSub && isRevenueExpanded && (
          <div className="pl-11 space-y-1">
            {item.subItems.map(sub => (
              <button
                key={sub.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setActiveSubTab(sub.id);
                  setSidebarOpen(false); // Close sidebar on mobile
                }}
                className={`w-full text-left px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${isMainActive && activeSubTab === sub.id
                  ? "text-primary bg-primary/5"
                  : "text-subtext hover:text-maintext hover:bg-slate-50"
                  }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen flex bg-[#F8F9FB] text-[#2C3E50] overflow-hidden relative">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#E0E4E8] flex flex-col transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-auto
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
              M
            </div>
            <span className="font-bold text-xl tracking-tight">ADMIN</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-subtext">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-8 py-4">
          <div>
            <p className="text-[10px] font-bold text-subtext uppercase tracking-[2px] mb-4 px-4 opacity-50">Management</p>
            <div className="space-y-1">
              {navigation.management.map(item => <NavItem key={item.id} item={item} />)}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-subtext uppercase tracking-[2px] mb-4 px-4 opacity-50">Governance</p>
            <div className="space-y-1">
              {navigation.governance.map(item => <NavItem key={item.id} item={item} />)}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#E0E4E8]">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-subtext hover:text-red-500 transition-colors text-sm font-medium">
            <Activity className="w-4 h-4 rotate-180" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-[72px] bg-white border-b border-[#E0E4E8] flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-subtext" />
            </button>
            <div className="flex-1 max-w-xl group relative">
              <Activity className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-subtext group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search your apps..."
                className="w-full bg-[#F3F5F7] border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 ml-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-maintext">AI-Mall <sup className="text-[9px] font-normal">TM</sup></p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm border border-primary/10">
                A
              </div>
            </div>
          </div>
        </header>


        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto bg-[#F8F9FB] p-8">
          <div className="max-w-[1400px] mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;