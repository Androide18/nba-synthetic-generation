import {
  pipeline,
  AutoTokenizer,
  CLIPTextModelWithProjection,
} from "@huggingface/transformers";
import { google } from "@ai-sdk/google";

let clipTextModel: CLIPTextModelWithProjection | null = null;
let clipTokenizer: any | null = null;

async function loadClipTextModelAndTokenizer() {
  if (!clipTextModel || !clipTokenizer) {
    clipTextModel = await CLIPTextModelWithProjection.from_pretrained(
      "Xenova/clip-vit-base-patch32"
    );
    clipTokenizer = await AutoTokenizer.from_pretrained(
      "Xenova/clip-vit-base-patch32"
    );
  }

  return { clipTextModel, clipTokenizer };
}

// --------------------------------------------
// 1. Google text embedding (768-dimensional)
// --------------------------------------------
const textEmbedModel = google.textEmbedding("text-embedding-004");

/**
 * Generate text embedding from card metadata using Google model
 * Used for comparing question to text embedding of cards
 */
export async function generateTextEmbedding(text: string): Promise<number[]> {
  const result = await textEmbedModel.doEmbed({ values: [text] });
  return result.embeddings[0]; // 768-dimensional
}

// --------------------------------------------
// 2. CLIP image embedding (512-dimensional)
// --------------------------------------------

// Shared pipeline for image embeddings
let clipImagePipeline: any | null = null;

async function getClipImagePipeline() {
  if (!clipImagePipeline) {
    clipImagePipeline = await pipeline(
      "image-feature-extraction",
      "Xenova/clip-vit-base-patch32"
    );
  }
  return clipImagePipeline;
}

/**
 * Generate image embedding using CLIP
 */
export async function generateImageEmbedding(
  imageBuffer: ArrayBuffer
): Promise<number[]> {
  const pipe = await getClipImagePipeline();
  const blob = new Blob([imageBuffer]); // Required format
  const result = await pipe(blob, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(result.data); // 512-dimensional
}

// --------------------------------------------
// 3. CLIP text embedding (512-dimensional)
// --------------------------------------------

/**
 * Generate CLIP-style text embedding from a user query
 * Used to compare text queries to image embeddings
 */
export async function generateClipTextEmbedding(
  text: string
): Promise<number[]> {
  if (!text || typeof text !== "string" || text.trim() === "") {
    throw new Error(
      "generateClipTextEmbedding() received an empty or invalid text query"
    );
  }

  console.log(`Generating CLIP text embedding for query: "${text}"`);

  if (text.trim().startsWith("data:image/")) {
    throw new Error(
      "generateClipTextEmbedding() received an image string instead of text"
    );
  }

  if (text.length > 200) {
    console.warn(
      "Warning: The text query is quite long. Consider shortening it for better embedding performance."
    );
  }

  const { clipTextModel, clipTokenizer } =
    await loadClipTextModelAndTokenizer();

  console.log("ClipTextModel and Tokenizer loaded");

  if (!clipTextModel || !clipTokenizer) {
    throw new Error("Failed to load CLIP text model or tokenizer");
  }

  const inputs = await clipTokenizer(text, {
    return_tensors: "np",
    padding: "max_length",
    truncation: true,
    max_length: 77,
  });

  const output = await clipTextModel(inputs);

  console.log("Generated CLIP text embedding");

  if (!output || !output.text_embeds) {
    throw new Error("Failed to generate CLIP text embedding");
  }

  return Array.from(output.text_embeds.data);
}
