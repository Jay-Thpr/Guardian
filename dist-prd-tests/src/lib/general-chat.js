"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGeneralChatReply = generateGeneralChatReply;
const generative_ai_1 = require("@google/generative-ai");
const FALLBACK_MODELS = [
    process.env.SAFESTEP_GEMINI_MODEL || "gemini-3.1-flash-lite-preview",
    "gemini-2.0-flash",
];
function buildGenAI() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set.");
    }
    return new generative_ai_1.GoogleGenerativeAI(apiKey);
}
function section(label, value) {
    if (!value) {
        return "";
    }
    return `- ${label}: ${value}\n`;
}
async function runGeminiPrompt(prompt) {
    const genAI = buildGenAI();
    let lastError = null;
    for (const modelName of FALLBACK_MODELS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            return result.response.text();
        }
        catch (error) {
            lastError = error;
        }
    }
    throw lastError || new Error("Unable to reach Gemini.");
}
function buildPrompt(input) {
    const profile = input.userProfile
        ? [
            `- Name: ${input.userProfile.name || "Unknown"}`,
            `- Age group: ${input.userProfile.ageGroup || "Unknown"}`,
            ...(input.userProfile.supportNeeds || []).map((item) => `- Support need: ${item}`),
            ...(input.userProfile.preferences || []).map((item) => `- Preference: ${item}`),
            ...(input.userProfile.conditions || []).map((item) => `- Condition: ${item}`),
            input.userProfile.notes ? `- Notes: ${input.userProfile.notes}` : "",
        ].join("\n")
        : "- User profile: Not available";
    const contextEntries = input.userContextEntries?.length
        ? input.userContextEntries
            .map((entry) => `- ${entry.category}: ${entry.title} — ${entry.detail}`)
            .join("\n")
        : "- User context entries: Not available";
    return [
        "You are SafeStep, a warm conversational assistant.",
        "Reply like a helpful human, not like a workflow engine.",
        "Use short, natural sentences unless the user asks for detail.",
        "If the user is casually chatting, answer casually.",
        "If the user asks for help with the page or their task, you may mention the page context naturally.",
        "Do not mention policies, internal modes, or that you are following a system prompt.",
        "If the question is unclear, ask one short clarifying question.",
        "Return plain text only. No markdown, no code fences, no JSON.",
        "",
        "User profile:",
        profile,
        "",
        "User context entries:",
        contextEntries,
        "",
        "Visible browser context:",
        section("URL", input.url),
        section("Page title", input.pageTitle),
        section("User message", input.query),
        section("Visible text", input.visibleText),
        section("Page summary", input.pageSummary),
        "",
        "Memory context:",
        section("Current task", input.taskMemory?.currentTask || null),
        section("Task goal", input.taskMemory?.taskGoal || null),
        section("Last step", input.taskMemory?.lastStep || null),
        section("Current stage", input.taskMemory?.currentStageTitle || null),
        section("Next stage", input.taskMemory?.nextStageTitle || null),
        "",
        "Appointment context:",
        section("Summary", input.appointment?.summary || null),
        section("When", input.appointment?.whenLabel || null),
        section("Location", input.appointment?.location || null),
        section("Description", input.appointment?.description || null),
        "",
        "Reply rules:",
        "- Be conversational and direct.",
        "- Do not over-format.",
        "- If the user seems to want a task completed, explain the next practical step plainly.",
    ]
        .filter(Boolean)
        .join("\n");
}
async function generateGeneralChatReply(input) {
    const prompt = buildPrompt(input);
    try {
        const rawText = await runGeminiPrompt(prompt);
        const message = rawText.trim();
        if (message) {
            return { message };
        }
    }
    catch {
        // Fallback below.
    }
    return {
        message: "I’m here with you. Tell me what you want to do, and I’ll keep it simple.",
    };
}
