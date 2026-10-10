import type { Finding, ParallelScanOptions, ScanResult } from "./types.js";
/** One unit of work dispatched to a worker. */
export interface ScanChunk {
    files: string[];
}
/** What a worker returns for a chunk. */
export interface ChunkResult {
    findings: Finding[];
    filesScanned: number;
    /** Files that couldn't be read in this chunk (optional; older workers omit it). */
    unreadable?: number;
    /** Files skipped as minified in this chunk (optional; older workers omit it). */
    skippedMinified?: number;
}
/** A file plus its byte size, used for byte-balanced chunking. */
export interface SizedFile {
    rel: string;
    size: number;
}
/**
 * Bucket files into chunks of roughly `chunkBytes` total bytes each, so one
 * large file doesn't starve a worker holding many tiny files. Pure +
 * deterministic: input order is preserved within and across chunks.
 */
export declare function chunkByBytes(files: readonly SizedFile[], chunkBytes: number): ScanChunk[];
/**
 * Merge per-chunk results into a single ordered finding set + total file count.
 * Pure: applies the SAME comparator as the serial scan, so the result is
 * byte-identical regardless of chunk completion order. Exported for unit tests.
 */
export declare function mergeChunkResults(results: readonly ChunkResult[]): ChunkResult;
/**
 * Scan in parallel across a worker-thread pool, falling back to the in-process
 * serial {@link scan} for small workloads or when workers can't be used. The
 * result is deterministic and identical to the serial path.
 */
export declare function scanParallel(options: ParallelScanOptions): Promise<ScanResult>;
//# sourceMappingURL=parallel.d.ts.map