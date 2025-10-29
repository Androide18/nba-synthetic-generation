import { NextRequest, NextResponse } from "next/server";
import {
  generateTextEmbedding, // Google: 768D
  generateClipTextEmbedding, // CLIP: 512D
} from "@/lib/embeddings";
import { query } from "@/lib/db";

// Tune this value (0 = image only, 1 = text only)
const TEXT_WEIGHT = 0.5;

type NBACardResult = {
  id: number;
  player: string;
  year: number;
  team: string;
  grade: string;
  image_url: string;
  text_score: number;
  image_score: number;
  hybrid_score: number;
};

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid question" },
        { status: 400 }
      );
    }

    // 1. Generates text embedding (Google)
    const textEmbedding = await generateTextEmbedding(question);
    // 2. Generates image embedding (CLIP)
    const clipTextEmbedding = await generateClipTextEmbedding(question);

    // Convert to pgvector input format: [x1, x2, ..., xn]
    const textVec = `[${textEmbedding.join(",")}]`;
    const imageVec = `[${clipTextEmbedding.join(",")}]`;

    // SQL query with pgvector cosine similarity (<=>)
    // <=> is pgvector’s cosine distance operator.
    // 1 - cosine_distance gives us cosine similarity.
    // text_score and image_score: Similarity with the respective embeddings.
    // hybrid_score: Weighted average of both (text + image). You can control the balance using TEXT_WEIGHT
    
    const sql = `
  SELECT
    id,
    player,
    team,
    year,
    grade,
    image_url,
    ROUND((1 - (text_embedding <=> $1::vector))::numeric, 4) AS text_score,
    ROUND((1 - (image_embedding <=> $2::vector))::numeric, 4) AS image_score,
    ROUND((
      ${TEXT_WEIGHT} * (1 - (text_embedding <=> $1::vector)) +
      ${1 - TEXT_WEIGHT} * (1 - (image_embedding <=> $2::vector))
    )::numeric, 4) AS hybrid_score
  FROM nba_cards
  ORDER BY hybrid_score DESC
  LIMIT 10;
`;

    // 4. Execute the query
    const result = await query(sql, [textVec, imageVec]);
    const rows = result.rows as NBACardResult[];

    console.table(
      rows.map((row) => ({
        player: row.player,
        hybrid_score: row.hybrid_score,
        text_score: row.text_score,
        image_score: row.image_score,
      }))
    );

    // 5. Devuelve los resultados
    return NextResponse.json({ results: rows });
  } catch (error) {
    console.error("Hybrid search error:", error);
    return NextResponse.json(
      { error: "Internal server error", detail: (error as Error).message },
      { status: 500 }
    );
  }
}
