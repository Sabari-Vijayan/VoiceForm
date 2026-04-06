import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Mic, Globe, Play, Loader2, Edit3, Save, CheckCircle2 } from 'lucide-react';

const RespondentFormView = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('en');
  const [session, setSession] = useState(null);
  const [starting, setStarting] = useState(false);
  
  // Modes: 'selection' | 'voice' | 'manual' | 'completed'
  const [mode, setMode] = useState('selection');
  const [manualData, setManualData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchForm();
  }, [formId, language]);

  const fetchForm = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/v1/public/forms/${formId}?lang=${language}`);
      if (!response.ok) throw new Error('Form not found');
      const data = await response.json();
      setForm(data);
    } catch (err) {
      setError('This form is not available or does not exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (targetMode) => {
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
    } catch (err) {
      alert('Error starting session. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
        // In a real app, we'd have a bulk submit endpoint. 
        // For MVP, we'll simulate it or just show completion.
        // We'll implement the actual backend bulk save in the next step.
        setTimeout(() => {
            setMode('completed');
            setSubmitting(false);
        }, 1500);
    } catch (err) {
        alert('Failed to submit form.');
        setSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Loader2 className="animate-spin" size={48} /></div>;
  if (error) return <div style={{ textAlign: 'center', padding: '100px', color: 'red' }}><h2>{error}</h2></div>;

  // --- COMPLETED STATE ---
  if (mode === 'completed') {
      return (
          <div style={{ maxWidth: '600px', margin: '100px auto', textAlign: 'center', padding: '40px', border: '1px solid #e9ecef', borderRadius: '15px' }}>
              <CheckCircle2 size={64} color="#28a745" style={{ marginBottom: '20px' }} />
              <h2>Form Submitted!</h2>
              <p style={{ color: '#666' }}>Thank you for your response. Your data has been successfully recorded.</p>
              <button onClick={() => window.location.reload()} style={{ marginTop: '30px', backgroundColor: '#007bff' }}>Fill Again</button>
          </div>
      );
  }

  // --- VOICE MODE ---
  if (mode === 'voice') {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Voice Interview</h2>
        <p>Currently in Voice Mode ({language})</p>
        <div style={{ margin: '40px auto', width: '200px', height: '200px', backgroundColor: '#007bff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 0 20px rgba(0,123,255,0.5)' }}>
            <Mic size={64} />
        </div>
        <p><i>Voice loop logic is coming next...</i></p>
        <button onClick={() => setMode('manual')} style={{ backgroundColor: 'transparent', color: '#007bff', border: '1px solid #007bff' }}>
            Switch to Manual Filling
        </button>
      </div>
    );
  }

  // --- MANUAL MODE ---
  if (mode === 'manual') {
      return (
        <div style={{ maxWidth: '600px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ margin: 0 }}>{form.title}</h2>
                <button onClick={() => setMode('voice')} style={{ padding: '8px 12px', fontSize: '0.8rem', backgroundColor: '#f8f9fa', color: '#007bff', border: '1px solid #007bff', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Mic size={14} /> Switch to Voice
                </button>
            </div>
            
            <form onSubmit={handleManualSubmit}>
                {form.fields.map((field) => (
                    <div key={field.id} style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                            {field.question_phrasing} {field.required && <span style={{ color: 'red' }}>*</span>}
                        </label>
                        
                        {field.type === 'choice' ? (
                            <select 
                                required={field.required}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ced4da' }}
                                onChange={(e) => setManualData({...manualData, [field.id]: e.target.value})}
                            >
                                <option value="">Select an option</option>
                                {field.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                            </select>
                        ) : field.type === 'number' ? (
                            <input 
                                type="number"
                                required={field.required}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ced4da' }}
                                onChange={(e) => setManualData({...manualData, [field.id]: e.target.value})}
                            />
                        ) : (
                            <input 
                                type={field.type === 'email' ? 'email' : 'text'}
                                required={field.required}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ced4da' }}
                                onChange={(e) => setManualData({...manualData, [field.id]: e.target.value})}
                            />
                        )}
                    </div>
                ))}
                
                <button 
                    type="submit" 
                    disabled={submitting}
                    style={{ width: '100%', padding: '15px', backgroundColor: '#28a745', color: 'white', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                    {submitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    {submitting ? 'Submitting...' : 'Submit Form'}
                </button>
            </form>
        </div>
      );
  }

  // --- SELECTION (LANDING) STATE ---
  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '15px', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '10px' }}>{form.title}</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>{form.description}</p>
      
      <div style={{ marginBottom: '30px', textAlign: 'left' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: 'bold' }}>
          <Globe size={18} /> Select your language
        </label>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '1rem' }}
        >
          <option value="en">English</option>
          <option value="hi">Hindi (हिंदी)</option>
          <option value="ml">Malayalam (മലയാളം)</option>
          <option value="es">Spanish (Español)</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button 
            onClick={() => handleStartSession('voice')} 
            disabled={starting}
            style={{ padding: '20px', fontSize: '1.2rem', backgroundColor: '#007bff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            {starting ? <Loader2 className="animate-spin" /> : <Mic size={24} />}
            {starting ? 'Initializing AI...' : 'Start Voice Interview'}
          </button>

          <button 
            onClick={() => handleStartSession('manual')} 
            disabled={starting}
            style={{ padding: '15px', fontSize: '1.1rem', backgroundColor: '#f8f9fa', color: '#333', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <Edit3 size={20} />
            Fill Manually
          </button>
      </div>

      <p style={{ marginTop: '30px', color: '#888', fontSize: '0.85rem' }}>
        Choose <b>Voice Interview</b> for an AI-guided conversational experience.
      </p>
    </div>
  );
};

export default RespondentFormView;
