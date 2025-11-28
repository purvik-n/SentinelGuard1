
import React, { useState } from 'react';
import { 
    Monitor, Smartphone, Globe, UserCheck, Search, Filter, 
    ArrowLeft, Clock, AlertTriangle, Fingerprint, Shield, 
    Lock, AlertOctagon, MoreHorizontal, UserX, Flag, MousePointer, ExternalLink, Loader2,
    Keyboard, Mouse
} from 'lucide-react';
import { Session, RiskLevel, SessionStatus, SessionHistoryEvent } from '../types';

interface SessionMonitorProps {
  sessions: Session[];
  onUpdateSession: (sessionId: string, updates: Partial<Session>) => void;
}

const SessionMonitor: React.FC<SessionMonitorProps> = ({ sessions, onUpdateSession }) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const selectedSession = sessions.find(s => s.id === selectedSessionId);

  // Helper for Status Badge
  const getStatusBadge = (status: SessionStatus) => {
    switch (status) {
        case SessionStatus.ACTIVE: return <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/20">ACTIVE</span>;
        case SessionStatus.TERMINATED: return <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-700">TERMINATED</span>;
        case SessionStatus.BLOCKED: return <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-500/20">BLOCKED</span>;
        case SessionStatus.CHALLENGED: return <span className="text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded text-[10px] font-bold border border-orange-500/20">CHALLENGED</span>;
    }
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
        case RiskLevel.CRITICAL: return 'text-rose-500';
        case RiskLevel.HIGH: return 'text-orange-500';
        case RiskLevel.MEDIUM: return 'text-yellow-500';
        default: return 'text-emerald-500';
    }
  };

  const handleAction = (action: 'TERMINATE' | 'LOCK' | 'FLAG') => {
      if (!selectedSession) return;
      setProcessingAction(action);
      
      setTimeout(() => {
          if (action === 'TERMINATE') {
              onUpdateSession(selectedSession.id, { status: SessionStatus.TERMINATED });
          } else if (action === 'LOCK') {
              onUpdateSession(selectedSession.id, { status: SessionStatus.BLOCKED });
          } 
          // Flag is just visual in this demo, maybe add a property later
          setProcessingAction(null);
      }, 1000);
  };

  const getEventIcon = (event: SessionHistoryEvent) => {
      const desc = event.description.toLowerCase();
      if (desc.includes('mouse') || desc.includes('rage')) return <MousePointer size={10} className="text-white"/>;
      if (desc.includes('typing') || desc.includes('keyboard')) return <Keyboard size={10} className="text-white"/>;
      if (desc.includes('click')) return <Mouse size={10} className="text-white"/>;
      return null;
  }

  // --- DETAIL VIEW ---
  if (selectedSession) {
      const anomalies = selectedSession.eventHistory.filter(e => e.type === 'ANOMALY' || e.riskScore > 50);

      return (
        <div className="p-8 h-full flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header / Back */}
            <div className="flex items-center justify-between mb-6">
                <button 
                    onClick={() => setSelectedSessionId(null)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Sessions
                </button>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => handleAction('FLAG')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
                    >
                        {processingAction === 'FLAG' ? <Loader2 className="animate-spin" size={16}/> : <Flag size={16}/>} 
                        Flag as Investigated
                    </button>
                    <button 
                        onClick={() => handleAction('LOCK')}
                        disabled={selectedSession.status === SessionStatus.BLOCKED}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-600/10 border border-rose-500/30 hover:bg-rose-600/20 text-rose-500 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                    >
                        {processingAction === 'LOCK' ? <Loader2 className="animate-spin" size={16}/> : <Lock size={16}/>} 
                        Lock Account
                    </button>
                    <button 
                        onClick={() => handleAction('TERMINATE')}
                        disabled={selectedSession.status === SessionStatus.TERMINATED}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-rose-600/20 disabled:opacity-50"
                    >
                        {processingAction === 'TERMINATE' ? <Loader2 className="animate-spin" size={16}/> : <UserX size={16}/>} 
                        Terminate Session
                    </button>
                </div>
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
                
                {/* LEFT: Flow Timeline */}
                <div className="lg:col-span-2 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                Session Flow
                                <span className={`text-xs px-2 py-0.5 rounded border bg-opacity-10 ${getRiskColor(selectedSession.riskLevel)} border-current bg-current`}>
                                    {selectedSession.riskLevel} RISK ({selectedSession.riskScore}/100)
                                </span>
                            </h2>
                            <p className="text-slate-400 text-sm mt-1">
                                ID: <span className="font-mono text-slate-500">{selectedSession.id}</span> • Started {new Date(selectedSession.startedAt).toLocaleTimeString()}
                            </p>
                        </div>
                        <div className="flex gap-4 text-xs text-slate-400">
                             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-600"></div> System</div>
                             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Navigation</div>
                             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Anomaly</div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 relative">
                        {/* Timeline Connector Line */}
                        <div className="absolute left-12 top-8 bottom-8 w-0.5 bg-slate-800"></div>

                        <div className="space-y-8">
                            {selectedSession.eventHistory.map((event, idx) => {
                                const isRisk = event.riskScore > 50;
                                const isAnomaly = event.type === 'ANOMALY';
                                const anomalyIcon = isAnomaly ? getEventIcon(event) : null;
                                
                                return (
                                    <div key={event.id} className="relative flex items-start gap-6 group">
                                        {/* Time */}
                                        <div className="w-16 text-right pt-0.5">
                                            <span className="text-xs font-mono text-slate-500">
                                                {new Date(event.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}
                                            </span>
                                        </div>

                                        {/* Node */}
                                        <div className={`relative z-10 w-4 h-4 rounded-full border-2 mt-0.5 transition-all flex items-center justify-center
                                            ${isAnomaly ? 'bg-rose-500 border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] scale-125' : 
                                              event.type === 'ACTION' ? 'bg-indigo-950 border-indigo-400' :
                                              'bg-slate-900 border-slate-600'}
                                        `}>
                                            {isAnomaly && <div className="absolute inset-0 rounded-full animate-ping bg-rose-500 opacity-20"></div>}
                                            {anomalyIcon}
                                        </div>

                                        {/* Content Card */}
                                        <div className={`flex-1 p-4 rounded-xl border transition-all relative ${isRisk ? 'bg-rose-950/10 border-rose-500/30' : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50'}`}>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-sm font-bold ${isAnomaly ? 'text-rose-400' : 'text-slate-200'}`}>
                                                    {event.description}
                                                </span>
                                                {event.riskScore > 0 && (
                                                    <span className={`text-xs font-bold px-1.5 rounded ${event.riskScore > 50 ? 'text-rose-400 bg-rose-500/10' : 'text-slate-500 bg-slate-800'}`}>
                                                        Risk {event.riskScore}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-400 flex items-center gap-2">
                                                <span className="opacity-70">{event.type}</span>
                                                {event.details && (
                                                    <>
                                                        <span>•</span>
                                                        <span className={`${isAnomaly ? 'text-rose-300' : 'text-indigo-300'}`}>{event.details}</span>
                                                    </>
                                                )}
                                            </div>
                                            
                                            {/* Tooltip for Behavioral Anomaly */}
                                            {isAnomaly && (
                                                <div className="absolute left-0 -top-8 hidden group-hover:block bg-slate-900 text-white text-xs px-2 py-1 rounded border border-slate-700 whitespace-nowrap z-20 shadow-lg">
                                                    Behavioral Anomaly Detected
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Metadata & Highlights */}
                <div className="flex flex-col gap-6">
                    
                    {/* User Card */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                         <div className="flex items-center gap-4 mb-4">
                            <img src={`https://ui-avatars.com/api/?name=${selectedSession.user.name}&background=random`} className="w-12 h-12 rounded-full" />
                            <div>
                                <h3 className="text-white font-bold">{selectedSession.user.name}</h3>
                                <div className="text-slate-400 text-sm">{selectedSession.user.email}</div>
                                <div className="text-slate-500 text-xs mt-0.5">{selectedSession.user.role} • {selectedSession.user.department}</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-slate-950 p-2 rounded border border-slate-800">
                                <div className="text-slate-500 text-xs">IP Address</div>
                                <div className="text-slate-300 font-mono">{selectedSession.ip}</div>
                            </div>
                             <div className="bg-slate-950 p-2 rounded border border-slate-800">
                                <div className="text-slate-500 text-xs">Location</div>
                                <div className="text-slate-300 truncate">{selectedSession.location}</div>
                            </div>
                        </div>
                    </div>

                    {/* Behaviour Highlights */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex-1 flex flex-col">
                         <div className="flex items-center gap-2 mb-4">
                             <AlertOctagon size={20} className="text-orange-500"/>
                             <h3 className="text-white font-bold">Behaviour Highlights</h3>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-3">
                            {anomalies.length > 0 ? (
                                anomalies.map((anom, i) => (
                                    <div key={i} className="p-3 rounded-lg bg-rose-950/10 border border-rose-900/30">
                                        <div className="text-rose-400 text-sm font-bold mb-1">{anom.description}</div>
                                        <div className="text-rose-300/70 text-xs">{anom.details || 'Detected abnormal pattern matching known attack vector.'}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-32 text-slate-500">
                                    <UserCheck size={32} className="opacity-20 mb-2"/>
                                    <span className="text-xs">No significant anomalies detected.</span>
                                </div>
                            )}

                            {/* Additional Biometrics Data */}
                            <div className="mt-6 pt-6 border-t border-slate-800">
                                <h4 className="text-xs text-slate-500 uppercase font-bold mb-3">Biometric Telemetry</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400 flex items-center gap-2"><MousePointer size={14}/> Mouse Velocity</span>
                                        <span className="text-slate-200 font-mono">{selectedSession.behavioralData.mouseVelocity} px/s</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400 flex items-center gap-2"><Fingerprint size={14}/> Typing Variance</span>
                                        <span className={`${selectedSession.behavioralData.typingVariance < 0.2 ? 'text-rose-400' : 'text-emerald-400'} font-mono`}>
                                            {selectedSession.behavioralData.typingVariance}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      );
  }

  // --- LIST VIEW ---
  const filteredSessions = sessions.filter(s => 
      s.user.name.toLowerCase().includes(filterText.toLowerCase()) || 
      s.ip.includes(filterText) ||
      s.id.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="p-8 h-full flex flex-col animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Session Manager</h1>
                <p className="text-slate-400 text-sm">Inspect active sessions and analyze user flows.</p>
            </div>
            
            <div className="flex items-center gap-4">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
                    <input 
                        type="text" 
                        placeholder="Search sessions..." 
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 w-64"
                    />
                </div>
                <button className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white">
                    <Filter size={18} />
                </button>
            </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex-1 overflow-hidden shadow-lg">
            <div className="overflow-auto h-full scrollbar-hide">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-950/80 text-slate-400 text-xs uppercase sticky top-0 z-10 backdrop-blur-md">
                        <tr>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">User</th>
                            <th className="p-4 font-semibold">Device & Location</th>
                            <th className="p-4 font-semibold">Start Time</th>
                            <th className="p-4 font-semibold">Anomalies</th>
                            <th className="p-4 font-semibold">Risk Score</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filteredSessions.map((session) => (
                            <tr 
                                key={session.id} 
                                className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                                onClick={() => setSelectedSessionId(session.id)}
                            >
                                <td className="p-4">
                                    {getStatusBadge(session.status)}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                             <img src={`https://ui-avatars.com/api/?name=${session.user.name}&background=random`} className="w-8 h-8 rounded-full" />
                                             {session.riskLevel === RiskLevel.CRITICAL && (
                                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-slate-900 rounded-full animate-pulse"></span>
                                             )}
                                        </div>
                                        <div>
                                            <div className="text-white font-medium text-sm">{session.user.name}</div>
                                            <div className="text-slate-500 text-xs">{session.user.role}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5 text-slate-300 text-sm">
                                            {session.device.toLowerCase().includes('iphone') ? <Smartphone size={14}/> : <Monitor size={14}/>}
                                            {session.device}
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                                            <Globe size={10}/> {session.location}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-400 text-xs font-mono">
                                    {new Date(session.startedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-1">
                                        {session.riskFactors.length > 0 ? (
                                            session.riskFactors.slice(0, 2).map(f => (
                                                <span key={f} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                                                    {f}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[10px] text-slate-600">-</span>
                                        )}
                                        {session.riskFactors.length > 2 && <span className="text-[10px] text-slate-500">+{session.riskFactors.length - 2}</span>}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${session.riskScore > 70 ? 'bg-rose-500' : session.riskScore > 30 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                                                style={{width: `${session.riskScore}%`}}
                                            ></div>
                                        </div>
                                        <span className={`text-xs font-bold ${session.riskScore > 70 ? 'text-rose-400' : 'text-slate-400'}`}>{session.riskScore}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <button className="text-xs font-medium text-indigo-400 hover:text-white border border-indigo-500/30 hover:bg-indigo-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ml-auto">
                                        View <ExternalLink size={10}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default SessionMonitor;
