  import { NextResponse } from "next/server";
  import { agentGraph } from "@/lib/agent/graph";

  export async function POST(req: Request) {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    // Run the LangGraph agent
    const result = await agentGraph.invoke({ file });

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message, step: result.error.step },
        { status: 400 }
      );
    }

    return NextResponse.json({
      validation: result.validation,
      labels: result.labels,
      description: result.enriched?.description,
      embeddings: result.embeddings,
      syntheticImage: result.syntheticImage,
      narration: result.narration,
    });
  }
