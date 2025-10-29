import { generateText } from "ai";
import { AgentStateType } from "../graph";
import { MODEL } from "@/lib/const";

// ----------------------------------------------------------------------------
// Node: Describe the NBA card with enriched text via AI `generateText` (debug version)
// ----------------------------------------------------------------------------

export const describeCard: (
  state: AgentStateType
) => Promise<Partial<AgentStateType>> = async (state) => {
  console.group("📝 [describeCard] Step-by-step debugging");
  console.log("1️⃣ Input state:", state);

  // Step 1: Validate input
  if (!state.labels) {
    console.warn("⚠️ Missing card labels for description");
    console.groupEnd();
    return {
      error: {
        message: "Missing card labels for description",
        step: "describeCard",
      },
    };
  }
  console.log("2️⃣ Card labels available:", state.labels);

  const card = state.labels;

  // Step 2: Construct prompt
  const prompt = `
    You are a helpful assistant that creates collector-friendly descriptions for NBA trading cards.

    Given this card info:
    Player: ${card.player}
    Team: ${card.team}
    Year: ${card.year}
    Grade: ${card.grade}
    Rarity: ${card.rarity}
    Type: ${card.type}
    Subtype: ${card.subtype}
    Description: ${card.description}

    Write a detailed, engaging description aimed at collectors highlighting the card's significance and appeal.
  `;
  console.log("3️⃣ Prompt prepared:\n", prompt);

  // Step 3: Call AI to generate enriched description
  console.log("4️⃣ Sending request to AI model for enriched description...");
  let text: string;
  try {
    const response = await generateText({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    text = response.text;
    console.log(
      "   ✅ AI description generated (first 200 chars):",
      text.slice(0, 200),
      "..."
    );
  } catch (err) {
    console.error("❌ Error calling AI model:", err);
    console.groupEnd();
    return {
      error: {
        message: `AI call failed: ${(err as Error).message}`,
        step: "describeCard",
      },
    };
  }

  // Step 4: Return enriched description
  console.log("✅ Description enrichment completed successfully");
  console.groupEnd();
  return {
    enriched: {
      description: text.trim(),
    },
  };
};
