import { motion } from 'framer-motion';

interface Scene1Props {
    onStart: () => void;
}

export default function Scene1({ onStart }: Scene1Props) {
    return (
        <div className="fixed inset-0 overflow-hidden bg-[radial-gradient(circle_at_center,#1f1713_0%,#090807_60%,#040404_100%)] flex flex-col items-center justify-center text-white z-40">
            {/* Film Grain (Reused) */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />

            <div className="z-10 text-center space-y-14 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="font-serif text-2xl md:text-4xl tracking-[0.35em] space-y-4 text-stone-200"
                >
                    <p>15 August 1947</p>
                    <p>Midnight</p>
                    <p>A nation awakens</p>
                </motion.div>

                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5, duration: 1 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={onStart}
                    className="px-8 py-3 border border-amber-100/25 font-serif text-lg tracking-[0.3em] hover:border-amber-100/60 transition-colors bg-white/5 backdrop-blur-sm text-amber-50"
                >
                    Start Experience
                </motion.button>
            </div>
        </div>
    );
}
