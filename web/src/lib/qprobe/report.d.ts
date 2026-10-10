/**
 * Reporting: turn a qProbe {@link RunResult} into `@quantakrypto/core`'s shared
 * output formats, so live-endpoint findings emit the SAME SARIF 2.1.0 and
 * CycloneDX 1.6 CBOM as qScan (code) and the infra detectors (config). This is
 * what lets the three planes compose into one post-quantum posture: a qScan CBOM
 * and a qProbe CBOM are both CycloneDX 1.6 documents and merge cleanly.
 *
 * The core reporters are findings-based (they derive SARIF `rules[]` and CBOM
 * crypto-assets from the findings themselves), so no registry entry is needed for
 * the `qprobe-*` rules.
 */
import type { ScanResult, SarifLog, CycloneDxBom } from "@quantakrypto/core";
import type { RunResult } from "./index.js";
/**
 * Adapt a {@link RunResult} to a {@link ScanResult}. `filesScanned` is the number
 * of endpoints probed; `root` is the probed target list.
 */
export declare function toScanResult(run: RunResult, startedAt: string, finishedAt: string): ScanResult;
export declare function toSarifReport(run: RunResult, startedAt: string, finishedAt: string): SarifLog;
export declare function toCbomReport(run: RunResult, startedAt: string, finishedAt: string): CycloneDxBom;
export declare function toJsonReport(run: RunResult, startedAt: string, finishedAt: string): Record<string, unknown>;
//# sourceMappingURL=report.d.ts.map