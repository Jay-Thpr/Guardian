import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loadCalendarSnapshot } from "@/lib/gcal";
import type { CalendarEventSummary } from "@/lib/gcal";

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const snapshot = await loadCalendarSnapshot(cookieStore);

    if (!snapshot.connected) {
      return NextResponse.json({ connected: false, appointments: [] });
    }

    const now = Date.now();
    const cutoff = now + FOUR_HOURS_MS;

    const appointments = snapshot.upcomingAppointments
      .filter((appt: CalendarEventSummary) => {
        const startMs = new Date(appt.start).getTime();
        return startMs >= now && startMs <= cutoff;
      })
      .map((appt: CalendarEventSummary) => {
        const startMs = new Date(appt.start).getTime();
        return {
          ...appt,
          minutesUntil: Math.round((startMs - now) / 60000),
        };
      });

    return NextResponse.json({ connected: true, appointments });
  } catch (err) {
    console.error("Google Calendar upcoming error:", err);
    return NextResponse.json({
      connected: false,
      appointments: [],
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
}
