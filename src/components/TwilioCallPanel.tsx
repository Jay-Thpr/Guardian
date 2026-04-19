"use client";

import { useEffect, useRef, useState } from "react";

type CallSession = {
  id?: string;
  provider_name: string;
  phone_number: string;
  patient_name: string;
  callback_number: string | null;
  call_goal: string;
  status: string;
  twilio_call_sid?: string | null;
  disposition?: string | null;
  callback_requested?: boolean | null;
  appointment_confirmed?: boolean | null;
  voicemail_detected?: boolean | null;
  call_duration_seconds?: number | null;
  transcript_excerpt?: string | null;
  outcome_summary?: string | null;
  status_message?: string | null;
};

type StartCallResponse = {
  success: boolean;
  call_session_id: string;
  twilio_call_sid: string;
  status: string;
  note: string;
  voice_runtime?: {
    mode: string;
    runtimeUrl: string | null;
  };
};

interface TwilioCallPanelProps {
  currentUrl: string;
  currentPageTitle: string;
}

const ACTIVE_STATUSES = new Set(["queued", "initiated", "ringing", "in-progress"]);

export default function TwilioCallPanel({
  currentUrl,
  currentPageTitle,
}: TwilioCallPanelProps) {
  const [providerName, setProviderName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [patientName, setPatientName] = useState("");
  const [callbackNumber, setCallbackNumber] = useState("");
  const [callGoal, setCallGoal] = useState("");
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [error, setError] = useState("");
  const [runtimeNote, setRuntimeNote] = useState("");
  const [activeSessionId, setActiveSessionId] = useState("");
  const [session, setSession] = useState<CallSession | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!activeSessionId) {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      return;
    }

    const loadSession = async () => {
      const response = await fetch(`/api/calls/${activeSessionId}`);
      const data = (await response.json()) as { session?: CallSession; error?: string };
      if (!response.ok || !data.session) {
        setError(data.error || "Failed to load call status.");
        return;
      }

      setSession(data.session);

      if (!ACTIVE_STATUSES.has(data.session.status)) {
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }
      }
    };

    void loadSession();

    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
    }

    pollTimerRef.current = setInterval(() => {
      void loadSession();
    }, 4000);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [activeSessionId]);

  const fillFromCurrentContext = () => {
    const hints = [
      currentPageTitle ? `Current page: ${currentPageTitle}` : "",
      currentUrl ? `Current URL: ${currentUrl}` : "",
    ]
      .filter(Boolean)
      .join(". ");

    setCallGoal((prev) => {
      if (prev.trim()) return prev;
      return hints
        ? `Please help with this healthcare-related task. ${hints}`
        : "Please confirm appointment details and explain the next administrative step.";
    });
  };

  const startCall = async () => {
    if (isStarting) return;

    setIsStarting(true);
    setError("");

    try {
      const response = await fetch("/api/calls/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_name: providerName,
          phone_number: phoneNumber,
          patient_name: patientName,
          callback_number: callbackNumber || null,
          call_goal: callGoal,
          consent_confirmed: consentConfirmed,
          initiated_by: "ui",
          appointment_context:
            currentPageTitle || currentUrl
              ? {
                  currentPageTitle,
                  currentUrl,
                }
              : null,
          constraints: [
            "Administrative questions only",
            "Disclose that the caller is an AI assistant",
            "No payment commitments",
          ],
        }),
      });

      const data = (await response.json()) as StartCallResponse & { error?: string };

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to start call.");
        return;
      }

      setRuntimeNote(data.note);
      setActiveSessionId(data.call_session_id);
    } catch {
      setError("Failed to reach the call endpoint.");
    } finally {
      setIsStarting(false);
    }
  };

  const cancelCall = async () => {
    if (!activeSessionId || isCanceling) return;

    setIsCanceling(true);
    setError("");

    try {
      const response = await fetch(`/api/calls/${activeSessionId}/cancel`, {
        method: "POST",
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error || "Failed to cancel call.");
        return;
      }

      const refreshed = await fetch(`/api/calls/${activeSessionId}`);
      const refreshedData = (await refreshed.json()) as { session?: CallSession };
      if (refreshed.ok && refreshedData.session) {
        setSession(refreshedData.session);
      }
    } catch {
      setError("Failed to cancel call.");
    } finally {
      setIsCanceling(false);
    }
  };

  const isActive = session ? ACTIVE_STATUSES.has(session.status) : false;

  return (
    <aside className="call-dock">
      <div className="call-dock-header">
        <div>
          <p className="call-dock-eyebrow">Provider Calls</p>
          <h2>Twilio Test Console</h2>
        </div>
        <button type="button" onClick={fillFromCurrentContext} className="call-dock-link">
          Use page context
        </button>
      </div>

      <div className="call-dock-body">
        <label className="call-dock-field">
          <span>Provider Name</span>
          <input value={providerName} onChange={(e) => setProviderName(e.target.value)} />
        </label>

        <label className="call-dock-field">
          <span>Provider Phone</span>
          <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
        </label>

        <label className="call-dock-field">
          <span>Patient Name</span>
          <input value={patientName} onChange={(e) => setPatientName(e.target.value)} />
        </label>

        <label className="call-dock-field">
          <span>Callback Number</span>
          <input value={callbackNumber} onChange={(e) => setCallbackNumber(e.target.value)} />
        </label>

        <label className="call-dock-field">
          <span>Call Goal</span>
          <textarea
            value={callGoal}
            onChange={(e) => setCallGoal(e.target.value)}
            rows={4}
          />
        </label>

        <label className="call-dock-checkbox">
          <input
            type="checkbox"
            checked={consentConfirmed}
            onChange={(e) => setConsentConfirmed(e.target.checked)}
          />
          <span>I have explicit user approval to place this call.</span>
        </label>

        <div className="call-dock-actions">
          <button
            type="button"
            className="call-dock-primary"
            onClick={startCall}
            disabled={isStarting}
          >
            {isStarting ? "Starting..." : "Start Provider Call"}
          </button>

          <button
            type="button"
            className="call-dock-secondary"
            onClick={cancelCall}
            disabled={!activeSessionId || !isActive || isCanceling}
          >
            {isCanceling ? "Stopping..." : "Stop Call"}
          </button>
        </div>

        {runtimeNote ? <p className="call-dock-note">{runtimeNote}</p> : null}
        {error ? <p className="call-dock-error">{error}</p> : null}

        <section className="call-dock-status">
          <div className="call-dock-status-row">
            <span>Status</span>
            <strong>{session?.status || "No call started"}</strong>
          </div>
          <div className="call-dock-status-row">
            <span>Twilio SID</span>
            <strong>{session?.twilio_call_sid || "Not assigned yet"}</strong>
          </div>
          <div className="call-dock-status-row">
            <span>Duration</span>
            <strong>
              {typeof session?.call_duration_seconds === "number"
                ? `${session.call_duration_seconds}s`
                : "Not available"}
            </strong>
          </div>
          <div className="call-dock-status-row">
            <span>Disposition</span>
            <strong>{session?.disposition || "Pending"}</strong>
          </div>
          <div className="call-dock-status-row">
            <span>Appointment Confirmed</span>
            <strong>
              {session?.appointment_confirmed === null ||
              typeof session?.appointment_confirmed === "undefined"
                ? "Unknown"
                : session.appointment_confirmed
                  ? "Yes"
                  : "No"}
            </strong>
          </div>
          <div className="call-dock-status-row">
            <span>Callback Requested</span>
            <strong>
              {session?.callback_requested === null ||
              typeof session?.callback_requested === "undefined"
                ? "Unknown"
                : session.callback_requested
                  ? "Yes"
                  : "No"}
            </strong>
          </div>
        </section>

        {session?.status_message ? (
          <section className="call-dock-card">
            <span className="call-dock-card-label">Latest Event</span>
            <p>{session.status_message}</p>
          </section>
        ) : null}

        {session?.outcome_summary ? (
          <section className="call-dock-card">
            <span className="call-dock-card-label">Outcome Summary</span>
            <p>{session.outcome_summary}</p>
          </section>
        ) : null}

        {session?.transcript_excerpt ? (
          <section className="call-dock-card">
            <span className="call-dock-card-label">Transcript Excerpt</span>
            <p>{session.transcript_excerpt}</p>
          </section>
        ) : null}
      </div>
    </aside>
  );
}
