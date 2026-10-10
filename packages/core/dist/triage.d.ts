/**
 * Triage rubric, verdict schema, and request-bundle builder — all offline and
 * deterministic. Both planes share them: `@quantakrypto/agent` (networked)
 * prompts a model with the rubric, while the MCP `triage_findings` tool emits a
 * request bundle for the HOST agent to reason over. Keeping them here means the
 * MCP server never imports the networked package and both sides use one rubric.
 */
import type { Finding } from "./types.js";
import type { ContextLevel, RedactedContext } from "./agent-types.js";
/** The system rubric that defines what an exposure verdict means. */
export declare const TRIAGE_RUBRIC: string;
/** JSON Schema every triage verdict must satisfy. */
export declare const TRIAGE_VERDICT_SCHEMA: Record<string, unknown>;
/** A triage request bundle: the rubric, the verdict schema, and redacted contexts. */
export interface TriageRequest {
    rubric: string;
    schema: Record<string, unknown>;
    contexts: RedactedContext[];
}
/**
 * Build a triage request bundle for a set of findings. Offline: for non-metadata
 * levels, pass `readContent` to supply each finding's file text; without it,
 * contexts are built at `metadata` level (no source), which is the safe default
 * for the MCP plane where the host agent already has the code open.
 */
export declare function buildTriageRequest(findings: readonly Finding[], level?: ContextLevel, readContent?: (finding: Finding) => string): TriageRequest;
//# sourceMappingURL=triage.d.ts.map