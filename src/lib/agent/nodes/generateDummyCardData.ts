import { generateObject } from "ai";
import { nbaCardSchema } from "@/lib/schema";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import { AgentStateType } from "../graph";
import { MODEL } from "@/lib/const"; // Gemini 2.5

// ----------------------------------------------------------------------------
// Node: Generate fully fictional NBA card data (debug version)
// ----------------------------------------------------------------------------

export const generateDummyCardData = async (
  state: AgentStateType
): Promise<Partial<AgentStateType>> => {
  console.group("🃏 [generateDummyCardData] Step-by-step debugging");
  console.log("1️⃣ Input state:", state);

  const prompt = `
Generate a fully fictional NBA trading card that conforms to the schema. 
Use a fake player, team, and fictional stats. 
Make sure the year is recent (2020s), and the type resembles real brands (e.g. "Panini Prizm").
  `.trim();

  console.log("2️⃣ Prompt prepared for AI:", prompt);

  let object;
  try {
    console.log("3️⃣ Calling generateObject...");
    const response = await generateObject({
      model: MODEL,
      schema: nbaCardSchema,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    object = response.object;
    console.log("   ✅ AI generated object:", object);
  } catch (err) {
    console.error("❌ Error generating dummy card data:", err);
    console.groupEnd();
    return {
      error: {
        message: `generateDummyCardData failed: ${(err as Error).message}`,
        step: "generateDummyCardData",
      },
    };
  }

  console.log("4️⃣ Node finished successfully, returning labels");
  console.groupEnd();

  return {
    labels: object,
  };
};
