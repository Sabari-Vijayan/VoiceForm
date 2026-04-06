import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Layout, MessageSquare, Clock, Loader2, Send } from 'lucide-react';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');

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
      // Optionally navigate to a detail view or stay on dashboard
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
        <p style={{ color: '#666', marginBottom: '20px' }}>Describe the form you want (e.g., "A customer satisfaction survey for a pizza delivery service with rating and feedback").</p>
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
            <p style={{ color: '#666' }}>No forms yet. Use the AI generator above to create your first one!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {forms.map(form => (
              <div key={form.id} style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '12px', position: 'relative' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>{form.title}</h4>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>{form.description || 'No description'}</p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '0.85rem', color: '#888', marginBottom: '20px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={14} /> {new Date(form.created_at).toLocaleDateString()}</span>
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
                    View Results
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
