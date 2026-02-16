import { useState, useEffect, useRef } from 'react';

interface UseTTSProps {
    onEnd?: () => void;
}

export const useTTS = ({ onEnd }: UseTTSProps = {}) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const synth = useRef<SpeechSynthesis | null>(null);
    const utterance = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            synth.current = window.speechSynthesis;
        }

        return () => {
            if (synth.current) {
                synth.current.cancel();
            }
        };
    }, []);

    const speak = (text: string) => {
        if (!synth.current) return;

        // Cancel any current speaking
        synth.current.cancel();

        utterance.current = new SpeechSynthesisUtterance(text);

        // Optional: Select a specific voice if desired, or let browser default
        // const voices = synth.current.getVoices();
        // utterance.current.voice = voices.find(v => v.lang === 'en-IN') || null;

        utterance.current.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
        };

        utterance.current.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            onEnd?.();
        };

        utterance.current.onerror = (event) => {
            console.error("TTS Error:", event);
            setIsSpeaking(false);
            setIsPaused(false);
        };

        synth.current.speak(utterance.current);
    };

    const pause = () => {
        if (!synth.current) return;
        synth.current.pause();
        setIsSpeaking(false);
        setIsPaused(true);
    };

    const resume = () => {
        if (!synth.current) return;
        synth.current.resume();
        setIsSpeaking(true);
        setIsPaused(false);
    };

    const stop = () => {
        if (!synth.current) return;
        synth.current.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
    };

    return {
        speak,
        pause,
        resume,
        stop,
        isSpeaking,
        isPaused
    };
};
