import { updateCallSession, type CallSessionStatus } from "@/lib/call-store";
import { logger } from "@/lib/logger";

function mapTwilioStatus(status: string | null): CallSessionStatus {
  switch (status) {
    case "queued":
      return "queued";
    case "initiated":
      return "initiated";
    case "ringing":
      return "ringing";
    case "in-progress":
      return "in-progress";
    case "completed":
      return "completed";
    case "busy":
      return "busy";
    case "no-answer":
      return "no-answer";
    case "canceled":
      return "canceled";
    default:
      return "failed";
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;
    const formData = await request.formData();
    const callStatus = String(formData.get("CallStatus") || "");
    const callSid = String(formData.get("CallSid") || "");

    await updateCallSession(sessionId, {
      twilio_call_sid: callSid || null,
      status: mapTwilioStatus(callStatus || null),
      status_message: callStatus ? `Twilio reported ${callStatus}.` : "Twilio status callback received.",
    });

    return Response.json({ success: true });
  } catch (err) {
    logger.error("call-status-route", "Failed to process Twilio status callback", err);
    return Response.json({ error: "Failed to update call status." }, { status: 500 });
  }
}
