import { useState, useEffect, useCallback, useRef } from 'react';

const useVoiceSession = (form, sessionId, language, onComplete) => {
    const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
    const [status, setStatus] = useState('idle'); // idle | speaking | listening | processing | completed
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState(null);
    
    // Buffer for transcripts: { field_id: "raw spoken text" }
    const [transcriptsBuffer, setTranscriptsBuffer] = useState({});
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

    // List of caring acknowledgments + human-like filler words
    const acknowledgments = [
        "Got it!", "Perfect, thank you.", "Wonderful,", "That's great.", "Okay, I've noted that.", 
        "Understood.", "Hmm, let me see... okay, for the next one,", "Oh, nice.", "I'm listening, go ahead."
    ];

    const getRandomAck = useCallback(() => {
        return acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
    }, []);

    const speak = useCallback(async (text, onEnd) => {
        if (!text) return;
        
        // Add a warm intro after the first question
        let phrase = text;
        if (currentFieldIndex > 0 && !text.includes('?')) { 
            // Only add if it's a question, not if it's already a complex instruction
        }

        console.log(`[TTS] Speaking: "${phrase}"`);
        setStatus('speaking');
        try {
            // If it's the second field or more, add a random warm prefix
            let finalPhrase = phrase;
            if (currentFieldIndex > 0) {
                const ack = getRandomAck();
                // We fetch a translated version of the acknowledgment too
                const transRes = await fetch(`${backendUrl}/api/v1/public/translate?text=${encodeURIComponent(ack)}&target_lang=${language}`);
                const transData = await transRes.json();
                finalPhrase = `${transData.translated} ${phrase}`;
            }

            const response = await fetch(`${backendUrl}/api/v1/public/tts?text=${encodeURIComponent(finalPhrase)}&lang=${language}`);
            if (!response.ok) throw new Error(`TTS API failed`);
            
            const { audioContent } = await response.json();
            const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
            audio.onended = () => {
                console.log(`[TTS] Finished`);
                if (onEnd) onEnd();
            };
            await audio.play();
        } catch (err) {
            console.error("[TTS] Error:", err);
            setError("Voice generation failed");
            if (onEnd) setTimeout(onEnd, 2000);
        }
    }, [language, backendUrl, currentFieldIndex, getRandomAck]);

    const listen = useCallback((onResult) => {
        console.log(`[STT] Listening...`);
        const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Recognition) {
            setError("Speech recognition not supported");
            return;
        }

        const recognition = new Recognition();
        recognition.lang = language === 'ml' ? 'ml-IN' : language === 'hi' ? 'hi-IN' : (language === 'en' ? 'en-US' : language);
        recognition.interimResults = true;
        recognition.continuous = false;

        recognition.onstart = () => {
            setStatus('listening');
            setTranscript('');
        };

        recognition.onresult = (event) => {
            const result = event.results[event.resultIndex][0].transcript;
            setTranscript(result);
            if (event.results[event.resultIndex].isFinal) {
                console.log(`[STT] Captured: "${result}"`);
                if (onResult) onResult(result);
            }
        };

        recognition.onerror = (e) => {
            if (e.error !== 'no-speech') {
                setError("Microphone error: " + e.error);
                setStatus('idle');
            } else {
                console.warn("[STT] No speech detected");
                // The loop handles re-asking if needed
            }
        };

        recognition.start();
    }, [language]);

    const runLoop = useCallback(async () => {
        if (!form || !form.fields || !form.fields[currentFieldIndex]) return;
        
        const field = form.fields[currentFieldIndex];
        console.log(`[Loop] Field ${currentFieldIndex + 1}/${form.fields.length}: ${field.label}`);

        speak(field.question_phrasing, () => {
            listen(async (speech) => {
                if (!speech) {
                    console.warn("[Loop] No speech, retrying field...");
                    runLoop();
                    return;
                }

                // Save raw transcript to buffer
                setTranscriptsBuffer(prev => ({
                    ...prev,
                    [field.id]: speech
                }));

                // Move to next field or finish
                if (currentFieldIndex < form.fields.length - 1) {
                    setCurrentFieldIndex(prev => prev + 1);
                    setStatus('idle'); // Triggers next loop via useEffect
                } else {
                    console.log("[Loop] All questions asked. Starting Bulk Extraction.");
                    finalizeSession({ ...transcriptsBuffer, [field.id]: speech });
                }
            });
        });
    }, [currentFieldIndex, form, language, speak, listen, transcriptsBuffer]);

    const finalizeSession = async (finalBuffer) => {
        setStatus('processing');
        console.log("[Finalize] Sending bulk extraction request", finalBuffer);

        try {
            const entries = form.fields.map(f => ({
                field_id: f.id,
                field_type: f.type,
                question: f.question_phrasing,
                transcript: finalBuffer[f.id] || ""
            }));

            const response = await fetch(`${backendUrl}/api/v1/public/bulk-extract`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    form_id: form.id,
                    language: language,
                    entries: entries
                })
            });

            if (!response.ok) throw new Error("Bulk extraction failed");
            
            const data = await response.json();
            console.log("[Finalize] Extraction complete:", data.results);

            // Convert { field_id: { value, ... } } to { field_id: value } for the UI
            const finalResponses = {};
            Object.keys(data.results).forEach(fid => {
                finalResponses[fid] = data.results[fid].value;
            });

            setStatus('completed');
            onComplete(finalResponses);
        } catch (err) {
            console.error("[Finalize] Error:", err);
            setError("Failed to process interview results.");
        }
    };

    useEffect(() => {
        if (form && sessionId && status === 'idle') {
            runLoop();
        }
    }, [form, sessionId, status, runLoop]);

    return {
        currentFieldIndex,
        status,
        transcript,
        error,
        transcriptsBuffer
    };
};

export default useVoiceSession;
