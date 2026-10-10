import { buildContext } from "./redact.js";
/** The system rubric that defines what an exposure verdict means. */
export const TRIAGE_RUBRIC = "You are a post-quantum cryptography triage assistant. You are given ONE finding " +
    "of classical (quantum-vulnerable) cryptography detected in a codebase, with " +
    "limited, possibly-redacted context. Assess its REAL-WORLD exposure and urgency. " +
    "exposureScore (0-100): how exploitable/exposed this usage is — a long-lived " +
    "confidentiality key over the network (harvest-now-decrypt-later) scores high; a " +
    "short-lived local signature scores lower. priority: 'now' for HNDL/high-exposure, " +
    "'soon' for important-but-not-urgent, 'later' for low-exposure. You NEVER decide " +
    "whether the finding is valid and you NEVER suppress it — you only rank exposure. " +
    "Base your rationale only on the given context; do not invent facts.";
/** JSON Schema every triage verdict must satisfy. */
export const TRIAGE_VERDICT_SCHEMA = {
    type: "object",
    required: ["exposureScore", "priority", "rationale"],
    properties: {
        exposureScore: { type: "number", minimum: 0, maximum: 100 },
        priority: { enum: ["now", "soon", "later"] },
        rationale: { type: "string" },
    },
};
/**
 * Build a triage request bundle for a set of findings. Offline: for non-metadata
 * levels, pass `readContent` to supply each finding's file text; without it,
 * contexts are built at `metadata` level (no source), which is the safe default
 * for the MCP plane where the host agent already has the code open.
 */
export function buildTriageRequest(findings, level = "metadata", readContent) {
    const effectiveLevel = readContent ? level : "metadata";
    const contexts = findings.map((f) => buildContext(f, effectiveLevel, readContent ? readContent(f) : ""));
    return { rubric: TRIAGE_RUBRIC, schema: TRIAGE_VERDICT_SCHEMA, contexts };
}
//# sourceMappingURL=triage.js.map