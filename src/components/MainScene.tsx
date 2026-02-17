import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Volume2 } from 'lucide-react';
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
            className="min-h-screen bg-black/90 flex items-center justify-center p-4 font-serif"
        >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[90vh]">
                {/* Header */}
                <div className="p-6 text-center border-b border-gray-100 bg-white z-10 relative">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask Nehru</h1>
                    <p className="text-gray-500 text-sm">Ask questions about 'The Discovery of India'</p>
                    {ttsError && (
                        <div className="absolute top-0 left-0 w-full bg-red-100 text-red-700 text-xs py-1 px-4">
                            {ttsError}
                        </div>
                    )}
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto bg-gray-50 p-4 scroll-smooth">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-4">
                            <p className="text-gray-400 mb-8">Select a topic to begin...</p>
                            <div className="w-full space-y-3">
                                {suggestedPrompts.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSend(prompt)}
                                        className="w-full p-4 text-left bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all text-gray-700 text-sm"
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
                                        <div className="max-w-[85%] bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none shadow-sm">
                                            <p className="font-sans text-lg">{msg.content}</p>
                                        </div>
                                    ) : (
                                        <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-xl font-bold text-gray-900">Response</h3>
                                                    {/* Relevance Badge */}
                                                    {(msg as any).score !== undefined && (
                                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide
                                                            ${(msg as any).score > 50 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                                                        `}>
                                                            MATCH SCORE: {(msg as any).score}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => {
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
                                                    className={`flex items-center gap-2 border px-4 py-2 rounded-full transition-colors text-sm font-medium ${playingMessageId === idx && isSpeaking
                                                        ? 'text-red-600 border-red-100 bg-red-50 hover:bg-red-100'
                                                        : 'text-blue-600 border-blue-100 bg-blue-50/50 hover:bg-blue-100'
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
                                            <p className="text-gray-700 leading-relaxed text-lg">
                                                {msg.content}
                                            </p>

                                            {/* References Section */}
                                            {msg.reference && (
                                                <div className="mt-6 pt-4 border-t border-gray-100">
                                                    <h4 className="font-bold text-gray-900 mb-1">Source</h4>
                                                    <p className="text-sm text-gray-500 italic">
                                                        {msg.reference}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Related Excerpts */}
                                            {(msg as any).related && (msg as any).related.length > 0 && (
                                                <div className="mt-6">
                                                    <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Other Relevant Excerpts</h4>
                                                    <div className="space-y-4">
                                                        {(msg as any).related.map((item: any, i: number) => (
                                                            <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <span className="font-semibold text-gray-600">Source {i + 2}</span>
                                                                    <span className="text-xs font-bold text-gray-400">SCORE: {item.score}</span>
                                                                </div>
                                                                <p className="text-gray-600 mb-2 line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">
                                                                    "{item.response}"
                                                                </p>
                                                                <p className="text-xs text-gray-400 italic">{item.reference}</p>
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
                                    className="flex items-center gap-2 text-gray-400 p-2"
                                >
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                            placeholder="Ask a question..."
                            className="flex-1 pl-4 pr-12 py-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400 text-gray-800 text-lg bg-gray-50"
                        />
                        <button
                            onClick={() => handleSend(input)}
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-sm"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
