/**
 * Machine-readable cryptography policy → per-finding verdicts for the ISO/IEC
 * 27001 A.8.24 evidence report (docs/compliance/iso27001-a8.24-evidence.md §4).
 *
 * An organization supplies a policy listing which classical algorithm families it
 * prohibits, permits, or is actively transitioning off. `buildPolicyMapping` then
 * flags each qScan finding as `conformant` / `violation` / `transition-pending`
 * against that policy — turning the neutral inventory into audit-ready evidence
 * that the org *assesses* its cryptography against a defined policy.
 *
 * Honesty boundary: without a policy the report stays neutral inventory and the
 * ORG owns the conformance judgment (COMPLIANCE.md §3). The policy is a permit-
 * list: a classical family not named anywhere defaults to a violation (unmanaged
 * crypto is a policy gap), overridable via `defaultVerdict`.
 */
import type { AlgorithmFamily, Finding } from "./types.js";
/** The three verdicts a finding can carry against a policy. */
export type PolicyVerdict = "conformant" | "violation" | "transition-pending";
/** An organization-supplied cryptography policy (from a JSON file). */
export interface CryptoPolicy {
    /** Human name / version of the policy, recorded in the evidence report. */
    name?: string;
    /** Families the org explicitly accepts (e.g. short-lived signatures) → conformant. */
    permitted?: AlgorithmFamily[];
    /** Families the org prohibits outright → violation. */
    prohibited?: AlgorithmFamily[];
    /** Families being actively migrated, allowed within the window → transition-pending. */
    inTransition?: AlgorithmFamily[];
    /** Optional migration deadline (ISO date / year), recorded for context. */
    transitionDeadline?: string;
    /** Verdict for a family named in none of the lists. Default: `"violation"`. */
    defaultVerdict?: PolicyVerdict;
}
/** One finding's verdict against the policy. */
export interface PolicyFindingVerdict {
    ruleId: string;
    algorithm: AlgorithmFamily | "unknown";
    file: string;
    line: number;
    verdict: PolicyVerdict;
    reason: string;
}
/** The `policyMapping` block added to the evidence report. */
export interface PolicyMapping {
    policyName: string | null;
    transitionDeadline: string | null;
    summary: Record<PolicyVerdict, number>;
    findings: PolicyFindingVerdict[];
}
/** Resolve one algorithm family's verdict + a human reason against a policy. */
export declare function verdictForAlgorithm(algorithm: AlgorithmFamily | undefined, policy: CryptoPolicy): {
    verdict: PolicyVerdict;
    reason: string;
};
/**
 * Map every finding to a policy verdict, with per-verdict counts. Deterministic:
 * the same findings + policy always yield the same mapping (safe to hash in the
 * A.8.24 evidence attestation).
 */
export declare function buildPolicyMapping(findings: readonly Finding[], policy: CryptoPolicy): PolicyMapping;
/**
 * Validate + normalize a parsed policy object (from an operator's JSON file).
 * Throws a `TypeError` with a clear message on anything malformed — a bad policy
 * file must fail loudly, never silently degrade the evidence verdict.
 */
export declare function parseCryptoPolicy(raw: unknown): CryptoPolicy;
//# sourceMappingURL=policy.d.ts.map