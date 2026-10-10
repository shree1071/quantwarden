import type { ScanOptions, Severity } from "./types.js";
/** Canonical config file name discovered at a scan root. */
export declare const CONFIG_FILENAME = "quantakrypto.config.json";
/**
 * The slice of options a `quantakrypto.config.json` can set. A subset of
 * {@link ScanOptions} (the file-selection + scope keys) extended with the two
 * policy keys qScan owns: `severityThreshold` and `baseline`.
 *
 * `root`, `files`, `detectors` (the programmatic detector array), and `onFile`
 * are intentionally NOT configurable from a file — they are call-site concerns.
 */
export interface QuantakryptoFileConfig extends Partial<Pick<ScanOptions, "include" | "exclude" | "noDefaultIgnores" | "maxFileSize" | "scanMinified" | "source" | "dependencies" | "config" | "disabledRules">> {
    /** Gate severity (drives the exit code). Maps to qScan's `severityThreshold`. */
    severityThreshold?: Severity;
    /** Path to a baseline file, relative to the config file's directory. */
    baseline?: string;
}
/** Result of {@link loadConfig}: the resolved config plus where it came from. */
export interface LoadConfigResult {
    /** Validated, mapped config. Empty object when no file was found. */
    config: QuantakryptoFileConfig;
    /** Absolute path of the file that was loaded, when one was. */
    path?: string;
    /**
     * Non-fatal warnings (unknown keys, unknown future `version`). The caller may
     * surface these; they never abort the load.
     */
    warnings: string[];
}
/** Thrown when a known key has a malformed *value* (a usage error: exit 2). */
export declare class ConfigError extends Error {
    readonly name = "ConfigError";
    /** The config file path the error relates to, when known. */
    readonly path: string | undefined;
    constructor(message: string, configPath?: string);
}
/**
 * Load a `quantakrypto.config.json` for a scan.
 *
 * By default reads `<root>/quantakrypto.config.json`. Pass an explicit file path as
 * `root` (or via the caller's `--config` flag) to read a named file instead —
 * if the path's basename is `quantakrypto.config.json` it is read directly; otherwise
 * the path is treated as a directory and the file is looked up inside it. When
 * an explicit path is given but missing, that is an error; an *absent*
 * auto-discovered file is tolerated (returns an empty config).
 *
 * @param root Directory to look in, OR an explicit config file path.
 * @param opts.explicit When true, a missing file is an error (the user named it).
 * @throws {ConfigError} On malformed JSON, a bad value for a known key, or a
 *   missing explicitly-named file.
 */
export declare function loadConfig(root: string, opts?: {
    explicit?: boolean;
}): Promise<LoadConfigResult>;
//# sourceMappingURL=config.d.ts.map