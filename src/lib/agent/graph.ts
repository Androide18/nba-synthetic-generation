import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import { NBACard } from "../schema";
import { validateFile } from "./nodes/validateFile";
import { validateCardContent } from "./nodes/validateCard";
import { classifyCard } from "./nodes/classifyCard";
import { describeCard } from "./nodes/describeCard";
import { embedAndStore } from "./nodes/embedAndStore";
import { renderSyntheticCardImage } from "./nodes/renderSyntheticCardImage";
import { generateDummyCardData } from "./nodes/generateDummyCardData";
import { generateSpeechFromText } from "./nodes/generateSpeechFromText";

const AgentState = Annotation.Root({
  file: Annotation<File>(), // Accept File object
  hint: Annotation<string>(), // user hint string
  labels: Annotation<NBACard>(), // card object validation
  validation: Annotation<{ isValid: boolean; reason?: string }>(),
  certification: Annotation<{ certified: boolean; details?: string }>(),
  enriched: Annotation<{
    description: string;
    extraFacts?: Record<string, any>;
  }>(),
  embeddings: Annotation<{
    textEmbedding: number[];
    imageEmbedding: number[];
    clipTextEmbedding?: number[];
  }>(),
  syntheticImage: Annotation<string>(), // base64 or URL
  narration: Annotation<string>(), // audio file URL or base64 audio
  persistResult: Annotation<any>(),
  error: Annotation<{ message: string; step: string }>(),
});

export type AgentStateType = Partial<typeof AgentState.State>;

// Define a new graph
const workflow = new StateGraph(AgentState)
  .addNode("validateFile", validateFile)
  .addNode("validateCardContent", validateCardContent)
  .addNode("classifyCard", classifyCard)
  .addNode("describeCard", describeCard)
  .addNode("embedAndStore", embedAndStore)
  .addNode("generateDummyCardData", generateDummyCardData)
  .addNode("renderSyntheticCardImage", renderSyntheticCardImage)
  .addNode("generateSpeechFromText", generateSpeechFromText)

  // Linear part up to embedAndStore
  .addEdge(START, "validateFile")
  .addEdge("validateFile", "validateCardContent")
  .addEdge("validateCardContent", "classifyCard")
  .addEdge("classifyCard", "describeCard")
  .addEdge("describeCard", "embedAndStore")

  // Parallel branching from embedAndStore
  .addEdge("embedAndStore", "generateDummyCardData")
  .addEdge("embedAndStore", "generateSpeechFromText")

  // Continue on one branch to render image
  .addEdge("generateDummyCardData", "renderSyntheticCardImage")

  // Both branches end independently
  .addEdge("renderSyntheticCardImage", END)
  .addEdge("generateSpeechFromText", END);

export const agentGraph = workflow.compile();
