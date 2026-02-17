# Nehru: A Cinematic Discovery of India Experience

This project is an immersive web application designed to bring Jawaharlal Nehru's "The Discovery of India" to life. It features a narrative-driven experience, ambient audio, and an interactive AI-powered Q&A system where users can converse with a digital persona of Nehru about his writings and philosophy.

## Features

- **Immersive Narrative**: A guided multi-scene experience with visual storytelling and smooth transitions.
- **Interactive Q&A**: Ask questions directly to an AI model trained on the context of "The Discovery of India".
- **AI Persona**: The AI response is styled to reflect Nehru's articulation, vocabulary, and philosophical outlook.
- **Text-to-Speech (TTS)**: Listens to the AI's responses using browser-native speech synthesis.
- **Responsive Design**: Optimized for various screen sizes with a clean, modern interface.
- **Dynamic Content**: Processes raw text from the book to provide accurate, source-based answers.

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **AI Integration**: Google Generative AI SDK (Gemini API)
- **Icons**: Lucide React

## Prerequisites

Before running the project, ensure you have the following:

- Node.js (v18 or higher)
- npm or yarn
- A Google Gemini API Key

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd nehru
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

## Usage

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

3. Experience the intro scenes or skip to the main interface.

4. In the "Ask Nehru" section, select a suggested topic or type your own question about Indian history or "The Discovery of India".

## Project Structure

- `src/components`: React components for different scenes (Scene0, Scene1, MainScene, etc.)
- `src/hooks`: Custom hooks for Audio and TTS.
- `src/services`: API integration services (Gemini).
- `src/utils`: Helper functions for text processing and search logic.
- `src/data`: Static data and raw text content.

## License

This project is open source and available under the MIT License.
