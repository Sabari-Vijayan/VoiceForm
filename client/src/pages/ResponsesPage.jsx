import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, Download, Loader2, MessageSquare, 
  BarChart3, Users, CheckCircle2, Globe, 
  Info, Calendar, ChevronRight, Play, Filter,
  Activity, Award
} from 'lucide-react';
import Layout from '../components/Layout';

const ResponsesPage = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch(`${backendUrl}/api/v1/creator/forms/${formId}/analytics`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const result = await response.json();
      setData(result);
    } catch {
      setError('Could not load analytics. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [formId, backendUrl]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const exportCSV = () => {
    if (!data) return;
    const headers = ['Session ID', 'Language', 'Status', 'Started At', ...data.form.fields.map(f => f.label)];
    const rows = data.sessions.map(s => {
      const responseMap = {};
      s.responses.forEach(r => { responseMap[r.field_id] = r.extracted_value || r.value; });
      return [
        s.id, s.respondent_language, s.status, new Date(s.started_at).toLocaleString(),
        ...data.form.fields.map(f => responseMap[f.id] || '')
      ];
    });
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `responses_${formId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-slate-500 font-black animate-pulse uppercase tracking-[0.2em] text-[10px]">Analyzing insights...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center bg-slate-50">
        <div className="animate-fade-in max-w-md">
            <h2 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tight">Error</h2>
            <p className="text-slate-500 mb-8 text-lg font-medium">{error}</p>
            <button onClick={() => navigate('/dashboard')} className="bg-primary text-white px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs btn-bouncy shadow-lg shadow-primary/20">
              Back to Dashboard
            </button>
        </div>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
            <div>
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary mb-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </Link>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 font-headline uppercase tracking-tight">{data.form.title}</h1>
                <p className="text-slate-500 text-lg font-medium italic">"Review and analyze respondent data through an AI lens."</p>
            </div>
            <button onClick={exportCSV} className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-slate-50 transition-all shadow-sm btn-bouncy">
                <Download size={18} className="text-primary" /> Export CSV
            </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="glass-card p-8 bg-white border-slate-200 group hover:border-primary/20 transition-all">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                    <Users size={24} />
                </div>
                <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">TOTAL RESPONSES</h3>
                <div className="text-4xl font-black text-slate-900 tracking-tight">{data.total_sessions}</div>
            </div>
            
            <div className="glass-card p-8 bg-white border-slate-200 group hover:border-primary/20 transition-all">
                <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500 group-hover:text-white transition-colors duration-500">
                    <Activity size={24} />
                </div>
                <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">COMPLETION RATE</h3>
                <div className="text-4xl font-black text-slate-900 tracking-tight">{data.completion_rate}%</div>
            </div>

            <div className="glass-card p-8 bg-white border-slate-200 group hover:border-primary/20 transition-all">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-500">
                    <Award size={24} />
                </div>
                <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">AVG. CONFIDENCE</h3>
                <div className="text-4xl font-black text-slate-900 tracking-tight">{Math.round(data.average_confidence * 100)}%</div>
            </div>

            <div className="glass-card p-8 bg-white border-slate-200 group hover:border-primary/20 transition-all">
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-500">
                    <Globe size={24} />
                </div>
                <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">LANGUAGES</h3>
                <div className="flex gap-2 flex-wrap mt-2">
                    {Object.entries(data.responses_by_language).map(([lang, count]) => (
                        <span key={lang} className="bg-slate-50 text-[10px] font-black px-2 py-1 rounded-md text-primary uppercase border border-slate-100">
                            {lang}: {count}
                        </span>
                    ))}
                </div>
            </div>
        </div>

        {/* Responses Table Area */}
        <section className="glass-card bg-white border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/40 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 font-headline uppercase tracking-tight">Submissions Feed</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.1em]">Real-time Insights • {data.sessions.length} sessions</p>
                </div>
                <div className="flex items-center gap-4">
                  <button className="p-3 text-slate-400 hover:text-primary transition-all bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <Filter size={20} />
                  </button>
                  <div className="h-10 w-px bg-slate-200"></div>
                  <div className="flex flex-col items-end">
                    <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Data Sync</div>
                    <div className="text-xs font-bold text-slate-400 uppercase">Status: Live</div>
                  </div>
                </div>
            </div>
            
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white border-b border-slate-100">
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Language</th>
                            {data.form.fields.map(f => (
                                <th key={f.id} className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] min-w-[250px]">
                                    {f.label}
                                </th>
                            ))}
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Started</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {data.sessions.length === 0 ? (
                            <tr>
                                <td colSpan={4 + data.form.fields.length} className="px-8 py-32 text-center">
                                    <div className="flex flex-col items-center gap-6">
                                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                        <MessageSquare size={40} className="text-slate-200" />
                                      </div>
                                      <p className="text-slate-400 font-black uppercase tracking-widest">No responses recorded yet.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : data.sessions.map(session => (
                            <tr key={session.id} className="hover:bg-slate-50 transition-all group border-l-4 border-transparent hover:border-primary">
                                <td className="px-8 py-8">
                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] ${
                                        session.status === 'completed' 
                                          ? 'bg-green-50 text-green-600 border border-green-100' 
                                          : 'bg-orange-50 text-orange-600 border border-orange-100'
                                    }`}>
                                        {session.status}
                                    </span>
                                </td>
                                <td className="px-8 py-8 font-black text-slate-500 text-xs tracking-widest uppercase">
                                    {session.respondent_language}
                                </td>
                                {data.form.fields.map(field => {
                                    const resp = session.responses.find(r => r.field_id === field.id);
                                    return (
                                        <td key={field.id} className="px-8 py-8">
                                            {resp ? (
                                                <div className="space-y-3">
                                                    <div className="text-base font-bold text-slate-900 leading-snug tracking-tight">
                                                        {typeof (resp.extracted_value || resp.value) === 'object' 
                                                          ? JSON.stringify(resp.extracted_value || resp.value) 
                                                          : String(resp.extracted_value || resp.value)}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                      <div className="flex-grow h-1 bg-slate-100 rounded-full overflow-hidden">
                                                        <div 
                                                          className={`h-full rounded-full transition-all duration-1000 ${resp.confidence > 0.8 ? 'bg-green-500' : 'bg-orange-500'}`}
                                                          style={{ width: `${resp.confidence * 100}%` }}
                                                        ></div>
                                                      </div>
                                                      <span className="text-[10px] font-black text-slate-400">{Math.round(resp.confidence * 100)}% CONF</span>
                                                      <button className="p-1.5 hover:text-primary text-slate-300 transition-colors" title="Listen to raw audio">
                                                        <Play size={14} fill="currentColor" />
                                                      </button>
                                                    </div>
                                                    <div className="text-xs text-slate-400 italic leading-relaxed line-clamp-1 group-hover:line-clamp-none transition-all duration-500">
                                                       "{resp.raw_transcript}"
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-1.5 w-8 bg-slate-100 rounded-full"></div>
                                            )}
                                        </td>
                                    );
                                })}
                                <td className="px-8 py-8 text-right font-black text-slate-400 text-[10px] uppercase tracking-widest whitespace-nowrap">
                                    {new Date(session.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
      </div>
    </Layout>
  );
};

export default ResponsesPage;
