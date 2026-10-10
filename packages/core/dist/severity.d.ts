/**
 * Severity utilities shared across the monorepo (qScan, the MCP server, the
 * GitHub Action). Lifts the previously-duplicated ordering / threshold / SARIF
 * mapping logic into one place so every consumer agrees on what "at or above a
 * threshold" means and how a severity maps to a SARIF level.
 */
import type { Severity } from "./types.js";
/** Severity ordering, most → least severe. Index 0 is the most severe. */
export declare const SEVERITY_ORDER: readonly Severity[];
/**
 * Rank of a severity within {@link SEVERITY_ORDER} (0 = most severe). Lower
 * ranks are more severe; unknown values fall to the end.
 */
export declare function severityRank(s: Severity): number;
/**
 * True when `severity` is at or above `threshold` (i.e. at least as severe).
 * Because lower ranks are more severe, "at or above" is `rank <= threshold`.
 */
export declare function meetsThreshold(severity: Severity, threshold: Severity): boolean;
/** Map our severity to a SARIF 2.1.0 result level. */
export declare function sarifLevel(severity: Severity): "error" | "warning" | "note";
//# sourceMappingURL=severity.d.ts.map