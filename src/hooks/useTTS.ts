import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTTSProps {
    onEnd?: () => void;
    onError?: (error: any) => void;
}

export const useTTS = ({ onEnd, onError }: UseTTSProps = {}) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const synth = useRef<SpeechSynthesis | null>(null);
    const utterance = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            synth.current = window.speechSynthesis;
            setIsSupported(true);
        } else {
            setIsSupported(false);
            console.error("Speech Synthesis not supported in this browser.");
        }

        return () => {
            if (synth.current) {
                synth.current.cancel();
            }
        };
    }, []);

    const speak = useCallback((text: string) => {
        if (!synth.current) {
            console.warn("Speech Synthesis not initialized.");
            return;
        }

        // Cancel any current speaking
        synth.current.cancel();

        const newUtterance = new SpeechSynthesisUtterance(text);
        utterance.current = newUtterance;

        // Try to load voices if not already available (some browsers load async)
        const voices = synth.current.getVoices();
        if (voices.length > 0) {
            // Prefer a clear English voice if available, otherwise default
            const preferredVoice = voices.find(v => v.lang.includes('en') && v.name.includes('Google')) || voices.find(v => v.lang.includes('en'));
            if (preferredVoice) {
                newUtterance.voice = preferredVoice;
            }
        }

        newUtterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
        };

        newUtterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            onEnd?.();
        };

        newUtterance.onerror = (event) => {
            console.error("TTS Error Event:", event);
            setIsSpeaking(false);
            setIsPaused(false);
            onError?.(event);
        };

        // Rate and Pitch adjustments for better naturalness
        newUtterance.rate = 1.0;
        newUtterance.pitch = 1.0;

        try {
            synth.current.speak(newUtterance);

            // Chrome bug fix: sometimes speech doesn't start unless resumed
            if (synth.current.paused) {
                synth.current.resume();
            }
        } catch (e) {
            console.error("Exception calling speak:", e);
            onError?.(e);
        }
    }, [onEnd, onError]);

    const pause = useCallback(() => {
        if (!synth.current) return;
        synth.current.pause();
        setIsSpeaking(false);
        setIsPaused(true);
    }, []);

    const resume = useCallback(() => {
        if (!synth.current) return;
        synth.current.resume();
        setIsSpeaking(true);
        setIsPaused(false);
    }, []);

    const stop = useCallback(() => {
        if (!synth.current) return;
        synth.current.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
    }, []);

    return {
        speak,
        pause,
        resume,
        stop,
        isSpeaking,
        isPaused,
        isSupported
    };
};
