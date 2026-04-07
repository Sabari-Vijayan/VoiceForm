import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mic, Brain, Zap, Shield, Smile } from 'lucide-react';
import Layout from '../components/Layout';
import Waveform from '../components/Waveform';

const HomePage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative overflow-hidden py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-light text-primary text-xs font-bold mb-10 tracking-wide uppercase animate-fade-in">
            <Mic size={14} />
            The Future of Data Collection
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold font-headline text-slate-900 leading-[1.05] mb-12 tracking-tight animate-fade-in">
            Speak, <span className="text-primary">don't type</span>.
          </h1>
          
          <p className="text-2xl text-slate-600 mb-14 leading-relaxed font-medium max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Collect higher quality insights with voice-powered forms. VoiceForm captures the nuance of human speech and transforms it into actionable data instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Link 
              to="/register" 
              className="btn-bouncy bg-primary text-white px-12 py-6 rounded-full text-xl font-bold shadow-2xl shadow-primary/20 flex items-center gap-4"
            >
              Get Started
              <ArrowRight size={22} />
            </Link>
            
            <Link 
              to="/login" 
              className="btn-bouncy bg-white text-primary border-2 border-primary/10 px-12 py-6 rounded-full text-xl font-bold shadow-xl shadow-slate-200/50 hover:bg-primary/5 transition-all"
            >
              Log In
            </Link>
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
        </div>
      </div>

      <section className="py-24 md:py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 text-center">
            <h2 className="text-4xl md:text-5xl font-bold font-headline text-slate-900 mb-6">Why VoiceForm?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-xl leading-relaxed">Remove the friction of typing and let your users express themselves naturally.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-8 glass-card bg-slate-50/50 p-12 rounded-3xl overflow-hidden relative group hover:shadow-lg transition-all duration-300">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white mb-8">
                  <Brain size={28} />
                </div>
                <h3 className="text-3xl font-bold mb-6">AI-Powered Transcription</h3>
                <p className="text-slate-600 max-w-lg mb-8 leading-relaxed text-xl">Our advanced neural engines process voice in 40+ languages with 99% accuracy. No more "pardon me" moments.</p>
              </div>
              <div className="h-64 bg-gradient-to-br from-primary/20 to-blue-200/20 rounded-xl mt-6 flex items-center justify-center">
                <Brain size={100} className="text-primary/30" strokeWidth={1} />
              </div>
            </div>

            <div className="md:col-span-4 bg-primary p-12 rounded-3xl text-white flex flex-col justify-between hover:shadow-xl transition-all duration-300">
              <div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
                  <Zap size={28} />
                </div>
                <h3 className="text-3xl font-bold mb-6">3x Faster Completion</h3>
                <p className="text-primary-light/80 leading-relaxed text-lg">People speak faster than they type. Reduce form abandonment and increase completion rates overnight.</p>
              </div>
              <div className="mt-12 text-6xl font-black">+240%</div>
            </div>

            <div className="md:col-span-6 glass-card p-12 rounded-3xl border border-slate-200 hover:border-primary/20 transition-colors">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-primary mb-8 text-xl">
                <Smile size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Sentiment Analysis</h3>
              <p className="text-slate-500 text-lg">Go beyond words. Our engine detects tone and emotion to give you a deeper understanding of user feedback.</p>
            </div>

            <div className="md:col-span-6 glass-card p-12 rounded-3xl border border-slate-200 hover:border-primary/20 transition-colors">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-primary mb-8 text-xl">
                <Shield size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Enterprise Security</h3>
              <p className="text-slate-500 text-lg">SOC2 compliant, end-to-end encryption, and GDPR ready. Your voice data is safe and strictly confidential.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-40 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-headline text-slate-900 mb-16">Trusted by teams who value real stories.</h2>
          <div className="glass-card p-16 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white max-w-4xl mx-auto relative">
            <p className="text-2xl font-medium text-slate-700 italic leading-relaxed mb-12">
              "VoiceForm changed the way we conduct user research. We used to get one-word answers; now we get rich, emotional stories that guide our entire product roadmap."
            </p>
            <div className="flex items-center justify-center gap-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">SJ</div>
              <div className="text-left">
                <h4 className="font-bold text-slate-900 text-lg">Sarah Jenkins</h4>
                <p className="text-slate-500">Head of UX @ FlowFlow</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
