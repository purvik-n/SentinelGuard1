
import React, { useState, useEffect } from 'react';
import { ChevronDown, Bell, Search, ChevronRight } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SessionMonitor from './components/LiveMonitor';
import RiskLogs from './components/AlertsLog';
import PolicyPanel from './components/PolicyPanel';
import UserPortal from './components/UserPortal';
import DeveloperPlayground from './components/DeveloperPlayground';
import UsersView from './components/UsersView';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import EventsStream from './components/EventsStream';
import DevDocs from './components/DevDocs';
import Landing from './components/Landing';
import LoadingScreen from './components/LoadingScreen';
import BiometricsView from './components/BiometricsView';

import { View, Session, SystemStats, SessionStatus, UserRole, SecurityEvent, RiskLevel } from './types';
import { MOCK_SESSIONS, MOCK_EVENTS } from './constants';

const App: React.FC = () => {
  // --- Boot & Auth State ---
  const [isBooting, setIsBooting] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');

  // --- View State ---
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [timeRange, setTimeRange] = useState('24h');
  
  // --- Data State ---
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [stats, setStats] = useState<SystemStats>({
    activeSessions: 142,
    avgRiskScore: 18,
    blockedAttacks24h: 843,
    compromisedAccounts: 3,
    totalLogins24h: 12540,
    highRiskLogins24h: 127,
    accountsLocked: 5
  });

  // Global Events State - seeded with mock events
  const [events, setEvents] = useState<SecurityEvent[]>(() => {
    return MOCK_EVENTS.map(e => ({
        ...e,
        riskBreakdown: [
            { reason: 'Baseline Deviation', score: 5 },
            { reason: 'New IP Address', score: e.riskScore > 20 ? 15 : 0 }
        ].filter(x => x.score > 0)
    }));
  });

  // --- Boot Sequence ---
  useEffect(() => {
    // Show boot screen for 4.5 seconds to simulate system initialization
    const timer = setTimeout(() => {
        setIsBooting(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  // --- Auth Handlers ---
  const handleLogin = (role: UserRole) => {
    setIsLoading(true);
    // Simulate login delay
    setTimeout(() => {
        setIsLoading(false);
        setIsAuthenticated(true);
        setCurrentRole(role);
        
        // Route to default view based on selected role
        if (role === 'ADMIN') setCurrentView('DASHBOARD');
        if (role === 'DEVELOPER') setCurrentView('DEV_PLAYGROUND');
        if (role === 'USER') setCurrentView('MY_ACTIVITY');
    }, 3500); 
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setCurrentRole('ADMIN');
      setCurrentView('DASHBOARD');
      // Optional: Re-trigger boot or just go to landing
      // setIsBooting(true); 
  };

  // --- Event & Session Handlers ---

  const handleUpdateSession = (sessionId: string, updates: Partial<Session>) => {
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, ...updates } : s));
      
      // Update stats if terminating/blocking
      if (updates.status === SessionStatus.TERMINATED || updates.status === SessionStatus.BLOCKED) {
           setStats(prev => ({ 
               ...prev, 
               activeSessions: prev.activeSessions - 1,
               blockedAttacks24h: prev.blockedAttacks24h + 1
           }));
      }
  };

  const handleTerminateSession = (id: string) => {
    handleUpdateSession(id, { status: SessionStatus.TERMINATED });
  };

  const handleAddEvent = (newEvent: SecurityEvent) => {
    setEvents(prev => [newEvent, ...prev].slice(0, 100)); // Keep last 100 events
    
    // INTEGRATION LOGIC: If it's a login event, create a session!
    // This allows the Developer Playground to actually spawn sessions in the Live Monitor.
    if (newEvent.type === 'LOGIN_SUCCESS' || newEvent.type === 'LOGIN_FAILED') {
        const newSession: Session = {
            id: `sess_${Date.now()}`,
            user: newEvent.user,
            ip: newEvent.ip,
            location: newEvent.location,
            device: newEvent.device,
            browser: 'Unknown Browser', 
            os: 'Unknown OS',
            startedAt: newEvent.timestamp,
            lastActive: newEvent.timestamp,
            riskScore: newEvent.riskScore,
            riskLevel: newEvent.riskLevel,
            status: newEvent.action === 'BLOCKED' ? SessionStatus.BLOCKED : SessionStatus.ACTIVE,
            riskFactors: newEvent.riskFactors || [],
            behavioralData: { typingSpeed: 60, typingVariance: 0.5, mouseVelocity: 200, clickRate: 10 },
            eventHistory: []
        };
        setSessions(prev => [newSession, ...prev]);
        setStats(prev => ({ 
            ...prev, 
            activeSessions: prev.activeSessions + 1,
            totalLogins24h: prev.totalLogins24h + 1
        }));
    }
  };

  // Simulate dynamic session updates
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      setSessions(prev => prev.map(s => {
        if (s.status === SessionStatus.ACTIVE) {
            const fluctuation = Math.floor(Math.random() * 5) - 2;
            const newScore = Math.max(0, Math.min(100, s.riskScore + fluctuation));
            return {
                ...s,
                riskScore: newScore,
            }
        }
        return s;
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // --- Rendering Helpers ---

  const getBreadcrumbs = () => {
      const parts = currentView.split('_');
      let section = 'Overview';
      let page = currentView.charAt(0) + currentView.slice(1).toLowerCase().replace('_', ' ');

      if (['USERS', 'POLICIES', 'SETTINGS'].includes(currentView)) section = 'Management';
      if (['RISK_LOGS', 'ANALYTICS', 'BIOMETRICS'].includes(currentView)) section = 'Analysis';
      if (['DEV_PLAYGROUND', 'DEV_DOCS'].includes(currentView)) section = 'Developer';
      
      if (currentView === 'DASHBOARD') page = 'Security Overview';
      if (currentView === 'EVENTS') page = 'Real-Time Events';
      if (currentView === 'RISK_LOGS') page = 'Risk Analysis';
      if (currentView === 'BIOMETRICS') page = 'Biometric Lab';
      if (currentView === 'DEV_PLAYGROUND') page = 'API Playground';
      if (currentView === 'DEV_DOCS') page = 'Documentation';

      return (
          <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>{section}</span>
              <ChevronRight size={14} className="text-slate-600"/>
              <span className="text-slate-200 font-medium">{page}</span>
          </div>
      );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard stats={stats} recentSessions={sessions} onNavigate={setCurrentView} />;
      case 'EVENTS':
        return <EventsStream events={events} onAddEvent={handleAddEvent} />;
      case 'SESSIONS':
        return <SessionMonitor sessions={sessions} onUpdateSession={handleUpdateSession} />;
      case 'RISK_LOGS':
        return <RiskLogs sessions={sessions} onTerminateSession={handleTerminateSession} />;
      case 'POLICIES':
        return <PolicyPanel />;
      case 'USERS':
        return <UsersView />;
      case 'ANALYTICS':
        return <AnalyticsView />;
      case 'BIOMETRICS':
        return <BiometricsView />;
      case 'SETTINGS':
        return <SettingsView />;
      case 'MY_ACTIVITY':
        return <UserPortal events={events} />;
      case 'DEV_PLAYGROUND':
        return <DeveloperPlayground onSendEvent={handleAddEvent} onNavigate={setCurrentView} />;
      case 'DEV_DOCS':
         return <DevDocs />;
      default:
        return <div className="p-8 text-white">View Not Found</div>;
    }
  };

  // --- Flow Control ---

  // 1. Booting Screen
  if (isBooting) {
      return <LoadingScreen mode="BOOT" />;
  }

  // 2. Login Loading Screen
  if (isLoading) {
      return <LoadingScreen mode="LOGIN" />;
  }

  // 3. Public Landing / Login Page
  if (!isAuthenticated) {
      return <Landing onLogin={handleLogin} />;
  }

  // 4. Main Application
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100 font-sans selection:bg-indigo-500/30">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        userRole={currentRole}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 lg:px-8 flex-shrink-0 backdrop-blur-sm z-10">
            {/* Breadcrumb / Search */}
            <div className="flex items-center gap-6 text-slate-400 text-sm flex-1 max-w-2xl">
                {getBreadcrumbs()}

                <div className="h-4 w-px bg-slate-800 hidden md:block"></div>

                <div className="relative w-full max-w-sm hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input 
                        type="text" 
                        placeholder="Search system..." 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 focus:border-indigo-500 focus:outline-none text-slate-200 transition-all text-sm"
                    />
                </div>
            </div>

            {/* Right Side Actions & Role Switcher */}
            <div className="flex items-center gap-4">
                 
                 {/* Time Range Filter */}
                 <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                    {['1h', '24h', '7d', '30d'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeRange === range ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            {range}
                        </button>
                    ))}
                 </div>

                 <div className="h-6 w-px bg-slate-800 mx-1 hidden md:block"></div>

                 {/* Role Switcher */}
                 <div className="relative group">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-200 transition-colors">
                        <span className="text-slate-400 hidden lg:inline">View as:</span>
                        <span className="font-semibold text-white">
                            {currentRole === 'ADMIN' ? 'Admin' : currentRole === 'DEVELOPER' ? 'Dev' : 'User'}
                        </span>
                        <ChevronDown size={14} />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all transform origin-top-right z-50">
                        <div className="p-1">
                            <button onClick={() => setCurrentRole('ADMIN')} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${currentRole === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                                Security Admin
                            </button>
                            <button onClick={() => setCurrentRole('DEVELOPER')} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${currentRole === 'DEVELOPER' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                                Developer
                            </button>
                             <button onClick={() => setCurrentRole('USER')} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${currentRole === 'USER' ? 'bg-rose-500/10 text-rose-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                                End User
                            </button>
                        </div>
                    </div>
                 </div>

                 <button className="relative text-slate-400 hover:text-white transition-colors p-1">
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                 </button>
                 
                 <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white border-2 border-slate-800">
                    {currentRole === 'ADMIN' ? 'SW' : currentRole === 'DEVELOPER' ? 'AC' : 'BS'}
                 </div>
            </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-hide relative">
             {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
