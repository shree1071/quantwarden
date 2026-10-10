/**
 * Codemod registry — deterministic, template-able fixes keyed by finding.
 *
 * A codemod only earns a place here if its output reliably CLEARS the finding
 * (the remediation pipeline enforces this with the `verify_fix` gate). That
 * makes the set deliberately small: mechanical config toggles qualify;
 * dependency swaps and source crypto rewrites generally do NOT (there is no
 * safe drop-in replacement, and a manifest fix can't "remove" the finding
 * without deleting the dependency) — those are left to triage + the LLM
 * remediation layer, not an auto-codemod.
 */
import type { Finding } from "../types.js";
import type { Patch } from "../agent-types.js";
/** A deterministic fix for a class of findings. */
export interface Codemod {
    id: string;
    /** True when this codemod can produce a deterministic fix for the finding. */
    applies(finding: Finding): boolean;
    /** Produce a patch (full new file content), or null if it changed nothing. */
    apply(content: string, finding: Finding): Patch | null;
}
/** All registered codemods, in priority order. */
export declare const codemodRegistry: Codemod[];
/** The first codemod that applies to `finding`, or undefined. */
export declare function codemodFor(finding: Finding): Codemod | undefined;
//# sourceMappingURL=registry.d.ts.map