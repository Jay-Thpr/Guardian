alter table public.call_sessions
  add column if not exists disposition text,
  add column if not exists callback_requested boolean,
  add column if not exists appointment_confirmed boolean,
  add column if not exists voicemail_detected boolean,
  add column if not exists call_duration_seconds integer,
  add column if not exists recording_url text,
  add column if not exists recording_sid text,
  add column if not exists transcript_excerpt text;
