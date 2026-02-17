export interface BookChunk {
    id: number;
    content: string;
    chapter?: string;
}

export const processText = (rawText: string): BookChunk[] => {
    // Normalize line endings and whitespace
    // 1. Remove page numbers (lines that are just numbers)
    // 2. Replace newlines with spaces to form a continuous stream
    // 3. Remove multiple spaces
    const cleanText = rawText
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/^\s*\d+\s*$/gm, '') // Remove standalone page numbers
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ');

    const chunks: BookChunk[] = [];
    const CHUNK_SIZE = 800;
    const OVERLAP = 150;
    let currentId = 0;
    let index = 0;

    while (index < cleanText.length) {
        let endIndex = index + CHUNK_SIZE;

        // Try to find a sentence boundary near the end to avoid cutting sentences
        if (endIndex < cleanText.length) {
            const lookAhead = cleanText.slice(endIndex, endIndex + 100);
            const sentenceEnd = lookAhead.search(/[.!?]\s/);
            if (sentenceEnd !== -1) {
                endIndex += sentenceEnd + 1;
            }
        }

        const chunkContent = cleanText.slice(index, endIndex).trim();

        if (chunkContent.length > 50) {
            chunks.push({
                id: currentId++,
                content: chunkContent
            });
        }

        // Move forward, subtracting overlap
        index = endIndex - OVERLAP;

        // Safety check to prevent infinite loops if overlap >= chunk size (impossible with current consts)
        if (index >= cleanText.length - 1) break;
    }

    return chunks;
};
