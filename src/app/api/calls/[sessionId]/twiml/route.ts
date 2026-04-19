import { getCallSession } from "@/lib/call-store";
import { buildProviderIntroTwiml } from "@/lib/twilio";

export async function POST(
  _request: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await context.params;
  const session = await getCallSession(sessionId);

  if (!session) {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="alice">The call session could not be found.</Say><Hangup/></Response>`,
      {
        status: 404,
        headers: { "Content-Type": "text/xml; charset=utf-8" },
      }
    );
  }

  return new Response(
    buildProviderIntroTwiml({
      providerName: session.provider_name,
      patientName: session.patient_name,
      callGoal: session.call_goal,
      callbackNumber: session.callback_number,
    }),
    {
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    }
  );
}
