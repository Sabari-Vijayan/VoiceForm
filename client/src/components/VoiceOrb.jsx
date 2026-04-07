import React from 'react';
import { Mic } from 'lucide-react';
import './VoiceOrb.css';

const VoiceOrb = ({ isListening, isSpeaking }) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Decorative Rings */}
      <div className={`absolute w-32 h-32 rounded-full border border-primary-light opacity-50 scale-125 transition-transform duration-1000 ${isListening || isSpeaking ? 'animate-pulse' : ''}`}></div>
      <div className={`absolute w-32 h-32 rounded-full border border-slate-200 opacity-30 scale-150 transition-transform duration-1000 ${isListening || isSpeaking ? 'animate-pulse delay-75' : ''}`}></div>
      
      {/* Main Animated Orb */}
      <div className={`relative w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center shadow-xl shadow-primary/20 ${isListening || isSpeaking ? 'animate-orb-pulse' : ''}`}>
        <Mic className="text-white w-12 h-12" strokeWidth={2.5} />
      </div>
    </div>
  );
};

export default VoiceOrb;
