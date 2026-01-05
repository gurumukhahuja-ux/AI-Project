import React, { useEffect, useState } from 'react';
import {
    User, Mail, Shield, Smartphone, Bot, MessageSquare,
    Edit2, Check, X, Camera, Calendar, Sparkles, Zap,
    CreditCard, Settings, Loader2, LogOut, HelpCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { faqs } from '../constants';
import axios from 'axios';
import { apis, AppRoute } from '../types';
import { getUserData, userData, setUserData } from '../userStore/userData';
import { chatStorageService } from '../services/chatStorageService';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';

const UserProfile = () => {
    const [currentUserData, setCurrentUserData] = useRecoilState(userData);
    const user = currentUserData.user;
    const [agents, setAgents] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // FAQ & Support State
    const [isFaqOpen, setIsFaqOpen] = useState(false);
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [sendStatus, setSendStatus] = useState(null);
    const [issueText, setIssueText] = useState("");
    const [activeTab, setActiveTab] = useState("faq");
    const [issueType, setIssueType] = useState("General Inquiry");

    const issueOptions = [
        "General Inquiry",
        "Payment Issue",
        "Refund Request",
        "Technical Support",
        "Account Access",
        "Other"
    ];

    const handleSupportSubmit = async () => {
        if (!issueText.trim()) return;

        setIsSending(true);
        setSendStatus(null);

        try {
            await axios.post(apis.support, {
                email: user?.email || "guest@ai-mall.in",
                issueType,
                message: issueText,
                userId: user?.id || null
            });
            setSendStatus('success');
            setIssueText("");
            setTimeout(() => setSendStatus(null), 3000);
        } catch (error) {
            console.error("Support submission failed", error);
            setSendStatus('error');
        } finally {
            setIsSending(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate(AppRoute.LANDING);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = getUserData()?.token;
                if (!token) return;

                // Fetch User Data
                const userRes = await axios.get(apis.user, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setCurrentUserData({ user: userRes.data });
                setUserData(userRes.data); // Update localStorage via helper
                setNewName(userRes.data.name);

                // Fetch Agents
                const agentsRes = await axios.get(apis.getMyAgents, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setAgents(agentsRes.data || []);

                // Fetch Chat Sessions
                const sessionsData = await chatStorageService.getSessions();
                setSessions(sessionsData || []);

            } catch (error) {
                console.error("Error fetching profile data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleUpdateName = async () => {
        if (!newName.trim() || newName === user.name) {
            setIsEditing(false);
            return;
        }

        setIsSaving(true);
        try {
            const token = getUserData()?.token;
            const res = await axios.put(apis.user, { name: newName }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setCurrentUserData({ user: res.data });
            setUserData(res.data); // Update localStorage via helper

            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update name", error);
            alert("Failed to update name");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="h-full w-full overflow-y-auto font-sans scrollbar-thin scrollbar-thumb-border">

            {/* Banner Area */}
            <div className="relative h-60 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-primary to-blue-600 opacity-90"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-12 -mt-24 relative z-10">

                {/* Profile Header Card */}
                <div className="bg-surface/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row gap-8 items-start md:items-end">

                    {/* Avatar */}
                    <div className="relative group shrink-0">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-surface border-4 border-surface shadow-xl overflow-hidden flex items-center justify-center text-primary text-5xl font-bold uppercase relative z-10">
                            {user.avatar && user.avatar !== '/User.jpeg' ? (
                                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                                    {user.name?.charAt(0)}
                                </div>
                            )}
                        </div>
                        {/* Edit Avatar Overlay (Visual Only for now) */}
                        <div className="absolute inset-0 z-20 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer border-4 border-transparent">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0 pb-2 space-y-3 w-full">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/10">
                                {user.role || "Member"}
                            </span>
                            {user.isVerified && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-600 text-[10px] font-bold border border-yellow-400/20">
                                    <Sparkles className="w-3 h-3" /> Verified
                                </span>
                            )}
                        </div>

                        {/* Editable Name */}
                        <div className="flex items-center gap-3 h-12">
                            {isEditing ? (
                                <div className="flex items-center gap-2 w-full max-w-md animate-in fade-in slide-in-from-left-2 duration-200">
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="flex-1 bg-secondary border-2 border-primary/30 rounded-xl px-4 py-2 text-xl md:text-2xl font-bold text-maintext focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleUpdateName}
                                        disabled={isSaving}
                                        className="p-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20 disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setNewName(user.name);
                                        }}
                                        className="p-2.5 bg-secondary border border-border text-subtext rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 group">
                                    <h1 className="text-3xl md:text-4xl font-bold text-maintext tracking-tight truncate">
                                        {user.name}
                                    </h1>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="p-2 text-subtext hover:text-primary hover:bg-primary/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 duration-200"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-subtext">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-subtext/70" />
                                {user.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-subtext/70" />
                                Joined {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <button className="px-6 py-3 bg-secondary hover:bg-surface text-maintext border border-border rounded-xl font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 whitespace-nowrap">
                            <Settings className="w-4 h-4" /> Account Settings
                        </button>
                        <button
                            onClick={() => setIsFaqOpen(true)}
                            className="px-6 py-3 bg-secondary hover:bg-surface text-maintext border border-border rounded-xl font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 whitespace-nowrap"
                        >
                            <HelpCircle className="w-4 h-4" /> Help & FAQ
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 whitespace-nowrap"
                        >
                            <LogOut className="w-4 h-4" /> Log Out
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                    <StatsCard
                        icon={<Bot className="w-6 h-6 text-blue-600" />}
                        label="Active Agents"
                        value={agents.length}
                        subLabel="Assistants deployed"
                        color="bg-blue-500/10"
                        borderColor="group-hover:border-blue-500/30"
                    />
                    <StatsCard
                        icon={<MessageSquare className="w-6 h-6 text-violet-600" />}
                        label="Total Sessions"
                        value={sessions.length}
                        subLabel="Conversations stored"
                        color="bg-violet-500/10"
                        borderColor="group-hover:border-violet-500/30"
                    />
                    <StatsCard
                        icon={<Zap className="w-6 h-6 text-yellow-600" />}
                        label="Pro Features"
                        value={user.plan === 'pro' ? 'Active' : 'Inactive'}
                        subLabel="Subscription status"
                        color="bg-yellow-500/10"
                        borderColor="group-hover:border-yellow-500/30"
                    />
                    <StatsCard
                        icon={<CreditCard className="w-6 h-6 text-green-600" />}
                        label="Credits"
                        value="∞"
                        subLabel="Usage limit"
                        color="bg-green-500/10"
                        borderColor="group-hover:border-green-500/30"
                    />
                </div>

                {/* Content Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">

                    {/* My Agents */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-maintext">My Agents</h3>
                            <button
                                onClick={() => navigate(AppRoute.MY_AGENTS)}
                                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                            >
                                View All
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {agents.slice(0, 4).map((agent) => (
                                <div
                                    key={agent._id || agent.id}
                                    onClick={() => navigate(AppRoute.MY_AGENTS)}
                                    className="bg-surface p-4 rounded-2xl border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer group flex items-start gap-4"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center overflow-hidden shrink-0 border border-border group-hover:border-primary/20 transition-colors">
                                        {agent.avatar ? <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" /> : <Bot className="w-6 h-6 text-subtext" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-maintext truncate group-hover:text-primary transition-colors">{agent.name}</h4>
                                        <p className="text-xs text-subtext line-clamp-2 mt-1">{agent.description || "No description available."}</p>
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${agent.category === 'productivity' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {agent.category || 'General'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {agents.length === 0 && (
                                <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-2xl bg-surface/30">
                                    <Bot className="w-10 h-10 text-subtext mx-auto mb-3 opacity-50" />
                                    <p className="text-subtext font-medium">No agents found yet</p>
                                    <button onClick={() => navigate(AppRoute.MY_AGENTS)} className="mt-2 text-primary font-bold text-sm hover:underline">Create your first agent</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Chats */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-maintext">Recent Chats</h3>
                        </div>

                        <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                            {sessions.slice(0, 5).map((session, i) => (
                                <div
                                    key={session.sessionId || i}
                                    onClick={() => navigate(`/dashboard/chat/${session.sessionId}`)}
                                    className="flex items-center gap-4 p-4 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors cursor-pointer group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-500 group-hover:scale-110 transition-transform">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-maintext text-sm truncate group-hover:text-indigo-600 transition-colors">
                                            {session.title || "New Chat"}
                                        </h4>
                                        <p className="text-xs text-subtext truncate mt-0.5">
                                            {new Date(session.lastModified).toLocaleDateString(undefined, {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {sessions.length === 0 && (
                                <div className="p-8 text-center text-subtext text-sm">
                                    No chat history available.
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* FAQ Modal */}
                {isFaqOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">

                            <div className="p-6 border-b border-border flex justify-between items-center bg-surface">
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setActiveTab('faq')}
                                        className={`text-lg font-bold px-4 py-2 rounded-lg transition-colors ${activeTab === 'faq' ? 'bg-primary/10 text-primary' : 'text-subtext hover:text-maintext'}`}
                                    >
                                        FAQ
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('help')}
                                        className={`text-lg font-bold px-4 py-2 rounded-lg transition-colors ${activeTab === 'help' ? 'bg-primary/10 text-primary' : 'text-subtext hover:text-maintext'}`}
                                    >
                                        Help
                                    </button>
                                </div>
                                <button
                                    onClick={() => setIsFaqOpen(false)}
                                    className="p-2 hover:bg-black/5 rounded-full text-subtext transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {activeTab === 'faq' ? (
                                    faqs.map((faq, index) => (
                                        <div key={index} className="border border-border rounded-xl bg-white overflow-hidden hover:border-primary/30 transition-all">
                                            <button
                                                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                                                className="w-full flex justify-between items-center p-4 text-left hover:bg-surface transition-colors focus:outline-none"
                                            >
                                                <span className="font-semibold text-maintext text-[15px]">{faq.question}</span>
                                                {openFaqIndex === index ? (
                                                    <ChevronUp className="w-4 h-4 text-primary" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4 text-subtext" />
                                                )}
                                            </button>
                                            <div
                                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaqIndex === index ? 'max-h-96 opacity-100 bg-surface/30' : 'max-h-0 opacity-0'
                                                    }`}
                                            >
                                                <div className="p-4 pt-0 text-subtext text-sm leading-relaxed border-t border-border/50 mt-2 pt-3">
                                                    {faq.answer}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col gap-6">

                                        {/* Issue Type Dropdown */}
                                        <div>
                                            <label className="block text-sm font-bold text-maintext mb-2">Select Issue Category</label>
                                            <div className="relative">
                                                <select
                                                    value={issueType}
                                                    onChange={(e) => setIssueType(e.target.value)}
                                                    className="w-full p-4 pr-10 rounded-xl bg-surface border border-border focus:border-primary outline-none appearance-none text-maintext font-medium cursor-pointer hover:border-primary/50 transition-colors"
                                                >
                                                    {issueOptions.map((opt) => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtext pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* Issue Description */}
                                        <div>
                                            <label className="block text-sm font-bold text-maintext mb-2">Describe your issue</label>
                                            <textarea
                                                className="w-full p-4 rounded-xl bg-surface border border-border focus:border-primary outline-none resize-none text-maintext min-h-[150px]"
                                                placeholder="Please provide details about the problem you are facing..."
                                                value={issueText}
                                                onChange={(e) => setIssueText(e.target.value)}
                                            />
                                        </div>

                                        <button
                                            onClick={handleSupportSubmit}
                                            disabled={isSending || !issueText.trim()}
                                            className={`flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 ${isSending || !issueText.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                                        >
                                            {isSending ? (
                                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <MessageSquare className="w-5 h-5" />
                                                    Send to Support
                                                </>
                                            )}
                                        </button>

                                        {sendStatus === 'success' && (
                                            <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm text-center font-medium border border-green-100 animate-in fade-in slide-in-from-top-2">
                                                Tciket Submitted Successfully! Our team will contact you soon.
                                            </div>
                                        )}

                                        {sendStatus === 'error' && (
                                            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center font-medium border border-red-100 animate-in fade-in slide-in-from-top-2">
                                                Failed to submit ticket. Please try again or email us directly.
                                            </div>
                                        )}

                                        <p className="text-xs text-center text-subtext">
                                            Or email us directly at <a href="mailto:support@ai-mall.in" className="text-primary font-medium hover:underline">support@ai-mall.in</a>
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-border bg-surface text-center">
                                <button
                                    onClick={() => setIsFaqOpen(false)}
                                    className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                                >
                                    Close
                                </button>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

const StatsCard = ({ icon, label, value, subLabel, color, borderColor }) => (
    <div className={`bg-surface p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group ${borderColor} border-l-4`}>
        <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center transition-transform group-hover:rotate-6`}>
                {icon}
            </div>
        </div>
        <div>
            <p className="text-3xl font-bold text-maintext mb-1">{value}</p>
            <p className="text-sm font-semibold text-maintext">{label}</p>
            <p className="text-xs text-subtext mt-1">{subLabel}</p>
        </div>
    </div>
);

export default UserProfile;
