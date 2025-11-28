
import React, { useState } from 'react';
import { Activity, ShieldAlert, Users, Globe, ArrowUpRight, Lock, Fingerprint, LogIn, ShieldX, UserX, ArrowDownRight, RefreshCw, ExternalLink } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Session, SystemStats, RiskLevel, View } from '../types';
import { CHART_DATA } from '../constants';

interface DashboardProps {
  stats: SystemStats;
  recentSessions: Session[];
  onNavigate: (view: View) => void;
}

// Helper to get hex color from Tailwind name for Recharts
const getColorHex = (colorClass: string) => {
    if (colorClass.includes('indigo')) return '#6366f1';
    if (colorClass.includes('emerald')) return '#10b981';
    if (colorClass.includes('rose')) return '#f43f5e';
    if (colorClass.includes('blue')) return '#3b82f6';
    if (colorClass.includes('orange')) return '#f97316';
    return '#94a3b8';
};

const TinySparkline: React.FC<{ color: string, trend: 'up' | 'down' }> = ({ color, trend }) => {
    // Generate simple random data that trends up or down
    const data = Array.from({ length: 10 }, (_, i) => {
        const base = trend === 'up' ? i * 2 : 20 - (i * 2);
        return { val: base + Math.random() * 10 };
    });

    return (
        <ResponsiveContainer width={80} height={30}>
            <LineChart data={data}>
                <Line type="monotone" dataKey="val" stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    );
};

const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    trend: string; 
    trendDir?: 'up' | 'down';
    color: string; 
    borderColor: string;
    bgColor: string;
}> = ({ title, value, icon, trend, trendDir = 'up', color, borderColor, bgColor }) => (
  <div className={`bg-slate-900 border ${borderColor} p-5 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:bg-slate-800/80`}>
    <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${color}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 80 })}
    </div>
    
    <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-2.5 rounded-xl ${bgColor} ${color} bg-opacity-10 text-white border border-opacity-20`}>
            {icon}
        </div>
        <div className="flex flex-col items-end">
            <span className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded-full bg-slate-950/50 border border-slate-800 ${trendDir === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {trendDir === 'up' ? <ArrowUpRight size={10} className="mr-1" /> : <ArrowDownRight size={10} className="mr-1" />}
                {trend}
            </span>
            <div className="mt-1 opacity-60">
                <TinySparkline color={getColorHex(color)} trend={trendDir} />
            </div>
        </div>
    </div>
    
    <div className="relative z-10">
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{title}</h3>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ stats, recentSessions, onNavigate }) => {
  const [chartMode, setChartMode] = useState<'RISK' | 'VOLUME'>('RISK');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const highRiskSessions = recentSessions.filter(s => s.riskLevel === RiskLevel.HIGH || s.riskLevel === RiskLevel.CRITICAL);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-white">Security Overview</h1>
            <p className="text-slate-400 text-sm mt-1">Real-time identity threat detection status.</p>
        </div>
        <div className="flex items-center gap-4">
            <button 
                onClick={handleRefresh}
                className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Refresh Data"
            >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full shadow-sm">
                <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 text-xs font-medium">System Operational</span>
            </div>
        </div>
      </div>

      {/* Stats Grid - 5 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Total Logins (24h)" 
          value={stats.totalLogins24h.toLocaleString()} 
          icon={<LogIn size={20} />} 
          color="text-blue-400"
          borderColor="border-blue-500/20"
          bgColor="bg-blue-500"
          trend="+8.4%"
          trendDir="up"
        />
        <StatCard 
          title="High-Risk Logins" 
          value={stats.highRiskLogins24h} 
          icon={<ShieldAlert size={20} />} 
          color="text-orange-400"
          borderColor="border-orange-500/20"
          bgColor="bg-orange-500"
          trend="+2.1%"
          trendDir="up"
        />
         <StatCard 
          title="Blocked Attempts" 
          value={stats.blockedAttacks24h} 
          icon={<ShieldX size={20} />} 
          color="text-emerald-400"
          borderColor="border-emerald-500/20"
          bgColor="bg-emerald-500"
          trend="+12%"
          trendDir="up"
        />
        <StatCard 
          title="Accounts Locked" 
          value={stats.accountsLocked} 
          icon={<UserX size={20} />} 
          color="text-rose-400"
          borderColor="border-rose-500/20"
          bgColor="bg-rose-500"
          trend="-1"
          trendDir="down"
        />
        <StatCard 
          title="Avg Risk Score" 
          value={stats.avgRiskScore.toFixed(0)} 
          icon={<Activity size={20} />} 
          color="text-indigo-400"
          borderColor="border-indigo-500/20"
          bgColor="bg-indigo-500"
          trend="-5%"
          trendDir="down"
        />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col shadow-lg shadow-black/20">
          <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Fingerprint size={18} className="text-indigo-500" />
                Global Threat Index
              </h3>
              <div className="flex gap-2">
                   <button 
                    onClick={() => setChartMode('RISK')}
                    className={`text-xs font-medium px-2 py-1 rounded transition-colors ${chartMode === 'RISK' ? 'text-white bg-slate-800' : 'text-slate-500 hover:text-white'}`}
                   >
                       Risk Score
                   </button>
                   <button 
                    onClick={() => setChartMode('VOLUME')}
                    className={`text-xs font-medium px-2 py-1 rounded transition-colors ${chartMode === 'VOLUME' ? 'text-white bg-slate-800' : 'text-slate-500 hover:text-white'}`}
                   >
                       Volume
                   </button>
              </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartMode === 'RISK' ? "#6366f1" : "#10b981"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={chartMode === 'RISK' ? "#6366f1" : "#10b981"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '0.75rem' }}
                    itemStyle={{ color: chartMode === 'RISK' ? '#818cf8' : '#34d399' }}
                />
                <Area 
                    type="monotone" 
                    dataKey="risk" 
                    stroke={chartMode === 'RISK' ? "#6366f1" : "#10b981"} 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorRisk)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* High Risk Activity Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col shadow-lg shadow-black/20">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                    <ShieldAlert size={18} className="text-rose-500" /> Critical Events
                </h3>
                <span className="text-xs bg-rose-500/10 text-rose-400 px-2 py-1 rounded border border-rose-500/20 animate-pulse">Live</span>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-hide">
                {highRiskSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                        <ShieldAlert size={32} className="opacity-20"/>
                        <p className="text-sm">No critical threats detected.</p>
                    </div>
                ) : (
                    highRiskSessions.map(session => (
                        <div 
                            key={session.id} 
                            onClick={() => onNavigate('SESSIONS')}
                            className="group p-3 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition-all cursor-pointer relative"
                        >
                            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ExternalLink size={12} className="text-indigo-400"/>
                            </div>
                            <div className="flex gap-3">
                                <div className="relative mt-1">
                                    <img src={`https://ui-avatars.com/api/?name=${session.user.name}&background=random`} className="w-8 h-8 rounded-full ring-2 ring-slate-900" alt={session.user.name} />
                                    <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border border-slate-900"></span>
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <span className="text-slate-200 font-medium text-sm truncate group-hover:text-white transition-colors">{session.user.email}</span>
                                        <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">{session.riskScore}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                        <Globe size={10} />
                                        <span className="truncate">{session.location}</span>
                                        <span className="text-slate-700 mx-1">|</span>
                                        <span className="truncate max-w-[80px]">{session.ip}</span>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {session.riskFactors.slice(0, 2).map(factor => (
                                            <span key={factor} className="text-[10px] font-semibold text-rose-300 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-900/30">
                                                {factor.replace('_', ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
