"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "./Input";
import { Button } from "./Button";
import Image from "next/image";

export const ChatBox = () => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [results, setResults] = useState<any[]>([]); // TODO: type this properly
  const [error, setError] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return; // Ignore empty submissions
    setIsLoading(true);
    setResults([]);
    setError(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input.trim() }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong");
        return;
      }

      setResults(data.results || []);
    } catch (err) {
      console.error("Search error:", err);
      setError("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  return (
    <div className="w-full max-w-7xl mt-16 bg-slate-900 border border-slate-700 rounded-2xl shadow-lg p-6 lg:p-8 space-y-6">
      <h2 className="text-2xl font-semibold tracking-wide">
        Ask about your NBA cards
      </h2>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something like: Show me a LeBron dunking card"
          className="flex-1"
          disabled={isLoading}
          aria-label="Chat input"
          autoComplete="off"
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
          style={{ minWidth: "200px" }}
        >
          {isLoading ? "Thinking..." : "Ask"}
        </Button>
      </form>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((card) => (
          <div
            key={card.id}
            className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-md hover:shadow-indigo-600 transition-shadow"
          >
            <div className="relative w-full h-64 mb-4 bg-slate-700 rounded-md overflow-hidden">
              <Image
                src={card.image_url}
                alt={`${card.player} card`}
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-lg font-semibold mb-1">{card.player}</h3>
            <p className="text-sm text-slate-400 mb-1">
              {card.team} • {card.year}
            </p>
            <p className="text-sm text-slate-500">Grade: {card.grade}</p>
            <p className="text-xs text-slate-500 mt-2">
              Hybrid Score:{" "}
              <span className="text-indigo-400 font-mono">
                {card.hybrid_score}
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* Error message */}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* No results fallback */}
      {!isLoading && results.length === 0 && !error && (
        <p className="text-slate-400 text-sm">
          No results yet. Ask something above!
        </p>
      )}
    </div>
  );
};
