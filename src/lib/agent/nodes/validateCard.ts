import { generateText } from "ai";
import { AgentStateType } from "../graph";
import { MODEL } from "@/lib/const";

// ----------------------------------------------------------------------------
// Node: Validate image content (PSA-graded NBA card) via AI `generateText`
// ----------------------------------------------------------------------------

export const validateCardContent: (
  state: AgentStateType
) => Promise<Partial<AgentStateType>> = async (state) => {
  console.group("🧩 [validateCardContent] Step-by-step debugging");
  console.log("1️⃣ Input state:", state);

  // Step 1: Check if file exists
  if (!state.file) {
    console.warn("⚠️ No file provided to validateCardContent");
    console.groupEnd();
    return {
      error: { message: "No file to validate", step: "validateCardContent" },
    };
  }
  console.log("2️⃣ File exists:", state.file);

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

  // Step 3: Call AI model
  console.log("4️⃣ Sending request to AI model...");
  let text: string;
  try {
    const response = await generateText({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Does this image contain a PSA-graded NBA trading card? Respond only with "yes" or "no". Then, on a new line, explain your reasoning briefly.`,
            },
            {
              type: "image",
              image: dataUrl,
            },
          ],
        },
      ],
    });
    text = response.text;
    console.log(
      "   ✅ AI response received (first 200 chars):",
      text.slice(0, 200),
      "..."
    );
  } catch (err) {
    console.error("❌ Error calling AI model:", err);
    console.groupEnd();
    return {
      error: {
        message: `AI call failed: ${(err as Error).message}`,
        step: "validateCardContent",
      },
    };
  }

  // Step 4: Analyze AI response
  console.log("5️⃣ Analyzing AI response...");
  const normalized = text.trim().toLowerCase();
  console.log("   Normalized response:", normalized);

  const isValidCard = normalized.startsWith("yes");
  console.log("   Is valid card?", isValidCard);

  if (!isValidCard) {
    const reason = text.trim().split("\n").slice(1).join(" ").trim();
    console.warn("⚠️ Card validation failed:", reason);
    console.groupEnd();
    return {
      validation: {
        isValid: false,
        reason: reason || "Not a PSA-graded NBA card",
      },
      error: {
        message: "Image not recognized as PSA card",
        step: "validateCardContent",
      },
    };
  }

  // Step 5: Success
  console.log("✅ Card validated successfully!");
  console.groupEnd();

  return { validation: { isValid: true } };
};
