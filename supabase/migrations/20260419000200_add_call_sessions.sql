create table if not exists public.call_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text references public.user_profiles(user_id) on delete set null,
  provider_name text not null,
  phone_number text not null,
  patient_name text not null,
  callback_number text,
  call_goal text not null,
  consent_confirmed boolean not null default false,
  initiated_by text not null default 'agent',
  status text not null default 'queued' check (
    status in (
      'queued',
      'initiated',
      'ringing',
      'in-progress',
      'completed',
      'busy',
      'no-answer',
      'failed',
      'canceled'
    )
  ),
  twilio_call_sid text,
  appointment_context jsonb,
  constraints text[] not null default '{}'::text[],
  outcome_summary text,
  status_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists call_sessions_user_created_idx
  on public.call_sessions (user_id, created_at desc);

create index if not exists call_sessions_twilio_sid_idx
  on public.call_sessions (twilio_call_sid);

alter table public.call_sessions enable row level security;

do $$ begin
  create policy "service role manage call sessions"
    on public.call_sessions
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');
exception
  when duplicate_object then null;
end $$;
