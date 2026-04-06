import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mic, CheckCircle, Globe, ArrowRight, Layers, Zap } from 'lucide-react';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 20px', textAlign: 'center' }}>
      <div className="animate-fade-in container" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'inline-flex', padding: '8px 16px', background: 'var(--bg-secondary)', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '24px', color: 'var(--text-secondary)' }}>
            <Zap size={14} style={{ marginRight: '8px' }} /> NOW POWERED BY GEMINI 2.5 FLASH
        </div>
        
        <h1 style={{ lineHeight: '1', marginBottom: '24px', letterSpacing: '-0.05em' }}>
            Forms that <span style={{ color: 'var(--text-secondary)' }}>listen.</span>
        </h1>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px', lineHeight: '1.5' }}>
            Transform static forms into intelligent voice conversations. 
            Break language barriers and collect data at the speed of speech.
        </p>

        <div className="mobile-stack" style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '80px' }}>
            <Link to="/register" className="btn-primary mobile-full-width" style={{ height: '56px', padding: '0 32px', fontSize: '1.1rem', textDecoration: 'none' }}>
                Get Started for Free
            </Link>
            <Link to="/login" className="btn-secondary mobile-full-width" style={{ height: '56px', padding: '0 32px', fontSize: '1.1rem', textDecoration: 'none' }}>
                Sign In
            </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', textAlign: 'left' }}>
            <div className="card" style={{ padding: '32px' }}>
                <Mic size={24} style={{ marginBottom: '16px' }} />
                <h3 style={{ marginBottom: '8px' }}>Voice First</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Natural dialogue extraction with zero manual typing required.</p>
            </div>
            <div className="card" style={{ padding: '32px' }}>
                <Globe size={24} style={{ marginBottom: '16px' }} />
                <h3 style={{ marginBottom: '8px' }}>Multilingual</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Real-time translation across 50+ languages instantly.</p>
            </div>
            <div className="card" style={{ padding: '32px' }}>
                <Layers size={24} style={{ marginBottom: '16px' }} />
                <h3 style={{ marginBottom: '8px' }}>Structured Data</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>AI-driven normalization directly into your existing database.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
