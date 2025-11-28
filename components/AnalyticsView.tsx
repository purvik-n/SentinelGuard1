
import React, { useState } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { Download, Calendar, ArrowUpRight, FileText, CheckCircle, Loader2, X, Filter, Check } from 'lucide-react';

interface ReportConfig {
    id: string;
    title: string;
    description: string;
    type: 'SUMMARY' | 'USERS' | 'IPS';
}

const AnalyticsView: React.FC = () => {
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
    
    // Filters
    const [appFilter, setAppFilter] = useState('ALL');
    const [regionFilter, setRegionFilter] = useState('ALL');
    const [riskFilter, setRiskFilter] = useState('ALL');

    // Report Generation State
    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [currentReport, setCurrentReport] = useState<ReportConfig | null>(null);

    // Download Simulation State
    const [downloading, setDownloading] = useState<'CSV' | 'PDF' | null>(null);
    const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);

    // --- MOCK DATA ---

    const riskTrendData = [
        { time: '00:00', avgRisk: 15, peakRisk: 45 },
        { time: '04:00', avgRisk: 12, peakRisk: 30 },
        { time: '08:00', avgRisk: 25, peakRisk: 65 },
        { time: '12:00', avgRisk: 45, peakRisk: 85 },
        { time: '16:00', avgRisk: 35, peakRisk: 70 },
        { time: '20:00', avgRisk: 20, peakRisk: 50 },
        { time: '23:59', avgRisk: 18, peakRisk: 40 },
    ];

    const topUsersData = [
        { name: 'Bob Smith', riskScore: 94, events: 12 },
        { name: 'Unknown (Guest)', riskScore: 88, events: 45 },
        { name: 'Charlie D.', riskScore: 75, events: 8 },
        { name: 'System Admin', riskScore: 65, events: 2 },
        { name: 'Alice Chen', riskScore: 45, events: 5 },
    ];

    const topIpsData = [
        { ip: '45.22.19.112', location: 'Lagos, NG', score: 98 },
        { ip: '185.220.101.4', location: 'Tor Exit Node', score: 95 },
        { ip: '88.21.32.11', location: 'Moscow, RU', score: 85 },
        { ip: '67.11.90.221', location: 'London, UK', score: 72 },
        { ip: '203.0.113.5', location: 'San Francisco, US', score: 45 },
    ];

    const outcomesData = [
        { name: 'Allowed', value: 650, color: '#10b981' }, // Emerald
        { name: 'MFA Challenged', value: 200, color: '#f59e0b' }, // Amber
        { name: 'Blocked', value: 120, color: '#ef4444' }, // Rose
        { name: 'Account Locked', value: 30, color: '#6366f1' }, // Indigo
    ];

    const availableReports: ReportConfig[] = [
        { id: 'rep_1', title: 'Daily Risk Summary', description: 'Executive overview of total incidents, blocked attacks, and active threats.', type: 'SUMMARY' },
        { id: 'rep_2', title: 'High-Risk User Report', description: 'Detailed list of users exceeding critical risk thresholds.', type: 'USERS' },
        { id: 'rep_3', title: 'Suspicious IP Report', description: 'Log of all connections from blacklisted or low-reputation IP addresses.', type: 'IPS' },
    ];

    const handleGenerateReport = (report: ReportConfig) => {
        setGeneratingId(report.id);
        setTimeout(() => {
            setGeneratingId(null);
            setCurrentReport(report);
            setReportModalOpen(true);
            setShowDownloadSuccess(false); // Reset success state
        }, 1500);
    };

    const handleDownload = (type: 'CSV' | 'PDF') => {
        setDownloading(type);
        setTimeout(() => {
            setDownloading(null);
            setShowDownloadSuccess(true);
            setTimeout(() => setShowDownloadSuccess(false), 3000);
        }, 1500);
    };

    const renderReportPreview = () => {
        if (!currentReport) return null;

        let content = null;

        if (currentReport.type === 'SUMMARY') {
            content = (
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900 text-xs uppercase font-bold text-slate-500">
                        <tr><th className="p-3">Metric</th><th className="p-3">Value</th><th className="p-3">Change</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        <tr><td className="p-3">Total Events</td><td className="p-3">12,540</td><td className="p-3 text-emerald-400">+5%</td></tr>
                        <tr><td className="p-3">Blocked Attacks</td><td className="p-3">843</td><td className="p-3 text-rose-400">+12%</td></tr>
                        <tr><td className="p-3">Avg Risk Score</td><td className="p-3">18/100</td><td className="p-3 text-emerald-400">-2%</td></tr>
                    </tbody>
                </table>
            );
        } else if (currentReport.type === 'USERS') {
            content = (
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900 text-xs uppercase font-bold text-slate-500">
                        <tr><th className="p-3">User</th><th className="p-3">Risk Score</th><th className="p-3">Incidents</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {topUsersData.map((u, i) => (
                            <tr key={i}>
                                <td className="p-3">{u.name}</td>
                                <td className="p-3"><span className="text-rose-400 font-bold">{u.riskScore}</span></td>
                                <td className="p-3">{u.events}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        } else {
             content = (
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900 text-xs uppercase font-bold text-slate-500">
                        <tr><th className="p-3">IP Address</th><th className="p-3">Location</th><th className="p-3">Reputation</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {topIpsData.map((ip, i) => (
                            <tr key={i}>
                                <td className="p-3 font-mono">{ip.ip}</td>
                                <td className="p-3">{ip.location}</td>
                                <td className="p-3"><span className="text-rose-400 font-bold">Risk {ip.score}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        return (
            <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    {content}
                </div>
                <div className="flex gap-3 justify-end">
                    <button 
                        onClick={() => handleDownload('CSV')}
                        disabled={downloading !== null}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {downloading === 'CSV' ? <Loader2 size={16} className="animate-spin"/> : <FileText size={16}/>}
                        Download CSV
                    </button>
                    <button 
                        onClick={() => handleDownload('PDF')}
                        disabled={downloading !== null}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                    >
                        {downloading === 'PDF' ? <Loader2 size={16} className="animate-spin"/> : <Download size={16}/>}
                        Download PDF
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 h-full flex flex-col animate-in fade-in duration-500 overflow-y-auto relative">
             <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Analytics & Reports</h1>
                    <p className="text-slate-400 text-sm">Historical threat data, performance metrics, and compliance reporting.</p>
                </div>
                <div className="flex gap-4">
                    {/* Time Range Selector */}
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
                        {['24h', '7d', '30d'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range as any)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${timeRange === range ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                {range === '24h' ? 'Last 24h' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-8 flex flex-wrap gap-4 items-center shadow-lg">
                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mr-2">
                    <Filter size={16} /> Filters:
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Application</label>
                    <select 
                        value={appFilter}
                        onChange={(e) => setAppFilter(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500 min-w-[150px]"
                    >
                        <option value="ALL">All Applications</option>
                        <option value="SAAS">Sentinel SaaS</option>
                        <option value="ADMIN">Admin Portal</option>
                        <option value="MOBILE">Mobile App</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Region</label>
                    <select 
                        value={regionFilter}
                        onChange={(e) => setRegionFilter(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500 min-w-[150px]"
                    >
                        <option value="ALL">Global</option>
                        <option value="NA">North America</option>
                        <option value="EU">Europe</option>
                        <option value="APAC">Asia-Pacific</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Risk Level</label>
                    <select 
                        value={riskFilter}
                        onChange={(e) => setRiskFilter(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500 min-w-[150px]"
                    >
                        <option value="ALL">All Levels</option>
                        <option value="CRITICAL">Critical Only</option>
                        <option value="HIGH">High & Critical</option>
                        <option value="MEDIUM">Medium+</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                
                {/* 1. Risk Trend Chart */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-white font-bold">Risk Trend Over Time</h3>
                        <div className="flex items-center gap-4 text-xs">
                             <div className="flex items-center gap-1 text-rose-400">
                                 <span className="w-2 h-2 rounded-full bg-rose-500"></span> Peak Risk
                             </div>
                             <div className="flex items-center gap-1 text-indigo-400">
                                 <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Avg Score
                             </div>
                        </div>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={riskTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                    itemStyle={{ fontSize: 12 }}
                                />
                                <Line type="monotone" dataKey="peakRisk" stroke="#f43f5e" strokeWidth={2} dot={false} activeDot={{ r: 6 }} name="Peak Risk" />
                                <Line type="monotone" dataKey="avgRisk" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 6 }} name="Avg Score" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Outcomes Pie Chart */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-white font-bold mb-6">Login Outcomes Breakdown</h3>
                    <div className="grid grid-cols-2 gap-4 h-72">
                        <div className="h-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={outcomesData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {outcomesData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col justify-center gap-3">
                            {outcomesData.map((entry, index) => (
                                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 border border-slate-800/50">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full" style={{backgroundColor: entry.color}}></span>
                                        <span className="text-slate-300 text-sm">{entry.name}</span>
                                    </div>
                                    <span className="text-white font-mono text-sm font-bold">{((entry.value / 1000) * 100).toFixed(0)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* 2. Top High-Risk Users */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-white font-bold mb-6">Top High-Risk Users</h3>
                    <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topUsersData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={100} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                    cursor={{fill: '#1e293b', opacity: 0.4}}
                                />
                                <Bar dataKey="riskScore" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={20} name="Risk Score">
                                    {topUsersData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.riskScore > 80 ? '#f43f5e' : '#f97316'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Top Risky IPs */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-white font-bold mb-4">Top Risky Source IPs</h3>
                    <div className="space-y-4">
                        {topIpsData.map((item, idx) => (
                            <div key={idx} className="relative group">
                                <div className="flex justify-between items-center mb-1 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 text-slate-500 font-mono text-xs">#{idx + 1}</div>
                                        <div>
                                            <div className="text-slate-200 font-mono text-sm">{item.ip}</div>
                                            <div className="text-[10px] text-slate-500">{item.location}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold ${item.score > 90 ? 'text-rose-400' : 'text-orange-400'}`}>
                                            Risk {item.score}
                                        </span>
                                    </div>
                                </div>
                                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${item.score > 90 ? 'bg-rose-500' : 'bg-orange-500'}`} 
                                        style={{width: `${item.score}%`}}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reports Section */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="text-indigo-500" /> Reports Center
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {availableReports.map((report) => (
                        <div key={report.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-indigo-500/50 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-colors">
                                    <FileText size={20} className="text-slate-400 group-hover:text-indigo-400"/>
                                </div>
                                {generatingId === report.id && (
                                    <Loader2 className="animate-spin text-indigo-500" size={20} />
                                )}
                            </div>
                            <h3 className="font-bold text-white mb-2">{report.title}</h3>
                            <p className="text-sm text-slate-400 mb-6 min-h-[40px]">{report.description}</p>
                            <button 
                                onClick={() => handleGenerateReport(report)}
                                disabled={generatingId !== null}
                                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                Generate Report
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Report Preview Modal */}
            {reportModalOpen && currentReport && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-8">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReportModalOpen(false)}></div>
                    <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-full">
                        
                        <div className="flex justify-between items-center p-6 border-b border-slate-800">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <CheckCircle size={20} className="text-emerald-500"/> Report Generated
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">{currentReport.title} - {new Date().toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => setReportModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                                <X size={24}/>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto relative">
                            <div className="bg-slate-950 rounded-xl border border-slate-800 p-1">
                                {renderReportPreview()}
                            </div>

                            {/* Success Toast */}
                            {showDownloadSuccess && (
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                                    <CheckCircle size={16} /> Report downloaded successfully
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsView;
