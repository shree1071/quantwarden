/**
 * Target parsing + validation. qProbe opens real network connections, so the
 * FIRST job is to refuse anything that looks like a scan of infrastructure the
 * operator has not named one host at a time: CIDR blocks, IP ranges, wildcards,
 * and comma-separated lists are rejected outright (see THREAT-MODEL.md). A target
 * is exactly one `host` or `host:port`.
 */
/** A single validated endpoint. */
export interface Target {
    host: string;
    port: number;
}
export declare class TargetError extends Error {
    constructor(message: string);
}
/**
 * Parse and validate a single target. Throws {@link TargetError} for anything
 * that is not a single host / host:port — the refusal is a security control, not
 * a convenience check.
 *
 * @param input   e.g. "example.com", "example.com:8443", "10.0.0.5:22"
 * @param defaultPort port to use when the input carries none
 */
export declare function parseTarget(input: string, defaultPort: number): Target;
//# sourceMappingURL=target.d.ts.map