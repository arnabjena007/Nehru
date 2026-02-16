import { motion } from 'framer-motion';
import { Headphones } from 'lucide-react';

interface Scene0Props {
    onComplete: () => void;
    onSkip: () => void;
}

export default function Scene0({ onComplete, onSkip }: Scene0Props) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white z-50 overflow-hidden"
        >
            {/* Film Grain Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 2 }}
                className="z-10 flex flex-col items-center gap-8"
                onAnimationComplete={() => setTimeout(onComplete, 4000)}
            >
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <Headphones size={48} className="text-gray-400" />
                </motion.div>

                <p className="font-serif text-xl tracking-wider text-gray-400">
                    This experience is best with headphones.
                </p>
            </motion.div>

            {/* Skip Button */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                whileHover={{ opacity: 1, scale: 1.05 }}
                onClick={onSkip}
                className="absolute top-8 right-8 text-white uppercase tracking-widest text-xs border border-white/30 hover:border-white px-4 py-2 rounded-full hover:bg-white/10 transition-all z-50"
            >
                Skip Intro
            </motion.button>
        </motion.div>
    );
}
