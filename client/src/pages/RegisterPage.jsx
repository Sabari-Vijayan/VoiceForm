import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Loader2, ArrowLeft, CheckCircle2, ShieldCheck, Globe } from 'lucide-react';
import Layout from '../components/Layout';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error } = await signUp(email, password);
      if (error) throw error;
      
      if (data?.session) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout hideNav hideFooter>
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-[120px]"></div>

        <div className="animate-fade-in w-full max-w-lg relative z-10">
          <div className="mb-12 text-center">
            <Link to="/" className="inline-flex items-center gap-3 text-primary font-black text-3xl font-headline mb-4">
              VoiceForm
            </Link>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.2em]">Empathetic Data Collection</p>
          </div>

          <div className="glass-card p-12 md:p-16 bg-white/80 border-white shadow-2xl shadow-slate-200/50 rounded-[2.5rem]">
            <h2 className="text-4xl font-black text-slate-900 mb-4 font-headline uppercase tracking-tight">Create Account</h2>
            <p className="text-slate-500 font-medium mb-12 text-lg">Start building intelligent voice forms today.</p>
            
            {error && (
              <div className="p-5 bg-red-50 border border-red-100 text-red-600 rounded-2xl mb-10 text-sm font-bold flex items-center gap-3 animate-fade-in">
                <ShieldCheck size={20} /> {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Email Address</label>
                <input 
                    type="email" 
                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-5 focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all font-medium placeholder-slate-300 shadow-sm text-lg"
                    placeholder="name@company.com"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Password</label>
                <input 
                    type="password" 
                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-5 focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all font-medium placeholder-slate-300 shadow-sm text-lg"
                    placeholder="Min. 6 characters"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-primary text-white h-16 rounded-2xl font-black text-lg flex items-center justify-center gap-3 btn-bouncy shadow-2xl shadow-primary/20 mt-6 uppercase tracking-[0.1em]"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <><UserPlus size={24} /> Create Account</>}
              </button>
            </form>

            <div className="mt-12 p-6 bg-slate-50/50 rounded-2xl border border-slate-100 backdrop-blur-sm">
                <ul className="space-y-4">
                    <li className="text-xs font-black text-slate-500 flex items-center gap-3 uppercase tracking-[0.15em]">
                        <CheckCircle2 size={18} className="text-green-500" /> No credit card required
                    </li>
                    <li className="text-xs font-black text-slate-500 flex items-center gap-3 uppercase tracking-[0.15em]">
                        <CheckCircle2 size={18} className="text-green-500" /> AI-powered form generation
                    </li>
                </ul>
            </div>

            <div className="relative my-12">
               <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
               </div>
               <div className="relative flex justify-center text-xs font-black uppercase tracking-[0.25em]">
                  <span className="bg-white/50 px-6 text-slate-400 backdrop-blur-sm">Or register with</span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <button className="flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-2xl p-4 hover:bg-slate-50 transition-colors font-bold text-sm text-slate-600 shadow-sm">
                  <Globe size={20} /> Google
               </button>
               <button className="flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors font-bold text-sm text-slate-600 shadow-sm">
                  <Globe size={20} /> GitHub
               </button>
            </div>
          </div>
          
          <p className="mt-12 text-center text-slate-500 font-bold text-lg">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>

          <Link to="/" className="flex items-center justify-center gap-3 text-slate-400 hover:text-primary mt-12 font-black text-xs uppercase tracking-[0.2em] transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to home
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
