import type { ScanResult } from "./types.js";
import type { CryptoPolicy, PolicyMapping } from "./policy.js";
import type { MandateEvaluation } from "./mandates.js";
/** Stable per-finding record for the evidence body (deterministic per commit). */
export interface EvidenceFinding {
    ruleId: string;
    algorithm?: string;
    severity: string;
    hndl: boolean;
    file: string;
    line: number;
}
export interface ReadinessReport {
    reportType: "quantakrypto-readiness";
    specVersion: 1;
    subject: {
        repository: string | null;
        commit: string | null;
        scannedRoot: string;
        scanTimeUtc: string;
    };
    tool: {
        name: "qScan";
        version: string;
    };
    inventory: ScanResult["inventory"];
    findings: EvidenceFinding[];
    /** §4 policy verdicts, present only when a crypto policy was supplied. */
    policyMapping?: PolicyMapping;
    /**
     * Compliance-mandate verdicts (`--mandate`), present only when mandates were
     * evaluated. DATE-PINNED for reproducibility: its `now` is stored as a plain
     * `YYYY-MM-DD` (not the volatile scan timestamp) so the same scan of the same
     * commit ON THE SAME DAY yields the same attestation hash, while a genuinely
     * different compliance date (a passed deadline) correctly changes it.
     */
    mandateMapping?: MandateEvaluation;
    cbom: unknown;
    attestation: {
        /** sha256 over the canonicalized deterministic body (excludes scanTimeUtc). */
        contentHash: string;
        /**
         * RFC-3161 / transparency-log token over `contentHash`, produced by an EXTERNAL
         * timestamper (opaque string, e.g. base64). `null` until {@link signReadinessReport}
         * runs one.
         */
        timestamp: string | null;
        /**
         * Detached signature over `contentHash`, produced by an EXTERNAL signer (opaque
         * string, e.g. base64/PEM). `null` until {@link signReadinessReport} runs one.
         */
        signature: string | null;
        /** Non-sensitive provenance label of the signer (e.g. "openssl", "cosign"). */
        signedWith?: string;
        /** Non-sensitive provenance label of the timestamper (e.g. "openssl-ts"). */
        timestampedWith?: string;
    };
}
export interface ReadinessReportOptions {
    /** Repository URL (e.g. from `GITHUB_REPOSITORY`); omitted → null. */
    repository?: string;
    /** Full commit SHA (e.g. from `GITHUB_SHA`); omitted → null. */
    commit?: string;
    /** Optional org cryptography policy — adds the §4 `policyMapping` verdicts. */
    policy?: CryptoPolicy;
    /**
     * Optional compliance-mandate evaluation ({@link evaluateMandates}) — adds the
     * `mandateMapping` block. Date-pinned into the hashed body (see
     * {@link ReadinessReport.mandateMapping}).
     */
    mandate?: MandateEvaluation;
}
/**
 * Build the A.8.24 readiness report for a scan result. The attestation's
 * `contentHash` covers everything EXCEPT the scan timestamp and the attestation
 * block itself, so re-running the same scan on the same commit is verifiable.
 */
export declare function buildReadinessReport(result: ScanResult, opts?: ReadinessReportOptions): ReadinessReport;
/** The result of {@link verifyReadinessReport}. */
export interface VerifyReadinessResult {
    /** True iff the recomputed body hash equals the hash claimed in the attestation. */
    valid: boolean;
    /** The hash recomputed over the report's CURRENT body. */
    computedHash: string;
    /** The hash claimed in the report's attestation (`attestation.contentHash`). */
    claimedHash: string;
    /** A short human reason; present only when `valid` is false. */
    reason?: string;
}
/**
 * Recompute the deterministic content hash over a readiness report's body and
 * compare it to the hash the attestation claims. Detects tampering with ANY
 * hashed field — a finding, the inventory, a policy verdict, or subject/tool
 * metadata: editing it after the fact changes the recomputed hash, so `valid`
 * becomes false.
 *
 * By construction the scan timestamp, the CBOM envelope, and the attestation
 * block itself are EXCLUDED from the hash (see {@link buildReadinessReport}), so
 * touching those does not fail verification — their integrity follows from their
 * hashed inputs. The body is reconstructed from the report's OWN stored fields
 * (including `tool.version`), so a report built by an older qScan still verifies.
 *
 * This checks the INTEGRITY hash only. It does NOT validate the detached
 * signature or RFC-3161 timestamp: those are opaque tokens from an external
 * signer (ADR-0004) and are verified with that signer's own tooling.
 */
export declare function verifyReadinessReport(report: ReadinessReport): VerifyReadinessResult;
/**
 * An EXTERNAL signer/timestamper the tool orchestrates. Per ADR-0004 the tool
 * implements no cryptography: it hands the payload to an operator-provided signer
 * (an `openssl`/`cosign` invocation, an RFC-3161 TSA client, …) and records what
 * comes back. `label` is a short, non-sensitive provenance string (e.g. the signer
 * program name) — NOT the full command, which may contain a key path.
 */
export interface EvidenceSigner {
    label: string;
    /**
     * Produce a detached signature / timestamp token (opaque string) over `payload`.
     * May be async so a future signer can shell out OR call a KMS / RFC-3161 TSA over
     * the network without foreclosing that once this contract freezes at 1.0.
     */
    sign(payload: string): string | Promise<string>;
}
/** Options for {@link signReadinessReport}: a detached-signature and/or a timestamp signer. */
export interface SignEvidenceOptions {
    signer?: EvidenceSigner;
    timestamper?: EvidenceSigner;
}
/**
 * Fill a readiness report's attestation with a detached signature and/or RFC-3161
 * timestamp, produced by EXTERNAL signers over the report's `contentHash`. Pure
 * orchestration: it invokes the injected signers and records their opaque output
 * plus a provenance label — it performs no cryptography itself (ADR-0004). Returns a
 * NEW report; the hashed body is untouched (attestation is excluded from the hash),
 * so signing never changes `contentHash`.
 */
export declare function signReadinessReport(report: ReadinessReport, opts: SignEvidenceOptions): Promise<ReadinessReport>;
//# sourceMappingURL=evidence.d.ts.map