import type { Detector, Finding } from "./types.js";
/** One cached file: the content hash it was computed for, and its findings. */
export interface CacheEntry {
    hash: string;
    findings: Finding[];
}
/** sha256 of a file's content (hex). */
export declare function hashContent(content: string): string;
/**
 * Fingerprint of everything that changes what a scan produces: the tool version,
 * the active detector ids (sorted), and the disabled-rule set (sorted). A change
 * to any of these invalidates the whole cache.
 */
export declare function rulesetFingerprint(detectors: readonly Detector[], disabledRules: readonly string[] | undefined): string;
/**
 * Load the cache file into a `Map<relPath, CacheEntry>`. Returns an empty map
 * when the file is missing, unparseable, the wrong version, or was written for a
 * different ruleset (in which case its entries are stale and must not be reused).
 */
export declare function loadCache(cacheFile: string, ruleset: string): Promise<Map<string, CacheEntry>>;
/**
 * Write the cache atomically (temp file + rename) so a concurrent reader never
 * sees a half-written file. Errors are swallowed — a cache is an optimization,
 * never a reason to fail a scan.
 */
export declare function saveCache(cacheFile: string, ruleset: string, entries: Map<string, CacheEntry>): Promise<void>;
//# sourceMappingURL=cache.d.ts.map