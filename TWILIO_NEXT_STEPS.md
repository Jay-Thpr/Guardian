# Twilio Next Steps

## Current State

The repo now has:

- outbound call start endpoint
- TwiML intro route
- Twilio status callback route
- `call_sessions` persistence layer
- Supabase migration for `call_sessions`

What is **not** implemented yet:

- realtime voice-model conversation bridge
- Twilio webhook signature verification
- read endpoint for call-session status
- UI for call approval and live monitoring
- transcript capture and summarization

## Next Steps

### 1. Add webhook signature verification

Goal:

- verify Twilio callbacks are authentic before updating call state

Work:

- add X-Twilio-Signature verification in [src/app/api/calls/[sessionId]/status/route.ts](/Users/jt/Desktop/Claude/src/app/api/calls/[sessionId]/status/route.ts)
- add helper code in a Twilio security utility
- reject unsigned or invalid callbacks

Why:

- the current status endpoint trusts inbound POSTs
- that is not acceptable for a live telephony integration

### 2. Add call-session read endpoint

Goal:

- let the UI and agent inspect current call status and results

Work:

- add `GET /api/calls/[sessionId]`
- return:
  - status
  - provider name
  - call goal
  - Twilio SID
  - timestamps
  - outcome summary

Why:

- the current implementation can start calls but has no public status-read route

### 3. Add realtime voice-model bridge

Goal:

- let the system actually talk with provider staff instead of only playing a static intro

Work:

- stand up a websocket voice runtime
- connect Twilio Media Streams to that runtime
- connect the runtime to a realtime voice model
- inject structured context:
  - patient name
  - provider name
  - call goal
  - appointment context
  - constraints

Why:

- without this, the app can place calls but cannot carry out the provider conversation

### 4. Add voice guardrails

Goal:

- keep provider calls narrow, disclosed, and safe

Work:

- require the model to disclose it is an AI assistant
- restrict calls to low-risk administrative tasks
- block unsupported actions:
  - treatment decisions
  - payment commitments
  - emergency handling
  - undisclosed impersonation
- add fallback termination behavior when the provider asks for unsupported actions

Why:

- this is a healthcare-adjacent workflow with immediate privacy and safety risk

### 5. Add transcript and summary handling

Goal:

- capture what happened and return a usable result to the app

Work:

- persist transcript or transcript summary to `call_sessions`
- add structured fields for:
  - disposition
  - callback requested
  - appointment confirmed
  - refill instruction
  - transfer outcome
- summarize results for the user in plain language

Why:

- call completion without a clear outcome is not useful to the product

### 6. Add UI for approval and monitoring

Goal:

- make calling understandable and reversible for the user

Work:

- add approval UI before placing a call
- show:
  - provider
  - phone number
  - call goal
  - what the AI will say
- add in-call monitoring:
  - current status
  - stop call
  - transcript or summary feed

Why:

- provider calling should never be invisible or surprising

### 7. Add agent tool contract

Goal:

- make calling accessible to the agent in a controlled way

Work:

- define a strict tool schema for `start_provider_call`
- require:
  - explicit user consent
  - approved call goal
  - normalized provider phone number
- return:
  - `call_session_id`
  - `twilio_call_sid`
  - `status`

Why:

- the agent should invoke one narrow server endpoint, not compose Twilio requests itself

### 8. Add migration and environment documentation

Goal:

- make the Twilio setup reproducible

Work:

- document required env vars in `README.md`
- document required migration:
  - [supabase/migrations/20260419000200_add_call_sessions.sql](/Users/jt/Desktop/Claude/supabase/migrations/20260419000200_add_call_sessions.sql)
- document local testing flow

Why:

- the feature is not actually usable by another developer until setup is written down

## Recommended Build Order

1. webhook signature verification
2. call-session read endpoint
3. README and env docs
4. approval/monitoring UI
5. realtime voice-model bridge
6. transcript summarization
7. agent tool integration

## Suggested Definition Of Done

Twilio provider-calling is ready for real testing when:

- callbacks are verified
- calls can be started and monitored from the app
- the voice runtime can carry a bounded provider conversation
- the model stays inside allowed call goals
- the outcome is persisted and visible to the user
- unsupported situations fail safely
