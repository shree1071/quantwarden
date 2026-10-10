/**
 * Post-quantum remediation guidance for each classical asymmetric algorithm
 * family. The recommendations follow NIST's finalized PQC algorithms — ML-KEM
 * (FIPS 203), ML-DSA (FIPS 204), SLH-DSA (FIPS 205) — and the IETF hybrid
 * key-exchange groups (X25519MLKEM768, SecP384r1MLKEM1024). Forward-looking
 * standards to track are captured in {@link PQC_TRANSITION_NOTE}.
 */
import type { AlgorithmFamily, Remediation } from "./types.js";
import type { StandardsProfile } from "./standards-profiles.js";
/** Look up the recommended post-quantum remediation for a classical algorithm. */
export declare function remediationFor(algorithm: AlgorithmFamily): Remediation | undefined;
/** Convenience: just the short recommendation string for a family (always defined). */
export declare function remediationText(algorithm: AlgorithmFamily): string;
/**
 * True when a family's PQC replacement is a KEM — i.e. it's used for
 * confidentiality / key-agreement (and is therefore harvest-now-decrypt-later
 * exposed). RSA is in both this set and {@link isSignatureFamily}. Single
 * source of truth for the family→target taxonomy used by tier guidance and the
 * multi-family remediation composer.
 */
export declare function isConfidentialityFamily(algorithm: AlgorithmFamily): boolean;
/** True when a family's PQC replacement is a signature scheme (ML-DSA / SLH-DSA). */
export declare function isSignatureFamily(algorithm: AlgorithmFamily): boolean;
/**
 * Security tier for remediation guidance.
 *  - `"category-3"` (default): commercial use — ML-KEM-768 / ML-DSA-65.
 *  - `"category-5"`: CNSA 2.0 national-security-systems / long-lived secrets —
 *    ML-KEM-1024 / ML-DSA-87.
 */
export type SecurityTier = "category-3" | "category-5";
/** Per-tier KEM / signature parameter sets. */
export declare const TIER_PARAMS: Record<SecurityTier, {
    kem: string;
    signature: string;
    note: string;
}>;
/**
 * Tier-aware remediation. Returns the base family remediation plus the
 * parameter sets for the requested CNSA tier. Category 5 surfaces the
 * ML-KEM-1024 / ML-DSA-87 sets mandated by CNSA 2.0; category 3 is the
 * commercial default.
 */
export declare function remediationForTier(algorithm: AlgorithmFamily, tier?: SecurityTier): Remediation;
/**
 * Regime-aware remediation. Composes the base family guidance with a
 * {@link StandardsProfile}'s parameter sets, HYBRID STANCE, and deprecation
 * deadlines, so an ANSSI/BSI audience is told hybrid is *required* while a CNSA 2.0
 * audience is told it is *optional* (and pointed at the 1024-level hybrid). This is
 * the profile-driven successor to {@link remediationForTier}; `--tier category-5`
 * resolves to the `cnsa-2.0` profile.
 */
export declare function remediationForProfile(algorithm: AlgorithmFamily, profile: StandardsProfile): Remediation;
/**
 * Guidance for stateful hash-based signatures (SP 800-208: LMS / XMSS / HSS).
 * These are NIST-approved for firmware / boot signing but are STATEFUL — each
 * private key may sign a bounded number of messages and the state MUST be
 * managed to avoid catastrophic key reuse. Surfaced where a long-lived,
 * low-volume signing root is appropriate.
 */
export declare const STATEFUL_HBS_NOTE: string;
/**
 * Forward-looking PQC standards worth tracking beyond the current FIPS 203/204/205
 * targets. Surfaced for operators planning multi-year migrations.
 */
export declare const PQC_TRANSITION_NOTE: string;
/** True when stateful HBS (SP 800-208) is a reasonable alternative for a family. */
export declare function statefulHbsApplies(algorithm: AlgorithmFamily): boolean;
//# sourceMappingURL=remediation.d.ts.map