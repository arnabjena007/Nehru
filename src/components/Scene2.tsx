import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '../hooks/useAudio';
import { AUDIO_CONFIG } from '../config/audio';

interface Scene2Props {
    onAudioEnd?: () => void;
}

export default function Scene2({ onAudioEnd }: Scene2Props) {
    const { play, audioRef } = useAudio({
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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black z-50 flex items-center justify-center p-8"
        >
            <div className="max-w-4xl text-center space-y-8 relative z-10 flex flex-col items-center">
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 2, delay: 0.5 }}
                    className="font-serif text-xl md:text-3xl leading-relaxed text-gray-300 tracking-wide"
                >
                    "Long years ago, we made a tryst with destiny, and now the time comes when we shall redeem our pledge, not wholly or in full measure, but very substantially.
                </motion.p>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 2, delay: 8 }}
                    className="font-serif text-xl md:text-3xl leading-relaxed text-gray-300 tracking-wide"
                >
                    At the stroke of the midnight hour, when the world sleeps, India will awake to life and freedom."
                </motion.p>

                {audioEnded && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        onClick={onAudioEnd}
                        className="mt-12 px-8 py-3 border border-amber-500/50 text-amber-500 rounded-full font-serif text-lg tracking-widest hover:border-amber-400 hover:text-amber-400 hover:bg-amber-900/10 transition-all"
                    >
                        [ Enter ]
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
