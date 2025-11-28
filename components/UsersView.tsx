
import React, { useState, useEffect } from 'react';
import { MOCK_USERS, MOCK_USER_STATS } from '../constants';
import { 
    Shield, MoreHorizontal, Mail, MapPin, Calendar, Search, Filter, 
    ArrowLeft, Smartphone, Monitor, AlertTriangle, Fingerprint, History, 
    Lock, Unlock, BrainCircuit, Activity, Laptop, Trash2, CheckCircle, AlertOctagon,
    Keyboard, FileText, Clipboard
} from 'lucide-react';
import { User, UserStats, RiskLevel, TrustedDevice } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const UsersView: React.FC = () => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [localDevices, setLocalDevices] = useState<TrustedDevice[]>([]);

    // Initialize local device state when user is selected
    useEffect(() => {
        if (selectedUser) {
            const stats = MOCK_USER_STATS[selectedUser.id];
            if (stats) {
                setLocalDevices(stats.devices);
            }
        }
    }, [selectedUser]);

    const getUserStats = (userId: string): UserStats | undefined => {
        return MOCK_USER_STATS[userId];
    };

    const handleDeviceAction = (deviceId: string, action: 'TRUST' | 'REVOKE') => {
        setLocalDevices(prev => prev.map(d => {
            if (d.id === deviceId) {
                return { ...d, status: action === 'TRUST' ? 'TRUSTED' : 'REVOKED' };
            }
            return d;
        }));
    };

    const getRiskBadge = (level: RiskLevel) => {
        switch (level) {
            case RiskLevel.CRITICAL: return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">CRITICAL</span>;
            case RiskLevel.HIGH: return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20">HIGH</span>;
            case RiskLevel.MEDIUM: return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">MEDIUM</span>;
            default: return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">LOW</span>;
        }
    };

    // --- USER PROFILE DETAIL VIEW ---
    if (selectedUser) {
        const stats = getUserStats(selectedUser.id);
        if (!stats) return <div>Data missing</div>;

        return (
            <div className="p-8 h-full flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto">
                {/* Header Back */}
                <button 
                    onClick={() => setSelectedUser(null)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 group w-fit"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to User List
                </button>

                {/* Main Profile Header */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 relative overflow-hidden">
                     {/* Decorative background accent */}
                     <div className={`absolute top-0 right-0 w-64 h-full bg-gradient-to-l opacity-10 ${stats.currentRiskLevel === RiskLevel.CRITICAL ? 'from-rose-600' : 'from-indigo-600'} to-transparent`}></div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-2xl font-bold text-slate-300 ring-4 ring-slate-950">
                                    {selectedUser.avatar}
                                </div>
                                <div className={`absolute bottom-0 right-0 p-1.5 rounded-full border-4 border-slate-900 ${stats.accountStatus === 'LOCKED' ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                                    {stats.accountStatus === 'LOCKED' ? <Lock size={12} className="text-white"/> : <Unlock size={12} className="text-white"/>}
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-1">{selectedUser.name}</h1>
                                <div className="flex items-center gap-3 text-slate-400 text-sm">
                                    <span className="flex items-center gap-1"><Mail size={14}/> {selectedUser.email}</span>
                                    <span>•</span>
                                    <span>{selectedUser.department}</span>
                                    <span>•</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${selectedUser.role === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-slate-800 border-slate-700'}`}>{selectedUser.role}</span>
                                </div>
                                <div className="mt-3 flex gap-2 flex-wrap">
                                    {stats.tags.map(tag => (
                                        <span key={tag} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-full border border-slate-700 flex items-center gap-1">
                                            <Fingerprint size={10} className="opacity-50"/> {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end">
                            <div className="text-sm text-slate-400 mb-1">Current Risk Profile</div>
                            {getRiskBadge(stats.currentRiskLevel)}
                            <div className="mt-2 text-xs text-slate-500">Last activity: {new Date(stats.lastLogin).toLocaleTimeString()}</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Stats Cards */}
                    <div className="space-y-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm font-medium">Logins (30d)</span>
                                <History size={18} className="text-indigo-500 opacity-80"/>
                            </div>
                            <div className="text-2xl font-bold text-white">{stats.logins30d} <span className="text-xs text-slate-500 font-normal">total</span></div>
                            <div className="text-xs text-slate-500 mt-1">Avg {Math.round(stats.logins30d/30)} per day</div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm font-medium">High Risk Ratio</span>
                                <AlertTriangle size={18} className="text-orange-500 opacity-80"/>
                            </div>
                            <div className="text-2xl font-bold text-white">{stats.highRiskRate}% <span className="text-xs text-slate-500 font-normal">of sessions</span></div>
                            <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                                <div className={`h-full ${stats.highRiskRate > 10 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{width: `${Math.min(100, stats.highRiskRate)}%`}}></div>
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm font-medium">Trusted Devices</span>
                                <Monitor size={18} className="text-emerald-500 opacity-80"/>
                            </div>
                            <div className="text-2xl font-bold text-white">{localDevices.filter(d => d.status === 'TRUSTED').length}</div>
                            <div className="text-xs text-slate-500 mt-1">Last used: {stats.lastLocation}</div>
                        </div>
                    </div>

                    {/* Risk Timeline Chart */}
                    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-white font-bold">Risk Score History (30 Days)</h3>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500"></span>
                                <span className="text-xs text-slate-400">Anomaly Spike</span>
                            </div>
                        </div>
                        
                        <div className="h-64 w-full">
                             <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.riskHistory}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis 
                                        dataKey="date" 
                                        stroke="#64748b" 
                                        fontSize={10} 
                                        tickLine={false} 
                                        axisLine={false}
                                        interval={4}
                                    />
                                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                        labelStyle={{ color: '#94a3b8' }}
                                    />
                                    <ReferenceLine y={80} stroke="#f43f5e" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'CRITICAL', fill: '#f43f5e', fontSize: 10, position: 'insideRight' }} />
                                    <Line 
                                        type="monotone" 
                                        dataKey="score" 
                                        stroke="#6366f1" 
                                        strokeWidth={2} 
                                        dot={(props: any) => {
                                            if (props.payload.score > 75) {
                                                return <circle cx={props.cx} cy={props.cy} r={4} fill="#f43f5e" stroke="#0f172a" strokeWidth={2} />;
                                            }
                                            return <></>;
                                        }}
                                        activeDot={{ r: 6, fill: '#6366f1' }} 
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Typical Behaviour Panel */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900 border border-slate-800 rounded-xl p-6">
                         <div className="space-y-4">
                             <div className="flex items-center gap-2 mb-4">
                                 <BrainCircuit size={20} className="text-indigo-500"/>
                                 <h3 className="text-white font-bold">Behavioral Baseline</h3>
                             </div>
                             
                             {/* Heatmap */}
                             <div>
                                 <div className="text-xs text-slate-500 uppercase font-bold mb-3">Activity Heatmap (Time vs Day)</div>
                                 <div className="grid grid-cols-[auto_1fr] gap-2">
                                     <div className="flex flex-col justify-between text-[10px] text-slate-500 py-1">
                                         <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                     </div>
                                     <div className="grid grid-cols-24 gap-px bg-slate-900">
                                         {stats.behaviorProfile.activityHeatmap.map((row, d) => (
                                             row.map((val, h) => (
                                                 <div 
                                                     key={`${d}-${h}`} 
                                                     className={`h-4 rounded-sm ${val === 0 ? 'bg-slate-800/30' : `bg-indigo-500 opacity-[${0.1 + (val/12)}]`}`}
                                                     style={{ opacity: val === 0 ? 1 : 0.2 + (val/12) }}
                                                     title={`Day ${d+1}, Hour ${h}: ${val} intensity`}
                                                 ></div>
                                             ))
                                         ))}
                                     </div>
                                 </div>
                                 <div className="flex justify-between text-[10px] text-slate-500 mt-1 pl-8">
                                     <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:59</span>
                                 </div>
                             </div>
                         </div>

                         <div className="space-y-6">
                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                     <div className="text-xs text-slate-500 uppercase font-bold mb-2">Usual Locations</div>
                                     <ul className="space-y-1">
                                         {stats.behaviorProfile.usualLocations.map(loc => (
                                             <li key={loc} className="text-sm text-slate-300 flex items-center gap-2">
                                                 <MapPin size={12} className="text-slate-500"/> {loc}
                                             </li>
                                         ))}
                                     </ul>
                                 </div>
                                 <div>
                                      <div className="text-xs text-slate-500 uppercase font-bold mb-2">Usual Devices</div>
                                      <ul className="space-y-1">
                                         {stats.behaviorProfile.usualDevices.map(dev => (
                                             <li key={dev} className="text-sm text-slate-300 flex items-center gap-2">
                                                 <Laptop size={12} className="text-slate-500"/> {dev}
                                             </li>
                                         ))}
                                     </ul>
                                 </div>
                             </div>
                             <div>
                                 <div className="text-xs text-slate-500 uppercase font-bold mb-2">Biometrics Profile</div>
                                 <div className="flex gap-4">
                                     <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex-1">
                                         <div className="text-xs text-slate-500">Avg Typing Speed</div>
                                         <div className="text-lg font-mono text-white">{stats.behaviorProfile.typingSpeedAvg} <span className="text-xs text-slate-500">WPM</span></div>
                                     </div>
                                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex-1">
                                         <div className="text-xs text-slate-500">Typing Variance</div>
                                         <div className={`text-lg font-medium ${stats.behaviorProfile.typingVarianceLabel === 'Bot-like' ? 'text-rose-400' : 'text-emerald-400'}`}>
                                             {stats.behaviorProfile.typingVarianceLabel}
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                    </div>

                    {/* NEW: Typing & Form Analytics Panel */}
                    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                             <Keyboard size={20} className="text-purple-500"/>
                             <h3 className="text-white font-bold">Typing & Form Behaviour Analytics</h3>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-6">
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col">
                                <span className="text-xs text-slate-500 uppercase font-bold mb-2 flex items-center gap-1"><Trash2 size={12}/> Error Rate (Backspaces)</span>
                                <div className="mt-auto">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className={`text-2xl font-bold ${stats.avgErrorRate && stats.avgErrorRate > 8 ? 'text-orange-400' : 'text-white'}`}>{stats.avgErrorRate || 0}%</span>
                                        <span className="text-xs text-slate-500">vs 5% baseline</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${stats.avgErrorRate && stats.avgErrorRate > 8 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{width: `${Math.min(100, (stats.avgErrorRate || 0) * 5)}%`}}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col">
                                <span className="text-xs text-slate-500 uppercase font-bold mb-2 flex items-center gap-1"><FileText size={12}/> Form Completion</span>
                                <div className="mt-auto">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className={`text-2xl font-bold ${stats.avgFormTime && stats.avgFormTime < 2 ? 'text-rose-400' : 'text-white'}`}>{stats.avgFormTime || 0}s</span>
                                        <span className="text-xs text-slate-500">avg login time</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${stats.avgFormTime && stats.avgFormTime < 2 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{width: `${Math.min(100, (stats.avgFormTime || 0) * 5)}%`}}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col">
                                <span className="text-xs text-slate-500 uppercase font-bold mb-2 flex items-center gap-1"><Clipboard size={12}/> Paste Frequency</span>
                                <div className="mt-auto">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className={`text-2xl font-bold ${stats.pasteFrequency && stats.pasteFrequency > 50 ? 'text-rose-400' : 'text-white'}`}>{stats.pasteFrequency || 0}%</span>
                                        <span className="text-xs text-slate-500">of sensitive fields</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${stats.pasteFrequency && stats.pasteFrequency > 50 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{width: `${Math.min(100, stats.pasteFrequency || 0)}%`}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Anomalies List (Enhanced) */}
                    <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                             <AlertOctagon size={20} className="text-orange-500"/>
                             <h3 className="text-white font-bold">Recent Anomalies</h3>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                            {stats.recentAnomalies.length > 0 ? (
                                stats.recentAnomalies.map(anom => (
                                    <div key={anom.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] text-slate-500 font-mono">
                                                {new Date(anom.timestamp).toLocaleDateString()}
                                            </span>
                                            <span className={`text-[10px] font-bold px-1.5 rounded ${anom.riskScore > 70 ? 'bg-rose-500/20 text-rose-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                                {anom.riskScore}
                                            </span>
                                        </div>
                                        <div className="text-sm font-medium text-slate-300 mb-1 flex flex-wrap gap-1">
                                            {anom.reasons.map((r, i) => (
                                                <span key={i} className={`text-xs px-1.5 py-0.5 rounded ${
                                                    r.toLowerCase().includes('rage') || r.toLowerCase().includes('typing') 
                                                    ? 'bg-purple-500/20 text-purple-300' 
                                                    : 'bg-slate-800 text-slate-400'
                                                }`}>
                                                    {r}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-2">
                                            <span>Action:</span>
                                            <span className="text-slate-300 font-semibold">{anom.action}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-slate-500 py-8 text-sm">
                                    No significant anomalies detected in recent history.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Trusted Devices Panel */}
                    <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                             <Shield size={20} className="text-emerald-500"/>
                             <h3 className="text-white font-bold">Trusted Devices</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-xs text-slate-500 uppercase border-b border-slate-800">
                                    <tr>
                                        <th className="pb-3 pl-2">Device Name</th>
                                        <th className="pb-3">Type</th>
                                        <th className="pb-3">Last Used</th>
                                        <th className="pb-3">Trust Level</th>
                                        <th className="pb-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {localDevices.map(device => (
                                        <tr key={device.id} className="group">
                                            <td className="py-4 pl-2">
                                                <div className="font-medium text-slate-200 text-sm">{device.name}</div>
                                                <div className="text-xs text-slate-500 font-mono">{device.fingerprint}</div>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                    {device.type === 'MOBILE' ? <Smartphone size={14}/> : <Monitor size={14}/>}
                                                    {device.os}
                                                </div>
                                            </td>
                                            <td className="py-4 text-sm text-slate-400">
                                                {device.lastUsed}
                                            </td>
                                            <td className="py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                    device.status === 'TRUSTED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                                    device.status === 'REVOKED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                                                    'bg-slate-800 text-slate-400'
                                                }`}>
                                                    {device.status === 'TRUSTED' ? <CheckCircle size={10}/> : <AlertTriangle size={10}/>}
                                                    {device.status}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right">
                                                {device.status === 'TRUSTED' ? (
                                                    <button 
                                                        onClick={() => handleDeviceAction(device.id, 'REVOKE')}
                                                        className="text-xs font-medium text-rose-400 hover:text-white border border-rose-500/30 hover:bg-rose-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ml-auto"
                                                    >
                                                        <Trash2 size={12}/> Revoke
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleDeviceAction(device.id, 'TRUST')}
                                                        className="text-xs font-medium text-emerald-400 hover:text-white border border-emerald-500/30 hover:bg-emerald-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ml-auto"
                                                    >
                                                        <CheckCircle size={12}/> Trust
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- USER LIST VIEW ---
    return (
        <div className="p-8 h-full flex flex-col animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Users & Profiles</h1>
                    <p className="text-slate-400 text-sm">Manage identities and security permissions.</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    + Add New User
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
                    <input 
                        type="text" 
                        placeholder="Search users by name, email, or ID..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white text-sm">
                    <Filter size={16}/> Filters
                </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex-1 shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase border-b border-slate-800">
                            <tr>
                                <th className="p-4 font-semibold">User</th>
                                <th className="p-4 font-semibold">Risk Level</th>
                                <th className="p-4 font-semibold">Logins (7d/30d)</th>
                                <th className="p-4 font-semibold">High Risk %</th>
                                <th className="p-4 font-semibold">Trusted Devices</th>
                                <th className="p-4 font-semibold">Last Location</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {MOCK_USERS.map((user) => {
                                const stats = getUserStats(user.id) || {
                                    currentRiskLevel: RiskLevel.LOW,
                                    logins7d: 0,
                                    logins30d: 0,
                                    highRiskRate: 0,
                                    trustedDevices: 0,
                                    lastLocation: 'Unknown',
                                    lastLogin: new Date().toISOString()
                                };
                                
                                return (
                                    <tr key={user.id} className="hover:bg-slate-800/50 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-300 ring-2 ring-transparent group-hover:ring-slate-700 transition-all">
                                                    {user.avatar}
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium text-sm">{user.name}</div>
                                                    <div className="text-slate-500 text-xs flex items-center gap-1">
                                                        <Mail size={10}/> {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {getRiskBadge(stats.currentRiskLevel as RiskLevel)}
                                        </td>
                                        <td className="p-4 text-slate-300 text-sm font-mono">
                                            {stats.logins7d} <span className="text-slate-600 mx-1">/</span> {stats.logins30d}
                                        </td>
                                        <td className="p-4">
                                             <div className="flex items-center gap-2">
                                                <div className="flex-1 w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className={`h-full ${stats.highRiskRate > 10 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{width: `${Math.min(100, stats.highRiskRate)}%`}}></div>
                                                </div>
                                                <span className={`text-xs ${stats.highRiskRate > 10 ? 'text-orange-400' : 'text-slate-400'}`}>{stats.highRiskRate}%</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-300 text-sm pl-8">
                                            {stats.trustedDevices}
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-slate-300">{stats.lastLocation}</div>
                                            <div className="text-xs text-slate-500">{new Date(stats.lastLogin).toLocaleDateString()}</div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => setSelectedUser(user)}
                                                className="text-xs font-medium text-indigo-400 hover:text-white border border-indigo-500/30 hover:bg-indigo-600 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                View Profile
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UsersView;
