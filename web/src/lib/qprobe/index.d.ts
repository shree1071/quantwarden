/**
 * @quantakrypto/qprobe — active post-quantum readiness probing of live TLS/SSH
 * endpoints you OWN. The programmatic API. See THREAT-MODEL.md for the
 * authorization model; {@link runProbe} refuses to touch the network until
 * {@link authorizeTargets} passes.
 *
 * Findings are `@quantakrypto/core` Findings, so they compose with qScan output
 * and score through the same `buildInventory`.
 */
import type { CryptoInventory, Finding } from "@quantakrypto/core";
import type { Target } from "./target.js";
import { type AttestationInput } from "./attest.js";
import { type TlsNegotiated, type HybridSupport } from "./tls.js";
import { type SshProbeResult } from "./ssh.js";
export type { Target } from "./target.js";
export { parseTarget, TargetError } from "./target.js";
export { authorizeTargets, parseOwnedHosts, AttestationError, type AttestationInput, } from "./attest.js";
export type { TlsNegotiated, HybridSupport } from "./tls.js";
export type { SshProbeResult, KexInit } from "./ssh.js";
export { PQ_SSH_KEX } from "./ssh.js";
export * from "./clienthello.js";
export { certSignatureAlgorithm, decodeOid, oidToSignatureFamily } from "./x509.js";
export { smtpAdvertisesStartTls, smtpReplyComplete } from "./smtp.js";
export { classifyTls, classifySsh } from "./classify.js";
export { toScanResult, toSarifReport, toCbomReport, toJsonReport } from "./report.js";
export type ProbeMode = "tls" | "ssh" | "smtp" | "imap" | "pop3" | "postgres";
/** Re-export the pure STARTTLS/SSLRequest builders for testing (not the probes). */
export { IMAP_DIALOG, POP3_DIALOG } from "./starttls.js";
export { sslRequestFrame } from "./postgres.js";
export interface EndpointReport {
    target: Target;
    mode: ProbeMode;
    tls?: TlsNegotiated;
    hybrid?: HybridSupport;
    ssh?: SshProbeResult;
    /** Human-readable positive signals (good news), e.g. hybrid TLS selected. */
    positives: string[];
    findings: Finding[];
}
/**
 * Choose a probe mode for "auto" from the well-known port: SSH on 22, SMTP
 * STARTTLS on 25/587, IMAP on 143, POP3 on 110, PostgreSQL on 5432, TLS otherwise
 * (which covers direct-TLS services like HTTPS 443, IMAPS 993, and DoT 853).
 */
export declare function resolveMode(target: Target, mode: ProbeMode | "auto"): ProbeMode;
export interface RunOptions {
    targets: Target[];
    mode: ProbeMode | "auto";
    attest: AttestationInput;
    servername?: string;
    timeoutMs?: number;
    /** Minimum spacing between endpoint connections (politeness / rate-limit). */
    minIntervalMs?: number;
}
export interface RunResult {
    reports: EndpointReport[];
    findings: Finding[];
    inventory: CryptoInventory;
}
/**
 * Authorize (throws {@link AttestationError} / {@link TargetError} on failure — no
 * network I/O happens before a successful authorization) then probe every target
 * sequentially with a minimum interval between connections.
 */
export declare function runProbe(opts: RunOptions): Promise<RunResult>;
//# sourceMappingURL=index.d.ts.map