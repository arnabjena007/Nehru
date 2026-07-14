import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '../hooks/useAudio';
import { AUDIO_CONFIG } from '../config/audio';

interface Scene2Props {
    onAudioEnd?: () => void;
}

export default function Scene2({ onAudioEnd }: Scene2Props) {
    const { play, pause, audioRef } = useAudio({
        src: AUDIO_CONFIG.SPEECH,
        volume: 1
    });

    const [audioEnded, setAudioEnded] = useState(false);

    useEffect(() => {
        // Start audio immediately
        const timer = setTimeout(() => {
            play();
        }, 500); // Slight delay for smooth transition

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => {
            setAudioEnded(true);
        };

        audio.addEventListener('ended', handleEnded);
        return () => audio.removeEventListener('ended', handleEnded);
    }, [audioRef]);

    const handleSkipSpeech = () => {
        pause();
        onAudioEnd?.();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top,#241a15_0%,#0d0a09_50%,#040404_100%)]"
        >
            <div className="max-w-4xl text-center space-y-8 relative z-10 flex flex-col items-center px-2">
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 2, delay: 0.5 }}
                    className="font-serif text-xl md:text-3xl leading-relaxed text-stone-200 tracking-wide max-w-3xl"
                >
                    "Long years ago, we made a tryst with destiny, and now the time comes when we shall redeem our pledge, not wholly or in full measure, but very substantially.
                </motion.p>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 2, delay: 8 }}
                    className="font-serif text-xl md:text-3xl leading-relaxed text-stone-200 tracking-wide max-w-3xl"
                >
                    At the stroke of the midnight hour, when the world sleeps, India will awake to life and freedom."
                </motion.p>

                {audioEnded && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        onClick={onAudioEnd}
                        className="mt-12 px-8 py-3 border border-amber-100/35 text-amber-50 font-serif text-lg tracking-[0.3em] hover:border-amber-100/70 hover:bg-white/10 transition-all bg-white/5 backdrop-blur-sm"
                    >
                        Enter
                    </motion.button>
                )}

                {!audioEnded && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.9 }}
                        transition={{ delay: 2.4, duration: 1 }}
                        whileHover={{ scale: 1.04 }}
                        onClick={handleSkipSpeech}
                        className="mt-6 px-7 py-3 border border-amber-100/30 text-xs uppercase tracking-[0.3em] text-amber-50 bg-white/5 hover:bg-white/10 hover:border-amber-100/60 transition-colors backdrop-blur-sm"
                    >
                        Skip Speech
                    </motion.button>
                )}
            </div>

            {/* Film Grain Reuse */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />
        </motion.div>
    );
}
