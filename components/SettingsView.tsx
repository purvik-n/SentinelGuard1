
import React, { useState } from 'react';
import { 
    Bell, Key, Shield, Webhook, Mail, Smartphone, Save, Code, 
    Copy, Check, Plus, Trash2, Globe, Server, Terminal, Lock, X,
    Database, EyeOff, Hash, FileText, SlidersHorizontal, Image
} from 'lucide-react';
import { WebhookConfig } from '../types';

const SettingsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'GENERAL' | 'DATA_PRIVACY' | 'SDK' | 'WEBHOOKS'>('GENERAL');
    
    // SDK State
    const [copiedKey, setCopiedKey] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

    // General Settings State
    const [brandName, setBrandName] = useState('SentinelGuard');
    const [logoUrl, setLogoUrl] = useState('https://sentinelguard.io/logo.png');
    const [timezone, setTimezone] = useState('UTC');
    const [thresholds, setThresholds] = useState({ medium: 30, high: 70, critical: 90 });

    // Data & Privacy State
    const [retention, setRetention] = useState('90');
    const [coarseGeo, setCoarseGeo] = useState(false);
    const [hashIPs, setHashIPs] = useState(false);

    // Webhooks State
    const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
        { id: 'wh_1', name: 'Splunk HEC Ingest', url: 'https://splunk.corp.net/services/collector', events: ['ALL'], status: 'ACTIVE', secret: '****', lastTriggered: '2 mins ago' },
        { id: 'wh_2', name: 'Slack Security Channel', url: 'https://hooks.slack.com/services/T000/B000/XXXX', events: ['CRITICAL'], status: 'PAUSED', secret: '****', lastTriggered: '3 days ago' }
    ]);
    const [showAddWebhook, setShowAddWebhook] = useState(false);
    const [newWebhook, setNewWebhook] = useState<Partial<WebhookConfig>>({
        name: '', url: '', events: ['HIGH'], status: 'ACTIVE'
    });

    // Helper functions
    const copyToClipboard = (text: string, type: 'KEY' | 'CODE' | 'URL') => {
        // navigator.clipboard.writeText(text); // In a real app
        if (type === 'KEY') {
            setCopiedKey(true);
            setTimeout(() => setCopiedKey(false), 2000);
        } else if (type === 'URL') {
            setCopiedUrl(true);
            setTimeout(() => setCopiedUrl(false), 2000);
        } else {
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        }
    };

    const handleAddWebhook = () => {
        if (newWebhook.name && newWebhook.url) {
            setWebhooks([...webhooks, { 
                id: `wh_${Date.now()}`, 
                name: newWebhook.name!, 
                url: newWebhook.url!, 
                events: newWebhook.events as any, 
                status: 'ACTIVE',
                secret: 'sk_wh_...'
            }]);
            setShowAddWebhook(false);
            setNewWebhook({ name: '', url: '', events: ['HIGH'], status: 'ACTIVE' });
        }
    };

    const deleteWebhook = (id: string) => {
        setWebhooks(prev => prev.filter(w => w.id !== id));
    };

    const toggleWebhookStatus = (id: string) => {
        setWebhooks(prev => prev.map(w => 
            w.id === id ? { ...w, status: w.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : w
        ));
    };

    return (
        <div className="p-8 h-full flex flex-col animate-in fade-in duration-500 overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                    <p className="text-slate-400 text-sm">System configuration and integrations.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20">
                    <Save size={16}/> Save Changes
                </button>
            </div>

            {/* Navigation Tabs - Pill Style */}
            <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 mb-8 inline-flex flex-wrap gap-1 sticky top-0 z-10 shadow-lg">
                <button 
                    onClick={() => setActiveTab('GENERAL')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'GENERAL' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                    <SlidersHorizontal size={16}/> General
                </button>
                <button 
                    onClick={() => setActiveTab('DATA_PRIVACY')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'DATA_PRIVACY' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                    <Database size={16}/> Data & Privacy
                </button>
                <button 
                    onClick={() => setActiveTab('SDK')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'SDK' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                    <Code size={16}/> SDK & Integration
                </button>
                <button 
                    onClick={() => setActiveTab('WEBHOOKS')}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'WEBHOOKS' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                    <Webhook size={16}/> SIEM & Webhooks
                </button>
            </div>

            <div className="max-w-4xl">
                
                {/* --- GENERAL TAB --- */}
                {activeTab === 'GENERAL' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-2 fade-in duration-300">
                        {/* Brand & Localization */}
                        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                                <Globe className="text-indigo-500" size={20}/> General Settings
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Brand Name</label>
                                    <input 
                                        type="text" 
                                        value={brandName}
                                        onChange={(e) => setBrandName(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-indigo-500 outline-none"
                                        placeholder="e.g. SentinelGuard"
                                    />
                                </div>
                                <div>
                                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Logo URL</label>
                                     <div className="flex gap-2">
                                         <input 
                                             type="text" 
                                             value={logoUrl}
                                             onChange={(e) => setLogoUrl(e.target.value)}
                                             placeholder="https://..."
                                             className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-indigo-500 outline-none"
                                         />
                                         <div className="w-10 h-10 flex-shrink-0 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden">
                                             <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center text-white font-bold text-xs">SG</div>
                                         </div>
                                     </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">System Timezone</label>
                                    <select 
                                        value={timezone}
                                        onChange={(e) => setTimezone(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-indigo-500 outline-none"
                                    >
                                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                                        <option value="EST">EST (Eastern Standard Time)</option>
                                        <option value="PST">PST (Pacific Standard Time)</option>
                                        <option value="IST">IST (Indian Standard Time)</option>
                                    </select>
                                    <p className="text-[10px] text-slate-500 mt-2">All timestamps in dashboards and reports will be displayed in this timezone.</p>
                                </div>
                            </div>
                        </section>

                        {/* Risk Thresholds */}
                        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                             <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                <Shield className="text-emerald-500" size={20}/> Default Risk Thresholds
                            </h3>
                            <p className="text-slate-400 text-xs mb-8">Define the baseline score boundaries for risk categorization (0-100).</p>

                            <div className="space-y-8 px-2">
                                {/* Medium Slider */}
                                <div className="relative">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-bold text-yellow-500">Medium Risk Start</span>
                                        <span className="font-mono text-slate-300">{thresholds.medium}</span>
                                    </div>
                                    <input 
                                        type="range" min="1" max="50" 
                                        value={thresholds.medium}
                                        onChange={(e) => setThresholds({...thresholds, medium: parseInt(e.target.value)})}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                                    />
                                    <div className="text-xs text-slate-500 mt-1">Scores below {thresholds.medium} are categorized as LOW.</div>
                                </div>

                                {/* High Slider */}
                                <div className="relative">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-bold text-orange-500">High Risk Start</span>
                                        <span className="font-mono text-slate-300">{thresholds.high}</span>
                                    </div>
                                    <input 
                                        type="range" min="51" max="85" 
                                        value={thresholds.high}
                                        onChange={(e) => setThresholds({...thresholds, high: parseInt(e.target.value)})}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                    />
                                    <div className="text-xs text-slate-500 mt-1">Scores between {thresholds.medium} and {thresholds.high} are MEDIUM.</div>
                                </div>

                                {/* Critical Slider */}
                                <div className="relative">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-bold text-rose-500">Critical Risk Start</span>
                                        <span className="font-mono text-slate-300">{thresholds.critical}</span>
                                    </div>
                                    <input 
                                        type="range" min="86" max="99" 
                                        value={thresholds.critical}
                                        onChange={(e) => setThresholds({...thresholds, critical: parseInt(e.target.value)})}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                    />
                                    <div className="text-xs text-slate-500 mt-1">Scores above {thresholds.critical} are CRITICAL and may trigger auto-blocking.</div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* --- DATA & PRIVACY TAB --- */}
                {activeTab === 'DATA_PRIVACY' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-2 fade-in duration-300">
                         <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl flex items-start gap-3">
                            <Lock className="text-indigo-400 mt-0.5" size={20} />
                            <div>
                                <h4 className="text-indigo-400 font-bold text-sm">Privacy by Design</h4>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                    SentinelGuard is designed to protect user privacy while ensuring security. 
                                    Configure data minimization settings below to comply with GDPR, CCPA, and other local regulations.
                                </p>
                            </div>
                        </div>

                        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                                <Database className="text-slate-400" size={20}/> Data Retention
                            </h3>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Event Log Retention Period</label>
                                <div className="relative">
                                    <select 
                                        value={retention}
                                        onChange={(e) => setRetention(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white text-sm focus:border-indigo-500 outline-none appearance-none"
                                    >
                                        <option value="30">30 Days (Minimum)</option>
                                        <option value="90">90 Days (Standard)</option>
                                        <option value="365">365 Days (Compliance)</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        <Database size={14}/>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    Raw event logs older than this period will be permanently deleted. 
                                    Aggregated analytics metadata may be kept for up to 1 year.
                                </p>
                            </div>
                        </section>

                        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                                <EyeOff className="text-slate-400" size={20}/> Anonymization
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <Globe className="text-slate-400" size={18} />
                                        <div>
                                            <div className="text-slate-200 text-sm font-medium">Store Coarse Location Only</div>
                                            <div className="text-slate-500 text-xs">Truncate GPS/IP coordinates to city level (removes precise lat/long).</div>
                                        </div>
                                    </div>
                                    <div 
                                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${coarseGeo ? 'bg-indigo-600' : 'bg-slate-800'}`}
                                        onClick={() => setCoarseGeo(!coarseGeo)}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${coarseGeo ? 'translate-x-6' : ''}`}></div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <Hash className="text-slate-400" size={18} />
                                        <div>
                                            <div className="text-slate-200 text-sm font-medium">Hash User IP Addresses</div>
                                            <div className="text-slate-500 text-xs">Store SHA-256 hashes of IPs instead of raw values in database.</div>
                                        </div>
                                    </div>
                                    <div 
                                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${hashIPs ? 'bg-indigo-600' : 'bg-slate-800'}`}
                                        onClick={() => setHashIPs(!hashIPs)}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${hashIPs ? 'translate-x-6' : ''}`}></div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        
                        <div className="flex justify-end pt-4">
                            <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-indigo-600/20">
                                <Save size={18}/> Save Settings
                            </button>
                        </div>
                    </div>
                )}

                {/* --- SDK TAB --- */}
                {activeTab === 'SDK' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-2 fade-in duration-300">
                        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                             <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Terminal size={20}/></div>
                                    <div>
                                        <h3 className="text-white font-bold">Client-Side Integration</h3>
                                        <p className="text-xs text-slate-400">Add this snippet to your application's header to enable biometric tracking.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative bg-[#0f111a] border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
                                <div className="flex justify-between items-center px-4 py-2 border-b border-slate-800 bg-slate-950">
                                    <span className="text-slate-500">index.js</span>
                                    <button 
                                        onClick={() => copyToClipboard('', 'CODE')}
                                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        {copiedCode ? <Check size={14} className="text-emerald-500"/> : <Copy size={14}/>}
                                        {copiedCode ? 'Copied!' : 'Copy Sample Code'}
                                    </button>
                                </div>
                                <div className="p-4 text-slate-300 overflow-x-auto">
                                    <span className="text-purple-400">import</span> <span className="text-yellow-200">{`{ SentinelGuard }`}</span> <span className="text-purple-400">from</span> <span className="text-emerald-300">'@sentinel/sdk'</span>;{'\n\n'}
                                    <span className="text-slate-500">// Initialize with your Public API Key</span>{'\n'}
                                    <span className="text-blue-400">SentinelGuard</span>.<span className="text-yellow-200">init</span>({'{'}{'\n'}
                                    {'  '}apiKey: <span className="text-emerald-300">'pk_live_51MszT2Kj3sd91Kj'</span>,{'\n'}
                                    {'  '}endpoint: <span className="text-emerald-300">'https://api.sentinelguard.io/v1'</span>,{'\n'}
                                    {'  '}options: {'{'}{'\n'}
                                    {'    '}enableBiometrics: <span className="text-orange-400">true</span>,{'\n'}
                                    {'    '}enableGeoTracking: <span className="text-orange-400">true</span>{'\n'}
                                    {'  '}{'}'}{'\n'}
                                    {'}'});{'\n\n'}
                                    <span className="text-slate-500">// Track Login Event</span>{'\n'}
                                    <span className="text-purple-400">await</span> <span className="text-blue-400">SentinelGuard</span>.<span className="text-yellow-200">trackLoginEvent</span>({'{'}{'\n'}
                                    {'  '}userId: <span className="text-emerald-300">'user_123'</span>,{'\n'}
                                    {'  '}email: <span className="text-emerald-300">'user@example.com'</span>{'\n'}
                                    {'}'});
                                </div>
                            </div>
                        </section>

                        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Key size={20}/></div>
                                <h3 className="text-white font-bold">API Configuration</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Public API Key</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-300 font-mono text-sm flex items-center justify-between">
                                            <span>pk_live_51MszT2Kj3sd91Kj8x92m...</span>
                                            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Active</span>
                                        </div>
                                        <button 
                                            onClick={() => copyToClipboard('pk_live_51MszT2Kj3sd91Kj', 'KEY')}
                                            title="Copy API Key"
                                            className="px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors flex items-center gap-2"
                                        >
                                            {copiedKey ? <Check size={16} className="text-emerald-500"/> : <Copy size={16}/>}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">Use this key in your client-side code. It is safe to expose in browsers.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Endpoint URL</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-300 font-mono text-sm flex items-center justify-between">
                                            <span>https://api.sentinelguard.io/v1</span>
                                            <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">REST</span>
                                        </div>
                                        <button 
                                            onClick={() => copyToClipboard('https://api.sentinelguard.io/v1', 'URL')}
                                            title="Copy Endpoint URL"
                                            className="px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors flex items-center gap-2"
                                        >
                                            {copiedUrl ? <Check size={16} className="text-emerald-500"/> : <Copy size={16}/>}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">The base URL for all API requests.</p>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* --- WEBHOOKS TAB --- */}
                {activeTab === 'WEBHOOKS' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-2 fade-in duration-300">
                        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Webhook size={20}/></div>
                                    <div>
                                        <h3 className="text-white font-bold">SIEM & Webhooks</h3>
                                        <p className="text-xs text-slate-400">Forward security events to external systems like Splunk, Datadog, or Slack.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowAddWebhook(!showAddWebhook)}
                                    className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg border border-slate-700 transition-colors"
                                >
                                    {showAddWebhook ? <X size={16}/> : <Plus size={16}/>}
                                    Add Webhook
                                </button>
                            </div>

                            {/* Add Webhook Form */}
                            {showAddWebhook && (
                                <div className="mb-6 bg-slate-950 rounded-xl p-5 border border-slate-800 animate-in fade-in slide-in-from-top-2">
                                    <h4 className="text-sm font-bold text-white mb-4">Configure New Endpoint</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Friendly Name</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" 
                                                placeholder="e.g. Splunk Production"
                                                value={newWebhook.name}
                                                onChange={e => setNewWebhook({...newWebhook, name: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Endpoint URL</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" 
                                                placeholder="https://..."
                                                value={newWebhook.url}
                                                onChange={e => setNewWebhook({...newWebhook, url: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Secret (Optional)</label>
                                            <input 
                                                type="password" 
                                                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" 
                                                placeholder="Signing secret"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Trigger Events (Filter)</label>
                                            <select 
                                                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                                value={newWebhook.events?.[0]}
                                                onChange={e => setNewWebhook({...newWebhook, events: [e.target.value as any]})}
                                            >
                                                <option value="ALL">Send All Events</option>
                                                <option value="HIGH">Send High Risk & Critical Only</option>
                                                <option value="CRITICAL">Send Critical Risk Only</option>
                                            </select>
                                            <p className="text-[10px] text-slate-500 mt-1">Select "Send High Risk & Critical Only" to enable strict filtering.</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setShowAddWebhook(false)} className="px-3 py-2 text-slate-400 hover:text-white text-sm">Cancel</button>
                                        <button onClick={handleAddWebhook} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg">Add Endpoint</button>
                                    </div>
                                </div>
                            )}

                            {/* Webhooks List */}
                            <div className="space-y-3">
                                {webhooks.map(wh => (
                                    <div key={wh.id} className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${wh.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                                                <Server size={18}/>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-medium text-sm ${wh.status === 'ACTIVE' ? 'text-white' : 'text-slate-500'}`}>{wh.name}</span>
                                                    {wh.status === 'ACTIVE' && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 font-mono">
                                                    <span className="truncate max-w-[200px]">{wh.url}</span>
                                                    <span>•</span>
                                                    <span className={`font-bold ${wh.events[0] === 'ALL' ? 'text-slate-400' : 'text-orange-400'}`}>
                                                        {wh.events[0] === 'ALL' ? 'All Events' : wh.events[0] === 'HIGH' ? 'High+' : 'Critical Only'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] text-slate-600 font-mono hidden md:inline">Last: {wh.lastTriggered}</span>
                                            <div className="h-4 w-px bg-slate-800 mx-2"></div>
                                            <button 
                                                onClick={() => toggleWebhookStatus(wh.id)}
                                                className={`text-xs font-bold px-3 py-1.5 rounded transition-colors ${
                                                    wh.status === 'ACTIVE' 
                                                    ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' 
                                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                                }`}
                                            >
                                                {wh.status === 'ACTIVE' ? 'Active' : 'Paused'}
                                            </button>
                                            <button 
                                                onClick={() => deleteWebhook(wh.id)}
                                                className="p-1.5 text-slate-600 hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsView;
