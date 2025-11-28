
import React, { useState } from 'react';
import { Terminal, Play, Code, CheckCircle, ShieldAlert, Zap, Server, Smartphone, Clock, Copy, Check, Send, ExternalLink, User, Mouse, Lock, MousePointer, Keyboard, FileText } from 'lucide-react';
import { SecurityEvent, View } from '../types';
import { calculateRiskScore, RiskInput } from '../services/riskEngine';
import { MOCK_USERS } from '../constants';

interface DeveloperPlaygroundProps {
    onSendEvent: (event: SecurityEvent) => void;
    onNavigate: (view: View) => void;
}

const DeveloperPlayground: React.FC<DeveloperPlaygroundProps> = ({ onSendEvent, onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [eventSent, setEventSent] = useState(false);
  
  // Configuration State
  const [config, setConfig] = useState({
    targetUser: MOCK_USERS[1].id,
    ipType: 'residential',     // residential | datacenter | tor
    geoVelocity: 'local',      // local | regional | impossible
    deviceStatus: 'known',     // known | new | emulator
    timeContext: 'business',   // business | unusual
    
    // --- Mouse Behaviour ---
    mouseSpeed: 'normal',      // very_slow | normal | fast | very_fast
    mousePattern: 'smooth',    // smooth | erratic | robotic
    mouseIdle: 'normal',       // normal | burst

    // --- Click Behaviour ---
    clickRate: 'normal',       // low | normal | high | very_high
    rageClicks: false,         // boolean
    misclicks: 'normal',       // low | normal | high

    // --- Typing Behaviour ---
    typingErrorRate: 'normal', // low | normal | high | very_high
    sensitivePaste: false,     // boolean

    // --- Form Context ---
    formSpeed: 'normal',       // very_slow | normal | fast | bot_fast
    formFieldOrder: 'normal',  // normal | unusual
    
    includeAiAnalysis: false
  });

  // Map config to RiskInput
  const getRiskInput = (): RiskInput => {
      return {
          isNewDevice: config.deviceStatus === 'new',
          isNewLocation: config.geoVelocity !== 'local',
          isImpossibleTravel: config.geoVelocity === 'impossible',
          isUnusualTime: config.timeContext === 'unusual',
          failedAttempts: config.ipType === 'tor' ? 4 : 0,
          navigationSensitive: false,
          navigationBotLike: config.mousePattern === 'robotic',

          // Mouse
          mouseSpeedAnomaly: config.mouseSpeed === 'very_slow' || config.mouseSpeed === 'very_fast',
          mousePathRobotic: config.mousePattern === 'robotic',
          hesitationAnomaly: config.mouseIdle === 'burst' || config.formSpeed === 'very_slow',

          // Click
          clickRateAnomaly: config.clickRate === 'high' || config.clickRate === 'very_high',
          rageClicksDetected: config.rageClicks,
          nonInteractiveClicks: config.misclicks === 'high',

          // Typing
          typingErrorRateHigh: config.typingErrorRate === 'high' || config.typingErrorRate === 'very_high',
          typingPerfectBot: config.typingErrorRate === 'low' && config.formSpeed === 'bot_fast', 
          sensitiveFieldPaste: config.sensitivePaste,
          typingSpeedDeviation: false,
          typingConsistencyErratic: false,

          // Form
          formCompletionSpeedHigh: config.formSpeed === 'bot_fast',
          formFieldOrderUnusual: config.formFieldOrder === 'unusual',
      };
  };

  // Dynamic Request Body Preview
  const requestBody = {
      event_type: "login_attempt",
      user: {
          id: config.targetUser,
          email: MOCK_USERS.find(u => u.id === config.targetUser)?.email || "unknown"
      },
      context: {
          ip_address: config.ipType === 'tor' ? '185.220.101.4' : config.ipType === 'datacenter' ? '45.22.19.112' : '192.168.1.42',
          user_agent: config.deviceStatus === 'emulator' ? 'Android SDK built for x86' : 'Mozilla/5.0 ...',
          timestamp: new Date().toISOString(),
          location: {
              lat: 37.7749,
              lng: -122.4194,
              velocity_check: config.geoVelocity
          }
      },
      biometrics: {
          mouse: {
              speed: config.mouseSpeed,
              pattern: config.mousePattern,
              idle_pattern: config.mouseIdle
          },
          clicks: {
              rate: config.clickRate,
              rage_detected: config.rageClicks,
              misclick_rate: config.misclicks
          },
          typing: {
              error_rate: config.typingErrorRate,
              paste_detected: config.sensitivePaste
          },
          form_interaction: {
              speed: config.formSpeed,
              field_order: config.formFieldOrder
          }
      },
      options: {
          include_explanation: config.includeAiAnalysis
      }
  };

  const copyRequest = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulate = () => {
    setLoading(true);
    setResponse(null);
    setEventSent(false);

    const input = getRiskInput();
    const result = calculateRiskScore(input);
    const delay = config.includeAiAnalysis ? 2000 : 800; // Simulate AI latency

    setTimeout(() => {
        const mockResponse = {
            success: true,
            request_id: `req_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            risk_analysis: {
                score: result.score,
                level: result.level,
                action: result.action,
                factors: result.factors,
            },
            details: {
                breakdown: result.breakdown.map(b => ({ reason: b.reason, impact: `+${b.score}` }))
            },
            ...(config.includeAiAnalysis && {
                ai_explanation: {
                    summary: `Detected ${result.level} risk anomaly (${result.score}/100).`,
                    reasoning: `User activity deviates significantly from baseline. ${result.factors.join(', ')} detected.`
                }
            })
        };

        setResponse(mockResponse);
        setLoading(false);
    }, delay);
  };

  const handleSendToStream = () => {
    if (!response) return;

    // Map configuration to a realistic SecurityEvent
    const selectedUser = MOCK_USERS.find(u => u.id === config.targetUser) || MOCK_USERS[0];

    const breakdown = response.details.breakdown.map((b: any) => ({
        reason: b.reason,
        score: parseInt(b.impact.replace('+', '')) || 0
    }));

    const newEvent: SecurityEvent = {
        id: `evt_sim_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: response.risk_analysis.action === 'BLOCKED' ? 'LOGIN_FAILED' : 'LOGIN_SUCCESS',
        user: selectedUser,
        riskLevel: response.risk_analysis.level,
        riskScore: response.risk_analysis.score,
        action: response.risk_analysis.action,
        source: 'API',
        location: config.geoVelocity === 'local' ? 'San Francisco, US' : config.geoVelocity === 'regional' ? 'Portland, US' : 'Moscow, RU',
        ip: config.ipType === 'tor' ? '185.220.101.4' : '192.168.1.50',
        device: config.deviceStatus === 'emulator' ? 'Android Emulator' : 'Chrome / macOS',
        riskBreakdown: breakdown,
        isFalsePositive: false,
        reviewed: false,
        riskFactors: response.risk_analysis.factors
    };

    onSendEvent(newEvent);
    setEventSent(true);
    setTimeout(() => setEventSent(false), 5000);
  };

  return (
    <div className="p-8 h-full flex flex-col animate-in fade-in duration-500 max-w-7xl mx-auto w-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Terminal className="text-emerald-500" /> 
            API Playground
        </h1>
        <p className="text-slate-400 text-sm mt-1">
            Test the risk scoring engine by constructing payloads and simulating different threat scenarios.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-8">
        
        {/* --- COLUMN 1: CONFIGURATION --- */}
        <div className="xl:col-span-1 space-y-6">

             {/* Target User Selector */}
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm">
                    <User size={16} className="text-emerald-400"/> Target Identity
                </h3>
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Simulate Event For</label>
                    <select 
                        value={config.targetUser}
                        onChange={(e) => setConfig({...config, targetUser: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                    >
                        {MOCK_USERS.map(u => (
                            <option key={u.id} value={u.id}>
                                {u.name} ({u.role}) - {u.email}
                            </option>
                        ))}
                    </select>
                    <p className="text-[10px] text-slate-500 mt-2">
                        Tip: Select "Bob Smith" to see these events appear in the "My Security Activity" End-User portal.
                    </p>
                </div>
            </div>
            
            {/* Network Context */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm">
                    <Server size={16} className="text-indigo-400"/> Network Context
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">IP Reputation</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['residential', 'datacenter', 'tor'].map(type => (
                                <button 
                                    key={type}
                                    onClick={() => setConfig({...config, ipType: type})}
                                    className={`py-2 px-1 rounded-lg text-xs font-medium border capitalize transition-all ${config.ipType === type ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                     <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Geo-Velocity</label>
                         <div className="grid grid-cols-3 gap-2">
                            {['local', 'regional', 'impossible'].map(type => (
                                <button 
                                    key={type}
                                    onClick={() => setConfig({...config, geoVelocity: type})}
                                    className={`py-2 px-1 rounded-lg text-xs font-medium border capitalize transition-all ${config.geoVelocity === type ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Behavioral Biometrics - Expanded */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm">
                    <Smartphone size={16} className="text-purple-400"/> Biometric Signals
                </h3>
                <div className="space-y-6">
                    
                    {/* Device Status */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Device Fingerprint</label>
                        <select 
                            value={config.deviceStatus}
                            onChange={(e) => setConfig({...config, deviceStatus: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                        >
                            <option value="known">Known Device</option>
                            <option value="new">New Device (+25 Risk)</option>
                            <option value="emulator">Mobile Emulator</option>
                        </select>
                    </div>

                    <div className="h-px bg-slate-800"></div>

                    {/* Mouse Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-xs text-indigo-300 font-bold uppercase tracking-wider">
                            <MousePointer size={12}/> Mouse Behaviour
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="text-[10px] text-slate-500 block mb-1">Speed</label>
                                <select 
                                    value={config.mouseSpeed}
                                    onChange={(e) => setConfig({...config, mouseSpeed: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-2 outline-none focus:border-indigo-500"
                                >
                                    <option value="very_slow">Very Slow</option>
                                    <option value="normal">Normal</option>
                                    <option value="fast">Fast</option>
                                    <option value="very_fast">Very Fast</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 block mb-1">Pattern</label>
                                <select 
                                    value={config.mousePattern}
                                    onChange={(e) => setConfig({...config, mousePattern: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-2 outline-none focus:border-indigo-500"
                                >
                                    <option value="smooth">Smooth</option>
                                    <option value="erratic">Erratic</option>
                                    <option value="robotic">Robotic Straight</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-500 block mb-1">Idle Behaviour</label>
                            <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                                {['normal', 'burst'].map(opt => (
                                    <button 
                                        key={opt}
                                        onClick={() => setConfig({...config, mouseIdle: opt})}
                                        className={`flex-1 py-1 text-[10px] uppercase font-bold rounded transition-colors ${config.mouseIdle === opt ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {opt === 'normal' ? 'Normal' : 'Long Idle → Burst'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-800"></div>

                    {/* Click Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-xs text-orange-300 font-bold uppercase tracking-wider">
                            <Mouse size={12}/> Click Behaviour
                        </div>
                        <div className="mb-3">
                            <label className="text-[10px] text-slate-500 block mb-1">Click Rate</label>
                            <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                                {['low', 'normal', 'high', 'very_high'].map(opt => (
                                    <button 
                                        key={opt}
                                        onClick={() => setConfig({...config, clickRate: opt})}
                                        className={`flex-1 py-1 text-[10px] uppercase font-bold rounded transition-colors ${config.clickRate === opt ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {opt.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                                <label className="text-[10px] text-slate-400 font-bold uppercase">Rage Clicks</label>
                                <input 
                                    type="checkbox" 
                                    checked={config.rageClicks}
                                    onChange={(e) => setConfig({...config, rageClicks: e.target.checked})}
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-900 accent-rose-500 cursor-pointer"
                                />
                            </div>
                            <div>
                                <select 
                                    value={config.misclicks}
                                    onChange={(e) => setConfig({...config, misclicks: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-2 outline-none focus:border-indigo-500"
                                >
                                    <option value="low">Low Misclicks</option>
                                    <option value="normal">Normal Misclicks</option>
                                    <option value="high">High Misclicks</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-800"></div>

                    {/* Typing Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-xs text-emerald-300 font-bold uppercase tracking-wider">
                            <Keyboard size={12}/> Typing Error Behaviour
                        </div>
                        <div className="mb-3">
                            <label className="text-[10px] text-slate-500 block mb-1">Error Rate (Backspaces)</label>
                            <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                                {['low', 'normal', 'high', 'very_high'].map(opt => (
                                    <button 
                                        key={opt}
                                        onClick={() => setConfig({...config, typingErrorRate: opt})}
                                        className={`flex-1 py-1 text-[10px] uppercase font-bold rounded transition-colors ${config.typingErrorRate === opt ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {opt.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                            <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-2">
                                <Lock size={12}/> Copy-Paste Sensitive Fields
                            </label>
                            <input 
                                type="checkbox" 
                                checked={config.sensitivePaste}
                                onChange={(e) => setConfig({...config, sensitivePaste: e.target.checked})}
                                className="w-4 h-4 rounded border-slate-600 bg-slate-900 accent-rose-500 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-slate-800"></div>

                    {/* Form Behaviour Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-xs text-blue-300 font-bold uppercase tracking-wider">
                            <FileText size={12}/> Form Interaction Behaviour
                        </div>
                        <div className="mb-3">
                            <label className="text-[10px] text-slate-500 block mb-1">Completion Speed</label>
                            <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                                {['very_slow', 'normal', 'fast', 'bot_fast'].map(opt => (
                                    <button 
                                        key={opt}
                                        onClick={() => setConfig({...config, formSpeed: opt})}
                                        className={`flex-1 py-1 text-[10px] uppercase font-bold rounded transition-colors ${config.formSpeed === opt ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {opt === 'bot_fast' ? 'Unreal (Bot)' : opt.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-500 block mb-1">Field Order</label>
                            <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                                {['normal', 'unusual'].map(opt => (
                                    <button 
                                        key={opt}
                                        onClick={() => setConfig({...config, formFieldOrder: opt})}
                                        className={`flex-1 py-1 text-[10px] uppercase font-bold rounded transition-colors ${config.formFieldOrder === opt ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

             {/* Time & Options */}
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm">
                    <Clock size={16} className="text-orange-400"/> Time & Options
                </h3>
                <div className="space-y-4">
                     <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Time Context</label>
                        <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1">
                            <button 
                                onClick={() => setConfig({...config, timeContext: 'business'})}
                                className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${config.timeContext === 'business' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400'}`}
                            >Business Hours</button>
                            <button 
                                onClick={() => setConfig({...config, timeContext: 'unusual'})}
                                className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${config.timeContext === 'unusual' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400'}`}
                            >Unusual Time</button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                        <label className="text-sm text-slate-300 flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={config.includeAiAnalysis}
                                onChange={(e) => setConfig({...config, includeAiAnalysis: e.target.checked})}
                                className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                            />
                            Include AI Explanation
                        </label>
                        <span className="text-[10px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">+~1200ms</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <button 
                    onClick={handleSimulate}
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    {loading ? (
                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : (
                        <>
                            <Play size={18} fill="currentColor" className="group-hover:scale-110 transition-transform"/> Generate Risk Score
                        </>
                    )}
                </button>
                
                {response && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                        <button 
                            onClick={handleSendToStream}
                            disabled={eventSent}
                            className={`w-full font-bold py-3 rounded-xl border transition-all flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed ${eventSent ? 'bg-slate-800 text-emerald-500 border-emerald-500/50' : 'bg-slate-800 hover:bg-slate-700 text-indigo-400 border-slate-700'}`}
                        >
                            {eventSent ? <CheckCircle size={18}/> : <Send size={18}/>}
                            {eventSent ? 'Sent to Stream' : 'Send to Events Stream'}
                        </button>
                        
                        {eventSent && (
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => onNavigate('EVENTS')}
                                    className="flex-1 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-sm font-bold py-3 rounded-xl border border-indigo-500/30 transition-all flex items-center justify-center gap-2"
                                >
                                    <ExternalLink size={16}/> View Event
                                </button>
                                 <button 
                                    onClick={() => onNavigate('MY_ACTIVITY')}
                                    className="flex-1 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 text-sm font-bold py-3 rounded-xl border border-purple-500/30 transition-all flex items-center justify-center gap-2"
                                >
                                    <User size={16}/> View User
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* --- COLUMN 2: CODE PREVIEW & OUTPUT --- */}
        <div className="xl:col-span-2 flex flex-col gap-6 h-full min-h-[600px]">
            
            {/* Request Preview */}
            <div className="bg-[#0f111a] border border-slate-800 rounded-2xl overflow-hidden flex flex-col flex-1 shadow-lg">
                <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                         <span className="bg-emerald-500/10 text-emerald-500 text-xs font-bold px-2 py-1 rounded border border-emerald-500/20">POST</span>
                         <span className="text-slate-400 text-sm font-mono">/v1/events/analyze</span>
                    </div>
                    <button onClick={copyRequest} className="text-slate-500 hover:text-white transition-colors flex items-center gap-1.5 text-xs">
                        {copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? 'Copied' : 'Copy JSON'}
                    </button>
                </div>
                <div className="p-4 overflow-auto custom-scrollbar flex-1 relative group">
                    <pre className="text-xs font-mono text-indigo-300 leading-relaxed">
{JSON.stringify(requestBody, null, 2)}
                    </pre>
                </div>
            </div>

            {/* Response Output */}
            <div className="bg-[#0f111a] border border-slate-800 rounded-2xl overflow-hidden flex flex-col flex-1 shadow-lg relative">
                 {/* Loading Overlay */}
                 {loading && (
                     <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                         <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                         <div className="text-indigo-400 font-mono text-sm animate-pulse">Analyzing signals...</div>
                     </div>
                 )}

                 <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                         <span className="text-slate-400 text-sm font-bold">Response Body</span>
                         {response && (
                             <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${response.risk_analysis.score > 50 ? 'text-rose-400 border-rose-900 bg-rose-950/30' : 'text-emerald-400 border-emerald-900 bg-emerald-950/30'}`}>
                                 200 OK
                             </span>
                         )}
                    </div>
                    <span className="text-xs text-slate-600">{response ? `${config.includeAiAnalysis ? '1.4s' : '82ms'}` : ''}</span>
                </div>
                
                <div className="p-4 overflow-auto custom-scrollbar flex-1">
                    {response ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                             {/* Formatted Output for readability */}
                             <div className="grid grid-cols-2 gap-4 mb-6">
                                 <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800 flex items-center gap-3">
                                     <div className={`p-2 rounded-lg ${response.risk_analysis.score > 80 ? 'bg-rose-500/20 text-rose-500' : response.risk_analysis.score > 50 ? 'bg-orange-500/20 text-orange-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                                         <Zap size={20} fill="currentColor"/>
                                     </div>
                                     <div>
                                         <div className="text-[10px] text-slate-500 uppercase font-bold">Recommended Action</div>
                                         <div className={`text-sm font-bold ${response.risk_analysis.score > 80 ? 'text-rose-400' : response.risk_analysis.score > 50 ? 'text-orange-400' : 'text-emerald-400'}`}>
                                             {response.risk_analysis.action}
                                         </div>
                                     </div>
                                 </div>
                                 <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800 flex items-center gap-3">
                                     <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
                                         <ShieldAlert size={20}/>
                                     </div>
                                     <div>
                                         <div className="text-[10px] text-slate-500 uppercase font-bold">Risk Score</div>
                                         <div className="text-sm font-bold text-white">
                                             {response.risk_analysis.score} <span className="text-slate-500 text-xs font-normal">/ 100</span>
                                         </div>
                                     </div>
                                 </div>
                             </div>

                             {/* Breakdown Preview */}
                             <div className="mb-6 space-y-2">
                                <h4 className="text-xs text-slate-500 uppercase font-bold">Score Breakdown</h4>
                                {response.details.breakdown.map((item: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center bg-slate-900/30 p-2 rounded border border-slate-800/50">
                                        <span className="text-xs text-slate-300">{item.reason}</span>
                                        <span className="text-xs font-mono text-rose-400">{item.impact}</span>
                                    </div>
                                ))}
                                {response.details.breakdown.length === 0 && (
                                    <div className="text-xs text-slate-600 italic">Baseline traffic. No risk factors detected.</div>
                                )}
                             </div>

                             <pre className="text-xs font-mono text-emerald-300 leading-relaxed border-t border-slate-800/50 pt-4">
{JSON.stringify(response, null, 2)}
                             </pre>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                            <Code size={48} className="opacity-20" />
                            <p className="text-sm">Ready to simulate.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default DeveloperPlayground;
