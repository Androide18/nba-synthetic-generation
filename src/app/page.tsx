"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Bot, UploadCloud } from "lucide-react";
import { NBACard } from "@/lib/schema";
import Image from "next/image";
import { ChatBox } from "@/components/ui/Chat";

interface ExtendedNBACard extends NBACard {
  syntheticImage?: string;
  narration?: string;
}

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ExtendedNBACard | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    if (
      target instanceof HTMLInputElement &&
      target.files &&
      target.files.length > 0
    ) {
      const selectedFile = target.files[0];
      setFile(selectedFile);

      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(
          JSON.stringify({
            error: data.error || "error",
            reason: data.reason || "Unknown reason",
          })
        );
        return;
      }

      setResult(data);
    } catch (err) {
      console.error("Upload error:", err);
      const error = err as Error;
      setError(error.message || "An unexpected error occurred.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-800 text-slate-100 flex flex-col items-center px-6 py-12">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LEFT: Upload Form */}
        <section className="flex flex-col justify-center">
          {/* Title & Subtitle */}
          <header className="mb-10 px-2 sm:px-0">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600">
              AI-powered NBA Card Classifier
            </h1>
            <p className="mt-3 max-w-md text-slate-400 text-lg font-medium tracking-wide">
              Upload your NBA card image to get a detailed classification.
            </p>
          </header>

          {/* Card: Preview + Upload (hover) + Button */}
          <form
            onSubmit={handleSubmit}
            className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-6 lg:p-8 flex flex-col gap-8 hover:shadow-indigo-700 transition-shadow duration-500"
            aria-label="Upload and classify NBA card"
          >
            {/* Preview with upload button overlay */}
            <div className="relative group">
              <div
                className="bg-slate-900 border border-slate-700 rounded-xl shadow-inner flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
                style={{ minHeight: "360px", maxHeight: "360px" }}
              >
                {previewUrl && file ? (
                  file.type.startsWith("image/") ? (
                    <Image
                      src={previewUrl}
                      alt="Uploaded NBA card preview"
                      fill
                      className="object-contain rounded-xl drop-shadow-lg"
                    />
                  ) : file.type === "application/pdf" ? (
                    <iframe
                      src={previewUrl}
                      title="PDF Preview"
                      className="w-full h-full rounded-xl"
                    />
                  ) : (
                    <p className="text-slate-400 p-4 text-sm font-mono">
                      Preview not available for this file type.
                    </p>
                  )
                ) : (
                  <Image
                    src="/imgs/nba-card-placeholder.png"
                    alt="Placeholder preview"
                    width={300}
                    height={360}
                    className="opacity-30 object-contain w-3/4 h-auto"
                  />
                )}
              </div>

              {/* Centered upload button on hover */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
                <div className="w-2/3 sm:w-1/2 md:w-1/3">
                  <Input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    variant="outline"
                    fileLabel="Upload your card"
                    icon={<UploadCloud size={20} />}
                    size="md"
                    className="cursor-pointer w-full"
                  />
                </div>
              </div>
            </div>

            {/* Classify Button */}
            <Button
              type="submit"
              variant="default"
              size="lg"
              isLoading={loading}
              disabled={!file}
              icon={<Bot size={22} />}
              className="w-full tracking-wide shadow-md bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 active:scale-95 transition-transform duration-150"
              aria-label="Classify uploaded card"
            >
              {loading ? "Analyzing..." : "Classify"}
            </Button>
          </form>
        </section>

        {/* RIGHT: Classification Result */}
        <section className="flex flex-col gap-10">
          <div
            className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-6 overflow-x-auto overflow-y-auto hover:shadow-indigo-700 transition-shadow duration-500 min-h-[735px] max-h-[735px] flex-1 flex flex-col"
            aria-label="Classification results"
          >
            <h2 className="text-2xl font-semibold mb-5 text-center lg:text-left tracking-wide">
              Classification Result
            </h2>
            <pre className="text-sm sm:text-base font-mono whitespace-pre-wrap text-green-400 select-text min-h-[140px]">
              {error ? (
                <code className="text-red-400">{error}</code>
              ) : result ? (
                <code className="text-green-400">
                  {JSON.stringify(result, null, 2)}
                </code>
              ) : (
                <code className="text-slate-500">
                  {`{
  "player": "LeBron James",
  "team": "Los Angeles Lakers",
  "year": 2020,
  "grade": "Mint 9",
  "rarity": "Gold Holo",
  "type": "Panini Prizm",
  "subtype": "Base",
  "description": "A 2020 Panini Prizm Gold Holo LeBron James card graded Mint 9 by PSA.",
  "confidence": "98.7%",
  "processing_time": "3.2 seconds",
  "model_version": "v1.0.0",
  "notes": "The model is highly confident in this classification based on visual features and text recognition.",
  "warnings": "If the image quality is low or the card is heavily damaged, the classification accuracy may decrease.",
  "disclaimer": "This classification is provided for informational purposes only and may not be 100% accurate."
}`}
                </code>
              )}
            </pre>
          </div>
        </section>
      </div>

      {/* Chat Section */}
      <ChatBox />

      {/* Synthetic Card Section */}
      <div>
        {result?.syntheticImage && (
          <div className="mt-8 text-center">
            <h3 className="text-xl font-semibold mb-2">
              Synthetic Card Preview
            </h3>
            <Image
              src={result.syntheticImage}
              alt="Synthetic NBA card"
              width={400}
              height={300}
              className="rounded-lg shadow-lg mx-auto"
            />
          </div>
        )}

        {result?.narration && (
          <div className="mt-6 text-center">
            <audio controls>
              <source src="/audios/output.wav" type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>
    </div>
  );
}
