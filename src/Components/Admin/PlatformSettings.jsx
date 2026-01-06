import React, { useState } from 'react';
import { AlertCircle, Server, ShieldAlert, ToggleLeft, ToggleRight, Settings } from 'lucide-react';

import apiService from '../../services/apiService';
import { useToast } from '../../Components/Toast/ToastContext';

const PlatformSettings = () => {
    const toast = useToast();
    const [maintenance, setMaintenance] = useState(false);
    const [killSwitch, setKillSwitch] = useState(false);
    const [rateLimit, setRateLimit] = useState(1000);

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settings = await apiService.getAdminSettings();
                if (settings) {
                    setMaintenance(settings.maintenanceMode);
                    setKillSwitch(settings.globalKillSwitch);
                    setRateLimit(settings.globalRateLimit || 1000);
                }
            } catch (err) {
                console.error("Failed to fetch settings:", err);
            }
        };
        fetchSettings();
    }, []);

    const handleMaintenanceToggle = async () => {
        const newState = !maintenance;
        try {
            setMaintenance(newState); // Optimistic UI update
            await apiService.toggleMaintenance(newState);
            if (newState) {
                toast.success("Maintenance mode enabled. Users notified.");
            } else {
                toast.success("Maintenance mode disabled.");
            }
        } catch (error) {
            setMaintenance(!newState); // Revert on error
            toast.error("Failed to update maintenance settings.");
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-xl font-bold text-maintext">Platform Settings & Safety</h2>

            {/* General Config */}
            <div className="bg-surface border border-border rounded-xl p-6">
                <h3 className="font-bold text-maintext mb-4 flex items-center gap-2"><Settings className="w-5 h-5" /> General Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-maintext mb-2">Platform Name</label>
                        <input type="text" defaultValue="A-Series" className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-sm outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-maintext mb-2">Contact Email</label>
                        <input type="text" defaultValue="support@aimall.com" className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-sm outline-none" />
                    </div>
                </div>
            </div>

            {/* Safety & Emergency */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                <h3 className="font-bold text-red-600 mb-4 flex items-center gap-2"><ShieldAlert className="w-5 h-5" /> Safety & Emergency Controls</h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
                        <div>
                            <p className="font-bold text-maintext">Maintenance Mode</p>
                            <p className="text-sm text-subtext">Disable user access for system upgrades.</p>
                        </div>
                        <button onClick={handleMaintenanceToggle} className={`text-2xl ${maintenance ? 'text-green-500' : 'text-subtext'}`}>
                            {maintenance ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-red-200">
                        <div>
                            <p className="font-bold text-red-600">Global Kill-Switch</p>
                            <p className="text-sm text-subtext">Immediately disable ALL AI Agent inference APIs.</p>
                        </div>
                        <button onClick={async () => {
                            const newState = !killSwitch;
                            try {
                                setKillSwitch(newState);
                                await apiService.toggleKillSwitch(newState);
                                if (newState) toast.error("Global Kill-Switch ACTIVE. All AI services halted.");
                                else toast.success("Global Kill-Switch DISABLED. Services restored.");
                            } catch (err) {
                                setKillSwitch(!newState);
                                toast.error("Failed to toggle kill-switch");
                            }
                        }} className={`text-2xl ${killSwitch ? 'text-red-600' : 'text-subtext'}`}>
                            {killSwitch ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* API Controls */}
            <div className="bg-surface border border-border rounded-xl p-6">
                <h3 className="font-bold text-maintext mb-4 flex items-center gap-2"><Server className="w-5 h-5" /> API Rate Limits</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-subtext">Global Requests Per Minute: <span className="font-bold text-primary">{rateLimit >= 1000 ? (rateLimit / 1000) + 'k' : rateLimit}</span></label>
                        <input
                            type="range"
                            min="1000"
                            max="100000"
                            step="1000"
                            value={rateLimit}
                            onChange={(e) => setRateLimit(Number(e.target.value))}
                            onMouseUp={async () => {
                                try {
                                    await apiService.updateRateLimit(rateLimit);
                                    toast.success(`Rate limit updated to ${rateLimit} req/min`);
                                } catch (err) {
                                    toast.error("Failed to update rate limit");
                                }
                            }}
                            className="w-full mt-2 accent-primary cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-subtext mt-1">
                            <span>1k</span>
                            <span>50k</span>
                            <span>100k</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlatformSettings;
