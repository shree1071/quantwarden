/**
 * Patch-policy allowlist. A remediation patch may only edit a file that already
 * has a finding, or add dependencies to a manifest. Everything else — CI config,
 * lockfiles, env/secret files, unrelated source — is denied. This is the second
 * safety gate (the first is `verify_fix`): even a "verified" patch is dropped if
 * it strays outside the sanctioned surface.
 */
import type { Patch } from "./agent-types.js";
/** Files a remediation may write to. */
export interface PolicyContext {
    /** Relative paths (posix) that contain at least one finding. */
    findingFiles: Set<string>;
    /** Relative manifest paths (package.json, requirements.txt, …). */
    manifestFiles: Set<string>;
}
export interface PolicyDecision {
    allowed: boolean;
    reason?: string;
}
/** Decide whether `patch` may be applied under `ctx`. */
export declare function checkPatchPolicy(patch: Patch, ctx: PolicyContext): PolicyDecision;
//# sourceMappingURL=patch-policy.d.ts.map