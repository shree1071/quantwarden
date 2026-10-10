/**
 * Remediation rubric, fix schema, and request-bundle builder — offline and
 * deterministic, shared by `@quantakrypto/agent` (which prompts a model with
 * them) and the MCP `remediate_findings` tool (which hands the bundle to the
 * host agent). Keeping them here means the MCP server stays offline/key-free.
 */
import type { Finding } from "./types.js";
import type { ContextLevel, RedactedContext } from "./agent-types.js";
/** The system rubric for a fix proposal. */
export declare const REMEDIATE_RUBRIC: string;
/** JSON Schema every fix proposal must satisfy. */
export declare const FIX_REQUEST_SCHEMA: Record<string, unknown>;
/** A remediation request bundle for the host agent. */
export interface RemediateRequest {
    instructions: string;
    schema: Record<string, unknown>;
    contexts: RedactedContext[];
}
/** Build a remediation request bundle (offline; metadata level unless `readContent`). */
export declare function buildRemediateRequest(findings: readonly Finding[], level?: ContextLevel, readContent?: (finding: Finding) => string): RemediateRequest;
//# sourceMappingURL=remediate-request.d.ts.map