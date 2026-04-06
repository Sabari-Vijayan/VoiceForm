import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Loader2, ArrowLeft } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await login(email, password);
      if (error) throw error;
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--bg-secondary)' }}>
      <div className="animate-fade-in" style={{ maxWidth: '400px', width: '100%', background: 'white', padding: '40px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-strong)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '32px' }}>
            <ArrowLeft size={16} /> Back to home
        </Link>
        
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Sign In</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Welcome back to VoiceForm.</p>
        
        {error && <div style={{ padding: '12px', background: '#fff5f5', border: '1px solid #feb2b2', color: '#c53030', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '0.9rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>EMAIL ADDRESS</label>
            <input 
                type="email" 
                className="input-minimal"
                placeholder="you@example.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>PASSWORD</label>
            <input 
                type="password" 
                className="input-minimal"
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', height: '52px', fontSize: '1rem', marginTop: '12px' }}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>
        
        <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          New here? <Link to="/register" style={{ color: '#000', fontWeight: '600', textDecoration: 'none' }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
