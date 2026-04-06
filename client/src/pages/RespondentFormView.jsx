import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Mic, Globe, Play, Loader2, Edit3, Save, 
  CheckCircle2, ChevronLeft, ArrowRight, Info, AlertCircle
} from 'lucide-react';
import useVoiceSession from '../hooks/useVoiceSession';

const RespondentFormView = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState(null);
  const [session, setSession] = useState(null);
  const [starting, setStarting] = useState(false);
  
  // Modes: 'selection' | 'voice' | 'manual' | 'completed'
  const [mode, setMode] = useState('selection');
  const [manualData, setManualData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  const fetchForm = React.useCallback(async () => {
    setIsTranslating(true);
    try {
      const url = language 
        ? `${backendUrl}/api/v1/public/forms/${formId}?lang=${language}`
        : `${backendUrl}/api/v1/public/forms/${formId}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Form not found');
      const data = await response.json();
      
      setForm(data);
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

  const submitResponses = React.useCallback(async (responsesToSubmit) => {
    setSubmitting(true);
    try {
      const response = await fetch(`${backendUrl}/api/v1/public/forms/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          respondent_language: language,
          responses: responsesToSubmit
        })
      });
      
      if (!response.ok) throw new Error('Failed to submit form');
      setMode('completed');
    } catch {
      alert('Could not submit form. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  }, [backendUrl, formId, language]);

  const {
    currentFieldIndex,
    status,
    transcript,
    error: voiceError,
    responses: voiceResponses
  } = useVoiceSession(
    mode === 'voice' ? form : null,
    session?.session_id,
    language,
    (finalResponses) => submitResponses(finalResponses)
  );

  const handleStartSession = async (targetMode) => {
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

  const handleManualSubmit = (e) => {
    e.preventDefault();
    submitResponses(manualData);
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
    const currentField = form?.fields[currentFieldIndex];
    
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', padding: '20px', background: '#000', color: '#fff' }}>
        <div className="animate-fade-in container" style={{ maxWidth: '600px', textAlign: 'center', width: '100%' }}>
            {voiceError && (
                <div style={{ background: 'rgba(255, 68, 68, 0.1)', border: '1px solid #ff4444', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px', color: '#ff4444' }}>
                    <AlertCircle size={20} />
                    <p>{voiceError}</p>
                </div>
            )}

            <div style={{ marginBottom: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
                QUESTION {currentFieldIndex + 1} OF {form?.fields.length}
            </div>
            
            <h1 style={{ fontWeight: '500', marginBottom: '48px', lineHeight: '1.2', fontSize: '2.5rem' }}>
                {currentField?.question_phrasing}
            </h1>

            <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '48px' }}>
                {status === 'listening' ? (
                    <div className="voice-wave">
                        <div className="voice-bar" style={{ background: '#fff' }}></div>
                        <div className="voice-bar" style={{ background: '#fff' }}></div>
                        <div className="voice-bar" style={{ background: '#fff' }}></div>
                        <div className="voice-bar" style={{ background: '#fff' }}></div>
                        <div className="voice-bar" style={{ background: '#fff' }}></div>
                    </div>
                ) : status === 'processing' || status === 'confirming' || status === 'speaking' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <Loader2 className="animate-spin" size={40} color="#fff" />
                        <span style={{ fontSize: '0.8rem', opacity: 0.5, textTransform: 'uppercase' }}>
                            {status === 'speaking' ? 'Speaking' : status === 'confirming' ? 'Confirming' : 'Analyzing'}
                        </span>
                    </div>
                ) : (
                    <div style={{ width: '12px', height: '12px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%' }}></div>
                )}
            </div>
            
            <div style={{ minHeight: '1.5em', marginBottom: '64px' }}>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.5rem', fontStyle: 'italic' }}>
                    {transcript || (status === 'listening' ? '...' : '')}
                </p>
            </div>
            
            <button 
                onClick={() => setMode('manual')} 
                className="mobile-full-width" 
                style={{ background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 24px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
            >
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
    <div className="mobile-padding-sm" style={{ minHeight: '100vh', background: 'var(--bg-secondary)', padding: '64px 20px' }}>
      <div className="animate-fade-in container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'inline-flex', padding: '12px 20px', background: 'white', border: '1px solid var(--border-subtle)', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '24px', alignItems: 'center', gap: '8px' }}>
                <Info size={16} /> AI-Powered Voice Form
            </div>
            <h1 style={{ lineHeight: '1.1', marginBottom: '16px', letterSpacing: '-0.04em', fontSize: '3rem' }}>{form.title}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 40px' }}>{form.description}</p>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }} className="mobile-stack">
                <button 
                    className="btn-primary"
                    onClick={() => handleStartSession('voice')} 
                    disabled={starting || isTranslating}
                    style={{ height: '64px', fontSize: '1.1rem', padding: '0 32px' }}
                >
                    {starting ? <Loader2 className="animate-spin" /> : <><Mic size={20} /> Start Voice Interview</>}
                </button>
                <button 
                    className="btn-secondary"
                    onClick={() => handleStartSession('manual')} 
                    disabled={starting || isTranslating}
                    style={{ height: '64px', fontSize: '1.1rem', padding: '0 32px' }}
                >
                    Fill manually <ArrowRight size={18} />
                </button>
            </div>
        </header>

        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '32px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '12px' }}>
                    <Globe size={20} />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Interview Language
                    </label>
                    <select 
                        className="input-minimal"
                        value={language || ''} 
                        onChange={(e) => setLanguage(e.target.value)}
                        style={{ border: 'none', padding: 0, height: 'auto', fontSize: '1.1rem', fontWeight: '600' }}
                        disabled={isTranslating}
                    >
                        <option value="en">English</option>
                        <option value="hi">Hindi (हिंदी)</option>
                        <option value="ml">Malayalam (മലയാളം)</option>
                        <option value="es">Spanish (Español)</option>
                    </select>
                </div>
                {isTranslating && <Loader2 size={20} className="animate-spin" />}
            </div>

            <div style={{ opacity: 0.6, pointerEvents: 'none' }}>
                <h3 style={{ marginBottom: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>Form Preview</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {form.fields.map((field) => (
                        <div key={field.id} className="card" style={{ padding: '24px' }}>
                            <p style={{ fontWeight: '600', marginBottom: '8px' }}>{field.question_phrasing}</p>
                            <div style={{ height: '40px', background: 'var(--bg-secondary)', borderRadius: '8px' }}></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RespondentFormView;
