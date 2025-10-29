import {
  generateImageEmbedding,
  generateTextEmbedding,
} from "@/lib/embeddings";
import { AgentStateType } from "../graph";
import { query } from "@/lib/db";

// ----------------------------------------------------------------------------
// Node: Generate embeddings and insert into DB (debug version)
// ----------------------------------------------------------------------------

export const embedAndStore: (
  state: AgentStateType
) => Promise<Partial<AgentStateType>> = async (state) => {
  console.group("🧩 [embedAndStore] Step-by-step debugging");
  console.log("1️⃣ Input state:", state);

  // Step 1: Validate input
  if (!state.labels || !state.file) {
    console.warn("⚠️ Missing card labels or file for embeddings");
    console.groupEnd();
    return {
      error: {
        message: "Missing card labels or file for embeddings",
        step: "embedAndStore",
      },
    };
  }
  console.log("2️⃣ Labels and file found, proceeding...");

  // Step 2: Read file buffer
  const buffer = await state.file.arrayBuffer();
  console.log(`3️⃣ File buffer read: ${buffer.byteLength} bytes`);

  // Step 3: Compose metadata text
  const metaText = `
    Player: ${state.labels.player}
    Team: ${state.labels.team}
    Year: ${state.labels.year}
    Grade: ${state.labels.grade}
    Rarity: ${state.labels.rarity}
    Type: ${state.labels.type}
    Subtype: ${state.labels.subtype}
    Description: ${state.labels.description}
  `;
  console.log("4️⃣ Metadata text prepared:", metaText);

  // Step 4: Generate embeddings
  console.log("5️⃣ Generating text embedding...");
  const textEmbedding = await generateTextEmbedding(metaText);
  console.log(
    "   ✅ Text embedding generated:",
    textEmbedding.slice(0, 5),
    "... (truncated)"
  );

  console.log("6️⃣ Generating image embedding...");
  const imageEmbedding = await generateImageEmbedding(buffer);
  console.log(
    "   ✅ Image embedding generated:",
    imageEmbedding.slice(0, 5),
    "... (truncated)"
  );

  // Step 5: Convert embeddings for DB
  const textEmbeddingStr = `[${textEmbedding.join(",")}]`;
  const imageEmbeddingStr = `[${imageEmbedding.join(",")}]`;
  console.log("7️⃣ Embeddings converted for DB insertion");

  // Step 6: Prepare SQL insertion
  const insertSQL = `
    INSERT INTO nba_cards (
      player, team, year, grade, rarity, type, subtype,
      description, confidence, processing_time, model_version,
      notes, warnings, disclaimer, image_url,
      text_embedding, image_embedding
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13, $14, $15,
      $16::vector, $17::vector
    )
  `;

  // Prepare image as base64 data URL
  const imageDataUrl = `data:${state.file.type};base64,${Buffer.from(
    buffer
  ).toString("base64")}`;
  console.log("8️⃣ Image prepared as base64 data URL");

  // Step 7: Insert into DB
  console.log("9️⃣ Inserting data into DB...");
  try {
    await query(insertSQL, [
      state.labels.player,
      state.labels.team,
      state.labels.year,
      state.labels.grade,
      state.labels.rarity,
      state.labels.type,
      state.labels.subtype,
      state.labels.description,
      state.labels.confidence,
      state.labels.processing_time,
      state.labels.model_version,
      state.labels.notes,
      state.labels.warnings,
      state.labels.disclaimer,
      imageDataUrl,
      textEmbeddingStr,
      imageEmbeddingStr,
    ]);
    console.log("   ✅ DB insertion completed successfully");
  } catch (err) {
    console.error("❌ Error inserting into DB:", err);
    console.groupEnd();
    return {
      error: {
        message: `DB insertion failed: ${(err as Error).message}`,
        step: "embedAndStore",
      },
    };
  }

  console.log("🔟 Embeddings node finished successfully");
  console.groupEnd();

  // Step 8: Return embeddings
  return {
    embeddings: {
      textEmbedding,
      imageEmbedding,
    },
  };
};
