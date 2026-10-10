import type { Finding, RuleMeta } from "./types.js";
/**
 * Generic catalog entry for the `dep-advisory` rule. The per-advisory specifics
 * (title / severity / patched version) live on each individual finding; this is
 * the shared, package-agnostic description SARIF advertises for the rule.
 */
export declare const DEP_ADVISORY_RULE: RuleMeta;
/** Options for {@link scanAdvisories}. */
export interface ScanAdvisoriesOptions {
    /** Per-tool timeout in milliseconds. Default: 120_000. */
    timeoutMs?: number;
    /** Max stdout buffer per tool, in bytes. Default: 32 MiB. */
    maxBuffer?: number;
    /**
     * Injectable command runner (for tests). Resolves with the tool's stdout, or
     * rejects with an error carrying `code` (e.g. `"ENOENT"`) and, for a non-zero
     * exit, the captured `stdout`. Defaults to a promisified `execFile`.
     */
    exec?: ExecFn;
    /** Injectable directory lister (for tests). Defaults to `fs.readdir`. */
    listDir?: (dir: string) => Promise<string[]>;
}
/** Shape of an injectable command runner and of the errors it may reject with. */
export type ExecFn = (command: string, args: readonly string[], options: {
    cwd: string;
    timeout: number;
    maxBuffer: number;
}) => Promise<{
    stdout: string;
    stderr: string;
}>;
/**
 * Scan `root` for dependency security advisories by shelling out to each present
 * ecosystem's audit tool. Never throws: a missing tool or a tool error becomes a
 * diagnostic string. Returns the merged findings plus the diagnostics.
 */
export declare function scanAdvisories(root: string, opts?: ScanAdvisoriesOptions): Promise<{
    findings: Finding[];
    diagnostics: string[];
}>;
//# sourceMappingURL=advisories.d.ts.map