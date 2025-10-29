import { GoogleGenerativeAI } from "@google/generative-ai";
import { AgentStateType } from "../graph";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

// ----------------------------------------------------------------------------
// Node: Render a synthetic/fake NBA card image (debug version)
// ----------------------------------------------------------------------------
export async function renderSyntheticCardImage(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {
  console.group("🖼️ [renderSyntheticCardImage] Step-by-step debugging");
  console.log("1️⃣ Input state:", state);

  if (!state.file || !state.labels) {
    console.error("❌ Missing file or labels");
    console.groupEnd();
    return {
      error: {
        step: "renderSyntheticCardImage",
        message: "Missing file or dummy card data",
      },
    };
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.warn("⚠️ GOOGLE_GENERATIVE_AI_API_KEY is not set in process.env!");
  } else {
    console.log("✅ GOOGLE_GENERATIVE_AI_API_KEY detected");
  }

  console.log("2️⃣ Converting uploaded file to base64...");
  const arrayBuffer = await state.file.arrayBuffer();
  const base64Image = Buffer.from(arrayBuffer).toString("base64");
  console.log("   ✅ File converted, size (bytes):", base64Image.length);

  const { player, team, year, type, grade, subtype, rarity } = state.labels;

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
  console.log("3️⃣ Gemini model initialized:", model.model);

  const promptText = `
Modify the uploaded NBA trading card image to make it synthetic and fictional:
- Replace the face/image with a fictional or AI-generated face
- Add environmental context: (e.g. place it on a wooden desk with other cards nearby)
- Change colors/styles to make it visually distinct from the original
- Add slight imperfections to make it look realistic
- Slightly blur or wear parts of the image (e.g. edge damage or scratches)
- Ensure it looks like a photo of a real card in a real environment
- Do NOT include any text or logos from the original card

Card Details:
- Name: ${player}
- Team: ${team}
- Year: ${year}
- Type: ${type}
- Subtype: ${subtype}
- Grade: ${grade}
- Rarity: ${rarity}

Return only the new image.
  `.trim();

  console.log("4️⃣ Prompt prepared for Gemini:", promptText);

  try {
    console.log("5️⃣ Calling Gemini generateContent...");
    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType: "image/png",
                data: base64Image,
              },
            },
          ],
        },
      ],
    });

    console.log("   ✅ Gemini API response received");

    const parts = response?.response?.candidates?.[0]?.content?.parts;
    if (!parts) {
      console.error("❌ No content parts in Gemini response");
      console.groupEnd();
      return {
        error: {
          step: "renderSyntheticCardImage",
          message: "No content parts in Gemini response",
        },
      };
    }

    console.log("6️⃣ Extracting synthetic image from response...");
    for (const part of parts) {
      if (part.inlineData?.data) {
        console.log(
          "   ✅ Synthetic image found, length:",
          part.inlineData.data.length
        );
        console.groupEnd();
        return {
          syntheticImage: `data:image/png;base64,${part.inlineData.data}`,
        };
      }
    }

    console.warn("⚠️ No inlineData found in any parts");
  } catch (err: any) {
    if (err.statusCode === 503) {
      console.error("⚠️ Gemini is overloaded (503)");
      console.groupEnd();
      return {
        error: {
          step: "renderSyntheticCardImage",
          message: "Gemini is temporarily overloaded. Please retry shortly.",
        },
      };
    }

    console.error("❌ Gemini API error:", err);
    console.groupEnd();
    return {
      error: {
        step: "renderSyntheticCardImage",
        message: err.message || "Unknown error while calling Gemini API",
      },
    };
  }

  console.error("❌ Failed to extract image from Gemini response");
  console.groupEnd();
  return {
    error: {
      step: "renderSyntheticCardImage",
      message: "Failed to extract image from Gemini response",
    },
  };
}
