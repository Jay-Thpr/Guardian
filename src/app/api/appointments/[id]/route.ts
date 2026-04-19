import type { NextRequest } from "next/server";
import { addPrepNotes } from "@/lib/google-calendar";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { notes } = body;

    if (!notes) {
      return Response.json({ error: "notes is required" }, { status: 400 });
    }

    await addPrepNotes(id, notes);
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}
