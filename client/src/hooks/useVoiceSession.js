import { useState, useEffect, useCallback, useRef } from 'react';

const useVoiceSession = (form, sessionId, language, onComplete) => {
    const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
    const [status, setStatus] = useState('idle'); // idle | speaking | listening | processing | confirming | completed
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState(null);
    const [responses, setResponses] = useState({});
    
    const recognitionRef = useRef(null);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
    const attemptsRef = useRef(0);
    const lastExtractedRef = useRef(null);

    // Speak helper
    const speak = useCallback((text, onEnd) => {
        window.speechSynthesis.cancel(); // Stop any current speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'ml' ? 'ml-IN' : language === 'hi' ? 'hi-IN' : language;
        utterance.onstart = () => setStatus('speaking');
        utterance.onend = () => {
            if (onEnd) onEnd();
        };
        utterance.onerror = (e) => {
            console.error("TTS Error:", e);
            setError("Speech synthesis failed");
        };
        window.speechSynthesis.speak(utterance);
    }, [language]);

    // Listen helper
    const listen = useCallback((onResult) => {
        const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Recognition) {
            setError("Speech recognition not supported");
            return;
        }

        const recognition = new Recognition();
        recognition.lang = language === 'ml' ? 'ml-IN' : language === 'hi' ? 'hi-IN' : language;
        recognition.interimResults = true;
        recognition.continuous = false;

        recognition.onstart = () => {
            setStatus('listening');
            setTranscript('');
        };

        recognition.onresult = (event) => {
            const current = event.resultIndex;
            const result = event.results[current][0].transcript;
            setTranscript(result);
            if (event.results[current].isFinal) {
                if (onResult) onResult(result);
            }
        };

        recognition.onerror = (e) => {
            console.error("STT Error:", e);
            if (e.error !== 'no-speech') {
                setError("Microphone error: " + e.error);
                setStatus('idle');
            } else {
                // Re-listen if no speech detected
                recognition.start();
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [language]);

    const processField = useCallback(async () => {
        if (!form || !form.fields[currentFieldIndex]) return;
        const field = form.fields[currentFieldIndex];
        
        speak(field.question_phrasing, () => {
            listen(async (speech) => {
                setStatus('processing');
                try {
                    const response = await fetch(`${backendUrl}/api/v1/public/extract`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            form_id: form.id,
                            question: field.question_phrasing,
                            field_type: field.type,
                            transcript: speech,
                            language: language
                        })
                    });
                    
                    if (!response.ok) throw new Error("Extraction failed");
                    const data = await response.json();
                    
                    if (data.confidence < 0.7 || data.ambiguous) {
                        lastExtractedRef.current = data;
                        handleConfirmationLoop(data.raw_value);
                    } else {
                        saveResponse(field.id, data.value, speech, data.confidence);
                        nextField();
                    }
                } catch (err) {
                    setError("Processing failed: " + err.message);
                }
            });
        });
    }, [currentFieldIndex, form, language, speak, listen, backendUrl]);

    const handleConfirmationLoop = async (rawValue) => {
        setStatus('confirming');
        
        // Translate confirmation phrase
        const confirmBase = `Just to confirm, you said "${rawValue}", is that correct?`;
        try {
            const res = await fetch(`${backendUrl}/api/v1/public/translate?text=${encodeURIComponent(confirmBase)}&target_lang=${language}`);
            const data = await res.json();
            const translatedConfirm = data.translated;
            
            speak(translatedConfirm, () => {
                listen(async (confirmSpeech) => {
                    // Simple check for yes/no in confirmation
                    const checkRes = await fetch(`${backendUrl}/api/v1/public/extract`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            form_id: form.id,
                            question: "Is that correct?",
                            field_type: "choice",
                            transcript: confirmSpeech,
                            language: language
                        })
                    });
                    
                    const checkData = await checkRes.json();
                    // AI will return 'Yes' or 'No' or similar normalized
                    const isYes = checkData.value?.toLowerCase().includes('yes') || checkData.value === true;
                    
                    if (isYes) {
                        const field = form.fields[currentFieldIndex];
                        saveResponse(field.id, lastExtractedRef.current.value, transcript, lastExtractedRef.current.confidence);
                        nextField();
                    } else {
                        attemptsRef.current += 1;
                        if (attemptsRef.current >= 3) {
                            setError("Couldn't understand after 3 attempts. Switching to manual mode.");
                        } else {
                            processField(); // Retry
                        }
                    }
                });
            });
        } catch (err) {
            setError("Confirmation failed");
        }
    };

    const saveResponse = (fieldId, value, transcript, confidence) => {
        setResponses(prev => ({
            ...prev,
            [fieldId]: value
        }));
    };

    const nextField = () => {
        attemptsRef.current = 0;
        if (currentFieldIndex < form.fields.length - 1) {
            setCurrentFieldIndex(prev => prev + 1);
        } else {
            setStatus('completed');
        }
    };

    useEffect(() => {
        if (status === 'completed' && Object.keys(responses).length === form?.fields.length) {
            onComplete(responses);
        }
    }, [status, responses, form, onComplete]);

    // Start the loop when form is ready
    useEffect(() => {
        if (form && status === 'idle' && sessionId) {
            processField();
        }
    }, [form, status, sessionId, processField]);

    return {
        currentFieldIndex,
        status,
        transcript,
        error,
        responses
    };
};

export default useVoiceSession;
