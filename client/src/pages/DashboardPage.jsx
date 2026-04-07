import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, Layout as LayoutIcon, MessageSquare, Clock, Loader2, 
  Send, Eye, X, ChevronRight, Settings, LogOut, 
  Search, ExternalLink, Copy, CheckCircle2, BarChart3,
  TrendingUp, Users, Globe, Brain, Info
} from 'lucide-react';
import Layout from '../components/Layout';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [formLanguage, setFormLanguage] = useState('en');
  const [error, setError] = useState('');
  const [selectedForm, setSelectedForm] = useState(null);
  const [copyingId, setCopyingId] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  const fetchForms = React.useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch(`${backendUrl}/api/v1/creator/forms?creator_id=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch forms');
      const data = await response.json();
      setForms(data);
    } catch {
      setError('Could not load your forms.');
    } finally {
      setLoading(false);
    }
  }, [user, backendUrl]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

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
          creator_id: user.id,
          language: formLanguage
        })
      });

      if (!response.ok) throw new Error('AI Generation failed');
      
      const newForm = await response.json();
      setForms([newForm, ...forms]);
      setPrompt('');
    } catch {
      setError('AI generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = (id) => {
    const link = `${window.location.origin}/f/${id}`;
    navigator.clipboard.writeText(link);
    setCopyingId(id);
    setTimeout(() => setCopyingId(null), 2000);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-24">
        <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 font-headline uppercase tracking-tight">Dashboard</h1>
            <p className="text-slate-500 text-xl font-medium">Welcome back, {user?.email?.split('@')[0]}. Here's your workspace.</p>
          </div>
          <div className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
             <div className="px-5 py-2.5 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">System Live</span>
             </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
          <div className="glass-card p-10 bg-white group hover:border-primary/30 transition-all animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-8">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <Users size={28} />
              </div>
              <TrendingUp size={24} className="text-green-500" />
            </div>
            <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Total Responses</h3>
            <div className="text-4xl font-black text-slate-900 tracking-tight">1,284</div>
            <p className="text-xs text-slate-400 mt-4 font-bold uppercase tracking-wide">+12% from last week</p>
          </div>

          <div className="glass-card p-10 bg-white group hover:border-primary/30 transition-all animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-8">
              <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
                <TrendingUp size={28} />
              </div>
              <div className="text-sm font-bold text-orange-500 bg-orange-50 px-3 py-1.5 rounded-md">84%</div>
            </div>
            <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Completion Rate</h3>
            <div className="h-2 w-full bg-slate-100 rounded-full mt-6 overflow-hidden">
               <div className="h-full bg-orange-500 w-[84%] rounded-full"></div>
            </div>
          </div>

          <div className="glass-card p-10 bg-white group hover:border-primary/30 transition-all animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-8">
              <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                <Globe size={28} />
              </div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">4 Languages</span>
            </div>
            <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Top Language</h3>
            <div className="text-4xl font-black text-slate-900 tracking-tight">English</div>
            <p className="text-xs text-slate-400 mt-4 font-bold uppercase tracking-wide">Followed by Hindi (22%)</p>
          </div>
        </div>

        {/* Create with AI Section */}
        <section className="glass-card p-12 bg-primary text-white mb-20 relative overflow-hidden shadow-2xl shadow-primary/20 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-10">
              <div>
                <h2 className="text-3xl font-bold mb-4 flex items-center gap-4">
                  <Brain size={32} /> Create New Form with AI
                </h2>
                <p className="text-primary-light text-lg font-medium">Describe your form goal, and Gemini will generate the optimal voice fields.</p>
              </div>
              <div className="flex items-center gap-4 bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/20 self-start">
                <span className="text-xs font-black uppercase tracking-widest pl-3">Target Language</span>
                <select 
                  value={formLanguage}
                  onChange={(e) => setFormLanguage(e.target.value)}
                  className="bg-white text-primary text-xs font-black px-4 py-2 rounded-lg border-none outline-none focus:ring-0 cursor-pointer uppercase tracking-widest"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="ml">Malayalam</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="relative group">
              <input 
                className="w-full bg-white text-slate-900 px-8 py-6 rounded-2xl text-xl font-medium outline-none pr-44 shadow-lg placeholder-slate-400 focus:ring-4 focus:ring-white/20 transition-all"
                placeholder="e.g., A customer satisfaction survey for a coffee shop..." 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={generating}
              />
              <button 
                type="submit" 
                className={`absolute right-3 top-3 bottom-3 px-10 rounded-xl font-black text-xs uppercase tracking-[0.15em] flex items-center gap-3 transition-all ${
                  generating || !prompt.trim() 
                    ? 'bg-slate-100 text-slate-400' 
                    : 'bg-primary text-white hover:bg-primary-dark shadow-lg'
                }`}
                disabled={generating || !prompt.trim()}
              >
                {generating ? <Loader2 className="animate-spin" size={24} /> : <><Plus size={20} /> Generate</>}
              </button>
            </form>
            {error && <p className="mt-6 text-red-200 text-xs font-black uppercase tracking-widest flex items-center gap-3 animate-bounce"><X size={16} /> {error}</p>}
          </div>
        </section>

        {/* AI Insights Panel */}
        <section className="glass-card p-12 bg-white border-slate-200 mb-20 animate-fade-in shadow-xl shadow-slate-200/30" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 font-headline uppercase tracking-tight">
              <BarChart3 size={28} className="text-primary" /> AI Sentiment Insights
            </h2>
            <button className="text-slate-400 hover:text-primary transition-colors p-3">
               <Info size={24} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-32 items-center">
            <div className="space-y-8">
               <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  <span>Sentiment Trend</span>
                  <span className="text-green-500 font-bold">+12% Positive</span>
               </div>
               <div className="flex items-end gap-3 h-48 pt-6">
                  {[40, 60, 45, 70, 85, 65, 90].map((h, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-primary/10 rounded-t-xl hover:bg-primary transition-colors group relative" 
                      style={{ height: `${h}%` }}
                    >
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl z-20">
                        {h}% SATISFIED
                      </div>
                    </div>
                  ))}
               </div>
               <div className="flex justify-between text-xs font-black text-slate-300 uppercase tracking-widest pt-4">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                  <span>Sun</span>
               </div>
            </div>

            <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Brain size={120} className="text-primary" />
               </div>
               <div className="flex items-center gap-3 text-primary font-black text-xs uppercase tracking-[0.2em] mb-6">
                  <Brain size={20} /> AI Assistant Summary
               </div>
               <p className="text-slate-600 font-medium leading-relaxed text-xl">
                 Respondents are overwhelmingly positive about the new voice interface. 
                 <span className="text-primary font-black"> "Ease of use"</span> was mentioned in 74% of audio transcripts. 
                 There's a slight drop in completion rate during Question 4—consider shortening that field.
               </p>
            </div>
          </div>
        </section>

        {/* Forms List */}
        <section className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-black text-slate-900 font-headline uppercase tracking-tight">Your Voice Forms</h2>
            <div className="text-slate-400 font-black text-xs uppercase tracking-widest bg-white border border-slate-200 px-5 py-2 rounded-full">{forms.length} TOTAL</div>
          </div>

          {loading ? (
            <div className="flex justify-center py-40"><Loader2 className="animate-spin text-primary" size={64} /></div>
          ) : forms.length === 0 ? (
            <div className="text-center py-32 glass-card bg-white border-dashed border-2 border-slate-200 rounded-[2.5rem]">
              <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                 <LayoutIcon size={48} className="text-slate-300" />
              </div>
              <p className="text-slate-400 font-black text-xl mb-4 uppercase tracking-tight">No forms found</p>
              <p className="text-slate-500 font-medium mb-12 text-lg">Start by describing your goal in the AI generator above.</p>
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="bg-primary text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-xs btn-bouncy shadow-2xl shadow-primary/20">
                Create your first form
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {forms.map(form => (
                <div key={form.id} className="glass-card bg-white p-10 hover:shadow-2xl hover:shadow-primary/10 transition-all group border-slate-200 relative overflow-hidden flex flex-col h-full">
                  <div className="flex justify-between items-start mb-8">
                      <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                        <MessageSquare size={28} />
                      </div>
                      <div className="flex gap-3">
                          <button 
                            onClick={() => setSelectedForm(form)} 
                            className="p-3 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100"
                            title="Preview"
                          >
                              <Eye size={24} />
                          </button>
                          <button 
                            onClick={() => copyLink(form.id)} 
                            className={`p-3 rounded-xl transition-all border ${copyingId === form.id ? 'bg-green-50 text-green-500 border-green-100' : 'text-slate-400 hover:text-primary hover:bg-slate-50 border-transparent hover:border-slate-100'}`}
                            title="Copy Link"
                          >
                              {copyingId === form.id ? <CheckCircle2 size={24} /> : <Copy size={24} />}
                          </button>
                      </div>
                  </div>
                  
                  <h4 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-primary transition-colors tracking-tight leading-snug">{form.title}</h4>
                  <p className="text-slate-500 text-base line-clamp-3 mb-10 font-medium leading-relaxed flex-grow">
                    {form.description || 'No description provided.'}
                  </p>
                  
                  <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-5">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                        <Clock size={14} /> {new Date(form.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-lg">
                        <Users size={14} /> 0 RESPONSES
                      </div>
                    </div>
                    <Link 
                      to={`/dashboard/responses/${form.id}`}
                      className="text-primary font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-2 shrink-0 ml-4"
                    >
                      Analytics <ChevronRight size={18} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modern Preview Modal */}
      {selectedForm && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setSelectedForm(null)}
        >
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"></div>
            
            <div 
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.3)] flex flex-col"
            >
                <div className="p-8 md:p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 mb-1 font-headline uppercase tracking-tight">{selectedForm.title}</h3>
                      <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">Form Structure Preview</p>
                    </div>
                    <button onClick={() => setSelectedForm(null)} className="p-3 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                        <X size={28} />
                    </button>
                </div>
                
                <div className="p-8 md:p-10 overflow-y-auto flex-grow space-y-6 no-scrollbar">
                    {selectedForm.fields?.map((field, idx) => (
                        <div key={idx} className="p-8 rounded-3xl border border-slate-100 bg-white shadow-sm flex items-start gap-6 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all">
                            <span className="flex-shrink-0 w-10 h-10 bg-slate-900 text-white font-black text-sm rounded-2xl flex items-center justify-center shadow-lg">
                              {idx + 1}
                            </span>
                            <div className="flex-grow">
                              <p className="font-bold text-slate-800 text-xl mb-4 leading-snug">{field.question_phrasing}</p>
                              <div className="flex gap-3">
                                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-primary/5 text-primary rounded-lg border border-primary/10">
                                  {field.type}
                                </span>
                                {field.required && (
                                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-red-50 text-red-500 rounded-lg border border-red-100">
                                    Required
                                  </span>
                                )}
                              </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-8 md:p-10 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6 bg-slate-50/50">
                    <button 
                      onClick={() => copyLink(selectedForm.id)} 
                      className={`font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 transition-all ${copyingId === selectedForm.id ? 'text-green-500' : 'text-slate-400 hover:text-primary'}`}
                    >
                      {copyingId === selectedForm.id ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                      {copyingId === selectedForm.id ? 'Copied Public Link' : 'Copy Public Link'}
                    </button>
                    <button onClick={() => setSelectedForm(null)} className="w-full sm:w-auto bg-primary text-white px-12 py-4 rounded-full font-black uppercase tracking-widest text-xs btn-bouncy shadow-2xl shadow-primary/30">
                        Got it
                    </button>
                </div>
            </div>
        </div>
      )}
    </Layout>
  );
};

export default DashboardPage;
