/**
 * Reporters: turn a {@link ScanResult} into SARIF 2.1.0, a clean JSON object,
 * or a human-readable text summary. No third-party dependencies — ANSI colour
 * is emitted with raw escape codes and is off by default.
 */
import type { RuleMeta, ScanResult } from "./types.js";
import type { SecurityTier } from "./remediation.js";
import type { StandardsProfile } from "./standards-profiles.js";
import type { HndlReport } from "./hndl.js";
import type { MandateEvaluation } from "./mandates.js";
/** Minimal SARIF 2.1.0 log shape (kept permissive on purpose). */
export interface SarifLog {
    $schema: string;
    version: "2.1.0";
    runs: unknown[];
}
/** Options shared by the structured reporters ({@link toSarif} / {@link toJson}). */
export interface ReportOptions {
    /**
     * Omit `location.snippet` from every finding in the output. Defaults to false
     * (snippets are included). Snippets of `sensitive` findings (e.g. PEM key
     * blocks, SSH public keys) are ALWAYS omitted regardless of this flag — the
     * snippet there IS the sensitive value.
     */
    redactSnippets?: boolean;
    /**
     * Full rule catalog to advertise in SARIF `tool.driver.rules[]`, even for
     * rules that produced no finding in this run. Pass
     * `defaultRegistry.ruleCatalog()`. When omitted, only the rules that actually
     * fired are emitted (the historical behaviour). SARIF-only; ignored by
     * {@link toJson}.
     */
    catalog?: RuleMeta[];
    /**
     * Optional HNDL exposure analysis ({@link computeHndl}). When supplied, each
     * finding gains its `exposure` fields (score, bound data asset, rationale)
     * keyed by fingerprint, and the report carries the repo-level HNDL summary.
     * Purely additive: it never changes finding identity, ordering, or exit codes.
     */
    hndl?: HndlReport;
    /**
     * Optional compliance-mandate evaluation ({@link evaluateMandates}). When
     * supplied, the JSON report carries a top-level `mandateMapping` block and the
     * SARIF run carries the same under `run.properties.mandate` — the
     * machine-readable half of the `--mandate` gate for CI consumption. Purely
     * additive: it never changes finding identity, ordering, or exit codes.
     */
    mandate?: MandateEvaluation;
}
/** Serialize a scan result as SARIF 2.1.0. */
export declare function toSarif(result: ScanResult, opts?: ReportOptions): SarifLog;
/** Serialize a scan result as a plain JSON-friendly object. */
export declare function toJson(result: ScanResult, opts?: ReportOptions): Record<string, unknown>;
/**
 * Render a human-readable summary of a scan result. Colour is off by default;
 * pass `{ color: true }` to emit ANSI escape codes.
 */
export declare function formatSummary(result: ScanResult, options?: {
    color?: boolean;
    tier?: SecurityTier;
}): string;
/**
 * Per-family migration targets for a CNSA security tier — surfaces the otherwise
 * library-only {@link remediationForTier} in human reports. Category 5 shows the
 * ML-KEM-1024 / ML-DSA-87 sets CNSA 2.0 mandates for national-security systems and
 * long-lived secrets. Returns plain (un-coloured) lines; the caller styles them.
 */
export declare function formatTierGuidance(byAlgorithm: Record<string, number>, tier: SecurityTier): string[];
/**
 * Per-family migration targets tailored to a selected {@link StandardsProfile}
 * (`--profile`). Unlike {@link formatTierGuidance} (CNSA-tier only), this surfaces the
 * regime's parameter sets AND its hybrid stance — required (ANSSI/BSI) vs recommended
 * (NIST/NCSC) vs optional (CNSA 2.0) — so guidance isn't regime-wrong. Returns plain
 * (un-coloured) lines; the caller styles them.
 */
export declare function formatProfileGuidance(byAlgorithm: Record<string, number>, profile: StandardsProfile): string[];
//# sourceMappingURL=report.d.ts.map