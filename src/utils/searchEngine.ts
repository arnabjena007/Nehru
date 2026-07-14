import { BookChunk } from './textProcessor';

export interface SearchResult {
    response: string;
    reference: string;
    score: number;
}

const STOP_WORDS = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'it', 'of', 'to', 'for', 'with', 'that', 'this', 'you', 'i', 'we', 'are', 'was', 'were', 'be', 'as', 'but', 'by', 'not', 'have', 'had', 'has', 'from', 'or', 'what', 'where', 'who', 'when', 'how', 'why']);

const normalizeToken = (token: string) => {
    let normalized = token.toLowerCase();

    if (normalized.endsWith('ies') && normalized.length > 4) {
        normalized = `${normalized.slice(0, -3)}y`;
    } else if (normalized.endsWith('ing') && normalized.length > 5) {
        normalized = normalized.slice(0, -3);
    } else if (normalized.endsWith('ed') && normalized.length > 4) {
        normalized = normalized.slice(0, -2);
    } else if (normalized.endsWith('s') && normalized.length > 4) {
        normalized = normalized.slice(0, -1);
    }

    return normalized;
};

const tokenize = (text: string) =>
    text.toLowerCase()
        .replace(/[^\w\s']/g, ' ')
        .split(/\s+/)
        .map(token => token.replace(/^'+|'+$/g, ''))
        .filter(token => token.length > 2 && !STOP_WORDS.has(token))
        .map(normalizeToken);

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const unique = (values: string[]) => Array.from(new Set(values));

export const searchBook = (query: string, chunks: BookChunk[]): SearchResult[] => {
    const tokens = unique(tokenize(query));
    const queryTerms = query.toLowerCase().replace(/[^\w\s']/g, ' ').replace(/\s+/g, ' ').trim();

    console.log("Search tokens:", tokens);
    console.log("Total chunks to search:", chunks.length);

    if (tokens.length === 0) return [];

    // Sort by score descending
    const sortedChunks = chunks
        .map(chunk => {
            let score = 0;
            const lowerContent = chunk.content.toLowerCase();
            const contentTokens = tokenize(chunk.content);
            const tokenCounts = contentTokens.reduce<Record<string, number>>((counts, token) => {
                counts[token] = (counts[token] || 0) + 1;
                return counts;
            }, {});

            tokens.forEach(token => {
                const count = tokenCounts[token] || 0;
                if (count > 0) {
                    score += 12;
                    score += Math.min(count, 8) * 2;
                }
            });

            const matchedTokens = tokens.filter(token => tokenCounts[token]);
            const coverage = matchedTokens.length / tokens.length;
            score += coverage * 35;

            if (matchedTokens.length >= 2) {
                const positions = contentTokens
                    .map((token, index) => matchedTokens.includes(token) ? index : -1)
                    .filter(index => index !== -1);

                const tightestWindow = positions.reduce((best, startPosition, startIndex) => {
                    for (let endIndex = startIndex + 1; endIndex < positions.length; endIndex++) {
                        const window = positions[endIndex] - startPosition;
                        if (window > 0 && window < best) return window;
                    }
                    return best;
                }, Number.POSITIVE_INFINITY);

                if (tightestWindow < 25) score += 20;
                if (tightestWindow < 10) score += 20;
            }

            // Exact phrase score boost
            if (queryTerms && lowerContent.includes(queryTerms)) {
                score += 60;
            }

            const importantPhrases = queryTerms.match(/\b[\w']+(?:\s+[\w']+){1,3}\b/g) || [];
            importantPhrases.forEach(phrase => {
                if (phrase.length > 6 && lowerContent.includes(phrase)) score += 12;
            });

            tokens.forEach(token => {
                const wordMatch = new RegExp(`\\b${escapeRegex(token)}\\b`, 'i');
                if (wordMatch.test(chunk.content)) {
                    score += 4;
                }
            });

            if (coverage < 0.34) {
                score *= 0.55;
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

    const tokens = unique(tokenize(query));

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
        const sentenceTokens = tokenize(sentence);

        // Keyword matching
        tokens.forEach(token => {
            if (sentenceTokens.includes(token)) score += 2;
        });

        const coverage = tokens.filter(token => sentenceTokens.includes(token)).length / Math.max(tokens.length, 1);
        score += coverage * 5;

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
