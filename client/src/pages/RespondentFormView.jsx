import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mic, Globe, Play, Loader2, Edit3, Save, 
  CheckCircle2, ChevronLeft, ArrowRight, Info, AlertCircle,
  Keyboard, Settings, History
} from 'lucide-react';
import useVoiceSession from '../hooks/useVoiceSession';
import VoiceOrb from '../components/VoiceOrb';

const RespondentFormView = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState(null);
  const [session, setSession] = useState(null);
  const [starting, setStarting] = useState(false);
  
  // Modes: 'selection' | 'voice' | 'manual' | 'review' | 'completed'
  const [mode, setMode] = useState('selection');
  const [manualData, setManualData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const scrollRef = useRef(null);

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mode]);

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
    transcriptsBuffer
  } = useVoiceSession(
    mode === 'voice' ? form : null,
    session?.session_id,
    language,
    (finalExtractedResponses) => {
        setManualData(finalExtractedResponses);
        setMode('review');
    }
  );

  const handleSwitchToManual = () => {
      if (transcriptsBuffer && Object.keys(transcriptsBuffer).length > 0) {
          setManualData(prev => ({ ...prev, ...transcriptsBuffer }));
      }
      setMode('manual');
  };

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

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <Loader2 className="animate-spin text-primary" size={48} />
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] animate-pulse">Initializing Session</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-8 text-center bg-slate-50">
        <div className="animate-fade-in max-w-sm">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Oops.</h2>
            <p className="text-slate-500 mb-10 font-medium leading-relaxed">{error}</p>
            <button onClick={() => navigate('/')} className="bg-primary text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest btn-bouncy shadow-lg shadow-primary/20">Return Home</button>
        </div>
    </div>
  );

  // --- COMPLETED STATE ---
  if (mode === 'completed') {
      return (
          <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
              <div className="animate-fade-in max-w-md w-full text-center">
                  <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-xl shadow-green-100">
                    <CheckCircle2 size={48} />
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tight">All set.</h1>
                  <p className="text-slate-500 text-lg mb-12 font-medium">Thank you for your time. Your responses have been securely recorded by our AI.</p>
                  <button onClick={() => window.location.reload()} className="w-full bg-primary text-white py-5 rounded-full font-black text-xs uppercase tracking-widest btn-bouncy shadow-2xl shadow-primary/30">
                    Return to Start
                  </button>
              </div>
          </div>
      );
  }

  // --- VOICE MODE ---
  if (mode === 'voice') {
    const currentField = form?.fields[currentFieldIndex];
    const progress = ((currentFieldIndex) / form?.fields.length) * 100;
    
    return (
      <div className="min-h-[100dvh] flex flex-col bg-slate-50 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="fixed inset-0 -z-10 opacity-40 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100 blur-[120px]"></div>
        </div>

        {/* Top App Bar */}
        <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 h-20 shadow-sm">
          <button onClick={() => setMode('selection')} className="p-3 rounded-xl hover:bg-slate-50 text-primary transition-all active:scale-90">
            <ChevronLeft size={28} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="font-black text-base text-slate-900 uppercase tracking-[0.25em]">VoiceForm</h1>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
               <span className="text-[10px] font-black text-primary uppercase tracking-widest">AI Active</span>
            </div>
          </div>
          <button className="p-3 rounded-xl hover:bg-slate-50 text-slate-400 transition-all">
            <Settings size={28} />
          </button>
        </header>

        <main className="flex-grow pt-32 pb-48 px-8 max-w-xl mx-auto w-full flex flex-col">
          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">QUESTION {currentFieldIndex + 1} OF {form?.fields.length}</span>
              <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">{Math.round(progress)}% COMPLETED</span>
            </div>
            <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden backdrop-blur-sm">
              <div className="h-full bg-primary transition-all duration-1000 ease-out rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          {/* Chat Feed */}
          <div className="flex-grow space-y-12 overflow-y-auto mb-16 no-scrollbar" ref={scrollRef}>
            <div className="flex flex-col items-start max-w-[90%] animate-fade-in">
              <div className="glass-card p-10 bg-white border-l-8 border-primary shadow-2xl shadow-slate-200/50">
                <p className="font-bold text-2xl text-slate-900 leading-relaxed tracking-tight">{currentField?.question_phrasing}</p>
              </div>
              <span className="text-xs text-primary mt-4 ml-2 font-black uppercase tracking-[0.2em]">
                {status === 'speaking' ? 'Assistant is speaking...' : status === 'listening' ? 'Listening for your voice...' : 'VoiceForm Assistant'}
              </span>
            </div>

            {transcript && (
              <div className="flex flex-col items-end self-end max-w-[90%] animate-fade-in">
                <div className="bg-primary p-10 rounded-[2.5rem] rounded-tr-none shadow-2xl shadow-primary/30">
                  <p className="text-white text-lg font-medium leading-relaxed">{transcript}</p>
                </div>
                <div className="flex items-center gap-3 mt-4 mr-2">
                  <div className="flex gap-1">
                    {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: `${i*0.1}s` }}></div>)}
                  </div>
                  <span className="text-xs text-slate-400 font-black uppercase tracking-widest">AI Processing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Voice Orb Area */}
          <div className="flex flex-col items-center justify-center space-y-12 mt-auto">
            <VoiceOrb isListening={status === 'listening'} isSpeaking={status === 'speaking'} />
            
            <button 
              onClick={handleSwitchToManual}
              className="flex items-center gap-4 px-10 py-5 rounded-full bg-white shadow-2xl shadow-slate-200/60 border border-slate-100 text-slate-500 hover:text-primary transition-all active:scale-95 group font-black text-xs uppercase tracking-[0.25em]"
            >
              <Keyboard size={20} />
              Switch to typing
            </button>
          </div>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-10 pb-12 pt-6 bg-white/80 backdrop-blur-2xl rounded-t-[4rem] z-50 border-t border-slate-100 shadow-[0_-15px_50px_rgba(0,0,0,0.06)]">
          <button onClick={handleSwitchToManual} className="flex flex-col items-center gap-3 text-slate-400 hover:text-primary transition-all active:scale-90">
            <Keyboard size={28} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Manual</span>
          </button>
          <div className="bg-primary text-white p-6 rounded-[2.5rem] shadow-2xl shadow-primary/40 active:scale-90 transition-all -translate-y-6">
            <Mic size={40} />
          </div>
          <button className="flex flex-col items-center gap-3 text-slate-400 hover:text-primary transition-all active:scale-90">
            <History size={28} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">History</span>
          </button>
        </nav>
      </div>
    );
  }

  // --- MANUAL/REVIEW MODE Styling ---
  if (mode === 'manual' || mode === 'review') {
    return (
      <div className="min-h-screen bg-slate-50 py-24 md:py-32 px-8">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <button onClick={() => setMode('selection')} className="flex items-center gap-3 text-slate-400 hover:text-primary mb-12 font-black text-xs uppercase tracking-[0.25em] transition-all group">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to selection
          </button>
          
          <header className="mb-20">
            <h1 className="text-5xl font-black text-slate-900 mb-4 font-headline uppercase tracking-tight">
              {mode === 'review' ? 'Review Submission' : 'Manual Entry'}
            </h1>
            <p className="text-slate-500 text-xl font-medium leading-relaxed">
              {mode === 'review' 
                ? "Confirm the AI-extracted values before final submission."
                : form.description}
            </p>
          </header>

          <div className="space-y-12">
            {form.fields.map((field) => (
              <div key={field.id} className="glass-card p-12 bg-white border-slate-100 shadow-2xl shadow-slate-200/40">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.25em] mb-8">
                  {field.question_phrasing} {field.required && <span className="text-red-500 font-bold">*</span>}
                </label>
                
                {mode === 'review' ? (
                  <div className="flex justify-between items-center gap-10">
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">
                      {manualData[field.id] || <span className="text-red-400 italic text-base font-black uppercase">Data Missing</span>}
                    </div>
                    <button onClick={() => setMode('manual')} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-primary hover:bg-white border border-transparent hover:border-slate-100 transition-all shadow-sm">
                      <Edit3 size={24} />
                    </button>
                  </div>
                ) : (
                  field.type === 'choice' ? (
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 font-bold text-slate-900 text-lg focus:ring-8 focus:ring-primary/5 focus:bg-white focus:border-primary outline-none transition-all shadow-inner"
                      required={field.required}
                      value={manualData[field.id] || ''}
                      onChange={(e) => setManualData({...manualData, [field.id]: e.target.value})}
                    >
                      <option value="" className="text-slate-400">Select option...</option>
                      {field.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 font-bold text-slate-900 text-lg focus:ring-8 focus:ring-primary/5 focus:bg-white focus:border-primary outline-none transition-all shadow-inner placeholder-slate-300"
                      type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                      placeholder="Enter value here..."
                      required={field.required}
                      value={manualData[field.id] || ''}
                      onChange={(e) => setManualData({...manualData, [field.id]: e.target.value})}
                    />
                  )
                )}
              </div>
            ))}
            
            <button 
              onClick={() => submitResponses(manualData)}
              className="w-full bg-primary text-white py-8 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.25em] btn-bouncy shadow-[0_25px_60px_rgba(79,70,229,0.4)] mt-16 flex items-center justify-center gap-5"
              disabled={submitting}
            >
              {submitting ? <Loader2 className="animate-spin" size={28} /> : <><Save size={24} /> {mode === 'review' ? 'Confirm & Finalize' : 'Submit Response'}</>}
            </button>

            {mode === 'review' && (
               <button 
               onClick={() => setMode('selection')}
               className="w-full text-slate-400 font-black text-xs uppercase tracking-[0.4em] hover:text-slate-600 transition-all mt-10"
             >
               Discard and Restart
             </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- SELECTION (LANDING) STATE ---
  return (
    <div className="min-h-screen bg-slate-50 py-24 md:py-32 px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] -z-10"></div>
      
      <div className="max-w-5xl mx-auto animate-fade-in">
        <header className="text-center mb-24">
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-white border border-slate-100 rounded-full text-xs font-black text-slate-400 mb-12 shadow-xl shadow-slate-200/50 uppercase tracking-[0.25em]">
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-ping"></div>
                AI Form Intelligence
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 tracking-tighter uppercase font-headline leading-tight">{form.title}</h1>
            <p className="text-slate-500 text-2xl max-w-3xl mx-auto mb-20 font-medium italic leading-relaxed">"{form.description}"</p>
            
            <div className="flex flex-col sm:flex-row gap-10 justify-center items-center">
                <button 
                    className="bg-primary text-white px-14 py-7 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] btn-bouncy shadow-2xl shadow-primary/40 flex items-center gap-5 w-full sm:w-auto justify-center"
                    onClick={() => handleStartSession('voice')} 
                    disabled={starting || isTranslating}
                >
                    {starting ? <Loader2 className="animate-spin" /> : <><Mic size={28} /> Start Voice Session</>}
                </button>
                <button 
                    className="bg-white text-slate-900 border border-slate-200 px-14 py-7 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all w-full sm:w-auto flex items-center justify-center gap-4 shadow-xl shadow-slate-200/50"
                    onClick={() => handleStartSession('manual')} 
                    disabled={starting || isTranslating}
                >
                    Manual Mode <ArrowRight size={24} className="text-primary" />
                </button>
            </div>
        </header>

        <div className="max-w-3xl mx-auto">
            <div className="glass-card p-12 bg-white/80 border-white mb-24 relative overflow-hidden shadow-2xl shadow-slate-200/40">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                <div className="flex items-center gap-10">
                  <div className="w-20 h-20 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-2xl">
                      <Globe size={40} />
                  </div>
                  <div className="flex-grow">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-3">
                          Primary Language
                      </label>
                      <select 
                          className="w-full bg-transparent text-3xl font-black text-slate-900 outline-none cursor-pointer uppercase tracking-tight"
                          value={language || ''} 
                          onChange={(e) => setLanguage(e.target.value)}
                          disabled={isTranslating}
                      >
                          <option value="en">English (US)</option>
                          <option value="hi">Hindi (IN)</option>
                          <option value="ml">Malayalam (IN)</option>
                          <option value="es">Spanish (ES)</option>
                      </select>
                  </div>
                  {isTranslating && <Loader2 size={32} className="animate-spin text-primary" />}
                </div>
            </div>

            <div className="opacity-30 select-none pointer-events-none mb-32">
                <h3 className="text-center text-xs font-black text-slate-400 uppercase tracking-[0.5em] mb-12">Form Architecture Preview</h3>
                <div className="space-y-10">
                    {form.fields.map((field) => (
                        <div key={field.id} className="glass-card p-12 border-slate-50 bg-white/50">
                            <p className="font-black text-xs text-slate-400 uppercase tracking-[0.2em] mb-6">{field.label}</p>
                            <p className="font-bold text-slate-800 text-2xl mb-6">{field.question_phrasing}</p>
                            <div className="h-2 bg-slate-100 rounded-full w-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// Mock icon for Brain if missing
const Brain = ({ size, className }) => <Info size={size} className={className} />;

export default RespondentFormView;
