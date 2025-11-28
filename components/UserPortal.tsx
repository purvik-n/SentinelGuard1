
import React, { useState, useEffect } from 'react';
import { 
    Smartphone, Monitor, MapPin, CheckCircle, Shield, 
    AlertTriangle, Globe, Clock, ChevronRight, History, 
    Sparkles, AlertOctagon, Laptop, Lock, X, QrCode, Eye, EyeOff, Trash2, Loader2, LogOut, KeyRound, Server
} from 'lucide-react';
import { RiskLevel, SecurityEvent } from '../types';
import { MOCK_USERS } from '../constants';

// Initial Mock Data to seed the view
const INITIAL_ACTIVITY_FEED = [
    {
        id: 'ua_1',
        date: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
        device: 'MacBook Pro 16"',
        deviceType: 'DESKTOP',
        location: 'San Francisco, US',
        ip: '192.168.1.42',
        riskScore: 12,
        riskLevel: RiskLevel.LOW,
        isNewDevice: false,
        isNewLocation: false,
        reported: false
    },
    {
        id: 'ua_2',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        device: 'iPhone 15 Pro',
        deviceType: 'MOBILE',
        location: 'San Francisco, US',
        ip: '67.11.90.221',
        riskScore: 5,
        riskLevel: RiskLevel.LOW,
        isNewDevice: false,
        isNewLocation: false,
        reported: false
    }
];

interface UserPortalProps {
    events?: SecurityEvent[];
}

const UserPortal: React.FC<UserPortalProps> = ({ events = [] }) => {
    // Current User Identity (Mocking "Bob Smith")
    const CURRENT_USER_ID = MOCK_USERS[1].id;

    // Activity State
    const [activities, setActivities] = useState<any[]>(INITIAL_ACTIVITY_FEED);
    const [reportingId, setReportingId] = useState<string | null>(null);

    // Merge global events with local activity feed when they arrive
    useEffect(() => {
        if (events.length > 0) {
            const userEvents = events
                .filter(e => e.user.id === CURRENT_USER_ID)
                .map(e => ({
                    id: e.id,
                    date: new Date(e.timestamp),
                    device: e.device,
                    deviceType: e.source === 'MOBILE' ? 'MOBILE' : e.source === 'WEB' ? 'DESKTOP' : 'OTHER',
                    location: e.location,
                    ip: e.ip,
                    riskScore: e.riskScore,
                    riskLevel: e.riskLevel,
                    isNewDevice: e.riskFactors?.includes('New Device') || false,
                    isNewLocation: e.riskFactors?.includes('New Location') || false,
                    reported: e.isFalsePositive || false
                }));
            
            // Deduplicate by ID and merge
            setActivities(prev => {
                const combined = [...userEvents, ...prev];
                const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
                return unique.sort((a, b) => b.date.getTime() - a.date.getTime());
            });
        }
    }, [events]);

    // Modals & UI State
    const [activeModal, setActiveModal] = useState<'2FA' | 'DEVICES' | 'PASSWORD' | 'CONFIRM_REPORT' | 'CONFIRM_SIGNOUT' | null>(null);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Mock Device State for Management Modal
    const [devices, setDevices] = useState([
        { id: 'd1', name: 'MacBook Pro 16"', type: 'DESKTOP', lastActive: 'Just now', location: 'San Francisco, US' },
        { id: 'd2', name: 'iPhone 15 Pro', type: 'MOBILE', lastActive: '2 hours ago', location: 'San Francisco, US' },
        { id: 'd3', name: 'iPad Pro', type: 'TABLET', lastActive: '5 days ago', location: 'San Jose, US' }
    ]);

    // Password State
    const [showPassword, setShowPassword] = useState(false);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

    // 2FA State
    const [verificationCode, setVerificationCode] = useState('');

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleSimulateAction = (action: () => void) => {
        setIsLoading(true);
        setTimeout(() => {
            action();
            setIsLoading(false);
            setActiveModal(null);
        }, 1500);
    };

    // --- Actions ---

    const handleEnable2FA = () => {
        handleSimulateAction(() => {
            setIs2FAEnabled(true);
            showToast("Two-Factor Authentication successfully enabled!");
            setVerificationCode('');
        });
    };

    const handleRevokeDevice = (id: string) => {
        setDevices(prev => prev.filter(d => d.id !== id));
        showToast("Device access revoked.");
    };

    const handleUpdatePassword = () => {
        handleSimulateAction(() => {
            showToast("Password updated successfully.");
            setPasswords({ current: '', new: '', confirm: '' });
        });
    };

    const handleReportSuspicious = () => {
        if (!reportingId) return;
        handleSimulateAction(() => {
            setActivities(prev => prev.map(a => 
                a.id === reportingId ? { ...a, reported: true } : a
            ));
            showToast("We've locked this session and notified the security team.");
            setReportingId(null);
        });
    };

    const handleSignOutAll = () => {
        handleSimulateAction(() => {
            setDevices([]); // Clear all devices
            showToast("Successfully signed out of all other devices.");
        });
    };

    const getRiskLabel = (level: RiskLevel, score: number) => {
        if (score > 80) return { text: 'Highly Unusual', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' };
        if (score > 40) return { text: 'Unusual', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' };
        return { text: 'Normal', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
    };

    return (
        <div className="p-8 h-full flex flex-col animate-in fade-in duration-500 max-w-6xl mx-auto overflow-y-auto scrollbar-hide relative">
             <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Shield className="text-emerald-500" /> My Security Activity
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Review your recent sign-ins and manage trusted devices.</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20">
                    <CheckCircle size={18} className="text-emerald-500" />
                    <span className="text-emerald-400 font-medium text-sm">Account Protected</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT: Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <History size={20} className="text-indigo-500" /> Recent Logins & Events
                            </h3>
                            <button className="text-sm text-indigo-400 hover:text-indigo-300">View All</button>
                        </div>
                        
                        <div className="divide-y divide-slate-800">
                            {activities.map((item) => {
                                const risk = getRiskLabel(item.riskLevel, item.riskScore);

                                return (
                                    <div key={item.id} className="p-6 hover:bg-slate-800/30 transition-colors group">
                                        <div className="flex items-start gap-4">
                                            {/* Icon Box */}
                                            <div className={`p-3 rounded-xl flex-shrink-0 ${item.deviceType === 'MOBILE' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                                                {item.deviceType === 'MOBILE' ? <Smartphone size={24}/> : item.deviceType === 'DESKTOP' ? <Monitor size={24}/> : <Server size={24}/>}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="text-white font-medium text-base truncate pr-4 flex items-center gap-2">
                                                        {item.device}
                                                        {/* New Device Badge */}
                                                        {item.isNewDevice && (
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold uppercase tracking-wider">
                                                                <Sparkles size={10} /> New Device
                                                            </span>
                                                        )}
                                                    </h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold border whitespace-nowrap ${risk.color}`}>
                                                            {risk.text}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-slate-400 mt-1">
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock size={14} className="text-slate-500"/> 
                                                        {item.date.toLocaleDateString()} • {item.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <MapPin size={14} className="text-slate-500"/> 
                                                        {item.location}
                                                        {/* New Location Indicator */}
                                                        {item.isNewLocation && (
                                                             <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold uppercase tracking-wider ml-1">
                                                                <Globe size={10} /> New Location
                                                             </span>
                                                        )}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-slate-500 font-mono text-xs mt-0.5 bg-slate-950 px-1.5 rounded border border-slate-800">
                                                        {item.ip}
                                                    </span>
                                                </div>

                                                {/* Actions */}
                                                <div className="mt-3 flex items-center gap-3">
                                                    {item.reported ? (
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs font-bold animate-in fade-in">
                                                            <Shield size={12} /> Reported as suspicious
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => { setReportingId(item.id); setActiveModal('CONFIRM_REPORT'); }}
                                                            className="text-xs text-slate-500 hover:text-rose-400 font-medium transition-colors flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-800 border border-transparent hover:border-rose-500/20"
                                                        >
                                                            <AlertTriangle size={12} /> This wasn't me
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Insights & Tips */}
                <div className="space-y-6">
                    
                    {/* Account Protection */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider text-slate-500 flex items-center gap-2">
                            <Shield size={14}/> Account Protection
                        </h3>
                        <div className="space-y-3">
                            <button 
                                onClick={() => setActiveModal('CONFIRM_SIGNOUT')}
                                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-3">
                                    <LogOut size={16} className="text-orange-500"/>
                                    <span className="font-medium text-sm">Sign out of all devices</span>
                                </div>
                                <ChevronRight size={14} className="text-slate-500 group-hover:text-white"/>
                            </button>
                             <button 
                                onClick={() => setActiveModal('PASSWORD')}
                                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-3">
                                    <KeyRound size={16} className="text-indigo-500"/>
                                    <span className="font-medium text-sm">Reset password</span>
                                </div>
                                <ChevronRight size={14} className="text-slate-500 group-hover:text-white"/>
                            </button>
                        </div>
                    </div>

                    {/* Insights Summary */}
                    <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles size={64} className="text-indigo-400" />
                        </div>
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                             <div className="p-2 bg-indigo-500 rounded-lg text-white shadow-lg shadow-indigo-500/20">
                                 <Shield size={20}/>
                             </div>
                             <h3 className="text-white font-bold">Security Insights</h3>
                        </div>
                        <div className="space-y-4 relative z-10">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    Most of your logins are from <strong className="text-white">San Francisco, US</strong>.
                                </p>
                            </div>
                             <div className="flex items-start gap-3">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]"></div>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    We detected <strong className="text-orange-400">1 unusual login</strong> in the last 7 days.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider text-slate-500 flex items-center gap-2">
                            <AlertOctagon size={14}/> Recommended Actions
                        </h3>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={() => setActiveModal('2FA')}
                                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition-all group text-left flex items-start gap-3"
                            >
                                <div className={`p-2 rounded-lg transition-colors ${is2FAEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-900 text-indigo-500 group-hover:bg-indigo-500/10'}`}>
                                    <Smartphone size={18} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className={`text-sm font-bold transition-colors ${is2FAEnabled ? 'text-emerald-500' : 'text-white group-hover:text-indigo-400'}`}>
                                            {is2FAEnabled ? '2FA Enabled' : 'Enable 2FA'}
                                        </span>
                                        <ChevronRight size={14} className="text-slate-600 group-hover:text-indigo-500"/>
                                    </div>
                                    <p className="text-xs text-slate-500">{is2FAEnabled ? 'Your account is secure.' : 'Add an extra layer of security.'}</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => setActiveModal('DEVICES')}
                                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition-all group text-left flex items-start gap-3"
                            >
                                <div className="p-2 bg-slate-900 rounded-lg text-emerald-500 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                                    <Laptop size={18} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Trusted Devices</span>
                                        <ChevronRight size={14} className="text-slate-600 group-hover:text-emerald-500"/>
                                    </div>
                                    <p className="text-xs text-slate-500">Review {devices.length} devices with access.</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MODALS --- */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => { setActiveModal(null); setReportingId(null); }}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {/* CONFIRM REPORT MODAL */}
                        {activeModal === 'CONFIRM_REPORT' && (
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
                                        <AlertTriangle size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Report Activity</h2>
                                    </div>
                                </div>
                                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                                    Are you sure this wasn't you? This will immediately <strong className="text-white">lock this session</strong> and notify our security team for investigation.
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => { setActiveModal(null); setReportingId(null); }}
                                        className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleReportSuspicious}
                                        disabled={isLoading}
                                        className="py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={20}/> : <Shield size={20}/>}
                                        Yes, Secure Account
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* CONFIRM SIGN OUT ALL MODAL */}
                        {activeModal === 'CONFIRM_SIGNOUT' && (
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
                                        <LogOut size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Sign Out All Devices?</h2>
                                    </div>
                                </div>
                                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                                    This will sign you out of all active sessions on web and mobile, except for this current browser. You will need to log in again on other devices.
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => setActiveModal(null)}
                                        className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleSignOutAll}
                                        disabled={isLoading}
                                        className="py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={20}/> : <LogOut size={20}/>}
                                        Sign Out All
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 2FA MODAL */}
                        {activeModal === '2FA' && (
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
                                        <QrCode size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Setup 2FA</h2>
                                        <p className="text-slate-400 text-sm">Scan QR code with your authenticator app.</p>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-xl w-48 h-48 mx-auto mb-6 flex items-center justify-center">
                                    <QrCode size={120} className="text-slate-900"/>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Verification Code</label>
                                    <input 
                                        type="text" 
                                        placeholder="Enter 6-digit code"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white text-center font-mono text-lg tracking-widest focus:border-indigo-500 outline-none"
                                        maxLength={6}
                                    />
                                </div>

                                <button 
                                    onClick={handleEnable2FA}
                                    disabled={verificationCode.length < 6 || isLoading}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={20}/> : <CheckCircle size={20}/>}
                                    Verify & Enable
                                </button>
                            </div>
                        )}

                        {/* DEVICES MODAL */}
                        {activeModal === 'DEVICES' && (
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                                        <Laptop size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Manage Devices</h2>
                                        <p className="text-slate-400 text-sm">Active sessions logged into your account.</p>
                                    </div>
                                </div>

                                <div className="space-y-3 max-h-[300px] overflow-y-auto mb-6 pr-1">
                                    {devices.map(device => (
                                        <div key={device.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                                            <div className="flex items-center gap-3">
                                                <div className="text-slate-500">
                                                    {device.type === 'MOBILE' ? <Smartphone size={18}/> : <Monitor size={18}/>}
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium text-sm">{device.name}</div>
                                                    <div className="text-xs text-slate-500">{device.location} • {device.lastActive}</div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleRevokeDevice(device.id)}
                                                className="text-slate-500 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
                                                title="Revoke Access"
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    ))}
                                    {devices.length === 0 && (
                                        <div className="text-center text-slate-500 py-4">No active devices found.</div>
                                    )}
                                </div>

                                <button 
                                    onClick={() => setActiveModal(null)}
                                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        )}

                        {/* PASSWORD MODAL */}
                        {activeModal === 'PASSWORD' && (
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
                                        <Lock size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Change Password</h2>
                                        <p className="text-slate-400 text-sm">Ensure your new password is strong.</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Current Password</label>
                                        <input 
                                            type="password" 
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 outline-none"
                                            value={passwords.current}
                                            onChange={e => setPasswords({...passwords, current: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">New Password</label>
                                        <div className="relative">
                                            <input 
                                                type={showPassword ? "text" : "password"}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 outline-none"
                                                value={passwords.new}
                                                onChange={e => setPasswords({...passwords, new: e.target.value})}
                                            />
                                            <button 
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                            >
                                                {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Confirm New Password</label>
                                        <input 
                                            type="password" 
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 outline-none"
                                            value={passwords.confirm}
                                            onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <button 
                                    onClick={handleUpdatePassword}
                                    disabled={!passwords.current || !passwords.new || passwords.new !== passwords.confirm || isLoading}
                                    className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={20}/> : <Lock size={20}/>}
                                    Update Password
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TOAST NOTIFICATION */}
            {toastMessage && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-50">
                    <CheckCircle className="text-emerald-500" size={20} />
                    <span className="font-medium text-sm">{toastMessage}</span>
                </div>
            )}
        </div>
    );
};

export default UserPortal;
