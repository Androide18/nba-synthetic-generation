import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import wav from "wav";
import { AgentStateType } from "../graph";

// Helper to save WAV file into public folder
async function saveWaveFile(
  filename: string,
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
) {
  return new Promise<void>((resolve, reject) => {
    // Ensure the public/audios folder exists
    const publicDir = path.join(process.cwd(), "public", "audios");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const filePath = path.join(publicDir, filename);

    const writer = new wav.FileWriter(filePath, {
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    writer.on("finish", resolve);
    writer.on("error", reject);

    writer.write(pcmData);
    writer.end();
  });
}

// ----------------------------------------------------------------------------
// Node: Generate TTS audio from text with Gemini 2.5 Flash Preview TTS model
// ----------------------------------------------------------------------------

export const generateSpeechFromText = async (
  state: AgentStateType
): Promise<Partial<AgentStateType>> => {
  console.group("🧩 [generateSpeechFromText] Step-by-step debugging");
  console.log("1️⃣ Input state:", state);

  if (
    !state.enriched?.description ||
    state.enriched.description.trim() === ""
  ) {
    console.warn("⚠️ Invalid input text for TTS");
    console.groupEnd();
    return {
      error: {
        message: "Invalid input text for TTS",
        step: "generateSpeechFromText",
      },
    };
  }
  console.log("2️⃣ Text input OK:", state.enriched.description);

  try {
    console.log("3️⃣ Creating GoogleGenAI client...");
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
    });

    console.log("4️⃣ Calling Gemini TTS model...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: state.enriched.description }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    // Extract base64 audio data from response
    const base64Data =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Data) {
      throw new Error("No audio data returned from TTS model");
    }

    console.log("5️⃣ Audio data extracted, length:", base64Data.length);

    // Save WAV file to public/audios
    const audioBuffer = Buffer.from(base64Data, "base64");
    const filename = "output.wav"; // or dynamically generate unique names
    await saveWaveFile(filename, audioBuffer);

    console.groupEnd();

    // Return the relative URL that frontend can use
    return {
      narration: `/audios/${filename}`,
    };
  } catch (err) {
    console.error("❌ Error calling Gemini TTS model:", err);
    console.groupEnd();
    return {
      error: {
        message: `TTS call failed: ${(err as Error).message}`,
        step: "generateSpeechFromText",
      },
    };
  }
};
