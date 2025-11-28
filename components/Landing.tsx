
import React, { useState } from 'react';
import { Shield, Lock, Terminal, User, ArrowRight, Activity, Globe, Fingerprint, CheckCircle, BrainCircuit, Server, Zap, MousePointer } from 'lucide-react';
import { UserRole } from '../types';

interface LandingProps {
  onLogin: (role: UserRole) => void;
}

const Landing: React.FC<LandingProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const scrollToSection = (id: string) => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const roles = [
    {
      id: 'ADMIN',
      title: 'Security Admin',
      icon: <Shield size={32} className="text-indigo-500" />,
      description: 'SOC Dashboard, Incident Response, Policy Management.',
      features: ['Full Visibility', 'Risk Analysis', 'User Management']
    },
    {
      id: 'DEVELOPER',
      title: 'Developer',
      icon: <Terminal size={32} className="text-emerald-500" />,
      description: 'API Integration, SDK Documentation, Risk Scoring Playground.',
      features: ['API Keys', 'Webhooks', 'Simulation Tools']
    },
    {
      id: 'USER',
      title: 'End User',
      icon: <User size={32} className="text-rose-500" />,
      description: 'Personal Security Portal, Recent Activity, Device Management.',
      features: ['My Activity', 'Trusted Devices', '2FA Setup']
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 overflow-y-auto">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <Activity className="text-white" size={20} />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">SentinelGuard</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">How it Works</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button>
            <button onClick={() => scrollToSection('demo')} className="hover:text-white transition-colors">Live Demo</button>
          </div>
          <button 
            onClick={() => scrollToSection('demo')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors border border-slate-700"
          >
            Launch App
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
           <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"></div>
           <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-indigo-400 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Live Threat Intelligence v2.4 Now Available
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700">
            Identity Security for the <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">AI Era</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            SentinelGuard uses advanced behavioral biometrics and geolocation analysis to detect compromised accounts, bot attacks, and insider threats in real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <button 
                onClick={() => scrollToSection('demo')}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-600/20 transition-all hover:scale-105 flex items-center gap-2"
            >
              Start Simulation <ArrowRight size={20} />
            </button>
            <button 
                onClick={() => scrollToSection('how-it-works')}
                className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl font-bold text-lg border border-slate-800 transition-all flex items-center gap-2"
            >
              <Fingerprint size={20} /> How it Works
            </button>
          </div>
        </div>
      </div>

      {/* How It Works Section (New) */}
      <div id="how-it-works" className="py-24 bg-slate-950 border-t border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-white mb-4">The Security Pipeline</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">From signal collection to automated response, SentinelGuard handles the full lifecycle.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-900 via-indigo-500 to-emerald-500 opacity-30 z-0"></div>

                {[
                    { title: 'Collection', icon: <Fingerprint size={24}/>, desc: 'SDK collects typing cadence, mouse velocity, and device signals.' },
                    { title: 'Analysis', icon: <BrainCircuit size={24}/>, desc: 'Risk Engine evaluates signals against user baselines and threat feeds.' },
                    { title: 'Scoring', icon: <Activity size={24}/>, desc: 'Real-time risk score (0-100) is assigned to every session event.' },
                    { title: 'Response', icon: <Zap size={24}/>, desc: 'Automated policies block attacks or trigger MFA challenges.' }
                ].map((step, i) => (
                    <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                        <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:border-indigo-500/50 group-hover:shadow-lg group-hover:shadow-indigo-500/10 transition-all duration-300">
                            <div className="text-indigo-500 group-hover:scale-110 transition-transform duration-300">
                                {step.icon}
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                        <p className="text-sm text-slate-400">{step.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="py-24 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Why SentinelGuard?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Traditional 2FA isn't enough. We analyze thousands of signals to create a dynamic risk score for every user interaction.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all group">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <BrainCircuit size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Behavioral AI</h3>
              <p className="text-slate-400 leading-relaxed">
                Analyzes typing cadence, mouse velocity, and interaction patterns to distinguish between legitimate users, bots, and bad actors.
              </p>
            </div>
            
            <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all group">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Impossible Travel</h3>
              <p className="text-slate-400 leading-relaxed">
                Real-time geolocation velocity checks detect when a user logs in from two distant locations in an physically impossible timeframe.
              </p>
            </div>

            <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 hover:border-rose-500/30 transition-all group">
              <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center mb-6 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                <Lock size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Automated Response</h3>
              <p className="text-slate-400 leading-relaxed">
                Instantly block high-risk sessions, trigger step-up MFA, or lock compromised accounts based on configurable policy rules.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Login / Role Selection */}
      <div id="demo" className="py-24 relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Select Your Role</h2>
            <p className="text-slate-400">Experience the platform from different perspectives.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map(role => (
              <button 
                key={role.id}
                onClick={() => setSelectedRole(role.id as UserRole)}
                className={`relative p-6 rounded-2xl border text-left transition-all duration-300 ${
                  selectedRole === role.id 
                  ? 'bg-slate-800 border-indigo-500 ring-2 ring-indigo-500/20 scale-105 shadow-2xl' 
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                }`}
              >
                {selectedRole === role.id && (
                  <div className="absolute top-4 right-4 text-indigo-500">
                    <CheckCircle size={24} fill="currentColor" className="text-slate-900"/>
                  </div>
                )}
                <div className="mb-4">{role.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{role.title}</h3>
                <p className="text-sm text-slate-400 mb-4">{role.description}</p>
                <ul className="space-y-2">
                  {role.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <div className="w-1 h-1 rounded-full bg-slate-400"></div> {feature}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <button 
              onClick={() => selectedRole && onLogin(selectedRole)}
              disabled={!selectedRole}
              className="px-12 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg shadow-xl hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
            >
              {selectedRole ? `Log in as ${roles.find(r => r.id === selectedRole)?.title}` : 'Select a Role to Continue'}
              {selectedRole && <ArrowRight size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 text-center text-slate-500 text-sm">
        <p>&copy; 2024 SentinelGuard AI. All rights reserved.</p>
        <p className="mt-2">Prototype for demonstration purposes only.</p>
      </footer>

    </div>
  );
};

export default Landing;
