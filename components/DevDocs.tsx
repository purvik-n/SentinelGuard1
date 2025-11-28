
import React, { useState } from 'react';
import { Book, Code, Terminal, Hash, Globe, ChevronRight, Copy, Check, Server, Shield } from 'lucide-react';

const DevDocs: React.FC = () => {
    const [activeSection, setActiveSection] = useState('quickstart');
    const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

    const handleCopy = (text: string, id: string) => {
        // navigator.clipboard.writeText(text); // In real app
        setCopiedSnippet(id);
        setTimeout(() => setCopiedSnippet(null), 2000);
    };

    const sections = [
        { id: 'quickstart', label: 'Quick Start', icon: <Book size={16}/> },
        { id: 'authentication', label: 'Authentication', icon: <Shield size={16}/> },
        { id: 'client-sdk', label: 'Client SDK', icon: <Code size={16}/> },
        { id: 'api-reference', label: 'API Reference', icon: <Terminal size={16}/> },
        { id: 'webhooks', label: 'Webhooks', icon: <Globe size={16}/> },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'quickstart':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-4">Getting Started</h2>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                SentinelGuard provides a powerful API and client-side SDK to detect identity threats and behavioral anomalies in real-time. 
                                Follow this guide to integrate SentinelGuard into your application in under 10 minutes.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-indigo-500/50 transition-colors cursor-pointer group" onClick={() => setActiveSection('client-sdk')}>
                                <div className="p-3 bg-indigo-500/10 rounded-lg w-fit text-indigo-400 mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                    <Code size={24} />
                                </div>
                                <h3 className="text-white font-bold text-lg mb-2">Frontend Integration</h3>
                                <p className="text-slate-400 text-sm">Install the JS SDK to collect behavioral biometrics and device fingerprints.</p>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-emerald-500/50 transition-colors cursor-pointer group" onClick={() => setActiveSection('api-reference')}>
                                <div className="p-3 bg-emerald-500/10 rounded-lg w-fit text-emerald-400 mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                    <Server size={24} />
                                </div>
                                <h3 className="text-white font-bold text-lg mb-2">Backend API</h3>
                                <p className="text-slate-400 text-sm">Query risk scores, manage sessions, and configure policies via REST API.</p>
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-white font-bold text-lg mb-4">Installation</h3>
                            <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-300 flex justify-between items-center border border-slate-800">
                                <span>npm install @sentinel/sdk</span>
                                <button 
                                    onClick={() => handleCopy('npm install @sentinel/sdk', 'install')}
                                    className="text-slate-500 hover:text-white transition-colors"
                                >
                                    {copiedSnippet === 'install' ? <Check size={16} className="text-emerald-500"/> : <Copy size={16}/>}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'authentication':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                         <div>
                            <h2 className="text-3xl font-bold text-white mb-4">Authentication</h2>
                            <p className="text-slate-400 text-lg leading-relaxed mb-6">
                                The SentinelGuard API uses API keys to authenticate requests. You can view and manage your API keys in the <span className="text-white font-medium cursor-pointer hover:underline">Settings</span> page.
                            </p>
                            
                            <div className="bg-orange-500/10 border-l-4 border-orange-500 p-4 rounded-r-lg mb-8">
                                <div className="flex items-start gap-3">
                                    <Shield className="text-orange-500 mt-1" size={20} />
                                    <div>
                                        <h4 className="text-orange-400 font-bold text-sm">Security Warning</h4>
                                        <p className="text-orange-300/80 text-sm mt-1">
                                            Never expose your <strong>Secret Key</strong> in client-side code. Use the <strong>Public Key</strong> for frontend SDK initialization.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-4">Authorization Header</h3>
                            <p className="text-slate-400 mb-4">
                                Authentication to the API is performed via HTTP Basic Auth. Provide your API key as the basic auth username value. You do not need to provide a password.
                            </p>

                            <div className="bg-[#0f111a] border border-slate-800 rounded-xl overflow-hidden font-mono text-xs mb-8">
                                <div className="flex justify-between items-center px-4 py-2 border-b border-slate-800 bg-slate-950 text-slate-500">
                                    <span>BASH</span>
                                    <button onClick={() => handleCopy('', 'auth')} className="hover:text-white">
                                        {copiedSnippet === 'auth' ? <Check size={14} className="text-emerald-500"/> : <Copy size={14}/>}
                                    </button>
                                </div>
                                <div className="p-4 text-emerald-300">
                                    curl https://api.sentinelguard.io/v1/events \<br/>
                                    &nbsp;&nbsp;-u <span className="text-yellow-300">sk_test_51Mz...</span>:
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'client-sdk':
                return (
                     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-4">Client SDK</h2>
                            <p className="text-slate-400 mb-6">
                                The SentinelGuard JavaScript SDK collects behavioral biometrics (typing cadence, mouse velocity) and device fingerprinting signals to calculate risk scores.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                <h3 className="text-white font-bold text-lg mb-4">1. Initialize the SDK</h3>
                                <p className="text-slate-400 text-sm mb-4">
                                    Initialize the SDK at the root of your application, preferably in your main entry file (e.g., <code className="bg-slate-800 px-1 rounded text-slate-300">App.js</code>).
                                </p>
                                <div className="bg-[#0f111a] border border-slate-800 rounded-lg p-4 font-mono text-sm text-slate-300 overflow-x-auto">
                                    <span className="text-purple-400">import</span> <span className="text-yellow-200">{`{ SentinelGuard }`}</span> <span className="text-purple-400">from</span> <span className="text-emerald-300">'@sentinel/sdk'</span>;{'\n\n'}
                                    <span className="text-blue-400">SentinelGuard</span>.<span className="text-yellow-200">init</span>({'{'}{'\n'}
                                    {'  '}apiKey: <span className="text-emerald-300">'pk_live_...'</span>,{'\n'}
                                    {'  '}options: {'{'}{'\n'}
                                    {'    '}enableBiometrics: <span className="text-orange-400">true</span>{'\n'}
                                    {'  '}{'}'}{'\n'}
                                    {'}'});
                                </div>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                <h3 className="text-white font-bold text-lg mb-4">2. Track Login Events</h3>
                                <p className="text-slate-400 text-sm mb-4">
                                    Call <code className="bg-slate-800 px-1 rounded text-slate-300">trackLogin</code> when a user submits your login form. The SDK will attach the collected behavioral context automatically.
                                </p>
                                <div className="bg-[#0f111a] border border-slate-800 rounded-lg p-4 font-mono text-sm text-slate-300 overflow-x-auto">
                                    <span className="text-purple-400">const</span> <span className="text-blue-200">handleSubmit</span> = <span className="text-purple-400">async</span> (e) ={'>'} {'{'}{'\n'}
                                    {'  '}e.<span className="text-yellow-200">preventDefault</span>();{'\n\n'}
                                    {'  '}<span className="text-slate-500">// Returns a risk token to send to your backend</span>{'\n'}
                                    {'  '}<span className="text-purple-400">const</span> {'{ token }'} = <span className="text-purple-400">await</span> <span className="text-blue-400">SentinelGuard</span>.<span className="text-yellow-200">trackLogin</span>({'{'}{'\n'}
                                    {'    '}userId: email,{'\n'}
                                    {'  '}{'}'});{'\n\n'}
                                    {'  '}<span className="text-slate-500">// Send token to your server for validation</span>{'\n'}
                                    {'  '}<span className="text-purple-400">await</span> <span className="text-yellow-200">apiLogin</span>(email, password, token);{'\n'}
                                    {'}'};
                                </div>
                            </div>
                        </div>
                     </div>
                );
             case 'api-reference':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-4">API Reference</h2>
                            <p className="text-slate-400 mb-6">
                                The REST API allows you to retrieve risk scores, manage sessions, and configure policies programmatically.
                            </p>
                        </div>

                        <div className="space-y-8">
                            {/* Endpoint 1 */}
                            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                                <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center gap-3">
                                    <span className="bg-emerald-500/10 text-emerald-500 font-bold px-2 py-1 rounded text-sm border border-emerald-500/20">POST</span>
                                    <span className="font-mono text-slate-300 text-sm">/v1/events/analyze</span>
                                </div>
                                <div className="p-6">
                                    <p className="text-slate-400 text-sm mb-4">Analyzes a security event and returns a real-time risk score.</p>
                                    
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Request Body</h4>
                                    <div className="bg-[#0f111a] border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 mb-4">
                                        {`{
  "user": { "id": "string", "email": "string" },
  "context": {
    "ip_address": "string",
    "user_agent": "string"
  },
  "biometrics": {
    "typing_cadence": "human" | "bot"
  }
}`}
                                    </div>

                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Response</h4>
                                    <div className="bg-[#0f111a] border border-slate-800 rounded-lg p-4 font-mono text-xs text-emerald-300">
                                         {`{
  "risk_score": 85,
  "level": "CRITICAL",
  "action": "BLOCK",
  "reasons": ["IMPOSSIBLE_TRAVEL", "TOR_EXIT_NODE"]
}`}
                                    </div>
                                </div>
                            </div>

                             {/* Endpoint 2 */}
                            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                                <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center gap-3">
                                    <span className="bg-blue-500/10 text-blue-500 font-bold px-2 py-1 rounded text-sm border border-blue-500/20">GET</span>
                                    <span className="font-mono text-slate-300 text-sm">/v1/sessions/:id</span>
                                </div>
                                <div className="p-6">
                                    <p className="text-slate-400 text-sm mb-4">Retrieves details for a specific session.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
             case 'webhooks':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-4">Webhooks</h2>
                            <p className="text-slate-400 mb-6">
                                SentinelGuard can send real-time notifications to your server when high-risk events occur.
                            </p>
                        </div>
                        
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-white font-bold text-lg mb-4">Verifying Signatures</h3>
                            <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                                SentinelGuard signs all webhook events using a hash-based message authentication code (HMAC) with SHA-256. 
                                The signature is included in the <code className="text-indigo-400">X-Sentinel-Signature</code> header.
                            </p>
                            
                            <div className="bg-[#0f111a] border border-slate-800 rounded-lg p-4 font-mono text-sm text-slate-300 overflow-x-auto">
                                <span className="text-slate-500">// Example Node.js verification</span>{'\n'}
                                <span className="text-purple-400">const</span> <span className="text-blue-200">signature</span> = req.headers[<span className="text-emerald-300">'x-sentinel-signature'</span>];{'\n'}
                                <span className="text-purple-400">const</span> <span className="text-blue-200">expected</span> = crypto.{'\n'}
                                {'  '}.<span className="text-yellow-200">createHmac</span>(<span className="text-emerald-300">'sha256'</span>, <span className="text-blue-200">WEBHOOK_SECRET</span>){'\n'}
                                {'  '}.<span className="text-yellow-200">update</span>(<span className="text-blue-400">JSON</span>.<span className="text-yellow-200">stringify</span>(req.body)){'\n'}
                                {'  '}.<span className="text-yellow-200">digest</span>(<span className="text-emerald-300">'hex'</span>);{'\n\n'}
                                <span className="text-purple-400">if</span> (signature !== expected) {'{'}{'\n'}
                                {'  '}<span className="text-purple-400">throw</span> <span className="text-purple-400">new</span> <span className="text-yellow-200">Error</span>(<span className="text-emerald-300">'Invalid signature'</span>);{'\n'}
                                {'}'}
                            </div>
                        </div>
                    </div>
                );
            default:
                return <div>Select a section</div>;
        }
    };

    return (
        <div className="flex h-full overflow-hidden animate-in fade-in duration-500">
            {/* Docs Sidebar */}
            <div className="w-64 bg-slate-950 border-r border-slate-800 flex-shrink-0 flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <Book className="text-indigo-500"/> Documentation
                    </h1>
                </div>
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                activeSection === section.id 
                                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                                : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                {section.icon}
                                {section.label}
                            </div>
                            {activeSection === section.id && <ChevronRight size={14}/>}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <div className="bg-slate-900 rounded-lg p-3">
                        <div className="text-xs font-bold text-slate-500 uppercase mb-1">SDK Version</div>
                        <div className="text-sm text-white font-mono">v2.4.1 (Latest)</div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-slate-950 relative">
                <div className="max-w-4xl mx-auto p-12">
                     {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default DevDocs;
