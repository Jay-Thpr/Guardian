Refined MVP PRD: SafeStep
Product

Working name: SafeStep
Format: Web app with embedded browser workspace and persistent AI copilot panel
Stack: Next.js on Vercel + Supabase + external LLM + Google Calendar + Browser Use API
Hackathon constraint: 6-hour MVP, so the plan is intentionally phased and checkpointed

One-line pitch

A senior-friendly web copilot that helps older adults complete healthcare-related online tasks, detect scam risk, and continue multi-step workflows without losing their place.

1. Core MVP Definition

The MVP is not a full assistant for dementia care. It is a narrow, demoable workflow assistant with 3 connected capabilities:

Appointment planning support
Scam risk checking
Task continuation / memory

The product should feel like a guided browsing companion rather than a general chatbot.

2. User and Problem
Primary user

Older adult with mild dementia / early cognitive decline who can still browse the web, but struggles with:

remembering what they were doing
understanding confusing healthcare portals
distinguishing legitimate sites from scams
following multi-step tasks
Core problems we are solving
“I forgot what I came here to do.”
“I do not know what to click next.”
“I do not know whether this site is safe.”
“I have an appointment but I do not know how to prepare or where to go.”
3. Product Scope
In scope
embedded browser/task area
persistent right-side copilot
current page understanding
next-step guidance
scam risk analysis
lightweight memory of current task and previous step
appointment context from Google Calendar
Browser Use integration for one constrained demo workflow
external LLM for reasoning and simplification
Out of scope
caregiver dashboard
full extension
native desktop app
full speech support
arbitrary automation across all websites
production-grade auth complexity
advanced medical advice
4. UX Shape
Main interface

Two-pane layout:

Left side

Embedded browser/task workspace

displays the site/page the user is working on
used for portal/pharmacy/task navigation
Right side

Persistent AI copilot panel

always visible
large text
simple interface
3 main actions:
What do I do next?
Is this safe?
Appointments
optional free-text follow-up input
UX principles
one step at a time
short instructions
plain language
no clutter
obvious current task
easy “repeat” / “explain again”
5. System Architecture
Frontend

Next.js app on Vercel

main app shell
two-pane UI
browser/task workspace
assistant panel
action buttons
state management for current page/task
Backend

Next.js API routes or server actions

orchestrate external LLM
fetch and store memory in Supabase
connect Google Calendar
call Browser Use API
return assistant responses
Database

Supabase Postgres
Stores:

users
appointments
current task memory
scam check history
conversation/task context
External LLM

Used for:

explaining pages in simple language
identifying likely next steps
scam-risk reasoning
turning raw page context into senior-friendly guidance
generating memory-aware responses
Google Calendar API

Used for:

fetching upcoming appointments
attaching appointment context to current tasks
Browser Use API

Used for:

guided interaction in one supported workflow
extracting page/task signals from selected browsing flows
optionally generating action recommendations for the embedded task environment
6. Functional Features by Capability
A. Appointment Planning
User value

Help the user understand and act on healthcare tasks tied to upcoming appointments.

MVP behaviors
show next appointment
explain what it is
identify relevant portal/pharmacy workflow
guide user through the next step
tie current browsing to that appointment
Tech involved
Google Calendar API
Supabase
external LLM
Next.js frontend/backend
B. Scam Vulnerability
User value

Help the user assess whether the current page or request is suspicious.

MVP behaviors
inspect current page context
classify page as:
looks safe
not sure
looks risky
explain why in simple language
identify suspicious patterns like:
fake domain
urgent payment pressure
personal info requests
spoofed medical/pharmacy context
Tech involved
embedded browser/page context capture
external LLM
Supabase for optional history
Browser Use optionally for supported page inspection
C. Task Continuation / Memory
User value

Help the user continue without restarting the task.

MVP behaviors
store current task
store previous step
answer:
“What was I doing?”
“What do I do next?”
“Explain again”
Tech involved
Supabase
external LLM
Next.js backend
7. Data Model
users
id
name
email
created_at
appointments
id
user_id
title
start_time
description
portal_link
created_at
task_memory
id
user_id
current_task
last_step
current_url
page_title
updated_at
scam_checks
id
user_id
url
classification
explanation
created_at
8. Checkpointed MVP Build Plan

This is the most important section. Build in order. Each phase should leave you with a demoable checkpoint even if later phases fail.

Phase 0: Project Setup and Skeleton
Goal

Create the core app skeleton and infrastructure before adding intelligence.

Features
Next.js app initialized
Vercel deployment configured
Supabase project created
base two-pane UI scaffolded
placeholder assistant panel with static buttons
placeholder browser/task area
Technologies
Next.js
Vercel
Supabase
APIs / services to connect
Supabase project and environment variables only
Deliverable checkpoint

You can open the app and see:

left workspace
right assistant panel
action buttons
app deployed on Vercel
Why this phase matters

This ensures you have a working shell and hosting before touching integrations.

Phase 1: Core UI and Local Interaction
Goal

Make the product feel real before backend intelligence.

Features
persistent right-side assistant panel
action buttons:
What do I do next?
Is this safe?
Appointments
free-text input box
page/task area that can load demo pages or iframe-supported pages
local UI state for current task and response display
Technologies
Next.js frontend
React state/hooks
Tailwind or simple CSS
APIs / services to connect
none yet beyond existing Supabase env if already configured
Deliverable checkpoint

User can:

load the app
click actions
see response cards update with mocked responses
feel the intended UX flow
Notes

At this stage, hardcode the responses. Do not integrate the LLM yet.

Phase 2: Supabase Memory Layer
Goal

Add persistent memory for current task and previous step.

Features
create task_memory table
save current task to database
save last step to database
retrieve current task on refresh
support a simple “What was I doing?” response from stored data
Technologies
Supabase Postgres
Supabase client in Next.js
backend API route for read/write memory
APIs / services to connect
Supabase database
Supabase anon/service key depending on architecture
Deliverable checkpoint

User can:

start a task
leave or refresh
come back and still see remembered task context
Example

Stored memory:

current_task = “Check appointment details”
last_step = “Click sign in on hospital portal”
Why this phase matters

This proves the persistent memory story even before intelligence gets fancy.

Phase 3: External LLM Integration
Goal

Turn static responses into useful guidance.

Features
API route that sends structured page/task context to external LLM
LLM returns:
page explanation
likely next step
simplified wording
assistant button “What do I do next?” becomes dynamic
Technologies
external LLM API
Next.js backend API routes
prompt templating
Supabase memory as context injection
APIs / services to connect
external LLM API
Input to LLM
current page title
current URL
visible page text or mocked page content
current task memory
appointment context if available later
Deliverable checkpoint

User can click What do I do next? and receive a dynamic step-by-step response based on page/task context.

Notes

Keep the prompt narrow. Ask for:

1-sentence page summary
1 next action
1 simplified explanation

Do not let this become an open-ended chatbot yet.

Phase 4: Scam Check Capability
Goal

Add the second core pillar: scam-risk analysis.

Features
button: Is this safe?
send current page context to backend
external LLM classifies current page:
looks safe
not sure
looks risky
plain-language explanation returned
optional save of scam check result in Supabase
Technologies
external LLM
Next.js backend
Supabase optional logging
APIs / services to connect
external LLM API
Supabase if storing results
Input to LLM
URL/domain
page title
visible text
current task if relevant
Output format

Structured JSON:

classification
explanation
suspicious_signals
Deliverable checkpoint

User can click Is this safe? and get an understandable risk judgment.

Why this phase matters

This is one of your 3 core story pillars and is very easy for judges to understand.

Phase 5: Google Calendar Appointment Context
Goal

Add real appointment awareness.

Features
fetch next upcoming appointment
show next appointment in assistant panel
tie appointment to browsing context
support appointment-based helper text
Technologies
Google Calendar API
Next.js backend
Supabase optional caching
external LLM for contextual phrasing
APIs / services to connect
Google Calendar API
OAuth or mocked token flow if time is limited
Deliverable checkpoint

Assistant can show:

“Your next appointment is tomorrow at 2 PM”
“This page looks related to your cardiology appointment”
Fallback

If OAuth is too slow, mock a calendar event in Supabase or local state and preserve the product story.

Why this phase matters

This makes the healthcare use case concrete rather than generic.

Phase 6: Browser Use Integration for Guided Workflow
Goal

Add one believable “agentic browsing” workflow.

Features
support one constrained flow, such as:
hospital portal login guidance
pharmacy refill flow
Browser Use API receives the page/task goal
system uses Browser Use output to enrich “next step” guidance
optionally return recommended actions or page interpretation
Technologies
Browser Use API
Next.js backend
external LLM for natural-language transformation
task memory in Supabase
APIs / services to connect
Browser Use API
external LLM API
Deliverable checkpoint

For one chosen workflow, the assistant can provide more specific and believable guided navigation than generic page summarization.

Important constraint

Do not try to support every site. Pick one polished demo workflow only.

Why this phase matters

This is where your project gets differentiated technically.

Phase 7: Final Polishing and Demo Stitching
Goal

Turn features into one coherent demo story.

Features
cleaner UI copy
better typography / spacing
more obvious current task card
“Explain again” and “What was I doing?” polish
pre-seeded demo data
smooth transitions between the 3 pillars
Technologies
Next.js frontend
Supabase seeded rows
existing integrations
APIs / services to connect
none new
Deliverable checkpoint

You can give a live demo from start to finish without explaining around broken pieces.

9. Recommended Build Order by Priority
P0: Must-have
Phase 0
Phase 1
Phase 2
Phase 3

This already gives you:

app shell
persistent side assistant
memory
dynamic next-step guidance
P1: Strong MVP
Phase 4
Phase 5

This adds:

scam checking
appointment awareness
P2: Differentiator
Phase 6

This adds:

Browser Use story
technical depth
P3: Polish
Phase 7
10. API/Integration Matrix
Supabase
Used for
task memory
appointments cache or mock data
optional scam check history
Connected in
Phase 0
Phase 2
optional Phases 4–5
External LLM API
Used for
next-step reasoning
page simplification
scam-risk explanation
memory-aware response generation
Connected in
Phase 3
Phase 4
Phase 5 optional
Phase 6
Google Calendar API
Used for
reading upcoming appointments
contextualizing healthcare tasks
Connected in
Phase 5
Browser Use API
Used for
one constrained guided browsing workflow
stronger page/task action understanding
Connected in
Phase 6
11. Suggested Technical Responsibilities
Frontend responsibilities
render two-pane app
handle user actions
display assistant responses
maintain current UI state
call backend routes
Backend responsibilities
fetch/store memory in Supabase
call external LLM
call Google Calendar API
call Browser Use API
unify response shape for frontend
External LLM responsibilities
explain
simplify
choose likely next action
reason about scam risk
convert technical output into calm senior-friendly language
Supabase responsibilities
persist task context
optionally persist appointments/scam-check logs
12. Suggested Backend Routes

You do not need many.

/api/memory/get

Returns current task memory for user.

/api/memory/update

Stores:

current_task
last_step
current_url
page_title
/api/next-step

Input:

page context
memory
optional appointment context

Calls external LLM and returns:

summary
next_step
explanation
/api/scam-check

Input:

page context

Calls external LLM and returns:

classification
explanation
suspicious_signals
/api/appointments

Fetches next appointment from Google Calendar or fallback store.

/api/browser-task

Input:

goal
page/task context

Calls Browser Use API and returns enriched action guidance.

13. Demo Narrative to Optimize For

Build toward this exact path:

Demo Step 1

User opens SafeStep and sees embedded browser plus assistant.

Demo Step 2

Assistant shows next appointment from Google Calendar.

Demo Step 3

User opens hospital portal page.

Demo Step 4

Clicks What do I do next?
Assistant explains the page and gives next action.

Demo Step 5

Task memory updates to reflect current step.

Demo Step 6

User lands on suspicious billing/refill page.
Clicks Is this safe?
Assistant explains scam risk.

Demo Step 7

User says:
What was I doing?
Assistant pulls from memory and restores task context.

Demo Step 8

Optional:
Browser Use-enhanced workflow shows more concrete portal/pharmacy guidance.

That single flow covers all 3 pillars.

14. Time-Safe Implementation Advice

For a 6-hour hackathon:

do not overbuild auth
do not overbuild browser infrastructure
do not overbuild memory
do not make freeform chat the primary interaction
do not depend on every API working perfectly

Instead:

use one clean page flow
seed one appointment
use one or two mocked healthcare pages if needed
make the assistant responses feel polished and grounded

The judges care more about:

coherence
usefulness
ethical framing
clear demo story

than broad feature count.

15. Final MVP Statement

SafeStep is a senior-friendly web copilot built with Next.js, Vercel, Supabase, an external LLM, Google Calendar, and Browser Use. Its MVP focuses on three connected capabilities: helping older adults navigate appointment-related healthcare tasks, detect scam risk, and continue multi-step workflows without losing context. The implementation is phased so that each checkpoint is independently demoable, ensuring a strong hackathon outcome even if later integrations are partial.