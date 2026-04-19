import { createCallSession, updateCallSession } from "@/lib/call-store";
import { logger } from "@/lib/logger";
import { buildProviderIntroTwiml, getPublicBaseUrl, startTwilioCall } from "@/lib/twilio";

const DEMO_USER_ID = "demo-user-001";

type StartCallRequest = {
  provider_name?: string;
  phone_number?: string;
  patient_name?: string;
  callback_number?: string | null;
  call_goal?: string;
  consent_confirmed?: boolean;
  initiated_by?: string;
  appointment_context?: Record<string, unknown> | null;
  constraints?: string[] | null;
};

function normalizePhoneNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const digits = trimmed.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.length === 10) return `+1${digits}`;
  return `+${digits}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as StartCallRequest;
    const providerName = body.provider_name?.trim() || "";
    const phoneNumber = normalizePhoneNumber(body.phone_number || "");
    const patientName = body.patient_name?.trim() || "";
    const callbackNumber = body.callback_number
      ? normalizePhoneNumber(body.callback_number)
      : null;
    const callGoal = body.call_goal?.trim() || "";
    const consentConfirmed = body.consent_confirmed === true;
    const initiatedBy = body.initiated_by?.trim() || "agent";

    if (!consentConfirmed) {
      return Response.json(
        { error: "consent_confirmed must be true before placing a call." },
        { status: 400 }
      );
    }

    if (!providerName || !phoneNumber || !patientName || !callGoal) {
      return Response.json(
        {
          error:
            "provider_name, phone_number, patient_name, and call_goal are required.",
        },
        { status: 400 }
      );
    }

    const session = await createCallSession({
      user_id: DEMO_USER_ID,
      provider_name: providerName,
      phone_number: phoneNumber,
      patient_name: patientName,
      callback_number: callbackNumber,
      call_goal: callGoal,
      consent_confirmed: true,
      initiated_by: initiatedBy,
      appointment_context: body.appointment_context ?? null,
      constraints: body.constraints ?? [],
      status: "queued",
      status_message: "Preparing outbound Twilio call.",
      twilio_call_sid: null,
      outcome_summary: null,
    });

    if (!session?.id) {
      return Response.json(
        {
          error:
            "Call session could not be persisted. Check Supabase configuration and the call_sessions table.",
        },
        { status: 500 }
      );
    }

    const baseUrl = getPublicBaseUrl();
    const twimlUrl = new URL(`/api/calls/${session.id}/twiml`, baseUrl);
    const statusCallbackUrl = new URL(`/api/calls/${session.id}/status`, baseUrl);

    // Allow an external voice runtime to take over immediately if configured.
    if (process.env.TWILIO_VOICE_WEBHOOK_URL) {
      twimlUrl.href = process.env.TWILIO_VOICE_WEBHOOK_URL;
    }

    const call = await startTwilioCall({
      to: phoneNumber,
      twimlUrl: twimlUrl.toString(),
      statusCallbackUrl: statusCallbackUrl.toString(),
    });

    await updateCallSession(session.id, {
      twilio_call_sid: call.sid,
      status: call.status === "in-progress" ? "in-progress" : "initiated",
      status_message: "Twilio accepted the outbound call request.",
    });

    return Response.json({
      success: true,
      call_session_id: session.id,
      twilio_call_sid: call.sid,
      status: call.status,
      twiml_url: twimlUrl.toString(),
      status_callback_url: statusCallbackUrl.toString(),
      intro_preview: buildProviderIntroTwiml({
        providerName,
        patientName,
        callGoal,
        callbackNumber,
      }),
      note:
        process.env.TWILIO_VOICE_WEBHOOK_URL
          ? "Call will be handed to the configured Twilio voice webhook."
          : "Call starts with a basic TwiML intro. A realtime voice-model bridge is not wired yet.",
    });
  } catch (err) {
    logger.error("calls-start-route", "Failed to start call", err);
    return Response.json({ error: "Failed to start outbound call." }, { status: 500 });
  }
}
