import { BookChunk } from './textProcessor';

export interface SearchResult {
    response: string;
    reference: string;
    score: number;
}

const STOP_WORDS = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'it', 'of', 'to', 'for', 'with', 'that', 'this', 'you', 'i', 'we', 'are', 'was', 'were', 'be', 'as', 'but', 'by', 'not', 'have', 'had', 'has', 'from', 'or', 'what', 'where', 'who', 'when', 'how', 'why']);

export const searchBook = (query: string, chunks: BookChunk[]): SearchResult[] => {
    const tokens = query.toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .split(/\s+/)
        .filter(t => t.length > 2 && !STOP_WORDS.has(t));

    console.log("Search tokens:", tokens);
    console.log("Total chunks to search:", chunks.length);

    if (tokens.length === 0) return [];

    // Sort by score descending
    const sortedChunks = chunks
        .map(chunk => {
            let score = 0;
            const lowerContent = chunk.content.toLowerCase();

            tokens.forEach(token => {
                if (lowerContent.includes(token)) {
                    score += 10;
                    const count = (lowerContent.match(new RegExp(token, 'g')) || []).length;
                    score += count * 2;
                }
            });

            // Exact phrase score boost
            const lowerQuery = query.toLowerCase();
            if (lowerContent.includes(lowerQuery)) {
                score += 30;
            }

            if (chunk.content.length < 100) score *= 0.8;

            return { chunk, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);

    // Return top 5 results
    return sortedChunks.slice(0, 5).map(item => ({
        response: item.chunk.content,
        reference: item.chunk.chapter ? item.chunk.chapter : '',
        score: item.score
    }));
};

export const generateExtractiveSummary = (query: string, results: SearchResult[]): string => {
    if (results.length === 0) return "I could not find any relevant information.";

    const tokens = query.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(t => t.length > 2 && !STOP_WORDS.has(t));

    // Collect sentences from top 3 results
    const allSentences: string[] = [];
    results.slice(0, 3).forEach(result => {
        // Simple sentence splitting
        const sentences = result.response.match(/[^.!?]+[.!?]+/g) || [result.response];
        allSentences.push(...sentences);
    });

    // Score sentences
    const scoredSentences = allSentences.map(sentence => {
        let score = 0;
        const lowerSent = sentence.toLowerCase();

        // Keyword matching
        tokens.forEach(token => {
            if (lowerSent.includes(token)) score += 1;
        });

        // Penalize very short or very long sentences
        if (sentence.length < 20) score *= 0.5;
        if (sentence.length > 200) score *= 0.8;

        return { sentence: sentence.trim(), score };
    });

    // Pick top 3 sentences, ensuring unique content
    const topSentences = scoredSentences
        .sort((a, b) => b.score - a.score)
        .filter((item, index, self) =>
            index === self.findIndex((t) => t.sentence === item.sentence) // Deduplicate
        )
        .slice(0, 3)
        .map(item => item.sentence);

    return topSentences.join(" ");
};
