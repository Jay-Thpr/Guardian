PRD: Senior-Safe Browser Copilot
1. Overview

Working name: SafeStep
Product type: Chrome extension + lightweight web backend
Primary users: Older adults with early cognitive decline or memory/executive-function difficulties
Secondary users: Family caregivers

SafeStep is a persistent browser copilot that stays available while an older adult browses the web normally in Chrome. It helps them complete important healthcare-related tasks, avoid online scams, and continue multi-step tasks when they get confused or forget what they were doing.

The product is designed for a hackathon MVP, so it focuses on three tightly scoped workflows:

Appointment planning and portal help
Scam vulnerability protection
Remembering and executing tasks

The assistant appears as a floating overlay in Chrome, can understand the current page, can use Google Calendar context, and can provide calm, senior-friendly step-by-step guidance. It may also use Browser Use API for selected guided flows.

2. Problem

Older adults with early cognitive decline often struggle with online tasks that younger users take for granted. This is especially true when tasks are:

high stakes
multi-step
confusingly worded
hidden inside bad portal UX
mixed with scams, spoofed links, or manipulative messages

Common pain points include:

forgetting appointments or how to prepare for them
struggling to log into hospital or pharmacy portals
not knowing whether a website, email, or payment request is legitimate
forgetting what step they were on in the middle of a task
repeatedly restarting tasks after confusion
difficulty executing tasks even when they conceptually know what they need to do

Existing tools are often too general, too cluttered, or not built for seniors in the middle of real browsing activity.

3. Vision

Create an always-available, senior-friendly browser assistant that helps older adults safely navigate important online tasks without forcing them into a separate app or requiring them to learn a new workflow.

The product should feel like:

a calm guide
a continuity layer
a safety checkpoint
a step-by-step helper

It should support autonomy, not replace it.

4. Goals
Primary goals
Help users safely navigate healthcare-related online tasks
Reduce scam risk during real browsing sessions
Help users remember and continue tasks without restarting from scratch
Make assistance available directly in Chrome, not in a separate nested browser
Secondary goals
Use calendar context to make appointment-related help more useful
Demonstrate persistent memory in a clear, non-creepy way
Show a compelling ethical AI story for hackathon judging
5. Non-Goals

For MVP, SafeStep will not:

provide medical advice or diagnosis
autonomously submit sensitive forms without confirmation
execute financial transactions on behalf of the user
monitor all browsing silently in the background without user invocation
support every possible website reliably
be a full caregiver management platform
be a native desktop assistant outside Chrome
6. Target Users
Primary user

Older adult with mild dementia, early cognitive decline, or task-execution difficulty who still browses the web independently but benefits from help.

Example traits
can use Chrome but gets confused by complex websites
may forget what they were trying to do
may be vulnerable to urgency-based scams
benefits from large text, simple language, repetition, and reassurance
Secondary user

Caregiver or family member who wants the user to stay independent but safer.

For MVP, caregiver functionality is limited.

7. Core Use Cases
A. Appointment planning

The user needs help with healthcare-related digital tasks, such as:

logging into a hospital portal
finding appointment details
understanding what the appointment is for
reading instructions
accessing telehealth info
refilling or purchasing medication online
B. Scam vulnerability

The user encounters:

suspicious emails
fake medical or pharmacy requests
spoofed billing/payment pages
fake Medicare or insurance notices
urgency-based scam websites
suspicious texts or browser popups

They need an easy way to ask:
“Is this safe?”

C. Remembering / executing tasks

The user:

forgets what they were doing
loses track of steps
gets stuck in multi-step processes
needs one-step-at-a-time continuation

They need help with:
“What do I do next?”
and
“What was I trying to do?”

8. Product Concept

SafeStep is a Chrome extension that injects a floating senior-friendly assistant into webpages. The user can continue browsing in normal Chrome while the assistant remains accessible.

The assistant can:

inspect the current page context
explain what the page is
identify likely next steps
flag scam indicators
use Google Calendar context for appointment-related flows
remember the current task and last known step
optionally use Browser Use API for guided site interaction on supported demo flows
9. User Experience Principles

The UI and behavior should be explicitly senior-friendly.

UX principles
one primary action at a time
very large readable text
high contrast
calm, plain language
short sentences
repeatable instructions
minimal clutter
no jargon
explicit confirmation before sensitive actions
visible reassurance and progress
Behavioral principles
never pretend certainty when uncertain
clearly distinguish “safe,” “uncertain,” and “risky”
slow down risky actions
prioritize guidance over autonomy for dangerous moments
preserve user dignity
do not scold the user
10. Key Features
10.1 Persistent assistant overlay

A floating assistant bubble appears on webpages. Clicking it expands a side panel or overlay.

Core actions in the overlay
Is this safe?
What do I do next?
Appointments
Repeat that
I’m confused

For MVP, these can be button-first with optional text input.

10.2 Page understanding

The extension reads lightweight page context, such as:

page title
URL/domain
visible text
form labels
button labels
major headings

This context is sent to the backend for interpretation.

The user can ask:

“What is this page?”
“What is it asking me to do?”
“What should I click next?”
10.3 Appointment helper

Google Calendar integration provides context for upcoming appointments.

The assistant can:

show the user’s next appointment
explain when it is
describe likely prep context if stored
connect current browsing behavior to appointment tasks
help navigate portals relevant to that appointment
help with pharmacy/refill workflows
Example

“You have a doctor appointment tomorrow at 2 PM. This page looks like your hospital portal. The next step is to sign in to view the appointment details.”

10.4 Scam checker

The assistant evaluates whether the current site, page, or message looks suspicious.

Signals it can consider
suspicious or mismatched domains
urgency language
pressure to act immediately
requests for passwords, payment, SSN, or gift cards
fake provider language
mismatched branding
suspicious billing/refill prompts
spoofed healthcare, insurance, or banking patterns
Output style

The assistant should return a simple classification:

Looks safe
Not sure
Looks risky

It should also explain why in plain language.

Example

“This page looks risky because the web address does not match the hospital’s normal website and it is asking for urgent payment.”

10.5 Task continuation memory

The backend stores lightweight persistent task memory.

Memory examples
current task: “log into hospital portal”
last step: “enter username”
page intent: “pharmacy refill flow”
recent confusion: “user asked for next step twice”
appointment tie-in: “refill medication before tomorrow appointment”

The user can ask:

“What was I doing?”
“What comes next?”
“Can you explain again?”

The assistant uses stored task state to continue rather than restarting the whole explanation.

10.6 Browser Use integration

Browser Use API is used selectively for guided actions on supported flows.

Intended use
inspect supported healthcare/pharmacy pages
identify next-step actions
optionally navigate within a constrained demo flow
support task guidance with real page interaction
MVP constraint

Do not try to support arbitrary full-site automation. Use Browser Use in one or two polished demo flows only.

11. User Stories
Appointment planning
As an older adult, I want help understanding my hospital portal so I can find my appointment details.
As an older adult, I want the assistant to know my upcoming appointments so it can guide me in context.
As an older adult, I want help refilling or ordering medication so I do not get lost on the website.
Scam protection
As an older adult, I want to check whether a page or request is suspicious before I enter personal information.
As an older adult, I want scam explanations in plain language so I understand why something is unsafe.
Task continuation
As an older adult, I want the assistant to remember what I was trying to do so I do not have to start over.
As an older adult, I want one-step-at-a-time instructions so I can complete tasks without getting overwhelmed.
12. MVP Scope

For the hackathon MVP, build only what is necessary to demonstrate the product clearly.

In scope
Chrome extension with floating assistant overlay
page context extraction
backend API
Google Calendar read integration
task memory for current and recent steps
scam analysis for current page / pasted text
“What do I do next?” guidance
1 supported healthcare portal or pharmacy demo flow
Browser Use API integration for that demo flow
Out of scope
account management for many users
full caregiver dashboard
broad cross-site automation
speech input/output unless it is easy
polished multi-user production auth
advanced long-term memory graph
publishing to Chrome Web Store
13. Functional Requirements
13.1 Extension overlay
The system must inject a visible floating assistant into supported webpages.
The overlay must be openable and closable by the user.
The overlay must expose at least 3 primary actions:
Is this safe?
What do I do next?
Appointments
13.2 Page context capture
The system must capture current page URL, title, and visible page text.
The system must capture likely actionable UI elements such as buttons and form labels.
The system must send page context to the backend on demand.
13.3 Scam analysis
The system must analyze the current page or pasted content for scam risk.
The system must return a plain-language classification and short explanation.
The system must highlight risky signals without claiming certainty when uncertain.
13.4 Task guidance
The system must provide a likely next step for the current page/task.
The system must present instructions in short, clear language.
The system must support follow-up actions like “repeat” or “explain again.”
13.5 Appointment context
The system must connect to Google Calendar.
The system must fetch upcoming appointments for the user.
The system must display the next appointment in the assistant.
The system should use upcoming appointment context when interpreting relevant portal activity.
13.6 Task memory
The system must store the user’s current task and most recent step.
The system must retrieve this memory on follow-up queries.
The system must support “What was I doing?” type prompts.
13.7 Browser Use integration
The system must call Browser Use API for a supported demo workflow.
The system should use Browser Use results to improve step-by-step task guidance.
The system must not autonomously complete sensitive actions without clear user confirmation.
14. Non-Functional Requirements
Accessibility
text should be large and readable
buttons should be easy to click
interface should be uncluttered
color contrast should be strong
Performance
assistant response time should feel fast enough for live browsing
scam analysis and next-step guidance should ideally return within a few seconds
Reliability
if page parsing fails, the assistant should admit uncertainty and fall back gracefully
extension should not break webpage functionality
Privacy
only page context needed for the task should be sent to the backend
sensitive actions should require explicit user initiation
no silent always-on surveillance framing
15. Technical Architecture
15.1 Frontend
Chrome extension

Main parts:

manifest.json
content script for injected overlay UI
background script for extension state and backend messaging
optional popup/settings page
Responsibilities
show assistant UI
collect page context
send requests to backend
render assistant responses
preserve lightweight session state
15.2 Backend

Could be FastAPI or Node/TypeScript.

Responsibilities
receive page context
orchestrate LLM calls
manage task memory
integrate with Google Calendar
integrate with Browser Use API
return scam assessments and next-step guidance
15.3 AI layer

Claude is used for:

page explanation
next-step guidance
scam reasoning
senior-friendly language transformation
task continuation based on memory
15.4 Google Calendar integration

Use Google Calendar API for:

retrieving upcoming appointments
attaching appointment context to task flows
powering the Appointments panel
15.5 Browser Use integration

Use Browser Use API for:

structured browsing support in selected workflows
identifying next actions on demo pages
controlled navigation assistance
15.6 Data storage

Use a lightweight backend store such as:

Postgres
Supabase
or even simple temporary session storage for hackathon scope
Stored entities
user profile
upcoming appointments
current task
last step
recent warnings
recent assistant interactions
16. Data Model
16.1 User
user_id
name
timezone
calendar_connected
16.2 Appointment
appointment_id
title
start_time
source
prep_notes
portal_link
16.3 TaskMemory
task_id
user_id
task_type
task_goal
current_step
last_page_url
status
updated_at
16.4 ScamCheck
check_id
user_id
url
classification
explanation
risk_signals
created_at
17. Primary Demo Flow
Demo scenario

An older adult has an upcoming medical appointment and is trying to manage related online tasks.

Step 1

The user opens a hospital portal or pharmacy-related webpage in normal Chrome.

Step 2

The extension overlay is visible. The user opens it.

Step 3

The assistant shows:

next appointment from Google Calendar
a short context message tying the page to that appointment

Example:
“You have a cardiology appointment tomorrow at 2 PM. This page looks like your hospital portal.”

Step 4

The user asks:
“What do I do next?”

The assistant uses page context and possibly Browser Use to say:
“Next, click Sign In. After that, enter your username.”

Step 5

The user navigates to a suspicious billing/refill/payment page or email.

Step 6

The user clicks:
“Is this safe?”

The assistant evaluates the page and responds:
“This looks risky because the website address does not match the hospital’s usual domain and it is asking for urgent payment.”

Step 7

The user asks:
“What was I doing again?”

The assistant retrieves memory:
“You were trying to check your appointment details for tomorrow and refill your medicine.”

This demo shows all three pillars in one story.

18. Success Metrics

For hackathon MVP, success is qualitative more than quantitative.

Product success signals
demo clearly shows the assistant staying available during normal browsing
scam check feels useful and believable
task continuation feels memory-aware
appointment context adds real value
UX feels senior-friendly, not like a normal dev tool
Hackathon success signals
judges immediately understand the problem
ethical framing is strong
Browser Use integration feels real, not forced
Google Calendar integration is meaningfully connected to the workflow
scope looks focused and polished
19. Risks
Technical risks
Chrome extension integration takes longer than expected
page extraction is messy on real sites
Browser Use orchestration becomes a time sink
auth for Google Calendar slows development
Product risks
trying to solve dementia too broadly
appearing paternalistic or surveillance-heavy
scam detection sounding overconfident
UI not feeling truly senior-friendly
too much scope for 6 hours
20. Mitigations
use only 1–2 polished demo sites
keep the extension UI extremely simple
focus on guidance, not autonomous action
use mock or demo calendar data if auth blocks progress
hardcode a small number of clear flows if needed
keep memory narrow: current task + last step + recent context
21. Ethical Considerations

This product operates in a sensitive domain. The MVP should explicitly embody these principles:

Autonomy

The assistant should support user choice, not take over.

Transparency

The assistant should explain why it thinks something is risky or what the next step is.

Uncertainty

The assistant must admit when it is unsure.

Safety

Sensitive actions should require user confirmation.

Dignity

The product should not infantilize the user.

Minimalism

Only the minimum necessary data should be processed.

A strong hackathon framing is:
SafeStep helps older adults stay independent online while adding clarity, continuity, and protection in moments where confusion can become dangerous.

22. MVP Build Plan
Phase 1: Extension shell
create extension
inject floating assistant
display basic panel with action buttons
Phase 2: Backend intelligence
build API endpoint for page analysis
return “what is this page,” “what next,” and “is this safe” outputs
Phase 3: Calendar context
connect Google Calendar or mock upcoming appointment data
show next appointment in panel
Phase 4: Task memory
store current task and last step
support “What was I doing?”
Phase 5: Browser Use demo flow
implement one supported hospital/pharmacy flow
use Browser Use to enrich next-step guidance
23. Open Questions
Should the assistant be text-only for MVP, or include voice later?
Should the scam checker support pasted email text and screenshots, or only current page?
Should caregiver features be omitted entirely for MVP?
Which demo site is safest and easiest to support?
Should Browser Use actively click, or only inspect and recommend?
24. Final Product Statement

SafeStep is a senior-friendly Chrome copilot that helps older adults safely navigate healthcare websites, avoid online scams, and continue important tasks without losing their place. By combining in-context page understanding, Google Calendar appointment awareness, lightweight persistent memory, and guided browser assistance, it supports independence without sacrificing safety.