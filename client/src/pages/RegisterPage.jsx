import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error } = await register(email, password);
      if (error) throw error;
      
      if (data?.session) {
        navigate('/');
      } else {
        // Fallback if auto-login is disabled in Supabase
        navigate('/login');
      }
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
        
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Create Account</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Start building intelligent voice forms today.</p>
        
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
                placeholder="Minimum 6 characters"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', height: '52px', fontSize: '1rem' }}>
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><UserPlus size={18} /> Create Account</>}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '32px', padding: '20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={14} color="#000" /> No credit card required
                </li>
                <li style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={14} color="#000" /> Instant AI form generation
                </li>
            </ul>
        </div>
        
        <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: '#000', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
