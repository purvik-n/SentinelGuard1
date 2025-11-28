
import React, { useState, useEffect } from 'react';
import { 
    Search, Filter, PlayCircle, PauseCircle, Activity, 
    Globe, Smartphone, Monitor, Server, Shield, ShieldAlert,
    CheckCircle, XCircle, AlertTriangle, Lock, X, Code, Terminal, Eye, FileJson, AlertOctagon, ThumbsDown
} from 'lucide-react';
import { SecurityEvent, RiskLevel } from '../types';
import { MOCK_USERS } from '../constants';
import { calculateRiskScore, RiskInput } from '../services/riskEngine';

interface EventsStreamProps {
    events: SecurityEvent[];
    onAddEvent: (event: SecurityEvent) => void;
}

const EventsStream: React.FC<EventsStreamProps> = ({ events, onAddEvent }) => {
    const [isPaused, setIsPaused] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
    const [showJson, setShowJson] = useState(false);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [riskFilter, setRiskFilter] = useState<'ALL' | RiskLevel>('ALL');
    const [actionFilter, setActionFilter] = useState<'ALL' | 'ALLOWED' | 'BLOCKED' | 'MFA_REQ' | 'LOCKED'>('ALL');
    const [sourceFilter, setSourceFilter] = useState<'ALL' | 'WEB' | 'MOBILE' | 'API'>('ALL');

    // Simulate real-time event stream using Risk Engine
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            const user = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
            const types = ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'MFA_CHALLENGE', 'API_ACCESS', 'LOGOUT'] as const;
            const type = types[Math.floor(Math.random() * types.length)];
            
            // Randomize Risk Inputs
            const input: RiskInput = {
                isNewDevice: Math.random() > 0.85,
                isNewLocation: Math.random() > 0.9,
                isImpossibleTravel: Math.random() > 0.95,
                isUnusualTime: Math.random() > 0.8,
                typingSpeedDeviation: Math.random() > 0.85,
                typingConsistencyErratic: Math.random() > 0.8,
                failedAttempts: Math.random() > 0.9 ? 4 : 0,
                navigationSensitive: Math.random() > 0.85,
                navigationBotLike: Math.random() > 0.9,
                
                // New Granular Behaviors
                mouseSpeedAnomaly: Math.random() > 0.9,
                mousePathRobotic: Math.random() > 0.95,
                clickRateAnomaly: Math.random() > 0.95,
                rageClicksDetected: Math.random() > 0.98,
                nonInteractiveClicks: Math.random() > 0.9,
                typingErrorRateHigh: Math.random() > 0.9,
                typingPerfectBot: Math.random() > 0.98,
                sensitiveFieldPaste: Math.random() > 0.95,

                // Form Interaction Randomization
                formCompletionSpeedHigh: Math.random() > 0.95,
                formFieldOrderUnusual: Math.random() > 0.98,
                hesitationAnomaly: Math.random() > 0.95
            };

            const riskResult = calculateRiskScore(input);

            let action: any = riskResult.action;
            if (type === 'LOGIN_FAILED') action = riskResult.level === RiskLevel.CRITICAL ? 'LOCKED' : 'BLOCKED';

            const sources = ['WEB', 'MOBILE', 'API'] as const;
            const source = sources[Math.floor(Math.random() * sources.length)];
            
            const devices = ['Chrome / macOS', 'Safari / iOS', 'Edge / Windows', 'Firefox / Linux', 'Android App'];
            const device = devices[Math.floor(Math.random() * devices.length)];

            const locations = ['San Francisco, US', 'New York, US', 'London, UK', 'Tokyo, JP', 'Berlin, DE', 'Sydney, AU', 'Lagos, NG'];
            const location = locations[Math.floor(Math.random() * locations.length)];

            const newEvent: SecurityEvent = {
                id: `evt_${Date.now()}_${Math.floor(Math.random()*1000)}`,
                timestamp: new Date().toISOString(),
                type,
                user,
                riskLevel: riskResult.level,
                riskScore: riskResult.score,
                action,
                source,
                location,
                ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                device,
                riskBreakdown: riskResult.breakdown,
                riskFactors: riskResult.factors,
                isFalsePositive: false,
                reviewed: false
            };

            onAddEvent(newEvent);
        }, 3500); // New event every 3.5 seconds

        return () => clearInterval(interval);
    }, [isPaused, onAddEvent]);

    const handleEventAction = (id: string, actionType: 'FALSE_POSITIVE' | 'LOCK' | 'TERMINATE') => {
        if (selectedEvent && selectedEvent.id === id) {
             const updated = { ...selectedEvent };
             if (actionType === 'FALSE_POSITIVE') { updated.isFalsePositive = true; updated.reviewed = true; }
             if (actionType === 'LOCK') { updated.action = 'LOCKED'; updated.reviewed = true; }
             setSelectedEvent(updated);
        }
    };

    const filteredEvents = events.filter(evt => {
        const matchesSearch = 
            evt.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            evt.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            evt.ip.includes(searchTerm) ||
            evt.id.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRisk = riskFilter === 'ALL' || evt.riskLevel === riskFilter;
        const matchesAction = actionFilter === 'ALL' || evt.action === actionFilter;
        const matchesSource = sourceFilter === 'ALL' || evt.source === sourceFilter;

        return matchesSearch && matchesRisk && matchesAction && matchesSource;
    });

    const getRiskBadge = (level: RiskLevel) => {
        switch (level) {
            case RiskLevel.CRITICAL: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">CRITICAL</span>;
            case RiskLevel.HIGH: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">HIGH</span>;
            case RiskLevel.MEDIUM: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">MEDIUM</span>;
            default: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">LOW</span>;
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'ALLOWED': return <CheckCircle size={14} className="text-emerald-500" />;
            case 'BLOCKED': return <XCircle size={14} className="text-rose-500" />;
            case 'MFA_REQ': return <ShieldAlert size={14} className="text-orange-500" />;
            case 'LOCKED': return <Lock size={14} className="text-rose-500" />;
            default: return <Activity size={14} className="text-slate-500" />;
        }
    };

    return (
        <div className="relative h-full flex flex-col animate-in fade-in duration-500 overflow-hidden">
             
             <div className="p-8 pb-0">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Activity className="text-emerald-500 animate-pulse" /> Real-Time Events
                        </h1>
                        <p className="text-slate-400 text-sm">Live stream of identity and access events.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsPaused(!isPaused)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${isPaused ? 'bg-emerald-600 border-emerald-500 hover:bg-emerald-500 text-white' : 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300'}`}
                        >
                            {isPaused ? <PlayCircle size={16} /> : <PauseCircle size={16} />}
                            {isPaused ? 'Resume Stream' : 'Pause Stream'}
                        </button>
                    </div>
                </div>

                {/* Filters Toolbar */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search IP, User, Event ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    
                    <div className="h-6 w-px bg-slate-800"></div>

                    <select 
                        value={riskFilter} 
                        onChange={(e) => setRiskFilter(e.target.value as any)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                    >
                        <option value="ALL">All Risks</option>
                        <option value={RiskLevel.CRITICAL}>Critical</option>
                        <option value={RiskLevel.HIGH}>High</option>
                        <option value={RiskLevel.MEDIUM}>Medium</option>
                        <option value={RiskLevel.LOW}>Low</option>
                    </select>

                    <select 
                        value={actionFilter} 
                        onChange={(e) => setActionFilter(e.target.value as any)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                    >
                        <option value="ALL">All Actions</option>
                        <option value="ALLOWED">Allowed</option>
                        <option value="MFA_REQ">MFA Challenge</option>
                        <option value="BLOCKED">Blocked</option>
                        <option value="LOCKED">Account Locked</option>
                    </select>

                    <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1">
                        <button 
                            onClick={() => setSourceFilter('ALL')}
                            className={`px-3 py-1 text-xs rounded transition-colors ${sourceFilter === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                        >All</button>
                        <button 
                            onClick={() => setSourceFilter('WEB')}
                            className={`px-3 py-1 text-xs rounded transition-colors ${sourceFilter === 'WEB' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                        >Web</button>
                        <button 
                            onClick={() => setSourceFilter('MOBILE')}
                            className={`px-3 py-1 text-xs rounded transition-colors ${sourceFilter === 'MOBILE' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                        >Mobile</button>
                    </div>
                </div>
            </div>

            {/* Events Table */}
            <div className="flex-1 overflow-hidden px-8 pb-8">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl h-full flex flex-col shadow-lg">
                    <div className="overflow-auto flex-1 scrollbar-hide">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-950/80 text-slate-400 text-xs uppercase sticky top-0 z-10 backdrop-blur-md shadow-sm">
                                <tr>
                                    <th className="p-4 font-semibold w-24">Time</th>
                                    <th className="p-4 font-semibold">Event</th>
                                    <th className="p-4 font-semibold">User</th>
                                    <th className="p-4 font-semibold">Anomalies</th>
                                    <th className="p-4 font-semibold">Location / IP</th>
                                    <th className="p-4 font-semibold">Risk</th>
                                    <th className="p-4 font-semibold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {filteredEvents.map((evt) => (
                                    <tr 
                                        key={evt.id} 
                                        onClick={() => { setSelectedEvent(evt); setShowJson(false); }}
                                        className={`hover:bg-slate-800/40 transition-colors group cursor-pointer ${evt.id === selectedEvent?.id ? 'bg-indigo-900/10' : ''}`}
                                    >
                                        <td className="p-4 text-slate-500 text-xs font-mono">
                                            {new Date(evt.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {evt.type.includes('LOGIN') ? <Shield size={16} className="text-indigo-400"/> : 
                                                evt.type.includes('MFA') ? <ShieldAlert size={16} className="text-orange-400"/> :
                                                <Server size={16} className="text-slate-400"/>}
                                                <span className="text-slate-200 text-sm font-medium">{evt.type.replace('_', ' ')}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <img src={`https://ui-avatars.com/api/?name=${evt.user.name}&background=random`} className="w-6 h-6 rounded-full" />
                                                <div className="flex flex-col">
                                                    <span className="text-slate-300 text-sm">{evt.user.email}</span>
                                                    {evt.isFalsePositive && <span className="text-[10px] text-emerald-400 font-bold">FALSE POSITIVE</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                                {evt.riskFactors && evt.riskFactors.length > 0 ? (
                                                    evt.riskFactors.slice(0, 3).map((factor, i) => (
                                                        <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded font-medium border whitespace-nowrap ${evt.riskLevel === RiskLevel.CRITICAL || evt.riskLevel === RiskLevel.HIGH ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                                            {factor}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-slate-600">-</span>
                                                )}
                                                {evt.riskFactors && evt.riskFactors.length > 3 && (
                                                    <span className="text-[10px] text-slate-500">+{evt.riskFactors.length - 3}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1 text-slate-300 text-xs">
                                                    <Globe size={10} /> {evt.location}
                                                </div>
                                                <span className="text-slate-500 text-[10px] font-mono pl-3.5">{evt.ip}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {getRiskBadge(evt.riskLevel)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <span className={`text-xs font-semibold ${
                                                    evt.action === 'ALLOWED' ? 'text-emerald-400' :
                                                    evt.action === 'BLOCKED' ? 'text-rose-400' :
                                                    evt.action === 'LOCKED' ? 'text-rose-500' : 'text-orange-400'
                                                }`}>
                                                    {evt.action}
                                                </span>
                                                {getActionIcon(evt.action)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredEvents.length === 0 && (
                            <div className="p-8 text-center text-slate-500">
                                No events match your filters.
                            </div>
                        )}
                    </div>
                    <div className="p-3 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between uppercase font-bold tracking-wider">
                        <span>Live Stream Active</span>
                        <span>Syncing...</span>
                    </div>
                </div>
            </div>

            {/* Event Detail Drawer Overlay */}
            {selectedEvent && (
                <div className="absolute inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}></div>
                    
                    {/* Drawer Content */}
                    <div className="relative w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-slate-800 bg-slate-900">
                             <div className="flex justify-between items-start mb-4">
                                 <div>
                                     <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-lg font-bold text-white">Event Analysis</h2>
                                        {selectedEvent.isFalsePositive && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">FALSE POSITIVE</span>
                                        )}
                                     </div>
                                     <span className="text-slate-500 text-xs font-mono">{selectedEvent.id}</span>
                                 </div>
                                 <button onClick={() => setSelectedEvent(null)} className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full">
                                     <X size={20} />
                                 </button>
                             </div>

                             {/* Risk Hero Score */}
                             <div className="flex items-center gap-6 p-4 bg-slate-950 rounded-xl border border-slate-800">
                                 <div className="relative w-16 h-16 flex items-center justify-center">
                                     <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                        <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"/>
                                        <path 
                                            className={`${selectedEvent.riskScore > 70 ? 'text-rose-500' : selectedEvent.riskScore > 30 ? 'text-orange-500' : 'text-emerald-500'}`}
                                            strokeDasharray={`${selectedEvent.riskScore}, 100`} 
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="3"
                                        />
                                    </svg>
                                    <div className="absolute flex flex-col items-center">
                                        <span className="text-sm font-bold text-white">{selectedEvent.riskScore}</span>
                                    </div>
                                 </div>
                                 <div className="flex-1">
                                     <h3 className={`font-bold ${selectedEvent.riskLevel === RiskLevel.CRITICAL ? 'text-rose-500' : 'text-slate-200'}`}>
                                         {selectedEvent.riskLevel} RISK
                                     </h3>
                                     <p className="text-xs text-slate-500 leading-tight mt-1">
                                         Analysis detected abnormal behavior patterns consistent with account compromise.
                                     </p>
                                 </div>
                             </div>
                        </div>

                        {/* Drawer Tabs (View Toggle) */}
                        <div className="flex border-b border-slate-800 px-6">
                            <button 
                                onClick={() => setShowJson(false)}
                                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${!showJson ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                            >
                                <Eye size={16}/> Investigation
                            </button>
                            <button 
                                onClick={() => setShowJson(true)}
                                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${showJson ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                            >
                                <FileJson size={16}/> Payload JSON
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            {showJson ? (
                                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs text-slate-300 overflow-auto">
                                    <pre>{JSON.stringify(selectedEvent, null, 2)}</pre>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Risk Breakdown */}
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Risk Attribution</h4>
                                        <div className="space-y-2">
                                            {selectedEvent.riskBreakdown && selectedEvent.riskBreakdown.length > 0 ? (
                                                selectedEvent.riskBreakdown.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800/50">
                                                        <span className="text-sm text-slate-300">{item.reason}</span>
                                                        <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded">+{item.score} risk</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-sm text-slate-500 italic p-2">No specific risk factors flagged. Baseline traffic.</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* User Context */}
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Identity Context</h4>
                                        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-800">
                                            <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-4">
                                                <img src={`https://ui-avatars.com/api/?name=${selectedEvent.user.name}&background=random`} className="w-10 h-10 rounded-full" />
                                                <div>
                                                    <div className="text-white font-medium">{selectedEvent.user.name}</div>
                                                    <div className="text-slate-500 text-xs">{selectedEvent.user.role} • {selectedEvent.user.department}</div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-xs text-slate-500 block">IP Address</span>
                                                    <span className="text-sm text-slate-300 font-mono">{selectedEvent.ip}</span>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-slate-500 block">Location</span>
                                                    <span className="text-sm text-slate-300">{selectedEvent.location}</span>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-xs text-slate-500 block">Device</span>
                                                    <span className="text-sm text-slate-300">{selectedEvent.device}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Drawer Actions Footer */}
                        <div className="p-4 border-t border-slate-800 bg-slate-900 grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => handleEventAction(selectedEvent.id, 'FALSE_POSITIVE')}
                                disabled={selectedEvent.isFalsePositive}
                                className="col-span-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium border border-slate-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <ThumbsDown size={16} /> Mark as False Positive
                            </button>
                            <button 
                                onClick={() => handleEventAction(selectedEvent.id, 'LOCK')}
                                className="py-2.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 rounded-lg text-sm font-bold border border-rose-500/50 transition-colors flex items-center justify-center gap-2"
                            >
                                <Lock size={16} /> Lock Account
                            </button>
                             <button className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium border border-slate-700 transition-colors flex items-center justify-center gap-2">
                                <AlertOctagon size={16} /> Terminate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventsStream;
