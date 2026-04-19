# PRD: SafeStep Browser Copilot Test Harness

## 1. Product Summary

**Working name:** SafeStep  
**Current form factor:** Next.js web app plus Python browser-agent backend  
**Primary purpose today:** Technical validation surface for a senior-support browsing copilot  
**Intended future form factor:** Chrome extension with lightweight backend services

SafeStep is a senior-support copilot for high-stakes online tasks, especially healthcare-related browsing. The current app is not the final product experience. It is a test harness used to validate the backend agent, copilot reasoning, memory, scam detection, and appointment-aware guidance before moving to an extension-based UX.

Today, the web app does four practical things:

- starts a browser-use agent in a real browser session through a FastAPI backend
- streams step-by-step agent events back into the UI
- provides copilot reasoning for guidance and scam checking
- uses task memory and appointment context to make the guidance more specific

## 2. Problem

Older adults with mild cognitive decline, memory issues, or executive-function difficulty can often browse independently, but they struggle when tasks become:

- multi-step
- high stakes
- buried in bad portal UX
- mixed with scam patterns
- easy to lose track of midway through

Typical failures include:

- forgetting what they were trying to do
- not knowing what to click next
- getting stuck in login, refill, or appointment workflows
- being unable to tell whether a healthcare page is legitimate
- restarting the same task repeatedly

The goal of SafeStep is to support independence without silently taking control.

## 3. What The Codebase Actually Is

The current repository implements a working prototype with these parts:

### Frontend

- Next.js app router application
- landing page is a **browser-agent test harness**, not a real embedded browser
- task runner UI is built around [src/components/BrowserTaskArea.tsx](/Users/jt/Desktop/Claude/src/components/BrowserTaskArea.tsx)
- the main page is [src/app/page.tsx](/Users/jt/Desktop/Claude/src/app/page.tsx)

### Copilot backend inside Next.js

- guidance orchestration in [src/lib/orchestrator.ts](/Users/jt/Desktop/Claude/src/lib/orchestrator.ts)
- scam-check endpoint in [src/app/api/scam-check/route.ts](/Users/jt/Desktop/Claude/src/app/api/scam-check/route.ts)
- next-step guidance endpoint in [src/app/api/next-step/route.ts](/Users/jt/Desktop/Claude/src/app/api/next-step/route.ts)
- memory endpoint in [src/app/api/memory/route.ts](/Users/jt/Desktop/Claude/src/app/api/memory/route.ts)
- appointments endpoint in [src/app/api/appointments/route.ts](/Users/jt/Desktop/Claude/src/app/api/appointments/route.ts)

### Browser agent backend

- FastAPI service in [backend/main.py](/Users/jt/Desktop/Claude/backend/main.py)
- browser-use agent implementation in [backend/agent.py](/Users/jt/Desktop/Claude/backend/agent.py)
- SSE event streaming to the frontend

### Context and persistence

- task memory in [src/lib/memory-store.ts](/Users/jt/Desktop/Claude/src/lib/memory-store.ts)
- scam-check logging in [src/lib/scam-store.ts](/Users/jt/Desktop/Claude/src/lib/scam-store.ts)
- calendar integration in [src/lib/google-calendar.ts](/Users/jt/Desktop/Claude/src/lib/google-calendar.ts)
- user context loading in [src/lib/user-context.ts](/Users/jt/Desktop/Claude/src/lib/user-context.ts)

## 4. Product Positioning

This app should be treated as a **validation rig**, not as the final consumer product.

It is currently best used to validate:

- whether the browser agent can complete tasks
- whether streamed step events are understandable
- whether guidance output is calm and useful
- whether scam checks are directionally correct
- whether appointment and memory context improve assistance

It is not currently the right place to optimize:

- a fake embedded browser experience
- a polished end-user browsing shell
- full autonomous browsing on arbitrary sites

## 5. Core Product Capabilities

### A. Guided browsing support

The system should help users continue a task without restarting from scratch.

Current implementation status:

- partially implemented
- browser agent can be launched
- step events stream into the UI
- copilot can answer next-step questions

### B. Scam risk assistance

The system should let the user ask whether the current page is safe.

Current implementation status:

- implemented at prototype level
- URL and page content are evaluated
- results are classified into safe, not sure, or risky
- suspicious signals can be logged

### C. Appointment-aware support

The system should make guidance more relevant when the browsing task is tied to a healthcare appointment.

Current implementation status:

- implemented at prototype level
- Google Calendar context can be loaded
- next appointment data can shape guidance

### D. Task continuation memory

The system should help a user recover context after confusion.

Current implementation status:

- implemented at prototype level
- task memory is stored and returned through API routes

## 6. Target User

### Primary user

An older adult who still uses the web independently but needs help with:

- healthcare portals
- pharmacy/refill flows
- appointment prep
- remembering what they were doing
- recognizing risky pages

### Secondary user

A family member or caregiver who may want the user to stay independent while still having a path to escalation when needed.

## 7. UX Principles

Even in prototype form, SafeStep should follow these constraints:

- one primary action at a time
- plain language
- no fake certainty
- no hidden autonomy
- explicit user confirmation before sensitive actions
- preserve dignity and avoid patronizing tone

## 8. Non-Goals

For the current product stage, SafeStep is not:

- a replacement browser
- a general call-center bot
- a medical advice system
- an autonomous form-submission engine
- a financial transaction agent
- a silent surveillance layer

## 9. Twilio Integration Direction

### Objective

Add outbound calling as an escalation path when text guidance is not sufficient.

Twilio should be used to support a narrow and defensible workflow:

- the user explicitly asks for help calling a provider
- or the app offers a call during a moment of confusion or risk and the user explicitly approves it

This should be implemented as **provider-support calling**, not as unrestricted autonomous calling.

### Best initial use case

The strongest first use case is:

**Call a healthcare provider office on the user’s behalf for low-risk administrative tasks.**

Examples:

- confirm appointment details
- ask for office hours
- ask what portal or phone number should be used
- check whether a refill request should go through the portal or by phone
- ask what documents or insurance cards to bring
- ask whether telehealth instructions were sent

### Why this fits the current app

The codebase already has the right context sources:

- appointment details
- task memory
- browsing context
- scam-risk context
- user profile and support preferences

That means a phone call can be contextual rather than generic.

### Twilio product requirements

The Twilio integration must:

- require explicit user approval before placing a call
- disclose that the caller is an AI assistant calling on behalf of the user
- keep the supported tasks narrow and administrative
- log call state and outcomes
- allow immediate cancellation
- avoid sharing more personal information than necessary

### Twilio architecture requirements

The system should add:

- a `POST /api/calls/start` endpoint to create an outbound call
- Twilio webhook endpoints for call state updates
- persisted `call_sessions` records in Supabase
- a conversation controller that injects context and policy into the voice runtime

### Voice model requirements

If a voice model is used to speak to provider staff, it must:

- announce itself clearly
- state that it is assisting the patient
- follow a structured call goal
- avoid unsupported commitments or authorizations
- terminate or escalate when asked for actions outside scope

### Out-of-scope call behaviors

The first version must not:

- authorize treatment
- provide medical advice
- commit to payments
- negotiate bills
- handle emergency situations
- impersonate the user without disclosure

## 10. Twilio MVP Scope

### MVP workflow

1. User is in a healthcare-related task.
2. User requests a provider call, or SafeStep suggests one.
3. User explicitly confirms the call.
4. SafeStep starts a Twilio outbound call.
5. A constrained voice workflow speaks to the provider office.
6. The app stores the call outcome and shows the result back to the user.

### Required call payload

- `provider_name`
- `phone_number`
- `call_goal`
- `patient_name`
- `consent_confirmed`
- optional appointment context
- optional callback number
- optional constraints

### Success criteria

- call can be started from an app endpoint
- call status is visible in the app
- user can stop the call
- the final summary is persisted
- the voice workflow stays within the approved scope

## 11. Safety, Privacy, and Policy Constraints

Before any live deployment of provider calling, the system must enforce:

- explicit per-call user consent
- minimum necessary disclosure of personal information
- audit logging of who initiated the call and why
- transcript retention policy
- clear provider disclosure that the caller is an AI assistant
- refusal logic for unsupported requests

If these controls are not implemented, the system should not place live provider calls.

## 12. Near-Term Roadmap

### Phase 1: Solidify the current harness

- add backend health status to the UI
- improve task preset coverage
- improve event clarity and failure reporting

### Phase 2: Add Twilio calling infrastructure

- add call-start endpoint
- add Twilio client integration
- add webhook routes
- add `call_sessions` persistence

### Phase 3: Add constrained provider-call workflow

- add approved call goal types
- add user approval flow
- add call summary capture
- add cancellation and failure handling

### Phase 4: Move toward extension architecture

- shift the user-facing experience into a Chrome extension
- keep the web app as a support console, settings surface, or internal validation tool

## 13. Deprecated Documents

Earlier planning documents have been moved to:

- [deprecated/PRD.md](/Users/jt/Desktop/Claude/deprecated/PRD.md)
- [deprecated/InitialPRD.md](/Users/jt/Desktop/Claude/deprecated/InitialPRD.md)

They remain useful as historical context but should not be treated as the current source of truth.
