/**
 * Ownership attestation — the first-class authorization gate for active probing.
 *
 * qProbe MUST NOT connect to an endpoint until the operator has attested they are
 * authorized to test it. Attestation comes from exactly one of:
 *   - `--i-own-this`            : an explicit per-run attestation for the target(s).
 *   - `--owned-hosts <file>`    : an ownership manifest (one host per line, `#`
 *                                 comments allowed); every target host must appear.
 *
 * With neither, {@link authorizeTargets} throws and NOTHING connects. This is a
 * code-enforced control, not a prompt: see THREAT-MODEL.md §Authorization.
 */
import type { Target } from "./target.js";
export declare class AttestationError extends Error {
    constructor(message: string);
}
export interface AttestationInput {
    /** `--i-own-this` was passed. */
    iOwnThis: boolean;
    /** Parsed contents of an ownership manifest, if `--owned-hosts` was given. */
    ownedHosts?: readonly string[];
}
/** Parse an ownership manifest file's text into a host allow-list. */
export declare function parseOwnedHosts(text: string): string[];
/**
 * Authorize a set of targets or throw {@link AttestationError}. Returns silently
 * when every target is covered by the attestation. No network I/O happens here or
 * anywhere upstream of a successful return.
 */
export declare function authorizeTargets(targets: readonly Target[], attest: AttestationInput): void;
//# sourceMappingURL=attest.d.ts.map