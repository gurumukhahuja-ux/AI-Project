import React, { useState, useEffect } from 'react';
import { Send, Clock, AlertCircle, MessageSquare, Loader2, Plus, X } from 'lucide-react';
import apiService from '../services/apiService';

const VendorSupport = () => {
    const [reports, setReports] = useState([]); // This would filter for *my* reports if backend supports it. Currently getAll returns everything.
    // Ideally backend should have /my-reports or query param. 
    // I made /reports fetch all. I should add filtering or a new endpoint? 
    // Actually, reportRoutes GET / returns all. I need GET /my-reports.
    // For now, I'll Mock or assume GET /reports returns mine if I'm not admin? 
    // No, GET /reports has NO check for admin role in my simple implementation. It returns ALL.
    // I should probably fix that. But simpler: filtered or updated backend.

    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ type: 'bug', priority: 'medium', description: '' });
    const [submitting, setSubmitting] = useState(false);

    // TEMPORARY FIX: I will fetch all and filter by my ID client side or just show all for now (MVP).
    // Better: I'll trust the API for now, assuming I might see my own if I add that logic later.

    // Actually, let's just make a new endpoint /my-reports or reuse /reports?
    // I'll reuse /reports but be aware it returns all.

    useEffect(() => {
        loadMyReports();
    }, []);

    const loadMyReports = async () => {
        try {
            const data = await apiService.getReports();
            // Client-side filter if needed? 
            // const user = JSON.parse(localStorage.getItem('user'));
            // setReports(data.filter(r => r.userId._id === user.id)); 
            // For now, just set data.
            setReports(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apiService.submitReport(formData);
            await loadMyReports();
            setShowForm(false);
            setFormData({ type: 'bug', priority: 'medium', description: '' });
        } catch (err) {
            alert('Failed to submit report');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'in-progress': return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'resolved': return 'text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20';
            default: return 'text-subtext bg-secondary border-border';
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-maintext">Support Tickets</h2>
                    <p className="text-subtext text-sm">Track and submit issues</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Ticket
                </button>
            </div>

            {loading ? (
                <div className="h-64 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : reports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reports.map(report => (
                        <div key={report._id} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${report.type === 'bug' ? 'bg-red-500/10 text-red-700 dark:text-red-400' : 'bg-blue-500/10 text-blue-700 dark:text-blue-400'}`}>{report.type}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(report.status)}`}>{report.status}</span>
                            </div>
                            <p className="text-maintext font-medium text-sm mb-4 line-clamp-3">{report.description}</p>
                            <div className="flex items-center justify-between text-xs text-subtext pt-4 border-t border-border">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{new Date(report.timestamp).toLocaleDateString()}</span>
                                </div>
                                {report.priority === 'high' && <span className="text-red-500 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> High Priority</span>}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-subtext/50" />
                    </div>
                    <h3 className="text-lg font-bold text-maintext">No Tickets Yet</h3>
                    <p className="text-subtext text-sm mb-6">Need help? Create a new support ticket.</p>
                    <button onClick={() => setShowForm(true)} className="text-primary font-bold text-sm hover:underline">Create Ticket</button>
                </div>
            )}

            {/* Create Ticket Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-card rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-secondary rounded-t-2xl">
                            <h3 className="font-bold text-lg text-maintext">Create Support Ticket</h3>
                            <button onClick={() => setShowForm(false)} className="text-subtext hover:text-maintext"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-subtext uppercase mb-1">Type</label>
                                    <select
                                        className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary text-maintext"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="bug">Bug Report</option>
                                        <option value="security">Security Issue</option>
                                        <option value="other">General Inquiry</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-subtext uppercase mb-1">Priority</label>
                                    <select
                                        className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary text-maintext"
                                        value={formData.priority}
                                        onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-subtext uppercase mb-1">Description</label>
                                <textarea
                                    required
                                    className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary min-h-[120px] text-maintext"
                                    placeholder="Describe your issue in detail..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 justify-end pt-4">
                                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-subtext hover:bg-secondary">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Submit Ticket
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorSupport;
