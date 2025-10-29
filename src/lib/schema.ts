import { z } from "zod";

export const nbaCardSchema = z.object({
  player: z.string().describe("The name of the player on the card"),
  team: z.string().describe("The team associated with the player"),
  year: z.number().describe("The year the card was issued"),
  grade: z.string().describe("The grade or condition of the card"),
  rarity: z.string().describe("The rarity level of the card"),
  type: z.string().describe("The type of card (e.g., Panini Prizm)"),
  subtype: z.string().describe("The subtype or set of the card"),
  description: z.string().describe("A detailed description of the card"),
  confidence: z.string().describe("Model confidence in the classification"),
  processing_time: z.string().describe("Time taken to process the image"),
  model_version: z.string().describe("Version of the model used"),
  notes: z.string().describe("Additional notes or observations"),
  warnings: z.string().describe("Any warnings or issues detected"),
  disclaimer: z
    .string()
    .describe("A disclaimer about the classification accuracy"),
});

export type NBACard = z.infer<typeof nbaCardSchema>;
