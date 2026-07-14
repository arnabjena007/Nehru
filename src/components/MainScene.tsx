import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Send, Sparkles, Volume2, VolumeX } from 'lucide-react';
import rawText from '../data/discovery_of_india.txt?raw';
import { processText, BookChunk } from '../utils/textProcessor';
import { searchBook, generateExtractiveSummary } from '../utils/searchEngine';
import { generateAnswer } from '../services/gemini';
import { knowledgeBase, fallbackResponse, QAEntry } from '../data/knowledgeBase';
import { useTTS } from '../hooks/useTTS';

export default function MainScene() {
    const [messages, setMessages] = useState<Array<{
        role: 'user' | 'assistant',
        content: string,
        reference?: string,
        score?: number,
        related?: any[]
    }>>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [bookChunks, setBookChunks] = useState<BookChunk[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [ttsError, setTtsError] = useState<string | null>(null);
    const { speak, stop, isSpeaking, isSupported } = useTTS({
        onError: (err) => {
            console.error("TTS Error in MainScene:", err);
            setTtsError("Audio playback failed. Please check your browser settings.");
            setTimeout(() => setTtsError(null), 3000);
        }
    });
    const [playingMessageId, setPlayingMessageId] = useState<number | null>(null);
    const [showHowItWorks, setShowHowItWorks] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);

    const suggestedPrompts = [
        "What is the central idea of The Discovery of India?",
        "How has India's past shaped its present?",
        "Tell me about 'Unity in Diversity'.",
        "What is the scientific temper?",
        "How did the British Empire impact India's economy?",
        "What is the significance of the caste system in Indian history?",
        "Discuss the role of religion in Indian society.",
        "What is the future of India according to Nehru?"
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const formatScore = (score: number) => Math.round(score);

    useEffect(() => {
        // Process text on mount
        console.log("Raw text length:", rawText.length);
        const chunks = processText(rawText);
        console.log("Processed chunks:", chunks.length);
        if (chunks.length > 0) {
            console.log("Sample chunk:", chunks[0]);
        }
        setBookChunks(chunks);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    useEffect(() => {
        if (!soundEnabled && isSpeaking) {
            stop();
            setPlayingMessageId(null);
        }
    }, [soundEnabled, isSpeaking, stop]);

    const findResponse = (query: string) => {
        console.log("Searching for:", query);

        // 1. Try full text search first
        const searchResults = searchBook(query, bookChunks);
        console.log("Search results:", searchResults);

        if (searchResults.length > 0) {
            return { type: 'search', results: searchResults };
        }

        // 2. Fallback to manually curated knowledge base
        const lowerQuery = query.toLowerCase();
        const kbMatch = knowledgeBase.find((entry: QAEntry) =>
            entry.keywords.some((keyword: string) => lowerQuery.includes(keyword))
        );

        if (kbMatch) {
            return { type: 'kb', result: kbMatch };
        }

        // 3. Fallback message
        return { type: 'fallback', result: fallbackResponse };
    };

    const handleSend = async (messageText: string) => {
        if (!messageText.trim()) return;

        // Add user message
        const userMessage = messageText;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        const result = findResponse(userMessage);

        // Prepare default/fallback response
        let assistantMessage: any = {
            role: 'assistant',
            content: "I'm sorry, I couldn't find relevant information.",
            reference: undefined
        };

        if (result.type === 'search' && result.results && result.results.length > 0) {
            // Try to generate AI answer
            const topChunks = result.results.slice(0, 3).map(r => r.response);
            const aiResponse = await generateAnswer(userMessage, topChunks);

            if (aiResponse) {
                assistantMessage = {
                    role: 'assistant',
                    content: aiResponse,
                    reference: undefined,
                    score: result.results[0].score,
                    related: result.results
                };
            } else {
                // Fallback to extractive summary
                const summary = generateExtractiveSummary(userMessage, result.results);
                assistantMessage = {
                    role: 'assistant',
                    content: summary,
                    reference: undefined,
                    score: result.results[0].score,
                    related: result.results
                };
            }
        } else if (result.type === 'kb') {
            assistantMessage = {
                role: 'assistant',
                content: result.result!.response,
                reference: result.result!.reference,
                score: 100
            };
        } else {
            assistantMessage = {
                role: 'assistant',
                content: result.result!.response,
                reference: result.result!.reference
            };
        }

        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#15110d] font-serif"
        >
            <div className="relative w-screen h-screen overflow-hidden flex flex-col border border-[#6f604a]/45 bg-[#eee5d6] text-[#211b15]">
                <div className="pointer-events-none absolute inset-0 opacity-[0.25]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)' opacity='0.25'/%3E%3C/svg%3E")`
                }} />
                {/* Header */}
                <div className="p-5 md:p-6 text-center border-b border-[#6f604a]/30 bg-[#eee5d6] z-10 relative">
                    <div className="absolute right-4 top-4 flex items-center gap-2">
                        <button
                            onClick={() => setSoundEnabled(prev => !prev)}
                            className="grid h-9 w-9 place-items-center rounded-full border border-[#6f604a]/45 bg-[#f6efdf] text-[#5c4b35] hover:bg-[#eadcc1] transition-colors"
                            title={soundEnabled ? "Sound on" : "Sound off"}
                            aria-label={soundEnabled ? "Turn sound off" : "Turn sound on"}
                        >
                            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                        </button>
                        <button
                            onClick={() => setShowHowItWorks(prev => !prev)}
                            className="grid h-9 w-9 place-items-center rounded-full border border-[#6f604a]/45 bg-[#f6efdf] text-[#5c4b35] hover:bg-[#eadcc1] transition-colors"
                            title="How it works"
                            aria-label="Show how it works"
                        >
                            <HelpCircle size={16} />
                        </button>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded border border-[#6f604a]/35 bg-[#f6efdf] px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-[#6b583c] mb-4">
                        <Sparkles size={12} />
                        Ask Nehru
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[#211b15] mb-2">A conversation with history</h1>
                    <p className="text-[#6b6258] text-sm md:text-base">Ask questions about <span className="italic">The Discovery of India</span></p>
                    {ttsError && (
                        <div className="absolute top-0 left-0 w-full bg-red-100 text-red-700 text-xs py-1 px-4">
                            {ttsError}
                        </div>
                    )}
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth z-10">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-4">
                            <p className="text-[#6b583c] mb-8 text-sm uppercase tracking-[0.35em]">Select a topic to begin</p>
                            <div className="w-full space-y-3">
                                {suggestedPrompts.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSend(prompt)}
                                        className="w-full p-4 md:p-5 text-left bg-[#f9f3e7] border border-[#8d7b5f]/35 hover:border-[#8b6f3d] hover:bg-[#f3e8d3] transition-all text-[#2f271e] text-sm md:text-base"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 pb-4">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    {msg.role === 'user' ? (
                                        <div className="max-w-[85%] bg-[#6e4b2f] text-[#fff7e8] p-4 md:p-5 rounded-md border border-[#4d3523]">
                                            <p className="font-sans text-base md:text-lg leading-relaxed">{msg.content}</p>
                                        </div>
                                    ) : (
                                        <div className="w-full bg-[#f8f1e4] p-5 md:p-7 rounded-md border border-[#8d7b5f]/35">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-xl font-bold text-[#211b15]">Response</h3>
                                                    {/* Relevance Badge */}
                                                    {(msg as any).score !== undefined && (
                                                        <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wide
                                                            ${(msg as any).score > 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}
                                                        `}>
                                                            SCORE: {formatScore((msg as any).score)}
                                                        </span>
                                                    )}
                                                </div>
                                                    <button
                                                    onClick={() => {
                                                        if (!soundEnabled) {
                                                            setTtsError("Sound is turned off.");
                                                            setTimeout(() => setTtsError(null), 1600);
                                                            return;
                                                        }
                                                        if (!isSupported) {
                                                            setTtsError("Text-to-Speech is not supported in this browser.");
                                                            setTimeout(() => setTtsError(null), 3000);
                                                            return;
                                                        }
                                                        if (playingMessageId === idx && isSpeaking) {
                                                            stop();
                                                            setPlayingMessageId(null);
                                                        } else {
                                                            speak(msg.content);
                                                            setPlayingMessageId(idx);
                                                        }
                                                    }}
                                                    className={`flex items-center gap-2 border px-4 py-2 transition-colors text-sm font-medium ${playingMessageId === idx && isSpeaking
                                                        ? 'text-red-600 border-red-100 bg-red-50 hover:bg-red-100'
                                                        : 'text-[#6e4b2f] border-[#8d7b5f]/35 bg-[#efe2ca] hover:bg-[#e7d4b4]'
                                                        }`}
                                                    title={!isSupported ? "Audio not supported" : "Read aloud"}
                                                >
                                                    {playingMessageId === idx && isSpeaking ? (
                                                        <>
                                                            <span className="animate-pulse">●</span> Stop
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Volume2 size={18} /> Play
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-[#33291f] leading-relaxed text-lg md:text-[1.05rem]">
                                                {msg.content}
                                            </p>

                                            {/* References Section */}
                                            {msg.reference && (
                                                <div className="mt-6 pt-4 border-t border-[#8d7b5f]/35">
                                                    <h4 className="font-bold text-[#211b15] mb-1">Source</h4>
                                                    <p className="text-sm text-[#6b6258] italic">
                                                        {msg.reference}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Related Excerpts */}
                                            {(msg as any).related && (msg as any).related.length > 0 && (
                                                <div className="mt-6">
                                                    <h4 className="font-bold text-[#211b15] mb-3 text-sm uppercase tracking-wider">Other Relevant Excerpts</h4>
                                                    <div className="space-y-4">
                                                        {(msg as any).related.map((item: any, i: number) => (
                                                            <div key={i} className="bg-[#efe2ca] p-4 rounded-md border border-[#8d7b5f]/35 text-sm">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <span className="font-semibold text-[#5c4b35]">Source {i + 2}</span>
                                                                    <span className="text-xs font-bold text-[#7a6a55]">SCORE: {formatScore(item.score)}</span>
                                                                </div>
                                                                <p className="text-[#4a3b2b] mb-2 line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">
                                                                    "{item.response}"
                                                                </p>
                                                                <p className="text-xs text-[#7a6a55] italic">{item.reference}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-2 text-stone-400 p-2"
                                >
                                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-75" />
                                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce delay-150" />
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-5 bg-[#eee5d6] border-t border-[#6f604a]/30 z-10">
                    <div className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                            placeholder="Ask a question..."
                            className="flex-1 pl-4 pr-12 py-4 border border-[#8d7b5f]/45 focus:border-[#6e4b2f] focus:ring-2 focus:ring-[#6e4b2f]/15 outline-none transition-all placeholder:text-[#958879] text-[#211b15] text-base md:text-lg bg-[#fbf6ec]"
                        />
                        <button
                            onClick={() => handleSend(input)}
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 p-2 bg-[#6e4b2f] text-[#fff7e8] hover:bg-[#563823] disabled:opacity-50 disabled:hover:bg-[#6e4b2f] transition-all"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
            {showHowItWorks && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 z-[80] flex items-center justify-center bg-[#15110d]/45 p-4"
                    onClick={() => setShowHowItWorks(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-[min(94vw,820px)] max-h-[84vh] overflow-y-auto border border-[#6f604a]/55 bg-[#fbf6ec] p-6 text-left text-sm leading-6 text-[#33291f] shadow-[0_18px_45px_rgba(0,0,0,0.28)]"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <h2 className="font-bold uppercase tracking-[0.22em] text-[#5c4b35]">How it works</h2>
                            <button
                                onClick={() => setShowHowItWorks(false)}
                                className="border border-[#6f604a]/45 bg-[#f6efdf] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#5c4b35] hover:bg-[#eadcc1]"
                            >
                                Close
                            </button>
                        </div>
                        <div className="space-y-5">
                            <section>
                                <h3 className="mb-1 font-bold uppercase tracking-[0.18em] text-[#6e4b2f]">1. Book Loading</h3>
                                <p>The app imports the full text of <span className="italic">The Discovery of India</span> directly into the browser as raw text. This happens before searching, so every answer starts from the same source document rather than from random internet knowledge.</p>
                            </section>

                            <section>
                                <h3 className="mb-1 font-bold uppercase tracking-[0.18em] text-[#6e4b2f]">2. Cleaning The Text</h3>
                                <p>The raw book text is normalized first. Line endings are cleaned, standalone page numbers are removed, repeated whitespace is compressed, and the text is converted into a continuous readable stream.</p>
                                <p className="mt-2">This matters because scanned or copied books often contain broken lines, odd spacing, and page markers. Cleaning prevents those artifacts from confusing the search.</p>
                            </section>

                            <section>
                                <h3 className="mb-1 font-bold uppercase tracking-[0.18em] text-[#6e4b2f]">3. Chunking The Book</h3>
                                <p>The book is split into passages of about 800 characters, with around 150 characters of overlap between neighboring chunks.</p>
                                <p className="mt-2">The overlap is important. If an idea begins at the end of one passage and continues into the next, overlap helps avoid losing that meaning at the boundary.</p>
                            </section>

                            <section>
                                <h3 className="mb-1 font-bold uppercase tracking-[0.18em] text-[#6e4b2f]">4. Understanding Your Question</h3>
                                <p>When you type a question, the app removes common words such as “the”, “is”, “what”, and “how”. It keeps the meaningful words, then lightly normalizes them. For example, simple endings like plural “s”, “ed”, and “ing” are reduced so related word forms can match better.</p>
                                <p className="mt-2">This is not full artificial intelligence yet. It is careful lexical search, meaning it works by comparing important words and phrases.</p>
                            </section>

                            <section>
                                <h3 className="mb-1 font-bold uppercase tracking-[0.18em] text-[#6e4b2f]">5. Ranking Passages</h3>
                                <p>Every passage receives a score. The score increases when important words from your question appear in the passage.</p>
                                <p className="mt-2">The search also rewards passages that match more of your question, contain exact phrases, and place the matching words close together. A passage where several key terms appear near each other is usually more relevant than a passage where those words are scattered far apart.</p>
                            </section>

                            <section>
                                <h3 className="mb-1 font-bold uppercase tracking-[0.18em] text-[#6e4b2f]">6. Match Score</h3>
                                <p>The score shown beside an answer is the relevance score of the top passage used for that answer. It is rounded to a small whole number so it is easier to read.</p>
                                <p className="mt-2">A higher score usually means the answer was supported by a passage with stronger word, phrase, and proximity matches. It is not a percentage and should not be read as absolute truth. It is a retrieval confidence signal.</p>
                            </section>

                            <section>
                                <h3 className="mb-1 font-bold uppercase tracking-[0.18em] text-[#6e4b2f]">7. Answer Generation</h3>
                                <p>After ranking, the app sends the best passages to Gemini. Gemini is instructed to answer only from the provided passages and not invent outside information.</p>
                                <p className="mt-2">The prompt also asks for a calm, historical, Nehru-inspired voice, while keeping the answer concise and grounded in the source text.</p>
                            </section>

                            <section>
                                <h3 className="mb-1 font-bold uppercase tracking-[0.18em] text-[#6e4b2f]">8. Fallback Summary</h3>
                                <p>If Gemini is unavailable, the app does not stop. It falls back to an extractive summary. That means it selects the best matching sentences from the retrieved passages and joins them into a concise answer.</p>
                                <p className="mt-2">This fallback is less fluent than Gemini, but it is still grounded in the book text.</p>
                            </section>

                            <section>
                                <h3 className="mb-1 font-bold uppercase tracking-[0.18em] text-[#6e4b2f]">9. Knowledge Base Fallback</h3>
                                <p>If the book search returns no matching passage, the app checks a small curated knowledge base for common topics like scientific temper, unity in diversity, religion, Gandhi, and Ahmednagar Fort.</p>
                                <p className="mt-2">This is only a backup. The main search through the book is the primary path.</p>
                            </section>

                            <section>
                                <h3 className="mb-1 font-bold uppercase tracking-[0.18em] text-[#6e4b2f]">10. Limits</h3>
                                <p>The current search is improved keyword search, not full semantic search. If your question uses very different wording from the book, the system may miss the best passage.</p>
                                <p className="mt-2">The strongest future improvement would be embeddings. With embeddings, both the book passages and your question are converted into meaning-based vectors, allowing the app to find relevant passages even when the exact words are different.</p>
                            </section>

                            <section>
                                <h3 className="mb-1 font-bold uppercase tracking-[0.18em] text-[#6e4b2f]">Short Version</h3>
                                <p>Your question is cleaned, compared against overlapping book passages, ranked by relevance, and answered from the strongest matching passages. The app tries Gemini first, then falls back to sentence extraction or curated notes when needed.</p>
                            </section>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </motion.div>
    );
}
