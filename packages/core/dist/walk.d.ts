/** Default maximum file size to read: 2 MiB. */
export declare const DEFAULT_MAX_FILE_SIZE: number;
/** Options accepted by {@link walkFiles}. */
interface WalkOptions {
    /**
     * Restrict to paths matching one of these include patterns (substring or
     * relative-path-prefix match). When omitted/empty, all files pass.
     */
    include?: string[];
    /** Extra exclude patterns (substring or relative-path-prefix match). */
    exclude?: string[];
    /** Disable the built-in directory ignore list. */
    noDefaultIgnores?: boolean;
    /** Max file size in bytes; larger files are skipped. */
    maxFileSize?: number;
}
/** Normalise a path to forward-slash POSIX separators. */
export declare function toPosix(p: string): string;
/**
 * True if `rel` (a POSIX relative path) matches any pattern. A pattern with a
 * glob metacharacter (`*`, `?`, `[`) is matched as an anchored glob; a plain
 * pattern keeps the historical substring / path-prefix semantics (so `"src"`
 * still matches `src/a.ts` and `"secrets"` matches anywhere).
 */
export declare function matchesAny(rel: string, patterns: readonly string[]): boolean;
/** True if the file's extension marks it as binary / non-text. */
export declare function isBinaryPath(rel: string): boolean;
/**
 * True if the path is a binary cryptographic key container we scan byte-preserving.
 * Uses a suffix match (not `extname`) so it agrees with the detectors' `hasExtension`
 * even for a bare dotfile literally named e.g. `.gpg` (where `extname` returns "").
 */
export declare function isKeystorePath(rel: string): boolean;
/** True if the path looks like generated / bundled output (by name). */
export declare function isGeneratedPath(rel: string): boolean;
/**
 * Heuristic content check for machine-minified / generated files with no
 * telltale extension: a very long average line length, or any single line over
 * ~50 KB, in the first ~64 KB sampled. Used at read time, not in the walker.
 */
export declare function looksMinified(content: string): boolean;
/** A scannable file plus the byte size the walker already stat'd for it. */
export interface WalkedFile {
    /** Relative POSIX path from the walk root. */
    rel: string;
    /** File size in bytes (from the walker's own stat; never re-stat downstream). */
    size: number;
}
/**
 * Recursively yield scannable file paths (relative to `root`, POSIX) under a
 * directory. If `root` points at a single file, yields just that file's
 * basename (subject to the size / binary filters). Thin wrapper over
 * {@link walkFilesSized} that drops the size (the historical string-yielding API).
 */
export declare function walkFiles(root: string, options?: WalkOptions): AsyncGenerator<string>;
/**
 * Like {@link walkFiles} but yields each file WITH the byte size the walker
 * already obtained while applying the size limit. Callers that need sizes (the
 * parallel scanner's byte-balanced chunking) consume this directly so they do
 * not stat every file a second time (P2 double-stat elimination).
 */
export declare function walkFilesSized(root: string, options?: WalkOptions): AsyncGenerator<WalkedFile>;
/**
 * Manifests bypass the normal file-size cap (they carry the whole dependency
 * tree and must not be dropped), but still get a generous hard ceiling so a
 * pathological or hostile lockfile can't be read unbounded and OOM the scan.
 * 16 MiB comfortably covers real monorepo lockfiles (npm's own is well under 5).
 */
export declare const MANIFEST_MAX_BYTES: number;
/**
 * True if a file passes the size limit. Dependency manifests (package.json /
 * package-lock.json / yarn.lock / …) get the larger {@link MANIFEST_MAX_BYTES}
 * ceiling instead of the ordinary cap, so large lockfiles still get scanned for
 * vulnerable dependencies without letting an enormous one exhaust memory.
 * Exported for unit testing.
 */
export declare function passesSizeLimit(rel: string, size: number, maxFileSize: number): boolean;
export {};
//# sourceMappingURL=walk.d.ts.map