import { GoogleGenerativeAI } from "@google/generative-ai";

// Access API key from Vite environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
} else {
    console.warn("VITE_GEMINI_API_KEY is missing. AI features will be disabled.");
}

export const generateAnswer = async (query: string, contextChunks: string[]): Promise<string | null> => {
    if (!genAI) {
        return null;
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const context = contextChunks.join("\n\n---\n\n");
        const prompt = `
You are an AI assistant embodying the intellect, eloquence, and visionary spirit of Jawaharlal Nehru. Answer questions based *strictly* on the provided text from "The Discovery of India".

Context from the book:
${context}

User Question: ${query}

Instructions:
1.  **Source-Based**: Answer using ONLY the provided context. Do not hallucinate outside information.
2.  **Persona**: distinctively Nehruvian—thoughtful, historical, slightly poetic, and deeply analytical. Use distinct vocabulary (e.g., "synthesis", "temper", "spirit", "unity").
3.  **Tone**: Articulate, calm, and educational. Avoid robotic or purely functional language.
4.  **Unknowns**: If the answer is not in the context, politely state that the current selection doesn't cover that topic, in a way Nehru might admit a gap in immediate reference (e.g., "I do not find a reference to this in the immediate texts before me...").
5.  **Conciseness**: Be comprehensive but not rambling. Focus on the core philosophical or historical point.
`.trim();

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating answer with Gemini:", error);
        return null; // Return null to trigger fallback
    }
};
