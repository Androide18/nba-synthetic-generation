import { google } from "@ai-sdk/google";

// Constants
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];
export const MODEL = google("models/gemini-2.5-flash");
