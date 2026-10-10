/**
 * Snippet-level fix verification: run the detectors over a piece of code (NOT
 * the filesystem) and report any classical crypto that remains. This is the
 * deterministic gate a fix must pass — the same logic the MCP `verify_fix` tool
 * and the remediation pipeline both use, so they can never disagree on what
 * "the finding is gone" means.
 */
import type { Finding } from "./types.js";
/**
 * Map a language name (or a bare extension) to a source extension whose
 * detectors we run. Returns null for languages the scanner does not analyze.
 */
export declare function languageToExtension(language: string): string | null;
/** Result of {@link verifyFix}: the findings that remain, and whether the
 * language is one the scanner actually analyzes (so `findings: []` on an
 * unsupported language is NOT a clean verification). */
export interface VerifyResult {
    supported: boolean;
    findings: Finding[];
}
/**
 * Run all detectors over `code`, selecting them by `filename` (extension) or
 * `language`. Pure: no I/O. When neither identifies an analyzable language,
 * `supported` is false and the empty findings list must not be read as "fixed".
 */
export declare function verifyFix(code: string, opts: {
    filename?: string;
    language?: string;
}): VerifyResult;
//# sourceMappingURL=verify.d.ts.map