import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, FileText, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import apiService from '../../services/apiService';

const Approvals = () => {
    const [pendingAgents, setPendingAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [approvalMessage, setApprovalMessage] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const fetchPending = async () => {
        try {
            setLoading(true);
            const agents = await apiService.getAgents({ view: 'admin' });
            console.log("Fetched agents for approval:", agents);
            // Filter for both Pending Review AND Pending Deletion
            const pending = agents.filter(a => a.reviewStatus === 'Pending Review' || a.deletionStatus === 'Pending');
            console.log("Filtered pending agents:", pending);
            setPendingAgents(pending);
        } catch (err) {
            console.error("Failed to fetch pending approvals:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    useEffect(() => {
        if (showRejectModal) {
            setTimeout(() => {
                const element = document.getElementById('rejection-reason-input');
                if (element) {
                    element.focus();
                }
            }, 100);
        }
    }, [showRejectModal]);

    const handleApprove = async () => {
        try {
            const id = selectedAgent._id || selectedAgent.id;
            setProcessingId(id);
            if (selectedAgent.deletionStatus === 'Pending') {
                await apiService.approveAgentDeletion(id);
            } else {
                await apiService.approveAgent(id, approvalMessage);
            }
            setPendingAgents(prev => prev.filter(a => (a._id || a.id) !== id));
            setShowApproveModal(false);
            setApprovalMessage('');
            setSelectedAgent(null);
        } catch (err) {
            alert("Approval failed");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) return;
        try {
            setProcessingId(selectedAgent._id || selectedAgent.id);
            if (selectedAgent.deletionStatus === 'Pending') {
                await apiService.rejectAgentDeletion(selectedAgent._id || selectedAgent.id, rejectionReason);
            } else {
                await apiService.rejectAgent(selectedAgent._id || selectedAgent.id, rejectionReason);
            }
            setPendingAgents(prev => prev.filter(a => (a._id || a.id) !== (selectedAgent._id || selectedAgent.id)));
            setShowRejectModal(false);
            setRejectionReason('');
            setSelectedAgent(null);
        } catch (err) {
            console.error("Rejection error:", err);
            const msg = err.response?.data?.error || err.message || "Rejection failed";
            alert(`Rejection failed: ${msg}`);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-[#1E293B]">Approvals & Verification</h2>
                    <p className="text-subtext text-sm">Review and manage app submissions from vendors</p>
                </div>
                <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl text-xs font-bold border border-amber-100 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {pendingAgents.length} Pending Requests
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {pendingAgents.length > 0 ? (
                    pendingAgents.map((agent) => (
                        <div key={agent._id || agent.id} className="bg-white border border-[#E0E4E8] rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100">
                                        <img src={agent.avatar || 'https://cdn-icons-png.flaticon.com/512/2102/2102633.png'} alt="" className="w-10 h-10 object-contain" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[#1E293B] group-hover:text-primary transition-colors">{agent.agentName}<sup className="text-xs">TM</sup></h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs font-bold text-subtext uppercase tracking-wider">{agent.category}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            {agent.deletionStatus === 'Pending' ? (
                                                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider border border-red-200 bg-red-50 px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                                                    <Trash2 className="w-3 h-3" /> Deletion Request
                                                </span>
                                            ) : (
                                                <span className="text-xs text-subtext">Submitted by Vendor</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => {
                                            setSelectedAgent(agent);
                                            setShowApproveModal(true);
                                        }}
                                        disabled={processingId === (agent._id || agent.id)}
                                        className={`${agent.deletionStatus === 'Pending' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-[#22C55E] hover:bg-[#16A34A] shadow-green-200'} text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-opacity-20`}
                                    >
                                        {processingId === (agent._id || agent.id) ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            agent.deletionStatus === 'Pending' ? <Trash2 className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />
                                        )}
                                        {agent.deletionStatus === 'Pending' ? 'Delete' : 'Approve'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedAgent(agent);
                                            setShowRejectModal(true);
                                        }}
                                        disabled={processingId === (agent._id || agent.id)}
                                        className="bg-white border border-[#E0E4E8] text-subtext px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-50 hover:text-[#1E293B]"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        {agent.deletionStatus === 'Pending' ? 'Reject' : 'Reject'}
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-50">
                                <p className="text-sm text-[#64748B] line-clamp-2 leading-relaxed italic">
                                    "{agent.description}"
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white border border-[#E0E4E8] rounded-[32px] p-16 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-[#1E293B]">All caught up!</h3>
                        <p className="text-subtext text-sm">No pending app review requests at the moment.</p>
                    </div>
                )}
            </div>

            {/* Approval Modal */}
            {showApproveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        <div className="p-8">
                            <div className={`w-14 h-14 ${selectedAgent?.deletionStatus === 'Pending' ? 'bg-red-50' : 'bg-green-50'} rounded-2xl flex items-center justify-center mb-6`}>
                                {selectedAgent?.deletionStatus === 'Pending' ? <XCircle className="w-8 h-8 text-red-500" /> : <CheckCircle className="w-8 h-8 text-[#22C55E]" />}
                            </div>
                            <h2 className="text-2xl font-bold text-[#1E293B] mb-2">
                                {selectedAgent?.deletionStatus === 'Pending' ? 'Confirm Deletion' : 'Approve Agent'}
                            </h2>
                            <p className="text-subtext mb-8">
                                {selectedAgent?.deletionStatus === 'Pending'
                                    ? "Are you sure you want to permanently delete this agent? This action cannot be undone."
                                    : "You can send a congratulatory message or additional notes to the vendor."}
                            </p>

                            {selectedAgent?.deletionStatus !== 'Pending' && (
                                <textarea
                                    value={approvalMessage}
                                    onChange={(e) => setApprovalMessage(e.target.value)}
                                    className="w-full bg-[#F8F9FB] border border-[#E0E4E8] rounded-2xl p-5 text-sm outline-none focus:ring-2 focus:ring-green-500/10 focus:border-green-500 transition-all resize-none h-32"
                                    placeholder="Message to Vendor (Optional)"
                                />
                            )}

                            <div className="flex items-center gap-4 mt-8">
                                <button
                                    onClick={() => setShowApproveModal(false)}
                                    className="flex-1 px-6 py-4 rounded-2xl text-sm font-bold text-subtext hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={processingId}
                                    className={`flex-1 ${selectedAgent?.deletionStatus === 'Pending' ? 'bg-[#EF4444] hover:bg-[#DC2626]' : 'bg-[#22C55E] hover:bg-[#16A34A]'} text-white px-6 py-4 rounded-2xl text-sm font-bold transition-all disabled:opacity-50`}
                                >
                                    {selectedAgent?.deletionStatus === 'Pending' ? 'Delete Permanently' : 'Confirm Approval'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        <div className="p-8">
                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                                <AlertCircle className="w-8 h-8 text-[#EF4444]" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#1E293B] mb-2">Reject Agent</h2>
                            <p className="text-subtext mb-8">Please provide a professional reason for rejection. This will be visible to the vendor.</p>

                            <textarea
                                id="rejection-reason-input"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full bg-[#F8F9FB] border border-[#E0E4E8] rounded-2xl p-5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all resize-none h-32 relative z-[60]"
                                placeholder=""
                            />

                            <div className="flex items-center gap-4 mt-8">
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                    className="flex-1 px-6 py-4 rounded-2xl text-sm font-bold text-subtext hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={!rejectionReason.trim() || processingId}
                                    className="flex-1 bg-[#EF4444] text-white px-6 py-4 rounded-2xl text-sm font-bold hover:bg-[#DC2626] transition-all disabled:opacity-50"
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Approvals;
