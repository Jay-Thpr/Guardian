import { orchestrateCopilot } from "@/lib/orchestrator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await orchestrateCopilot({
      mode: "scam_check",
      query: body.content || body.question,
      url: body.url,
      pageTitle: body.pageTitle,
      visibleText: body.content,
    });

    return Response.json({
      ...response,
      classification:
        response.riskLevel === "safe"
          ? "safe"
          : response.riskLevel === "risky"
            ? "risky"
            : "not-sure",
      explanation: response.explanation,
      suspicious_signals: response.suspiciousSignals || [],
    });
  } catch (err) {
    console.error("Scam check error:", err);
    return Response.json(
      {
        classification: "not-sure",
        explanation:
          "I'm having trouble checking this right now. If the website is asking for personal information or money, please wait and ask a family member or friend first.",
        suspicious_signals: [],
      },
      { status: 500 }
    );
  }
}
