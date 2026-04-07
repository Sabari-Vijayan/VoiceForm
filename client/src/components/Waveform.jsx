import React from 'react';
import './Waveform.css';

const Waveform = ({ isListening = true }) => {
  return (
    <div className="wave-container">
      {[0.1, 0.3, 0.5, 0.2, 0.4, 0.6].map((delay, i) => (
        <div 
          key={i} 
          className={`wave-bar ${isListening ? 'animate-wave' : ''}`} 
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </div>
  );
};

export default Waveform;
