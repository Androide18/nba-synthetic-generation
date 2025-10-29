import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "@/lib/const";
import { AgentStateType } from "../graph";

// ----------------------------------------------------------------------------
// Node: Validate file presence, size, and type
// ----------------------------------------------------------------------------

export const validateFile: (
  state: AgentStateType
) => Promise<Partial<AgentStateType>> = async (state) => {
  console.group("🧩 [validateFile] Step-by-step debugging");
  console.log("1️⃣ Input state:", state);

  // Step 1: Check if file exists
  if (!state.file) {
    console.warn("⚠️ No file provided");
    console.groupEnd();
    return { error: { message: "No file provided", step: "validateFile" } };
  }

  console.log("2️⃣ File exists:", state.file);

  // Step 2: Validate file size and type
  console.log(`3️⃣ File size: ${state.file.size} bytes`);
  if (state.file.size > MAX_FILE_SIZE) {
    console.error(
      `❌ File size exceeds limit: ${MAX_FILE_SIZE} bytes (${
        MAX_FILE_SIZE / 1024 / 1024
      } MB)`
    );
    console.groupEnd();
    return {
      error: {
        message: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
        step: "validateFile",
      },
    };
  }
  console.log("✅ File size is OK");

  // Step 3: Check MIME type
  console.log(`4️⃣ File type: ${state.file.type}`);
  if (!ALLOWED_MIME_TYPES.includes(state.file.type)) {
    console.error(`❌ Unsupported file type: ${state.file.type}`);
    console.groupEnd();
    return {
      error: {
        message: `Unsupported file type: ${state.file.type}`,
        step: "validateFile",
      },
    };
  }

  console.log("✅ File type is OK");

  // Step 4: Validation passed
  console.log("5️⃣ File validation passed ✅");
  console.groupEnd();
  return { validation: { isValid: true } };
};
