import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mic, CheckCircle, Globe } from 'lucide-react';

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="home-container" style={{ textAlign: 'center', padding: '50px' }}>
      <h1>VoiceForm</h1>
      <p>The Multilingual Voice-First AI Form Platform</p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '40px 0' }}>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '10px', width: '200px' }}>
          <Mic size={40} color="#007bff" />
          <h3>Voice Driven</h3>
          <p>Talk naturally, we listen and extract data.</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '10px', width: '200px' }}>
          <Globe size={40} color="#28a745" />
          <h3>Multilingual</h3>
          <p>Speak in your native tongue (English, Hindi, etc).</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '10px', width: '200px' }}>
          <CheckCircle size={40} color="#ffc107" />
          <h3>AI Extraction</h3>
          <p>Zero manual typing for respondents.</p>
        </div>
      </div>

      {user ? (
        <div>
          <p>Welcome, {user.email}!</p>
          <Link to="/dashboard" style={{ marginRight: '10px' }}>Go to Dashboard</Link>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
          <Link to="/register">Register</Link>
        </div>
      )}
    </div>
  );
};

export default HomePage;
