import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children, hideNav = false, hideFooter = false }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {!hideNav && (
        <nav className="w-full z-50 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm">
          <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-20">
            <Link to="/" className="flex items-center gap-3">
              <span className="text-2xl font-bold tracking-tight text-primary font-headline">VoiceForm</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-10">
              <Link to="/" className="text-slate-600 hover:text-primary font-bold transition-colors">Home</Link>
              {user && (
                <>
                  <Link to="/dashboard" className="text-slate-600 hover:text-primary font-bold transition-colors">Dashboard</Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-6">
              {user ? (
                <div className="flex items-center gap-6">
                  <span className="text-sm text-slate-500 font-bold hidden sm:inline">{user.email}</span>
                  <button onClick={handleLogout} className="text-slate-600 hover:text-primary p-2.5 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                    <LogOut size={22} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <Link to="/login" className="text-slate-600 font-black text-xs uppercase tracking-widest hover:text-primary transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register" className="bg-primary text-white px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest btn-bouncy shadow-2xl shadow-primary/30">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}

      <main className="flex-grow">
        {children}
      </main>

      {!hideFooter && (
        <footer className="w-full py-20 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
              <div className="flex flex-col gap-6">
                <span className="text-2xl font-bold text-slate-900 font-headline">VoiceForm</span>
                <p className="text-slate-500 text-base max-w-sm leading-relaxed">
                  Empowering businesses to capture the genuine voice of their audience through AI-driven voice interactions.
                </p>
                <p className="text-sm text-slate-400 mt-4">© 2026 VoiceForm Inc. All rights reserved.</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
                <div className="flex flex-col gap-4">
                  <h5 className="text-slate-900 font-black text-xs uppercase tracking-widest mb-2">Company</h5>
                  <Link to="#" className="text-slate-500 hover:text-primary text-sm font-medium transition-colors">Privacy Policy</Link>
                  <Link to="#" className="text-slate-500 hover:text-primary text-sm font-medium transition-colors">Terms of Service</Link>
                </div>
                <div className="flex flex-col gap-4">
                  <h5 className="text-slate-900 font-black text-xs uppercase tracking-widest mb-2">Connect</h5>
                  <Link to="#" className="text-slate-500 hover:text-primary text-sm font-medium transition-colors">Twitter</Link>
                  <Link to="#" className="text-slate-500 hover:text-primary text-sm font-medium transition-colors">LinkedIn</Link>
                </div>
                <div className="flex flex-col gap-4">
                  <h5 className="text-slate-900 font-black text-xs uppercase tracking-widest mb-2">Resources</h5>
                  <Link to="#" className="text-slate-500 hover:text-primary text-sm font-medium transition-colors">Documentation</Link>
                  <Link to="#" className="text-slate-500 hover:text-primary text-sm font-medium transition-colors">API Reference</Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
