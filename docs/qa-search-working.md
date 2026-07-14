# Ask Nehru Question Answering Flow

This document explains how the app turns a user question into a concise answer from `The Discovery of India`.

## 1. Book Loading

The full book text is imported in `MainScene.tsx`:

```ts
import rawText from '../data/discovery_of_india.txt?raw';
```

When the main chat loads, `processText(rawText)` prepares the book for search.

## 2. Text Processing

File: `src/utils/textProcessor.ts`

The processor:

1. Normalizes line endings.
2. Removes standalone page numbers.
3. Converts the book into one continuous text stream.
4. Splits the book into overlapping chunks.

Current chunk settings:

```ts
const CHUNK_SIZE = 800;
const OVERLAP = 150;
```

The overlap helps avoid losing useful context when an answer falls across a chunk boundary.

## 3. Query Search

File: `src/utils/searchEngine.ts`

When the user asks a question, `searchBook(query, bookChunks)` ranks the chunks.

The improved scorer now uses:

1. Stop-word removal: removes common words like `the`, `is`, `what`, `how`.
2. Light stemming: treats simple variants like `civilizations`, `civilized`, and `civilizing` more similarly.
3. Whole-token matching: avoids accidental substring matches.
4. Coverage scoring: chunks matching more of the user's important words rank higher.
5. Phrase boost: exact phrases from the user question get extra score.
6. Proximity boost: chunks where matched words appear close together rank higher.
7. Short-context penalty: very short chunks are slightly down-ranked.

The function returns the top 5 matching chunks.

## 4. Answer Generation

File: `src/services/gemini.ts`

The app sends the top 3 search chunks to Gemini:

```ts
const topChunks = result.results.slice(0, 3).map(r => r.response);
const aiResponse = await generateAnswer(userMessage, topChunks);
```

Gemini is instructed to answer only from those chunks and stay concise.

If Gemini is unavailable or fails, the app falls back to `generateExtractiveSummary`, which picks the best matching sentences from the top search results.

## 5. Knowledge Base Fallback

File: `src/data/knowledgeBase.ts`

If book search finds nothing, the app checks a small manually curated knowledge base for common themes such as:

- Scientific temper
- Unity in diversity
- Religion
- Gandhi
- Ahmednagar Fort

This is useful for known topics, but the book search is the primary source.

## Accuracy Notes

The current system is better than simple keyword search, but it is still lexical. That means it is strongest when the user's question shares words or phrases with the book.

For even higher accuracy, the next step would be semantic search with embeddings:

1. Convert every book chunk into an embedding vector.
2. Convert the user question into an embedding vector.
3. Retrieve chunks by semantic similarity, not just shared words.
4. Send the best semantic matches to Gemini.

That would improve questions where the wording differs from the book but the meaning is the same.
