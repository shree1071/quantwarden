/**
 * The remediation pipeline: turn candidate patches (from codemods or the LLM)
 * into VERIFIED, in-policy patches. Pure and deterministic — the verify gate
 * runs `verifyFix` on the patched content in memory, so this needs no
 * filesystem or git. Callers (the `qremediate` CLI) decide what to DO with the
 * verified patches (print a diff, write them, or open a PR in a worktree).
 *
 * Two gates, both must pass:
 *   1. patch-policy   — the patch may only touch sanctioned files.
 *   2. verify_fix     — the patched content clears the target finding, adds no
 *                       new finding type, and nets fewer findings than before.
 */
import type { Finding } from "./types.js";
import type { Patch } from "./agent-types.js";
import type { PolicyContext } from "./patch-policy.js";
export interface VerifiedPatch {
    finding: Finding;
    patch: Patch;
}
export interface RejectedPatch {
    finding: Finding;
    reason: string;
}
export interface RemediationResult {
    applied: VerifiedPatch[];
    rejected: RejectedPatch[];
}
export interface RemediateOptions {
    /** Current content of the file a finding lives in. */
    readContent: (finding: Finding) => Promise<string> | string;
    /** Produce a candidate patch for a finding (codemod or LLM), or null. */
    patchSource: (finding: Finding, content: string) => Promise<Patch | null> | Patch | null;
    /** Which files a patch is allowed to touch. */
    policy: PolicyContext;
}
/**
 * Run each finding through patchSource → policy → verify, collecting the patches
 * that survive both gates and the reasons the rest were dropped.
 */
export declare function remediateFindings(findings: readonly Finding[], opts: RemediateOptions): Promise<RemediationResult>;
//# sourceMappingURL=remediate-pipeline.d.ts.map