/**
 * Aggregates findings into a {@link CryptoInventory}: per-algorithm,
 * per-category and per-severity counts, the harvest-now-decrypt-later count,
 * and a 0–100 readiness score.
 */
import type { CryptoInventory, Finding, InventoryAsset } from "./types.js";
/**
 * Compute a 0–100 readiness score. 100 means no classical asymmetric crypto was
 * found. Findings accrue a severity-weighted penalty (with per-bucket diminishing
 * returns), then the score is `100 * e^(-penalty/scale)`. Exponential decay keeps
 * the score responsive across the whole range — fixing findings always raises it,
 * and a large legacy repo lands low without pinning flat at 0 (which made progress
 * invisible under the old linear model). Tuned so one low ~97, one critical ~74.
 */
export declare function readinessScore(findings: Finding[]): number;
/** Build the full inventory (counts + HNDL + score) from a set of findings. */
export declare function buildInventory(findings: Finding[], assets?: InventoryAsset[]): CryptoInventory;
//# sourceMappingURL=inventory.d.ts.map