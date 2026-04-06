import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, Download, Loader2, MessageSquare, 
  BarChart3, Users, CheckCircle2, Globe, 
  Info, Calendar, ChevronRight
} from 'lucide-react';

const ResponsesPage = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { user: _user } = useAuth();
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
      s.responses.forEach(r => {
        responseMap[r.field_id] = r.value;
      });
      
      return [
        s.id,
        s.respondent_language,
        s.status,
        new Date(s.started_at).toLocaleString(),
        ...data.form.fields.map(f => responseMap[f.id] || '')
      ];
    });
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `responses_${formId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <Loader2 className="animate-spin" size={40} />
        <p style={{ color: 'var(--text-secondary)' }}>Analyzing responses...</p>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
        <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Error</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>{error}</p>
            <button onClick={() => navigate('/dashboard')} className="btn-primary">Back to Dashboard</button>
        </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', padding: '40px 20px' }}>
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', color: 'var(--text-secondary)', marginBottom: '16px', padding: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>
                <h1 style={{ fontSize: '2.25rem', marginBottom: '8px' }}>{data.form.title}</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Review and analyze respondent data.</p>
            </div>
            <button onClick={exportCSV} className="btn-secondary" style={{ background: 'white' }}>
                <Download size={18} /> Export CSV
            </button>
        </header>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '48px' }}>
            <div className="card" style={{ padding: '24px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} /> TOTAL RESPONSES
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{data.total_sessions}</div>
            </div>
            <div className="card" style={{ padding: '24px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} /> COMPLETION RATE
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{data.completion_rate}%</div>
            </div>
            <div className="card" style={{ padding: '24px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart3 size={16} /> AVG. CONFIDENCE
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{data.average_confidence}</div>
            </div>
            <div className="card" style={{ padding: '24px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={16} /> LANGUAGES
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {Object.entries(data.responses_by_language).map(([lang, count]) => (
                        <div key={lang} style={{ background: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: '100px', fontSize: '0.9rem', fontWeight: '600' }}>
                            {lang.toUpperCase()}: {count}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Responses Table */}
        <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Completed Submissions</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Showing {data.sessions.length} of {data.total_sessions} total sessions</div>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-secondary)' }}>
                            <th style={{ padding: '16px 24px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>STATUS</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>LANGUAGE</th>
                            {data.form.fields.map(f => (
                                <th key={f.id} style={{ padding: '16px 24px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', minWidth: '150px' }}>
                                    {f.label.toUpperCase()}
                                </th>
                            ))}
                            <th style={{ padding: '16px 24px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>STARTED</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.sessions.length === 0 ? (
                            <tr>
                                <td colSpan={4 + data.form.fields.length} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    No responses recorded yet.
                                </td>
                            </tr>
                        ) : data.sessions.map(session => (
                            <tr key={session.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{ 
                                        padding: '4px 8px', 
                                        borderRadius: '4px', 
                                        fontSize: '0.75rem', 
                                        fontWeight: '700',
                                        background: session.status === 'completed' ? '#e6fffa' : '#fff5f5',
                                        color: session.status === 'completed' ? '#2c7a7b' : '#c53030'
                                    }}>
                                        {session.status.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px', fontSize: '0.9rem', fontWeight: '500' }}>
                                    {session.respondent_language.toUpperCase()}
                                </td>
                                {data.form.fields.map(field => {
                                    const resp = session.responses.find(r => r.field_id === field.id);
                                    return (
                                        <td key={field.id} style={{ padding: '16px 24px' }}>
                                            {resp ? (
                                                <div title={resp.raw_transcript}>
                                                    <div style={{ fontSize: '0.95rem' }}>
                                                        {typeof resp.value === 'object' ? JSON.stringify(resp.value) : String(resp.value)}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                        Conf: {Math.round(resp.confidence * 100)}%
                                                    </div>
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--border-strong)' }}>—</span>
                                            )}
                                        </td>
                                    );
                                })}
                                <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                    {new Date(session.started_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
      </div>
    </div>
  );
};

export default ResponsesPage;
