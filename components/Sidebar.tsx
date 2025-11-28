import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, ShieldAlert, FileText, UserCheck, 
  LogOut, Radar, Terminal, BookOpen, Settings, BarChart3, 
  ChevronLeft, ChevronRight, UserCog, Activity, Fingerprint
} from 'lucide-react';
import { View, UserRole } from '../types';

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
  userRole: UserRole;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, userRole, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const getMenuItems = () => {
      const common = [
          { id: 'MY_ACTIVITY', label: 'My Security Activity', icon: <UserCheck size={20} /> },
      ];

      const admin = [
        { group: 'Overview', items: [
            { id: 'DASHBOARD', label: 'Security Overview', icon: <LayoutDashboard size={20} /> },
            { id: 'EVENTS', label: 'Real-Time Events', icon: <Activity size={20} /> },
            { id: 'SESSIONS', label: 'Active Sessions', icon: <Radar size={20} /> },
        ]},
        { group: 'Analysis', items: [
            { id: 'RISK_LOGS', label: 'Risk Analysis', icon: <ShieldAlert size={20} /> },
            { id: 'ANALYTICS', label: 'Analytics & Reports', icon: <BarChart3 size={20} /> },
            { id: 'BIOMETRICS', label: 'Behavioral Risk Factors', icon: <Fingerprint size={20} /> },
        ]},
        { group: 'Management', items: [
            { id: 'USERS', label: 'Users & Profiles', icon: <Users size={20} /> },
            { id: 'POLICIES', label: 'Policies & Rules', icon: <FileText size={20} /> },
            { id: 'SETTINGS', label: 'Settings', icon: <Settings size={20} /> },
        ]},
      ];

      const developer = [
         { group: 'Developer Tools', items: [
             { id: 'DEV_PLAYGROUND', label: 'API Playground', icon: <Terminal size={20} /> },
             { id: 'DEV_DOCS', label: 'Integration Docs', icon: <BookOpen size={20} /> },
         ]},
      ];

      if (userRole === 'ADMIN') return { grouped: true, data: admin };
      if (userRole === 'DEVELOPER') return { grouped: true, data: developer };
      
      // Default User
      return { grouped: false, data: common };
  };

  const menuData = getMenuItems();

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} h-screen bg-slate-950 border-r border-slate-800 flex flex-col text-slate-300 flex-shrink-0 transition-all duration-300 relative z-20`}>
      
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-slate-800 border border-slate-700 text-slate-400 p-1 rounded-full hover:text-white transition-colors z-50 shadow-lg"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header */}
      <div className={`p-6 flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/30 flex-shrink-0">
          <Radar className="text-white" size={24} />
        </div>
        {!isCollapsed && (
            <div className="flex flex-col overflow-hidden animate-in fade-in duration-300">
                <span className="font-bold text-white text-lg tracking-tight whitespace-nowrap">SentinelGuard</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    {userRole === 'ADMIN' ? 'Enterprise' : userRole === 'DEVELOPER' ? 'Dev Portal' : 'User Portal'}
                </span>
            </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-hide">
        {menuData.grouped ? (
            (menuData.data as any[]).map((group, idx) => (
                <div key={idx}>
                    {!isCollapsed && (
                        <h4 className="px-4 text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">
                            {group.group}
                        </h4>
                    )}
                    <div className="space-y-1">
                        {group.items.map((item: any) => (
                            <button
                                key={item.id}
                                onClick={() => onChangeView(item.id as View)}
                                title={isCollapsed ? item.label : ''}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                                currentView === item.id
                                    ? 'bg-indigo-500/10 text-indigo-500'
                                    : 'hover:bg-slate-900 text-slate-400 hover:text-white'
                                } ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <span className={`${currentView === item.id ? 'text-indigo-500' : 'text-slate-400 group-hover:text-white'}`}>
                                    {item.icon}
                                </span>
                                {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                                {currentView === item.id && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            ))
        ) : (
            (menuData.data as any[]).map((item) => (
                <button
                    key={item.id}
                    onClick={() => onChangeView(item.id as View)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    currentView === item.id
                        ? 'bg-indigo-600/10 text-indigo-500'
                        : 'hover:bg-slate-900 hover:text-white'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <span className={`${currentView === item.id ? 'text-indigo-500' : 'text-slate-400 group-hover:text-white'}`}>
                    {item.icon}
                    </span>
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
            ))
        )}
      </nav>

      {/* Footer / Profile */}
      <div className="p-3 border-t border-slate-800 bg-slate-950">
        <div className={`bg-slate-900 rounded-xl p-3 flex items-center gap-3 transition-all ${isCollapsed ? 'flex-col justify-center gap-2' : ''}`}>
            
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-lg ${userRole === 'ADMIN' ? 'bg-indigo-500 shadow-indigo-500/20' : userRole === 'DEVELOPER' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}>
                {userRole === 'ADMIN' ? 'AD' : userRole === 'DEVELOPER' ? 'DV' : 'US'}
            </div>
            
            {!isCollapsed ? (
                // Expanded Footer
                <>
                    <div className="flex flex-col overflow-hidden min-w-0">
                        <span className="text-sm font-medium text-white truncate">
                            {userRole === 'ADMIN' ? 'Sarah Wilson' : userRole === 'DEVELOPER' ? 'Alex Coder' : 'Bob Smith'}
                        </span>
                        <span className="text-xs text-slate-400 truncate capitalize">{userRole.toLowerCase()}</span>
                    </div>
                    <button 
                        onClick={onLogout}
                        className="ml-auto text-slate-500 hover:text-rose-400 transition-colors p-1 rounded hover:bg-slate-800" 
                        title="Sign Out"
                    >
                        <LogOut size={16} />
                    </button>
                </>
            ) : (
                // Collapsed Footer - Just LogOut Icon below Avatar
                 <button 
                    onClick={onLogout}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1 rounded hover:bg-slate-800" 
                    title="Sign Out"
                >
                    <LogOut size={16} />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;