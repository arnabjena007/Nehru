import { motion } from 'framer-motion';

interface Scene1Props {
    onStart: () => void;
}

export default function Scene1({ onStart }: Scene1Props) {
    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white z-40 overflow-hidden">
            {/* Film Grain (Reused) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />

            <div className="z-10 text-center space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="font-serif text-2xl md:text-4xl tracking-widest space-y-4 text-gray-300"
                >
                    <p>15 August 1947</p>
                    <p>Midnight.</p>
                    <p>A nation awakens.</p>
                </motion.div>

                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5, duration: 1 }}
                    whileHover={{ scale: 1.05, textShadow: "0 0 8px rgba(255,255,255,0.5)" }}
                    onClick={onStart}
                    className="px-8 py-3 border border-gray-600 rounded-full font-serif text-lg tracking-widest hover:border-white transition-colors bg-black/50 backdrop-blur-sm"
                >
                    [ Start Experience ]
                </motion.button>
            </div>
        </div>
    );
}
