import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Headphones } from 'lucide-react';

interface Scene0Props {
    onComplete: () => void;
    onSkip: () => void;
}

const PORTRAIT_URL = "/jawaharlal-nehru.svg";

export default function Scene0({ onComplete, onSkip }: Scene0Props) {
    const [portraitSvg, setPortraitSvg] = useState("");

    useEffect(() => {
        fetch(PORTRAIT_URL)
            .then((response) => response.text())
            .then((svg) => setPortraitSvg(svg.replace(/<\?xml[^>]*>/, "").replace(/<!DOCTYPE[^>]*>/, "")))
            .catch(console.error);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 overflow-hidden bg-[radial-gradient(circle_at_top,#2b1d16_0%,#120f0d_32%,#050404_72%)] flex flex-col items-center justify-center text-white z-50"
        >
            <div className="pointer-events-none absolute inset-5 border border-amber-100/10" />
            <div className="pointer-events-none absolute left-8 right-8 top-8 h-px bg-amber-100/10" />
            <div className="pointer-events-none absolute bottom-8 left-8 right-8 h-px bg-amber-100/10" />
            <div
                className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-screen"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />

            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-5 px-5 py-6 text-center md:gap-6 md:py-8">
                <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                    className="relative shrink-0"
                    style={{
                        height: "clamp(220px, 48vh, 430px)",
                        width: "clamp(180px, 39vh, 350px)",
                    }}
                >
                    {portraitSvg ? (
                        <motion.div
                            className="portrait-line-art absolute inset-0"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            dangerouslySetInnerHTML={{ __html: portraitSvg }}
                        />
                    ) : (
                        <img
                            src={PORTRAIT_URL}
                            alt="Jawaharlal Nehru line portrait"
                            className="h-full w-full object-contain opacity-95"
                        />
                    )}
                </motion.div>

                <div className="w-full max-w-xl space-y-4 md:space-y-5">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 1 }}
                        className="space-y-2"
                    >
                        <p className="text-xs uppercase tracking-[0.45em] text-amber-200/60">Ask Nehru</p>
                        <p className="font-serif text-xl tracking-wide text-stone-200 md:text-2xl">
                            A quiet introduction to an historical voice.
                        </p>
                        <p className="font-sans text-sm leading-6 text-stone-400 md:text-base">
                            Watch the portrait draw itself, then step into the conversation.
                        </p>
                    </motion.div>

                    <div className="mx-auto w-full max-w-md border border-amber-100/18 bg-black/10 p-3">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2, duration: 1 }}
                            className="mb-3 flex items-center justify-center gap-2 border-b border-amber-100/12 pb-3 text-sm text-stone-300"
                        >
                            <Headphones size={18} className="text-amber-200/80" />
                            Best with headphones
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 2.5, duration: 0.8 }}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onComplete}
                            className="w-full border border-amber-100/45 bg-amber-100/12 px-6 py-3.5 font-serif text-sm uppercase tracking-[0.28em] text-amber-50 transition-all hover:border-amber-100/75 hover:bg-amber-100/22"
                        >
                            Continue
                        </motion.button>
                    </div>
                </div>
            </div>

            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.75 }}
                whileHover={{ opacity: 1 }}
                onClick={onSkip}
                className="absolute top-10 right-10 z-50 border border-amber-100/25 bg-black/25 px-5 py-2.5 font-serif text-[11px] uppercase tracking-[0.24em] text-amber-50/85 transition-all hover:border-amber-100/55 hover:bg-amber-100/10 hover:text-amber-50"
            >
                Skip Intro
            </motion.button>
        </motion.div>
    );
}
