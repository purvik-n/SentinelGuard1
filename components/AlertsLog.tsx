
import React, { useState } from 'react';
import { ShieldAlert, Clock, Globe, BrainCircuit, X, Fingerprint, Terminal, UserX, AlertOctagon } from 'lucide-react';
import { Session, RiskLevel, SessionStatus } from '../types';
import { analyzeSessionRisk, generateSecurityReport } from '../services/geminiService';

interface RiskLogsProps {
  sessions: Session[];
  onTerminateSession: (id: string) => void;
}

const RiskLogs: React.FC<RiskLogsProps> = ({ sessions, onTerminateSession }) => {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  // Filter only sessions that have some risk
  const riskySessions = sessions.filter(s => s.riskScore > 0).sort((a,b) => b.riskScore - a.riskScore);

  const handleAnalyze = async (session: Session) => {
    if (session.aiAnalysis) {
        setAiAnalysisResult(session.aiAnalysis);
        return;
    }
    setIsAnalyzing(true);
    const result = await analyzeSessionRisk(session);
    setAiAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const handleGenerateReport = async () => {
      setIsGeneratingReport(true);
      const result = await generateSecurityReport(riskySessions.slice(0, 10));
      setReport(result);
      setIsGeneratingReport(false);
  }

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.CRITICAL: return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case RiskLevel.HIGH: return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case RiskLevel.MEDIUM: return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className="p-8 h-full flex flex-col animate-in fade-in duration-500">
       <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-white">Risk Analysis</h1>
            <p className="text-slate-400 text-sm">Deep dive into behavioral anomalies and threat vectors.</p>
        </div>
        <button 
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
            {isGeneratingReport ? <BrainCircuit className="animate-spin" size={16} /> : <Terminal size={16} />}
            {isGeneratingReport ? 'Generating Briefing...' : 'Generate Daily Briefing'}
        </button>
      </div>

      {report && (
           <div className="mb-6 bg-slate-900 border border-indigo-500/30 rounded-xl p-6 relative shadow-2xl shadow-black/50">
              <button onClick={() => setReport(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={18}/></button>
              <h3 className="text-indigo-400 font-bold mb-3 flex items-center gap-2"><BrainCircuit size={18}/> Executive Security Briefing</h3>
              <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed font-mono max-h-60 overflow-y-auto">
                  {report}
              </div>
           </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* List Column */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Risk Score</th>
                  <th className="p-4 font-semibold">Location</th>
                  <th className="p-4 font-semibold">Factors</th>
                  <th className="p-4 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {riskySessions.map((session) => (
                  <tr 
                    key={session.id} 
                    className={`hover:bg-slate-800/30 transition-colors cursor-pointer ${selectedSession?.id === session.id ? 'bg-slate-800/80 border-l-2 border-indigo-500' : 'border-l-2 border-transparent'}`}
                    onClick={() => { setSelectedSession(session); setAiAnalysisResult(null); }}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                         <img src={`https://ui-avatars.com/api/?name=${session.user.name}&background=random`} className="w-8 h-8 rounded-full" />
                         <div>
                             <div className="text-slate-200 font-medium text-sm">{session.user.name}</div>
                             <div className="text-slate-500 text-xs">{session.user.email}</div>
                         </div>
                      </div>
                    </td>
                    <td className="p-4">
                       <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${getRiskColor(session.riskLevel)}`}>
                        {session.riskScore} / 100
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                        <div className="flex items-center gap-1">
                            <Globe size={12}/> {session.location}
                        </div>
                    </td>
                    <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                            {session.riskFactors.slice(0, 2).map(f => (
                                <span key={f} className="text-[10px] text-slate-400 bg-slate-800 px-1 rounded">{f}</span>
                            ))}
                            {session.riskFactors.length > 2 && <span className="text-[10px] text-slate-500">+{session.riskFactors.length - 2}</span>}
                        </div>
                    </td>
                    <td className="p-4 text-slate-500 text-xs font-mono">
                        {new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail View Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-0 flex flex-col overflow-hidden">
          {selectedSession ? (
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className={`p-6 border-b border-slate-800 ${selectedSession.riskLevel === RiskLevel.CRITICAL ? 'bg-rose-500/5' : 'bg-slate-800/20'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                             <Fingerprint className="text-indigo-500"/> Investigation
                        </h2>
                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getRiskColor(selectedSession.riskLevel)}`}>
                            {selectedSession.riskLevel} RISK
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-3 rounded border border-slate-800">
                             <span className="text-xs text-slate-500 uppercase font-bold">Typing Speed</span>
                             <div className="text-white font-mono text-lg">{selectedSession.behavioralData.typingSpeed} <span className="text-xs text-slate-500">WPM</span></div>
                        </div>
                        <div className="bg-slate-950 p-3 rounded border border-slate-800">
                             <span className="text-xs text-slate-500 uppercase font-bold">Variance</span>
                             <div className={`font-mono text-lg ${selectedSession.behavioralData.typingVariance < 0.2 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {selectedSession.behavioralData.typingVariance}
                             </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="mb-6">
                        <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3">Session Metadata</h3>
                        <div className="space-y-3 text-sm">
                             <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-400">IP Address</span>
                                <span className="text-slate-200 font-mono">{selectedSession.ip}</span>
                             </div>
                             <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-400">User Agent</span>
                                <span className="text-slate-200 truncate max-w-[180px] text-right" title={selectedSession.browser}>{selectedSession.browser} on {selectedSession.os}</span>
                             </div>
                             <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-400">Start Time</span>
                                <span className="text-slate-200">{new Date(selectedSession.startedAt).toLocaleString()}</span>
                             </div>
                        </div>
                    </div>

                    {/* AI Section */}
                    <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                                <BrainCircuit size={16} /> Sentinel AI Analysis
                            </h3>
                            {!aiAnalysisResult && (
                                <button 
                                    onClick={() => handleAnalyze(selectedSession)}
                                    disabled={isAnalyzing}
                                    className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                                >
                                    {isAnalyzing ? 'Processing...' : 'Analyze Behavior'}
                                </button>
                            )}
                        </div>

                        {aiAnalysisResult ? (
                            <div className="text-sm text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                                {aiAnalysisResult}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-600 italic">
                                Click "Analyze Behavior" to run a deep scan on keystroke dynamics and geolocation anomalies.
                            </p>
                        )}
                    </div>
                </div>
                
                {/* Actions Footer */}
                <div className="p-4 border-t border-slate-800 flex gap-3 bg-slate-900">
                    <button 
                        onClick={() => onTerminateSession(selectedSession.id)}
                        disabled={selectedSession.status === SessionStatus.TERMINATED}
                        className="flex-1 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 border border-rose-500/50 py-3 rounded-xl text-sm font-bold transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <UserX size={16} /> {selectedSession.status === SessionStatus.TERMINATED ? 'Terminated' : 'Block & Terminate'}
                    </button>
                    <button 
                         className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 py-3 rounded-xl text-sm font-bold transition-colors flex justify-center items-center gap-2"
                    >
                        <AlertOctagon size={16} /> Challenge MFA
                    </button>
                </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                <ShieldAlert size={48} className="mb-4 opacity-20" />
                <p className="text-sm">Select a risky session to investigate details.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default RiskLogs;
