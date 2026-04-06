import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Layout, MessageSquare, Clock, Loader2, 
  Send, Eye, X, ChevronRight, Settings, LogOut, 
  Search, ExternalLink, Copy
} from 'lucide-react';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');
  const [selectedForm, setSelectedForm] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  const fetchForms = React.useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch(`${backendUrl}/api/v1/creator/forms?creator_id=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch forms');
      const data = await response.json();
      setForms(data);
    } catch {
      setError('Could not load your forms.');
    } finally {
      setLoading(false);
    }
  }, [user, backendUrl]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setGenerating(true);
    setError('');
    
    try {
      const response = await fetch(`${backendUrl}/api/v1/creator/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          creator_id: user.id
        })
      });

      if (!response.ok) throw new Error('AI Generation failed');
      
      const newForm = await response.json();
      setForms([newForm, ...forms]);
      setPrompt('');
    } catch {
      setError('AI generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = (id) => {
    const link = `${window.location.origin}/f/${id}`;
    navigator.clipboard.writeText(link);
    alert('Public form link copied to clipboard!');
  };

  return (
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      {/* Sidebar */}
      <aside className="mobile-hide" style={{ width: '260px', background: 'white', borderRight: '1px solid var(--border-subtle)', padding: '32px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' }}>
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.03em' }}>VoiceForm</h1>
        </div>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button className="btn-secondary" style={{ justifyContent: 'flex-start', border: 'none', background: 'var(--accent-gray)', padding: '10px 16px' }}>
            <Layout size={18} /> My Forms
          </button>
          <button className="btn-secondary" style={{ justifyContent: 'flex-start', border: 'none', background: 'transparent', padding: '10px 16px', color: 'var(--text-secondary)' }}>
            <Settings size={18} /> Settings
          </button>
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', wordBreak: 'break-all' }}>
            {user?.email}
          </div>
          <button onClick={logout} className="btn-secondary" style={{ width: '100%', fontSize: '0.9rem', padding: '8px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="mobile-full-width" style={{ marginLeft: '260px', flex: 1, padding: '64px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          <header style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Dashboard</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Welcome back. Here's what's happening with your forms.</p>
            </div>
            <button onClick={logout} className="btn-secondary mobile-hide" style={{ border: 'none', color: 'var(--text-secondary)' }}>
                <LogOut size={18} />
            </button>
          </header>

          {/* AI Prompt Area */}
          <section className="animate-fade-in mobile-padding-sm" style={{ background: 'white', border: '1px solid var(--border-strong)', padding: '40px', borderRadius: 'var(--radius-lg)', marginBottom: '64px', boxShadow: 'var(--shadow-md)' }}>
            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Plus size={20} strokeWidth={3} /> Create with AI
            </h3>
            <form onSubmit={handleGenerate} style={{ position: 'relative' }}>
              <input 
                className="input-minimal"
                placeholder="Describe the form you want to build..." 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={generating}
                style={{ paddingRight: '140px', height: '56px' }}
              />
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={generating || !prompt.trim()}
                style={{ position: 'absolute', right: '6px', top: '6px', bottom: '6px', height: 'auto', padding: '0 24px' }}
              >
                {generating ? <Loader2 className="animate-spin" size={18} /> : 'Generate'}
              </button>
            </form>
            {error && <p style={{ color: '#dc3545', marginTop: '16px', fontSize: '0.9rem' }}>{error}</p>}
          </section>

          {/* Forms List */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3>Recent Forms</h3>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{forms.length} total</div>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}><Loader2 className="animate-spin" size={32} /></div>
            ) : forms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px', border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-lg)' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No forms found. Start by generating one above.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {forms.map(form => (
                  <div key={form.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '1.1rem' }}>{form.title}</h4>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => setSelectedForm(form)} style={{ padding: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                                <Eye size={16} color="var(--text-secondary)" />
                            </button>
                            <button onClick={() => copyLink(form.id)} style={{ padding: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                                <Copy size={16} color="var(--text-secondary)" />
                            </button>
                        </div>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', flex: 1, marginBottom: '24px' }}>
                      {form.description || 'No description provided.'}
                    </p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {new Date().toLocaleDateString()}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MessageSquare size={14} /> 0 responses</span>
                      </div>
                      <button 
                        onClick={() => navigate(`/dashboard/responses/${form.id}`)}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                      >
                        Analytics <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Preview Modal */}
      {selectedForm && (
        <div className="animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: 'var(--radius-lg)', maxWidth: '600px', width: '90%', maxHeight: '85vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                <button onClick={() => setSelectedForm(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent' }}>
                    <X size={24} />
                </button>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>{selectedForm.title}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>{selectedForm.description}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {selectedForm.fields?.map((field, idx) => (
                        <div key={idx} style={{ padding: '20px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
                            <div style={{ fontWeight: '600', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                <span style={{ background: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', border: '1px solid var(--border-strong)' }}>{idx + 1}</span>
                                {field.question_phrasing}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '12px', display: 'flex', gap: '12px' }}>
                                <span style={{ background: 'white', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>{field.type.toUpperCase()}</span>
                                {field.required && <span style={{ color: '#000', fontWeight: '600' }}>REQUIRED</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
