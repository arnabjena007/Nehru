import React, { useState } from "react";
import { Send, Volume2, StopCircle } from "lucide-react";

const API_URL = "https://search-4k3czwhtva-uc.a.run.app/search";

interface Reference {
  text: string;
  relevance: string;
}

interface SearchResponse {
  summary: string;
  references: Reference[];
}

function App() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] =
    useState<SpeechSynthesisUtterance | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const playResponse = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(response?.summary || "");
      const voices = window.speechSynthesis.getVoices();
      const maleVoice = voices.find((voice) =>
        voice.name.toLowerCase().includes("male")
      );
      if (maleVoice) {
        utterance.voice = maleVoice;
      }

      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onend = () => {
        setIsPlaying(false);
        setSpeechSynthesis(null);
      };

      setSpeechSynthesis(utterance);
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopPlaying = () => {
    if (speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setSpeechSynthesis(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-2">Ask Nehru</h1>
      <p className="text-gray-600 text-center mb-8">
        Ask questions about 'The Discovery of India'
      </p>

      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="E.g., What does Nehru say about ancient India?"
          className="w-full min-h-32 p-4 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded w-full hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={18} />
          {loading ? "Asking..." : "Ask"}
        </button>
      </form>

      {response && (
        <div className="space-y-6">
          <div className="bg-white rounded border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Response</h2>
              <div>
                {isPlaying ? (
                  <button
                    onClick={stopPlaying}
                    className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
                  >
                    <StopCircle size={18} />
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={playResponse}
                    className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
                  >
                    <Volume2 size={18} />
                    Play
                  </button>
                )}
              </div>
            </div>
            <p className="text-gray-800 leading-relaxed">{response.summary}</p>
          </div>

          <div className="bg-white rounded border p-6">
            <h2 className="text-xl font-semibold mb-4">References</h2>
            <div className="space-y-4">
              {response.references.map((ref, index) => (
                <div key={index} className="border rounded p-4">
                  <p className="text-gray-800 mb-2">{ref.text}</p>
                  <p className="text-sm text-gray-600">
                    Relevance: {ref.relevance}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
