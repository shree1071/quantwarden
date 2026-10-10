import type { Detector, Finding, ScanOptions, ScanResult } from "./types.js";
/**
 * The full set of built-in detectors exposed on the public API. Re-exported
 * from {@link builtinDetectors} in `registry.ts` — the single source of truth
 * the {@link defaultRegistry} is also built from — so the public array and the
 * registry can never drift apart. The manifest scanner is handled separately
 * (it parses JSON rather than running a Detector).
 */
export declare const detectors: Detector[];
/** Stable comparator: by file, then line, then ruleId. Exported for reuse. */
export declare function compareFindings(a: Finding, b: Finding): number;
/**
 * Run all applicable detectors + the manifest scanner over a single file's
 * contents, honouring the source / config / dependencies toggles. Pure: no I/O.
 * Exported so the parallel worker and unit tests can drive it directly.
 */
export declare function detectFile(file: string, content: string, dets: readonly Detector[], toggles: {
    source: boolean;
    config: boolean;
    deps: boolean;
}, disabledRules?: readonly string[]): Finding[];
/**
 * Recursively scan a directory (or single file, or explicit file list) for
 * classical asymmetric crypto. Honours the source / dependencies / config
 * toggles (all default true) and reports progress through `options.onFile`.
 */
export declare function scan(options: ScanOptions): Promise<ScanResult>;
/**
 * Filter an explicit relative file list down to the paths that pass the binary
 * filter and the include/exclude patterns, returning them deduped and sorted for
 * deterministic output. Size limits are enforced later (we still read manifests
 * over the cap). Non-existent files are simply skipped at read time.
 *
 * Pure + synchronous, and exported so the parallel enumerator applies the EXACT
 * same filtering for explicit file lists as the serial path (byte-for-byte
 * identical results under `--parallel`).
 */
export declare function filterExplicitFileList(files: readonly string[], options: Pick<ScanOptions, "include" | "exclude">): string[];
//# sourceMappingURL=scan.d.ts.map