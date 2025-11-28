
import React, { useEffect, useState } from 'react';
import { Shield, Lock, Server, Database, Activity, Check, Globe, UserCheck, Key, Search, Wifi } from 'lucide-react';

interface LoadingScreenProps {
    mode?: 'BOOT' | 'LOGIN';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ mode = 'BOOT' }) => {
    const [step, setStep] = useState(0);
    
    // Steps for the initial application boot
    const bootSteps = [
        { label: 'Initializing SentinelGuard Core...', icon: <Shield size={16}/> },
        { label: 'Loading Threat Intelligence Feeds...', icon: <Globe size={16}/> },
        { label: 'Calibrating Behavioral Models...', icon: <Database size={16}/> },
        { label: 'Establishing Secure Gateway...', icon: <Lock size={16}/> },
        { label: 'System Ready', icon: <Check size={16}/> }
    ];

    // Steps for user authentication
    const loginSteps = [
        { label: 'Verifying Identity Credentials...', icon: <Key size={16}/> },
        { label: 'Decrypting User Profile...', icon: <UserCheck size={16}/> },
        { label: 'Synchronizing Session Data...', icon: <Server size={16}/> },
        { label: 'Connecting to Event Stream...', icon: <Wifi size={16}/> },
        { label: 'Access Granted', icon: <Check size={16}/> }
    ];

    const steps = mode === 'BOOT' ? bootSteps : loginSteps;

    useEffect(() => {
        setStep(0);
        // Timing adjusted to match the total duration expected by App.tsx
        const intervalTime = mode === 'BOOT' ? 800 : 600; 
        
        const interval = setInterval(() => {
            setStep(prev => prev < steps.length - 1 ? prev + 1 : prev);
        }, intervalTime);
        
        return () => clearInterval(interval);
    }, [mode]);

    return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50">
            <div className="w-full max-w-md p-8">
                <div className="flex justify-center mb-12">
                     <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse"></div>
                        <Shield size={64} className="text-indigo-500 relative z-10" />
                        <div className="absolute -bottom-2 -right-2 bg-slate-950 rounded-full p-1 border border-slate-800 z-20">
                            <Activity size={24} className="text-emerald-500 animate-bounce" />
                        </div>
                     </div>
                </div>

                <div className="space-y-6">
                    {steps.map((s, i) => (
                        <div 
                            key={i} 
                            className={`flex items-center gap-4 transition-all duration-500 ${
                                i <= step ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                            }`}
                        >
                            <div className={`p-2 rounded-full border transition-colors duration-300 ${
                                i < step ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
                                i === step ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500 animate-pulse' :
                                'bg-slate-900 border-slate-800 text-slate-600'
                            }`}>
                                {s.icon}
                            </div>
                            <span className={`text-sm font-mono transition-colors duration-300 ${
                                i < step ? 'text-slate-400' :
                                i === step ? 'text-white font-bold' :
                                'text-slate-600'
                            }`}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>
                
                {/* Progress Bar */}
                <div className="mt-12 w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300 ease-out"
                        style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                    ></div>
                </div>
                
                <div className="text-center mt-4 text-xs text-slate-600 font-mono">
                    v2.4.1-stable • {mode === 'BOOT' ? 'INITIALIZING' : 'AUTHENTICATING'}
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
