import { orchestrateCopilot } from "@/lib/orchestrator";
import { updateTaskMemory } from "@/lib/memory-store";
import type { CopilotRequest } from "@/lib/response-schema";

const DEMO_USER_ID = "demo-user-001";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CopilotRequest;
    const response = await orchestrateCopilot(body);

    if (response.memoryUpdate) {
      updateTaskMemory(DEMO_USER_ID, {
        current_task: response.memoryUpdate.currentTask,
        last_step: response.memoryUpdate.lastStep,
        current_url: body.url,
        page_title: body.pageTitle,
      });
    }

    return Response.json(response);
  } catch (error) {
    console.error("Copilot respond error:", error);
    return Response.json(
      {
        mode: "guidance",
        summary: "I had a small problem.",
        nextStep: "Please try again in a moment.",
        explanation:
          "I’m having trouble reading the page right now. Try again in a moment, or ask me to check the safe next step.",
        riskLevel: "uncertain",
        suspiciousSignals: [],
      },
      { status: 500 },
    );
  }
}
