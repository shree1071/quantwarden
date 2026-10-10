import type { Finding } from "./types.js";
/** Outcome of a HEAD request to a declared repository URL. */
export type RepoHeadOutcome = {
    kind: "status";
    status: number;
} | {
    kind: "unresolved";
} | {
    kind: "error";
    message: string;
};
/**
 * Injected HEAD requester. Implemented by the (networked) caller — qScan supplies
 * a `node:https`-backed one — so core never imports an outbound network module.
 * MUST resolve (never reject); map its own failures onto {@link RepoHeadOutcome}.
 */
export type RepoHeadRequester = (url: string, timeoutMs: number) => Promise<RepoHeadOutcome>;
/** Options for {@link checkProvenance}. */
export interface ProvenanceOptions {
    /**
     * Verify the declared repository over the network via {@link head}. When false
     * (or when no `head` is supplied) only the static `repo-missing` check runs.
     */
    network?: boolean;
    /** HEAD-request timeout in milliseconds. Default: 5000. */
    timeoutMs?: number;
    /** Injected HEAD requester (required for the network check to do anything). */
    head?: RepoHeadRequester;
    /** Injected file reader (for tests). Defaults to `fs.readFile`. */
    readManifest?: (file: string) => Promise<string>;
}
/**
 * Normalize a declared repository reference to an https(s) URL, or null when it
 * cannot be turned into one we can HEAD. Handles `git+https://…`, `git://…`,
 * `git@github.com:owner/repo(.git)`, the `owner/repo` and `github:owner/repo`
 * shorthands, and strips a trailing `.git`.
 */
export declare function normalizeRepoUrl(raw: string): string | null;
/**
 * Check a project's declared-source-repository provenance.
 *
 * Static (always): a present root manifest that declares NO repository yields a
 * `provenance-repo-missing` info finding. Network (`network: true` + a `head`
 * requester): a declared repository that 404s or does not resolve yields a
 * `provenance-repo-unresolved` (medium) finding; transient network errors are
 * skipped silently (recorded as a diagnostic). Never throws.
 */
export declare function checkProvenance(root: string, opts?: ProvenanceOptions): Promise<{
    findings: Finding[];
    diagnostics: string[];
}>;
/** The two rule ids this module can emit, for SARIF catalog registration. */
export declare const PROVENANCE_RULES: import("./types.js").RuleMeta[];
//# sourceMappingURL=provenance.d.ts.map