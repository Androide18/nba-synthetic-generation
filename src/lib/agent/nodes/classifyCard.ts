import { generateObject } from "ai";
import { AgentStateType } from "../graph";
import { MODEL } from "@/lib/const";
import { nbaCardSchema } from "@/lib/schema";
import { SYSTEM_PROMPT } from "@/lib/prompt";

// ----------------------------------------------------------------------------
// Node: Classify the NBA card with `generateObject` (debug version)
// ----------------------------------------------------------------------------

export const classifyCard: (
  state: AgentStateType
) => Promise<Partial<AgentStateType>> = async (state) => {
  console.group("🧩 [classifyCard] Step-by-step debugging");
  console.log("1️⃣ Input state:", state);

  // Step 1: Validate input
  if (!state.file || !state.validation?.isValid) {
    console.warn("⚠️ Invalid state for classification:", {
      fileExists: !!state.file,
      validationPassed: state.validation?.isValid,
    });
    console.groupEnd();
    return {
      error: {
        message: "Invalid state for classification",
        step: "classifyCard",
      },
    };
  }
  console.log("2️⃣ File and validation OK");

  // Step 2: Convert file to base64
  console.log("3️⃣ Converting file to base64...");
  const buffer = await state.file.arrayBuffer();
  console.log("   ✅ ArrayBuffer length:", buffer.byteLength);

  const base64 = Buffer.from(buffer).toString("base64");
  console.log("   ✅ Base64 length:", base64.length);

  const dataUrl = `data:${state.file.type};base64,${base64}`;
  console.log(
    "   ✅ Data URL created (first 100 chars):",
    dataUrl.slice(0, 100),
    "..."
  );

  // Step 3: Call AI to classify
  console.log("4️⃣ Sending request to AI model...");
  let object: any;
  try {
    const response = await generateObject({
      model: MODEL,
      schema: nbaCardSchema,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: dataUrl,
            },
          ],
        },
      ],
    });
    object = response.object;
    console.log("   ✅ AI classification result:", object);
  } catch (err) {
    console.error("❌ Error calling AI model:", err);
    console.groupEnd();
    return {
      error: {
        message: `AI call failed: ${(err as Error).message}`,
        step: "classifyCard",
      },
    };
  }

  // Step 4: Return classified labels
  console.log("✅ Classification completed successfully");
  console.groupEnd();
  return { labels: object };
};
