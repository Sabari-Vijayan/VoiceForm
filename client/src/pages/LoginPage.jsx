import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Loader2, ArrowLeft, ShieldCheck, Globe } from 'lucide-react';
import Layout from '../components/Layout';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      navigate('/dashboard');
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
            <h2 className="text-4xl font-black text-slate-900 mb-4 font-headline uppercase tracking-tight">Welcome back</h2>
            <p className="text-slate-500 font-medium mb-12 text-lg">Sign in to manage your voice forms.</p>
            
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
                <div className="flex justify-between items-center mb-3 ml-1">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Password</label>
                  <Link to="#" className="text-xs font-black text-primary uppercase tracking-[0.2em] hover:underline">Forgot?</Link>
                </div>
                <input 
                    type="password" 
                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-5 focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all font-medium placeholder-slate-300 shadow-sm text-lg"
                    placeholder="••••••••"
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
                {loading ? <Loader2 className="animate-spin" size={24} /> : <><LogIn size={24} /> Sign In</>}
              </button>
            </form>

            <div className="relative my-12">
               <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
               </div>
               <div className="relative flex justify-center text-xs font-black uppercase tracking-[0.25em]">
                  <span className="bg-white/50 px-6 text-slate-400 backdrop-blur-sm">Or continue with</span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <button className="flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-2xl p-4 hover:bg-slate-50 transition-colors font-bold text-sm text-slate-600 shadow-sm">
                  <Globe size={20} /> Google
               </button>
               <button className="flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-2xl p-4 hover:bg-slate-50 transition-colors font-bold text-sm text-slate-600 shadow-sm">
                  <Globe size={20} /> GitHub
               </button>
            </div>
          </div>
          
          <p className="mt-12 text-center text-slate-500 font-bold text-lg">
            Don't have an account? <Link to="/register" className="text-primary hover:underline">Create one for free</Link>
          </p>

          <Link to="/" className="flex items-center justify-center gap-3 text-slate-400 hover:text-primary mt-12 font-black text-xs uppercase tracking-[0.2em] transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to home
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
