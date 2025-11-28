import React, { useState, useEffect, useRef } from 'react';
import { 
    Fingerprint, MousePointer, Keyboard, Activity, AlertTriangle, 
    CheckCircle, Smartphone, StopCircle, PlayCircle, Zap, RefreshCw,
    Mouse, Delete, Clipboard, AlertCircle, Move, Lock, Eye
} from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

interface KeystrokePoint {
    flightTime: number;
    dwellTime: number;
    id: number;
}

interface TelemetryRow {
    timestamp: number;
    type: string;
    target: string; // New: UI Element target
    x: number;
    y: number;
    pressure: string;
    velocity: string;
    classification: string;
    details?: string;
}

const BiometricsView: React.FC = () => {
    const [isSimulating, setIsSimulating] = useState(false);
    const [mode, setMode] = useState<'HUMAN' | 'BOT'>('HUMAN');
    
    // Chart & Log Data
    const [liveChartData, setLiveChartData] = useState<KeystrokePoint[]>([]);
    const [telemetryLog, setTelemetryLog] = useState<TelemetryRow[]>([]);
    const [cursorPos, setCursorPos] = useState({ x: 50, y: 200 });
    const [isRaging, setIsRaging] = useState(false); // Visual flare for rage clicks
    
    // New Behavioral Stats
    const [clickStats, setClickStats] = useState({ cps: 0, rageClicks: 0, doubleClicks: 0, totalClicks: 0, missedClicks: 0 });
    const [typingStats, setTypingStats] = useState({ backspaces: 0, pastes: 0, totalKeys: 0, errorRate: 0, rhythm: 'Calculating...' });
    const [activeAnomalies, setActiveAnomalies] = useState<string[]>([]);

    // Refs for animation calculation
    const tickRef = useRef(0);

    // Start/Stop Logic
    const startSimulation = (selectedMode: 'HUMAN' | 'BOT') => {
        setMode(selectedMode);
        setIsSimulating(true);
        // Reset Logic
        if (!isSimulating) {
            setLiveChartData([]); 
            setTelemetryLog([]);
            setClickStats({ cps: 0, rageClicks: 0, doubleClicks: 0, totalClicks: 0, missedClicks: 0 });
            setTypingStats({ backspaces: 0, pastes: 0, totalKeys: 0, errorRate: 0, rhythm: 'Analyzing...' });
            setActiveAnomalies([]);
            tickRef.current = 0;
            setCursorPos({ x: 50, y: 200 });
        }
    };

    const stopSimulation = () => {
        setIsSimulating(false);
        setIsRaging(false);
    };

    // Live Data Generation Engine
    useEffect(() => {
        if (!isSimulating) return;

        const interval = setInterval(() => {
            tickRef.current += 1;
            const t = tickRef.current;
            const currentAnomalies: string[] = [];

            // --- 1. Keystroke Dynamics ---
            let flightTime, dwellTime;
            let currentRhythm = 'Steady';

            if (mode === 'HUMAN') {
                // Human: Burst typing (fast) then Pause (think)
                const isBurst = Math.random() > 0.3;
                if (isBurst) {
                    flightTime = 60 + (Math.random() * 40); // Fast
                    currentRhythm = 'Natural Burst';
                } else {
                    flightTime = 200 + (Math.random() * 150); // Think time
                    currentRhythm = 'Stop-and-Go';
                }
                dwellTime = 100 + (Math.random() * 40) - 20; 
            } else {
                // Bot: extremely consistent / Isochronous
                flightTime = 15 + (Math.random() * 2); 
                dwellTime = 30 + (Math.random() * 1);
                currentRhythm = 'Isochronous (Machine)';
            }

            const newPoint: KeystrokePoint = {
                flightTime: parseFloat(flightTime.toFixed(1)),
                dwellTime: parseFloat(dwellTime.toFixed(1)),
                id: t
            };
            setLiveChartData(prev => [...prev.slice(-49), newPoint]); 

            // --- 2. Mouse Movement ---
            let newX, newY;
            if (mode === 'HUMAN') {
                newX = 50 + (t * 5) % 450;
                newY = 200 + Math.sin(t * 0.1) * 100 + (Math.random() * 5); 
            } else {
                newX = 50 + (t * 8) % 450;
                newY = 200 + (t * 2) % 100; // Linear bot lines
            }
            setCursorPos({ x: newX, y: newY });

            // --- 3. Click & Typing Anomalies ---
            
            let addedRage = 0;
            let addedClick = 0;
            let addedMissed = 0; // Clicks on non-interactive
            let addedBackspace = 0;
            let addedPaste = 0;
            let addedKey = 1; 

            let eventType = t % 5 === 0 ? 'keydown' : 'mousemove';
            let target = 'body';
            let details = '';

            // SIMULATION LOGIC
            if (mode === 'HUMAN') {
                // Humans make errors (Backspaces)
                if (Math.random() > 0.85) {
                    addedBackspace = 1;
                    eventType = 'keydown:BACKSPACE';
                    target = 'input_email';
                    details = 'Correction';
                }
                
                // Humans Rage Click (Frustration)
                if (Math.random() > 0.96) {
                    addedRage = 1;
                    addedClick = 5; // burst
                    eventType = 'rage_click';
                    target = 'btn_submit';
                    details = '5 clicks / 200ms';
                    setIsRaging(true);
                    setTimeout(() => setIsRaging(false), 300);
                    currentAnomalies.push('Rage Click Detected');
                } else if (Math.random() > 0.9) {
                    addedClick = 1;
                    eventType = 'click';
                    // Occasional miss (non-interactive)
                    if (Math.random() > 0.8) {
                        addedMissed = 1;
                        target = 'div_container'; // Non-interactive
                    } else {
                        target = 'btn_submit';
                    }
                }
            } else {
                // Bots paste data into sensitive fields
                if (Math.random() > 0.92) {
                    addedPaste = 1;
                    eventType = 'clipboard:PASTE';
                    target = 'input_password';
                    details = 'Bulk insert (hidden)';
                    currentAnomalies.push('Sensitive Field Paste');
                }
                // Bots click consistently
                if (Math.random() > 0.7) {
                    addedClick = 1;
                    eventType = 'click';
                    target = 'btn_login';
                }
            }

            // Update Stats
            setClickStats(prev => ({
                totalClicks: prev.totalClicks + addedClick,
                rageClicks: prev.rageClicks + addedRage,
                missedClicks: prev.missedClicks + addedMissed,
                doubleClicks: prev.doubleClicks + (addedClick > 1 ? 1 : 0),
                cps: addedClick * 10 
            }));

            setTypingStats(prev => {
                const newTotal = prev.totalKeys + addedKey;
                const newBack = prev.backspaces + addedBackspace;
                return {
                    totalKeys: newTotal,
                    backspaces: newBack,
                    pastes: prev.pastes + addedPaste,
                    errorRate: parseFloat(((newBack / newTotal) * 100).toFixed(1)),
                    rhythm: currentRhythm
                };
            });

            if (typingStats.errorRate > 15) currentAnomalies.push('High Error Rate (>15%)');
            if (clickStats.missedClicks > 5) currentAnomalies.push('Confusion (Non-interactive Clicks)');
            
            setActiveAnomalies(prev => [...new Set([...currentAnomalies])]);

            // --- 4. Telemetry Log ---
            const newLog: TelemetryRow = {
                timestamp: Date.now(),
                type: eventType,
                target: target,
                x: Math.floor(newX * 3), 
                y: Math.floor(newY * 3),
                pressure: mode === 'HUMAN' ? (0.3 + Math.random() * 0.5).toFixed(2) : '1.00',
                velocity: mode === 'HUMAN' ? (Math.random() * 1.5).toFixed(3) : '20.000',
                classification: mode,
                details: details
            };

            setTelemetryLog(prev => [newLog, ...prev].slice(0, 15)); 

        }, 150); 

        return () => clearInterval(interval);
    }, [isSimulating, mode, typingStats.errorRate, clickStats.missedClicks]);

    return (
        <div className="p-8 h-full flex flex-col animate-in fade-in duration-500 overflow-y-auto">
             <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Fingerprint className="text-indigo-500" /> Behavioral Risk Factors
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Real-time analysis of behavioral telemetry signals.</p>
                </div>
                
                {/* Controls */}
                <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800">
                     {!isSimulating ? (
                        <>
                            <button 
                                onClick={() => startSimulation('HUMAN')}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 rounded-lg text-sm font-bold transition-colors border border-emerald-500/20"
                            >
                                <PlayCircle size={16} /> Simulate Human
                            </button>
                            <button 
                                onClick={() => startSimulation('BOT')}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 rounded-lg text-sm font-bold transition-colors border border-rose-500/20"
                            >
                                <Zap size={16} /> Simulate Bot
                            </button>
                        </>
                     ) : (
                        <button 
                            onClick={stopSimulation}
                            className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors border border-slate-600 animate-pulse"
                        >
                            <StopCircle size={16} /> Stop Live Feed
                        </button>
                     )}
                </div>
            </div>

            {/* Row 1: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                
                {/* Keystroke Dynamics */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <Keyboard className="text-emerald-500" size={20}/> Keystroke Dynamics
                        </h3>
                        {isSimulating && (
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-mono font-bold ${typingStats.rhythm.includes('Machine') ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    RHYTHM: {typingStats.rhythm}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    <div className="h-48 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis type="number" dataKey="flightTime" name="Flight" unit="ms" stroke="#64748b" fontSize={10} domain={[0, 400]} />
                                <YAxis type="number" dataKey="dwellTime" name="Dwell" unit="ms" stroke="#64748b" fontSize={10} domain={[0, 150]} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                                <Scatter name="Keystrokes" data={liveChartData}>
                                    {liveChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={mode === 'BOT' ? '#f43f5e' : '#10b981'} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                        {!isSimulating && liveChartData.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 text-slate-500 text-sm">No live data</div>
                        )}
                    </div>
                </div>

                {/* Mouse Movement */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <MousePointer className="text-blue-500" size={20}/> Mouse Path
                        </h3>
                        <div className={`px-2 py-1 rounded text-xs font-bold ${mode === 'BOT' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            {mode} MODE
                        </div>
                    </div>

                    <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden h-48">
                        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 pointer-events-none">
                            {Array.from({length: 36}).map((_, i) => (
                                <div key={i} className="border-[0.5px] border-slate-800/30"></div>
                            ))}
                        </div>
                        {/* Cursor Pulse for Rage Click */}
                        <div 
                            className={`absolute w-8 h-8 rounded-full -ml-2.5 -mt-2.5 transition-all duration-300 ${isRaging ? 'bg-rose-500/40 scale-150' : 'bg-transparent scale-0'}`}
                            style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y / 2}px` }}
                        ></div>
                        {/* Cursor Dot */}
                        <div 
                            className="absolute w-3 h-3 rounded-full border shadow-[0_0_10px_currentColor] transition-all duration-100 ease-linear"
                            style={{ 
                                left: `${cursorPos.x}px`, 
                                top: `${cursorPos.y / 2}px`, 
                                borderColor: mode === 'BOT' ? '#f43f5e' : '#10b981',
                                backgroundColor: mode === 'BOT' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                color: mode === 'BOT' ? '#f43f5e' : '#10b981'
                            }}
                        ></div>
                        <div className="absolute bottom-2 left-3 text-xs text-slate-500 font-mono">
                            X:{cursorPos.x.toFixed(0)} Y:{cursorPos.y.toFixed(0)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 2: New Behavioral Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                
                {/* Click Behavior */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-2 mb-6">
                        <Mouse className="text-orange-500" size={20}/>
                        <h3 className="text-white font-bold">Click Behavior Analysis</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                             <div className="text-xs text-slate-500 uppercase font-bold mb-1">Rage Clicks</div>
                             <div className="flex items-baseline gap-2">
                                 <span className={`text-2xl font-bold ${clickStats.rageClicks > 0 ? 'text-rose-500' : 'text-slate-300'}`}>
                                     {clickStats.rageClicks}
                                 </span>
                                 <span className="text-xs text-slate-500">bursts</span>
                             </div>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                             <div className="text-xs text-slate-500 uppercase font-bold mb-1">Missed Targets</div>
                             <div className="flex items-baseline gap-2">
                                 <span className={`text-2xl font-bold ${clickStats.missedClicks > 3 ? 'text-orange-400' : 'text-white'}`}>
                                     {clickStats.missedClicks}
                                 </span>
                                 <span className="text-xs text-slate-500">non-interactive</span>
                             </div>
                        </div>
                    </div>
                    
                    {/* Active Anomalies List */}
                    <div className="mt-4 p-3 bg-slate-950/50 rounded-lg border border-slate-800/50 min-h-[60px]">
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                            <AlertCircle size={12} className={activeAnomalies.length > 0 ? "text-rose-500" : "text-slate-600"}/>
                            <span>Anomalies Detected</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {activeAnomalies.length > 0 ? (
                                activeAnomalies.map((anom, i) => (
                                    <span key={i} className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">
                                        {anom}
                                    </span>
                                ))
                            ) : (
                                 <span className="text-xs font-medium text-emerald-500">Normal Interaction Pattern</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Typing Integrity */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-2 mb-6">
                        <Delete className="text-purple-500" size={20}/>
                        <h3 className="text-white font-bold">Typing Error & Integrity</h3>
                    </div>

                    <div className="space-y-4">
                        {/* Error Rate Bar */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">Error Rate (Backspaces)</span>
                                <span className={`${typingStats.errorRate > 10 ? 'text-orange-400' : typingStats.errorRate === 0 && typingStats.totalKeys > 10 ? 'text-rose-400' : 'text-emerald-400'} font-bold`}>
                                    {typingStats.errorRate}%
                                </span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-300 ${typingStats.errorRate > 10 ? 'bg-orange-500' : typingStats.errorRate === 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${Math.min(100, typingStats.errorRate * 5)}%` }} // Scale visualization
                                ></div>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                                <span>Human Baseline: 5-10%</span>
                                <span>Bot Baseline: 0%</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                             <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                                 <div>
                                     <div className="text-[10px] text-slate-500 uppercase font-bold">Corrections</div>
                                     <div className="text-xl font-bold text-white">{typingStats.backspaces}</div>
                                 </div>
                                 <Delete size={20} className="text-slate-600"/>
                             </div>
                             <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                                 <div>
                                     <div className="text-[10px] text-slate-500 uppercase font-bold">Sensitive Paste</div>
                                     <div className={`text-xl font-bold ${typingStats.pastes > 0 ? 'text-rose-400' : 'text-white'}`}>{typingStats.pastes}</div>
                                 </div>
                                 {typingStats.pastes > 0 ? <Lock size={20} className="text-rose-500 animate-pulse"/> : <Clipboard size={20} className="text-slate-600"/>}
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Telemetry Log */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex-1 min-h-[300px] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-white font-bold flex items-center gap-2">
                        <Smartphone className="text-purple-500" size={20}/> Real-Time Sensor Telemetry
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <RefreshCw size={12} className={isSimulating ? "animate-spin" : ""} />
                        {isSimulating ? 'Syncing...' : 'Standby'}
                    </div>
                </div>
                
                <div className="overflow-hidden rounded-xl border border-slate-800 flex-1 relative bg-slate-950">
                    <div className="absolute inset-0 overflow-y-auto scrollbar-hide">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-950 text-xs uppercase font-bold text-slate-500 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="p-3 pl-4">Timestamp</th>
                                    <th className="p-3">Event Type</th>
                                    <th className="p-3">Target Element</th>
                                    <th className="p-3">Coords</th>
                                    <th className="p-3">Details</th>
                                    <th className="p-3">Class</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 bg-slate-900">
                                {telemetryLog.length > 0 ? (
                                    telemetryLog.map((row) => (
                                        <tr key={row.timestamp} className="hover:bg-slate-800/30 transition-colors animate-in slide-in-from-top-1 duration-200">
                                            <td className="p-3 pl-4 font-mono text-xs text-slate-500">{row.timestamp}</td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    {row.type.includes('rage') ? <AlertTriangle size={12} className="text-rose-500"/> : 
                                                     row.type.includes('PASTE') ? <Lock size={12} className="text-rose-500"/> :
                                                     row.type.includes('BACKSPACE') ? <Delete size={12} className="text-yellow-500"/> :
                                                     row.type.includes('click') ? <Mouse size={12} className="text-blue-500"/> :
                                                     <Move size={12} className="text-slate-600"/>}
                                                    <span className={`text-xs ${
                                                        row.type.includes('rage') ? 'text-rose-400 font-bold' : 
                                                        row.type.includes('PASTE') ? 'text-rose-400 font-bold' : 'text-slate-300'
                                                    }`}>{row.type}</span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <span className={`text-xs font-mono px-1.5 py-0.5 rounded border ${
                                                    row.target.includes('password') ? 'bg-rose-900/30 border-rose-800 text-rose-300' :
                                                    row.target.includes('btn') ? 'bg-indigo-900/30 border-indigo-800 text-indigo-300' :
                                                    'bg-slate-800 border-slate-700 text-slate-400'
                                                }`}>
                                                    {row.target}
                                                </span>
                                            </td>
                                            <td className="p-3 font-mono text-xs text-indigo-300">{row.x}, {row.y}</td>
                                            <td className="p-3 text-xs text-slate-400">{row.details || '-'}</td>
                                            <td className="p-3">
                                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                                    row.classification === 'BOT' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                }`}>
                                                    {row.classification}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-600 italic">
                                            Waiting for data stream... Click "Simulate" to begin.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BiometricsView;