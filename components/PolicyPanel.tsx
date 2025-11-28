
import React, { useState, useEffect } from 'react';
import { 
    Shield, Lock, Globe, Smartphone, Save, FileText, ToggleLeft, ToggleRight, 
    Edit2, Plus, Trash2, X, AlertTriangle, CheckCircle, Zap, ArrowRight,
    MousePointer, Clock, MapPin, AlertOctagon, Mail, Bell, UserX, RefreshCw,
    BarChart3
} from 'lucide-react';
import { SecurityPolicy, PolicyCondition, PolicyAction } from '../types';
import { MOCK_POLICIES } from '../constants';

const PolicyPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'POLICIES' | 'GENERAL'>('POLICIES');
    const [policies, setPolicies] = useState<SecurityPolicy[]>(MOCK_POLICIES);
    const [editingPolicy, setEditingPolicy] = useState<SecurityPolicy | null>(null);

    // Mock Impact Simulation State
    const [impactLoading, setImpactLoading] = useState(false);
    const [impactPercent, setImpactPercent] = useState(0);

    // Calculate mock impact when conditions change
    useEffect(() => {
        if (!editingPolicy) return;
        setImpactLoading(true);
        const timer = setTimeout(() => {
            // Simple mock logic: Risk Score < 50 = high impact, > 90 = low impact
            const riskCond = editingPolicy.conditions.find(c => c.field === 'RISK_SCORE');
            let base = 5;
            if (riskCond) {
                const val = Number(riskCond.value);
                base = Math.max(1, 100 - val); 
            } else if (editingPolicy.conditions.length === 0) {
                base = 100;
            } else {
                base = 15; // Specific conditions usually have lower impact
            }
            setImpactPercent(base);
            setImpactLoading(false);
        }, 600);
        return () => clearTimeout(timer);
    }, [editingPolicy?.conditions]);

    const togglePolicy = (id: string) => {
        setPolicies(prev => prev.map(p => 
            p.id === id ? { ...p, isEnabled: !p.isEnabled } : p
        ));
    };

    const handleSavePolicy = () => {
        if (!editingPolicy) return;
        
        setPolicies(prev => {
            const exists = prev.find(p => p.id === editingPolicy.id);
            if (exists) {
                return prev.map(p => p.id === editingPolicy.id ? editingPolicy : p);
            } else {
                return [editingPolicy, ...prev];
            }
        });
        setEditingPolicy(null);
    };

    const handleDeletePolicy = (id: string) => {
        setPolicies(prev => prev.filter(p => p.id !== id));
        setEditingPolicy(null);
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
            case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default: return 'bg-slate-800 text-slate-400 border-slate-700';
        }
    };

    // --- LOGIC BUILDER HELPERS ---

    const handleAddCondition = (field: PolicyCondition['field']) => {
        if (!editingPolicy) return;
        
        let newCondition: PolicyCondition = { field, operator: 'EQUALS', value: '' };
        
        // Set defaults based on field type
        if (field === 'RISK_SCORE') {
            newCondition = { field: 'RISK_SCORE', operator: 'GT', value: 70 };
        } else if (field === 'BEHAVIOR') {
            newCondition = { field: 'BEHAVIOR', operator: 'CONTAINS', value: 'Impossible Travel' };
        } else if (field === 'DEVICE') {
            newCondition = { field: 'DEVICE', operator: 'EQUALS', value: 'New Device' };
        } else if (field === 'LOCATION') {
            newCondition = { field: 'LOCATION', operator: 'EQUALS', value: 'New Country' };
        }

        setEditingPolicy({
            ...editingPolicy,
            conditions: [...editingPolicy.conditions, newCondition]
        });
    };

    const handleRemoveCondition = (index: number) => {
        if (!editingPolicy) return;
        const newConditions = [...editingPolicy.conditions];
        newConditions.splice(index, 1);
        setEditingPolicy({ ...editingPolicy, conditions: newConditions });
    };

    const handleUpdateCondition = (index: number, key: keyof PolicyCondition, value: any) => {
        if (!editingPolicy) return;
        const newConditions = [...editingPolicy.conditions];
        newConditions[index] = { ...newConditions[index], [key]: value };
        setEditingPolicy({ ...editingPolicy, conditions: newConditions });
    };

    const toggleAction = (type: PolicyAction['type']) => {
        if (!editingPolicy) return;
        const exists = editingPolicy.actions.find(a => a.type === type);
        let newActions = [...editingPolicy.actions];
        
        if (exists) {
            newActions = newActions.filter(a => a.type !== type);
        } else {
            newActions.push({ type });
        }
        setEditingPolicy({ ...editingPolicy, actions: newActions });
    };

    // --- RENDERERS ---

    const renderConditionInput = (cond: PolicyCondition, idx: number) => {
        const commonClasses = "bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white outline-none focus:border-indigo-500";
        
        switch (cond.field) {
            case 'RISK_SCORE':
                return (
                    <div className="flex-1 flex items-center gap-4">
                        <span className="text-sm font-mono text-indigo-400 whitespace-nowrap">Score &ge; {cond.value}</span>
                        <input 
                            type="range" 
                            min="0" max="100" 
                            value={cond.value} 
                            onChange={(e) => handleUpdateCondition(idx, 'value', parseInt(e.target.value))}
                            className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                    </div>
                );
            case 'DEVICE':
                return (
                    <select 
                        value={cond.value} 
                        onChange={(e) => handleUpdateCondition(idx, 'value', e.target.value)}
                        className={`flex-1 ${commonClasses}`}
                    >
                        <option value="New Device">Is New Device</option>
                        <option value="Mobile Device">Is Mobile Device</option>
                        <option value="Unknown OS">Unknown OS</option>
                        <option value="Emulator">Emulator Detected</option>
                    </select>
                );
             case 'LOCATION':
                return (
                    <select 
                        value={cond.value} 
                        onChange={(e) => handleUpdateCondition(idx, 'value', e.target.value)}
                        className={`flex-1 ${commonClasses}`}
                    >
                        <option value="New Country">New Country (Never seen)</option>
                        <option value="Blacklisted Region">Blacklisted Region</option>
                        <option value="Radius">Outside Usual Radius</option>
                    </select>
                );
            case 'BEHAVIOR':
                return (
                     <select 
                        value={cond.value} 
                        onChange={(e) => handleUpdateCondition(idx, 'value', e.target.value)}
                        className={`flex-1 ${commonClasses}`}
                    >
                        <option value="Impossible Travel">Impossible Travel (Velocity)</option>
                        <option value="Bot Behavior">Bot Behavior (Typing/Mouse)</option>
                        <option value="Tor Network">Tor Network Detected</option>
                        <option value="High Velocity">High Velocity (Geo)</option>
                    </select>
                );
             case 'TIME':
                return (
                     <select 
                        value={cond.value} 
                        onChange={(e) => handleUpdateCondition(idx, 'value', e.target.value)}
                        className={`flex-1 ${commonClasses}`}
                    >
                        <option value="Outside Business Hours">Outside Business Hours</option>
                        <option value="Weekend">Weekend Login</option>
                        <option value="Anomaly">Time Anomaly (vs User Baseline)</option>
                    </select>
                );
            default:
                return (
                    <input 
                        type="text" 
                        value={cond.value} 
                        onChange={(e) => handleUpdateCondition(idx, 'value', e.target.value)}
                        className={`flex-1 ${commonClasses}`}
                    />
                );
        }
    };

    const getConditionIcon = (field: string) => {
        switch(field) {
            case 'RISK_SCORE': return <Shield size={14} className="text-rose-400" />;
            case 'DEVICE': return <Smartphone size={14} className="text-blue-400" />;
            case 'LOCATION': return <Globe size={14} className="text-emerald-400" />;
            case 'TIME': return <Clock size={14} className="text-orange-400" />;
            case 'BEHAVIOR': return <MousePointer size={14} className="text-purple-400" />;
            default: return <AlertTriangle size={14} />;
        }
    };

    return (
        <div className="relative h-full flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="p-8 pb-0">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Shield className="text-indigo-500" /> Policies & Rules
                        </h1>
                        <p className="text-slate-400 text-sm">Configure automated response logic and risk thresholds.</p>
                    </div>
                    <button 
                        onClick={() => setEditingPolicy({
                            id: `new_${Date.now()}`,
                            name: 'New Security Policy',
                            description: '',
                            isEnabled: true,
                            severity: 'MEDIUM',
                            conditions: [],
                            actions: []
                        })}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20"
                    >
                        <Plus size={16} /> Create Policy
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 border-b border-slate-800 mb-6">
                    <button 
                        onClick={() => setActiveTab('POLICIES')}
                        className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'POLICIES' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                    >
                        Active Policies
                    </button>
                    <button 
                        onClick={() => setActiveTab('GENERAL')}
                        className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'GENERAL' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                    >
                        Global Thresholds
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8 scrollbar-hide">
                {activeTab === 'POLICIES' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {policies.map((policy) => (
                            <div key={policy.id} className={`bg-slate-900 border ${policy.isEnabled ? 'border-slate-800' : 'border-slate-800/50 opacity-70'} rounded-2xl p-6 flex flex-col group hover:border-slate-700 transition-all shadow-lg`}>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getSeverityColor(policy.severity)}`}>
                                        {policy.severity}
                                    </span>
                                    <button 
                                        onClick={() => togglePolicy(policy.id)}
                                        className={`transition-colors ${policy.isEnabled ? 'text-emerald-500 hover:text-emerald-400' : 'text-slate-600 hover:text-slate-500'}`}
                                    >
                                        {policy.isEnabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                    </button>
                                </div>
                                
                                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                    {policy.name}
                                </h3>
                                <p className="text-slate-400 text-sm mb-6 line-clamp-2 min-h-[40px]">
                                    {policy.description || 'No description provided.'}
                                </p>

                                <div className="space-y-4 mb-6 flex-1">
                                    <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800/50">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-1">
                                            IF Conditions Met <ArrowRight size={10} className="text-slate-600"/>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {policy.conditions.map((cond, i) => (
                                                <span key={i} className="text-xs bg-slate-900 text-slate-300 px-2 py-1 rounded border border-slate-700 flex items-center gap-1">
                                                    {getConditionIcon(cond.field)} 
                                                    {cond.field === 'RISK_SCORE' ? `Risk > ${cond.value}` : cond.value}
                                                </span>
                                            ))}
                                            {policy.conditions.length === 0 && <span className="text-xs text-slate-600 italic">All traffic</span>}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800/50">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-1">
                                            THEN Take Action <Zap size={10} className="text-yellow-600"/>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {policy.actions.map((act, i) => (
                                                <span key={i} className={`text-xs px-2 py-1 rounded font-medium border ${
                                                    act.type === 'BLOCK' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                                    act.type === 'MFA' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                    'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                                }`}>
                                                    {act.type.replace('_', ' ')}
                                                </span>
                                            ))}
                                            {policy.actions.length === 0 && <span className="text-xs text-slate-600 italic">Log only</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                    <span className="text-xs text-slate-500">
                                        Last trigger: {policy.lastTriggered || 'Never'}
                                    </span>
                                    <button 
                                        onClick={() => setEditingPolicy(policy)}
                                        className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors flex items-center gap-2"
                                    >
                                        <Edit2 size={12} /> Edit Rules
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
                         {/* Existing Sliders Logic */}
                         <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500"><Shield size={20}/></div>
                                <h3 className="text-white font-bold">Automated Response Thresholds</h3>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-300">Block Session (Critical Risk)</span>
                                        <span className="text-rose-400 font-mono">Risk &gt; 85</span>
                                    </div>
                                    <input type="range" className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500" defaultValue="85" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-300">MFA Challenge (High Risk)</span>
                                        <span className="text-orange-400 font-mono">Risk &gt; 60</span>
                                    </div>
                                    <input type="range" className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500" defaultValue="60" />
                                </div>
                            </div>
                        </div>

                        {/* Signals Configuration */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500"><Lock size={20}/></div>
                                <h3 className="text-white font-bold">Behavioral Signals</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <Globe className="text-slate-400" size={18} />
                                        <div>
                                            <div className="text-slate-200 text-sm font-medium">Impossible Travel</div>
                                            <div className="text-slate-500 text-xs">Flag simultaneous logins from distant geos</div>
                                        </div>
                                    </div>
                                    <input type="checkbox" defaultChecked className="toggle-checkbox accent-indigo-500 w-5 h-5 cursor-pointer" />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <Smartphone className="text-slate-400" size={18} />
                                        <div>
                                            <div className="text-slate-200 text-sm font-medium">Bot Detection</div>
                                            <div className="text-slate-500 text-xs">Analyze typing cadence and mouse velocity</div>
                                        </div>
                                    </div>
                                    <input type="checkbox" defaultChecked className="toggle-checkbox accent-indigo-500 w-5 h-5 cursor-pointer" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Policy Editor Drawer */}
            {editingPolicy && (
                <div className="absolute inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setEditingPolicy(null)}></div>
                    <div className="relative w-full max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
                        
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-slate-800 bg-slate-950 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
                                    <FileText className="text-indigo-500" size={24} /> 
                                    {editingPolicy.id.startsWith('new') ? 'Create Policy Rule' : 'Edit Policy Rule'}
                                </h2>
                                <p className="text-slate-400 text-sm">Define logic statements to automate security responses.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1 border border-slate-800">
                                    <span className={`text-xs font-bold px-2 py-1 rounded transition-colors ${editingPolicy.isEnabled ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-500'}`}>
                                        {editingPolicy.isEnabled ? 'ON' : 'OFF'}
                                    </span>
                                    <button 
                                        onClick={() => setEditingPolicy({...editingPolicy, isEnabled: !editingPolicy.isEnabled})}
                                        className={`transition-colors ${editingPolicy.isEnabled ? 'text-emerald-500 hover:text-emerald-400' : 'text-slate-600 hover:text-slate-500'}`}
                                    >
                                        {editingPolicy.isEnabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                    </button>
                                </div>
                                <button onClick={() => setEditingPolicy(null)} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                            
                            {/* 1. Basic Info */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Policy Name</label>
                                    <input 
                                        type="text" 
                                        defaultValue={editingPolicy.name}
                                        onChange={(e) => setEditingPolicy({...editingPolicy, name: e.target.value})}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white text-sm focus:border-indigo-500 outline-none transition-colors"
                                        placeholder="e.g. Block High Risk from China"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
                                    <textarea 
                                        defaultValue={editingPolicy.description}
                                        onChange={(e) => setEditingPolicy({...editingPolicy, description: e.target.value})}
                                        rows={2}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-300 text-sm focus:border-indigo-500 outline-none resize-none transition-colors"
                                        placeholder="Describe what this policy does..."
                                    />
                                </div>
                                <div>
                                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Severity Level</label>
                                     <div className="grid grid-cols-4 gap-3">
                                        {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(sev => (
                                            <button 
                                                key={sev}
                                                onClick={() => setEditingPolicy({...editingPolicy, severity: sev as any})}
                                                className={`text-xs font-bold py-2 rounded-lg border transition-all ${
                                                    editingPolicy.severity === sev 
                                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                                                }`}
                                            >
                                                {sev}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-800" />

                            {/* 2. IF Section (Conditions) */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs">IF</span> 
                                        Conditions are met...
                                    </h3>
                                    
                                    <div className="relative group">
                                         <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 transition-colors">
                                            <Plus size={14} /> Add Condition
                                        </button>
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden hidden group-hover:block z-50">
                                            <button onClick={() => handleAddCondition('RISK_SCORE')} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"><Shield size={14}/> Risk Score</button>
                                            <button onClick={() => handleAddCondition('LOCATION')} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"><Globe size={14}/> Location</button>
                                            <button onClick={() => handleAddCondition('DEVICE')} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"><Smartphone size={14}/> Device</button>
                                            <button onClick={() => handleAddCondition('BEHAVIOR')} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"><MousePointer size={14}/> Behavior</button>
                                            <button onClick={() => handleAddCondition('TIME')} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"><Clock size={14}/> Time</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 bg-slate-900/50 rounded-xl p-1">
                                    {editingPolicy.conditions.map((cond, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 animate-in fade-in slide-in-from-left-4 duration-300">
                                            <div className="p-2 bg-slate-900 rounded-lg text-slate-400 border border-slate-800">
                                                {getConditionIcon(cond.field)}
                                            </div>
                                            
                                            <div className="flex-1 flex items-center gap-3">
                                                <div className="text-xs font-bold text-slate-500 uppercase w-20 flex-shrink-0">{cond.field.replace('_', ' ')}</div>
                                                <div className="text-xs font-mono text-slate-600">IS</div>
                                                {renderConditionInput(cond, i)}
                                            </div>

                                            <button 
                                                onClick={() => handleRemoveCondition(i)}
                                                className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    ))}
                                    {editingPolicy.conditions.length === 0 && (
                                        <div className="text-sm text-slate-500 italic text-center py-8 border-2 border-dashed border-slate-800 rounded-xl">
                                            No conditions defined. Rule applies to ALL events.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Impact Preview */}
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center gap-4 relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                                <div className="p-2 bg-slate-900 rounded-lg">
                                    <BarChart3 className="text-indigo-400" size={20} />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-500 uppercase mb-0.5">Estimated Impact</div>
                                    {impactLoading ? (
                                        <div className="h-4 w-32 bg-slate-800 rounded animate-pulse"></div>
                                    ) : (
                                        <div className="text-sm text-slate-300">
                                            This policy will affect approx. <span className="text-white font-bold">{impactPercent}%</span> of events.
                                        </div>
                                    )}
                                    <div className="text-[10px] text-slate-500 mt-1">Based on traffic analysis from last 24h.</div>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <ArrowRight size={24} className="text-slate-700 rotate-90" />
                            </div>

                            {/* 3. THEN Section (Actions) */}
                            <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                                    <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-xs">THEN</span> 
                                    Execute these actions...
                                </h3>
                                
                                <div className="grid grid-cols-2 gap-4">
                                     <button 
                                        onClick={() => toggleAction('BLOCK')}
                                        className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                                            editingPolicy.actions.find(a => a.type === 'BLOCK') 
                                            ? 'bg-rose-500/10 border-rose-500 text-white' 
                                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                     >
                                        <div className={`p-2 rounded-lg ${editingPolicy.actions.find(a => a.type === 'BLOCK') ? 'bg-rose-500 text-white' : 'bg-slate-900 text-slate-500'}`}>
                                            <AlertOctagon size={20}/>
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">Block Login</div>
                                            <div className="text-xs opacity-70 mt-1">Prevent access immediately</div>
                                        </div>
                                     </button>

                                     <button 
                                        onClick={() => toggleAction('MFA')}
                                        className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                                            editingPolicy.actions.find(a => a.type === 'MFA') 
                                            ? 'bg-orange-500/10 border-orange-500 text-white' 
                                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                     >
                                        <div className={`p-2 rounded-lg ${editingPolicy.actions.find(a => a.type === 'MFA') ? 'bg-orange-500 text-white' : 'bg-slate-900 text-slate-500'}`}>
                                            <Smartphone size={20}/>
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">Require MFA</div>
                                            <div className="text-xs opacity-70 mt-1">Step-up authentication</div>
                                        </div>
                                     </button>

                                     <button 
                                        onClick={() => toggleAction('LOCK_ACCOUNT')}
                                        className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                                            editingPolicy.actions.find(a => a.type === 'LOCK_ACCOUNT') 
                                            ? 'bg-purple-500/10 border-purple-500 text-white' 
                                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                     >
                                        <div className={`p-2 rounded-lg ${editingPolicy.actions.find(a => a.type === 'LOCK_ACCOUNT') ? 'bg-purple-500 text-white' : 'bg-slate-900 text-slate-500'}`}>
                                            <UserX size={20}/>
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">Lock Account</div>
                                            <div className="text-xs opacity-70 mt-1">Disable user access</div>
                                        </div>
                                     </button>

                                     <button 
                                        onClick={() => toggleAction('FORCE_REAUTH')}
                                        className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                                            editingPolicy.actions.find(a => a.type === 'FORCE_REAUTH') 
                                            ? 'bg-blue-500/10 border-blue-500 text-white' 
                                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                     >
                                        <div className={`p-2 rounded-lg ${editingPolicy.actions.find(a => a.type === 'FORCE_REAUTH') ? 'bg-blue-500 text-white' : 'bg-slate-900 text-slate-500'}`}>
                                            <RefreshCw size={20}/>
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">Force Re-auth</div>
                                            <div className="text-xs opacity-70 mt-1">Require login again</div>
                                        </div>
                                     </button>

                                     <button 
                                        onClick={() => toggleAction('NOTIFY_ADMIN')}
                                        className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                                            editingPolicy.actions.find(a => a.type === 'NOTIFY_ADMIN') 
                                            ? 'bg-indigo-500/10 border-indigo-500 text-white' 
                                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                     >
                                        <div className={`p-2 rounded-lg ${editingPolicy.actions.find(a => a.type === 'NOTIFY_ADMIN') ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-slate-500'}`}>
                                            <Bell size={20}/>
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">Alert Security</div>
                                            <div className="text-xs opacity-70 mt-1">Send SOC notification</div>
                                        </div>
                                     </button>

                                     <button 
                                        onClick={() => toggleAction('NOTIFY_USER')}
                                        className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                                            editingPolicy.actions.find(a => a.type === 'NOTIFY_USER') 
                                            ? 'bg-indigo-500/10 border-indigo-500 text-white' 
                                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                     >
                                        <div className={`p-2 rounded-lg ${editingPolicy.actions.find(a => a.type === 'NOTIFY_USER') ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-slate-500'}`}>
                                            <Mail size={20}/>
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">Notify User</div>
                                            <div className="text-xs opacity-70 mt-1">Email warning to user</div>
                                        </div>
                                     </button>
                                </div>
                            </div>
                        </div>

                        {/* Drawer Actions */}
                        <div className="p-6 border-t border-slate-800 bg-slate-950 flex justify-between gap-4">
                             {!editingPolicy.id.startsWith('new') && (
                                <button 
                                    onClick={() => handleDeletePolicy(editingPolicy.id)}
                                    className="px-4 py-2.5 text-rose-500 hover:text-white hover:bg-rose-500/20 border border-transparent hover:border-rose-500/30 rounded-xl transition-colors font-medium text-sm flex items-center gap-2"
                                >
                                    <Trash2 size={16}/> Delete
                                </button>
                             )}
                             <div className="flex gap-4 ml-auto">
                                <button 
                                    onClick={() => setEditingPolicy(null)}
                                    className="px-5 py-2.5 text-sm text-slate-400 hover:text-white transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSavePolicy}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                                >
                                    <Save size={18} /> Save & Activate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PolicyPanel;
