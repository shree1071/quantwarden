import type { Finding } from "./types.js";
/** Current on-disk baseline schema version. */
export declare const BASELINE_VERSION: 1;
/** The on-disk baseline shape: a version tag and a set of fingerprints. */
export interface Baseline {
    version: number;
    fingerprints: string[];
}
/**
 * Stable, line-INSENSITIVE fingerprint of a finding: the hex SHA-256 of
 * `ruleId|file|normalizedSnippet`. The line number is deliberately excluded so
 * the fingerprint survives line shifts; the snippet's whitespace is normalized
 * so it survives reformatting.
 */
export declare function fingerprintFinding(f: Finding): string;
/** Build a {@link Baseline} from a set of findings (deduped, sorted). */
export declare function baselineFromFindings(findings: readonly Finding[]): Baseline;
/**
 * Split findings into those NOT in the baseline (`newFindings`) and those that
 * ARE (`suppressed`). Order within each group is preserved from the input.
 */
export declare function applyBaseline(findings: readonly Finding[], baseline: Baseline): {
    newFindings: Finding[];
    suppressed: Finding[];
};
/**
 * Load a baseline from disk. Returns an empty baseline (rather than throwing)
 * when the file is missing or unparseable, so callers can treat "no baseline"
 * and "absent baseline" uniformly.
 */
export declare function loadBaseline(path: string): Promise<Baseline>;
/**
 * Write a baseline derived from the given findings to disk as pretty JSON
 * (trailing newline). Returns the baseline that was written.
 */
export declare function saveBaseline(path: string, findings: readonly Finding[]): Promise<Baseline>;
//# sourceMappingURL=baseline.d.ts.map