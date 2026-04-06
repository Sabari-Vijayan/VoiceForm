import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Mic, Globe, Play, Loader2, Edit3, Save, 
  CheckCircle2, ChevronLeft, ArrowRight, Info
} from 'lucide-react';

const RespondentFormView = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState(null);
  const [_session, setSession] = useState(null);
  const [starting, setStarting] = useState(false);
  
  // Modes: 'selection' | 'voice' | 'manual' | 'completed'
  const [mode, setMode] = useState('selection');
  const [manualData, setManualData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  const fetchForm = React.useCallback(async () => {
    // Only set full loading for first fetch
    setIsTranslating(true);
    
    try {
      const url = language 
        ? `${backendUrl}/api/v1/public/forms/${formId}?lang=${language}`
        : `${backendUrl}/api/v1/public/forms/${formId}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Form not found');
      const data = await response.json();
      
      setForm(data);
      // If language was not set, initialize it from creator_language
      if (!language) {
          setLanguage(data.creator_language);
      }
    } catch {
      setError('This form is not available or does not exist.');
    } finally {
      setLoading(false);
      setIsTranslating(false);
    }
  }, [formId, language, backendUrl]);

  useEffect(() => {
    fetchForm();
  }, [fetchForm]);

  const handleStartSession = async (targetMode) => {
    // For manual mode, we don't start a DB session until the user actually submits.
    if (targetMode === 'manual') {
        setMode('manual');
        return;
    }

    setStarting(true);
    try {
      const response = await fetch(`${backendUrl}/api/v1/public/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_id: formId,
          respondent_language: language
        })
      });
      if (!response.ok) throw new Error('Failed to start session');
      const sessionData = await response.json();
      setSession(sessionData);
      setMode(targetMode);
    } catch {
      alert('Error starting session. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await fetch(`${backendUrl}/api/v1/public/forms/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          respondent_language: language,
          responses: manualData
        })
      });
      
      if (!response.ok) throw new Error('Failed to submit form');
      setMode('completed');
    } catch {
      alert('Could not submit form. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" size={48} color="var(--accent-black)" /></div>;
  if (error) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
        <div className="animate-fade-in">
            <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Oops.</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
    </div>
  );

  // --- COMPLETED STATE ---
  if (mode === 'completed') {
      return (
          <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <div className="animate-fade-in container" style={{ maxWidth: '500px', textAlign: 'center' }}>
                  <div style={{ background: 'var(--bg-secondary)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
                    <CheckCircle2 size={40} color="#000" />
                  </div>
                  <h1>All set.</h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '40px' }}>Thank you for your time. Your responses have been securely recorded.</p>
                  <button onClick={() => window.location.reload()} className="btn-primary mobile-full-width" style={{ width: '100%' }}>Return to Start</button>
              </div>
          </div>
      );
  }

  // --- VOICE MODE ---
  if (mode === 'voice') {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', padding: '20px', background: '#000', color: '#fff' }}>
        <div className="animate-fade-in container" style={{ maxWidth: '600px', textAlign: 'center', width: '100%' }}>
            <div style={{ marginBottom: '48px' }}>
                <div className="voice-wave">
                    <div className="voice-bar" style={{ background: '#fff' }}></div>
                    <div className="voice-bar" style={{ background: '#fff' }}></div>
                    <div className="voice-bar" style={{ background: '#fff' }}></div>
                    <div className="voice-bar" style={{ background: '#fff' }}></div>
                    <div className="voice-bar" style={{ background: '#fff' }}></div>
                </div>
            </div>
            
            <h2 style={{ fontWeight: '500', marginBottom: '24px', lineHeight: '1.2' }}>Listening...</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', marginBottom: '64px' }}>Please speak naturally in {language.toUpperCase()}</p>
            
            <button onClick={() => setMode('manual')} className="mobile-full-width" style={{ background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 24px', borderRadius: 'var(--radius-md)' }}>
                Switch to Typing
            </button>
        </div>
      </div>
    );
  }

  // --- MANUAL MODE ---
  if (mode === 'manual') {
      return (
        <div className="mobile-padding-sm" style={{ minHeight: '100vh', background: 'var(--bg-secondary)', padding: '64px 20px' }}>
            <div className="animate-fade-in container" style={{ maxWidth: '600px', margin: '0 auto', padding: 0 }}>
                <button onClick={() => setMode('selection')} style={{ background: 'transparent', color: 'var(--text-secondary)', marginBottom: '32px', padding: 0 }}>
                    <ChevronLeft size={18} /> Back to selection
                </button>
                
                <header style={{ marginBottom: '48px' }}>
                    <h1 style={{ marginBottom: '12px' }}>{form.title}</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{form.description}</p>
                </header>
                
                <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {form.fields.map((field) => (
                        <div key={field.id} className="card mobile-padding-sm" style={{ padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
                            <label style={{ display: 'block', fontWeight: '600', fontSize: '1.1rem', marginBottom: '20px' }}>
                                {field.question_phrasing} {field.required && <span style={{ color: '#ff4444' }}>*</span>}
                            </label>
                            
                            {field.type === 'choice' ? (
                                <select 
                                    className="input-minimal"
                                    required={field.required}
                                    onChange={(e) => setManualData({...manualData, [field.id]: e.target.value})}
                                >
                                    <option value="">Select an option...</option>
                                    {field.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                                </select>
                            ) : field.type === 'number' ? (
                                <input 
                                    className="input-minimal"
                                    type="number"
                                    placeholder="Enter a number..."
                                    required={field.required}
                                    onChange={(e) => setManualData({...manualData, [field.id]: e.target.value})}
                                />
                            ) : (
                                <input 
                                    className="input-minimal"
                                    type={field.type === 'email' ? 'email' : 'text'}
                                    placeholder="Type your answer..."
                                    required={field.required}
                                    onChange={(e) => setManualData({...manualData, [field.id]: e.target.value})}
                                />
                            )}
                        </div>
                    ))}
                    
                    <button 
                        type="submit" 
                        className="btn-primary"
                        disabled={submitting}
                        style={{ height: '64px', fontSize: '1.1rem', marginTop: '20px' }}
                    >
                        {submitting ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Submit Response</>}
                    </button>
                </form>
            </div>
        </div>
      );
  }

  // --- SELECTION (LANDING) STATE ---
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '64px 20px', background: 'white' }}>
      <div className="animate-fade-in container" style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: '12px 20px', background: 'var(--bg-secondary)', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '32px', alignItems: 'center', gap: '8px' }}>
            <Info size={16} /> AI-Powered Voice Form
        </div>
        
        <h1 style={{ lineHeight: '1.1', marginBottom: '16px', letterSpacing: '-0.04em' }}>{form.title}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '48px', lineHeight: '1.5' }}>{form.description}</p>
        
        <div style={{ background: 'var(--bg-secondary)', padding: '32px', borderRadius: 'var(--radius-lg)', marginBottom: '48px', textAlign: 'left', position: 'relative' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: '600', fontSize: '0.9rem' }}>
                <Globe size={16} /> PREFERRED LANGUAGE
                {isTranslating && <Loader2 size={14} className="animate-spin" style={{ marginLeft: 'auto' }} />}
            </label>
            <select 
                className="input-minimal"
                value={language || ''} 
                onChange={(e) => setLanguage(e.target.value)}
                style={{ border: '1px solid var(--border-strong)', opacity: isTranslating ? 0.6 : 1 }}
                disabled={isTranslating}
            >
                <option value="en">English</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="ml">Malayalam (മലയാളം)</option>
                <option value="es">Spanish (Español)</option>
                {language && !['en', 'hi', 'ml', 'es'].includes(language) && (
                    <option value={language}>{language.toUpperCase()}</option>
                )}
            </select>
        </div>

        <div className="mobile-stack" style={{ display: 'flex', gap: '16px' }}>
            <button 
                className="btn-primary mobile-full-width"
                onClick={() => handleStartSession('voice')} 
                disabled={starting}
                style={{ height: '72px', fontSize: '1.25rem', width: '100%', borderRadius: 'var(--radius-lg)' }}
            >
                {starting ? <Loader2 className="animate-spin" /> : <><Mic size={24} strokeWidth={2.5} /> Start Voice Interview</>}
            </button>

            <button 
                className="btn-secondary mobile-full-width"
                onClick={() => handleStartSession('manual')} 
                disabled={starting}
                style={{ height: '64px', fontSize: '1.1rem', width: '100%', border: 'none', background: 'transparent' }}
            >
                Or fill manually <ArrowRight size={18} style={{ marginLeft: '8px' }} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default RespondentFormView;
