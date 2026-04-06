import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Layout, MessageSquare, Clock, Loader2, Send, Eye, X, ChevronRight } from 'lucide-react';

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

  useEffect(() => {
    fetchForms();
  }, [user]);

  const fetchForms = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${backendUrl}/api/v1/creator/forms?creator_id=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch forms');
      const data = await response.json();
      setForms(data);
    } catch (err) {
      console.error(err);
      setError('Could not load your forms.');
    } finally {
      setLoading(false);
    }
  };

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
    } catch (err) {
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
    <div className="dashboard-container" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h2>Creator Dashboard</h2>
          <p style={{ color: '#666' }}>Manage your voice forms and view responses.</p>
        </div>
        <button onClick={logout} style={{ backgroundColor: '#dc3545' }}>Logout</button>
      </header>

      {/* AI Generator Section */}
      <section style={{ backgroundColor: '#f8f9fa', padding: '30px', borderRadius: '15px', marginBottom: '40px', border: '1px solid #e9ecef' }}>
        <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Plus size={24} color="#007bff" /> Generate New Form with AI
        </h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>Describe the form you want (e.g., "A coffee shop feedback form").</p>
        <form onSubmit={handleGenerate} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Describe your form..." 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={generating}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ced4da' }}
          />
          <button type="submit" disabled={generating} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#007bff' }}>
            {generating ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </form>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </section>

      {/* Forms List Section */}
      <section>
        <h3 style={{ marginBottom: '20px' }}>Your Forms</h3>
        {loading ? (
          <p>Loading forms...</p>
        ) : forms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', border: '2px dashed #ddd', borderRadius: '15px' }}>
            <Layout size={48} color="#ccc" style={{ marginBottom: '15px' }} />
            <p style={{ color: '#666' }}>No forms yet. Generate one above!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {forms.map(form => (
              <div key={form.id} style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>{form.title}</h4>
                    <button onClick={() => setSelectedForm(form)} style={{ padding: '4px', backgroundColor: 'transparent', color: '#666' }} title="Preview Fields">
                        <Eye size={18} />
                    </button>
                </div>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>{form.description || 'No description'}</p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '0.85rem', color: '#888', marginBottom: '20px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={14} /> {new Date().toLocaleDateString()}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MessageSquare size={14} /> 0 Responses</span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => copyLink(form.id)}
                    style={{ flex: 1, padding: '8px', fontSize: '0.8rem', backgroundColor: '#6c757d' }}
                  >
                    Copy Link
                  </button>
                  <button 
                    onClick={() => navigate(`/dashboard/responses/${form.id}`)}
                    style={{ flex: 1, padding: '8px', fontSize: '0.8rem', backgroundColor: '#28a745' }}
                  >
                    Results
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Preview Modal */}
      {selectedForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
                <button onClick={() => setSelectedForm(null)} style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: 'transparent', color: '#000' }}>
                    <X size={24} />
                </button>
                <h3>Form Preview: {selectedForm.title}</h3>
                <p style={{ color: '#666', marginBottom: '20px' }}>{selectedForm.description}</p>
                
                <div style={{ textAlign: 'left' }}>
                    {selectedForm.fields?.map((field, idx) => (
                        <div key={idx} style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                            <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ChevronRight size={14} color="#007bff" />
                                {field.question_phrasing}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '5px' }}>
                                Type: <span style={{ textTransform: 'uppercase' }}>{field.type}</span> 
                                {field.required && ' • Required'}
                            </div>
                            {field.options && (
                                <div style={{ marginTop: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                    {field.options.map((opt, i) => (
                                        <span key={i} style={{ fontSize: '0.75rem', backgroundColor: '#f1f3f5', padding: '2px 8px', borderRadius: '4px' }}>{opt}</span>
                                    ))}
                                </div>
                            )}
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
